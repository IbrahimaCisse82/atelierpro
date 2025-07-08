import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Eye, Edit, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessControl } from '@/components/common/AccessControl';

// Types pour les achats
interface Purchase {
  id: string;
  supplier: string;
  status: string;
  purchaseDate: string;
  deliveryDate: string;
  totalAmount: number;
  progress: number;
}

const purchaseStatuses = [
  { value: 'ordered', label: 'Commandé', color: 'bg-blue-500' },
  { value: 'received', label: 'Reçu', color: 'bg-green-500' },
  { value: 'invoiced', label: 'Facturé', color: 'bg-teal-500' },
  { value: 'paid', label: 'Payé', color: 'bg-cyan-500' }
];

const mockPurchases: Purchase[] = [
  {
    id: '1',
    supplier: 'Tissus Paris',
    status: 'ordered',
    purchaseDate: '2024-07-01',
    deliveryDate: '2024-07-05',
    totalAmount: 1200,
    progress: 25
  },
  {
    id: '2',
    supplier: 'Mercerie Lyon',
    status: 'received',
    purchaseDate: '2024-06-20',
    deliveryDate: '2024-06-25',
    totalAmount: 800,
    progress: 100
  }
];

export function PurchasesPage() {
  const { user } = useAuth();
  const canViewPurchases = ['owner', 'manager', 'purchases'].includes(user?.role || '');
  const canManagePurchases = ['owner', 'manager', 'purchases'].includes(user?.role || '');
  if (!canViewPurchases) {
    return (
      <AccessControl allowedRoles={["owner", "manager", "purchases"]}>
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
      </AccessControl>
    );
  }

  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    return purchaseStatuses.find(s => s.value === status) || { value: status, label: status, color: 'bg-gray-500' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Achats</h1>
          <p className="text-muted-foreground">Suivi des commandes fournisseurs</p>
        </div>
        {canManagePurchases && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel achat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un achat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplier">Fournisseur</Label>
                  <Input id="supplier" placeholder="Nom du fournisseur" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchaseDate">Date achat</Label>
                    <Input type="date" id="purchaseDate" />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Date livraison</Label>
                    <Input type="date" id="deliveryDate" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Annuler</Button>
                  <Button>Créer</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
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
                onChange={e => setStatusFilter(e.target.value)}
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
                <p className="text-2xl font-bold">€{filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
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
                    <TableCell>€{purchase.totalAmount}</TableCell>
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
                            </div>
                          </DialogContent>
                        </Dialog>
                        {canManagePurchases && (
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