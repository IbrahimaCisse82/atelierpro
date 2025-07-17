import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseSupabaseQueryOptions<T> {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: Error) => void;
}

interface UseSupabaseQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (data: T[]) => void;
}

export function useSupabaseQuery<T = any>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  enabled = true,
  onSuccess,
  onError
}: UseSupabaseQueryOptions<T>): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, userProfile } = useAuth();

  const fetchData = useCallback(async () => {
    if (!enabled || !user || !userProfile) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from(table)
        .select(select)
        .eq('company_id', userProfile.company_id);

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Appliquer l'ordre
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Appliquer la limite
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      onError?.(error);
      
      toast({
        title: "Erreur de chargement",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [table, select, filters, orderBy, limit, enabled, user, userProfile, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T[]) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  };
}

// Hook pour les opérations CRUD
export function useSupabaseMutation<T = any>(table: string) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: Partial<T>) => {
    if (!user || !userProfile) {
      throw new Error('Utilisateur non authentifié');
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert({
          ...data,
          company_id: userProfile.company_id,
          created_by: userProfile.id,
          updated_by: userProfile.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } finally {
      setLoading(false);
    }
  }, [table, user, userProfile]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    if (!user || !userProfile) {
      throw new Error('Utilisateur non authentifié');
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update({
          ...data,
          updated_by: userProfile.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('company_id', userProfile.company_id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } finally {
      setLoading(false);
    }
  }, [table, user, userProfile]);

  const remove = useCallback(async (id: string) => {
    if (!user || !userProfile) {
      throw new Error('Utilisateur non authentifié');
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('company_id', userProfile.company_id);

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [table, user, userProfile]);

  return {
    create,
    update,
    remove,
    loading
  };
} 