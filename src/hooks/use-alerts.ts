import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Alert = Database['public']['Tables']['alerts']['Row'];
type AlertInsert = Database['public']['Tables']['alerts']['Insert'];
type AlertUpdate = Database['public']['Tables']['alerts']['Update'];

export const useAlerts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getAllAlerts = async (): Promise<Alert[]> => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }

    return data || [];
  };

  const getUnreadAlerts = async (): Promise<Alert[]> => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }

    return data || [];
  };

  const createAlert = async (alertData: Omit<AlertInsert, 'id' | 'created_at'>): Promise<Alert> => {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alertData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      throw error;
    }

    return data;
  };

  const updateAlert = async (id: string, updates: Partial<AlertUpdate>): Promise<Alert> => {
    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', error);
      throw error;
    }

    return data;
  };

  // Queries
  const {
    data: unreadAlerts = [],
    isLoading: isLoadingUnread,
    error: unreadError
  } = useQuery({
    queryKey: ['alerts', 'unread'],
    queryFn: getUnreadAlerts,
    refetchInterval: 30000,
  });

  const {
    data: allAlerts = [],
    isLoading: isLoadingAll,
    error: allError
  } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: getAllAlerts,
  });

  // Mutations
  const createAlertMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: "Alerte créée",
        description: "L'alerte a été créée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'alerte",
        variant: "destructive",
      });
      console.error('Erreur lors de la création de l\'alerte:', error);
    },
  });

  return {
    unreadAlerts,
    allAlerts,
    isLoadingUnread,
    isLoadingAll,
    unreadError,
    allError,
    createAlert: createAlertMutation.mutate,
    isCreatingAlert: createAlertMutation.isPending,
  };
};