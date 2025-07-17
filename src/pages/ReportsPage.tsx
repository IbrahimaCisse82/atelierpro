import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, BarChart2, PieChart, TrendingUp, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');

  // Données mockées
  const salesData = [
    { id: 1, date: '2024-07-01', client: 'Marie Dupont', montant: 120000, statut: 'Payée' },
    { id: 2, date: '2024-07-02', client: 'Jean Martin', montant: 95000, statut: 'En attente' },
    { id: 3, date: '2024-07-03', client: 'Sophie Bernard', montant: 150000, statut: 'Payée' },
  ];
  const productionData = [
    { id: 1, date: '2024-07-01', article: 'Robe', employé: 'Alice', quantité: 3, statut: 'Terminé' },
    { id: 2, date: '2024-07-02', article: 'Costume', employé: 'Marc', quantité: 2, statut: 'En cours' },
  ];
  const profitData = [
    { id: 1, mois: 'Juin', ventes: 1200000, achats: 600000, charges: 200000, résultat: 400000 },
    { id: 2, mois: 'Juillet', ventes: 950000, achats: 400000, charges: 150000, résultat: 400000 },
  ];

  // Handlers
  const handleExport = (type: string) => {
    toast({ title: 'Export', description: `Export du rapport ${type} généré.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Analysez les ventes, la production et la rentabilité de l’atelier</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales"><BarChart2 className="inline h-4 w-4 mr-1" />Ventes</TabsTrigger>
          <TabsTrigger value="production"><Activity className="inline h-4 w-4 mr-1" />Production</TabsTrigger>
          <TabsTrigger value="profit"><TrendingUp className="inline h-4 w-4 mr-1" />Rentabilité</TabsTrigger>
          <TabsTrigger value="stats"><PieChart className="inline h-4 w-4 mr-1" />Statistiques</TabsTrigger>
        </TabsList>

        {/* Onglet Ventes */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des ventes</CardTitle>
              <CardDescription>Liste des ventes récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.client}</TableCell>
                      <TableCell>{row.montant.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.statut}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('ventes')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Production */}
        <TabsContent value="production" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Rapport de production</CardTitle>
              <CardDescription>Suivi de la production par article et employé</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Employé</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionData.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.article}</TableCell>
                      <TableCell>{row.employé}</TableCell>
                      <TableCell>{row.quantité}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('production')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>
              </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Onglet Rentabilité */}
        <TabsContent value="profit" className="space-y-4">
        <Card>
          <CardHeader>
              <CardTitle>Rapport de rentabilité</CardTitle>
              <CardDescription>Comparatif ventes, achats, charges et résultat</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead>Ventes</TableHead>
                    <TableHead>Achats</TableHead>
                    <TableHead>Charges</TableHead>
                    <TableHead>Résultat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitData.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.mois}</TableCell>
                      <TableCell>{row.ventes.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.achats.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell>{row.charges.toLocaleString('fr-FR')} XOF</TableCell>
                      <TableCell className={row.résultat >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {row.résultat.toLocaleString('fr-FR')} XOF
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('rentabilité')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>
              </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques globales</CardTitle>
              <CardDescription>Graphiques et indicateurs clés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                (Graphiques et statistiques à intégrer avec Chart.js ou Recharts)
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('statistiques')}>
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

export default ReportsPage;
