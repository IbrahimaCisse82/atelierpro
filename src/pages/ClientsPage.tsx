import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  MessageSquare,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les clients
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: number;
  satisfaction: number;
}

// Données simulées
const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@email.com',
    phone: '06 12 34 56 78',
    address: '123 Rue de la Paix, 75001 Paris',
    notes: 'Client fidèle, préfère les couleurs sombres',
    isActive: true,
    createdAt: '2023-01-15',
    lastOrderDate: '2024-01-15',
    totalOrders: 8,
    totalSpent: 2450,
    satisfaction: 5
  },
  {
    id: '2',
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@email.com',
    phone: '06 98 76 54 32',
    address: '456 Avenue des Champs, 75008 Paris',
    notes: 'Aime les costumes sur mesure',
    isActive: true,
    createdAt: '2023-03-20',
    lastOrderDate: '2024-01-10',
    totalOrders: 5,
    totalSpent: 1800,
    satisfaction: 4
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@email.com',
    phone: '06 11 22 33 44',
    address: '789 Boulevard Saint-Germain, 75006 Paris',
    notes: 'Nouvelle cliente, très satisfaite',
    isActive: true,
    createdAt: '2024-01-05',
    lastOrderDate: '2024-01-12',
    totalOrders: 2,
    totalSpent: 650,
    satisfaction: 5
  }
];

export function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Permissions
  const canManageClients = ['owner', 'orders', 'customer_service'].includes(user?.role || '');
  const canViewClients = ['owner', 'manager', 'orders', 'customer_service'].includes(user?.role || '');
  const canViewClientDetails = ['owner', 'orders', 'customer_service'].includes(user?.role || '');

  // Filtrer les clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && client.isActive) ||
      (statusFilter === 'inactive' && !client.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'satisfaction'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
      satisfaction: 0
    };
    setClients(prev => [...prev, newClient]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
    setIsEditDialogOpen(false);
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const getSatisfactionStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  if (!canViewClients) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            Gestion complète de la base clients et suivi de la satisfaction
          </p>
        </div>
        {canManageClients && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau client</DialogTitle>
                <DialogDescription>
                  Saisissez les informations du client
                </DialogDescription>
              </DialogHeader>
              <ClientForm onSubmit={handleCreateClient} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clients actifs</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.isActive).length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nouveaux ce mois</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => {
                    const createdAt = new Date(c.createdAt);
                    const now = new Date();
                    return createdAt.getMonth() === now.getMonth() && 
                           createdAt.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction moy.</p>
                <p className="text-2xl font-bold">
                  {(clients.reduce((sum, c) => sum + c.satisfaction, 0) / clients.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Clients actifs</option>
                <option value="inactive">Clients inactifs</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>
            {filteredClients.length} client(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Chiffre d'affaires</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Dernière commande</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.firstName} {client.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        Client depuis {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.isActive ? "default" : "secondary"}>
                      {client.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{client.totalOrders}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">€{client.totalSpent.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getSatisfactionStars(client.satisfaction)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.lastOrderDate ? (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(client.lastOrderDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Aucune</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Détails du client</DialogTitle>
                          </DialogHeader>
                          <ClientDetails client={client} />
                        </DialogContent>
                      </Dialog>
                      {canManageClients && (
                        <>
                          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedClient(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Modifier le client</DialogTitle>
                              </DialogHeader>
                              {selectedClient && (
                                <ClientForm 
                                  client={selectedClient}
                                  onSubmit={(updates) => handleUpdateClient(selectedClient.id, updates)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant formulaire client
function ClientForm({ 
  client, 
  onSubmit 
}: { 
  client?: Client; 
  onSubmit: (data: any) => void; 
}) {
  const [formData, setFormData] = useState({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    notes: client?.notes || '',
    isActive: client?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Adresse</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <Label htmlFor="isActive">Client actif</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          {client ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}

// Composant détails client
function ClientDetails({ client }: { client: Client }) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList>
        <TabsTrigger value="info">Informations</TabsTrigger>
        <TabsTrigger value="orders">Commandes</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Prénom</Label>
            <p className="text-sm">{client.firstName}</p>
          </div>
          <div>
            <Label>Nom</Label>
            <p className="text-sm">{client.lastName}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="text-sm">{client.email}</p>
          </div>
          <div>
            <Label>Téléphone</Label>
            <p className="text-sm">{client.phone || 'Non renseigné'}</p>
          </div>
        </div>
        <div>
          <Label>Adresse</Label>
          <p className="text-sm">{client.address || 'Non renseignée'}</p>
        </div>
        <div>
          <Label>Notes</Label>
          <p className="text-sm">{client.notes || 'Aucune note'}</p>
        </div>
      </TabsContent>
      
      <TabsContent value="orders" className="space-y-4">
        <div className="text-center text-muted-foreground">
          Historique des commandes en cours de développement
        </div>
      </TabsContent>
      
      <TabsContent value="communications" className="space-y-4">
        <div className="text-center text-muted-foreground">
          Historique des communications en cours de développement
        </div>
      </TabsContent>
    </Tabs>
  );
} 