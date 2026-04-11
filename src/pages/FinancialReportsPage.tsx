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
  FileText, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { SYSCOHADA_CLASS_SHORT, SYSCOHADA_CLASS_COLORS } from '@/lib/syscohada-constants';
import { cn } from '@/lib/utils';

export function FinancialReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('income');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(0, 1); return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: invoices, loading: invoicesLoading } = useSupabaseQuery('customer_invoices', {
    select: '*', orderBy: { column: 'invoice_date', ascending: true }
  });
  const { data: movements, loading: movementsLoading } = useSupabaseQuery('treasury_movements', {
    select: '*', orderBy: { column: 'movement_date', ascending: true }
  });
  const { data: accounts } = useSupabaseQuery('syscohada_accounts', {
    select: '*', orderBy: { column: 'account_number', ascending: true }
  });
  const { data: journalEntries } = useSupabaseQuery('journal_entries', {
    select: '*', orderBy: { column: 'entry_date', ascending: false }
  });

  const isLoading = invoicesLoading || movementsLoading;

  const filteredInvoices = useMemo(() => 
    invoices?.filter((i: any) => i.invoice_date >= startDate && i.invoice_date <= endDate) || [],
    [invoices, startDate, endDate]
  );
  const filteredMovements = useMemo(() =>
    movements?.filter((m: any) => m.movement_date >= startDate && m.movement_date <= endDate) || [],
    [movements, startDate, endDate]
  );

  // Soldes Intermédiaires de Gestion (SIG) SYSCOHADA
  const sig = useMemo(() => {
    const revenue = filteredInvoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
    const tax = filteredInvoices.reduce((s: number, i: any) => s + Number(i.tax_amount || 0), 0);
    
    const expenses = filteredMovements.filter((m: any) => m.movement_type === 'expense');
    const achats = expenses.filter((m: any) => ['achat', 'purchase', 'marchandise'].includes(m.category?.toLowerCase() || ''))
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const transports = expenses.filter((m: any) => m.category?.toLowerCase() === 'transport')
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const servicesExt = expenses.filter((m: any) => ['service', 'loyer', 'entretien'].includes(m.category?.toLowerCase() || ''))
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const impots = expenses.filter((m: any) => ['impot', 'taxe', 'tax'].includes(m.category?.toLowerCase() || ''))
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const personnel = expenses.filter((m: any) => ['salaire', 'salary', 'personnel'].includes(m.category?.toLowerCase() || ''))
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const dotations = expenses.filter((m: any) => ['amortissement', 'depreciation', 'dotation'].includes(m.category?.toLowerCase() || ''))
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const autresCharges = expenses.filter((m: any) => !['achat','purchase','marchandise','transport','service','loyer','entretien','impot','taxe','tax','salaire','salary','personnel','amortissement','depreciation','dotation'].includes(m.category?.toLowerCase() || ''))
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
    const fraisFinanciers = expenses.filter((m: any) => ['interet', 'financier', 'bank_fees'].includes(m.category?.toLowerCase() || ''))
      .reduce((s: number, m: any) => s + Number(m.amount || 0), 0);

    const totalCharges = expenses.reduce((s: number, m: any) => s + Number(m.amount || 0), 0);

    // SIG SYSCOHADA
    const margeCommerciale = revenue - achats; // Marge commerciale (si négoce)
    const valeurAjoutee = margeCommerciale - transports - servicesExt; // VA
    const ebe = valeurAjoutee - impots - personnel; // EBE
    const resultatExploitation = ebe - dotations - autresCharges; // RE
    const resultatFinancier = -fraisFinanciers; // RF
    const resultatActivitesOrdinaires = resultatExploitation + resultatFinancier; // RAO
    const resultatNet = resultatActivitesOrdinaires; // RN (simplifié, sans HAO)

    return {
      revenue, tax, achats, transports, servicesExt, impots, personnel, dotations,
      autresCharges, fraisFinanciers, totalCharges,
      margeCommerciale, valeurAjoutee, ebe, resultatExploitation,
      resultatFinancier, resultatActivitesOrdinaires, resultatNet
    };
  }, [filteredInvoices, filteredMovements]);

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
          <p className="text-muted-foreground">Soldes intermédiaires de gestion (SIG), balance et journaux SYSCOHADA</p>
        </div>
      </div>

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
          <TabsTrigger value="income">SIG / Compte de Résultat</TabsTrigger>
          <TabsTrigger value="balance">Balance des Comptes</TabsTrigger>
          <TabsTrigger value="journals">Écritures Comptables</TabsTrigger>
        </TabsList>

        {/* SIG SYSCOHADA */}
        <TabsContent value="income" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                    <p className="text-xl font-bold">{formatFCFA(sig.revenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valeur Ajoutée</p>
                    <p className="text-xl font-bold">{formatFCFA(sig.valeurAjoutee)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">EBE</p>
                    <p className="text-xl font-bold">{formatFCFA(sig.ebe)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className={`h-6 w-6 ${sig.resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Résultat net</p>
                    <p className={`text-xl font-bold ${sig.resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatFCFA(sig.resultatNet)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Soldes Intermédiaires de Gestion (SIG) – SYSCOHADA</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solde intermédiaire</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Chiffre d'affaires (Comptes 70)</TableCell>
                    <TableCell className="text-right font-semibold">{formatFCFA(sig.revenue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">TVA collectée (Compte 443)</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatFCFA(sig.tax)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Achats consommés (Comptes 60)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.achats)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-blue-50/50 dark:bg-blue-950/20">
                    <TableCell className="font-bold">= MARGE COMMERCIALE</TableCell>
                    <TableCell className="text-right font-bold">{formatFCFA(sig.margeCommerciale)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Transports (Comptes 61)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.transports)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Services extérieurs (Comptes 62-63)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.servicesExt)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-blue-50/50 dark:bg-blue-950/20">
                    <TableCell className="font-bold">= VALEUR AJOUTÉE</TableCell>
                    <TableCell className="text-right font-bold">{formatFCFA(sig.valeurAjoutee)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Impôts et taxes (Comptes 64)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.impots)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Charges de personnel (Comptes 66)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.personnel)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <TableCell className="font-bold">= EXCÉDENT BRUT D'EXPLOITATION (EBE)</TableCell>
                    <TableCell className={`text-right font-bold ${sig.ebe >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(sig.ebe)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Dotations aux amortissements (Comptes 68)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.dotations)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Autres charges (Comptes 65)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.autresCharges)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <TableCell className="font-bold">= RÉSULTAT D'EXPLOITATION</TableCell>
                    <TableCell className={`text-right font-bold ${sig.resultatExploitation >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(sig.resultatExploitation)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Frais financiers (Comptes 67)</TableCell>
                    <TableCell className="text-right text-red-600">-{formatFCFA(sig.fraisFinanciers)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-muted/50">
                    <TableCell className="font-bold">= RÉSULTAT FINANCIER</TableCell>
                    <TableCell className={`text-right font-bold ${sig.resultatFinancier >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(sig.resultatFinancier)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-4 bg-primary/5">
                    <TableCell className="font-bold text-lg">= RÉSULTAT DES ACTIVITÉS ORDINAIRES (RAO)</TableCell>
                    <TableCell className={`text-right font-bold text-lg ${sig.resultatActivitesOrdinaires >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatFCFA(sig.resultatActivitesOrdinaires)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-4 bg-primary/10">
                    <TableCell className="font-bold text-xl">RÉSULTAT NET</TableCell>
                    <TableCell className={`text-right font-bold text-xl ${sig.resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatFCFA(sig.resultatNet)}
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
              <CardTitle>Balance des Comptes SYSCOHADA</CardTitle>
              <CardDescription>
                {accounts?.length || 0} comptes • 9 classes SYSCOHADA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!accounts?.length ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun compte SYSCOHADA configuré. Allez dans Paramètres &gt; SYSCOHADA pour initialiser le plan comptable.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Compte</TableHead>
                      <TableHead>Intitulé</TableHead>
                      <TableHead>Classe</TableHead>
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
                          <Badge className={cn('text-xs', SYSCOHADA_CLASS_COLORS[a.account_type])}>
                            {SYSCOHADA_CLASS_SHORT[a.account_type] || a.account_type}
                          </Badge>
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
              <CardDescription>
                {journalEntries?.length || 0} écritures • Validation débit = crédit obligatoire
              </CardDescription>
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
