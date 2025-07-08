import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Receipt,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les stocks
interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  supplier: string;
  isActive: boolean;
  lastUpdated: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'draft' | 'ordered' | 'confirmed' | 'in_transit' | 'delivered_not_received' | 'received' | 'invoice_received' | 'ready_to_pay' | 'paid';
  totalAmount: number;
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
}

interface Reception {
  id: string;
  receptionNumber: string;
  purchaseOrderId: string;
  receptionDate: string;
  isValidated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  items: ReceptionItem[];
}

interface ReceptionItem {
  id: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  qualityCheck: boolean;
}

// Données simulées
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Tissu coton blanc',
    category: 'Tissus',
    sku: 'TISS-001',
    unit: 'm',
    unitPrice: 15.50,
    currentStock: 25.5,
    minStockLevel: 10,
    supplier: 'Tissus & Co',
    isActive: true,
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Fil polyester noir',
    category: 'Fil',
    sku: 'FIL-001',
    unit: 'bobine',
    unitPrice: 8.90,
    currentStock: 12,
    minStockLevel: 20,
    supplier: 'Mercerie Plus',
    isActive: true,
    lastUpdated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Boutons nacre 15mm',
    category: 'Accessoires',
    sku: 'ACC-001',
    unit: 'pièce',
    unitPrice: 0.45,
    currentStock: 150,
    minStockLevel: 50,
    supplier: 'Mercerie Plus',
    isActive: true,
    lastUpdated: '2024-01-13'
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'ACH-2024-001',
    supplier: 'Tissus & Co',
    orderDate: '2024-01-10',
    expectedDelivery: '2024-01-20',
    status: 'received',
    totalAmount: 1250.00,
    items: [
      {
        id: '1',
        productName: 'Tissu coton blanc',
        quantity: 50,
        unitPrice: 15.50,
        totalPrice: 775.00,
        receivedQuantity: 50
      },
      {
        id: '2',
        productName: 'Tissu lin naturel',
        quantity: 30,
        unitPrice: 15.83,
        totalPrice: 475.00,
        receivedQuantity: 30
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ACH-2024-002',
    supplier: 'Mercerie Plus',
    orderDate: '2024-01-12',
    expectedDelivery: '2024-01-22',
    status: 'in_transit',
    totalAmount: 450.00,
    items: [
      {
        id: '3',
        productName: 'Fil polyester noir',
        quantity: 25,
        unitPrice: 8.90,
        totalPrice: 222.50,
        receivedQuantity: 0
      },
      {
        id: '4',
        productName: 'Boutons nacre 15mm',
        quantity: 200,
        unitPrice: 0.45,
        totalPrice: 90.00,
        receivedQuantity: 0
      }
    ]
  }
];

const mockReceptions: Reception[] = [
  {
    id: '1',
    receptionNumber: 'REC-2024-001',
    purchaseOrderId: '1',
    receptionDate: '2024-01-18',
    isValidated: true,
    validatedBy: 'Jean Stocks',
    validatedAt: '2024-01-18T14:30:00Z',
    items: [
      {
        id: '1',
        productName: 'Tissu coton blanc',
        orderedQuantity: 50,
        receivedQuantity: 50,
        qualityCheck: true
      },
      {
        id: '2',
        productName: 'Tissu lin naturel',
        orderedQuantity: 30,
        receivedQuantity: 30,
        qualityCheck: true
      }
    ]
  }
];

export function StocksPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [receptions, setReceptions] = useState<Reception[]>(mockReceptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal'>('all');
  const [selectedTab, setSelectedTab] = useState('products');

  // Permissions
  const canManageStocks = ['owner', 'stocks'].includes(user?.role || '');
  const canViewStocks = ['owner', 'manager', 'stocks'].includes(user?.role || '');

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && product.currentStock <= product.minStockLevel) ||
      (stockFilter === 'normal' && product.currentStock > product.minStockLevel);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculer les statistiques
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
  const pendingReceptions = purchaseOrders.filter(po => po.status === 'delivered_not_received').length;

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: 'bg-gray-500' },
      ordered: { label: 'Commandé', color: 'bg-blue-500' },
      confirmed: { label: 'Confirmé', color: 'bg-yellow-500' },
      in_transit: { label: 'En transit', color: 'bg-orange-500' },
      delivered_not_received: { label: 'Livré non-réceptionné', color: 'bg-purple-500' },
      received: { label: 'Réceptionné', color: 'bg-green-500' },
      invoice_received: { label: 'Facture reçue', color: 'bg-indigo-500' },
      ready_to_pay: { label: 'Bon à payer', color: 'bg-emerald-500' },
      paid: { label: 'Payé', color: 'bg-cyan-500' }
    };
    return statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };
  };

  const getStockStatus = (product: Product) => {
    const percentage = (product.currentStock / product.minStockLevel) * 100;
    if (percentage <= 50) return { status: 'critical', color: 'text-red-500' };
    if (percentage <= 100) return { status: 'low', color: 'text-orange-500' };
    return { status: 'normal', color: 'text-green-500' };
  };

  if (!canViewStocks) {
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">
            Inventaire, achats et réceptions fournisseurs
          </p>
        </div>
        {canManageStocks && (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau produit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un produit</DialogTitle>
                </DialogHeader>
                <div className="text-center text-muted-foreground">
                  Formulaire en cours de développement
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Nouvel achat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une commande fournisseur</DialogTitle>
                </DialogHeader>
                <div className="text-center text-muted-foreground">
                  Formulaire en cours de développement
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold text-orange-500">{lowStockProducts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valeur stock</p>
                <p className="text-2xl font-bold">€{totalStockValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Réceptions en attente</p>
                <p className="text-2xl font-bold text-purple-500">{pendingReceptions}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="purchases">Achats</TabsTrigger>
          <TabsTrigger value="receptions">Réceptions</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
        </TabsList>

        {/* Onglet Produits */}
        <TabsContent value="products" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Toutes catégories</option>
                    <option value="Tissus">Tissus</option>
                    <option value="Fil">Fil</option>
                    <option value="Accessoires">Accessoires</option>
                  </select>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tous les stocks</option>
                    <option value="low">Stock faible</option>
                    <option value="normal">Stock normal</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des produits */}
          <Card>
            <CardHeader>
              <CardTitle>Inventaire des produits</CardTitle>
              <CardDescription>
                {filteredProducts.length} produit(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Valeur stock</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const stockPercentage = (product.currentStock / product.minStockLevel) * 100;
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{product.currentStock} {product.unit}</span>
                              <span className={cn("text-xs", stockStatus.color)}>
                                {stockStatus.status === 'critical' && 'Critique'}
                                {stockStatus.status === 'low' && 'Faible'}
                                {stockStatus.status === 'normal' && 'Normal'}
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(stockPercentage, 100)} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              Min: {product.minStockLevel} {product.unit}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">€{product.unitPrice}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            €{(product.currentStock * product.unitPrice).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{product.supplier}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={stockStatus.status === 'critical' ? 'destructive' : 
                                   stockStatus.status === 'low' ? 'secondary' : 'default'}
                          >
                            {stockStatus.status === 'critical' && 'Critique'}
                            {stockStatus.status === 'low' && 'Faible'}
                            {stockStatus.status === 'normal' && 'Normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canManageStocks && (
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
        </TabsContent>

        {/* Onglet Achats */}
        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes fournisseurs</CardTitle>
              <CardDescription>
                Suivi des achats et cycle de paiement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date commande</TableHead>
                    <TableHead>Livraison prévue</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-medium">{order.orderNumber}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{order.supplier}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(order.expectedDelivery).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
                            <Badge variant="outline">
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">€{order.totalAmount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canManageStocks && order.status === 'delivered_not_received' && (
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Réceptionner
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

        {/* Onglet Réceptions */}
        <TabsContent value="receptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Réceptions fournisseurs</CardTitle>
              <CardDescription>
                Contrôle qualité et validation des réceptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Réception</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Date réception</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Validé par</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receptions.map((reception) => (
                    <TableRow key={reception.id}>
                      <TableCell>
                        <p className="font-medium">{reception.receptionNumber}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{reception.purchaseOrderId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(reception.receptionDate).toLocaleDateString('fr-FR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={reception.isValidated ? "default" : "secondary"}>
                          {reception.isValidated ? "Validé" : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {reception.validatedBy || 'Non validé'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManageStocks && !reception.isValidated && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Valider
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Fournisseurs */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestion des fournisseurs</h3>
              <p className="text-muted-foreground">
                Module en cours de développement
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 