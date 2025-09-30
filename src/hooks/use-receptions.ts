import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Reception {
  id: string;
  company_id: string;
  reception_number: string;
  purchase_order_id?: string;
  supplier_id: string;
  reception_date: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_with_tax: number;
  delivery_note_reference?: string;
  invoice_reference?: string;
  notes?: string;
  received_by: string;
  inspected_by?: string;
  inspected_at?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
  suppliers?: { id: string; name: string; supplier_number: string };
}

export interface ReceptionItem {
  id: string;
  reception_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  total_price: number;
  quality_check: boolean;
  notes?: string;
}

export const useReceptions = () => {
  const queryClient = useQueryClient();

  const { data: receptions = [], isLoading } = useQuery({
    queryKey: ['receptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receptions')
        .select(`
          *,
          suppliers:supplier_id (
            id,
            name,
            supplier_number
          )
        `)
        .order('reception_date', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createReception = useMutation({
    mutationFn: async (reception: Omit<Reception, 'id' | 'created_at' | 'updated_at' | 'reception_number' | 'company_id' | 'received_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      // Générer le numéro de réception manuellement
      const { data: existingReceptions } = await supabase
        .from('receptions')
        .select('reception_number')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(1);

      const count = existingReceptions?.length || 0;
      const receptionNumber = `REC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(count + 1).padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('receptions')
        .insert({
          ...reception,
          reception_number: receptionNumber,
          company_id: profile.company_id,
          received_by: user.id,
          created_by: user.id,
          updated_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast({
        title: 'Réception créée',
        description: 'La réception a été créée avec succès.',
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

  const updateReception = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reception> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('receptions')
        .update({
          ...updates,
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast({
        title: 'Réception mise à jour',
        description: 'La réception a été mise à jour avec succès.',
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

  const validateReception = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('receptions')
        .update({
          status: 'validated',
          validated_by: user.id,
          validated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      toast({
        title: 'Réception validée',
        description: 'La réception a été validée et le stock a été mis à jour.',
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
    receptions,
    isLoading,
    createReception: createReception.mutate,
    updateReception: updateReception.mutate,
    validateReception: validateReception.mutate,
    isCreating: createReception.isPending,
    isUpdating: updateReception.isPending,
    isValidating: validateReception.isPending,
  };
};