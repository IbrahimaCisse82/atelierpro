import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables, Enums } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type PurchaseOrder = Tables<'purchase_orders'>;
type PurchaseOrderInsert = Tables<'purchase_orders'>['Insert'];
type PurchaseOrderUpdate = Tables<'purchase_orders'>['Update'];
type PurchaseOrderItem = Tables<'purchase_order_items'>;
type Reception = Tables<'receptions'>;
type ReceptionInsert = Tables<'receptions'>['Insert'];
type PurchaseStatus = Enums<'purchase_status'>;

export function usePurchases() {
  const {
    data: purchaseOrders,
    loading,
    error,
    refetch
  } = useSupabaseQuery<PurchaseOrder>({
    table: 'purchase_orders',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const {
    data: receptions,
    loading: receptionsLoading,
    refetch: refetchReceptions
  } = useSupabaseQuery<Reception>({
    table: 'receptions',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<PurchaseOrder>('purchase_orders');
  const { create: createReception, update: updateReception } = useSupabaseMutation<Reception>('receptions');

  // Créer un bon de commande
  const createPurchaseOrder = useCallback(async (purchaseData: Omit<PurchaseOrderInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      const result = await create({
        ...purchaseData,
        status: 'draft' as PurchaseStatus
      });
      toast({
        title: "Bon de commande créé",
        description: "Le bon de commande a été créé avec succès.",
      });
      refetch();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le bon de commande.",
        variant: "destructive"
      });
      throw error;
    }
  }, [create, refetch]);

  // Mettre à jour le statut d'un bon de commande
  const updatePurchaseStatus = useCallback(async (purchaseId: string, status: PurchaseStatus) => {
    try {
      await update(purchaseId, { status });
      
      const statusLabels: Record<PurchaseStatus, string> = {
        draft: "Brouillon",
        ordered: "Commandé",
        confirmed: "Confirmé",
        in_transit: "En transit",
        delivered_not_received: "Livré non reçu",
        received: "Reçu",
        invoice_received: "Facture reçue",
        ready_to_pay: "Prêt à payer",
        paid: "Payé",
        cancelled: "Annulé"
      };

      toast({
        title: "Statut mis à jour",
        description: `Le bon de commande est maintenant ${statusLabels[status].toLowerCase()}.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  // Mettre à jour un bon de commande
  const updatePurchaseOrder = useCallback(async (purchaseId: string, purchaseData: Partial<PurchaseOrderUpdate>) => {
    try {
      await update(purchaseId, purchaseData);
      toast({
        title: "Bon de commande modifié",
        description: "Le bon de commande a été modifié avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le bon de commande.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  // Supprimer un bon de commande
  const deletePurchaseOrder = useCallback(async (purchaseId: string) => {
    try {
      await remove(purchaseId);
      toast({
        title: "Bon de commande supprimé",
        description: "Le bon de commande a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le bon de commande.",
        variant: "destructive"
      });
      throw error;
    }
  }, [remove, refetch]);

  // Créer une réception
  const createReception = useCallback(async (receptionData: Omit<ReceptionInsert, 'company_id' | 'created_by'>) => {
    try {
      const result = await createReception(receptionData);
      toast({
        title: "Réception créée",
        description: "La réception a été créée avec succès.",
      });
      refetchReceptions();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la réception.",
        variant: "destructive"
      });
      throw error;
    }
  }, [createReception, refetchReceptions]);

  // Valider une réception
  const validateReception = useCallback(async (receptionId: string, validatedBy: string) => {
    try {
      await updateReception(receptionId, {
        is_validated: true,
        validated_by: validatedBy,
        validated_at: new Date().toISOString()
      });

      // Mettre à jour le statut du bon de commande
      const reception = receptions?.find(r => r.id === receptionId);
      if (reception) {
        await update(reception.purchase_order_id, { status: 'received' as PurchaseStatus });
      }

      toast({
        title: "Réception validée",
        description: "La réception a été validée avec succès.",
      });
      refetchReceptions();
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider la réception.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateReception, receptions, update, refetchReceptions, refetch]);

  // Utilitaires
  const getPurchaseOrderById = useCallback((id: string) => {
    return purchaseOrders?.find(purchase => purchase.id === id);
  }, [purchaseOrders]);

  const getPurchaseOrdersByStatus = useCallback((status: PurchaseStatus) => {
    return purchaseOrders?.filter(purchase => purchase.status === status) || [];
  }, [purchaseOrders]);

  const getPurchaseOrdersBySupplier = useCallback((supplierId: string) => {
    return purchaseOrders?.filter(purchase => purchase.supplier_id === supplierId) || [];
  }, [purchaseOrders]);

  const getActivePurchaseOrders = useCallback(() => {
    const activeStatuses: PurchaseStatus[] = [
      'draft',
      'ordered',
      'confirmed',
      'in_transit',
      'delivered_not_received'
    ];
    return purchaseOrders?.filter(purchase => activeStatuses.includes(purchase.status)) || [];
  }, [purchaseOrders]);

  const getReceivedPurchaseOrders = useCallback(() => {
    return purchaseOrders?.filter(purchase => purchase.status === 'received') || [];
  }, [purchaseOrders]);

  const getReceptionByPurchaseOrder = useCallback((purchaseOrderId: string) => {
    return receptions?.find(reception => reception.purchase_order_id === purchaseOrderId);
  }, [receptions]);

  const getValidatedReceptions = useCallback(() => {
    return receptions?.filter(reception => reception.is_validated) || [];
  }, [receptions]);

  const getPendingReceptions = useCallback(() => {
    return receptions?.filter(reception => !reception.is_validated) || [];
  }, [receptions]);

  const searchPurchaseOrders = useCallback((searchTerm: string) => {
    if (!purchaseOrders) return [];
    
    const term = searchTerm.toLowerCase();
    return purchaseOrders.filter(purchase => 
      purchase.order_number.toLowerCase().includes(term)
    );
  }, [purchaseOrders]);

  // Statistiques
  const getPurchaseStats = useCallback(() => {
    if (!purchaseOrders) return null;

    const total = purchaseOrders.length;
    const active = getActivePurchaseOrders().length;
    const received = getReceivedPurchaseOrders().length;
    const totalAmount = purchaseOrders.reduce((sum, purchase) => sum + purchase.total_amount, 0);

    return {
      total,
      active,
      received,
      totalAmount
    };
  }, [purchaseOrders, getActivePurchaseOrders, getReceivedPurchaseOrders]);

  return {
    purchaseOrders: purchaseOrders || [],
    receptions: receptions || [],
    loading: loading || receptionsLoading || mutationLoading,
    error,
    createPurchaseOrder,
    updatePurchaseStatus,
    updatePurchaseOrder,
    deletePurchaseOrder,
    createReception,
    validateReception,
    getPurchaseOrderById,
    getPurchaseOrdersByStatus,
    getPurchaseOrdersBySupplier,
    getActivePurchaseOrders,
    getReceivedPurchaseOrders,
    getReceptionByPurchaseOrder,
    getValidatedReceptions,
    getPendingReceptions,
    searchPurchaseOrders,
    getPurchaseStats,
    refetch
  };
} 