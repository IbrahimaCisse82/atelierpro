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

      // Le numéro officiel est attribué par la base à la validation (sans trou).
      const { data, error } = await supabase
        .from('customer_invoices')
        .insert({
          ...invoice,
          company_id: profile.company_id,
          status: 'draft',
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

  const onErr = (error: Error) => toast({ title: 'Erreur', description: error.message, variant: 'destructive' });

  const markAsPaid = useMutation({
    mutationFn: async (args: string | { id: string; paymentMethod?: string }) => {
      const { id, paymentMethod } = typeof args === 'string' ? { id: args, paymentMethod: 'cash' } : args;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');
      const { data, error } = await supabase
        .from('customer_invoices')
        .update({
          is_paid: true,
          payment_method: paymentMethod || 'cash',
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
      toast({ title: 'Facture encaissée', description: 'Les écritures comptables ont été créées.' });
    },
    onError: onErr,
  });

  const validateInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('customer_invoices')
        .update({ status: 'validated' } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['customer_invoices'] });
      toast({ title: 'Facture validée', description: `Numéro attribué : ${data?.invoice_number}` });
    },
    onError: onErr,
  });

  const createCreditNote = useMutation({
    mutationFn: async (args: { invoiceId: string; companyId: string; reason: string; amount: number; taxAmount?: number }) => {
      const tax = args.taxAmount || 0;
      const { data, error } = await supabase
        .from('credit_notes')
        .insert({
          invoice_id: args.invoiceId,
          company_id: args.companyId,
          reason: args.reason,
          total_amount: args.amount,
          tax_amount: tax,
          total_with_tax: args.amount + tax,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['customer_invoices'] });
      toast({ title: 'Avoir créé', description: `Avoir ${data?.credit_note_number}` });
    },
    onError: onErr,
  });

  return {
    invoices,
    reminders,
    isLoading,
    createInvoice: createInvoice.mutate,
    createReminder: createReminder.mutate,
    markAsPaid: markAsPaid.mutate,
    validateInvoice: validateInvoice.mutate,
    createCreditNote: createCreditNote.mutate,
    isCreatingInvoice: createInvoice.isPending,
    isCreatingReminder: createReminder.isPending,
    isMarkingPaid: markAsPaid.isPending,
  };
};