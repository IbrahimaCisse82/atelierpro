import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Upload, CheckCircle, RefreshCw, FileText, Search, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export function AuditTrailPage() {
  const [activeTab, setActiveTab] = useState('reconciliations');

  // Données mockées
  const reconciliations = [
    { id: 1, date: '2024-07-01', compte: 'BICIS', soldeBanque: 1200000, soldeComptable: 1198000, ecart: 2000, statut: 'Validé' },
    { id: 2, date: '2024-07-10', compte: 'ORANGE MONEY', soldeBanque: 500000, soldeComptable: 500000, ecart: 0, statut: 'Validé' },
    { id: 3, date: '2024-07-15', compte: 'BICIS', soldeBanque: 900000, soldeComptable: 900000, ecart: 0, statut: 'En attente' },
  ];
  const importPreview = [
    { id: 1, date: '2024-07-15', libelle: 'Virement client', montant: 150000, sens: 'Crédit' },
    { id: 2, date: '2024-07-16', libelle: 'Paiement fournisseur', montant: -80000, sens: 'Débit' },
  ];
  const autoMatches = [
    { id: 1, date: '2024-07-15', libelle: 'Virement client', montant: 150000, rapprochement: 'Trouvé', statut: 'Validé' },
    { id: 2, date: '2024-07-16', libelle: 'Paiement fournisseur', montant: -80000, rapprochement: 'À valider', statut: 'En attente' },
  ];
  const history = [
    { id: 1, date: '2024-06-30', compte: 'BICIS', soldeBanque: 1000000, soldeComptable: 1000000, ecart: 0, statut: 'Validé' },
    { id: 2, date: '2024-06-15', compte: 'ORANGE MONEY', soldeBanque: 300000, soldeComptable: 300000, ecart: 0, statut: 'Validé' },
  ];

  // Handlers
  const handleExport = (type: string) => {
    toast({ title: 'Export', description: `Export du ${type} généré.` });
  };
  const handleImport = () => {
    toast({ title: 'Import', description: 'Relevé importé avec succès.' });
  };
  const handleValidate = (id: number) => {
    toast({ title: 'Validation', description: `Rapprochement ${id} validé.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapprochement Bancaire</h1>
          <p className="text-muted-foreground">Importez, rapprochez et validez vos opérations bancaires</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reconciliations"><CheckCircle className="inline h-4 w-4 mr-1" />Rapprochements</TabsTrigger>
          <TabsTrigger value="import"><Upload className="inline h-4 w-4 mr-1" />Import relevé</TabsTrigger>
          <TabsTrigger value="auto"><RefreshCw className="inline h-4 w-4 mr-1" />Rapprochement auto</TabsTrigger>
          <TabsTrigger value="history"><History className="inline h-4 w-4 mr-1" />Historique</TabsTrigger>
        </TabsList>

        {/* Onglet Rapprochements */}
        <TabsContent value="reconciliations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapprochements en cours</CardTitle>
              <CardDescription>Liste des rapprochements bancaires récents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Solde banque</TableHead>
                    <TableHead>Solde comptable</TableHead>
                    <TableHead>Écart</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliations.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.compte}</TableCell>
                      <TableCell>{row.soldeBanque.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.soldeComptable.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell className={row.ecart === 0 ? 'text-green-600' : 'text-red-600'}>{row.ecart.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleValidate(row.id)} disabled={row.statut === 'Validé'}>
                          Valider
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('rapprochements')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Import relevé */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importer un relevé bancaire</CardTitle>
              <CardDescription>Chargez un fichier CSV ou PDF pour démarrer le rapprochement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center mb-4">
                <Input type="file" accept=".csv,.pdf" />
                <Button onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />Importer
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Sens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importPreview.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.libelle}</TableCell>
                      <TableCell>{row.montant.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.sens}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Rapprochement automatique */}
        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapprochement automatique</CardTitle>
              <CardDescription>Suggestions d’appariement entre relevé et comptabilité</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Rapprochement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {autoMatches.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.libelle}</TableCell>
                      <TableCell>{row.montant.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.rapprochement}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleValidate(row.id)} disabled={row.statut === 'Validé'}>
                          Valider
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('rapprochement-auto')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des rapprochements</CardTitle>
              <CardDescription>Consultez l’historique des rapprochements validés</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Solde banque</TableHead>
                    <TableHead>Solde comptable</TableHead>
                    <TableHead>Écart</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.compte}</TableCell>
                      <TableCell>{row.soldeBanque.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.soldeComptable.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell className={row.ecart === 0 ? 'text-green-600' : 'text-red-600'}>{row.ecart.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.statut}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('historique')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuditTrailPage;
