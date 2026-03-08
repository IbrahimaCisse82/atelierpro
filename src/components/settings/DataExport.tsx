import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2, Database, FileJson, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const EXPORT_TABLES = [
  'clients', 'orders', 'order_items', 'products', 'product_categories',
  'suppliers', 'purchase_orders', 'customer_invoices', 'employees',
  'client_measurements', 'patterns', 'models', 'treasury_accounts',
  'treasury_movements', 'fixed_assets', 'receptions',
] as const;

export function DataExport() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un fichier JSON.', variant: 'destructive' });
      return;
    }
    setPendingFile(file);
    setConfirmImport(true);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (!pendingFile || isDemo) {
      toast({ title: 'Mode démo', description: 'Import non disponible en mode démo.' });
      return;
    }

    setImporting(true);
    setConfirmImport(false);

    try {
      const text = await pendingFile.text();
      const backup = JSON.parse(text);

      if (!backup.tables || !backup.version) {
        throw new Error('Format de sauvegarde invalide.');
      }

      let imported = 0;
      let skipped = 0;

      for (const tableName of EXPORT_TABLES) {
        const rows = backup.tables[tableName];
        if (!rows || !Array.isArray(rows) || rows.length === 0) continue;

        // Upsert rows (insert with conflict handling)
        const { error } = await supabase
          .from(tableName)
          .upsert(rows as any[], { onConflict: 'id' });

        if (error) {
          console.warn(`Import ${tableName} failed:`, error.message);
          skipped++;
          continue;
        }
        imported += rows.length;
      }

      toast({
        title: 'Import réussi',
        description: `${imported} enregistrements importés. ${skipped > 0 ? `${skipped} tables ignorées.` : ''}`,
      });
    } catch (err: any) {
      toast({ title: 'Erreur d\'import', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
      setPendingFile(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sauvegarde & Restauration
          </CardTitle>
          <CardDescription>Exportez ou importez vos données au format JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleExport} disabled={exporting} className="flex-1">
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {exporting ? 'Export en cours…' : 'Exporter les données'}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex-1"
            >
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {importing ? 'Import en cours…' : 'Importer une sauvegarde'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="rounded-lg border border-border p-4 bg-muted/50">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <FileJson className="h-4 w-4" />
              Tables incluses
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

      <AlertDialog open={confirmImport} onOpenChange={setConfirmImport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirmer l'import
            </AlertDialogTitle>
            <AlertDialogDescription>
              L'import remplacera les données existantes ayant le même identifiant.
              Cette action est irréversible. Êtes-vous sûr de vouloir continuer avec le fichier
              <strong> {pendingFile?.name}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFile(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>Importer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
