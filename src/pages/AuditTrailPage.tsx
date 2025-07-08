import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

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
          <p className="text-muted-foreground">(À intégrer : table d'audit trail, filtres, export...)</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditTrailPage;
