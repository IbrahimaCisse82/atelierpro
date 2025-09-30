import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  company_id: string;
  supplier_number: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  payment_terms: number;
  credit_limit: number;
  category?: string;
  rating?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSuppliers = () => {
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createSupplier = useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'supplier_number' | 'company_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      // Générer le numéro de fournisseur manuellement
      const { data: existingSuppliers } = await supabase
        .from('suppliers')
        .select('supplier_number')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(1);

      const count = existingSuppliers?.length || 0;
      const supplierNumber = `FOUR-${String(count + 1).padStart(6, '0')}`;

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
          supplier_number: supplierNumber,
          company_id: profile.company_id,
          created_by: user.id,
          updated_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fournisseur créé',
        description: 'Le fournisseur a été créé avec succès.',
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

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('suppliers')
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
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fournisseur mis à jour',
        description: 'Le fournisseur a été mis à jour avec succès.',
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

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fournisseur supprimé',
        description: 'Le fournisseur a été supprimé avec succès.',
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
    suppliers,
    isLoading,
    createSupplier: createSupplier.mutate,
    updateSupplier: updateSupplier.mutate,
    deleteSupplier: deleteSupplier.mutate,
    isCreating: createSupplier.isPending,
    isUpdating: updateSupplier.isPending,
    isDeleting: deleteSupplier.isPending,
  };
};