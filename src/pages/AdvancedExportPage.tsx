import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileBarChart2 } from 'lucide-react';

export function AdvancedExportPage() {
  const { user } = useAuth();
  const canViewExport = ['owner', 'manager', 'admin', 'reports', 'finance'].includes(user?.role || '');
  if (!canViewExport) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileBarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold">Export & Rapports avancés</h1>
          <p className="text-muted-foreground">Exportez les données clés de l'atelier</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Export de données</CardTitle>
          <CardDescription>Générez et téléchargez des rapports personnalisés</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">(À intégrer : options d'export, filtres, formats...)</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedExportPage;
