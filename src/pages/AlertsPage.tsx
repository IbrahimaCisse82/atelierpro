import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, AlertTriangle, Package, Clock, Mail, CheckCircle, Download, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AlertsPage() {
  const [activeTab, setActiveTab] = useState('stock');

  // Données mockées
  const stockAlerts = [
    { id: 1, produit: 'Tissu wax bleu', seuil: 10, stock: 6, date: '2024-07-18', statut: 'Non acquittée' },
    { id: 2, produit: 'Fil blanc', seuil: 20, stock: 15, date: '2024-07-18', statut: 'Non acquittée' },
  ];
  const orderAlerts = [
    { id: 1, commande: 'CMD-001', client: 'Marie Dupont', retard: 2, date: '2024-07-16', statut: 'En retard' },
    { id: 2, commande: 'CMD-002', client: 'Jean Martin', retard: 1, date: '2024-07-17', statut: 'En retard' },
  ];
  const notifications = [
    { id: 1, type: 'Stock', message: 'Stock faible sur Tissu wax bleu', date: '2024-07-18', destinataire: 'Gérant', statut: 'Envoyée' },
    { id: 2, type: 'Commande', message: 'Commande CMD-001 en retard', date: '2024-07-18', destinataire: 'Client', statut: 'Envoyée' },
  ];
  const history = [
    { id: 1, type: 'Stock', message: 'Stock faible sur Fil blanc', date: '2024-07-10', action: 'Acquittée' },
    { id: 2, type: 'Commande', message: 'Commande CMD-003 en retard', date: '2024-07-09', action: 'Relancée' },
  ];

  // Handlers
  const handleAcknowledge = (id: number) => {
    toast({ title: 'Alerte acquittée', description: `Alerte ${id} acquittée.` });
  };
  const handleNotify = (id: number) => {
    toast({ title: 'Notification envoyée', description: `Notification pour l’alerte ${id} envoyée par email.` });
  };
  const handleExport = (type: string) => {
    toast({ title: 'Export', description: `Export des alertes ${type} généré.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alertes</h1>
          <p className="text-muted-foreground">Surveillez les stocks, commandes et notifications critiques</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stock"><Package className="inline h-4 w-4 mr-1" />Stock</TabsTrigger>
          <TabsTrigger value="orders"><Clock className="inline h-4 w-4 mr-1" />Commandes</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="inline h-4 w-4 mr-1" />Notifications</TabsTrigger>
          <TabsTrigger value="history"><History className="inline h-4 w-4 mr-1" />Historique</TabsTrigger>
        </TabsList>

        {/* Onglet Stock */}
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes de stock faible</CardTitle>
              <CardDescription>Produits dont le stock est sous le seuil critique</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Seuil</TableHead>
                    <TableHead>Stock actuel</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockAlerts.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.produit}</TableCell>
                      <TableCell>{row.seuil}</TableCell>
                      <TableCell className={row.stock < row.seuil ? 'text-red-600' : ''}>{row.stock}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleAcknowledge(row.id)}>
                          Acquitter
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleNotify(row.id)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('stock')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Commandes */}
        <TabsContent value="orders" className="space-y-4">
      <Card>
        <CardHeader>
              <CardTitle>Alertes de commandes en retard</CardTitle>
              <CardDescription>Commandes à relancer ou à notifier</CardDescription>
        </CardHeader>
        <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Retard (jours)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderAlerts.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.commande}</TableCell>
                      <TableCell>{row.client}</TableCell>
                      <TableCell className="text-red-600">{row.retard}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleAcknowledge(row.id)}>
                          Acquitter
            </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleNotify(row.id)}>
                          <Mail className="h-4 w-4" />
            </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('commandes')}>
                  <Download className="h-4 w-4 mr-2" />Exporter
            </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications envoyées</CardTitle>
              <CardDescription>Historique des notifications critiques</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.message}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.destinataire}</TableCell>
                      <TableCell>{row.statut}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handleExport('notifications')}>
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
              <CardTitle>Historique des alertes</CardTitle>
              <CardDescription>Actions prises sur les alertes passées</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.message}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.action}</TableCell>
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

export default AlertsPage;
