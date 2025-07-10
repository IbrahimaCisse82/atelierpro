import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AccessControl } from '@/components/common/AccessControl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Eye, Edit, Scissors, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les productions
interface Production {
  id: string;
  label: string;
  status: string;
  startDate: string;
  endDate: string;
  assignedTeam?: string;
  progress: number;
}

// Statuts de production
const productionStatuses = [
  { value: 'planned', label: 'Planifiée', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'En cours', color: 'bg-blue-500' },
  { value: 'paused', label: 'En pause', color: 'bg-yellow-500' },
  { value: 'completed', label: 'Terminée', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-500' }
];

// Données simulées
const mockProductions: Production[] = [
  {
    id: '1',
    label: 'Robe été 2024',
    status: 'in_progress',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    assignedTeam: 'Equipe A',
    progress: 60
  },
  {
    id: '2',
    label: 'Costume mariage',
    status: 'planned',
    startDate: '2024-07-12',
    endDate: '2024-07-20',
    assignedTeam: 'Equipe B',
    progress: 0
  }
];

export function ProductionPage() {
  const { user } = useAuth();
  const [productions, setProductions] = useState<Production[]>(mockProductions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const canViewProduction = ['owner', 'manager', 'tailor', 'production'].includes(user?.role || '');
  const canManageProduction = ['owner', 'manager', 'production'].includes(user?.role || '');
  
  if (!canViewProduction) {
    return (
      <AccessControl allowedRoles={["owner", "manager", "tailor", "production"]}>
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

  const filteredProductions = productions.filter(prod => {
    const matchesSearch = prod.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prod.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    return productionStatuses.find(s => s.value === status) || { value: status, label: status, color: 'bg-gray-500' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Production</h1>
          <p className="text-muted-foreground">Suivi des lots de production</p>
        </div>
        {canManageProduction && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle production
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle production</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="label">Libellé</Label>
                  <Input id="label" placeholder="Nom du lot de production" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start">Début</Label>
                    <Input type="date" id="start" />
                  </div>
                  <div>
                    <Label htmlFor="end">Fin</Label>
                    <Input type="date" id="end" />
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
                  placeholder="Rechercher par libellé..."
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
                {productionStatuses.map(status => (
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
      <Card>
        <CardHeader>
          <CardTitle>Lots de production</CardTitle>
          <CardDescription>Liste des lots en cours ou planifiés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libellé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductions.map((prod) => {
                const statusInfo = getStatusInfo(prod.status);
                return (
                  <TableRow key={prod.id}>
                    <TableCell>{prod.label}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
                        <Badge>{statusInfo.label}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{Math.round(prod.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${prod.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{prod.assignedTeam || <span className="text-muted-foreground">Non assignée</span>}</TableCell>
                    <TableCell>{new Date(prod.startDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(prod.endDate).toLocaleDateString('fr-FR')}</TableCell>
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
                              <DialogTitle>Détails du lot {prod.label}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Equipe assignée</Label>
                                <p className="text-sm">{prod.assignedTeam || 'Non assignée'}</p>
                              </div>
                              <div>
                                <Label>Statut</Label>
                                <Badge>{statusInfo.label}</Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {canManageProduction && (
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