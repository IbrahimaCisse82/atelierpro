import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, FileText } from 'lucide-react';

export function ReportsPage() {
  const { user } = useAuth();
  // Permissions centralisées
  const canViewReports = ['owner', 'manager', 'reports', 'finance', 'admin'].includes(user?.role || '');
  if (!canViewReports) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
          <p className="text-muted-foreground">Visualisez et exportez les rapports clés de l'atelier</p>
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
