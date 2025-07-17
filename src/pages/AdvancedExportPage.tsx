import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, FileSpreadsheet, FileSignature, LayoutTemplate, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AdvancedExportPage() {
  const [activeTab, setActiveTab] = useState('pdf');

  // Données mockées
  const pdfExports = [
    { id: 1, type: 'Facture', nom: 'Facture_001.pdf', date: '2024-07-18', statut: 'Généré' },
    { id: 2, type: 'Commande', nom: 'Commande_002.pdf', date: '2024-07-17', statut: 'Généré' },
  ];
  const excelExports = [
    { id: 1, type: 'Rapport ventes', nom: 'Ventes_Juillet.xlsx', date: '2024-07-18', statut: 'Généré' },
    { id: 2, type: 'Stock', nom: 'Stock_Juillet.xlsx', date: '2024-07-17', statut: 'Généré' },
  ];
  const templates = [
    { id: 1, nom: 'Facture standard', type: 'PDF', modifié: '2024-07-10', statut: 'Actif' },
    { id: 2, nom: 'Bon de livraison', type: 'PDF', modifié: '2024-07-12', statut: 'Actif' },
    { id: 3, nom: 'Rapport Excel', type: 'Excel', modifié: '2024-07-15', statut: 'Actif' },
  ];
  const signatures = [
    { id: 1, nom: 'Signature Gérant', type: 'Numérique', ajoutée: '2024-07-01', statut: 'Active' },
    { id: 2, nom: 'Cachet Atelier', type: 'Image', ajoutée: '2024-07-05', statut: 'Active' },
  ];

  // Handlers
  const handleExport = (type: string) => {
    toast({ title: 'Export', description: `Export ${type} généré.` });
  };
  const handlePreview = (name: string) => {
    toast({ title: 'Aperçu', description: `Aperçu du document ${name}.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Export avancé</h1>
          <p className="text-muted-foreground">Générez des documents PDF/Excel personnalisés, modèles et signatures</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pdf"><FileText className="inline h-4 w-4 mr-1" />PDF</TabsTrigger>
          <TabsTrigger value="excel"><FileSpreadsheet className="inline h-4 w-4 mr-1" />Excel</TabsTrigger>
          <TabsTrigger value="templates"><LayoutTemplate className="inline h-4 w-4 mr-1" />Templates</TabsTrigger>
          <TabsTrigger value="signatures"><FileSignature className="inline h-4 w-4 mr-1" />Signatures</TabsTrigger>
        </TabsList>

        {/* Onglet PDF */}
        <TabsContent value="pdf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exports PDF</CardTitle>
              <CardDescription>Documents PDF générés avec en-tête, pied de page et logo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pdfExports.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.nom}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleExport(row.nom)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handlePreview(row.nom)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Excel */}
        <TabsContent value="excel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exports Excel</CardTitle>
              <CardDescription>Rapports et tableaux exportés au format Excel</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelExports.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.nom}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleExport(row.nom)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handlePreview(row.nom)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modèles de documents</CardTitle>
              <CardDescription>Gérez les templates d’export PDF/Excel (en-tête, pied de page, logo)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dernière modification</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.nom}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.modifié}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handlePreview(row.nom)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleExport(row.nom)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Signatures */}
        <TabsContent value="signatures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signatures & cachets</CardTitle>
              <CardDescription>Gérez les signatures numériques et cachets pour les documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Ajoutée le</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.nom}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.ajoutée}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handlePreview(row.nom)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleExport(row.nom)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedExportPage;
