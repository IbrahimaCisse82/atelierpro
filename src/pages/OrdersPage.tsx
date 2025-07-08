import React, { useState } from 'react';
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
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les commandes
interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  status: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  assignedTailor?: string;
  progress: number;
}

// Statuts de production avec couleurs
const productionStatuses = [
  { value: 'order_created', label: 'Commande créée', color: 'bg-gray-500' },
  { value: 'waiting_materials', label: 'En attente de matières', color: 'bg-yellow-500' },
  { value: 'materials_allocated', label: 'Matières allouées', color: 'bg-blue-500' },
  { value: 'cutting_in_progress', label: 'En cours de coupe', color: 'bg-orange-500' },
  { value: 'cutting_completed', label: 'Coupe terminée', color: 'bg-purple-500' },
  { value: 'assembly_in_progress', label: 'En assemblage', color: 'bg-indigo-500' },
  { value: 'assembly_completed', label: 'Assemblage terminé', color: 'bg-pink-500' },
  { value: 'finishing_in_progress', label: 'En finition', color: 'bg-red-500' },
  { value: 'quality_check', label: 'Contrôle qualité', color: 'bg-amber-500' },
  { value: 'ready_to_deliver', label: 'Prêt à livrer', color: 'bg-green-500' },
  { value: 'delivered', label: 'Livré', color: 'bg-emerald-500' },
  { value: 'invoiced', label: 'Facturé', color: 'bg-teal-500' },
  { value: 'paid', label: 'Payé', color: 'bg-cyan-500' }
];

// Données simulées
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'CMD-2024-001',
    clientName: 'Marie Dupont',
    status: 'assembly_in_progress',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    totalAmount: 450,
    assignedTailor: 'Alice Couture',
    progress: 65
  },
  {
    id: '2',
    orderNumber: 'CMD-2024-002',
    clientName: 'Jean Martin',
    status: 'cutting_in_progress',
    orderDate: '2024-01-16',
    deliveryDate: '2024-01-28',
    totalAmount: 320,
    assignedTailor: 'Marc Tailleur',
    progress: 35
  },
  {
    id: '3',
    orderNumber: 'CMD-2024-003',
    clientName: 'Sophie Bernard',
    status: 'ready_to_deliver',
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-20',
    totalAmount: 280,
    assignedTailor: 'Emma Style',
    progress: 95
  },
  {
    id: '4',
    orderNumber: 'CMD-2024-004',
    clientName: 'Paul Durand',
    status: 'waiting_materials',
    orderDate: '2024-01-17',
    deliveryDate: '2024-01-30',
    totalAmount: 580,
    progress: 10
  }
];

export function OrdersPage() {
  const { user } = useAuth();
  // Permissions centralisées
  const canViewOrders = ['owner', 'manager', 'tailor', 'orders', 'customer_service'].includes(user?.role || '');
  const canManageOrders = ['owner', 'manager', 'orders'].includes(user?.role || '');
  const canViewProduction = ['owner', 'manager', 'tailor'].includes(user?.role || '');
  if (!canViewOrders) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à ce module.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Les tailleurs ne voient que leurs commandes assignées
    if (user?.role === 'tailor') {
      return matchesSearch && matchesStatus && order.assignedTailor === `${user.firstName} ${user.lastName}`;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    return productionStatuses.find(s => s.value === status) || 
           { value: status, label: status, color: 'bg-gray-500' };
  };

  const getStatusBadgeVariant = (status: string) => {
    if (['delivered', 'invoiced', 'paid'].includes(status)) return 'default';
    if (['ready_to_deliver', 'quality_check'].includes(status)) return 'secondary';
    if (['waiting_materials'].includes(status)) return 'destructive';
    return 'outline';
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, progress: getProgressForStatus(newStatus) }
        : order
    ));
  };

  const getProgressForStatus = (status: string) => {
    const statusIndex = productionStatuses.findIndex(s => s.value === status);
    return statusIndex >= 0 ? ((statusIndex + 1) / productionStatuses.length) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">
            Suivi complet des commandes et de la production
          </p>
        </div>
        {canManageOrders && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle commande
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle commande</DialogTitle>
                <DialogDescription>
                  Saisissez les informations de la commande
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client1">Marie Dupont</SelectItem>
                        <SelectItem value="client2">Jean Martin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="delivery">Date de livraison</Label>
                    <Input type="date" id="delivery" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Description de la commande" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Annuler</Button>
                  <Button>Créer la commande</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {productionStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
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
                <p className="text-2xl font-bold">
                  {filteredOrders.filter(o => ['cutting_in_progress', 'assembly_in_progress', 'finishing_in_progress'].includes(o.status)).length}
                </p>
              </div>
              <Scissors className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prêtes à livrer</p>
                <p className="text-2xl font-bold">
                  {filteredOrders.filter(o => o.status === 'ready_to_deliver').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">
                  €{filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
          <CardDescription>
            Liste des commandes avec leur statut de production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Tailleur</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {order.clientName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{Math.round(order.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.assignedTailor ? (
                        <span className="text-sm">{order.assignedTailor}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(order.deliveryDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">€{order.totalAmount}</span>
                    </TableCell>
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
                                  <Label>Statut actuel</Label>
                                  <Badge variant={getStatusBadgeVariant(order.status)}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                              </div>
                              {canViewProduction && (
                                <div>
                                  <Label>Mettre à jour le statut</Label>
                                  <Select 
                                    value={order.status} 
                                    onValueChange={(value) => handleStatusUpdate(order.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {productionStatuses.map(status => (
                                        <SelectItem key={status.value} value={status.value}>
                                          {status.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {canManageOrders && (
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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
    </div>
  );
}