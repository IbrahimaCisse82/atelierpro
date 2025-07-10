import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';

export function AuditTrailPage() {
  const { user } = useAuth();
  const canViewAudit = ['owner', 'manager', 'admin', 'audit'].includes(user?.role || '');
  if (!canViewAudit) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à ce module.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Journal d'activité</h1>
          <p className="text-muted-foreground">Suivi des actions et événements importants</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historique des actions</CardTitle>
          <CardDescription>Liste des opérations sensibles et modifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end space-x-2 mb-4">
            <Button onClick={() => handleComingSoon('Créer un log manuel')}>
              <Plus className="h-4 w-4 mr-2" /> Nouveau log
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
          <p className="text-muted-foreground">(À intégrer : table d'audit trail, filtres, export...)</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditTrailPage;
