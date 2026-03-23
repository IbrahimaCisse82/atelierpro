import React, { useState } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Package, Plus, Search, Trash2, AlertTriangle,
  ShoppingBag, Minus, Tag, ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductCategory = Database['public']['Tables']['product_categories']['Row'];

export function StocksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});

  const { data: products, loading, refetch } = useSupabaseQuery<Product>('products', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: categories } = useSupabaseQuery<ProductCategory>('product_categories', {
    orderBy: { column: 'name', ascending: true }
  });
  const { create, remove } = useSupabaseMutation<Product>('products');

  const productsList = products || [];
  const categoriesList = categories || [];

  const filtered = productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && p.current_stock <= p.min_stock_level && p.current_stock > 0) ||
      (stockFilter === 'out' && p.current_stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const stats = {
    total: productsList.length,
    lowStock: productsList.filter(p => p.current_stock <= p.min_stock_level && p.current_stock > 0).length,
    outOfStock: productsList.filter(p => p.current_stock === 0).length,
    totalValue: productsList.reduce((s, p) => s + (p.current_stock * Number(p.unit_price)), 0)
  };

  const handleAddProduct = async () => {
    if (!newProduct.name) { toast({ title: "Erreur", description: "Le nom est obligatoire.", variant: "destructive" }); return; }
    try {
      await create({
        name: newProduct.name, sku: newProduct.sku, description: newProduct.description,
        unit_price: newProduct.unit_price || 0, current_stock: newProduct.current_stock || 0,
        min_stock_level: newProduct.min_stock_level || 0, unit: newProduct.unit || 'piece',
        category_id: newProduct.category_id, is_active: true
      } as any);
      toast({ title: "Succès", description: "Produit ajouté." });
      setIsCreateDialogOpen(false); setNewProduct({}); refetch();
    } catch (error: any) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try { await remove(id); toast({ title: "Succès", description: "Produit supprimé." }); refetch(); }
    catch (error: any) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
  };

  const getCategoryName = (catId: string | null) => catId ? (categoriesList.find(c => c.id === catId)?.name || '-') : '-';

  const getStockLevel = (product: Product) => {
    if (product.current_stock === 0) return { label: 'Rupture', variant: 'destructive' as const, percent: 0 };
    if (product.current_stock <= product.min_stock_level) return { label: 'Critique', variant: 'destructive' as const, percent: Math.round((product.current_stock / Math.max(product.min_stock_level * 2, 1)) * 100) };
    if (product.current_stock <= product.min_stock_level * 1.5) return { label: 'Faible', variant: 'outline' as const, percent: Math.round((product.current_stock / Math.max(product.min_stock_level * 2, 1)) * 100) };
    return { label: 'OK', variant: 'secondary' as const, percent: 100 };
  };

  // Items critiques en haut
  const criticalItems = productsList.filter(p => p.current_stock <= p.min_stock_level);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">Tissus, mercerie et fournitures</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouveau produit</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Ajouter un produit</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nom *</Label><Input value={newProduct.name || ''} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>SKU</Label><Input value={newProduct.sku || ''} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={newProduct.category_id || ''} onValueChange={v => setNewProduct(p => ({ ...p, category_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{categoriesList.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Unité</Label><Input value={newProduct.unit || 'mètre'} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} placeholder="mètre, pièce, rouleau" /></div>
                <div><Label>Prix unitaire</Label><Input type="number" value={newProduct.unit_price || ''} onChange={e => setNewProduct(p => ({ ...p, unit_price: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Stock initial</Label><Input type="number" value={newProduct.current_stock || ''} onChange={e => setNewProduct(p => ({ ...p, current_stock: Number(e.target.value) }))} /></div>
                <div><Label>Seuil d'alerte</Label><Input type="number" value={newProduct.min_stock_level || ''} onChange={e => setNewProduct(p => ({ ...p, min_stock_level: Number(e.target.value) }))} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={newProduct.description || ''} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleAddProduct}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total produits</p><p className="text-2xl font-bold">{stats.total}</p></div><ShoppingBag className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card className={stats.lowStock > 0 ? 'border-warning/50 bg-warning/5' : ''}>
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Stock faible</p><p className="text-2xl font-bold text-warning">{stats.lowStock}</p></div><AlertTriangle className="h-8 w-8 text-warning" /></div></CardContent>
        </Card>
        <Card className={stats.outOfStock > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Rupture</p><p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p></div><Minus className="h-8 w-8 text-destructive" /></div></CardContent>
        </Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Valeur stock</p><p className="text-2xl font-bold">{formatFCFA(stats.totalValue)}</p></div><Tag className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
      </div>

      {/* Alertes critiques */}
      {criticalItems.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ Alertes Stock ({criticalItems.length} article{criticalItems.length > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {criticalItems.map(item => {
                const level = getStockLevel(item);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg bg-destructive/5">
                    <div className="flex-1 mr-3">
                      <p className="font-medium text-sm">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={level.percent} className="h-2 flex-1" />
                        <span className="text-xs font-medium">{item.current_stock}/{item.min_stock_level}</span>
                      </div>
                    </div>
                    <Badge variant={level.variant}>{level.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categoriesList.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={(v: any) => setStockFilter(v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Stock" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire</CardTitle>
          <CardDescription>{filtered.length} produit(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Seuil</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(product => {
                  const level = getStockLevel(product);
                  return (
                    <TableRow key={product.id} className={product.current_stock <= product.min_stock_level ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(product.category_id)}</TableCell>
                      <TableCell>
                        <span className={product.current_stock <= product.min_stock_level ? 'text-destructive font-bold' : 'font-medium'}>
                          {product.current_stock} {product.unit || 'pcs'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.min_stock_level}</TableCell>
                      <TableCell>{formatFCFA(Number(product.unit_price))}</TableCell>
                      <TableCell>{formatFCFA(product.current_stock * Number(product.unit_price))}</TableCell>
                      <TableCell><Badge variant={level.variant}>{level.label}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default StocksPage;
