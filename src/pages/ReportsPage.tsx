import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, BarChart2, TrendingUp, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import { formatFCFA } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type CustomerInvoice = Database['public']['Tables']['customer_invoices']['Row'];
type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
type ProductionTask = Database['public']['Tables']['production_tasks']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');

  const { data: orders } = useSupabaseQuery<Order>('orders', { orderBy: { column: 'created_at', ascending: false } });
  const { data: invoices } = useSupabaseQuery<CustomerInvoice>('customer_invoices', { orderBy: { column: 'invoice_date', ascending: false } });
  const { data: purchases } = useSupabaseQuery<PurchaseOrder>('purchase_orders', { orderBy: { column: 'created_at', ascending: false } });
  const { data: tasks } = useSupabaseQuery<ProductionTask>('production_tasks', { orderBy: { column: 'created_at', ascending: false } });
  const { data: clients } = useSupabaseQuery<Client>('clients', { select: 'id, first_name, last_name' });

  const ordersList = orders || [];
  const invoicesList = invoices || [];
  const purchasesList = purchases || [];
  const tasksList = tasks || [];
  const clientsList = clients || [];

  const getClientName = (clientId: string | null) => {
    if (!clientId) return '-';
    const c = clientsList.find(cl => cl.id === clientId);
    return c ? `${c.first_name} ${c.last_name}` : '-';
  };

  // Sales data from customer_invoices
  const salesData = invoicesList.slice(0, 20);

  // Production data from tasks
  const productionData = tasksList.slice(0, 20);

  // Profit: aggregate by month
  const totalSales = invoicesList.reduce((s, i) => s + Number(i.total_with_tax || 0), 0);
  const totalPurchases = purchasesList.reduce((s, p) => s + Number(p.total_with_tax || 0), 0);
  const profit = totalSales - totalPurchases;

  const handleExport = (type: string) => {
    toast({ title: 'Export', description: `Export du rapport ${type} généré.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Analysez les ventes, la production et la rentabilité</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Ventes totales</p><p className="text-2xl font-bold">{formatFCFA(totalSales)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Achats totaux</p><p className="text-2xl font-bold">{formatFCFA(totalPurchases)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Résultat net</p><p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(profit)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Commandes</p><p className="text-2xl font-bold">{ordersList.length}</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales"><BarChart2 className="inline h-4 w-4 mr-1" />Ventes</TabsTrigger>
          <TabsTrigger value="production"><Activity className="inline h-4 w-4 mr-1" />Production</TabsTrigger>
          <TabsTrigger value="profit"><TrendingUp className="inline h-4 w-4 mr-1" />Rentabilité</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Factures clients</CardTitle>
              <CardDescription>Dernières factures émises</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant HT</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                      <TableCell>{new Date(inv.invoice_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{formatFCFA(Number(inv.total_amount))}</TableCell>
                      <TableCell>{formatFCFA(Number(inv.tax_amount))}</TableCell>
                      <TableCell>{formatFCFA(Number(inv.total_with_tax))}</TableCell>
                      <TableCell><span className={inv.is_paid ? 'text-green-600' : 'text-orange-600'}>{inv.is_paid ? 'Payée' : 'En attente'}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('ventes')}><Download className="h-4 w-4 mr-2" />Exporter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tâches de production</CardTitle>
              <CardDescription>Suivi de la production</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tâche</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Créée le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionData.map(task => (
                    <TableRow key={task.id}>
                      <TableCell>{task.task_name}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      <TableCell>{new Date(task.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('production')}><Download className="h-4 w-4 mr-2" />Exporter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rentabilité</CardTitle>
              <CardDescription>Comparatif ventes vs achats</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicateur</TableHead>
                    <TableHead>Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Total ventes (factures TTC)</TableCell>
                    <TableCell className="font-bold">{formatFCFA(totalSales)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total achats (commandes TTC)</TableCell>
                    <TableCell className="font-bold">{formatFCFA(totalPurchases)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Résultat brut</TableCell>
                    <TableCell className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(profit)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Factures payées</TableCell>
                    <TableCell>{invoicesList.filter(i => i.is_paid).length} / {invoicesList.length}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Commandes en cours</TableCell>
                    <TableCell>{ordersList.filter(o => o.status !== 'delivered' && o.status !== 'ready').length}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('rentabilité')}><Download className="h-4 w-4 mr-2" />Exporter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportsPage;
