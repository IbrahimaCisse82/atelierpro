import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Récupérer les commandes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total_amount, paid_amount');
      
      if (ordersError) throw ordersError;

      // Récupérer les clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, is_active, created_at');
      
      if (clientsError) throw clientsError;

      // Récupérer les produits avec stock faible (current_stock < min_stock_level)
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, current_stock, min_stock_level');
      
      if (productsError) throw productsError;
      
      const products = allProducts?.filter(p => p.current_stock < p.min_stock_level) || [];

      // Récupérer les factures impayées
      const { data: invoices, error: invoicesError } = await supabase
        .from('customer_invoices')
        .select('id, total_with_tax, is_paid')
        .eq('is_paid', false);
      
      if (invoicesError) throw invoicesError;

      // Récupérer les tâches de production
      const { data: tasks, error: tasksError } = await supabase
        .from('production_tasks')
        .select('id, status');
      
      if (tasksError) throw tasksError;

      // Calculer les statistiques
      const activeOrders = orders?.filter(o => 
        o.status !== 'delivered' && 
        o.status !== 'cancelled' &&
        o.status !== 'invoiced'
      ).length || 0;

      const productionActive = tasks?.filter(t => 
        t.status === 'in_progress'
      ).length || 0;

      const lowStockCount = products?.length || 0;

      const activeClients = clients?.filter(c => c.is_active).length || 0;

      const thisMonthClients = clients?.filter(c => {
        const createdDate = new Date(c.created_at);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length || 0;

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.paid_amount || 0), 0) || 0;

      const unpaidInvoicesTotal = invoices?.reduce((sum, i) => sum + (i.total_with_tax || 0), 0) || 0;
      const unpaidInvoicesCount = invoices?.length || 0;

      // Statuts de production détaillés
      const productionStatuses = {
        cutting: tasks?.filter(t => t.status === 'pending').length || 0,
        sewing: tasks?.filter(t => t.status === 'in_progress').length || 0,
        finishing: tasks?.filter(t => t.status === 'completed').length || 0,
      };

      return {
        activeOrders,
        productionActive,
        lowStockCount,
        activeClients,
        thisMonthClients,
        totalRevenue,
        unpaidInvoicesCount,
        unpaidInvoicesTotal,
        productionStatuses,
      };
    },
    refetchInterval: 30000, // Actualiser toutes les 30 secondes
  });
};
