import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type CustomerInvoice = Tables<'customer_invoices'>;
type CustomerInvoiceInsert = Tables<'customer_invoices'>['Insert'];
type CustomerInvoiceUpdate = Tables<'customer_invoices'>['Update'];
type SupplierInvoice = Tables<'supplier_invoices'>;
type SupplierInvoiceInsert = Tables<'supplier_invoices'>['Insert'];
type SupplierInvoiceUpdate = Tables<'supplier_invoices'>['Update'];

export function useInvoices() {
  const {
    data: customerInvoices,
    loading: customerInvoicesLoading,
    error: customerInvoicesError,
    refetch: refetchCustomerInvoices
  } = useSupabaseQuery<CustomerInvoice>({
    table: 'customer_invoices',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const {
    data: supplierInvoices,
    loading: supplierInvoicesLoading,
    error: supplierInvoicesError,
    refetch: refetchSupplierInvoices
  } = useSupabaseQuery<SupplierInvoice>({
    table: 'supplier_invoices',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create: createCustomerInvoice, update: updateCustomerInvoice, remove: removeCustomerInvoice, loading: customerMutationLoading } = useSupabaseMutation<CustomerInvoice>('customer_invoices');
  const { create: createSupplierInvoice, update: updateSupplierInvoice, remove: removeSupplierInvoice, loading: supplierMutationLoading } = useSupabaseMutation<SupplierInvoice>('supplier_invoices');

  // Factures clients
  const createCustomerInvoice = useCallback(async (invoiceData: Omit<CustomerInvoiceInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      const result = await createCustomerInvoice(invoiceData);
      toast({
        title: "Facture client créée",
        description: "La facture client a été créée avec succès.",
      });
      refetchCustomerInvoices();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture client.",
        variant: "destructive"
      });
      throw error;
    }
  }, [createCustomerInvoice, refetchCustomerInvoices]);

  const updateCustomerInvoice = useCallback(async (invoiceId: string, invoiceData: Partial<CustomerInvoiceUpdate>) => {
    try {
      await updateCustomerInvoice(invoiceId, invoiceData);
      toast({
        title: "Facture client modifiée",
        description: "La facture client a été modifiée avec succès.",
      });
      refetchCustomerInvoices();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la facture client.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateCustomerInvoice, refetchCustomerInvoices]);

  const deleteCustomerInvoice = useCallback(async (invoiceId: string) => {
    try {
      await removeCustomerInvoice(invoiceId);
      toast({
        title: "Facture client supprimée",
        description: "La facture client a été supprimée avec succès.",
      });
      refetchCustomerInvoices();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture client.",
        variant: "destructive"
      });
      throw error;
    }
  }, [removeCustomerInvoice, refetchCustomerInvoices]);

  const markCustomerInvoiceAsPaid = useCallback(async (invoiceId: string, paidBy: string) => {
    try {
      await updateCustomerInvoice(invoiceId, {
        is_paid: true,
        paid_at: new Date().toISOString(),
        paid_by: paidBy
      });
      toast({
        title: "Paiement enregistré",
        description: "Le paiement de la facture client a été enregistré.",
      });
      refetchCustomerInvoices();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateCustomerInvoice, refetchCustomerInvoices]);

  // Factures fournisseurs
  const createSupplierInvoice = useCallback(async (invoiceData: Omit<SupplierInvoiceInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      const result = await createSupplierInvoice(invoiceData);
      toast({
        title: "Facture fournisseur créée",
        description: "La facture fournisseur a été créée avec succès.",
      });
      refetchSupplierInvoices();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture fournisseur.",
        variant: "destructive"
      });
      throw error;
    }
  }, [createSupplierInvoice, refetchSupplierInvoices]);

  const updateSupplierInvoice = useCallback(async (invoiceId: string, invoiceData: Partial<SupplierInvoiceUpdate>) => {
    try {
      await updateSupplierInvoice(invoiceId, invoiceData);
      toast({
        title: "Facture fournisseur modifiée",
        description: "La facture fournisseur a été modifiée avec succès.",
      });
      refetchSupplierInvoices();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la facture fournisseur.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateSupplierInvoice, refetchSupplierInvoices]);

  const deleteSupplierInvoice = useCallback(async (invoiceId: string) => {
    try {
      await removeSupplierInvoice(invoiceId);
      toast({
        title: "Facture fournisseur supprimée",
        description: "La facture fournisseur a été supprimée avec succès.",
      });
      refetchSupplierInvoices();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture fournisseur.",
        variant: "destructive"
      });
      throw error;
    }
  }, [removeSupplierInvoice, refetchSupplierInvoices]);

  const markSupplierInvoiceAsPaid = useCallback(async (invoiceId: string, paidBy: string) => {
    try {
      await updateSupplierInvoice(invoiceId, {
        is_paid: true,
        paid_at: new Date().toISOString(),
        paid_by: paidBy
      });
      toast({
        title: "Paiement enregistré",
        description: "Le paiement de la facture fournisseur a été enregistré.",
      });
      refetchSupplierInvoices();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateSupplierInvoice, refetchSupplierInvoices]);

  // Utilitaires
  const getCustomerInvoiceById = useCallback((id: string) => {
    return customerInvoices?.find(invoice => invoice.id === id);
  }, [customerInvoices]);

  const getSupplierInvoiceById = useCallback((id: string) => {
    return supplierInvoices?.find(invoice => invoice.id === id);
  }, [supplierInvoices]);

  const getPaidCustomerInvoices = useCallback(() => {
    return customerInvoices?.filter(invoice => invoice.is_paid) || [];
  }, [customerInvoices]);

  const getUnpaidCustomerInvoices = useCallback(() => {
    return customerInvoices?.filter(invoice => !invoice.is_paid) || [];
  }, [customerInvoices]);

  const getPaidSupplierInvoices = useCallback(() => {
    return supplierInvoices?.filter(invoice => invoice.is_paid) || [];
  }, [supplierInvoices]);

  const getUnpaidSupplierInvoices = useCallback(() => {
    return supplierInvoices?.filter(invoice => !invoice.is_paid) || [];
  }, [supplierInvoices]);

  const getCustomerInvoicesByOrder = useCallback((orderId: string) => {
    return customerInvoices?.filter(invoice => invoice.order_id === orderId) || [];
  }, [customerInvoices]);

  const getSupplierInvoicesByPurchaseOrder = useCallback((purchaseOrderId: string) => {
    return supplierInvoices?.filter(invoice => invoice.purchase_order_id === purchaseOrderId) || [];
  }, [supplierInvoices]);

  const searchCustomerInvoices = useCallback((searchTerm: string) => {
    if (!customerInvoices) return [];
    
    const term = searchTerm.toLowerCase();
    return customerInvoices.filter(invoice => 
      invoice.invoice_number.toLowerCase().includes(term)
    );
  }, [customerInvoices]);

  const searchSupplierInvoices = useCallback((searchTerm: string) => {
    if (!supplierInvoices) return [];
    
    const term = searchTerm.toLowerCase();
    return supplierInvoices.filter(invoice => 
      invoice.invoice_number.toLowerCase().includes(term)
    );
  }, [supplierInvoices]);

  // Statistiques
  const getInvoiceStats = useCallback(() => {
    if (!customerInvoices || !supplierInvoices) return null;

    const customerTotal = customerInvoices.length;
    const customerPaid = getPaidCustomerInvoices().length;
    const customerUnpaid = getUnpaidCustomerInvoices().length;
    const customerTotalAmount = customerInvoices.reduce((sum, invoice) => sum + invoice.total_with_tax, 0);
    const customerPaidAmount = customerInvoices.filter(invoice => invoice.is_paid).reduce((sum, invoice) => sum + invoice.total_with_tax, 0);

    const supplierTotal = supplierInvoices.length;
    const supplierPaid = getPaidSupplierInvoices().length;
    const supplierUnpaid = getUnpaidSupplierInvoices().length;
    const supplierTotalAmount = supplierInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const supplierPaidAmount = supplierInvoices.filter(invoice => invoice.is_paid).reduce((sum, invoice) => sum + invoice.total_amount, 0);

    return {
      customer: {
        total: customerTotal,
        paid: customerPaid,
        unpaid: customerUnpaid,
        totalAmount: customerTotalAmount,
        paidAmount: customerPaidAmount,
        pendingAmount: customerTotalAmount - customerPaidAmount
      },
      supplier: {
        total: supplierTotal,
        paid: supplierPaid,
        unpaid: supplierUnpaid,
        totalAmount: supplierTotalAmount,
        paidAmount: supplierPaidAmount,
        pendingAmount: supplierTotalAmount - supplierPaidAmount
      }
    };
  }, [customerInvoices, supplierInvoices, getPaidCustomerInvoices, getUnpaidCustomerInvoices, getPaidSupplierInvoices, getUnpaidSupplierInvoices]);

  return {
    customerInvoices: customerInvoices || [],
    supplierInvoices: supplierInvoices || [],
    loading: customerInvoicesLoading || supplierInvoicesLoading || customerMutationLoading || supplierMutationLoading,
    error: customerInvoicesError || supplierInvoicesError,
    createCustomerInvoice,
    updateCustomerInvoice,
    deleteCustomerInvoice,
    markCustomerInvoiceAsPaid,
    createSupplierInvoice,
    updateSupplierInvoice,
    deleteSupplierInvoice,
    markSupplierInvoiceAsPaid,
    getCustomerInvoiceById,
    getSupplierInvoiceById,
    getPaidCustomerInvoices,
    getUnpaidCustomerInvoices,
    getPaidSupplierInvoices,
    getUnpaidSupplierInvoices,
    getCustomerInvoicesByOrder,
    getSupplierInvoicesByPurchaseOrder,
    searchCustomerInvoices,
    searchSupplierInvoices,
    getInvoiceStats,
    refetchCustomerInvoices,
    refetchSupplierInvoices
  };
} 