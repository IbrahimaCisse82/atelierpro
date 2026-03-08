import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2, Database, FileJson } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EXPORT_TABLES = [
  'clients', 'orders', 'order_items', 'products', 'product_categories',
  'suppliers', 'purchase_orders', 'customer_invoices', 'employees',
  'client_measurements', 'patterns', 'models', 'treasury_accounts',
  'treasury_movements', 'fixed_assets', 'receptions',
] as const;

export function DataExport() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const isDemo = user ? isDemoMode(user.id) : false;

  const handleExport = async () => {
    if (isDemo) {
      toast({ title: 'Mode démo', description: 'Export non disponible en mode démo.' });
      return;
    }

    setExporting(true);
    try {
      const exportData: Record<string, any[]> = {};

      for (const table of EXPORT_TABLES) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          console.warn(`Export ${table} skipped:`, error.message);
          continue;
        }
        exportData[table] = data || [];
      }

      const blob = new Blob(
        [JSON.stringify({
          exportedAt: new Date().toISOString(),
          version: '1.0',
          companyId: user?.companyId,
          tables: exportData,
        }, null, 2)],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atelierpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const totalRecords = Object.values(exportData).reduce((s, arr) => s + arr.length, 0);
      toast({ title: 'Export réussi', description: `${totalRecords} enregistrements exportés dans ${Object.keys(exportData).length} tables.` });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = () => {
    toast({ title: 'Bientôt disponible', description: "L'import de sauvegarde sera disponible dans une prochaine version." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sauvegarde & Restauration
        </CardTitle>
        <CardDescription>Exportez toutes vos données au format JSON pour sauvegarde externe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExport} disabled={exporting} className="flex-1">
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {exporting ? 'Export en cours…' : 'Exporter les données'}
          </Button>
          <Button variant="outline" onClick={handleImport} className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Importer une sauvegarde
          </Button>
        </div>

        <div className="rounded-lg border border-border p-4 bg-muted/50">
          <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
            <FileJson className="h-4 w-4" />
            Tables incluses dans l'export
          </h4>
          <div className="flex flex-wrap gap-2">
            {EXPORT_TABLES.map(t => (
              <span key={t} className="text-xs bg-background border border-border rounded px-2 py-1 text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
