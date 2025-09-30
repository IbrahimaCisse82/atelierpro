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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye,
  ShoppingBag,
  Scissors,
  Box,
  Tag
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';

// Types pour les produits finis
interface FinishedProduct {
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
  description?: string;
  size?: string;
  color?: string;
  brand?: string;
}

// Types pour les matières premières
interface RawMaterial {
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
  description?: string;
  materialType?: string; // tissu, fil, bouton, etc.
  color?: string;
  quality?: string;
}

interface Category {
  id: string;
  name: string;
  type: 'finished' | 'raw'; // Type de catégorie
}

interface Supplier {
  id: string;
  name: string;
}

// Données mockées pour les catégories
const mockCategories: Category[] = [
  // Catégories pour produits finis
  { id: '1', name: 'Robes', type: 'finished' },
  { id: '2', name: 'Costumes', type: 'finished' },
  { id: '3', name: 'Jupes', type: 'finished' },
  { id: '4', name: 'Pantalons', type: 'finished' },
  { id: '5', name: 'Chemises', type: 'finished' },
  { id: '6', name: 'Vestes', type: 'finished' },
  { id: '7', name: 'Accessoires', type: 'finished' },
  
  // Catégories pour matières premières
  { id: '8', name: 'Tissus', type: 'raw' },
  { id: '9', name: 'Fils', type: 'raw' },
  { id: '10', name: 'Boutons', type: 'raw' },
  { id: '11', name: 'Fermetures', type: 'raw' },
  { id: '12', name: 'Doublures', type: 'raw' },
  { id: '13', name: 'Accessoires', type: 'raw' },
  { id: '14', name: 'Outillage', type: 'raw' }
];

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Tissus Premium SARL' },
  { id: '2', name: 'Accessoires Couture' },
  { id: '3', name: 'Métaux Précieux' },
  { id: '4', name: 'Fournitures Pro' }
];

// Données mockées pour les produits finis
const mockFinishedProducts: FinishedProduct[] = [
  {
    id: '1',
    name: 'Robe de soirée élégante',
    category: '1',
    sku: 'ROBE-001',
    unit: 'pièce',
    unitPrice: 45000,
    currentStock: 5,
    minStockLevel: 2,
    supplier: '1',
    isActive: true,
    lastUpdated: '2024-01-15T10:30:00Z',
    description: 'Robe de soirée en soie avec broderies',
    size: 'M',
    color: 'Noir',
    brand: 'AtelierPro'
  },
  {
    id: '2',
    name: 'Costume 3 pièces classique',
    category: '2',
    sku: 'COST-001',
    unit: 'pièce',
    unitPrice: 85000,
    currentStock: 3,
    minStockLevel: 1,
    supplier: '1',
    isActive: true,
    lastUpdated: '2024-01-14T14:20:00Z',
    description: 'Costume en laine fine',
    size: 'L',
    color: 'Gris',
    brand: 'AtelierPro'
  },
  {
    id: '3',
    name: 'Jupe crayon professionnelle',
    category: '3',
    sku: 'JUPE-001',
    unit: 'pièce',
    unitPrice: 28000,
    currentStock: 0,
    minStockLevel: 3,
    supplier: '1',
    isActive: true,
    lastUpdated: '2024-01-13T09:15:00Z',
    description: 'Jupe crayon en coton',
    size: 'S',
    color: 'Bleu marine',
    brand: 'AtelierPro'
  }
];

// Données mockées pour les matières premières
const mockRawMaterials: RawMaterial[] = [
  {
    id: '1',
    name: 'Tissu soie premium',
    category: '8',
    sku: 'TISS-001',
    unit: 'mètre',
    unitPrice: 2500,
    currentStock: 50,
    minStockLevel: 20,
    supplier: '1',
    isActive: true,
    lastUpdated: '2024-01-15T08:30:00Z',
    description: 'Soie naturelle de haute qualité',
    materialType: 'tissu',
    color: 'Blanc',
    quality: 'Premium'
  },
  {
    id: '2',
    name: 'Fil de couture polyester',
    category: '9',
    sku: 'FIL-001',
    unit: 'bobine',
    unitPrice: 500,
    currentStock: 100,
    minStockLevel: 30,
    supplier: '2',
    isActive: true,
    lastUpdated: '2024-01-14T16:45:00Z',
    description: 'Fil polyester 100m',
    materialType: 'fil',
    color: 'Blanc',
    quality: 'Standard'
  },
  {
    id: '3',
    name: 'Boutons de luxe nacrés',
    category: '10',
    sku: 'BOUT-001',
    unit: 'paquet',
    unitPrice: 1500,
    currentStock: 5,
    minStockLevel: 10,
    supplier: '3',
    isActive: true,
    lastUpdated: '2024-01-12T11:20:00Z',
    description: 'Boutons nacrés 12mm',
    materialType: 'bouton',
    color: 'Nacré',
    quality: 'Luxe'
  },
  {
    id: '4',
    name: 'Fermeture éclair métallique',
    category: '11',
    sku: 'FERM-001',
    unit: 'pièce',
    unitPrice: 750,
    currentStock: 0,
    minStockLevel: 25,
    supplier: '3',
    isActive: true,
    lastUpdated: '2024-01-10T13:15:00Z',
    description: 'Fermeture éclair 20cm',
    materialType: 'fermeture',
    color: 'Argent',
    quality: 'Standard'
  }
];

export function StocksPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [activeTab, setActiveTab] = useState('finished');
  
  // États pour les produits finis
  const [newFinishedProduct, setNewFinishedProduct] = useState<Partial<FinishedProduct>>({});
  const [editFinishedProduct, setEditFinishedProduct] = useState<FinishedProduct | null>(null);
  const [isCreateFinishedDialogOpen, setIsCreateFinishedDialogOpen] = useState(false);
  const [isEditFinishedDialogOpen, setIsEditFinishedDialogOpen] = useState(false);
  
  // États pour les matières premières
  const [newRawMaterial, setNewRawMaterial] = useState<Partial<RawMaterial>>({});
  const [editRawMaterial, setEditRawMaterial] = useState<RawMaterial | null>(null);
  const [isCreateRawDialogOpen, setIsCreateRawDialogOpen] = useState(false);
  const [isEditRawDialogOpen, setIsEditRawDialogOpen] = useState(false);

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

  // Filtrage des produits finis
  const filteredFinishedProducts = mockFinishedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && product.currentStock <= product.minStockLevel) ||
                        (stockFilter === 'out' && product.currentStock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Filtrage des matières premières
  const filteredRawMaterials = mockRawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && material.currentStock <= material.minStockLevel) ||
                        (stockFilter === 'out' && material.currentStock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Statistiques pour produits finis
  const finishedProductsStats = {
    total: mockFinishedProducts.length,
    lowStock: mockFinishedProducts.filter(p => p.currentStock <= p.minStockLevel).length,
    outOfStock: mockFinishedProducts.filter(p => p.currentStock === 0).length,
    totalValue: mockFinishedProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0)
  };

  // Statistiques pour matières premières
  const rawMaterialsStats = {
    total: mockRawMaterials.length,
    lowStock: mockRawMaterials.filter(m => m.currentStock <= m.minStockLevel).length,
    outOfStock: mockRawMaterials.filter(m => m.currentStock === 0).length,
    totalValue: mockRawMaterials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0)
  };

  // Handlers pour produits finis
  const handleAddFinishedProduct = async () => {
    if (!newFinishedProduct.name) {
      toast({
        title: "Erreur",
        description: "Le nom du produit est obligatoire.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulation d'ajout
    toast({
      title: "Succès",
      description: "Produit fini ajouté avec succès.",
    });
    setIsCreateFinishedDialogOpen(false);
    setNewFinishedProduct({});
  };

  const handleUpdateFinishedProduct = async () => {
    if (!editFinishedProduct) return;
    
    // Simulation de mise à jour
    toast({
      title: "Succès",
      description: "Produit fini mis à jour avec succès.",
    });
    setIsEditFinishedDialogOpen(false);
    setEditFinishedProduct(null);
  };

  const handleDeleteFinishedProduct = async (productId: string) => {
    // Simulation de suppression
    toast({
      title: "Succès",
      description: "Produit fini supprimé avec succès.",
    });
  };

  // Handlers pour matières premières
  const handleAddRawMaterial = async () => {
    if (!newRawMaterial.name) {
      toast({
        title: "Erreur",
        description: "Le nom de la matière première est obligatoire.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulation d'ajout
    toast({
      title: "Succès",
      description: "Matière première ajoutée avec succès.",
    });
    setIsCreateRawDialogOpen(false);
    setNewRawMaterial({});
  };

  const handleUpdateRawMaterial = async () => {
    if (!editRawMaterial) return;
    
    // Simulation de mise à jour
    toast({
      title: "Succès",
      description: "Matière première mise à jour avec succès.",
    });
    setIsEditRawDialogOpen(false);
    setEditRawMaterial(null);
  };

  const handleDeleteRawMaterial = async (materialId: string) => {
    // Simulation de suppression
    toast({
      title: "Succès",
      description: "Matière première supprimée avec succès.",
    });
  };

  // Catégories filtrées selon l'onglet actif
  const getFilteredCategories = () => {
    return mockCategories.filter(cat => 
      activeTab === 'finished' ? cat.type === 'finished' : cat.type === 'raw'
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">
            Gestion des produits finis et matières premières
          </p>
        </div>
        {canManageStocks && (
          <div className="flex gap-2">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Rapport
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="finished" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Produits Finis ({mockFinishedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="raw" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Matières Premières ({mockRawMaterials.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finished" className="space-y-4">
          {/* Statistiques produits finis */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total produits</p>
                    <p className="text-2xl font-bold">{finishedProductsStats.total}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stock faible</p>
                    <p className="text-2xl font-bold text-orange-600">{finishedProductsStats.lowStock}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rupture</p>
                    <p className="text-2xl font-bold text-red-600">{finishedProductsStats.outOfStock}</p>
                  </div>
                  <Minus className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valeur stock</p>
                    <p className="text-2xl font-bold">{formatFCFA(finishedProductsStats.totalValue)}</p>
                  </div>
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un produit fini..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {getFilteredCategories().map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={(value: 'all' | 'low' | 'out') => setStockFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les stocks</SelectItem>
                      <SelectItem value="low">Stock faible</SelectItem>
                      <SelectItem value="out">Rupture</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des produits finis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Produits Finis</CardTitle>
                  <CardDescription>Gestion des produits vendus en boutique</CardDescription>
                </div>
                {canManageStocks && (
                  <Dialog open={isCreateFinishedDialogOpen} onOpenChange={setIsCreateFinishedDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau produit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Ajouter un produit fini</DialogTitle>
                        <DialogDescription>
                          Créer un nouveau produit fini pour la vente
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nom du produit *</Label>
                            <Input
                              id="name"
                              value={newFinishedProduct.name || ''}
                              onChange={(e) => setNewFinishedProduct(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: Robe de soirée élégante"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sku">Code SKU</Label>
                            <Input
                              id="sku"
                              value={newFinishedProduct.sku || ''}
                              onChange={(e) => setNewFinishedProduct(prev => ({ ...prev, sku: e.target.value }))}
                              placeholder="Ex: ROBE-001"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="category">Catégorie</Label>
                            <Select value={newFinishedProduct.category || ''} onValueChange={(value) => setNewFinishedProduct(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                {getFilteredCategories().map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="unit">Unité</Label>
                            <Input
                              id="unit"
                              value={newFinishedProduct.unit || ''}
                              onChange={(e) => setNewFinishedProduct(prev => ({ ...prev, unit: e.target.value }))}
                              placeholder="Ex: pièce"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Prix unitaire</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newFinishedProduct.unitPrice || ''}
                              onChange={(e) => setNewFinishedProduct(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="stock">Stock initial</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={newFinishedProduct.currentStock || ''}
                              onChange={(e) => setNewFinishedProduct(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="minStock">Stock minimum</Label>
                            <Input
                              id="minStock"
                              type="number"
                              value={newFinishedProduct.minStockLevel || ''}
                              onChange={(e) => setNewFinishedProduct(prev => ({ ...prev, minStockLevel: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newFinishedProduct.description || ''}
                            onChange={(e) => setNewFinishedProduct(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description du produit..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateFinishedDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleAddFinishedProduct}>
                          Ajouter
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Valeur stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFinishedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {mockCategories.find(c => c.id === product.category)?.name || product.category}
                      </TableCell>
                      <TableCell className="font-mono">{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={product.currentStock <= product.minStockLevel ? 'text-orange-600 font-medium' : ''}>
                            {product.currentStock} {product.unit}
                          </span>
                          {product.currentStock <= product.minStockLevel && (
                            <Badge variant="outline" className="text-orange-600">
                              Faible
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatFCFA(product.unitPrice)}</TableCell>
                      <TableCell>{formatFCFA(product.currentStock * product.unitPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog open={isEditFinishedDialogOpen} onOpenChange={setIsEditFinishedDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setEditFinishedProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Modifier le produit</DialogTitle>
                              </DialogHeader>
                              {/* Contenu similaire au formulaire d'ajout */}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditFinishedDialogOpen(false)}>
                                  Annuler
                                </Button>
                                <Button onClick={handleUpdateFinishedProduct}>
                                  Mettre à jour
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteFinishedProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw" className="space-y-4">
          {/* Statistiques matières premières */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total matières</p>
                    <p className="text-2xl font-bold">{rawMaterialsStats.total}</p>
                  </div>
                  <Scissors className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stock faible</p>
                    <p className="text-2xl font-bold text-orange-600">{rawMaterialsStats.lowStock}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rupture</p>
                    <p className="text-2xl font-bold text-red-600">{rawMaterialsStats.outOfStock}</p>
                  </div>
                  <Minus className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valeur stock</p>
                    <p className="text-2xl font-bold">{formatFCFA(rawMaterialsStats.totalValue)}</p>
                  </div>
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une matière première..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {getFilteredCategories().map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={(value: 'all' | 'low' | 'out') => setStockFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les stocks</SelectItem>
                      <SelectItem value="low">Stock faible</SelectItem>
                      <SelectItem value="out">Rupture</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des matières premières */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Matières Premières</CardTitle>
                  <CardDescription>Gestion des matières premières et consommables</CardDescription>
                </div>
                {canManageStocks && (
                  <Dialog open={isCreateRawDialogOpen} onOpenChange={setIsCreateRawDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle matière
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Ajouter une matière première</DialogTitle>
                        <DialogDescription>
                          Créer une nouvelle matière première ou consommable
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nom de la matière *</Label>
                            <Input
                              id="name"
                              value={newRawMaterial.name || ''}
                              onChange={(e) => setNewRawMaterial(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: Tissu soie premium"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sku">Code SKU</Label>
                            <Input
                              id="sku"
                              value={newRawMaterial.sku || ''}
                              onChange={(e) => setNewRawMaterial(prev => ({ ...prev, sku: e.target.value }))}
                              placeholder="Ex: TISS-001"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="category">Catégorie</Label>
                            <Select value={newRawMaterial.category || ''} onValueChange={(value) => setNewRawMaterial(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                {getFilteredCategories().map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="unit">Unité</Label>
                            <Input
                              id="unit"
                              value={newRawMaterial.unit || ''}
                              onChange={(e) => setNewRawMaterial(prev => ({ ...prev, unit: e.target.value }))}
                              placeholder="Ex: mètre"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Prix unitaire</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newRawMaterial.unitPrice || ''}
                              onChange={(e) => setNewRawMaterial(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="stock">Stock initial</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={newRawMaterial.currentStock || ''}
                              onChange={(e) => setNewRawMaterial(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="minStock">Stock minimum</Label>
                            <Input
                              id="minStock"
                              type="number"
                              value={newRawMaterial.minStockLevel || ''}
                              onChange={(e) => setNewRawMaterial(prev => ({ ...prev, minStockLevel: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newRawMaterial.description || ''}
                            onChange={(e) => setNewRawMaterial(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description de la matière première..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateRawDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleAddRawMaterial}>
                          Ajouter
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matière</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Valeur stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRawMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{material.name}</p>
                          {material.description && (
                            <p className="text-sm text-muted-foreground">{material.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {mockCategories.find(c => c.id === material.category)?.name || material.category}
                      </TableCell>
                      <TableCell className="font-mono">{material.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={material.currentStock <= material.minStockLevel ? 'text-orange-600 font-medium' : ''}>
                            {material.currentStock} {material.unit}
                          </span>
                          {material.currentStock <= material.minStockLevel && (
                            <Badge variant="outline" className="text-orange-600">
                              Faible
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatFCFA(material.unitPrice)}</TableCell>
                      <TableCell>{formatFCFA(material.currentStock * material.unitPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={material.isActive ? "default" : "secondary"}>
                          {material.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog open={isEditRawDialogOpen} onOpenChange={setIsEditRawDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setEditRawMaterial(material)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Modifier la matière première</DialogTitle>
                              </DialogHeader>
                              {/* Contenu similaire au formulaire d'ajout */}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditRawDialogOpen(false)}>
                                  Annuler
                                </Button>
                                <Button onClick={handleUpdateRawMaterial}>
                                  Mettre à jour
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteRawMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StocksPage;