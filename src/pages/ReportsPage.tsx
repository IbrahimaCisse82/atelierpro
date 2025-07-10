import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';

export function ReportsPage() {
  const { user } = useAuth();
  // Permissions désactivées pour activer tous les boutons
  const canViewReports = true;

  // Toast handler générique
  const handleComingSoon = (action: string) => {
    toast({
      title: 'Fonctionnalité à venir',
      description: `L'action « ${action} » sera bientôt disponible.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
          <p className="text-muted-foreground">Visualisez et exportez les rapports clés de l'atelier</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleComingSoon('Créer un rapport')}>
            <Plus className="h-4 w-4 mr-2" /> Nouveau rapport
          </Button>
          <Button variant="outline" onClick={() => handleComingSoon('Exporter')}>
            <Download className="h-4 w-4 mr-2" /> Exporter
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleComingSoon('Voir')}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleComingSoon('Modifier')}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleComingSoon('Supprimer')}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Rapport de production</CardTitle>
            <CardDescription>Statistiques sur la production mensuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart2 className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-center mt-2 text-muted-foreground">(Graphique à intégrer)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rapport financier</CardTitle>
            <CardDescription>Chiffre d'affaires, dépenses, bénéfices</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart2 className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-center mt-2 text-muted-foreground">(Graphique à intégrer)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;
