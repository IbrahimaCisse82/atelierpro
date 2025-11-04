// Hook métier pour la gestion des commandes : CRUD, statut, assignation, recherche, statistiques, feedback utilisateur toast.
import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables, Enums, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type Order = Tables<'orders'>;
type OrderInsert = TablesInsert<'orders'>;
type OrderUpdate = TablesUpdate<'orders'>;
type OrderItem = Tables<'order_items'>;
type ProductionStatus = Enums<'production_status'>;

// Centralisation du pattern de gestion d’erreur/toast
function showErrorToast(message: string) {
  toast({
    title: "Erreur",
    description: message,
    variant: "destructive"
  });
}

export function useOrders(): {
  orders: Order[];
  loading: boolean;
  error: any;
  createOrder: (orderData: Omit<OrderInsert, 'company_id' | 'created_by' | 'updated_by'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: ProductionStatus, notes?: string) => Promise<void>;
  assignTailor: (orderId: string, tailorId: string) => Promise<void>;
  updateOrder: (orderId: string, orderData: Partial<OrderUpdate>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: ProductionStatus) => Order[];
  getOrdersByClient: (clientId: string) => Order[];
  getOrdersByTailor: (tailorId: string) => Order[];
  getActiveOrders: () => Order[];
  getDeliveredOrders: () => Order[];
  getInvoicedOrders: () => Order[];
  getPaidOrders: () => Order[];
  searchOrders: (searchTerm: string) => Order[];
  getOrderStats: () => {
    total: number;
    active: number;
    delivered: number;
    invoiced: number;
    paid: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  } | null;
  refetch: () => void;
} {
  const {
    data: orders,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Order>('orders', {
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<Order>('orders');

  // Créer une nouvelle commande
  const createOrder = useCallback(async (orderData: Omit<OrderInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      await create({
        ...orderData,
        status: 'order_created' as ProductionStatus
      });
      toast({
        title: "Commande créée",
        description: "La commande a été créée avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de créer la commande.");
      throw error;
    }
  }, [create, refetch]);

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = useCallback(async (orderId: string, status: ProductionStatus, notes?: string) => {
    try {
      await update(orderId, { status });
      // Créer un enregistrement de suivi de production
      const { create: createTracking } = useSupabaseMutation('production_tracking');
      await createTracking({
        order_id: orderId,
        status,
        status_date: new Date().toISOString(),
        notes
      });
      const statusLabels: Record<ProductionStatus, string> = {
        order_created: "Commande créée",
        waiting_materials: "En attente de matériaux",
        materials_allocated: "Matériaux alloués",
        cutting_in_progress: "Coupe en cours",
        cutting_completed: "Coupe terminée",
        assembly_in_progress: "Assemblage en cours",
        assembly_completed: "Assemblage terminé",
        finishing_in_progress: "Finition en cours",
        quality_check: "Contrôle qualité",
        ready_to_deliver: "Prêt à livrer",
        delivered: "Livré",
        invoiced: "Facturé",
        paid: "Payé",
        cancelled: "Annulé"
      };
      toast({
        title: "Statut mis à jour",
        description: `La commande est maintenant ${statusLabels[status].toLowerCase()}.`,
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de mettre à jour le statut.");
      throw error;
    }
  }, [update, refetch]);

  // Assigner un tailleur à une commande
  const assignTailor = useCallback(async (orderId: string, tailorId: string) => {
    try {
      await update(orderId, { assigned_tailor_id: tailorId });
      toast({
        title: "Tailleur assigné",
        description: "Le tailleur a été assigné à la commande.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible d'assigner le tailleur.");
      throw error;
    }
  }, [update, refetch]);

  // Mettre à jour une commande
  const updateOrder = useCallback(async (orderId: string, orderData: Partial<OrderUpdate>) => {
    try {
      await update(orderId, orderData);
      toast({
        title: "Commande modifiée",
        description: "La commande a été modifiée avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de modifier la commande.");
      throw error;
    }
  }, [update, refetch]);

  // Supprimer une commande
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      await remove(orderId);
      toast({
        title: "Commande supprimée",
        description: "La commande a été supprimée avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de supprimer la commande.");
      throw error;
    }
  }, [remove, refetch]);

  // Utilitaires
  const getOrderById = useCallback((id: string) => {
    return orders?.find(order => order.id === id);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: ProductionStatus) => {
    return orders?.filter(order => order.status === status) || [];
  }, [orders]);

  const getOrdersByClient = useCallback((clientId: string) => {
    return orders?.filter(order => order.client_id === clientId) || [];
  }, [orders]);

  const getOrdersByTailor = useCallback((tailorId: string) => {
    return orders?.filter(order => order.assigned_tailor_id === tailorId) || [];
  }, [orders]);

  const getActiveOrders = useCallback(() => {
    const activeStatuses: ProductionStatus[] = [
      'order_created',
      'waiting_materials',
      'materials_allocated',
      'cutting_in_progress',
      'cutting_completed',
      'assembly_in_progress',
      'assembly_completed',
      'finishing_in_progress',
      'quality_check',
      'ready_to_deliver'
    ];
    return orders?.filter(order => activeStatuses.includes(order.status)) || [];
  }, [orders]);

  const getDeliveredOrders = useCallback(() => {
    return orders?.filter(order => order.status === 'delivered') || [];
  }, [orders]);

  const getInvoicedOrders = useCallback(() => {
    return orders?.filter(order => order.status === 'invoiced') || [];
  }, [orders]);

  const getPaidOrders = useCallback(() => {
    return orders?.filter(order => order.status === 'paid') || [];
  }, [orders]);

  const searchOrders = useCallback((searchTerm: string) => {
    if (!orders) return [];
    const term = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.order_number.toLowerCase().includes(term)
    );
  }, [orders]);

  // Statistiques optimisées avec useMemo
  const getOrderStats = useCallback(() => {
    if (!orders) return null;
    
    // ✅ Calcul optimisé en une seule passe
    const stats = orders.reduce((acc, order) => {
      const isActive = ['order_created', 'waiting_materials', 'materials_allocated', 
                       'cutting_in_progress', 'cutting_completed', 'assembly_in_progress',
                       'assembly_completed', 'finishing_in_progress', 'quality_check', 
                       'ready_to_deliver'].includes(order.status);
      
      return {
        total: acc.total + 1,
        active: acc.active + (isActive ? 1 : 0),
        delivered: acc.delivered + (order.status === 'delivered' ? 1 : 0),
        invoiced: acc.invoiced + (order.status === 'invoiced' ? 1 : 0),
        paid: acc.paid + (order.status === 'paid' ? 1 : 0),
        totalAmount: acc.totalAmount + order.total_amount,
        paidAmount: acc.paidAmount + order.paid_amount,
      };
    }, {
      total: 0, active: 0, delivered: 0, invoiced: 0, paid: 0,
      totalAmount: 0, paidAmount: 0
    });

    return {
      ...stats,
      pendingAmount: stats.totalAmount - stats.paidAmount
    };
  }, [orders]);

  return {
    orders: orders || [],
    loading: loading || mutationLoading,
    error,
    createOrder,
    updateOrderStatus,
    assignTailor,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
    getOrdersByClient,
    getOrdersByTailor,
    getActiveOrders,
    getDeliveredOrders,
    getInvoicedOrders,
    getPaidOrders,
    searchOrders,
    getOrderStats,
    refetch
  };
} 