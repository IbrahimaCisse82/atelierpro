import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type CustomerInvoice = Database['public']['Tables']['customer_invoices']['Row'];
type CustomerInvoiceInsert = Database['public']['Tables']['customer_invoices']['Insert'];
type CustomerInvoiceUpdate = Database['public']['Tables']['customer_invoices']['Update'];

export const useInvoices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getCustomerInvoices = async (): Promise<CustomerInvoice[]> => {
    const { data, error } = await supabase
      .from('customer_invoices')
      .select(`
        *,
        order:order_id (
          order_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des factures clients:', error);
      throw error;
    }

    return data || [];
  };

  const createCustomerInvoice = async (invoiceData: Omit<CustomerInvoiceInsert, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerInvoice> => {
    const { data, error } = await supabase
      .from('customer_invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la facture client:', error);
      throw error;
    }

    return data;
  };

  // Queries
  const {
    data: customerInvoices = [],
    isLoading: isLoadingCustomerInvoices,
    error: customerInvoicesError
  } = useQuery({
    queryKey: ['customer-invoices'],
    queryFn: getCustomerInvoices,
  });

  // Mutations
  const createCustomerInvoiceMutation = useMutation({
    mutationFn: createCustomerInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
      toast({
        title: "Facture créée",
        description: "La facture a été créée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive",
      });
      console.error('Erreur lors de la création de la facture:', error);
    },
  });

  return {
    customerInvoices,
    isLoadingCustomerInvoices,
    customerInvoicesError,
    createCustomerInvoice: createCustomerInvoiceMutation.mutate,
    isCreatingCustomerInvoice: createCustomerInvoiceMutation.isPending,
  };
};