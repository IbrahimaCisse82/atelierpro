import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/use-orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Search, Filter, Eye, Edit, Scissors, Package, CheckCircle, Clock, 
  AlertTriangle, User, Calendar, DollarSign, ShoppingCart, Download, Trash2, Truck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { Enums } from '@/integrations/supabase/types';

type ProductionStatus = Enums<'production_status'>;

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  order_created: { label: 'Créée', variant: 'outline' },
  waiting_materials: { label: 'Attente matériaux', variant: 'secondary' },
  materials_allocated: { label: 'Matériaux alloués', variant: 'secondary' },
  cutting_in_progress: { label: 'Coupe en cours', variant: 'default' },
  cutting_completed: { label: 'Coupe terminée', variant: 'default' },
  assembly_in_progress: { label: 'Assemblage en cours', variant: 'default' },
  assembly_completed: { label: 'Assemblage terminé', variant: 'default' },
  finishing_in_progress: { label: 'Finition en cours', variant: 'default' },
  quality_check: { label: 'Contrôle qualité', variant: 'secondary' },
  ready_to_deliver: { label: 'Prêt à livrer', variant: 'default' },
  delivered: { label: 'Livré', variant: 'secondary' },
  invoiced: { label: 'Facturé', variant: 'secondary' },
  paid: { label: 'Payé', variant: 'default' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

export function OrdersPage() {
  const { user } = useAuth();
  const { 
    orders, loading, createOrder, updateOrderStatus, updateOrder, 
    deleteOrder, getOrderStats, refetch 
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Formulaire nouvelle commande
  const [newOrder, setNewOrder] = useState({
    order_number: '',
    due_date: '',
    total_amount: 0,
    paid_amount: 0,
    notes: '',
  });

  const stats = getOrderStats();

  // Filtrage
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const readyForDelivery = orders.filter(o => o.status === 'ready_to_deliver');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const invoicedOrders = orders.filter(o => o.status === 'invoiced');

  const handleCreate = async () => {
    if (!newOrder.order_number || !newOrder.due_date) {
      toast({ title: 'Erreur', description: 'Remplissez tous les champs obligatoires.', variant: 'destructive' });
      return;
    }
    try {
      await createOrder({
        order_number: newOrder.order_number,
        due_date: newOrder.due_date,
        total_amount: newOrder.total_amount,
        paid_amount: newOrder.paid_amount,
        notes: newOrder.notes || null,
      });
      setCreateDialogOpen(false);
      setNewOrder({ order_number: '', due_date: '', total_amount: 0, paid_amount: 0, notes: '' });
    } catch {}
  };

  const handleStatusChange = async (orderId: string, newStatus: ProductionStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch {}
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Supprimer cette commande ?')) return;
    try {
      await deleteOrder(orderId);
    } catch {}
  };

  const exportOrders = () => {
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      ['N° Commande', 'Statut', 'Date échéance', 'Montant total', 'Payé', 'Reste'].join(','),
      ...orders.map(o => [
        o.order_number,
        statusLabels[o.status]?.label || o.status,
        o.due_date || '',
        o.total_amount,
        o.paid_amount,
        o.total_amount - o.paid_amount,
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export terminé', description: 'Commandes exportées en CSV.' });
  };

  const getStatusLabel = (status: string) => statusLabels[status] || { label: status, variant: 'outline' as const };

  const getNextStatus = (status: string): ProductionStatus | null => {
    const flow: Record<string, ProductionStatus> = {
      order_created: 'cutting_in_progress',
      cutting_in_progress: 'cutting_completed',
      cutting_completed: 'assembly_in_progress',
      assembly_in_progress: 'assembly_completed',
      assembly_completed: 'finishing_in_progress',
      finishing_in_progress: 'quality_check',
      quality_check: 'ready_to_deliver',
      ready_to_deliver: 'delivered',
      delivered: 'invoiced',
      invoiced: 'paid',
    };
    return flow[status] || null;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p>Chargement des commandes...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">Suivi complet des commandes, livraisons et paiements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportOrders}>
            <Download className="h-4 w-4 mr-2" /> Exporter
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nouvelle commande</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle commande</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>N° Commande *</Label>
                  <Input value={newOrder.order_number} onChange={e => setNewOrder(p => ({ ...p, order_number: e.target.value }))} placeholder="CMD-2026-001" />
                </div>
                <div>
                  <Label>Date d'échéance *</Label>
                  <Input type="date" value={newOrder.due_date} onChange={e => setNewOrder(p => ({ ...p, due_date: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Montant total (FCFA)</Label>
                    <Input type="number" min={0} value={newOrder.total_amount} onChange={e => setNewOrder(p => ({ ...p, total_amount: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label>Avance (FCFA)</Label>
                    <Input type="number" min={0} value={newOrder.paid_amount} onChange={e => setNewOrder(p => ({ ...p, paid_amount: Number(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={newOrder.notes} onChange={e => setNewOrder(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
                  <Button onClick={handleCreate}>Créer</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-2" /> Commandes ({filteredOrders.length})</TabsTrigger>
          <TabsTrigger value="deliveries"><Truck className="h-4 w-4 mr-2" /> Livraisons ({readyForDelivery.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher par numéro..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(statusLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats?.total || 0}</p></div><ShoppingCart className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">En cours</p><p className="text-2xl font-bold">{stats?.active || 0}</p></div><Scissors className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Prêt à livrer</p><p className="text-2xl font-bold">{readyForDelivery.length}</p></div><Package className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Montant total</p><p className="text-2xl font-bold">{formatFCFA(stats?.totalAmount || 0)}</p></div><DollarSign className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
          </div>

          {/* Tableau */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes</CardTitle>
              <CardDescription>Liste des commandes clients</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune commande trouvée</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Commande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Payé</TableHead>
                      <TableHead>Reste</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => {
                      const sl = getStatusLabel(order.status);
                      const next = getNextStatus(order.status);
                      const remaining = order.total_amount - order.paid_amount;
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">{order.order_number}</TableCell>
                          <TableCell><Badge variant={sl.variant}>{sl.label}</Badge></TableCell>
                          <TableCell>{order.due_date ? new Date(order.due_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                          <TableCell>{formatFCFA(order.total_amount)}</TableCell>
                          <TableCell>{formatFCFA(order.paid_amount)}</TableCell>
                          <TableCell className={remaining > 0 ? 'text-destructive font-semibold' : ''}>{formatFCFA(remaining)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {next && (
                                <Button variant="outline" size="sm" onClick={() => handleStatusChange(order.id, next)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {getStatusLabel(next).label}
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Prêt à livrer</p><p className="text-2xl font-bold">{readyForDelivery.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Livrées</p><p className="text-2xl font-bold">{deliveredOrders.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">En attente paiement</p><p className="text-2xl font-bold">{invoicedOrders.length}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commandes prêtes pour livraison</CardTitle>
            </CardHeader>
            <CardContent>
              {readyForDelivery.length === 0 ? (
                <div className="text-center py-8"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucune commande prête</p></div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Échéance</TableHead><TableHead>Montant</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {readyForDelivery.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono">{o.order_number}</TableCell>
                        <TableCell>{o.due_date ? new Date(o.due_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                        <TableCell>{formatFCFA(o.total_amount)}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleStatusChange(o.id, 'delivered')}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Valider livraison
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {deliveredOrders.length > 0 && (
            <Card>
              <CardHeader><CardTitle>En attente de facturation</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Montant</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {deliveredOrders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono">{o.order_number}</TableCell>
                        <TableCell>{formatFCFA(o.total_amount)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(o.id, 'invoiced')}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Facturer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {invoicedOrders.length > 0 && (
            <Card>
              <CardHeader><CardTitle>En attente de paiement</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Reste</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {invoicedOrders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono">{o.order_number}</TableCell>
                        <TableCell>{formatFCFA(o.total_amount - o.paid_amount)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(o.id, 'paid')}>
                            <DollarSign className="h-4 w-4 mr-1" /> Marquer payé
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OrdersPage;
