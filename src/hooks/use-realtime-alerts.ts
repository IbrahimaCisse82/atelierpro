import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeAlerts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    // Skip realtime subscription in demo mode
    if (!user || user.id === 'demo-user-id') return;

    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          const newAlert = payload.new as any;
          // Show toast notification
          toast({
            title: `🔔 ${newAlert.title}`,
            description: newAlert.message,
            variant: newAlert.level === 'error' ? 'destructive' : 'default',
          });
          // Invalidate alerts queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
