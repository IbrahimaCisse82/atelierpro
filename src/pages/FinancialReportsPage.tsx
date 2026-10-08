import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Download, TrendingUp, TrendingDown, DollarSign, RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';

export function FinancialReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('income');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(0, 1); return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Données réelles
  const { data: invoices, loading: invoicesLoading } = useSupabaseQuery('customer_invoices', {
    select: '*', orderBy: { column: 'invoice_date', ascending: true }
  });
  const { data: movements, loading: movementsLoading } = useSupabaseQuery('treasury_movements', {
    select: '*', orderBy: { column: 'movement_date', ascending: true }
  });
  const { data: treasuryAccounts } = useSupabaseQuery('treasury_accounts', { select: '*' });
  const { data: journalEntries } = useSupabaseQuery('journal_entries', {
    select: '*', orderBy: { column: 'entry_date', ascending: false }
  });
  const { data: accounts } = useSupabaseQuery('syscohada_accounts', {
    select: '*', orderBy: { column: 'account_number', ascending: true }
  });

  const isLoading = invoicesLoading || movementsLoading;

  // Filtrer par période
  const filteredInvoices = useMemo(() => 
    invoices?.filter((i: any) => i.invoice_date >= startDate && i.invoice_date <= endDate) || [],
    [invoices, startDate, endDate]
  );
  const filteredMovements = useMemo(() =>
    movements?.filter((m: any) => m.movement_date >= startDate && m.movement_date <= endDate) || [],
    [movements, startDate, endDate]
  );

  // Compte de résultat calculé
  const incomeStatement = useMemo(() => {
    const revenue = filteredInvoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
    const tax = filteredInvoices.reduce((s: number, i: any) => s + Number(i.tax_amount || 0), 0);
    const expenses = filteredMovements.filter((m: any) => m.movement_type === 'expense')
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const salaries = filteredMovements.filter((m: any) => m.category === 'salaire' || m.category === 'salary')
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const otherExpenses = expenses - salaries;
    const grossProfit = revenue - expenses;
    return { revenue, tax, expenses, salaries, otherExpenses, grossProfit, netIncome: grossProfit };
  }, [filteredInvoices, filteredMovements]);

  // Balance des comptes (depuis syscohada_accounts + journal_entry_lines)
  const balanceData = useMemo(() => {
    if (!accounts?.length) return [];
    return accounts.map((a: any) => ({
      ...a,
      debit: 0,
      credit: 0,
    }));
  }, [accounts]);

  if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">Seuls les propriétaires et gérants peuvent accéder aux rapports financiers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports Financiers</h1>
          <p className="text-muted-foreground">Compte de résultat, balance et journaux</p>
        </div>
      </div>

      {/* Filtres période */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Badge variant="outline" className="h-10 flex items-center">
                {filteredInvoices.length} factures • {filteredMovements.length} mouvements
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Compte de Résultat</TabsTrigger>
          <TabsTrigger value="balance">Balance des Comptes</TabsTrigger>
          <TabsTrigger value="journals">Écritures Comptables</TabsTrigger>
        </TabsList>

        {/* Compte de résultat */}
        <TabsContent value="income" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                    <p className="text-xl font-bold">{formatFCFA(incomeStatement.revenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total charges</p>
                    <p className="text-xl font-bold">{formatFCFA(incomeStatement.expenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className={`h-6 w-6 ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Résultat net</p>
                    <p className={`text-xl font-bold ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatFCFA(incomeStatement.netIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Détail du compte de résultat</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Poste</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Chiffre d'affaires HT</TableCell>
                    <TableCell className="text-right font-semibold">{formatFCFA(incomeStatement.revenue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">TVA collectée</TableCell>
                    <TableCell className="text-right">{formatFCFA(incomeStatement.tax)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-semibold text-red-600">Total charges</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">-{formatFCFA(incomeStatement.expenses)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Salaires</TableCell>
                    <TableCell className="text-right">-{formatFCFA(incomeStatement.salaries)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Autres charges</TableCell>
                    <TableCell className="text-right">-{formatFCFA(incomeStatement.otherExpenses)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-muted/50">
                    <TableCell className="font-bold text-lg">RÉSULTAT NET</TableCell>
                    <TableCell className={`text-right font-bold text-lg ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatFCFA(incomeStatement.netIncome)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance des comptes */}
        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Comptable SYSCOHADA</CardTitle>
              <CardDescription>
                {accounts?.length || 0} comptes enregistrés. Configurez votre plan comptable dans Paramètres &gt; SYSCOHADA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!accounts?.length ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun compte SYSCOHADA configuré. Allez dans Paramètres &gt; SYSCOHADA pour créer votre plan comptable.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Compte</TableHead>
                      <TableHead>Intitulé</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono">{a.account_number}</TableCell>
                        <TableCell>{a.account_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.account_type}</Badge>
                        </TableCell>
                        <TableCell>{a.account_category || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={a.is_active ? 'default' : 'secondary'}>
                            {a.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Écritures comptables */}
        <TabsContent value="journals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Écritures Comptables</CardTitle>
              <CardDescription>{journalEntries?.length || 0} écritures enregistrées</CardDescription>
            </CardHeader>
            <CardContent>
              {!journalEntries?.length ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune écriture comptable. Les écritures seront générées automatiquement lors des opérations.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>N° Écriture</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>{new Date(e.entry_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="font-mono">{e.entry_number}</TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell>
                          <Badge variant={e.is_posted ? 'default' : 'secondary'}>
                            {e.is_posted ? 'Validée' : 'Brouillon'}
                          </Badge>
                        </TableCell>
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

export default FinancialReportsPage;
