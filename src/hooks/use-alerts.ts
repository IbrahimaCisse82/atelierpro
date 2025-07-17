import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables, Enums } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type Alert = Tables<'alerts'>;
type AlertInsert = Tables<'alerts'>['Insert'];
type AlertUpdate = Tables<'alerts'>['Update'];
type AlertType = Enums<'alert_type'>;
type AlertLevel = Enums<'alert_level'>;

export function useAlerts() {
  const {
    data: alerts,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Alert>({
    table: 'alerts',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<Alert>('alerts');

  // Créer une nouvelle alerte
  const addAlert = useCallback(async (alertData: Omit<AlertInsert, 'company_id' | 'created_by'>) => {
    try {
      const result = await create(alertData);
      toast({
        title: "Alerte créée",
        description: "L'alerte a été créée avec succès.",
      });
      refetch();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'alerte.",
        variant: "destructive"
      });
      throw error;
    }
  }, [create, refetch]);

  // Mettre à jour une alerte
  const updateAlert = useCallback(async (alertId: string, alertData: Partial<AlertUpdate>) => {
    try {
      await update(alertId, alertData);
      toast({
        title: "Alerte modifiée",
        description: "L'alerte a été modifiée avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'alerte.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  // Supprimer une alerte
  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      await remove(alertId);
      toast({
        title: "Alerte supprimée",
        description: "L'alerte a été supprimée avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'alerte.",
        variant: "destructive"
      });
      throw error;
    }
  }, [remove, refetch]);

  // Marquer une alerte comme lue
  const markAlertAsRead = useCallback(async (alertId: string, readBy: string) => {
    try {
      await update(alertId, {
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: readBy
      });
      toast({
        title: "Alerte marquée comme lue",
        description: "L'alerte a été marquée comme lue.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'alerte comme lue.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  // Marquer toutes les alertes comme lues
  const markAllAlertsAsRead = useCallback(async (readBy: string) => {
    try {
      const unreadAlerts = getUnreadAlerts();
      const updatePromises = unreadAlerts.map(alert => 
        update(alert.id, {
          is_read: true,
          read_at: new Date().toISOString(),
          read_by: readBy
        })
      );
      
      await Promise.all(updatePromises);
      toast({
        title: "Alertes marquées comme lues",
        description: "Toutes les alertes ont été marquées comme lues.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les alertes comme lues.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch, getUnreadAlerts]);

  // Créer des alertes automatiques
  const createStockAlert = useCallback(async (productId: string, productName: string, currentStock: number, minStock: number) => {
    try {
      await create({
        type: 'stock_low' as AlertType,
        level: 'warning' as AlertLevel,
        title: 'Stock faible',
        message: `Le produit "${productName}" a un stock faible (${currentStock}/${minStock})`,
        related_entity_type: 'product',
        related_entity_id: productId
      });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte stock:', error);
    }
  }, [create, refetch]);

  const createOrderDelayAlert = useCallback(async (orderId: string, orderNumber: string, daysLate: number) => {
    try {
      await create({
        type: 'order_delay' as AlertType,
        level: daysLate > 7 ? 'error' as AlertLevel : 'warning' as AlertLevel,
        title: 'Retard de commande',
        message: `La commande ${orderNumber} a ${daysLate} jour(s) de retard`,
        related_entity_type: 'order',
        related_entity_id: orderId
      });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte retard:', error);
    }
  }, [create, refetch]);

  const createPaymentDueAlert = useCallback(async (invoiceId: string, invoiceNumber: string, daysOverdue: number) => {
    try {
      await create({
        type: 'payment_due' as AlertType,
        level: daysOverdue > 30 ? 'critical' as AlertLevel : 'warning' as AlertLevel,
        title: 'Paiement en retard',
        message: `La facture ${invoiceNumber} a ${daysOverdue} jour(s) de retard`,
        related_entity_type: 'invoice',
        related_entity_id: invoiceId
      });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte paiement:', error);
    }
  }, [create, refetch]);

  // Utilitaires
  const getAlertById = useCallback((id: string) => {
    return alerts?.find(alert => alert.id === id);
  }, [alerts]);

  const getUnreadAlerts = useCallback(() => {
    return alerts?.filter(alert => !alert.is_read) || [];
  }, [alerts]);

  const getReadAlerts = useCallback(() => {
    return alerts?.filter(alert => alert.is_read) || [];
  }, [alerts]);

  const getAlertsByType = useCallback((type: AlertType) => {
    return alerts?.filter(alert => alert.type === type) || [];
  }, [alerts]);

  const getAlertsByLevel = useCallback((level: AlertLevel) => {
    return alerts?.filter(alert => alert.level === level) || [];
  }, [alerts]);

  const getCriticalAlerts = useCallback(() => {
    return alerts?.filter(alert => alert.level === 'critical') || [];
  }, [alerts]);

  const getErrorAlerts = useCallback(() => {
    return alerts?.filter(alert => alert.level === 'error') || [];
  }, [alerts]);

  const getWarningAlerts = useCallback(() => {
    return alerts?.filter(alert => alert.level === 'warning') || [];
  }, [alerts]);

  const getInfoAlerts = useCallback(() => {
    return alerts?.filter(alert => alert.level === 'info') || [];
  }, [alerts]);

  const getAlertsByEntity = useCallback((entityType: string, entityId: string) => {
    return alerts?.filter(alert => 
      alert.related_entity_type === entityType && alert.related_entity_id === entityId
    ) || [];
  }, [alerts]);

  const getActiveAlerts = useCallback(() => {
    const now = new Date();
    return alerts?.filter(alert => {
      if (alert.is_read) return false;
      if (!alert.expires_at) return true;
      return new Date(alert.expires_at) > now;
    }) || [];
  }, [alerts]);

  const searchAlerts = useCallback((searchTerm: string) => {
    if (!alerts) return [];
    
    const term = searchTerm.toLowerCase();
    return alerts.filter(alert => 
      alert.title.toLowerCase().includes(term) ||
      alert.message.toLowerCase().includes(term)
    );
  }, [alerts]);

  // Statistiques
  const getAlertStats = useCallback(() => {
    if (!alerts) return null;

    const total = alerts.length;
    const unread = getUnreadAlerts().length;
    const read = getReadAlerts().length;
    const critical = getCriticalAlerts().length;
    const error = getErrorAlerts().length;
    const warning = getWarningAlerts().length;
    const info = getInfoAlerts().length;

    // Par type
    const byType = {
      stock_low: getAlertsByType('stock_low').length,
      order_delay: getAlertsByType('order_delay').length,
      payment_due: getAlertsByType('payment_due').length,
      supplier_delivery: getAlertsByType('supplier_delivery').length,
      quality_issue: getAlertsByType('quality_issue').length,
      system_alert: getAlertsByType('system_alert').length
    };

    return {
      total,
      unread,
      read,
      byLevel: {
        critical,
        error,
        warning,
        info
      },
      byType
    };
  }, [alerts, getUnreadAlerts, getReadAlerts, getCriticalAlerts, getErrorAlerts, getWarningAlerts, getInfoAlerts, getAlertsByType]);

  return {
    alerts: alerts || [],
    loading: loading || mutationLoading,
    error,
    addAlert,
    updateAlert,
    deleteAlert,
    markAlertAsRead,
    markAllAlertsAsRead,
    createStockAlert,
    createOrderDelayAlert,
    createPaymentDueAlert,
    getAlertById,
    getUnreadAlerts,
    getReadAlerts,
    getAlertsByType,
    getAlertsByLevel,
    getCriticalAlerts,
    getErrorAlerts,
    getWarningAlerts,
    getInfoAlerts,
    getAlertsByEntity,
    getActiveAlerts,
    searchAlerts,
    getAlertStats,
    refetch
  };
} 