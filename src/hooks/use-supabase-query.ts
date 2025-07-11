import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PostgrestError } from '@supabase/supabase-js';

// Types pour les requêtes Supabase
export interface SupabaseQueryConfig<T> {
  queryKey: string[];
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export interface SupabaseMutationConfig<T, V> {
  mutationKey: string[];
  table: string;
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: PostgrestError, variables: V) => void;
  invalidateQueries?: string[][];
}

// Hook pour les requêtes Supabase avec React Query
export function useSupabaseQuery<T = any>(
  config: SupabaseQueryConfig<T>,
  options?: Omit<UseQueryOptions<T[], PostgrestError>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: config.queryKey,
    queryFn: async (): Promise<T[]> => {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      let query = supabase
        .from(config.table)
        .select(config.select || '*');

      // Ajouter les filtres
      if (config.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Ajouter le filtre company_id automatiquement
      if (config.table !== 'companies' && config.table !== 'profiles') {
        query = query.eq('company_id', user.companyId);
      }

      // Ajouter l'ordre
      if (config.orderBy) {
        query = query.order(config.orderBy.column, {
          ascending: config.orderBy.ascending ?? true
        });
      }

      // Ajouter la limite
      if (config.limit) {
        query = query.limit(config.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`[useSupabaseQuery] Erreur pour ${config.table}:`, error);
        throw error;
      }

      return data || [];
    },
    enabled: config.enabled !== false && !!user,
    staleTime: config.staleTime || 5 * 60 * 1000, // 5 minutes par défaut
    gcTime: config.gcTime || 10 * 60 * 1000, // 10 minutes par défaut
    retry: (failureCount, error) => {
      // Ne pas retry sur les erreurs 4xx (sauf 408, 429)
      if (error?.code && ['PGRST116', 'PGRST301', 'PGRST302'].includes(error.code)) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });
}

// Hook pour une requête unique (single)
export function useSupabaseQuerySingle<T = any>(
  config: Omit<SupabaseQueryConfig<T>, 'limit'>,
  options?: Omit<UseQueryOptions<T, PostgrestError>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: config.queryKey,
    queryFn: async (): Promise<T> => {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      let query = supabase
        .from(config.table)
        .select(config.select || '*')
        .single();

      // Ajouter les filtres
      if (config.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Ajouter le filtre company_id automatiquement
      if (config.table !== 'companies' && config.table !== 'profiles') {
        query = query.eq('company_id', user.companyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`[useSupabaseQuerySingle] Erreur pour ${config.table}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`Aucune donnée trouvée pour ${config.table}`);
      }

      return data;
    },
    enabled: config.enabled !== false && !!user,
    staleTime: config.staleTime || 5 * 60 * 1000,
    gcTime: config.gcTime || 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.code && ['PGRST116', 'PGRST301', 'PGRST302'].includes(error.code)) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });
}

// Hook pour les mutations Supabase avec React Query
export function useSupabaseMutation<T = any, V = any>(
  config: SupabaseMutationConfig<T, V>,
  options?: Omit<UseMutationOptions<T, PostgrestError, V>, 'mutationFn'>
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: V): Promise<T> => {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      let query = supabase.from(config.table);

      switch (config.operation) {
        case 'insert':
          const { data: insertData, error: insertError } = await query.insert(variables as any);
          if (insertError) throw insertError;
          return insertData?.[0] || variables as any;

        case 'update':
          const { data: updateData, error: updateError } = await query
            .update(variables as any)
            .eq('id', (variables as any).id)
            .eq('company_id', user.companyId)
            .select()
            .single();
          if (updateError) throw updateError;
          return updateData || variables as any;

        case 'delete':
          const { data: deleteData, error: deleteError } = await query
            .delete()
            .eq('id', (variables as any).id)
            .eq('company_id', user.companyId)
            .select()
            .single();
          if (deleteError) throw deleteError;
          return deleteData || variables as any;

        case 'upsert':
          const { data: upsertData, error: upsertError } = await query.upsert(variables as any);
          if (upsertError) throw upsertError;
          return upsertData?.[0] || variables as any;

        default:
          throw new Error(`Opération non supportée: ${config.operation}`);
      }
    },
    onSuccess: (data, variables) => {
      // Invalider les queries spécifiées
      if (config.invalidateQueries) {
        config.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Invalider toutes les queries de la table par défaut
      queryClient.invalidateQueries({ 
        queryKey: [config.table] 
      });

      config.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      console.error(`[useSupabaseMutation] Erreur pour ${config.table}:`, error);
      config.onError?.(error, variables);
    },
    retry: (failureCount, error) => {
      if (error?.code && ['PGRST116', 'PGRST301', 'PGRST302'].includes(error.code)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options
  });
}

// Hook pour les requêtes personnalisées
export function useSupabaseCustomQuery<T = any>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, PostgrestError>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled !== false && !!user,
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.gcTime || 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.code && ['PGRST116', 'PGRST301', 'PGRST302'].includes(error.code)) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });
}

// Hook pour les mutations personnalisées
export function useSupabaseCustomMutation<T = any, V = any>(
  mutationFn: (variables: V) => Promise<T>,
  options?: Omit<UseMutationOptions<T, PostgrestError, V>, 'mutationFn'>
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalider toutes les queries par défaut
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      console.error('[useSupabaseCustomMutation] Erreur:', error);
      options?.onError?.(error, variables);
    },
    retry: (failureCount, error) => {
      if (error?.code && ['PGRST116', 'PGRST301', 'PGRST302'].includes(error.code)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options
  });
} 