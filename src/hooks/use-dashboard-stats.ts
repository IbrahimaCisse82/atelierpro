import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        { data: orders, error: e1 },
        { data: clients, error: e2 },
        { data: allProducts, error: e3 },
        { data: invoices, error: e4 },
        { data: tasks, error: e5 },
      ] = await Promise.all([
        supabase.from('orders').select('id, status, total_amount, paid_amount, due_date'),
        supabase.from('clients').select('id, is_active, created_at'),
        supabase.from('products').select('id, current_stock, min_stock_level'),
        supabase.from('customer_invoices').select('id, total_with_tax, is_paid'),
        supabase.from('production_tasks').select('id, status'),
      ]);

      if (e1) throw e1;

      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const activeOrders = orders?.filter(o =>
        o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'invoiced'
      ).length || 0;

      const urgentDeliveries = orders?.filter(o => {
        if (!o.due_date || o.status === 'delivered' || o.status === 'cancelled') return false;
        return new Date(o.due_date) <= threeDaysFromNow;
      }).length || 0;

      const lowStockCount = allProducts?.filter(p => p.current_stock < p.min_stock_level).length || 0;
      const activeClients = clients?.filter(c => c.is_active).length || 0;

      const thisMonthClients = clients?.filter(c => {
        const d = new Date(c.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length || 0;

      const totalRevenue = orders?.reduce((s, o) => s + (o.paid_amount || 0), 0) || 0;
      const unpaidInvoices = invoices?.filter(i => !i.is_paid) || [];
      const unpaidInvoicesTotal = unpaidInvoices.reduce((s, i) => s + (i.total_with_tax || 0), 0);

      const productionActive = tasks?.filter(t => t.status === 'in_progress').length || 0;

      return {
        activeOrders,
        urgentDeliveries,
        productionActive,
        lowStockCount,
        activeClients,
        thisMonthClients,
        totalRevenue,
        unpaidInvoicesCount: unpaidInvoices.length,
        unpaidInvoicesTotal,
        productionStatuses: {
          cutting: tasks?.filter(t => t.status === 'pending').length || 0,
          sewing: tasks?.filter(t => t.status === 'in_progress').length || 0,
          finishing: tasks?.filter(t => t.status === 'completed').length || 0,
        },
      };
    },
    refetchInterval: 30000,
  });
};
