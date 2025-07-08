import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Send,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour la facturation
interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  taxAmount: number;
  totalWithTax: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  isPaid: boolean;
  paidAt?: string;
  paidBy?: string;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  status: string;
  deliveryDate: string;
  totalAmount: number;
  isDelivered: boolean;
  deliveredAt?: string;
}

// Données simulées
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'FACT-2024-001',
    orderId: '1',
    orderNumber: 'CMD-2024-001',
    clientName: 'Marie Dupont',
    clientEmail: 'marie.dupont@email.com',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    totalAmount: 450.00,
    taxAmount: 90.00,
    totalWithTax: 540.00,
    status: 'paid',
    isPaid: true,
    paidAt: '2024-01-20',
    paidBy: 'Marie Dupont',
    items: [
      {
        id: '1',
        description: 'Robe de soirée sur mesure',
        quantity: 1,
        unitPrice: 450.00,
        totalPrice: 450.00
      }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'FACT-2024-002',
    orderId: '2',
    orderNumber: 'CMD-2024-002',
    clientName: 'Jean Martin',
    clientEmail: 'jean.martin@email.com',
    invoiceDate: '2024-01-16',
    dueDate: '2024-02-16',
    totalAmount: 320.00,
    taxAmount: 64.00,
    totalWithTax: 384.00,
    status: 'sent',
    isPaid: false,
    items: [
      {
        id: '2',
        description: 'Costume 3 pièces',
        quantity: 1,
        unitPrice: 320.00,
        totalPrice: 320.00
      }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'FACT-2024-003',
    orderId: '3',
    orderNumber: 'CMD-2024-003',
    clientName: 'Sophie Bernard',
    clientEmail: 'sophie.bernard@email.com',
    invoiceDate: '2024-01-12',
    dueDate: '2024-02-12',
    totalAmount: 280.00,
    taxAmount: 56.00,
    totalWithTax: 336.00,
    status: 'overdue',
    isPaid: false,
    items: [
      {
        id: '3',
        description: 'Retouches veste',
        quantity: 1,
        unitPrice: 280.00,
        totalPrice: 280.00
      }
    ]
  }
];

const mockOrdersReadyForInvoicing: Order[] = [
  {
    id: '4',
    orderNumber: 'CMD-2024-004',
    clientName: 'Paul Durand',
    status: 'delivered',
    deliveryDate: '2024-01-18',
    totalAmount: 580.00,
    isDelivered: true,
    deliveredAt: '2024-01-18T14:30:00Z'
  },
  {
    id: '5',
    orderNumber: 'CMD-2024-005',
    clientName: 'Lisa Chen',
    status: 'delivered',
    deliveryDate: '2024-01-19',
    totalAmount: 420.00,
    isDelivered: true,
    deliveredAt: '2024-01-19T10:15:00Z'
  }
];

export function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [ordersReadyForInvoicing, setOrdersReadyForInvoicing] = useState<Order[]>(mockOrdersReadyForInvoicing);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('invoices');

  // Permissions
  const canManageInvoices = ['owner', 'orders'].includes(user?.role || '');
  const canViewInvoices = ['owner', 'orders', 'customer_service'].includes(user?.role || '');

  // Filtrer les factures
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.isPaid).length;
  const pendingInvoices = invoices.filter(i => !i.isPaid && i.status !== 'cancelled').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const totalRevenue = invoices.filter(i => i.isPaid).reduce((sum, i) => sum + i.totalWithTax, 0);
  const pendingRevenue = invoices.filter(i => !i.isPaid && i.status !== 'cancelled').reduce((sum, i) => sum + i.totalWithTax, 0);

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: 'bg-gray-500', variant: 'secondary' as const },
      sent: { label: 'Envoyée', color: 'bg-blue-500', variant: 'default' as const },
      paid: { label: 'Payée', color: 'bg-green-500', variant: 'default' as const },
      overdue: { label: 'En retard', color: 'bg-red-500', variant: 'destructive' as const },
      cancelled: { label: 'Annulée', color: 'bg-gray-500', variant: 'secondary' as const }
    };
    return statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500', variant: 'secondary' as const };
  };

  const handleCreateInvoice = (order: Order) => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `FACT-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      clientEmail: `${order.clientName.toLowerCase().replace(' ', '.')}@email.com`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
      totalAmount: order.totalAmount,
      taxAmount: order.totalAmount * 0.20, // 20% de TVA
      totalWithTax: order.totalAmount * 1.20,
      status: 'draft',
      isPaid: false,
      items: [
        {
          id: '1',
          description: `Commande ${order.orderNumber}`,
          quantity: 1,
          unitPrice: order.totalAmount,
          totalPrice: order.totalAmount
        }
      ]
    };
    
    setInvoices(prev => [...prev, newInvoice]);
    setOrdersReadyForInvoicing(prev => prev.filter(o => o.id !== order.id));
  };

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: 'sent' }
        : invoice
    ));
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { 
            ...invoice, 
            status: 'paid', 
            isPaid: true, 
            paidAt: new Date().toISOString(),
            paidBy: user?.first_name + ' ' + user?.last_name
          }
        : invoice
    ));
  };

  if (!canViewInvoices) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturation</h1>
          <p className="text-muted-foreground">
            Gestion des factures et suivi des paiements
          </p>
        </div>
        {canManageInvoices && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle facture
            </Button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total factures</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
              </div>
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payées</p>
                <p className="text-2xl font-bold text-green-500">{paidInvoices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-orange-500">{pendingInvoices}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold text-red-500">{overdueInvoices}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CA encaissé</p>
                <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="ready-to-invoice">Prêtes à facturer</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        {/* Onglet Factures */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une facture..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="sent">Envoyée</option>
                    <option value="paid">Payée</option>
                    <option value="overdue">En retard</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des factures */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des factures</CardTitle>
              <CardDescription>
                {filteredInvoices.length} facture(s) trouvée(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Date facture</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const statusInfo = getStatusInfo(invoice.status);
                    const isOverdue = new Date(invoice.dueDate) < new Date() && !invoice.isPaid;
                    
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.isPaid && `Payée le ${new Date(invoice.paidAt!).toLocaleDateString('fr-FR')}`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.clientName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{invoice.orderNumber}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className={cn(
                              "text-sm",
                              isOverdue ? "text-red-500 font-medium" : ""
                            )}>
                              {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">€{invoice.totalWithTax.toLocaleString()}</span>
                            <p className="text-xs text-muted-foreground">
                              HT: €{invoice.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Facture {invoice.invoiceNumber}</DialogTitle>
                                </DialogHeader>
                                <InvoiceDetails invoice={invoice} />
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {canManageInvoices && invoice.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSendInvoice(invoice.id)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Envoyer
                              </Button>
                            )}
                            {canManageInvoices && invoice.status === 'sent' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleMarkAsPaid(invoice.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Marquer payée
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Prêtes à facturer */}
        <TabsContent value="ready-to-invoice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes prêtes à facturer</CardTitle>
              <CardDescription>
                Commandes livrées en attente de facturation automatique
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersReadyForInvoicing.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune commande en attente</h3>
                  <p className="text-muted-foreground">
                    Toutes les commandes livrées ont été facturées
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date livraison</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersReadyForInvoicing.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-medium">{order.orderNumber}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{order.clientName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(order.deliveredAt!).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">€{order.totalAmount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          {canManageInvoices && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCreateInvoice(order)}
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              Créer facture
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Rapports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chiffre d'affaires</CardTitle>
                <CardDescription>
                  Évolution des encaissements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique en cours de développement
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Délais de paiement</CardTitle>
                <CardDescription>
                  Analyse des retards de paiement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique en cours de développement
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant détails facture
function InvoiceDetails({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-6">
      {/* En-tête facture */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Client</Label>
          <p className="text-sm">{invoice.clientName}</p>
          <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
        </div>
        <div className="text-right">
          <Label>Facture</Label>
          <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Lignes de facture */}
      <div>
        <Label>Détail</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">€{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">€{item.totalPrice.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totaux */}
      <div className="space-y-2 text-right">
        <div className="flex justify-between">
          <span>Total HT:</span>
          <span>€{invoice.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>TVA (20%):</span>
          <span>€{invoice.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total TTC:</span>
          <span>€{invoice.totalWithTax.toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div>
          <Label>Notes</Label>
          <p className="text-sm">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
} 