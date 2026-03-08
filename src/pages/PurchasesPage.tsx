import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Eye, Edit, Trash2, Package, ShoppingCart, DollarSign, Download, CheckCircle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
type Supplier = Database['public']['Tables']['suppliers']['Row'];

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'bg-gray-500' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-500' },
  shipped: { label: 'Expédié', color: 'bg-yellow-500' },
  received: { label: 'Reçu', color: 'bg-green-500' },
  cancelled: { label: 'Annulé', color: 'bg-red-500' },
};

export function PurchasesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('purchases');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ supplier_id: '', order_number: '', expected_delivery: '', notes: '', total_amount: 0 });

  const { data: purchases, loading, refetch } = useSupabaseQuery<PurchaseOrder>('purchase_orders', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: suppliers } = useSupabaseQuery<Supplier>('suppliers', {
    filters: { is_active: true },
    orderBy: { column: 'name', ascending: true }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<PurchaseOrder>('purchase_orders');

  const purchasesList = purchases || [];
  const suppliersList = suppliers || [];

  const getSupplierName = (id: string | null) => {
    if (!id) return '-';
    return suppliersList.find(s => s.id === id)?.name || '-';
  };

  const getStatusInfo = (status: string) => statusLabels[status] || { label: status, color: 'bg-gray-500' };

  const filtered = purchasesList.filter(p => {
    const supplierName = getSupplierName(p.supplier_id).toLowerCase();
    const matchesSearch = supplierName.includes(searchTerm.toLowerCase()) || p.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingDeliveries = purchasesList.filter(p => p.status === 'ordered' || p.status === 'in_transit');

  const handleCreatePurchase = async () => {
    if (!newOrder.order_number || !newOrder.supplier_id) {
      toast({ title: "Erreur", description: "N° de commande et fournisseur obligatoires.", variant: "destructive" });
      return;
    }
    try {
      await create({
        order_number: newOrder.order_number,
        supplier_id: newOrder.supplier_id,
        expected_delivery: newOrder.expected_delivery || null,
        notes: newOrder.notes || null,
        total_amount: newOrder.total_amount || 0,
        status: 'draft' as any,
      } as any);
      toast({ title: "Succès", description: "Achat créé." });
      setIsCreateDialogOpen(false);
      setNewOrder({ supplier_id: '', order_number: '', expected_delivery: '', notes: '', total_amount: 0 });
      refetch();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await update(id, { status } as any);
      toast({ title: "Succès", description: "Statut mis à jour." });
      refetch();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet achat ?')) return;
    try {
      await remove(id);
      toast({ title: "Succès", description: "Achat supprimé." });
      refetch();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleExport = () => {
    const csv = [
      ['N°', 'Fournisseur', 'Statut', 'Montant', 'Livraison prévue'],
      ...purchasesList.map(p => [p.order_number, getSupplierName(p.supplier_id), p.status, String(p.total_amount), p.expected_delivery || ''])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `achats_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export terminé" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Achats</h1>
          <p className="text-muted-foreground">Commandes fournisseurs et réceptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Exporter</Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouvel achat</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer un achat</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>N° commande *</Label><Input value={newOrder.order_number} onChange={e => setNewOrder(p => ({ ...p, order_number: e.target.value }))} placeholder="PO-001" /></div>
                <div>
                  <Label>Fournisseur *</Label>
                  <Select value={newOrder.supplier_id} onValueChange={v => setNewOrder(p => ({ ...p, supplier_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{suppliersList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Montant total</Label><Input type="number" value={newOrder.total_amount || ''} onChange={e => setNewOrder(p => ({ ...p, total_amount: Number(e.target.value) }))} /></div>
                <div><Label>Date livraison prévue</Label><Input type="date" value={newOrder.expected_delivery} onChange={e => setNewOrder(p => ({ ...p, expected_delivery: e.target.value }))} /></div>
                <div><Label>Notes</Label><Input value={newOrder.notes} onChange={e => setNewOrder(p => ({ ...p, notes: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreatePurchase}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total achats</p><p className="text-2xl font-bold">{purchasesList.length}</p></div><ShoppingCart className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Montant total</p><p className="text-2xl font-bold">{formatFCFA(purchasesList.reduce((s, p) => s + Number(p.total_amount), 0))}</p></div><DollarSign className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Brouillons</p><p className="text-2xl font-bold">{purchasesList.filter(p => p.status === 'draft').length}</p></div><Package className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases"><ShoppingCart className="h-4 w-4 mr-1" />Achats</TabsTrigger>
          <TabsTrigger value="deliveries"><Truck className="h-4 w-4 mr-1" />Livraisons ({pendingDeliveries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Achats</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Livraison</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(purchase => {
                    const si = getStatusInfo(purchase.status);
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-mono">{purchase.order_number}</TableCell>
                        <TableCell>{getSupplierName(purchase.supplier_id)}</TableCell>
                        <TableCell><Badge className={si.color}>{si.label}</Badge></TableCell>
                        <TableCell>{formatFCFA(Number(purchase.total_amount))}</TableCell>
                        <TableCell>{purchase.expected_delivery ? new Date(purchase.expected_delivery).toLocaleDateString('fr-FR') : '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {purchase.status === 'draft' && (
                              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(purchase.id, 'confirmed')}>
                                <CheckCircle className="h-4 w-4 mr-1" />Valider
                              </Button>
                            )}
                            {(purchase.status === 'confirmed' || purchase.status === 'shipped') && (
                              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(purchase.id, 'received')}>
                                <Truck className="h-4 w-4 mr-1" />Réceptionner
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(purchase.id)}><Trash2 className="h-4 w-4" /></Button>
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
          <Card>
            <CardHeader><CardTitle>Livraisons en attente</CardTitle><CardDescription>Achats confirmés en attente de réception</CardDescription></CardHeader>
            <CardContent>
              {pendingDeliveries.length === 0 ? (
                <div className="text-center py-8"><Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucune livraison en attente</p></div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Livraison prévue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDeliveries.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.order_number}</TableCell>
                      <TableCell>{getSupplierName(p.supplier_id)}</TableCell>
                      <TableCell>{formatFCFA(Number(p.total_amount))}</TableCell>
                      <TableCell>{p.expected_delivery ? new Date(p.expected_delivery).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      <TableCell>
                        <Button variant="default" size="sm" onClick={() => handleUpdateStatus(p.id, 'received')}>
                          <CheckCircle className="h-4 w-4 mr-1" />Réceptionner
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PurchasesPage;
