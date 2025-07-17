import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type Supplier = Tables<'suppliers'>;
type SupplierInsert = Tables<'suppliers'>['Insert'];
type SupplierUpdate = Tables<'suppliers'>['Update'];

export function useSuppliers() {
  const {
    data: suppliers,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Supplier>({
    table: 'suppliers',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<Supplier>('suppliers');

  const addSupplier = useCallback(async (supplierData: Omit<SupplierInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      await create(supplierData);
      toast({
        title: "Fournisseur ajouté",
        description: "Le fournisseur a été ajouté avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fournisseur.",
        variant: "destructive"
      });
      throw error;
    }
  }, [create, refetch]);

  const updateSupplier = useCallback(async (id: string, supplierData: Partial<SupplierUpdate>) => {
    try {
      await update(id, supplierData);
      toast({
        title: "Fournisseur modifié",
        description: "Le fournisseur a été modifié avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le fournisseur.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      await remove(id);
      toast({
        title: "Fournisseur supprimé",
        description: "Le fournisseur a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur.",
        variant: "destructive"
      });
      throw error;
    }
  }, [remove, refetch]);

  const getSupplierById = useCallback((id: string) => {
    return suppliers?.find(supplier => supplier.id === id);
  }, [suppliers]);

  const getActiveSuppliers = useCallback(() => {
    return suppliers?.filter(supplier => supplier.is_active) || [];
  }, [suppliers]);

  const searchSuppliers = useCallback((searchTerm: string) => {
    if (!suppliers) return [];
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(term) ||
      supplier.contact_person?.toLowerCase().includes(term) ||
      supplier.email?.toLowerCase().includes(term) ||
      supplier.phone?.includes(term)
    );
  }, [suppliers]);

  return {
    suppliers: suppliers || [],
    loading: loading || mutationLoading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getActiveSuppliers,
    searchSuppliers,
    refetch
  };
} 