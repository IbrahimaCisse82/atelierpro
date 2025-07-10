import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
}

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Textiles Paris', contact: 'Mme Martin', email: 'contact@textilesparis.fr', phone: '01 23 45 67 89' },
  { id: '2', name: 'Mercerie Pro', contact: 'M. Dubois', email: 'info@merceriepro.com', phone: '02 98 76 54 32' },
];

export function SuppliersPage() {
  const { user } = useAuth();
  // Permissions centralisées (désactivées pour activer tous les boutons)
  const canViewSuppliers = true;
  const canManageSuppliers = true;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les fournisseurs depuis Supabase
  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('suppliers')
      .select('*')
      .eq('company_id', user.companyId)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else if (data) setSuppliers(data.map(s => ({
          id: s.id,
          name: s.name,
          contact: s.contact_person || '',
          email: s.email || '',
          phone: s.phone || ''
        })));
        setLoading(false);
      });
  }, [user]);

  // CRUD Handlers
  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.contact || !user) return;
    setLoading(true);
    const { data, error } = await supabase.from('suppliers').insert([
      {
        name: newSupplier.name,
        contact_person: newSupplier.contact,
        email: newSupplier.email,
        phone: newSupplier.phone,
        company_id: user.companyId,
        created_by: user.id,
        updated_by: user.id,
        is_active: true
      }
    ]).select();
    if (error) setError(error.message);
    if (data) setSuppliers(prev => [...prev, {
      id: data[0].id,
      name: data[0].name,
      contact: data[0].contact_person || '',
      email: data[0].email || '',
      phone: data[0].phone || ''
    }]);
    setNewSupplier({});
    setLoading(false);
  };
  const handleEditSupplier = async () => {
    if (!editSupplier || !user) return;
    setLoading(true);
    const { error } = await supabase.from('suppliers').update({
      name: editSupplier.name,
      contact_person: editSupplier.contact,
      email: editSupplier.email,
      phone: editSupplier.phone,
      updated_by: user.id
    }).eq('id', editSupplier.id);
    if (error) setError(error.message);
    setSuppliers(prev => prev.map(s => s.id === editSupplier.id ? editSupplier : s));
    setEditSupplier(null);
    setLoading(false);
  };
  const handleDeleteSupplier = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) setError(error.message);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setLoading(false);
  };

  // Filtrage
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canViewSuppliers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fournisseurs</h1>
          <p className="text-muted-foreground">Gestion des fournisseurs de matières et services</p>
        </div>
        {canManageSuppliers && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Nouveau fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un fournisseur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input value={newSupplier.name || ''} onChange={e => setNewSupplier(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Contact</Label>
                  <Input value={newSupplier.contact || ''} onChange={e => setNewSupplier(s => ({ ...s, contact: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={newSupplier.email || ''} onChange={e => setNewSupplier(s => ({ ...s, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input value={newSupplier.phone || ''} onChange={e => setNewSupplier(s => ({ ...s, phone: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewSupplier({})}>Annuler</Button>
                  <Button onClick={handleAddSupplier}>Ajouter</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
          <CardDescription>CRUD, recherche, filtres</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                {canManageSuppliers && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  {canManageSuppliers && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditSupplier(supplier)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier le fournisseur</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Nom</Label>
                                <Input value={editSupplier?.name || ''} onChange={e => setEditSupplier(s => s ? { ...s, name: e.target.value } : null)} />
                              </div>
                              <div>
                                <Label>Contact</Label>
                                <Input value={editSupplier?.contact || ''} onChange={e => setEditSupplier(s => s ? { ...s, contact: e.target.value } : null)} />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input value={editSupplier?.email || ''} onChange={e => setEditSupplier(s => s ? { ...s, email: e.target.value } : null)} />
                              </div>
                              <div>
                                <Label>Téléphone</Label>
                                <Input value={editSupplier?.phone || ''} onChange={e => setEditSupplier(s => s ? { ...s, phone: e.target.value } : null)} />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditSupplier(null)}>Annuler</Button>
                                <Button onClick={handleEditSupplier}>Enregistrer</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(supplier.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSuppliers.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">Aucun fournisseur trouvé.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SuppliersPage;
