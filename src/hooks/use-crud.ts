// Hook CRUD générique pour réduire la duplication de code
import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface UseCRUDOptions {
  table: string;
  orderBy?: { column: string; ascending?: boolean };
  select?: string;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  onCreateSuccess?: (data: any) => void;
  onUpdateSuccess?: (data: any) => void;
  onDeleteSuccess?: () => void;
}

export function useCRUD<T>(options: UseCRUDOptions) {
  const { 
    table, 
    orderBy = { column: 'created_at', ascending: false },
    select = '*',
    pagination = { page: 1, pageSize: 50 },
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query avec pagination automatique
  const {
    data: items,
    loading,
    error,
    refetch
  } = useSupabaseQuery<T>(table, {
    select,
    orderBy,
    limit: pagination.pageSize
  });

  // Mutations
  const { create, update, remove } = useSupabaseMutation<T>(table);

  // Créer avec feedback
  const createItem = useCallback(async (data: Partial<T>) => {
    try {
      const result = await create(data);
      toast({
        title: "✅ Créé avec succès",
        description: "L'élément a été créé.",
      });
      await refetch();
      onCreateSuccess?.(result);
      return result;
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de créer l'élément",
        variant: "destructive",
      });
      throw error;
    }
  }, [create, toast, refetch, onCreateSuccess]);

  // Mettre à jour avec feedback
  const updateItem = useCallback(async (id: string, data: Partial<T>) => {
    try {
      const result = await update(id, data);
      toast({
        title: "✅ Modifié avec succès",
        description: "L'élément a été modifié.",
      });
      await refetch();
      onUpdateSuccess?.(result);
      return result;
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de modifier l'élément",
        variant: "destructive",
      });
      throw error;
    }
  }, [update, toast, refetch, onUpdateSuccess]);

  // Supprimer avec feedback (soft delete si deleted_at existe)
  const deleteItem = useCallback(async (id: string, soft = true) => {
    try {
      if (soft) {
        // Essayer soft delete d'abord
        try {
          await update(id, { deleted_at: new Date().toISOString() } as any);
        } catch {
          // Si deleted_at n'existe pas, faire hard delete
          await remove(id);
        }
      } else {
        await remove(id);
      }
      
      toast({
        title: "✅ Supprimé avec succès",
        description: "L'élément a été supprimé.",
      });
      await refetch();
      onDeleteSuccess?.();
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de supprimer l'élément",
        variant: "destructive",
      });
      throw error;
    }
  }, [update, remove, toast, refetch, onDeleteSuccess]);

  // Restaurer un élément soft-deleted
  const restoreItem = useCallback(async (id: string) => {
    try {
      await update(id, { deleted_at: null } as any);
      toast({
        title: "✅ Restauré avec succès",
        description: "L'élément a été restauré.",
      });
      await refetch();
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de restaurer l'élément",
        variant: "destructive",
      });
      throw error;
    }
  }, [update, toast, refetch]);

  return {
    items: items || [],
    loading,
    error,
    refetch,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    restore: restoreItem,
  };
}
