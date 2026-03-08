import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, User, Mail, Phone,
  Calendar, ShoppingCart, Download, Ruler
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type ClientRow = Database['public']['Tables']['clients']['Row'];

export function ClientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [showMeasurementPrompt, setShowMeasurementPrompt] = useState(false);
  const [createdClient, setCreatedClient] = useState<ClientRow | null>(null);

  const { data: clients, loading, refetch } = useSupabaseQuery<ClientRow>('clients', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<ClientRow>('clients');

  // Also fetch orders to compute totalOrders/totalSpent per client
  const { data: orders } = useSupabaseQuery<Database['public']['Tables']['orders']['Row']>('orders', {
    select: 'id, client_id, total_amount'
  });

  const clientsList = clients || [];
  const ordersList = orders || [];

  const getClientStats = (clientId: string) => {
    const clientOrders = ordersList.filter(o => o.client_id === clientId);
    return {
      totalOrders: clientOrders.length,
      totalSpent: clientOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
    };
  };

  const filteredClients = clientsList.filter(client => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && client.is_active) ||
      (statusFilter === 'inactive' && !client.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = async (formData: any) => {
    try {
      const result = await create({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        is_active: formData.isActive ?? true,
        gender: formData.gender || 'homme'
      });
      toast({ title: "Succès", description: "Client ajouté avec succès." });
      setIsCreateDialogOpen(false);
      setCreatedClient(result as ClientRow);
      setShowMeasurementPrompt(true);
      refetch();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Erreur lors de l'ajout.", variant: "destructive" });
    }
  };

  const handleUpdateClient = async (id: string, formData: any) => {
    try {
      await update(id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        is_active: formData.isActive,
        gender: formData.gender
      });
      toast({ title: "Succès", description: "Client mis à jour." });
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteClient = async (client: ClientRow) => {
    if (!confirm(`Supprimer ${client.first_name} ${client.last_name} ?`)) return;
    try {
      await remove(client.id);
      toast({ title: "Succès", description: "Client supprimé." });
      refetch();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleExportClients = () => {
    const csvContent = [
      ['Nom', 'Prénom', 'Email', 'Téléphone', 'Adresse', 'Type', 'Statut'],
      ...clientsList.map(c => [c.last_name, c.first_name, c.email || '', c.phone || '', c.address || '', c.gender || '', c.is_active ? 'Actif' : 'Inactif'])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Succès", description: "Export terminé." });
  };

  const activeClients = clientsList.filter(c => c.is_active).length;
  const newThisMonth = clientsList.filter(c => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">Gestion complète de la base clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportClients}>
            <Download className="h-4 w-4 mr-2" />Exporter
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouveau client</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau client</DialogTitle>
                <DialogDescription>Saisissez les informations du client</DialogDescription>
              </DialogHeader>
              <ClientForm onSubmit={handleAddClient} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total clients</p><p className="text-2xl font-bold">{clientsList.length}</p></div><User className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Clients actifs</p><p className="text-2xl font-bold">{activeClients}</p></div><User className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Nouveaux ce mois</p><p className="text-2xl font-bold">{newThisMonth}</p></div><User className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">CA total clients</p><p className="text-2xl font-bold">{formatFCFA(ordersList.reduce((s, o) => s + Number(o.total_amount || 0), 0))}</p></div><ShoppingCart className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 border rounded-md">
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>{filteredClients.length} client(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>CA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const stats = getClientStats(client.id);
                return (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.first_name} {client.last_name}</p>
                      <p className="text-sm text-muted-foreground">Depuis {new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && <div className="flex items-center text-sm"><Mail className="h-3 w-3 mr-1 text-muted-foreground" />{client.email}</div>}
                      {client.phone && <div className="flex items-center text-sm"><Phone className="h-3 w-3 mr-1 text-muted-foreground" />{client.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={client.is_active ? "default" : "secondary"}>{client.is_active ? "Actif" : "Inactif"}</Badge></TableCell>
                  <TableCell>{stats.totalOrders}</TableCell>
                  <TableCell>{formatFCFA(stats.totalSpent)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(client); setIsEditDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientForm 
              client={selectedClient}
              onSubmit={(data) => handleUpdateClient(selectedClient.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showMeasurementPrompt} onOpenChange={setShowMeasurementPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer les mesures du client</DialogTitle>
            <DialogDescription>
              Souhaitez-vous créer les mesures pour <strong>{createdClient?.first_name} {createdClient?.last_name}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
            <Ruler className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Prise de mesures recommandée</p>
              <p className="text-sm text-muted-foreground">Pour permettre les commandes personnalisées.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowMeasurementPrompt(false); setCreatedClient(null); }}>Plus tard</Button>
            <Button onClick={() => {
              if (createdClient) navigate(`/dashboard/measurements?clientId=${createdClient.id}&clientName=${encodeURIComponent(createdClient.first_name + ' ' + createdClient.last_name)}`);
              setShowMeasurementPrompt(false);
              setCreatedClient(null);
            }}><Ruler className="h-4 w-4 mr-2" />Créer les mesures</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClientForm({ client, onSubmit }: { client?: ClientRow; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    firstName: client?.first_name || '',
    lastName: client?.last_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    notes: client?.notes || '',
    isActive: client?.is_active ?? true,
    gender: client?.gender || ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) { setError('Le prénom et le nom sont obligatoires.'); return; }
    setError(null);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-destructive text-sm font-medium">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Prénom *</Label><Input value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} required /></div>
        <div><Label>Nom *</Label><Input value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
        <div><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
      </div>
      <div><Label>Adresse</Label><Textarea value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} /></div>
      <div>
        <Label>Type de client</Label>
        <div className="flex gap-4 mt-2">
          {['homme', 'femme', 'enfant'].map(g => (
            <label key={g} className="flex items-center gap-1">
              <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={() => setFormData(p => ({ ...p, gender: g }))} />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      </div>
      <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
        <Label>Client actif</Label>
      </div>
      <div className="flex justify-end"><Button type="submit">{client ? 'Enregistrer' : 'Créer le client'}</Button></div>
    </form>
  );
}

export default ClientsPage;
