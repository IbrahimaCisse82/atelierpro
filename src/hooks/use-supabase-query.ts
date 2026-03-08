import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoMode, useDemoData } from '@/contexts/DemoContext';
import { toast } from '@/hooks/use-toast';

interface UseSupabaseQueryOptions<T> {
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
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

export function useSupabaseQuery<T = any>(
  table: string,
  options: UseSupabaseQueryOptions<T> = {}
): UseSupabaseQueryResult<T> {
  const {
    select = '*',
    filters = {},
    orderBy,
    limit = 50,
    offset = 0,
    enabled = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, userProfile } = useAuth();

  // Mode démo : retourner des données en mémoire
  const demoData = useDemoData<T>(table);
  const isDemo = user ? isDemoMode(user.id) : false;

  const fetchData = useCallback(async () => {
    if (!enabled || !user || !userProfile) {
      setData(null);
      return;
    }

    // Mode démo : pas de requête Supabase
    if (isDemo) {
      setData(demoData);
      onSuccess?.(demoData || []);
      return;
    }

    setLoading(true);
    setError(null);

    // Tables sans colonne deleted_at
    const tablesWithoutDeletedAt = [
      'alerts', 'companies', 'profiles', 'user_roles', 'depreciations',
      'production_tracking', 'treasury_accounts', 'treasury_movements',
      'work_hours', 'payment_reminders', 'syscohada_accounts', 'accounting_journals',
      'journal_entries', 'journal_entry_lines', 'bank_reconciliations', 'bank_statements'
    ];

    try {
      let query = supabase
        .from(table as any)
        .select(select)
        .eq('company_id', userProfile.companyId);

      if (!tablesWithoutDeletedAt.includes(table)) {
        query = query.is('deleted_at', null);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      if (limit) {
        query = query.limit(limit);
      }
      if (offset > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setData(result as T[]);
      onSuccess?.(result as T[]);
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
  }, [table, select, JSON.stringify(filters), orderBy?.column, orderBy?.ascending, limit, offset, enabled, user, userProfile, isDemo]);

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
  const isDemo = user ? isDemoMode(user.id) : false;

  const create = useCallback(async (data: Partial<T>) => {
    if (!user || !userProfile) {
      throw new Error('Utilisateur non authentifié');
    }

    if (isDemo) {
      toast({ title: "Mode démo", description: "Les modifications ne sont pas sauvegardées en mode démo.", variant: "default" });
      return { ...data, id: `demo-${Date.now()}` };
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .insert({
          ...data,
          company_id: userProfile.companyId,
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
  }, [table, user, userProfile, isDemo]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    if (!user || !userProfile) {
      throw new Error('Utilisateur non authentifié');
    }

    if (isDemo) {
      toast({ title: "Mode démo", description: "Les modifications ne sont pas sauvegardées en mode démo.", variant: "default" });
      return { ...data, id };
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .update({
          ...data,
          updated_by: userProfile.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('company_id', userProfile.companyId)
        .select()
        .single();

      if (error) throw error;
      return result;
    } finally {
      setLoading(false);
    }
  }, [table, user, userProfile, isDemo]);

  const remove = useCallback(async (id: string) => {
    if (!user || !userProfile) {
      throw new Error('Utilisateur non authentifié');
    }

    if (isDemo) {
      toast({ title: "Mode démo", description: "Les modifications ne sont pas sauvegardées en mode démo.", variant: "default" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id)
        .eq('company_id', userProfile.companyId);

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [table, user, userProfile, isDemo]);

  return {
    create,
    update,
    remove,
    loading,
    mutate: create,
    isLoading: loading
  };
}
