import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CustomerInvoice {
  id: string;
  company_id: string;
  invoice_number: string;
  order_id: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  total_with_tax: number;
  is_paid: boolean;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentReminder {
  id: string;
  company_id: string;
  invoice_id: string;
  reminder_number: number;
  reminder_date: string;
  reminder_type: string;
  sent_by?: string;
  sent_at?: string;
  notes?: string;
  created_at: string;
}

export const useCustomerInvoices = () => {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['customer_invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_invoices')
        .select(`
          *,
          orders:order_id (
            order_number,
            client_id
          )
        `)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['payment_reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_reminders')
        .select(`
          *,
          customer_invoices:invoice_id (
            invoice_number,
            total_with_tax
          )
        `)
        .order('reminder_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<CustomerInvoice, 'id' | 'created_at' | 'updated_at' | 'invoice_number' | 'company_id' | 'is_paid'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      const { data: existingInvoices } = await supabase
        .from('customer_invoices')
        .select('invoice_number')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(1);

      const count = existingInvoices?.length || 0;
      const invoiceNumber = `FACT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const { data, error } = await supabase
        .from('customer_invoices')
        .insert({
          ...invoice,
          invoice_number: invoiceNumber,
          company_id: profile.company_id,
          is_paid: false,
          created_by: user.id,
          updated_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_invoices'] });
      toast({
        title: 'Facture créée',
        description: 'La facture client a été créée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createReminder = useMutation({
    mutationFn: async (reminder: Omit<PaymentReminder, 'id' | 'created_at' | 'company_id' | 'reminder_number'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      const { data: existingReminders } = await supabase
        .from('payment_reminders')
        .select('reminder_number')
        .eq('invoice_id', reminder.invoice_id)
        .order('reminder_number', { ascending: false })
        .limit(1);

      const reminderNumber = (existingReminders?.[0]?.reminder_number || 0) + 1;

      const { data, error } = await supabase
        .from('payment_reminders')
        .insert({
          ...reminder,
          company_id: profile.company_id,
          reminder_number: reminderNumber,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_reminders'] });
      toast({
        title: 'Relance créée',
        description: 'La relance de paiement a été créée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('customer_invoices')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          paid_by: user.id,
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_invoices'] });
      toast({
        title: 'Facture payée',
        description: 'La facture a été marquée comme payée.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    invoices,
    reminders,
    isLoading,
    createInvoice: createInvoice.mutate,
    createReminder: createReminder.mutate,
    markAsPaid: markAsPaid.mutate,
    isCreatingInvoice: createInvoice.isPending,
    isCreatingReminder: createReminder.isPending,
    isMarkingPaid: markAsPaid.isPending,
  };
};