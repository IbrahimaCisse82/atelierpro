import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data?.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        level: alert.level as 'info' | 'warning' | 'error' | 'critical',
        time: new Date(alert.created_at).toLocaleString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        })
      })) || [];
    },
    refetchInterval: 60000, // Actualiser toutes les minutes
  });
};
