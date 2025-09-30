import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TreasuryAccount {
  id: string;
  company_id: string;
  account_type: string;
  account_name: string;
  account_number?: string;
  bank_name?: string;
  currency: string;
  current_balance: number;
  initial_balance: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TreasuryMovement {
  id: string;
  company_id: string;
  movement_number: string;
  treasury_account_id: string;
  movement_date: string;
  movement_type: string;
  category: string;
  amount: number;
  reference?: string;
  description: string;
  beneficiary?: string;
  transfer_to_account_id?: string;
  notes?: string;
  is_reconciled: boolean;
  created_at: string;
  updated_at: string;
}

export const useTreasury = () => {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['treasury_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treasury_accounts')
        .select('*')
        .order('account_name');

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['treasury_movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treasury_movements')
        .select(`
          *,
          treasury_accounts:treasury_account_id (
            account_name,
            account_type
          )
        `)
        .order('movement_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createAccount = useMutation({
    mutationFn: async (account: Omit<TreasuryAccount, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'current_balance'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      const { data, error } = await supabase
        .from('treasury_accounts')
        .insert({
          ...account,
          company_id: profile.company_id,
          current_balance: account.initial_balance,
          created_by: user.id,
          updated_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury_accounts'] });
      toast({
        title: 'Compte créé',
        description: 'Le compte de trésorerie a été créé avec succès.',
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

  const createMovement = useMutation({
    mutationFn: async (movement: Omit<TreasuryMovement, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'movement_number' | 'is_reconciled'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      const { data: existingMovements } = await supabase
        .from('treasury_movements')
        .select('movement_number')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(1);

      const count = existingMovements?.length || 0;
      const movementNumber = `TRES-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(count + 1).padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('treasury_movements')
        .insert({
          ...movement,
          movement_number: movementNumber,
          company_id: profile.company_id,
          is_reconciled: false,
          created_by: user.id,
          updated_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury_movements'] });
      queryClient.invalidateQueries({ queryKey: ['treasury_accounts'] });
      toast({
        title: 'Mouvement enregistré',
        description: 'Le mouvement de trésorerie a été enregistré avec succès.',
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
    accounts,
    movements,
    isLoading: loadingAccounts || loadingMovements,
    createAccount: createAccount.mutate,
    createMovement: createMovement.mutate,
    isCreatingAccount: createAccount.isPending,
    isCreatingMovement: createMovement.isPending,
  };
};