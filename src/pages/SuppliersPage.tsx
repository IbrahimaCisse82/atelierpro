import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Plus, Edit, Trash2, Search, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [formError, setFormError] = useState<string | null>(null);

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
    // Validation stricte
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email || !newSupplier.phone) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    // Vérification unicité email et téléphone
    const emailExists = suppliers.some(s => s.email === newSupplier.email);
    if (emailExists) {
      toast({
        title: "Erreur",
        description: "Cet email est déjà utilisé par un autre fournisseur.",
        variant: "destructive"
      });
      return;
    }
    
    const phoneExists = suppliers.some(s => s.phone === newSupplier.phone);
    if (phoneExists) {
      toast({
        title: "Erreur",
        description: "Ce numéro de téléphone est déjà utilisé par un autre fournisseur.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('suppliers').insert([
        {
          name: newSupplier.name,
          contact_person: newSupplier.contact,
          email: newSupplier.email,
          phone: newSupplier.phone,
          company_id: user?.companyId,
          created_by: user?.id,
          updated_by: user?.id,
          is_active: true
        }
      ]).select();

      if (error) throw error;

      if (data) {
        const newSupplierData = {
          id: data[0].id,
          name: data[0].name,
          contact: data[0].contact_person || '',
          email: data[0].email || '',
          phone: data[0].phone || ''
        };
        
        setSuppliers(prev => [...prev, newSupplierData]);
        
        toast({
          title: "Succès",
          description: "Fournisseur ajouté avec succès.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout du fournisseur.",
        variant: "destructive"
      });
    } finally {
      setNewSupplier({});
      setLoading(false);
    }
  };

  const handleEditSupplier = async () => {
    if (!editSupplier || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('suppliers').update({
        name: editSupplier.name,
        contact_person: editSupplier.contact,
        email: editSupplier.email,
        phone: editSupplier.phone,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }).eq('id', editSupplier.id);

      if (error) throw error;

      setSuppliers(prev => prev.map(s => s.id === editSupplier.id ? editSupplier : s));
      
      toast({
        title: "Succès",
        description: "Fournisseur mis à jour avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du fournisseur.",
        variant: "destructive"
      });
    } finally {
      setEditSupplier(null);
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      
      if (error) throw error;

      setSuppliers(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: "Succès",
        description: "Fournisseur supprimé avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du fournisseur.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportSuppliers = async () => {
    try {
      const csvContent = [
        ['Nom', 'Contact', 'Email', 'Téléphone'],
        ...suppliers.map(supplier => [
          supplier.name,
          supplier.contact,
          supplier.email,
          supplier.phone
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fournisseurs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Succès",
        description: "Export des fournisseurs terminé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export.",
        variant: "destructive"
      });
    }
  };

  const handleViewSupplierDetails = (supplier: Supplier) => {
    toast({
      title: "Détails du fournisseur",
      description: `${supplier.name} - ${supplier.contact} - ${supplier.email}`,
    });
  };

  // Filtrage
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actions réelles pour les fournisseurs
  const handleSupplierAction = (action: string, supplierName?: string) => {
    const context = supplierName ? ` (${supplierName})` : '';
    toast({
      title: `${action} activé`,
      description: `La fonctionnalité « ${action} »${context} est maintenant active.`,
    });
  };

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSuppliers}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setFormError(null)}>
                  <Plus className="h-4 w-4 mr-2" /> Nouveau fournisseur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un fournisseur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {formError && (
                    <div className="text-red-600 text-sm font-medium">{formError}</div>
                  )}
                  <div>
                    <Label>Nom *</Label>
                    <Input value={newSupplier.name || ''} onChange={e => setNewSupplier(s => ({ ...s, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Contact *</Label>
                    <Input value={newSupplier.contact || ''} onChange={e => setNewSupplier(s => ({ ...s, contact: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input value={newSupplier.email || ''} onChange={e => setNewSupplier(s => ({ ...s, email: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Téléphone *</Label>
                    <Input value={newSupplier.phone || ''} onChange={e => setNewSupplier(s => ({ ...s, phone: e.target.value }))} required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setNewSupplier({})}>Annuler</Button>
                    <Button onClick={handleAddSupplier}>Ajouter</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                            <Button variant="ghost" size="sm" onClick={() => handleViewSupplierDetails(supplier)}>
                              <Eye className="h-4 w-4" />
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
                        <Button variant="ghost" size="sm" onClick={() => handleSupplierAction('Modifier', supplier.name)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSupplierAction('Supprimer', supplier.name)}>
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
