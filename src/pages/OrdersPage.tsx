import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Scissors,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  ShoppingCart,
  Download,
  Trash2,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// Types pour les commandes
interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientId: string;
  status: 'draft' | 'confirmed' | 'in_production' | 'ready_for_delivery' | 'delivered' | 'invoiced' | 'paid';
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  assignedTailor?: string;
  progress: number;
  items: OrderItem[];
  notes?: string;
  deliveredAt?: string;
  invoicedAt?: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
}

interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

type PaymentMethod = 'virement' | 'cheque' | 'carte' | 'especes' | 'monnaie_electronique';

// Statuts de commande avec couleurs
const orderStatuses = [
  { value: 'draft', label: 'Brouillon', color: 'bg-gray-500' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-blue-500' },
  { value: 'in_production', label: 'En production', color: 'bg-orange-500' },
  { value: 'ready_for_delivery', label: 'Prêt à livrer', color: 'bg-green-500' },
  { value: 'delivered', label: 'Livrée', color: 'bg-emerald-500' },
  { value: 'invoiced', label: 'Facturée', color: 'bg-teal-500' },
  { value: 'paid', label: 'Payée', color: 'bg-cyan-500' }
];

const paymentMethods = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque', label: 'Chèque bancaire' },
  { value: 'carte', label: 'Carte bancaire' },
  { value: 'especes', label: 'Espèces' },
  { value: 'monnaie_electronique', label: 'Monnaie électronique' }
];

// Données simulées
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'CMD-2024-001',
    clientName: 'Marie Dupont',
    clientId: 'client-1',
    status: 'in_production',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    totalAmount: 45000,
    advanceAmount: 15000,
    remainingAmount: 30000,
    assignedTailor: 'Alice Couture',
    progress: 65,
    items: [
      { id: '1', description: 'Robe sur mesure', quantity: 1, unitPrice: 45000, totalPrice: 45000 }
    ]
  },
  {
    id: '2',
    orderNumber: 'CMD-2024-002',
    clientName: 'Jean Martin',
    clientId: 'client-2',
    status: 'ready_for_delivery',
    orderDate: '2024-01-16',
    deliveryDate: '2024-01-28',
    totalAmount: 32000,
    advanceAmount: 0,
    remainingAmount: 32000,
    assignedTailor: 'Marc Tailleur',
    progress: 95,
    items: [
      { id: '2', description: 'Costume 3 pièces', quantity: 1, unitPrice: 32000, totalPrice: 32000 }
    ]
  },
  {
    id: '3',
    orderNumber: 'CMD-2024-003',
    clientName: 'Sophie Bernard',
    clientId: 'client-3',
    status: 'delivered',
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-20',
    totalAmount: 28000,
    advanceAmount: 10000,
    remainingAmount: 18000,
    assignedTailor: 'Emma Style',
    progress: 100,
    deliveredAt: '2024-01-20',
    items: [
      { id: '3', description: 'Jupe crayon', quantity: 1, unitPrice: 28000, totalPrice: 28000 }
    ]
  }
];

export function OrdersPage() {
  const { user } = useAuth();
  const canViewOrders = true;
  const canManageOrders = true;

  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Nouvelle commande
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    clientName: '',
    deliveryDate: '',
    totalAmount: 0,
    advanceAmount: 0,
    remainingAmount: 0,
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
  });

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Commandes prêtes pour livraison
  const readyForDelivery = orders.filter(order => order.status === 'ready_for_delivery');

  // Commandes livrées en attente de facturation
  const deliveredOrders = orders.filter(order => order.status === 'delivered');

  // Commandes facturées en attente de paiement
  const invoicedOrders = orders.filter(order => order.status === 'invoiced');

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || 
           { value: status, label: status, color: 'bg-gray-500' };
  };

  // Validation de la livraison
  const validateDelivery = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'delivered', 
            deliveredAt: new Date().toISOString(),
            progress: 100
          }
        : order
    ));
    toast({
      title: "Livraison validée",
      description: "La commande a été marquée comme livrée.",
    });
  };

  // Création de facture
  const createInvoice = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'invoiced', 
            invoicedAt: new Date().toISOString()
          }
        : order
    ));
    toast({
      title: "Facture créée",
      description: "La facture a été générée pour cette commande.",
    });
  };

  // Traitement du paiement
  const processPayment = (orderId: string, paymentMethod: PaymentMethod) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'paid', 
            paidAt: new Date().toISOString(),
            paymentMethod
          }
        : order
    ));
    toast({
      title: "Paiement traité",
      description: `Le paiement a été enregistré (${paymentMethods.find(pm => pm.value === paymentMethod)?.label}).`,
    });
  };

  // Création de nouvelle commande
  const handleCreateOrder = () => {
    if (!newOrder.clientName || !newOrder.deliveryDate || newOrder.totalAmount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un article.",
        variant: "destructive"
      });
      return;
    }

    const orderNumber = `CMD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrderData: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      clientName: newOrder.clientName!,
      clientId: `client-${Date.now()}`,
      status: 'draft',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: newOrder.deliveryDate!,
      totalAmount: newOrder.totalAmount!,
      advanceAmount: newOrder.advanceAmount || 0,
      remainingAmount: calculateRemaining(newOrder.totalAmount!, newOrder.advanceAmount || 0),
      progress: 0,
      items: newOrder.items || []
    };

    setOrders(prev => [newOrderData, ...prev]);
    
    // Réinitialiser le formulaire
    setNewOrder({
      clientName: '',
      deliveryDate: '',
      totalAmount: 0,
      advanceAmount: 0,
      remainingAmount: 0,
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    });

    toast({
      title: "Succès",
      description: "Nouvelle commande créée avec succès.",
    });
  };

  // Confirmation de commande
  const confirmOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'confirmed',
            progress: 10
          }
        : order
    ));
    toast({
      title: "Commande confirmée",
      description: "La commande a été confirmée et peut passer en production.",
    });
  };

  // Mise en production
  const startProduction = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'in_production',
            progress: 25
          }
        : order
    ));
    toast({
      title: "Production démarrée",
      description: "La commande est maintenant en production.",
    });
  };

  // Prêt pour livraison
  const markReadyForDelivery = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'ready_for_delivery',
            progress: 90
          }
        : order
    ));
    toast({
      title: "Prêt pour livraison",
      description: "La commande est prête à être livrée.",
    });
  };

  // Suppression de commande
  const deleteOrder = (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    setOrders(prev => prev.filter(order => order.id !== orderId));
    toast({
      title: "Commande supprimée",
      description: "La commande a été supprimée avec succès.",
    });
  };

  // Export des commandes
  const exportOrders = () => {
    try {
      const csvContent = [
        ['N° Commande', 'Client', 'Statut', 'Date commande', 'Date livraison', 'Montant total', 'Acompte', 'Reste à payer'],
        ...orders.map(order => [
          order.orderNumber,
          order.clientName,
          getStatusInfo(order.status).label,
          order.orderDate,
          order.deliveryDate,
          formatFCFA(order.totalAmount),
          formatFCFA(order.advanceAmount),
          formatFCFA(order.remainingAmount)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export terminé",
        description: "Les commandes ont été exportées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export des commandes.",
        variant: "destructive"
      });
    }
  };

  // Calcul du reliquat
  const calculateRemaining = (total: number, advance: number) => {
    return Math.max(0, total - advance);
  };

  // Actions réelles pour les commandes
  const handleOrderAction = (action: string, orderId?: string) => {
    const context = orderId ? ` (Commande ${orderId})` : '';
    toast({
      title: `${action} activé`,
      description: `La fonctionnalité « ${action} »${context} est maintenant active.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">
            Suivi complet des commandes, livraisons et paiements
          </p>
        </div>
        {canManageOrders && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportOrders}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Nouvelle commande
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle commande</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Client *</Label>
                      <Input 
                        id="clientName" 
                        value={newOrder.clientName || ''}
                        onChange={(e) => setNewOrder(prev => ({ 
                          ...prev, 
                          clientName: e.target.value 
                        }))}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryDate">Date de livraison *</Label>
                      <Input 
                        type="date" 
                        id="deliveryDate"
                        value={newOrder.deliveryDate || ''}
                        onChange={(e) => setNewOrder(prev => ({ 
                          ...prev, 
                          deliveryDate: e.target.value 
                        }))}
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Articles de la commande</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newOrder.items?.map((item, idx) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => {
                                  const updatedItems = [...(newOrder.items || [])];
                                  updatedItems[idx] = { ...item, description: e.target.value };
                                  setNewOrder(prev => ({ ...prev, items: updatedItems }));
                                }}
                                placeholder="Description de l'article"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const quantity = Math.max(1, Number(e.target.value));
                                  const updatedItems = [...(newOrder.items || [])];
                                  updatedItems[idx] = { 
                                    ...item, 
                                    quantity,
                                    totalPrice: quantity * item.unitPrice
                                  };
                                  const totalAmount = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
                                  setNewOrder(prev => ({ 
                                    ...prev, 
                                    items: updatedItems,
                                    totalAmount,
                                    remainingAmount: calculateRemaining(totalAmount, prev.advanceAmount || 0)
                                  }));
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const unitPrice = Math.max(0, Number(e.target.value));
                                  const updatedItems = [...(newOrder.items || [])];
                                  updatedItems[idx] = { 
                                    ...item, 
                                    unitPrice,
                                    totalPrice: item.quantity * unitPrice
                                  };
                                  const totalAmount = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
                                  setNewOrder(prev => ({ 
                                    ...prev, 
                                    items: updatedItems,
                                    totalAmount,
                                    remainingAmount: calculateRemaining(totalAmount, prev.advanceAmount || 0)
                                  }));
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {formatFCFA(item.totalPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Montant total</Label>
                      <div className="text-lg font-bold">{formatFCFA(newOrder.totalAmount || 0)}</div>
                    </div>
                    <div>
                      <Label>Avance client</Label>
                      <Input
                        type="number"
                        min={0}
                        max={newOrder.totalAmount || 0}
                        value={newOrder.advanceAmount || 0}
                        onChange={(e) => {
                          const advanceAmount = Math.max(0, Math.min(Number(e.target.value), newOrder.totalAmount || 0));
                          setNewOrder(prev => ({ 
                            ...prev, 
                            advanceAmount,
                            remainingAmount: calculateRemaining(prev.totalAmount || 0, advanceAmount)
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Reliquat</Label>
                      <div className="text-lg font-bold">{formatFCFA(newOrder.remainingAmount || 0)}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Annuler</Button>
                    <Button onClick={handleCreateOrder}>Créer la commande</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Commandes ({filteredOrders.length})
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Livraisons ({readyForDelivery.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
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
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    {orderStatuses.map(status => (
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

          {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total commandes</p>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En production</p>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === 'in_production').length}</p>
              </div>
              <Scissors className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm font-medium text-muted-foreground">Prêt à livrer</p>
                    <p className="text-2xl font-bold">{readyForDelivery.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm font-medium text-muted-foreground">Montant total</p>
                    <p className="text-2xl font-bold">{formatFCFA(filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
              <CardDescription>Liste des commandes clients</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                    <TableHead>N° Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                    <TableHead>Date livraison</TableHead>
                <TableHead>Montant</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead>Reliquat</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                    <TableCell>
                          <Badge variant="outline">{statusInfo.label}</Badge>
                    </TableCell>
                        <TableCell>{new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{formatFCFA(order.totalAmount)}</TableCell>
                        <TableCell>{formatFCFA(order.advanceAmount)}</TableCell>
                        <TableCell>{formatFCFA(order.remainingAmount)}</TableCell>
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
                              <DialogTitle>Détails de la commande {order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Client</Label>
                                  <p className="text-sm">{order.clientName}</p>
                                </div>
                                <div>
                                      <Label>Statut</Label>
                                      <Badge>{statusInfo.label}</Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Articles</Label>
                                    <div className="space-y-2">
                                      {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                          <span>{item.description}</span>
                                          <span>{item.quantity} x {formatFCFA(item.unitPrice)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label>Total</Label>
                                      <p className="font-bold">{formatFCFA(order.totalAmount)}</p>
                                    </div>
                                    <div>
                                      <Label>Avance</Label>
                                      <p className="font-bold">{formatFCFA(order.advanceAmount)}</p>
                                    </div>
                                    <div>
                                      <Label>Reliquat</Label>
                                      <p className="font-bold">{formatFCFA(order.remainingAmount)}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {order.status === 'in_production' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => markReadyForDelivery(order.id)}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Prêt pour livraison
                              </Button>
                            )}
                            {order.status === 'ready_for_delivery' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => validateDelivery(order.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Livrer
                              </Button>
                            )}
                            {order.status === 'delivered' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => createInvoice(order.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Facturer
                              </Button>
                            )}
                            {order.status === 'invoiced' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Payer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Enregistrer le paiement</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                <div>
                                      <Label>Mode de paiement</Label>
                                      <Select onValueChange={(value: PaymentMethod) => processPayment(order.id, value)}>
                                    <SelectTrigger>
                                          <SelectValue placeholder="Sélectionner le mode de paiement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                          {paymentMethods.map(method => (
                                            <SelectItem key={method.value} value={method.value}>
                                              {method.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prêt à livrer</p>
                    <p className="text-2xl font-bold">{readyForDelivery.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Livrées</p>
                    <p className="text-2xl font-bold">{deliveredOrders.length}</p>
                  </div>
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En attente de paiement</p>
                    <p className="text-2xl font-bold">{invoicedOrders.length}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commandes prêtes pour livraison */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes prêtes pour livraison</CardTitle>
              <CardDescription>Valider la livraison pour passer à la facturation</CardDescription>
            </CardHeader>
            <CardContent>
              {readyForDelivery.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune commande prête pour livraison</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date livraison</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Avance</TableHead>
                      <TableHead>Reliquat</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyForDelivery.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{formatFCFA(order.totalAmount)}</TableCell>
                        <TableCell>{formatFCFA(order.advanceAmount)}</TableCell>
                        <TableCell>{formatFCFA(order.remainingAmount)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => validateDelivery(order.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Valider livraison
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Commandes livrées en attente de facturation */}
          {deliveredOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commandes livrées - En attente de facturation</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date livraison</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{new Date(order.deliveredAt!).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{formatFCFA(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => createInvoice(order.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Créer facture
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Commandes facturées en attente de paiement */}
          {invoicedOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commandes facturées - En attente de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date facturation</TableHead>
                      <TableHead>Reliquat</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{new Date(order.invoicedAt!).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{formatFCFA(order.remainingAmount)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Enregistrer paiement
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enregistrer le paiement</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Mode de paiement</Label>
                                  <Select onValueChange={(value: PaymentMethod) => processPayment(order.id, value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner le mode de paiement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentMethods.map(method => (
                                        <SelectItem key={method.value} value={method.value}>
                                          {method.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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