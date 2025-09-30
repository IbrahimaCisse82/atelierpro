import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSuppliers } from '@/hooks/use-suppliers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Truck,
  Star,
  Phone,
  Building2
} from 'lucide-react';

export function SuppliersPage() {
  const { user } = useAuth();
  const { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sénégal',
    tax_id: '',
    payment_terms: 30,
    credit_limit: 0,
    category: 'textile',
    rating: 5,
    notes: '',
    is_active: true,
  });

  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'textile', label: 'Tissus' },
    { value: 'accessoires', label: 'Accessoires' },
    { value: 'fournitures', label: 'Fournitures' },
    { value: 'equipement', label: 'Équipement' },
    { value: 'autres', label: 'Autres' },
  ];

  // Permissions
  const canManage = ['owner', 'stocks'].includes(user?.role || '');

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.supplier_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupplier) {
      updateSupplier({ id: editingSupplier.id, ...formData });
    } else {
      createSupplier(formData as any);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Sénégal',
      tax_id: '',
      payment_terms: 30,
      credit_limit: 0,
      category: 'textile',
      rating: 5,
      notes: '',
      is_active: true,
    });
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || 'Sénégal',
      tax_id: supplier.tax_id || '',
      payment_terms: supplier.payment_terms,
      credit_limit: supplier.credit_limit,
      category: supplier.category || 'textile',
      rating: supplier.rating || 5,
      notes: supplier.notes || '',
      is_active: supplier.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      deleteSupplier(id);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Actif</Badge>
    ) : (
      <Badge variant="secondary">Inactif</Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Fournisseurs</h1>
          <Badge variant="outline">{filteredSuppliers.length}</Badge>
        </div>

        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" /> Nouveau fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier ? 'Modifiez les informations du fournisseur' : 'Ajoutez un nouveau fournisseur à votre base'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nom du fournisseur *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_person">Personne de contact</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.value !== 'all').map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax_id">NINEA / Identifiant fiscal</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_terms">Délai de paiement (jours)</Label>
                    <Input
                      id="payment_terms"
                      type="number"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="credit_limit">Plafond crédit (F CFA)</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rating">Note (1-5)</Label>
                    <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(r => (
                          <SelectItem key={r} value={r.toString()}>{r} étoiles</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingSupplier ? 'Modifier' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des fournisseurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
          <CardDescription>{filteredSuppliers.length} fournisseur(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucun fournisseur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-mono text-sm">{supplier.supplier_number}</TableCell>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {supplier.contact_person && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {supplier.contact_person}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        {getRatingStars(supplier.rating || 0)}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.payment_terms} jours</TableCell>
                    <TableCell>{getStatusBadge(supplier.is_active)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(supplier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(supplier.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuppliersPage;