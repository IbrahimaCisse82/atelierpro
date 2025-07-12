import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
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

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

// Données mockées pour les catégories et fournisseurs
const mockCategories: Category[] = [
  { id: '1', name: 'Tissus' },
  { id: '2', name: 'Fil' },
  { id: '3', name: 'Boutons' },
  { id: '4', name: 'Fermetures' },
  { id: '5', name: 'Accessoires' }
];

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Fournisseur A' },
  { id: '2', name: 'Fournisseur B' },
  { id: '3', name: 'Fournisseur C' }
];

export function StocksPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Permissions centralisées
  const canViewStocks = ['owner', 'manager', 'stocks', 'production'].includes(user?.role || '');
  const canManageStocks = ['owner', 'manager', 'stocks'].includes(user?.role || '');

  if (!canViewStocks) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Requête optimisée avec React Query
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch 
  } = useSupabaseQuery({
    queryKey: ['products', user?.companyId],
    table: 'products',
    select: 'id, name, category_id, sku, unit, unit_price, current_stock, min_stock_level, supplier_id, is_active, updated_at',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutation pour ajouter un produit
  const addProductMutation = useSupabaseMutation({
    mutationKey: ['products'],
    table: 'products',
    operation: 'insert',
    invalidateQueries: [['products', user?.companyId]]
  });

  // Mutation pour mettre à jour un produit
  const updateProductMutation = useSupabaseMutation({
    mutationKey: ['products'],
    table: 'products',
    operation: 'update',
    invalidateQueries: [['products', user?.companyId]]
  });

  // Mutation pour supprimer un produit
  const deleteProductMutation = useSupabaseMutation({
    mutationKey: ['products'],
    table: 'products',
    operation: 'delete',
    invalidateQueries: [['products', user?.companyId]]
  });

  // Gestion des erreurs
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground mb-4">
              Impossible de charger les données des stocks.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transformation des données
  const transformedProducts: Product[] = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category_id || '',
    sku: p.sku || '',
    unit: p.unit,
    unitPrice: p.unit_price,
    currentStock: p.current_stock,
    minStockLevel: p.min_stock_level,
    supplier: p.supplier_id || '',
    isActive: p.is_active,
    lastUpdated: p.updated_at
  }));

  // Filtrage des produits
  const filteredProducts = transformedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && product.currentStock <= product.minStockLevel) ||
                        (stockFilter === 'out' && product.currentStock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Statistiques
  const totalProducts = transformedProducts.length;
  const lowStockProducts = transformedProducts.filter(p => p.currentStock <= p.minStockLevel).length;
  const outOfStockProducts = transformedProducts.filter(p => p.currentStock === 0).length;
  const totalValue = transformedProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);

  // Handlers
  const handleAddProduct = async () => {
    if (!newProduct.name || !user) return;
    
    try {
      await addProductMutation.mutateAsync({
        name: newProduct.name,
        category_id: newProduct.category,
        sku: newProduct.sku,
        unit: newProduct.unit || 'unité',
        unit_price: newProduct.unitPrice || 0,
        current_stock: newProduct.currentStock || 0,
        min_stock_level: newProduct.minStockLevel || 0,
        supplier_id: newProduct.supplier,
        is_active: true,
        company_id: user.companyId
      });
      
      setIsCreateDialogOpen(false);
      setNewProduct({});
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;
    
    try {
      await updateProductMutation.mutateAsync({
        id: editProduct.id,
        name: editProduct.name,
        category_id: editProduct.category,
        sku: editProduct.sku,
        unit: editProduct.unit,
        unit_price: editProduct.unitPrice,
        current_stock: editProduct.currentStock,
        min_stock_level: editProduct.minStockLevel,
        supplier_id: editProduct.supplier,
        is_active: editProduct.isActive
      });
      
      setIsEditDialogOpen(false);
      setEditProduct(null);
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync({ id: productId });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">
            Gérez vos produits et surveillez vos niveaux de stock
          </p>
        </div>
        {canManageStocks && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un produit</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du nouveau produit
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="name"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={newProduct.sku || ''}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Catégorie
                  </Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">
                    Unité
                  </Label>
                  <Input
                    id="unit"
                    value={newProduct.unit || ''}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Prix unitaire
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.unitPrice || ''}
                    onChange={(e) => setNewProduct({...newProduct, unitPrice: parseFloat(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock actuel
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.currentStock || ''}
                    onChange={(e) => setNewProduct({...newProduct, currentStock: parseInt(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minStock" className="text-right">
                    Stock minimum
                  </Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newProduct.minStockLevel || ''}
                    onChange={(e) => setNewProduct({...newProduct, minStockLevel: parseInt(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleAddProduct}
                  disabled={addProductMutation.isPending}
                >
                  {addProductMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupture</CardTitle>
            <Minus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {mockCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Niveau de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les stocks</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
          <CardDescription>
            Liste de tous vos produits en stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {mockCategories.find(c => c.id === product.category)?.name || 'Non catégorisé'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={product.currentStock <= product.minStockLevel ? 'text-orange-600 font-medium' : ''}>
                          {product.currentStock} {product.unit}
                        </span>
                        {product.currentStock <= product.minStockLevel && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.unitPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                    </TableCell>
                    <TableCell>
                      {(product.currentStock * product.unitPrice).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.currentStock === 0 ? 'destructive' : product.currentStock <= product.minStockLevel ? 'secondary' : 'default'}>
                        {product.currentStock === 0 ? 'Rupture' : product.currentStock <= product.minStockLevel ? 'Faible' : 'OK'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditProduct(product);
                            setIsEditDialogOpen(true);
                          }}
                          disabled={!canManageStocks}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={!canManageStocks}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Dialog d'édition */}
      {editProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier le produit</DialogTitle>
              <DialogDescription>
                Modifiez les informations du produit
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="edit-sku"
                  value={editProduct.sku}
                  onChange={(e) => setEditProduct({...editProduct, sku: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock actuel
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editProduct.currentStock}
                  onChange={(e) => setEditProduct({...editProduct, currentStock: parseInt(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Prix unitaire
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editProduct.unitPrice}
                  onChange={(e) => setEditProduct({...editProduct, unitPrice: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                onClick={handleUpdateProduct}
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}