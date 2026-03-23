import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DollarSign, Plus, FileText, CreditCard, TrendingUp, TrendingDown,
  Smartphone, Banknote, Wallet, Building
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { FinancialReportsPage } from '@/pages/FinancialReportsPage';
import { BankReconciliationPage } from '@/pages/BankReconciliationPage';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces', icon: Banknote },
  { value: 'orange_money', label: 'Orange Money', icon: Smartphone },
  { value: 'wave', label: 'Wave', icon: Smartphone },
  { value: 'bank_transfer', label: 'Virement bancaire', icon: Building },
  { value: 'mobile_money', label: 'Mobile Money', icon: Wallet },
  { value: 'cheque', label: 'Chèque', icon: CreditCard },
];

export function FinancesPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [activeTab, setActiveTab] = useState('overview');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    order_id: '', client_id: '', amount: '', payment_method: 'cash', reference: '', notes: ''
  });

  const { data: treasuryAccounts } = useSupabaseQuery('treasury_accounts', {
    select: '*', orderBy: { column: 'account_name', ascending: true }
  });
  const { data: invoices } = useSupabaseQuery('customer_invoices', {
    select: '*', orderBy: { column: 'created_at', ascending: false }
  });
  const { data: movements } = useSupabaseQuery('treasury_movements', {
    select: '*', orderBy: { column: 'movement_date', ascending: false }, limit: 100
  });
  const { data: payments, refetch: refetchPayments } = useSupabaseQuery('payments' as any, {
    select: '*', orderBy: { column: 'created_at', ascending: false }, limit: 50
  });
  const { data: orders } = useSupabaseQuery('orders', {
    select: 'id, order_number, client_id, total_amount, paid_amount'
  });
  const { data: clients } = useSupabaseQuery('clients', {
    select: 'id, first_name, last_name'
  });

  const { create: createPayment } = useSupabaseMutation('payments' as any);

  if (!role) return <div className="p-8 text-center">Chargement...</div>;

  const totalTreasury = treasuryAccounts?.reduce((s: number, a: any) => s + Number(a.current_balance || 0), 0) || 0;
  const totalReceivables = invoices?.filter((i: any) => !i.is_paid).reduce((s: number, i: any) => s + Number(i.total_with_tax || 0), 0) || 0;
  const recentIncome = movements?.filter((m: any) => m.movement_type === 'income').reduce((s: number, m: any) => s + Number(m.amount || 0), 0) || 0;
  const recentExpenses = movements?.filter((m: any) => m.movement_type === 'expense').reduce((s: number, m: any) => s + Number(m.amount || 0), 0) || 0;

  // Calcul dette client (argent dehors)
  const clientDebts = (orders as any[])?.filter(o => Number(o.total_amount) > Number(o.paid_amount)).map(o => ({
    ...o,
    debt: Number(o.total_amount) - Number(o.paid_amount),
    clientName: (() => {
      const c = (clients as any[])?.find(c => c.id === o.client_id);
      return c ? `${c.first_name} ${c.last_name}` : 'Client inconnu';
    })()
  })).sort((a, b) => b.debt - a.debt) || [];

  const totalDebt = clientDebts.reduce((s, d) => s + d.debt, 0);

  const handleCreatePayment = async () => {
    if (!newPayment.amount || Number(newPayment.amount) <= 0) {
      toast({ title: "Erreur", description: "Montant invalide.", variant: "destructive" });
      return;
    }
    try {
      await createPayment({
        order_id: newPayment.order_id || null,
        client_id: newPayment.client_id || null,
        amount: Number(newPayment.amount),
        payment_method: newPayment.payment_method,
        reference: newPayment.reference || null,
        notes: newPayment.notes || null,
      } as any);
      toast({ title: "Succès", description: "Paiement enregistré." });
      setIsPaymentDialogOpen(false);
      setNewPayment({ order_id: '', client_id: '', amount: '', payment_method: 'cash', reference: '', notes: '' });
      refetchPayments();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const getPaymentMethodLabel = (method: string) => PAYMENT_METHODS.find(m => m.value === method)?.label || method;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Finances</h1>
        </div>
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Enregistrer un paiement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau paiement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Commande</Label>
                <Select value={newPayment.order_id} onValueChange={v => {
                  const order = (orders as any[])?.find(o => o.id === v);
                  setNewPayment(p => ({ ...p, order_id: v, client_id: order?.client_id || '' }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner (optionnel)" /></SelectTrigger>
                  <SelectContent>
                    {(orders as any[])?.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.order_number} - Reste: {formatFCFA(Number(o.total_amount) - Number(o.paid_amount))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant (FCFA) *</Label>
                  <Input type="number" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <Label>Méthode de paiement</Label>
                  <Select value={newPayment.payment_method} onValueChange={v => setNewPayment(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Référence</Label><Input value={newPayment.reference} onChange={e => setNewPayment(p => ({ ...p, reference: e.target.value }))} placeholder="N° transaction" /></div>
              <div><Label>Notes</Label><Textarea value={newPayment.notes} onChange={e => setNewPayment(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleCreatePayment}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="reconciliation">Rapprochement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><DollarSign className="h-8 w-8 text-success" /><div><p className="text-sm text-muted-foreground">Trésorerie</p><p className="text-2xl font-bold">{formatFCFA(totalTreasury)}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><FileText className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Créances</p><p className="text-2xl font-bold">{formatFCFA(totalReceivables)}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><TrendingUp className="h-8 w-8 text-success" /><div><p className="text-sm text-muted-foreground">Revenus</p><p className="text-2xl font-bold">{formatFCFA(recentIncome)}</p></div></div></CardContent></Card>
            <Card className={totalDebt > 0 ? 'border-destructive/50' : ''}><CardContent className="p-4"><div className="flex items-center gap-2"><Wallet className="h-8 w-8 text-destructive" /><div><p className="text-sm text-muted-foreground">Argent dehors</p><p className="text-2xl font-bold text-destructive">{formatFCFA(totalDebt)}</p><p className="text-xs text-muted-foreground">{clientDebts.length} client(s)</p></div></div></CardContent></Card>
          </div>

          {/* Dettes clients */}
          {clientDebts.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">💰 Argent dehors - Dettes clients</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clientDebts.slice(0, 10).map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="font-medium">{d.clientName}</p>
                        <p className="text-xs text-muted-foreground">Commande {d.order_number}</p>
                      </div>
                      <Badge variant="destructive">{formatFCFA(d.debt)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comptes */}
          <Card>
            <CardHeader><CardTitle className="text-base">Comptes de trésorerie</CardTitle></CardHeader>
            <CardContent>
              {!treasuryAccounts?.length ? (
                <p className="text-muted-foreground text-center py-8">Aucun compte. Créez-en dans le module Trésorerie.</p>
              ) : (
                <div className="space-y-2">
                  {treasuryAccounts.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div><p className="font-medium">{a.account_name}</p><p className="text-sm text-muted-foreground">{a.account_type}</p></div>
                      <p className={`text-lg font-bold ${Number(a.current_balance) >= 0 ? 'text-success' : 'text-destructive'}`}>{formatFCFA(Number(a.current_balance))}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>Acomptes et soldes reçus</CardDescription>
            </CardHeader>
            <CardContent>
              {!(payments as any[])?.length ? (
                <p className="text-muted-foreground text-center py-8">Aucun paiement enregistré.</p>
              ) : (
                <div className="space-y-2">
                  {(payments as any[]).map((p: any) => {
                    const order = (orders as any[])?.find(o => o.id === p.order_id);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">{formatFCFA(Number(p.amount))}</p>
                            <p className="text-xs text-muted-foreground">
                              {getPaymentMethodLabel(p.payment_method)}
                              {order && ` • ${order.order_number}`}
                              {p.reference && ` • Réf: ${p.reference}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{getPaymentMethodLabel(p.payment_method)}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports"><FinancialReportsPage /></TabsContent>
        <TabsContent value="reconciliation"><BankReconciliationPage /></TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancesPage;
