import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerInvoices } from '@/hooks/use-customer-invoices';
import { useOrders } from '@/hooks/use-orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, Eye, Download, Send, Receipt, DollarSign, Clock, CheckCircle,
  AlertTriangle, Calendar, FileText, CreditCard
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';

export function InvoicesPage() {
  const { user } = useAuth();
  const { invoices, reminders, isLoading, createInvoice, createReminder, markAsPaid, isCreatingInvoice } = useCustomerInvoices();
  const { orders, getDeliveredOrders, getInvoicedOrders } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('invoices');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    order_id: '',
    due_date: '',
    total_amount: 0,
    tax_amount: 0,
    notes: '',
  });

  // Stats
  const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + (inv.total_with_tax || 0), 0);
  const paidInvoices = invoices.filter((inv: any) => inv.is_paid);
  const unpaidInvoices = invoices.filter((inv: any) => !inv.is_paid);
  const totalPaid = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.total_with_tax || 0), 0);
  const totalUnpaid = unpaidInvoices.reduce((sum: number, inv: any) => sum + (inv.total_with_tax || 0), 0);

  const overdueInvoices = unpaidInvoices.filter((inv: any) => {
    if (!inv.due_date) return false;
    return new Date(inv.due_date) < new Date();
  });

  // Filtrage
  const filteredInvoices = invoices.filter((inv: any) =>
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInvoice = () => {
    if (!newInvoice.order_id || !newInvoice.due_date) {
      toast({ title: 'Erreur', description: 'Remplissez tous les champs obligatoires.', variant: 'destructive' });
      return;
    }
    const totalWithTax = newInvoice.total_amount + newInvoice.tax_amount;
    createInvoice({
      order_id: newInvoice.order_id,
      due_date: newInvoice.due_date,
      total_amount: newInvoice.total_amount,
      tax_amount: newInvoice.tax_amount,
      total_with_tax: totalWithTax,
      invoice_date: new Date().toISOString().split('T')[0],
      notes: newInvoice.notes || null,
    } as any);
    setCreateDialogOpen(false);
    setNewInvoice({ order_id: '', due_date: '', total_amount: 0, tax_amount: 0, notes: '' });
  };

  const handleSendReminder = (invoiceId: string) => {
    createReminder({
      invoice_id: invoiceId,
      reminder_date: new Date().toISOString().split('T')[0],
      reminder_type: 'email',
      notes: 'Relance automatique',
    } as any);
  };

  const exportInvoices = () => {
    const BOM = '\uFEFF';
    const csv = BOM + [
      ['N° Facture', 'Date', 'Échéance', 'HT', 'TVA', 'TTC', 'Payée'].join(','),
      ...invoices.map((inv: any) => [
        inv.invoice_number, inv.invoice_date, inv.due_date || '',
        inv.total_amount, inv.tax_amount, inv.total_with_tax,
        inv.is_paid ? 'Oui' : 'Non'
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export terminé' });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p>Chargement des factures...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturation Client</h1>
          <p className="text-muted-foreground">Gestion des factures, paiements et relances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportInvoices}>
            <Download className="h-4 w-4 mr-2" /> Exporter
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nouvelle facture</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer une facture</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Commande associée *</Label>
                  <Select value={newInvoice.order_id} onValueChange={v => setNewInvoice(p => ({ ...p, order_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une commande" /></SelectTrigger>
                    <SelectContent>
                      {orders.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.order_number} - {formatFCFA(o.total_amount)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Date d'échéance *</Label><Input type="date" value={newInvoice.due_date} onChange={e => setNewInvoice(p => ({ ...p, due_date: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Montant HT</Label><Input type="number" min={0} value={newInvoice.total_amount} onChange={e => setNewInvoice(p => ({ ...p, total_amount: Number(e.target.value) }))} /></div>
                  <div><Label>TVA</Label><Input type="number" min={0} value={newInvoice.tax_amount} onChange={e => setNewInvoice(p => ({ ...p, tax_amount: Number(e.target.value) }))} /></div>
                </div>
                <div><Label>TTC</Label><div className="text-lg font-bold">{formatFCFA(newInvoice.total_amount + newInvoice.tax_amount)}</div></div>
                <div><Label>Notes</Label><Textarea value={newInvoice.notes} onChange={e => setNewInvoice(p => ({ ...p, notes: e.target.value }))} /></div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
                  <Button onClick={handleCreateInvoice} disabled={isCreatingInvoice}>Créer</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total facturé</p><p className="text-2xl font-bold">{formatFCFA(totalInvoiced)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Payé</p><p className="text-2xl font-bold text-primary">{formatFCFA(totalPaid)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Impayé</p><p className="text-2xl font-bold text-accent-foreground">{formatFCFA(totalUnpaid)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">En retard</p><p className="text-2xl font-bold text-destructive">{overdueInvoices.length}</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices"><FileText className="h-4 w-4 mr-2" /> Factures ({invoices.length})</TabsTrigger>
          <TabsTrigger value="reminders"><Send className="h-4 w-4 mr-2" /> Relances ({reminders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par numéro..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Factures</CardTitle></CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucune facture</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>TTC</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv: any) => {
                      const isOverdue = !inv.is_paid && inv.due_date && new Date(inv.due_date) < new Date();
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                          <TableCell>{new Date(inv.invoice_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                          <TableCell>{formatFCFA(inv.total_with_tax)}</TableCell>
                          <TableCell>
                            {inv.is_paid ? (
                              <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Payée</Badge>
                            ) : isOverdue ? (
                              <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> En retard</Badge>
                            ) : (
                              <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {!inv.is_paid && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => markAsPaid(inv.id)}>
                                    <DollarSign className="h-4 w-4 mr-1" /> Payer
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleSendReminder(inv.id)}>
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Historique des relances</CardTitle></CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-8"><Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucune relance</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Relance</TableHead>
                      <TableHead>Facture</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>#{r.reminder_number}</TableCell>
                        <TableCell className="font-mono">{r.customer_invoices?.invoice_number || '-'}</TableCell>
                        <TableCell>{new Date(r.reminder_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell><Badge variant="outline">{r.reminder_type}</Badge></TableCell>
                        <TableCell>{r.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InvoicesPage;
