import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ruler, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  User,
  FileText,
  Copy,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types pour les mesures
interface Measurement {
  id: string;
  clientId: string;
  clientName: string;
  garmentType: string;
  measurements: Record<string, number>;
  notes?: string;
  takenBy: string;
  takenAt: string;
  isActive: boolean;
  version: number;
}

interface GarmentType {
  id: string;
  name: string;
  measurementFields: string[];
  description: string;
}

// Types de vêtements avec leurs mesures spécifiques
const garmentTypes: GarmentType[] = [
  {
    id: 'robe',
    name: 'Robe',
    description: 'Mesures pour robes de tous types',
    measurementFields: [
      'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches', 'longueur_robe',
      'longueur_manche', 'tour_de_manche', 'largeur_epaule', 'tour_de_cou',
      'longueur_entre_jambes', 'tour_de_poignet'
    ]
  },
  {
    id: 'costume',
    name: 'Costume',
    description: 'Mesures pour costumes hommes et femmes',
    measurementFields: [
      'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches', 'longueur_veste',
      'longueur_pantalon', 'tour_de_manche', 'largeur_epaule', 'tour_de_cou',
      'longueur_entre_jambes', 'tour_de_poignet', 'largeur_revers'
    ]
  },
  {
    id: 'pantalon',
    name: 'Pantalon',
    description: 'Mesures pour pantalons et jupes',
    measurementFields: [
      'tour_de_taille', 'tour_de_hanches', 'longueur_pantalon', 'longueur_entre_jambes',
      'tour_de_cuisse', 'tour_de_genou', 'tour_de_cheville', 'largeur_pied'
    ]
  },
  {
    id: 'chemise',
    name: 'Chemise',
    description: 'Mesures pour chemises et blouses',
    measurementFields: [
      'tour_de_poitrine', 'tour_de_taille', 'longueur_chemise', 'longueur_manche',
      'tour_de_manche', 'largeur_epaule', 'tour_de_cou', 'tour_de_poignet'
    ]
  },
  {
    id: 'veste',
    name: 'Veste',
    description: 'Mesures pour vestes et blazers',
    measurementFields: [
      'tour_de_poitrine', 'tour_de_taille', 'longueur_veste', 'longueur_manche',
      'tour_de_manche', 'largeur_epaule', 'tour_de_cou', 'largeur_revers'
    ]
  }
];

// Labels en français pour les mesures
const measurementLabels: Record<string, string> = {
  tour_de_poitrine: 'Tour de poitrine',
  tour_de_taille: 'Tour de taille',
  tour_de_hanches: 'Tour de hanches',
  longueur_robe: 'Longueur robe',
  longueur_veste: 'Longueur veste',
  longueur_pantalon: 'Longueur pantalon',
  longueur_chemise: 'Longueur chemise',
  longueur_manche: 'Longueur manche',
  tour_de_manche: 'Tour de manche',
  largeur_epaule: 'Largeur épaule',
  tour_de_cou: 'Tour de cou',
  longueur_entre_jambes: 'Entre-jambes',
  tour_de_poignet: 'Tour de poignet',
  largeur_revers: 'Largeur revers',
  tour_de_cuisse: 'Tour de cuisse',
  tour_de_genou: 'Tour de genou',
  tour_de_cheville: 'Tour de cheville',
  largeur_pied: 'Largeur pied'
};

// Données simulées
const mockMeasurements: Measurement[] = [
  {
    id: '1',
    clientId: 'client-1',
    clientName: 'Marie Dupont',
    garmentType: 'robe',
    measurements: {
      tour_de_poitrine: 88,
      tour_de_taille: 70,
      tour_de_hanches: 92,
      longueur_robe: 110,
      longueur_manche: 60,
      tour_de_manche: 32,
      largeur_epaule: 38,
      tour_de_cou: 36,
      longueur_entre_jambes: 75,
      tour_de_poignet: 16
    },
    notes: 'Client préfère les robes ajustées',
    takenBy: 'Alice Couture',
    takenAt: '2024-01-15T10:30:00Z',
    isActive: true,
    version: 1
  },
  {
    id: '2',
    clientId: 'client-2',
    clientName: 'Jean Martin',
    garmentType: 'costume',
    measurements: {
      tour_de_poitrine: 102,
      tour_de_taille: 88,
      tour_de_hanches: 98,
      longueur_veste: 75,
      longueur_pantalon: 105,
      longueur_manche: 65,
      tour_de_manche: 38,
      largeur_epaule: 45,
      tour_de_cou: 40,
      longueur_entre_jambes: 80,
      tour_de_poignet: 20,
      largeur_revers: 8
    },
    notes: 'Costume classique 3 pièces',
    takenBy: 'Marc Tailleur',
    takenAt: '2024-01-16T14:20:00Z',
    isActive: true,
    version: 1
  },
  {
    id: '3',
    clientId: 'client-1',
    clientName: 'Marie Dupont',
    garmentType: 'pantalon',
    measurements: {
      tour_de_taille: 70,
      tour_de_hanches: 92,
      longueur_pantalon: 100,
      longueur_entre_jambes: 75,
      tour_de_cuisse: 55,
      tour_de_genou: 38,
      tour_de_cheville: 22,
      largeur_pied: 10
    },
    notes: 'Pantalon cigarette',
    takenBy: 'Alice Couture',
    takenAt: '2024-01-20T09:15:00Z',
    isActive: true,
    version: 1
  }
];

export function MeasurementsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('measurements');
  const [searchTerm, setSearchTerm] = useState('');
  const [garmentTypeFilter, setGarmentTypeFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  
  // États pour la création/modification
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({
    garmentType: '',
    measurements: {},
    notes: ''
  });

  // Effet pour gérer les paramètres URL (client pré-sélectionné)
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    const clientName = searchParams.get('clientName');
    
    if (clientId && clientName) {
      // Pré-remplir le formulaire avec le client sélectionné
      setNewMeasurement(prev => ({
        ...prev,
        clientId: clientId,
        clientName: decodeURIComponent(clientName)
      }));
      
      // Ouvrir automatiquement le dialog de création
      setIsCreateDialogOpen(true);
      
      // Afficher un message informatif
      toast({
        title: "Nouveau client détecté",
        description: `Prêt à créer les mesures pour ${decodeURIComponent(clientName)}`,
      });
    }
  }, [searchParams]);

  // Permissions
  const canViewMeasurements = ['owner', 'manager', 'tailor', 'production'].includes(user?.role || '');
  const canManageMeasurements = ['owner', 'manager', 'tailor'].includes(user?.role || '');

  if (!canViewMeasurements) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Ruler className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrage des mesures
  const filteredMeasurements = mockMeasurements.filter(measurement => {
    const matchesSearch = measurement.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGarmentType = garmentTypeFilter === 'all' || measurement.garmentType === garmentTypeFilter;
    const matchesClient = clientFilter === 'all' || measurement.clientId === clientFilter;
    
    return matchesSearch && matchesGarmentType && matchesClient;
  });

  // Clients uniques pour le filtre
  const uniqueClients = Array.from(new Set(mockMeasurements.map(m => m.clientId)));

  // Statistiques
  const stats = {
    totalMeasurements: mockMeasurements.length,
    activeMeasurements: mockMeasurements.filter(m => m.isActive).length,
    uniqueClients: uniqueClients.length,
    garmentTypes: garmentTypes.length
  };

  // Handlers
  const handleCreateMeasurement = async () => {
    if (!newMeasurement.garmentType || !newMeasurement.clientName) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de vêtement et un client.",
        variant: "destructive"
      });
      return;
    }

    // Validation des mesures
    const garmentType = garmentTypes.find(gt => gt.id === newMeasurement.garmentType);
    if (garmentType) {
      const missingMeasurements = garmentType.measurementFields.filter(
        field => !newMeasurement.measurements?.[field] || newMeasurement.measurements[field] <= 0
      );
      
      if (missingMeasurements.length > 0) {
        toast({
          title: "Erreur",
          description: `Veuillez remplir toutes les mesures : ${missingMeasurements.map(f => measurementLabels[f]).join(', ')}`,
          variant: "destructive"
        });
        return;
      }
    }

    // Simulation de création
    const measurement: Measurement = {
      id: `measurement-${Date.now()}`,
      clientId: `client-${Date.now()}`,
      clientName: newMeasurement.clientName!,
      garmentType: newMeasurement.garmentType!,
      measurements: newMeasurement.measurements || {},
      notes: newMeasurement.notes,
      takenBy: user?.firstName + ' ' + user?.lastName || 'Utilisateur',
      takenAt: new Date().toISOString(),
      isActive: true,
      version: 1
    };

    mockMeasurements.push(measurement);

    toast({
      title: "Succès",
      description: "Mesures enregistrées avec succès.",
    });

    setIsCreateDialogOpen(false);
    setNewMeasurement({
      garmentType: '',
      measurements: {},
      notes: ''
    });
  };

  const handleEditMeasurement = async () => {
    if (!selectedMeasurement) return;

    // Simulation de mise à jour
    const index = mockMeasurements.findIndex(m => m.id === selectedMeasurement.id);
    if (index !== -1) {
      mockMeasurements[index] = {
        ...selectedMeasurement,
        version: selectedMeasurement.version + 1,
        takenAt: new Date().toISOString(),
        takenBy: user?.firstName + ' ' + user?.lastName || 'Utilisateur'
      };
    }

    toast({
      title: "Succès",
      description: "Mesures mises à jour avec succès.",
    });

    setIsEditDialogOpen(false);
    setSelectedMeasurement(null);
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ces mesures ?')) {
      return;
    }

    const index = mockMeasurements.findIndex(m => m.id === measurementId);
    if (index !== -1) {
      mockMeasurements.splice(index, 1);
    }

    toast({
      title: "Succès",
      description: "Mesures supprimées avec succès.",
    });
  };

  const handleDuplicateMeasurement = (measurement: Measurement) => {
    const duplicatedMeasurement: Measurement = {
      ...measurement,
      id: `measurement-${Date.now()}`,
      version: 1,
      takenAt: new Date().toISOString(),
      takenBy: user?.firstName + ' ' + user?.lastName || 'Utilisateur'
    };

    mockMeasurements.push(duplicatedMeasurement);

    toast({
      title: "Succès",
      description: "Mesures dupliquées avec succès.",
    });
  };

  const handleExportMeasurements = async () => {
    try {
      const csvContent = [
        ['Client', 'Type de vêtement', 'Date prise', 'Prise par', 'Version', 'Notes'],
        ...filteredMeasurements.map(measurement => [
          measurement.clientName,
          garmentTypes.find(gt => gt.id === measurement.garmentType)?.name || measurement.garmentType,
          new Date(measurement.takenAt).toLocaleDateString('fr-FR'),
          measurement.takenBy,
          measurement.version.toString(),
          measurement.notes || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mesures_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export terminé",
        description: "Les mesures ont été exportées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export.",
        variant: "destructive"
      });
    }
  };

  const getSelectedGarmentType = () => {
    return garmentTypes.find(gt => gt.id === newMeasurement.garmentType);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Mesures</h1>
          <p className="text-muted-foreground">
            Visualisation et gestion des mesures prises pour les clients
          </p>
        </div>
        {canManageMeasurements && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportMeasurements}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        )}
      </div>

      {/* Message informatif */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Pour créer de nouvelles mesures
              </p>
              <p className="text-xs text-blue-700">
                Créez d'abord un client depuis le module "Clients", puis les mesures seront automatiquement proposées.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total mesures</p>
                <p className="text-2xl font-bold">{stats.totalMeasurements}</p>
              </div>
              <Ruler className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mesures actives</p>
                <p className="text-2xl font-bold">{stats.activeMeasurements}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clients uniques</p>
                <p className="text-2xl font-bold">{stats.uniqueClients}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Types de vêtements</p>
                <p className="text-2xl font-bold">{stats.garmentTypes}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="measurements">Mesures</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-4">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom de client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={garmentTypeFilter} onValueChange={setGarmentTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Type de vêtement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {garmentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les clients</SelectItem>
                      {uniqueClients.map(clientId => {
                        const client = mockMeasurements.find(m => m.clientId === clientId);
                        return (
                          <SelectItem key={clientId} value={clientId}>
                            {client?.clientName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des mesures */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mesures des Clients</CardTitle>
                  <CardDescription>Historique des mesures prises</CardDescription>
                </div>
                {canManageMeasurements && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle mesure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Nouvelle mesure</DialogTitle>
                        <DialogDescription>
                          Saisir les mesures d'un client pour un type de vêtement
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="clientName">Nom du client *</Label>
                            <Input
                              id="clientName"
                              value={newMeasurement.clientName || ''}
                              onChange={(e) => setNewMeasurement(prev => ({ ...prev, clientName: e.target.value }))}
                              placeholder="Nom et prénom du client"
                            />
                          </div>
                          <div>
                            <Label htmlFor="garmentType">Type de vêtement *</Label>
                            <Select value={newMeasurement.garmentType || ''} onValueChange={(value) => setNewMeasurement(prev => ({ ...prev, garmentType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                                {garmentTypes.map(type => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {getSelectedGarmentType() && (
                          <div className="space-y-4">
                            <Label>Mesures (en cm) *</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {getSelectedGarmentType()!.measurementFields.map(field => (
                                <div key={field}>
                                  <Label htmlFor={field}>{measurementLabels[field]}</Label>
                                  <Input
                                    id={field}
                                    type="number"
                                    step="0.5"
                                    value={newMeasurement.measurements?.[field] || ''}
                                    onChange={(e) => setNewMeasurement(prev => ({
                                      ...prev,
                                      measurements: {
                                        ...prev.measurements,
                                        [field]: Number(e.target.value)
                                      }
                                    }))}
                                    placeholder="0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Input
                            id="notes"
                            value={newMeasurement.notes || ''}
                            onChange={(e) => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Notes sur les mesures, préférences, etc."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateMeasurement}>
                          Enregistrer
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
                    <TableHead>Client</TableHead>
                    <TableHead>Type de vêtement</TableHead>
                    <TableHead>Date prise</TableHead>
                    <TableHead>Prise par</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeasurements.map((measurement) => (
                    <TableRow key={measurement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{measurement.clientName}</p>
                          {measurement.notes && (
                            <p className="text-sm text-muted-foreground">{measurement.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {garmentTypes.find(gt => gt.id === measurement.garmentType)?.name || measurement.garmentType}
                      </TableCell>
                      <TableCell>
                        {new Date(measurement.takenAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{measurement.takenBy}</TableCell>
                      <TableCell>
                        <Badge variant="outline">v{measurement.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={measurement.isActive ? "default" : "secondary"}>
                          {measurement.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManageMeasurements && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDuplicateMeasurement(measurement)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMeasurement(measurement);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteMeasurement(measurement.id)}
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
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Modèles de mesures */}
          <Card>
            <CardHeader>
              <CardTitle>Modèles de Mesures</CardTitle>
              <CardDescription>Types de vêtements et leurs mesures standard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {garmentTypes.map((type) => (
                  <Card key={type.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{type.name}</h3>
                      <Badge variant="outline">{type.measurementFields.length} mesures</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <div className="space-y-1">
                      {type.measurementFields.map(field => (
                        <div key={field} className="text-xs text-muted-foreground">
                          • {measurementLabels[field]}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les mesures</DialogTitle>
          </DialogHeader>
          {selectedMeasurement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <p className="text-sm font-medium">{selectedMeasurement.clientName}</p>
                </div>
                <div>
                  <Label>Type de vêtement</Label>
                  <p className="text-sm font-medium">
                    {garmentTypes.find(gt => gt.id === selectedMeasurement.garmentType)?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Mesures (en cm)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {garmentTypes.find(gt => gt.id === selectedMeasurement.garmentType)?.measurementFields.map(field => (
                    <div key={field}>
                      <Label htmlFor={`edit-${field}`}>{measurementLabels[field]}</Label>
                      <Input
                        id={`edit-${field}`}
                        type="number"
                        step="0.5"
                        value={selectedMeasurement.measurements[field] || ''}
                        onChange={(e) => setSelectedMeasurement(prev => prev ? {
                          ...prev,
                          measurements: {
                            ...prev.measurements,
                            [field]: Number(e.target.value)
                          }
                        } : null)}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={selectedMeasurement.notes || ''}
                  onChange={(e) => setSelectedMeasurement(prev => prev ? {
                    ...prev,
                    notes: e.target.value
                  } : null)}
                  placeholder="Notes sur les mesures"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditMeasurement}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}