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
  Download,
  Upload,
  FileText,
  Image,
  Folder,
  Tag,
  Calendar,
  User,
  Star,
  Share2,
  Trash2,
  Copy,
  History,
  Settings,
  Grid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les modèles/patrons
interface Pattern {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  fileType: 'pdf' | 'image' | 'vector' | 'other';
  fileSize: number;
  fileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  version: number;
  isPublic: boolean;
  isTemplate: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // en heures
  materials: string[];
  instructions?: string;
  // Métadonnées
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  downloadCount: number;
  rating: number;
  reviewCount: number;
}

interface PatternCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  patternCount: number;
  subcategories: string[];
}

// Données simulées
const mockCategories: PatternCategory[] = [
  {
    id: '1',
    name: 'Vêtements femmes',
    description: 'Robes, jupes, blouses, pantalons',
    icon: '👗',
    patternCount: 45,
    subcategories: ['Robes', 'Jupes', 'Blouses', 'Pantalons', 'Vestes']
  },
  {
    id: '2',
    name: 'Vêtements hommes',
    description: 'Costumes, chemises, pantalons',
    icon: '👔',
    patternCount: 32,
    subcategories: ['Costumes', 'Chemises', 'Pantalons', 'Vestes', 'Cravates']
  },
  {
    id: '3',
    name: 'Accessoires',
    description: 'Sacs, chapeaux, bijoux',
    icon: '👜',
    patternCount: 28,
    subcategories: ['Sacs', 'Chapeaux', 'Bijoux', 'Écharpes', 'Gants']
  },
  {
    id: '4',
    name: 'Lingerie',
    description: 'Sous-vêtements, maillots',
    icon: '👙',
    patternCount: 15,
    subcategories: ['Soutiens-gorge', 'Culottes', 'Maillots', 'Pyjamas']
  },
  {
    id: '5',
    name: 'Enfants',
    description: 'Vêtements pour enfants',
    icon: '👶',
    patternCount: 22,
    subcategories: ['0-6 mois', '6-12 mois', '1-3 ans', '3-6 ans', '6-12 ans']
  }
];

const mockPatterns: Pattern[] = [
  {
    id: '1',
    name: 'Robe d\'été élégante',
    description: 'Robe légère parfaite pour l\'été avec détails floraux',
    category: 'Vêtements femmes',
    subcategory: 'Robes',
    tags: ['été', 'élégant', 'floral', 'léger'],
    fileType: 'pdf',
    fileSize: 2048576, // 2MB
    fileName: 'robe_ete_elegante_v2.pdf',
    fileUrl: '/patterns/robe_ete_elegante_v2.pdf',
    thumbnailUrl: '/thumbnails/robe_ete_elegante.jpg',
    version: 2,
    isPublic: true,
    isTemplate: false,
    difficulty: 'intermediate',
    estimatedTime: 8,
    materials: ['Tissu coton', 'Fil assorti', 'Fermeture éclair'],
    instructions: 'Instructions détaillées incluses dans le PDF',
    createdAt: '2024-01-10T10:00:00Z',
    createdBy: 'Alice Couture',
    updatedAt: '2024-01-15T14:30:00Z',
    updatedBy: 'Alice Couture',
    downloadCount: 156,
    rating: 4.5,
    reviewCount: 23
  },
  {
    id: '2',
    name: 'Costume 3 pièces classique',
    description: 'Costume traditionnel pour homme avec veste, pantalon et gilet',
    category: 'Vêtements hommes',
    subcategory: 'Costumes',
    tags: ['classique', 'formel', 'costume', '3-pièces'],
    fileType: 'pdf',
    fileSize: 3145728, // 3MB
    fileName: 'costume_3_pieces_classique_v1.pdf',
    fileUrl: '/patterns/costume_3_pieces_classique_v1.pdf',
    thumbnailUrl: '/thumbnails/costume_3_pieces.jpg',
    version: 1,
    isPublic: true,
    isTemplate: true,
    difficulty: 'advanced',
    estimatedTime: 20,
    materials: ['Tissu laine', 'Doublure', 'Boutons', 'Fil de couture'],
    instructions: 'Patron de base avec instructions de montage',
    createdAt: '2024-01-05T09:00:00Z',
    createdBy: 'Marc Tailleur',
    updatedAt: '2024-01-05T09:00:00Z',
    updatedBy: 'Marc Tailleur',
    downloadCount: 89,
    rating: 4.8,
    reviewCount: 15
  },
  {
    id: '3',
    name: 'Sac bandoulière moderne',
    description: 'Sac tendance avec bandoulière ajustable',
    category: 'Accessoires',
    subcategory: 'Sacs',
    tags: ['sac', 'bandoulière', 'moderne', 'cuir'],
    fileType: 'vector',
    fileSize: 1048576, // 1MB
    fileName: 'sac_bandouliere_moderne.ai',
    fileUrl: '/patterns/sac_bandouliere_moderne.ai',
    thumbnailUrl: '/thumbnails/sac_bandouliere.jpg',
    version: 1,
    isPublic: false,
    isTemplate: false,
    difficulty: 'intermediate',
    estimatedTime: 6,
    materials: ['Cuir', 'Fermeture', 'Anneaux métalliques', 'Fil de cuir'],
    instructions: 'Fichier vectoriel avec gabarits',
    createdAt: '2024-01-12T16:00:00Z',
    createdBy: 'Emma Style',
    updatedAt: '2024-01-12T16:00:00Z',
    updatedBy: 'Emma Style',
    downloadCount: 34,
    rating: 4.2,
    reviewCount: 8
  }
];

export function PatternsPage() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<Pattern[]>(mockPatterns);
  const [categories] = useState<PatternCategory[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Permissions centralisées (désactivées pour activer tous les boutons)
  const canViewPatterns = true;
  const canManagePatterns = true;
  // const canViewPatterns = ['owner', 'manager', 'patterns', 'production'].includes(user?.role || '');
  // const canManagePatterns = ['owner', 'manager', 'patterns'].includes(user?.role || '');
  if (!canViewPatterns) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à ce module.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrer les patrons
  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = 
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculer les statistiques
  const totalPatterns = patterns.length;
  const publicPatterns = patterns.filter(p => p.isPublic).length;
  const templatePatterns = patterns.filter(p => p.isTemplate).length;
  const recentPatterns = patterns.filter(p => {
    const patternDate = new Date(p.createdAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return patternDate > thirtyDaysAgo;
  }).length;

  const handleUploadPattern = (patternData: Partial<Pattern>) => {
    const newPattern: Pattern = {
      id: Date.now().toString(),
      name: patternData.name!,
      description: patternData.description,
      category: patternData.category!,
      subcategory: patternData.subcategory,
      tags: patternData.tags || [],
      fileType: patternData.fileType!,
      fileSize: patternData.fileSize!,
      fileName: patternData.fileName!,
      fileUrl: patternData.fileUrl!,
      thumbnailUrl: patternData.thumbnailUrl,
      version: 1,
      isPublic: patternData.isPublic || false,
      isTemplate: patternData.isTemplate || false,
      difficulty: patternData.difficulty!,
      estimatedTime: patternData.estimatedTime!,
      materials: patternData.materials || [],
      instructions: patternData.instructions,
      createdAt: new Date().toISOString(),
      createdBy: `${user?.firstName} ${user?.lastName}`,
      updatedAt: new Date().toISOString(),
      updatedBy: `${user?.firstName} ${user?.lastName}`,
      downloadCount: 0,
      rating: 0,
      reviewCount: 0
    };
    
    setPatterns(prev => [...prev, newPattern]);
    setIsUploadDialogOpen(false);
  };

  const handleDownloadPattern = (pattern: Pattern) => {
    // Simuler le téléchargement
    console.log(`Téléchargement de ${pattern.fileName}`);
    // Ici on incrémenterait le compteur de téléchargements
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'vector': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modèles & Patrons</h1>
          <p className="text-muted-foreground">
            Gestion des patrons, modèles et gabarits
          </p>
        </div>
        {canManagePatterns && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Nouveau patron
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau patron</DialogTitle>
                  <DialogDescription>
                    Uploadez un fichier et ajoutez les informations
                  </DialogDescription>
                </DialogHeader>
                <PatternUploadForm 
                  categories={categories}
                  onSubmit={handleUploadPattern}
                  uploadProgress={uploadProgress}
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
                <p className="text-sm font-medium text-muted-foreground">Total patrons</p>
                <p className="text-2xl font-bold">{totalPatterns}</p>
              </div>
              <Folder className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publics</p>
                <p className="text-2xl font-bold text-blue-500">{publicPatterns}</p>
              </div>
              <Share2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold text-green-500">{templatePatterns}</p>
              </div>
              <Copy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold text-purple-500">{recentPatterns}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des patrons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name} ({category.patternCount})
                  </option>
                ))}
              </select>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affichage des patrons */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatterns.map((pattern) => (
            <Card key={pattern.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {pattern.thumbnailUrl ? (
                  <img 
                    src={pattern.thumbnailUrl} 
                    alt={pattern.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {getFileTypeIcon(pattern.fileType)}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{pattern.name}</h3>
                  <Badge variant={pattern.isPublic ? "default" : "secondary"} className="text-xs">
                    {pattern.isPublic ? "Public" : "Privé"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {pattern.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getDifficultyColor(pattern.difficulty))}
                  >
                    {pattern.difficulty}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {pattern.rating.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{formatFileSize(pattern.fileSize)}</span>
                  <span>v{pattern.version}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadPattern(pattern)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Télécharger
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{pattern.name}</DialogTitle>
                      </DialogHeader>
                      <PatternDetails pattern={pattern} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des patrons</CardTitle>
            <CardDescription>
              {filteredPatterns.length} patron(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patron</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Difficulté</TableHead>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatterns.map((pattern) => (
                  <TableRow key={pattern.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pattern.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pattern.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pattern.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(pattern.difficulty)}
                      >
                        {pattern.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getFileTypeIcon(pattern.fileType)}
                        <span className="ml-2 text-sm">{formatFileSize(pattern.fileSize)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pattern.isPublic ? "default" : "secondary"}>
                        {pattern.isPublic ? "Public" : "Privé"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{pattern.rating.toFixed(1)}</span>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{pattern.name}</DialogTitle>
                            </DialogHeader>
                            <PatternDetails pattern={pattern} />
                          </DialogContent>
                        </Dialog>
                        {canManagePatterns && (
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant formulaire d'upload
function PatternUploadForm({ 
  categories, 
  onSubmit, 
  uploadProgress 
}: { 
  categories: PatternCategory[];
  onSubmit: (data: Partial<Pattern>) => void;
  uploadProgress: number;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [] as string[],
    fileType: 'pdf' as 'pdf' | 'image' | 'vector' | 'other',
    fileSize: 0,
    fileName: '',
    fileUrl: '',
    thumbnailUrl: '',
    isPublic: false,
    isTemplate: false,
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    estimatedTime: 1,
    materials: [] as string[],
    instructions: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        fileType: getFileTypeFromName(file.name)
      }));
    }
  };

  const getFileTypeFromName = (fileName: string): 'pdf' | 'image' | 'vector' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
    if (['ai', 'svg', 'eps'].includes(ext || '')) return 'vector';
    return 'other';
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddMaterial = () => {
    if (materialInput.trim() && !formData.materials.includes(materialInput.trim())) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, materialInput.trim()]
      }));
      setMaterialInput('');
    }
  };

  const handleRemoveMaterial = (materialToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material !== materialToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      // Simuler l'upload
      const fileUrl = URL.createObjectURL(selectedFile);
      onSubmit({
        ...formData,
        fileUrl
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Upload de fichier */}
      <div>
        <Label htmlFor="file">Fichier du patron *</Label>
        <div className="mt-2">
          <Input
            id="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.ai,.svg,.eps"
            onChange={handleFileSelect}
            required
          />
        </div>
        {selectedFile && (
          <div className="mt-2 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {uploadProgress > 0 && (
              <Progress value={uploadProgress} className="mt-2" />
            )}
          </div>
        )}
      </div>

      {/* Informations de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom du patron *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Ajouter un tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Paramètres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulté</Label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert' 
            }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div>
          <Label htmlFor="estimatedTime">Temps estimé (heures)</Label>
          <Input
            id="estimatedTime"
            type="number"
            min="0.5"
            step="0.5"
            value={formData.estimatedTime}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              estimatedTime: parseFloat(e.target.value) 
            }))}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="isPublic"
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
          />
          <Label htmlFor="isPublic">Public</Label>
        </div>
      </div>

      {/* Matériaux */}
      <div>
        <Label>Matériaux nécessaires</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={materialInput}
            onChange={(e) => setMaterialInput(e.target.value)}
            placeholder="Ajouter un matériau..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
          />
          <Button type="button" onClick={handleAddMaterial}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.materials.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.materials.map(material => (
              <Badge key={material} variant="outline">
                {material}
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(material)}
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          <Upload className="h-4 w-4 mr-2" />
          Uploader
        </Button>
      </div>
    </form>
  );
}

// Composant détails du patron
function PatternDetails({ pattern }: { pattern: Pattern }) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList>
        <TabsTrigger value="info">Informations</TabsTrigger>
        <TabsTrigger value="materials">Matériaux</TabsTrigger>
        <TabsTrigger value="history">Historique</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-6">
        {/* Informations générales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nom</Label>
            <p className="text-sm">{pattern.name}</p>
          </div>
          <div>
            <Label>Catégorie</Label>
            <p className="text-sm">{pattern.category}</p>
          </div>
          <div>
            <Label>Difficulté</Label>
            <Badge variant="outline">{pattern.difficulty}</Badge>
          </div>
          <div>
            <Label>Temps estimé</Label>
            <p className="text-sm">{pattern.estimatedTime} heures</p>
          </div>
          <div>
            <Label>Version</Label>
            <p className="text-sm">{pattern.version}</p>
          </div>
          <div>
            <Label>Statut</Label>
            <Badge variant={pattern.isPublic ? "default" : "secondary"}>
              {pattern.isPublic ? "Public" : "Privé"}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {pattern.description && (
          <div>
            <Label>Description</Label>
            <p className="text-sm">{pattern.description}</p>
          </div>
        )}

        {/* Tags */}
        {pattern.tags.length > 0 && (
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {pattern.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{pattern.downloadCount}</p>
            <p className="text-xs text-muted-foreground">Téléchargements</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{pattern.rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{pattern.reviewCount}</p>
            <p className="text-xs text-muted-foreground">Avis</p>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="materials" className="space-y-4">
        <div>
          <Label>Matériaux nécessaires</Label>
          <div className="mt-2">
            {pattern.materials.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {pattern.materials.map(material => (
                  <li key={material} className="text-sm">{material}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun matériau spécifié</p>
            )}
          </div>
        </div>

        {pattern.instructions && (
          <div>
            <Label>Instructions</Label>
            <p className="text-sm mt-2">{pattern.instructions}</p>
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