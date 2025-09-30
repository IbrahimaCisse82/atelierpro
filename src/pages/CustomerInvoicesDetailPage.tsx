import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerInvoices } from '@/hooks/use-customer-invoices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, Plus, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export function CustomerInvoicesDetailPage() {
  const { user } = useAuth();
  const { invoices, reminders, isLoading, createReminder, markAsPaid } = useCustomerInvoices();
  const [reminderDialog, setReminderDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [reminderForm, setReminderForm] = useState({
    invoice_id: '',
    reminder_date: new Date().toISOString().split('T')[0],
    reminder_type: 'friendly',
    sent_by: 'email',
    notes: '',
  });

  const canManage = ['owner', 'manager', 'orders'].includes(user?.role || '');

  const unpaidInvoices = invoices.filter(inv => !inv.is_paid);
  const overdueInvoices = unpaidInvoices.filter(inv => 
    new Date(inv.due_date) < new Date()
  );

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.total_with_tax, 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total_with_tax, 0);

  const getStatusBadge = (invoice: any) => {
    if (invoice.is_paid) {
      return <Badge className="bg-green-600">Payée</Badge>;
    }
    
    const daysOverdue = differenceInDays(new Date(), new Date(invoice.due_date));
    
    if (daysOverdue > 0) {
      return <Badge className="bg-red-600">En retard ({daysOverdue}j)</Badge>;
    }
    
    if (daysOverdue > -7) {
      return <Badge className="bg-orange-600">À échéance</Badge>;
    }
    
    return <Badge variant="outline">En attente</Badge>;
  };

  const handleSendReminder = (invoice: any) => {
    setSelectedInvoice(invoice);
    setReminderForm({
      ...reminderForm,
      invoice_id: invoice.id,
    });
    setReminderDialog(true);
  };

  const handleSubmitReminder = (e: React.FormEvent) => {
    e.preventDefault();
    createReminder(reminderForm as any);
    setReminderDialog(false);
  };

  const handleMarkPaid = (id: string) => {
    if (confirm('Marquer cette facture comme payée ?')) {
      markAsPaid(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Factures Clients</h1>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impayées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unpaidInvoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant Impayé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatFCFA(totalUnpaid)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatFCFA(totalOverdue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Factures en retard */}
      {overdueInvoices.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Factures en retard - Action requise
            </CardTitle>
            <CardDescription className="text-red-700">
              {overdueInvoices.length} facture(s) en retard pour un total de {formatFCFA(totalOverdue)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueInvoices.slice(0, 5).map((invoice) => {
                const daysOverdue = differenceInDays(new Date(), new Date(invoice.due_date));
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        Échéance dépassée de {daysOverdue} jours - {formatFCFA(invoice.total_with_tax)}
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleSendReminder(invoice)}>
                          <Send className="h-4 w-4 mr-1" />
                          Relancer
                        </Button>
                        <Button size="sm" onClick={() => handleMarkPaid(invoice.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Payée
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les factures</CardTitle>
          <CardDescription>{invoices.length} facture(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                  <TableCell>{format(new Date(invoice.invoice_date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>{(invoice as any).orders?.order_number || '-'}</TableCell>
                  <TableCell className="text-right font-medium">{formatFCFA(invoice.total_with_tax)}</TableCell>
                  <TableCell>{getStatusBadge(invoice)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canManage && !invoice.is_paid && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(invoice)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historique des relances */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des relances</CardTitle>
          <CardDescription>{reminders.length} relance(s) envoyée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Facture</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Envoyée par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.slice(0, 10).map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell>{format(new Date(reminder.reminder_date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>{(reminder as any).customer_invoices?.invoice_number}</TableCell>
                  <TableCell>
                    <Badge variant={
                      reminder.reminder_type === 'friendly' ? 'default' :
                      reminder.reminder_type === 'formal' ? 'secondary' :
                      'destructive'
                    }>
                      {reminder.reminder_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{reminder.sent_by || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog relance */}
      <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une relance</DialogTitle>
            <DialogDescription>
              Facture {selectedInvoice?.invoice_number} - {formatFCFA(selectedInvoice?.total_with_tax)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReminder} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reminder_type">Type de relance *</Label>
                <Select 
                  value={reminderForm.reminder_type} 
                  onValueChange={(value) => setReminderForm({ ...reminderForm, reminder_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Amicale</SelectItem>
                    <SelectItem value="formal">Formelle</SelectItem>
                    <SelectItem value="final">Dernière relance</SelectItem>
                    <SelectItem value="legal">Mise en demeure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sent_by">Mode d'envoi *</Label>
                <Select 
                  value={reminderForm.sent_by} 
                  onValueChange={(value) => setReminderForm({ ...reminderForm, sent_by: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="phone">Téléphone</SelectItem>
                    <SelectItem value="mail">Courrier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={reminderForm.notes}
                  onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReminderDialog(false)}>
                Annuler
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomerInvoicesDetailPage;