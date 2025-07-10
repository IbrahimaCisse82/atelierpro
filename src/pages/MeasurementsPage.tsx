import React, { useState } from 'react';
import { AccessControl } from '@/components/common/AccessControl';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle,
  Clock,
  User,
  Ruler,
  History,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les mesures
interface ClientMeasurement {
  id: string;
  clientId: string;
  clientName: string;
  measurementDate: string;
  version: number;
  // Mesures principales
  bust?: number;
  waist?: number;
  hips?: number;
  shoulderWidth?: number;
  armLength?: number;
  legLength?: number;
  neckCircumference?: number;
  // Mesures supplémentaires
  chestWidth?: number;
  backWidth?: number;
  armCircumference?: number;
  thighCircumference?: number;
  calfCircumference?: number;
  // Validation
  isValidated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  notes?: string;
  // Métadonnées
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lastMeasurementDate?: string;
  measurementCount: number;
}

// Données simulées
const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@email.com',
    lastMeasurementDate: '2024-01-15',
    measurementCount: 3
  },
  {
    id: '2',
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@email.com',
    lastMeasurementDate: '2024-01-10',
    measurementCount: 2
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@email.com',
    lastMeasurementDate: '2024-01-05',
    measurementCount: 1
  }
];

const mockMeasurements: ClientMeasurement[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Marie Dupont',
    measurementDate: '2024-01-15',
    version: 3,
    bust: 88,
    waist: 70,
    hips: 92,
    shoulderWidth: 38,
    armLength: 58,
    legLength: 95,
    neckCircumference: 36,
    chestWidth: 42,
    backWidth: 40,
    armCircumference: 28,
    thighCircumference: 52,
    calfCircumference: 34,
    isValidated: true,
    validatedBy: 'Alice Couture',
    validatedAt: '2024-01-15T16:30:00Z',
    notes: 'Mesures prises après perte de poids',
    createdAt: '2024-01-15T14:00:00Z',
    createdBy: 'Alice Couture',
    updatedAt: '2024-01-15T16:30:00Z',
    updatedBy: 'Alice Couture'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Jean Martin',
    measurementDate: '2024-01-10',
    version: 2,
    bust: 102,
    waist: 88,
    hips: 98,
    shoulderWidth: 44,
    armLength: 62,
    legLength: 100,
    neckCircumference: 40,
    chestWidth: 48,
    backWidth: 46,
    armCircumference: 32,
    thighCircumference: 58,
    calfCircumference: 38,
    isValidated: true,
    validatedBy: 'Marc Tailleur',
    validatedAt: '2024-01-10T15:45:00Z',
    notes: 'Mesures pour costume 3 pièces',
    createdAt: '2024-01-10T14:30:00Z',
    createdBy: 'Marc Tailleur',
    updatedAt: '2024-01-10T15:45:00Z',
    updatedBy: 'Marc Tailleur'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Sophie Bernard',
    measurementDate: '2024-01-05',
    version: 1,
    bust: 85,
    waist: 68,
    hips: 90,
    shoulderWidth: 36,
    armLength: 56,
    legLength: 92,
    neckCircumference: 35,
    chestWidth: 40,
    backWidth: 38,
    armCircumference: 26,
    thighCircumference: 50,
    calfCircumference: 32,
    isValidated: false,
    notes: 'Nouvelle cliente, première prise de mesures',
    createdAt: '2024-01-05T10:00:00Z',
    createdBy: 'Emma Style',
    updatedAt: '2024-01-05T10:00:00Z',
    updatedBy: 'Emma Style'
  }
];

export function MeasurementsPage() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<ClientMeasurement[]>(mockMeasurements);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationFilter, setValidationFilter] = useState<'all' | 'validated' | 'pending'>('all');
  const [selectedMeasurement, setSelectedMeasurement] = useState<ClientMeasurement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Permissions centralisées
  const canViewMeasurements = ['owner', 'manager', 'measurements', 'production', 'tailor'].includes(user?.role || '');
  const canManageMeasurements = ['owner', 'manager', 'measurements'].includes(user?.role || '');
  const canValidateMeasurements = ['owner', 'manager', 'measurements'].includes(user?.role || '');
  if (!canViewMeasurements) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Ruler className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à ce module.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrer les mesures
  const filteredMeasurements = measurements.filter(measurement => {
    const matchesSearch = 
      measurement.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesValidation = validationFilter === 'all' || 
      (validationFilter === 'validated' && measurement.isValidated) ||
      (validationFilter === 'pending' && !measurement.isValidated);
    
    return matchesSearch && matchesValidation;
  });

  // Calculer les statistiques
  const totalMeasurements = measurements.length;
  const validatedMeasurements = measurements.filter(m => m.isValidated).length;
  const pendingMeasurements = measurements.filter(m => !m.isValidated).length;
  const recentMeasurements = measurements.filter(m => {
    const measurementDate = new Date(m.measurementDate);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return measurementDate > thirtyDaysAgo;
  }).length;

  const handleCreateMeasurement = (measurementData: Partial<ClientMeasurement>) => {
    const newMeasurement: ClientMeasurement = {
      id: Date.now().toString(),
      clientId: measurementData.clientId!,
      clientName: measurementData.clientName!,
      measurementDate: new Date().toISOString().split('T')[0],
      version: 1,
      isValidated: false,
      createdAt: new Date().toISOString(),
      createdBy: `${user?.firstName} ${user?.lastName}`,
      updatedAt: new Date().toISOString(),
      updatedBy: `${user?.firstName} ${user?.lastName}`,
      ...measurementData,
      bust: typeof measurementData.bust === 'string' ? Number(measurementData.bust) : measurementData.bust,
      waist: typeof measurementData.waist === 'string' ? Number(measurementData.waist) : measurementData.waist,
      hips: typeof measurementData.hips === 'string' ? Number(measurementData.hips) : measurementData.hips,
      shoulderWidth: typeof measurementData.shoulderWidth === 'string' ? Number(measurementData.shoulderWidth) : measurementData.shoulderWidth,
      armLength: typeof measurementData.armLength === 'string' ? Number(measurementData.armLength) : measurementData.armLength,
      legLength: typeof measurementData.legLength === 'string' ? Number(measurementData.legLength) : measurementData.legLength,
      neckCircumference: typeof measurementData.neckCircumference === 'string' ? Number(measurementData.neckCircumference) : measurementData.neckCircumference,
      chestWidth: typeof measurementData.chestWidth === 'string' ? Number(measurementData.chestWidth) : measurementData.chestWidth,
      backWidth: typeof measurementData.backWidth === 'string' ? Number(measurementData.backWidth) : measurementData.backWidth,
      armCircumference: typeof measurementData.armCircumference === 'string' ? Number(measurementData.armCircumference) : measurementData.armCircumference,
      thighCircumference: typeof measurementData.thighCircumference === 'string' ? Number(measurementData.thighCircumference) : measurementData.thighCircumference,
      calfCircumference: typeof measurementData.calfCircumference === 'string' ? Number(measurementData.calfCircumference) : measurementData.calfCircumference,
    };
    
    setMeasurements(prev => [...prev, newMeasurement]);
    setIsCreateDialogOpen(false);
  };

  const handleValidateMeasurement = (measurementId: string) => {
    setMeasurements(prev => prev.map(measurement => 
      measurement.id === measurementId 
        ? { 
            ...measurement, 
            isValidated: true,
            validatedBy: `${user?.firstName} ${user?.lastName}`,
            validatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: `${user?.firstName} ${user?.lastName}`
          }
        : measurement
    ));
  };

  const getMeasurementCompleteness = (measurement: ClientMeasurement) => {
    const requiredFields = ['bust', 'waist', 'hips', 'shoulderWidth', 'armLength', 'legLength', 'neckCircumference'];
    const filledFields = requiredFields.filter(field => measurement[field as keyof ClientMeasurement]);
    return (filledFields.length / requiredFields.length) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <AccessControl allowedRoles={['owner', 'manager', 'orders', 'customer_service']}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Mesures</h1>
            <p className="text-muted-foreground">
              Prise de mesures, validation et suivi des évolutions
            </p>
          </div>
          {canManageMeasurements && (
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle mesure
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Prendre de nouvelles mesures</DialogTitle>
                    <DialogDescription>
                      Saisissez les mesures du client
                    </DialogDescription>
                  </DialogHeader>
                  <MeasurementForm 
                    clients={clients}
                    onSubmit={handleCreateMeasurement}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total mesures</p>
                  <p className="text-2xl font-bold">{totalMeasurements}</p>
                </div>
                <Ruler className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Validées</p>
                  <p className="text-2xl font-bold text-green-500">{validatedMeasurements}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-orange-500">{pendingMeasurements}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ce mois</p>
                  <p className="text-2xl font-bold text-blue-500">{recentMeasurements}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
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
                    placeholder="Rechercher par client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={validationFilter}
                  onChange={(e) => setValidationFilter(e.target.value as 'all' | 'validated' | 'pending')}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="validated">Validées</option>
                  <option value="pending">En attente</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des mesures */}
        <Card>
          <CardHeader>
            <CardTitle>Mesures clients</CardTitle>
            <CardDescription>
              {filteredMeasurements.length} mesure(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date mesure</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Complétude</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Validé par</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeasurements.map((measurement) => {
                  const completeness = getMeasurementCompleteness(measurement);
                  return (
                    <TableRow key={measurement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{measurement.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            Version {measurement.version}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(measurement.measurementDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{measurement.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{Math.round(completeness)}%</span>
                          </div>
                          <Progress 
                            value={completeness} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={measurement.isValidated ? "default" : "secondary"}>
                          {measurement.isValidated ? "Validée" : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {measurement.validatedBy || 'Non validée'}
                        </span>
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
                                <DialogTitle>Mesures de {measurement.clientName}</DialogTitle>
                              </DialogHeader>
                              <MeasurementDetails measurement={measurement} />
                            </DialogContent>
                          </Dialog>
                          {canManageMeasurements && (
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canValidateMeasurements && !measurement.isValidated && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleValidateMeasurement(measurement.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Valider
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
    </AccessControl>
  );
}

// Composant formulaire de mesures
function MeasurementForm({ 
  clients, 
  measurement, 
  onSubmit 
}: { 
  clients: Client[];
  measurement?: ClientMeasurement;
  onSubmit: (data: Partial<ClientMeasurement>) => void;
}) {
  const [formData, setFormData] = useState({
    clientId: measurement?.clientId || '',
    clientName: measurement?.clientName || '',
    // Mesures principales
    bust: measurement?.bust || '',
    waist: measurement?.waist || '',
    hips: measurement?.hips || '',
    shoulderWidth: measurement?.shoulderWidth || '',
    armLength: measurement?.armLength || '',
    legLength: measurement?.legLength || '',
    neckCircumference: measurement?.neckCircumference || '',
    // Mesures supplémentaires
    chestWidth: measurement?.chestWidth || '',
    backWidth: measurement?.backWidth || '',
    armCircumference: measurement?.armCircumference || '',
    thighCircumference: measurement?.thighCircumference || '',
    calfCircumference: measurement?.calfCircumference || '',
    notes: measurement?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      bust: typeof formData.bust === 'string' ? Number(formData.bust) : formData.bust,
      waist: typeof formData.waist === 'string' ? Number(formData.waist) : formData.waist,
      hips: typeof formData.hips === 'string' ? Number(formData.hips) : formData.hips,
      shoulderWidth: typeof formData.shoulderWidth === 'string' ? Number(formData.shoulderWidth) : formData.shoulderWidth,
      armLength: typeof formData.armLength === 'string' ? Number(formData.armLength) : formData.armLength,
      legLength: typeof formData.legLength === 'string' ? Number(formData.legLength) : formData.legLength,
      neckCircumference: typeof formData.neckCircumference === 'string' ? Number(formData.neckCircumference) : formData.neckCircumference,
      chestWidth: typeof formData.chestWidth === 'string' ? Number(formData.chestWidth) : formData.chestWidth,
      backWidth: typeof formData.backWidth === 'string' ? Number(formData.backWidth) : formData.backWidth,
      armCircumference: typeof formData.armCircumference === 'string' ? Number(formData.armCircumference) : formData.armCircumference,
      thighCircumference: typeof formData.thighCircumference === 'string' ? Number(formData.thighCircumference) : formData.thighCircumference,
      calfCircumference: typeof formData.calfCircumference === 'string' ? Number(formData.calfCircumference) : formData.calfCircumference,
    });
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client ? `${client.firstName} ${client.lastName}` : ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sélection du client */}
      <div>
        <Label htmlFor="client">Client *</Label>
        <select
          id="client"
          value={formData.clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Sélectionner un client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.firstName} {client.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Mesures principales */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mesures principales</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bust">Tour de poitrine (cm)</Label>
            <Input
              id="bust"
              type="number"
              step="0.1"
              value={formData.bust}
              onChange={(e) => setFormData(prev => ({ ...prev, bust: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="waist">Tour de taille (cm)</Label>
            <Input
              id="waist"
              type="number"
              step="0.1"
              value={formData.waist}
              onChange={(e) => setFormData(prev => ({ ...prev, waist: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="hips">Tour de hanches (cm)</Label>
            <Input
              id="hips"
              type="number"
              step="0.1"
              value={formData.hips}
              onChange={(e) => setFormData(prev => ({ ...prev, hips: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="shoulderWidth">Largeur d'épaules (cm)</Label>
            <Input
              id="shoulderWidth"
              type="number"
              step="0.1"
              value={formData.shoulderWidth}
              onChange={(e) => setFormData(prev => ({ ...prev, shoulderWidth: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="armLength">Longueur de bras (cm)</Label>
            <Input
              id="armLength"
              type="number"
              step="0.1"
              value={formData.armLength}
              onChange={(e) => setFormData(prev => ({ ...prev, armLength: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="legLength">Longueur de jambe (cm)</Label>
            <Input
              id="legLength"
              type="number"
              step="0.1"
              value={formData.legLength}
              onChange={(e) => setFormData(prev => ({ ...prev, legLength: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="neckCircumference">Tour de cou (cm)</Label>
            <Input
              id="neckCircumference"
              type="number"
              step="0.1"
              value={formData.neckCircumference}
              onChange={(e) => setFormData(prev => ({ ...prev, neckCircumference: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Mesures supplémentaires */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mesures supplémentaires</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="chestWidth">Largeur de poitrine (cm)</Label>
            <Input
              id="chestWidth"
              type="number"
              step="0.1"
              value={formData.chestWidth}
              onChange={(e) => setFormData(prev => ({ ...prev, chestWidth: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="backWidth">Largeur de dos (cm)</Label>
            <Input
              id="backWidth"
              type="number"
              step="0.1"
              value={formData.backWidth}
              onChange={(e) => setFormData(prev => ({ ...prev, backWidth: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="armCircumference">Tour de bras (cm)</Label>
            <Input
              id="armCircumference"
              type="number"
              step="0.1"
              value={formData.armCircumference}
              onChange={(e) => setFormData(prev => ({ ...prev, armCircumference: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="thighCircumference">Tour de cuisse (cm)</Label>
            <Input
              id="thighCircumference"
              type="number"
              step="0.1"
              value={formData.thighCircumference}
              onChange={(e) => setFormData(prev => ({ ...prev, thighCircumference: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="calfCircumference">Tour de mollet (cm)</Label>
            <Input
              id="calfCircumference"
              type="number"
              step="0.1"
              value={formData.calfCircumference}
              onChange={(e) => setFormData(prev => ({ ...prev, calfCircumference: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="Notes sur les mesures..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          {measurement ? 'Modifier' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}

// Composant détails des mesures
function MeasurementDetails({ measurement }: { measurement: ClientMeasurement }) {
  return (
    <Tabs defaultValue="measurements" className="w-full">
      <TabsList>
        <TabsTrigger value="measurements">Mesures</TabsTrigger>
        <TabsTrigger value="history">Historique</TabsTrigger>
      </TabsList>
      
      <TabsContent value="measurements" className="space-y-6">
        {/* Informations générales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Client</Label>
            <p className="text-sm">{measurement.clientName}</p>
          </div>
          <div>
            <Label>Date de mesure</Label>
            <p className="text-sm">{new Date(measurement.measurementDate).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <Label>Version</Label>
            <p className="text-sm">{measurement.version}</p>
          </div>
          <div>
            <Label>Statut</Label>
            <Badge variant={measurement.isValidated ? "default" : "secondary"}>
              {measurement.isValidated ? "Validée" : "En attente"}
            </Badge>
          </div>
        </div>

        {/* Mesures principales */}
        <div>
          <h4 className="font-semibold mb-3">Mesures principales</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Tour de poitrine</Label>
              <p className="text-sm">{measurement.bust} cm</p>
            </div>
            <div>
              <Label>Tour de taille</Label>
              <p className="text-sm">{measurement.waist} cm</p>
            </div>
            <div>
              <Label>Tour de hanches</Label>
              <p className="text-sm">{measurement.hips} cm</p>
            </div>
            <div>
              <Label>Largeur d'épaules</Label>
              <p className="text-sm">{measurement.shoulderWidth} cm</p>
            </div>
            <div>
              <Label>Longueur de bras</Label>
              <p className="text-sm">{measurement.armLength} cm</p>
            </div>
            <div>
              <Label>Longueur de jambe</Label>
              <p className="text-sm">{measurement.legLength} cm</p>
            </div>
            <div>
              <Label>Tour de cou</Label>
              <p className="text-sm">{measurement.neckCircumference} cm</p>
            </div>
          </div>
        </div>

        {/* Mesures supplémentaires */}
        <div>
          <h4 className="font-semibold mb-3">Mesures supplémentaires</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Largeur de poitrine</Label>
              <p className="text-sm">{measurement.chestWidth} cm</p>
            </div>
            <div>
              <Label>Largeur de dos</Label>
              <p className="text-sm">{measurement.backWidth} cm</p>
            </div>
            <div>
              <Label>Tour de bras</Label>
              <p className="text-sm">{measurement.armCircumference} cm</p>
            </div>
            <div>
              <Label>Tour de cuisse</Label>
              <p className="text-sm">{measurement.thighCircumference} cm</p>
            </div>
            <div>
              <Label>Tour de mollet</Label>
              <p className="text-sm">{measurement.calfCircumference} cm</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {measurement.notes && (
          <div>
            <Label>Notes</Label>
            <p className="text-sm">{measurement.notes}</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4">
        <div className="text-center text-muted-foreground">
          Historique des versions en cours de développement
        </div>
      </TabsContent>
    </Tabs>
  );
}