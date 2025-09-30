import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Scissors, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Upload,
  FileText,
  Image,
  File,
  Copy,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Tag,
  Layers,
  History,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types pour les patrons
interface Pattern {
  id: string;
  name: string;
  description: string;
  category: string;
  garmentType: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  version: string;
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'other';
  fileSize: number;
  tags: string[];
  isActive: boolean;
  isPublic: boolean;
  downloadCount: number;
  rating: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  associatedOrders: string[];
  notes?: string;
}

interface PatternCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Catégories de patrons
const patternCategories: PatternCategory[] = [
  { id: 'robes', name: 'Robes', description: 'Patrons de robes', icon: '👗' },
  { id: 'costumes', name: 'Costumes', description: 'Patrons de costumes', icon: '👔' },
  { id: 'pantalons', name: 'Pantalons', description: 'Patrons de pantalons', icon: '👖' },
  { id: 'chemises', name: 'Chemises', description: 'Patrons de chemises', icon: '👕' },
  { id: 'vestes', name: 'Vestes', description: 'Patrons de vestes', icon: '🧥' },
  { id: 'jupes', name: 'Jupes', description: 'Patrons de jupes', icon: '👗' },
  { id: 'accessoires', name: 'Accessoires', description: 'Patrons d\'accessoires', icon: '👜' }
];

// Données simulées
const mockPatterns: Pattern[] = [
  {
    id: '1',
    name: 'Robe d\'été classique',
    description: 'Patron pour une robe d\'été élégante et confortable',
    category: 'robes',
    garmentType: 'robe',
    difficulty: 'moyen',
    version: '2.1',
    fileUrl: '/patterns/robe-ete-classique-v2.1.pdf',
    fileType: 'pdf',
    fileSize: 2048576, // 2MB
    tags: ['été', 'élégant', 'confortable', 'polyvalent'],
    isActive: true,
    isPublic: true,
    downloadCount: 45,
    rating: 4.5,
    createdBy: 'Alice Couture',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    associatedOrders: ['order-1', 'order-3'],
    notes: 'Patron très populaire, adapté pour tous les âges'
  },
  {
    id: '2',
    name: 'Costume 3 pièces homme',
    description: 'Patron complet pour costume 3 pièces professionnel',
    category: 'costumes',
    garmentType: 'costume',
    difficulty: 'difficile',
    version: '1.5',
    fileUrl: '/patterns/costume-3-pieces-v1.5.pdf',
    fileType: 'pdf',
    fileSize: 3145728, // 3MB
    tags: ['professionnel', 'élégant', 'classique', 'sur-mesure'],
    isActive: true,
    isPublic: false,
    downloadCount: 12,
    rating: 4.8,
    createdBy: 'Marc Tailleur',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    associatedOrders: ['order-2'],
    notes: 'Patron complexe nécessitant une expertise avancée'
  },
  {
    id: '3',
    name: 'Pantalon cigarette femme',
    description: 'Patron pour pantalon cigarette ajusté',
    category: 'pantalons',
    garmentType: 'pantalon',
    difficulty: 'facile',
    version: '1.0',
    fileUrl: '/patterns/pantalon-cigarette-v1.0.jpg',
    fileType: 'image',
    fileSize: 1048576, // 1MB
    tags: ['moderne', 'ajusté', 'polyvalent', 'tendance'],
    isActive: true,
    isPublic: true,
    downloadCount: 78,
    rating: 4.2,
    createdBy: 'Emma Style',
    createdAt: '2024-01-08T10:30:00Z',
    updatedAt: '2024-01-08T10:30:00Z',
    associatedOrders: ['order-4', 'order-5'],
    notes: 'Patron simple et efficace'
  },
  {
    id: '4',
    name: 'Chemise cintrée',
    description: 'Patron pour chemise cintrée élégante',
    category: 'chemises',
    garmentType: 'chemise',
    difficulty: 'moyen',
    version: '1.2',
    fileUrl: '/patterns/chemise-cintree-v1.2.pdf',
    fileType: 'pdf',
    fileSize: 1572864, // 1.5MB
    tags: ['élégant', 'cintré', 'professionnel', 'féminin'],
    isActive: true,
    isPublic: true,
    downloadCount: 34,
    rating: 4.6,
    createdBy: 'Sophie Mode',
    createdAt: '2024-01-12T13:15:00Z',
    updatedAt: '2024-01-14T09:20:00Z',
    associatedOrders: ['order-6'],
    notes: 'Patron adapté pour tous les types de morphologie'
  }
];

export function PatternsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('patterns');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // États pour la création/modification
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [newPattern, setNewPattern] = useState<Partial<Pattern>>({
    name: '',
    description: '',
    category: '',
    garmentType: '',
    difficulty: 'moyen',
    tags: [],
    isPublic: false,
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Permissions
  const canViewPatterns = ['owner', 'manager', 'tailor', 'production'].includes(user?.role || '');
  const canManagePatterns = ['owner', 'manager', 'tailor'].includes(user?.role || '');

  if (!canViewPatterns) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrage des patrons
  const filteredPatterns = mockPatterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || pattern.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || pattern.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && pattern.isActive) ||
                         (statusFilter === 'inactive' && !pattern.isActive);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  // Statistiques
  const stats = {
    totalPatterns: mockPatterns.length,
    activePatterns: mockPatterns.filter(p => p.isActive).length,
    publicPatterns: mockPatterns.filter(p => p.isPublic).length,
    totalDownloads: mockPatterns.reduce((sum, p) => sum + p.downloadCount, 0),
    averageRating: mockPatterns.reduce((sum, p) => sum + p.rating, 0) / mockPatterns.length
  };

  // Handlers
  const handleCreatePattern = async () => {
    if (!newPattern.name || !newPattern.category || !selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et sélectionner un fichier.",
        variant: "destructive"
      });
      return;
    }

    // Simulation de création
    const pattern: Pattern = {
      id: `pattern-${Date.now()}`,
      name: newPattern.name!,
      description: newPattern.description || '',
      category: newPattern.category!,
      garmentType: newPattern.garmentType || newPattern.category!,
      difficulty: newPattern.difficulty || 'moyen',
      version: '1.0',
      fileUrl: `/patterns/${selectedFile.name}`,
      fileType: selectedFile.type.includes('pdf') ? 'pdf' : 
                selectedFile.type.includes('image') ? 'image' : 'other',
      fileSize: selectedFile.size,
      tags: newPattern.tags || [],
      isActive: true,
      isPublic: newPattern.isPublic || false,
      downloadCount: 0,
      rating: 0,
      createdBy: user?.firstName + ' ' + user?.lastName || 'Utilisateur',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      associatedOrders: [],
      notes: newPattern.notes
    };

    mockPatterns.push(pattern);

    toast({
      title: "Succès",
      description: "Patron créé avec succès.",
    });

    setIsCreateDialogOpen(false);
    setNewPattern({
      name: '',
      description: '',
      category: '',
      garmentType: '',
      difficulty: 'moyen',
      tags: [],
      isPublic: false,
      notes: ''
    });
    setSelectedFile(null);
  };

  const handleEditPattern = async () => {
    if (!selectedPattern) return;

    // Simulation de mise à jour
    const index = mockPatterns.findIndex(p => p.id === selectedPattern.id);
    if (index !== -1) {
      mockPatterns[index] = {
        ...selectedPattern,
        updatedAt: new Date().toISOString()
      };
    }

    toast({
      title: "Succès",
      description: "Patron mis à jour avec succès.",
    });

    setIsEditDialogOpen(false);
    setSelectedPattern(null);
  };

  const handleDeletePattern = async (patternId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patron ?')) {
      return;
    }

    const index = mockPatterns.findIndex(p => p.id === patternId);
    if (index !== -1) {
      mockPatterns.splice(index, 1);
    }

    toast({
      title: "Succès",
      description: "Patron supprimé avec succès.",
    });
  };

  const handleDuplicatePattern = (pattern: Pattern) => {
    const duplicatedPattern: Pattern = {
      ...pattern,
      id: `pattern-${Date.now()}`,
      name: `${pattern.name} (copie)`,
      version: '1.0',
      downloadCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      associatedOrders: []
    };

    mockPatterns.push(duplicatedPattern);

    toast({
      title: "Succès",
      description: "Patron dupliqué avec succès.",
    });
  };

  const handleDownloadPattern = (pattern: Pattern) => {
    // Simulation de téléchargement
    const link = document.createElement('a');
    link.href = pattern.fileUrl;
    link.download = `${pattern.name}-v${pattern.version}.${pattern.fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Incrémenter le compteur de téléchargements
    const index = mockPatterns.findIndex(p => p.id === pattern.id);
    if (index !== -1) {
      mockPatterns[index].downloadCount++;
    }

    toast({
      title: "Téléchargement",
      description: "Patron téléchargé avec succès.",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Patrons</h1>
          <p className="text-muted-foreground">
            Bibliothèque de patrons de couture et modèles
          </p>
        </div>
        {canManagePatterns && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total patrons</p>
                <p className="text-2xl font-bold">{stats.totalPatterns}</p>
              </div>
              <Scissors className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{stats.activePatterns}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publics</p>
                <p className="text-2xl font-bold">{stats.publicPatterns}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Téléchargements</p>
                <p className="text-2xl font-bold">{stats.totalDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">Patrons</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, description ou tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {patternCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Difficulté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes difficultés</SelectItem>
                      <SelectItem value="facile">Facile</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="inactive">Inactifs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des patrons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bibliothèque de Patrons</CardTitle>
                  <CardDescription>{filteredPatterns.length} patron(s) trouvé(s)</CardDescription>
                </div>
                {canManagePatterns && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau patron
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Nouveau patron</DialogTitle>
                        <DialogDescription>
                          Ajouter un nouveau patron à la bibliothèque
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="patternName">Nom du patron *</Label>
                            <Input
                              id="patternName"
                              value={newPattern.name || ''}
                              onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nom du patron"
                            />
                          </div>
                          <div>
                            <Label htmlFor="patternCategory">Catégorie *</Label>
                            <Select value={newPattern.category || ''} onValueChange={(value) => setNewPattern(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                              </SelectTrigger>
                              <SelectContent>
                                {patternCategories.map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="patternDescription">Description</Label>
                          <Textarea
                            id="patternDescription"
                            value={newPattern.description || ''}
                            onChange={(e) => setNewPattern(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description du patron"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="patternDifficulty">Difficulté</Label>
                            <Select value={newPattern.difficulty || 'moyen'} onValueChange={(value) => setNewPattern(prev => ({ ...prev, difficulty: value as any }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="facile">Facile</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="difficile">Difficile</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="patternFile">Fichier *</Label>
                            <Input
                              id="patternFile"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif"
                              onChange={handleFileSelect}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="patternTags">Tags</Label>
                          <Input
                            id="patternTags"
                            value={newPattern.tags?.join(', ') || ''}
                            onChange={(e) => setNewPattern(prev => ({ 
                              ...prev, 
                              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                            }))}
                            placeholder="Tags séparés par des virgules"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={newPattern.isPublic || false}
                            onChange={(e) => setNewPattern(prev => ({ ...prev, isPublic: e.target.checked }))}
                          />
                          <Label htmlFor="isPublic">Patron public</Label>
                        </div>

                        <div>
                          <Label htmlFor="patternNotes">Notes</Label>
                          <Textarea
                            id="patternNotes"
                            value={newPattern.notes || ''}
                            onChange={(e) => setNewPattern(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Notes sur le patron"
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreatePattern}>
                          Créer
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
                    <TableHead>Patron</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Difficulté</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Statistiques</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatterns.map((pattern) => (
                    <TableRow key={pattern.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            {getFileIcon(pattern.fileType)}
                            <div>
                              <p className="font-medium">{pattern.name}</p>
                              <p className="text-sm text-muted-foreground">{pattern.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {pattern.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {pattern.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{pattern.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{patternCategories.find(c => c.id === pattern.category)?.icon}</span>
                          <span>{patternCategories.find(c => c.id === pattern.category)?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(pattern.difficulty)}>
                          {pattern.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{pattern.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={pattern.isActive ? "default" : "secondary"}>
                            {pattern.isActive ? "Actif" : "Inactif"}
                          </Badge>
                          {pattern.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{pattern.downloadCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{pattern.rating}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadPattern(pattern)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManagePatterns && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDuplicatePattern(pattern)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPattern(pattern);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeletePattern(pattern.id)}
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

        <TabsContent value="categories" className="space-y-4">
          {/* Catégories de patrons */}
          <Card>
            <CardHeader>
              <CardTitle>Catégories de Patrons</CardTitle>
              <CardDescription>Organisation des patrons par type de vêtement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patternCategories.map((category) => {
                  const categoryPatterns = mockPatterns.filter(p => p.category === category.id);
                  return (
                    <Card key={category.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category.icon}</span>
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        <Badge variant="outline">{categoryPatterns.length} patrons</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Téléchargements: {categoryPatterns.reduce((sum, p) => sum + p.downloadCount, 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Note moyenne: {categoryPatterns.length > 0 ? 
                            (categoryPatterns.reduce((sum, p) => sum + p.rating, 0) / categoryPatterns.length).toFixed(1) : 
                            'N/A'}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Historique des versions */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des Versions</CardTitle>
              <CardDescription>Suivi des modifications des patrons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{pattern.name}</h3>
                      <Badge variant="outline">v{pattern.version}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Créé le:</span> {new Date(pattern.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <span className="font-medium">Modifié le:</span> {new Date(pattern.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <span className="font-medium">Par:</span> {pattern.createdBy}
                      </div>
                      <div>
                        <span className="font-medium">Taille:</span> {formatFileSize(pattern.fileSize)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le patron</DialogTitle>
          </DialogHeader>
          {selectedPattern && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Nom du patron</Label>
                  <Input
                    id="editName"
                    value={selectedPattern.name}
                    onChange={(e) => setSelectedPattern(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="editCategory">Catégorie</Label>
                  <Select value={selectedPattern.category} onValueChange={(value) => setSelectedPattern(prev => prev ? { ...prev, category: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patternCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={selectedPattern.description}
                  onChange={(e) => setSelectedPattern(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDifficulty">Difficulté</Label>
                  <Select value={selectedPattern.difficulty} onValueChange={(value) => setSelectedPattern(prev => prev ? { ...prev, difficulty: value as any } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facile">Facile</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editTags">Tags</Label>
                  <Input
                    id="editTags"
                    value={selectedPattern.tags.join(', ')}
                    onChange={(e) => setSelectedPattern(prev => prev ? { 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    } : null)}
                    placeholder="Tags séparés par des virgules"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={selectedPattern.isActive}
                    onChange={(e) => setSelectedPattern(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                  />
                  <Label htmlFor="editIsActive">Actif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={selectedPattern.isPublic}
                    onChange={(e) => setSelectedPattern(prev => prev ? { ...prev, isPublic: e.target.checked } : null)}
                  />
                  <Label htmlFor="editIsPublic">Public</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={selectedPattern.notes || ''}
                  onChange={(e) => setSelectedPattern(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditPattern}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PatternsPage;