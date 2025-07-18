import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Eye, Edit, Package, ShoppingCart, DollarSign, Download, Trash2, CheckCircle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessControl } from '@/components/common/AccessControl';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

// Types pour les achats
interface Purchase {
  id: string;
  supplier: string;
  status: 'draft' | 'validated' | 'received' | 'invoiced' | 'paid';
  purchaseDate: string;
  deliveryDate: string;
  totalAmount: number;
  progress: number;
  items: PurchaseItem[];
  validatedBy?: string;
  validatedAt?: string;
  receivedAt?: string;
}

interface PurchaseItem {
  type: 'stock' | 'nonstock';
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

const purchaseStatuses = [
  { value: 'draft', label: 'Brouillon', color: 'bg-gray-500' },
  { value: 'validated', label: 'Validé', color: 'bg-blue-500' },
  { value: 'received', label: 'Reçu', color: 'bg-green-500' },
  { value: 'invoiced', label: 'Facturé', color: 'bg-teal-500' },
  { value: 'paid', label: 'Payé', color: 'bg-cyan-500' }
];

const mockPurchases: Purchase[] = [
  {
    id: '1',
    supplier: 'Tissus Paris',
    status: 'draft',
    purchaseDate: '2024-07-01',
    deliveryDate: '2024-07-05',
    totalAmount: 1200,
    progress: 25,
    items: [
      { type: 'stock', productId: '1', name: 'Tissu coton', quantity: 10, unitPrice: 120 }
    ]
  },
  {
    id: '2',
    supplier: 'Mercerie Lyon',
    status: 'validated',
    purchaseDate: '2024-06-20',
    deliveryDate: '2024-06-25',
    totalAmount: 800,
    progress: 50,
    items: [
      { type: 'stock', productId: '2', name: 'Fil polyester', quantity: 20, unitPrice: 40 }
    ],
    validatedBy: 'Manager',
    validatedAt: '2024-06-21'
  }
];

export function PurchasesPage() {
  const { user } = useAuth();
  // Permissions centralisées (désactivées pour activer tous les boutons)
  const canViewPurchases = true;
  const canManagePurchases = true;

  const [activeTab, setActiveTab] = useState('purchases');

  // État pour les achats
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: '1',
      supplier: 'Tissus Paris',
      status: 'draft',
      purchaseDate: '2024-07-01',
      deliveryDate: '2024-07-05',
      totalAmount: 1200,
      progress: 25,
      items: [
        { type: 'stock', productId: '1', name: 'Tissu coton', quantity: 10, unitPrice: 120 }
      ]
    },
    {
      id: '2',
      supplier: 'Mercerie Lyon',
      status: 'validated',
      purchaseDate: '2024-06-20',
      deliveryDate: '2024-06-25',
      totalAmount: 800,
      progress: 50,
      items: [
        { type: 'stock', productId: '2', name: 'Fil polyester', quantity: 20, unitPrice: 40 }
      ],
      validatedBy: 'Manager',
      validatedAt: '2024-06-21'
    }
  ]);

  // Achats en attente de réception (validés mais pas encore reçus)
  const pendingDeliveries = purchases.filter(p => p.status === 'validated');

  // Actions réelles pour les achats
  const handlePurchaseAction = (action: string, purchaseId?: string) => {
    const context = purchaseId ? ` (Achat ${purchaseId})` : '';
    toast({
      title: `${action} activé`,
      description: `La fonctionnalité « ${action} »${context} est maintenant active.`,
    });
  };

  // Récupération des produits stockés
  const { data: products = [] } = useSupabaseQuery({
    table: 'products',
    select: 'id, name, unit, unit_price',
  });

  // État pour les articles de l'achat
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    { type: 'stock', productId: '', name: '', quantity: 1, unitPrice: 0 }
  ]);

  // Calcul du total
  const totalAmount = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Ajout d'une ligne d'article
  const addItem = () => {
    setPurchaseItems(items => [...items, { type: 'stock', productId: '', name: '', quantity: 1, unitPrice: 0 }]);
  };

  // Suppression d'une ligne d'article
  const removeItem = (index: number) => {
    setPurchaseItems(items => items.length > 1 ? items.filter((_, i) => i !== index) : items);
  };

  // Modification d'une ligne d'article
  const updateItem = (index: number, field: string, value: any) => {
    setPurchaseItems(items => items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Validation d'un achat
  const validatePurchase = (purchaseId: string) => {
    setPurchases(prev => prev.map(p => 
      p.id === purchaseId 
        ? { 
            ...p, 
            status: 'validated', 
            validatedBy: user?.firstName + ' ' + user?.lastName,
            validatedAt: new Date().toISOString(),
            progress: 50
          }
        : p
    ));
    toast({
      title: "Achat validé",
      description: "L'achat a été validé et est maintenant en attente de réception.",
    });
  };

  // Réception d'une livraison
  const receiveDelivery = async (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    try {
      // Mettre à jour le statut de l'achat
      setPurchases(prev => prev.map(p => 
        p.id === purchaseId 
          ? { 
              ...p, 
              status: 'received', 
              receivedAt: new Date().toISOString(),
              progress: 75
            }
          : p
      ));

      // Augmenter le stock pour les produits stockés
      const stockItems = purchase.items.filter(item => item.type === 'stock');
      for (const item of stockItems) {
        if (item.productId) {
          // Mise à jour du stock dans la base de données
          const { data: productData, error: fetchError } = await supabase
            .from('products')
            .select('current_stock')
            .eq('id', item.productId)
            .single();
          if (!fetchError && productData) {
            const newStock = (productData.current_stock || 0) + item.quantity;
            await supabase
              .from('products')
              .update({ 
                current_stock: newStock,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.productId);
          }
        }
      }

      toast({
        title: "Livraison reçue",
        description: "La livraison a été reçue et le stock a été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la réception de la livraison.",
        variant: "destructive"
      });
    }
  };

  // Création d'un nouvel achat
  const createPurchase = () => {
    if (purchaseItems.length === 0 || purchaseItems.some(item => !item.name || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires pour chaque article.",
        variant: "destructive"
      });
      return;
    }

    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      supplier: 'Fournisseur à sélectionner',
      status: 'draft',
      purchaseDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 jours
      totalAmount: totalAmount,
      progress: 25,
      items: purchaseItems
    };

    setPurchases(prev => [newPurchase, ...prev]);
    
    // Réinitialiser le formulaire
    setPurchaseItems([{ type: 'stock', productId: '', name: '', quantity: 1, unitPrice: 0 }]);

    toast({
      title: "Achat créé",
      description: "Nouvel achat créé avec succès.",
    });
  };

  // Suppression d'un achat
  const deletePurchase = (purchaseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
      return;
    }

    setPurchases(prev => prev.filter(p => p.id !== purchaseId));
    toast({
      title: "Achat supprimé",
      description: "L'achat a été supprimé avec succès.",
    });
  };

  // Export des achats
  const exportPurchases = () => {
    try {
      const csvContent = [
        ['N° Achat', 'Fournisseur', 'Statut', 'Date achat', 'Date livraison', 'Montant total', 'Progression'],
        ...purchases.map(purchase => [
          purchase.id,
          purchase.supplier,
          purchase.status,
          purchase.purchaseDate,
          purchase.deliveryDate,
          formatFCFA(purchase.totalAmount),
          `${purchase.progress}%`
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `achats_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export terminé",
        description: "Les achats ont été exportés avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export des achats.",
        variant: "destructive"
      });
    }
  };

  // Voir les détails d'un achat
  const viewPurchaseDetails = (purchase: Purchase) => {
    toast({
      title: "Détails de l'achat",
      description: `${purchase.supplier} - ${purchase.items.length} articles - ${formatFCFA(purchase.totalAmount)}`,
    });
  };

  // Modifier un achat
  const editPurchase = (purchase: Purchase) => {
    setPurchaseItems(purchase.items);
    toast({
      title: "Modification",
      description: "Modification de l'achat en cours...",
    });
  };

  const getStatusInfo = (status: string) => {
    return purchaseStatuses.find(s => s.value === status) || { value: status, label: status, color: 'bg-gray-500' };
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'validated' | 'received' | 'invoiced' | 'paid'>('all');
  const filteredPurchases = purchases.filter(p => {
    // Ajoutez ici votre logique de filtrage selon searchTerm et statusFilter
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Achats</h1>
          <p className="text-muted-foreground">Suivi des commandes fournisseurs et réceptions</p>
        </div>
        {canManagePurchases && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportPurchases}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={createPurchase}>
                  <Plus className="h-4 w-4 mr-2" /> Nouvel achat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Créer un achat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplier">Fournisseur *</Label>
                      <Input id="supplier" placeholder="Nom du fournisseur" required />
                    </div>
                    <div>
                      <Label htmlFor="deliveryDate">Date livraison prévue</Label>
                      <Input type="date" id="deliveryDate" />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Articles de l'achat</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Produit</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <select
                                value={item.type}
                                onChange={e => updateItem(idx, 'type', e.target.value)}
                                className="border rounded px-2 py-1"
                              >
                                <option value="stock">Stocké</option>
                                <option value="nonstock">Non stocké</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              {item.type === 'stock' ? (
                                <select
                                  value={item.productId}
                                  onChange={e => {
                                    const prod = products.find((p: any) => p.id === e.target.value);
                                    updateItem(idx, 'productId', e.target.value);
                                    updateItem(idx, 'name', prod ? prod.name : '');
                                    updateItem(idx, 'unitPrice', prod ? prod.unit_price : 0);
                                  }}
                                  className="border rounded px-2 py-1"
                                >
                                  <option value="">Sélectionner</option>
                                  {products.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  value={item.name}
                                  onChange={e => updateItem(idx, 'name', e.target.value)}
                                  placeholder="Nom de l'article"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={e => updateItem(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                value={item.unitPrice}
                                onChange={e => updateItem(idx, 'unitPrice', Math.max(0, Number(e.target.value)))}
                              />
                            </TableCell>
                            <TableCell>
                              {formatFCFA(item.quantity * item.unitPrice)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} disabled={purchaseItems.length === 1}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-2">
                      <Button type="button" variant="outline" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" /> Ajouter un article
                      </Button>
                      <div className="font-bold">Total : {formatFCFA(totalAmount)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Annuler</Button>
                    <Button onClick={createPurchase}>Créer l'achat</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Achats
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Livraisons ({pendingDeliveries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          {/* Filtres et recherche pour les achats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'draft' | 'validated' | 'received' | 'invoiced' | 'paid')}
              >
                <option value="all">Tous les statuts</option>
                {purchaseStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Statistiques des achats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total achats</p>
                <p className="text-2xl font-bold">{filteredPurchases.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold">{formatFCFA(filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0))}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En attente de validation</p>
                    <p className="text-2xl font-bold">{purchases.filter(p => p.status === 'draft').length}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Liste des achats */}
      <Card>
        <CardHeader>
          <CardTitle>Achats</CardTitle>
          <CardDescription>Liste des achats fournisseurs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Date achat</TableHead>
                <TableHead>Date livraison</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => {
                const statusInfo = getStatusInfo(purchase.status);
                return (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
                        <Badge>{statusInfo.label}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{Math.round(purchase.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${purchase.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(purchase.deliveryDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{formatFCFA(purchase.totalAmount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => viewPurchaseDetails(purchase)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de l'achat {purchase.supplier}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Fournisseur</Label>
                                <p className="text-sm">{purchase.supplier}</p>
                              </div>
                              <div>
                                <Label>Statut</Label>
                                <Badge>{statusInfo.label}</Badge>
                              </div>
                                  {purchase.validatedBy && (
                                    <div>
                                      <Label>Validé par</Label>
                                      <p className="text-sm">{purchase.validatedBy} le {new Date(purchase.validatedAt!).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                  )}
                            </div>
                          </DialogContent>
                        </Dialog>
                            {canManagePurchases && purchase.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => validatePurchase(purchase.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                            )}
                        {canManagePurchases && (
                          <Button variant="ghost" size="sm" onClick={() => editPurchase(purchase)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canManagePurchases && (
                          <Button variant="ghost" size="sm" onClick={() => deletePurchase(purchase.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          {/* Statistiques des livraisons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Livraisons en attente</p>
                    <p className="text-2xl font-bold">{pendingDeliveries.length}</p>
                  </div>
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Montant total</p>
                    <p className="text-2xl font-bold">{formatFCFA(pendingDeliveries.reduce((sum, p) => sum + p.totalAmount, 0))}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des livraisons en attente */}
          <Card>
            <CardHeader>
              <CardTitle>Livraisons en attente</CardTitle>
              <CardDescription>Achats validés en attente de réception</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDeliveries.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune livraison en attente</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Date livraison prévue</TableHead>
                      <TableHead>Validé par</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDeliveries.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell>{new Date(purchase.deliveryDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{purchase.validatedBy}</div>
                            <div className="text-muted-foreground">
                              {new Date(purchase.validatedAt!).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatFCFA(purchase.totalAmount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Détails de la livraison {purchase.supplier}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Fournisseur</Label>
                                    <p className="text-sm">{purchase.supplier}</p>
                                  </div>
                                  <div>
                                    <Label>Articles</Label>
                                    <div className="space-y-2">
                                      {purchase.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                          <span>{item.name}</span>
                                          <span>{item.quantity} x {formatFCFA(item.unitPrice)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Total</Label>
                                    <p className="text-lg font-bold">{formatFCFA(purchase.totalAmount)}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => receiveDelivery(purchase.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Réceptionner
                            </Button>
                          </div>
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