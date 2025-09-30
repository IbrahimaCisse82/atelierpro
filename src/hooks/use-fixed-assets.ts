import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FixedAsset {
  id: string;
  company_id: string;
  asset_code: string;
  asset_name: string;
  asset_category: string;
  acquisition_date: string;
  acquisition_cost: number;
  useful_life: number;
  salvage_value: number;
  depreciation_type: string;
  depreciation_rate?: number;
  accumulated_depreciation: number;
  net_book_value: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useFixedAssets = () => {
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['fixed_assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_assets')
        .select('*')
        .order('asset_name');

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: depreciations = [] } = useQuery({
    queryKey: ['depreciations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('depreciations')
        .select('*')
        .order('depreciation_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createAsset = useMutation({
    mutationFn: async (asset: Omit<FixedAsset, 'id' | 'created_at' | 'updated_at' | 'asset_code' | 'company_id' | 'accumulated_depreciation' | 'net_book_value'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      const { data: existingAssets } = await supabase
        .from('fixed_assets')
        .select('asset_code')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(1);

      const count = existingAssets?.length || 0;
      const assetCode = `IMM-${String(count + 1).padStart(6, '0')}`;

      const netBookValue = asset.acquisition_cost - asset.salvage_value;

      const { data, error } = await supabase
        .from('fixed_assets')
        .insert({
          ...asset,
          asset_code: assetCode,
          company_id: profile.company_id,
          accumulated_depreciation: 0,
          net_book_value: netBookValue,
          created_by: user.id,
          updated_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed_assets'] });
      toast({
        title: 'Immobilisation créée',
        description: 'L\'immobilisation a été créée avec succès.',
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

  const updateAsset = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FixedAsset> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('fixed_assets')
        .update({
          ...updates as any,
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed_assets'] });
      toast({
        title: 'Immobilisation mise à jour',
        description: 'L\'immobilisation a été mise à jour avec succès.',
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
    assets,
    depreciations,
    isLoading,
    createAsset: createAsset.mutate,
    updateAsset: updateAsset.mutate,
    isCreating: createAsset.isPending,
    isUpdating: updateAsset.isPending,
  };
};