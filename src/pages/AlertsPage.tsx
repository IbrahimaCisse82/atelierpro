import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';

export function AlertsPage() {
  const { user } = useAuth();
  const canViewAlerts = ['owner', 'manager', 'admin', 'alerts'].includes(user?.role || '');
  if (!canViewAlerts) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <BellRing className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold">Alertes intelligentes</h1>
          <p className="text-muted-foreground">Notifications et alertes automatisées</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Alertes récentes</CardTitle>
          <CardDescription>Liste des alertes générées par le système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end space-x-2 mb-4">
            <Button onClick={() => handleComingSoon('Créer une alerte')}>
              <Plus className="h-4 w-4 mr-2" /> Nouvelle alerte
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
          <p className="text-muted-foreground">(À intégrer : liste d'alertes, filtres, actions...)</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AlertsPage;
