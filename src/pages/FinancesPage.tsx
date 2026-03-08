import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, DollarSign, Download, Plus, FileText, CreditCard, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { FinancialReportsPage } from '@/pages/FinancialReportsPage';
import { BankReconciliationPage } from '@/pages/BankReconciliationPage';

export function FinancesPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [activeTab, setActiveTab] = useState('overview');

  // Données réelles depuis la base
  const { data: treasuryAccounts } = useSupabaseQuery('treasury_accounts', {
    select: '*',
    orderBy: { column: 'account_name', ascending: true }
  });

  const { data: invoices } = useSupabaseQuery('customer_invoices', {
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { data: movements } = useSupabaseQuery('treasury_movements', {
    select: '*',
    orderBy: { column: 'movement_date', ascending: false },
    limit: 100
  });

  if (!role) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  // Calculs réels
  const totalTreasury = treasuryAccounts?.reduce((sum: number, a: any) => sum + Number(a.current_balance || 0), 0) || 0;
  const totalReceivables = invoices?.filter((i: any) => !i.is_paid).reduce((sum: number, i: any) => sum + Number(i.total_with_tax || 0), 0) || 0;
  const totalPaid = invoices?.filter((i: any) => i.is_paid).reduce((sum: number, i: any) => sum + Number(i.total_with_tax || 0), 0) || 0;

  const recentIncome = movements?.filter((m: any) => m.movement_type === 'income').reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0) || 0;
  const recentExpenses = movements?.filter((m: any) => m.movement_type === 'expense').reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Finances</h1>
        <Badge variant="outline">{role}</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="reports">Rapports Financiers</TabsTrigger>
          <TabsTrigger value="reconciliation">Rapprochement Bancaire</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trésorerie</p>
                    <p className="text-2xl font-bold">{formatFCFA(totalTreasury)}</p>
                    <p className="text-xs text-muted-foreground">{treasuryAccounts?.length || 0} comptes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Créances clients</p>
                    <p className="text-2xl font-bold">{formatFCFA(totalReceivables)}</p>
                    <p className="text-xs text-muted-foreground">{invoices?.filter((i: any) => !i.is_paid).length || 0} factures impayées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus récents</p>
                    <p className="text-2xl font-bold">{formatFCFA(recentIncome)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dépenses récentes</p>
                    <p className="text-2xl font-bold">{formatFCFA(recentExpenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comptes de trésorerie */}
          <Card>
            <CardHeader>
              <CardTitle>Comptes de trésorerie</CardTitle>
              <CardDescription>Soldes actuels de vos comptes</CardDescription>
            </CardHeader>
            <CardContent>
              {!treasuryAccounts?.length ? (
                <p className="text-muted-foreground text-center py-8">Aucun compte de trésorerie. Créez-en dans le module Trésorerie.</p>
              ) : (
                <div className="space-y-3">
                  {treasuryAccounts.map((account: any) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{account.account_name}</p>
                        <p className="text-sm text-muted-foreground">{account.account_type} • {account.bank_name || 'N/A'}</p>
                      </div>
                      <p className={`text-lg font-bold ${Number(account.current_balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatFCFA(Number(account.current_balance))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dernières factures impayées */}
          <Card>
            <CardHeader>
              <CardTitle>Factures impayées</CardTitle>
              <CardDescription>Créances en cours</CardDescription>
            </CardHeader>
            <CardContent>
              {!invoices?.filter((i: any) => !i.is_paid).length ? (
                <p className="text-muted-foreground text-center py-8">Aucune facture impayée.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.filter((i: any) => !i.is_paid).slice(0, 10).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          Échéance : {inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : 'Non définie'}
                        </p>
                      </div>
                      <Badge variant={inv.due_date && new Date(inv.due_date) < new Date() ? 'destructive' : 'outline'}>
                        {formatFCFA(Number(inv.total_with_tax))}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReportsPage />
        </TabsContent>

        <TabsContent value="reconciliation">
          <BankReconciliationPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancesPage;
