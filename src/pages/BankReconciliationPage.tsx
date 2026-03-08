import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, XCircle, CreditCard, RefreshCw, Download, FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function BankReconciliationPage() {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  // Données réelles
  const { data: treasuryAccounts } = useSupabaseQuery('treasury_accounts', {
    select: '*', orderBy: { column: 'account_name', ascending: true }
  });

  const { data: movements, refetch: refetchMovements } = useSupabaseQuery('treasury_movements', {
    select: '*',
    filters: selectedAccount ? { treasury_account_id: selectedAccount } : {},
    orderBy: { column: 'movement_date', ascending: false },
    enabled: !!selectedAccount
  });

  const { data: bankStatements, refetch: refetchStatements } = useSupabaseQuery('bank_statements', {
    select: '*',
    filters: selectedAccount ? { treasury_account_id: selectedAccount } : {},
    orderBy: { column: 'statement_date', ascending: false },
    enabled: !!selectedAccount
  });

  const { data: reconciliations } = useSupabaseQuery('bank_reconciliations', {
    select: '*',
    filters: selectedAccount ? { treasury_account_id: selectedAccount } : {},
    orderBy: { column: 'reconciliation_date', ascending: false },
    enabled: !!selectedAccount
  });

  const { update: updateMovement } = useSupabaseMutation('treasury_movements');
  const { create: createReconciliation } = useSupabaseMutation('bank_reconciliations');

  const selectedAccountData = useMemo(() =>
    treasuryAccounts?.find((a: any) => a.id === selectedAccount),
    [treasuryAccounts, selectedAccount]
  );

  const reconciledCount = movements?.filter((m: any) => m.is_reconciled).length || 0;
  const unreconciledCount = movements?.filter((m: any) => !m.is_reconciled).length || 0;
  const unreconciledMovements = movements?.filter((m: any) => !m.is_reconciled) || [];
  const reconciledMovements = movements?.filter((m: any) => m.is_reconciled) || [];

  const handleToggleReconcile = async (movementId: string, currentState: boolean) => {
    try {
      await updateMovement(movementId, { is_reconciled: !currentState });
      refetchMovements();
      toast({
        title: currentState ? "Dé-rapproché" : "Rapproché",
        description: `Mouvement ${currentState ? 'dé-rapproché' : 'rapproché'} avec succès.`,
      });
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le rapprochement.", variant: "destructive" });
    }
  };

  const handleFinalizeReconciliation = async () => {
    if (!selectedAccount || !selectedAccountData) return;
    try {
      await createReconciliation({
        treasury_account_id: selectedAccount,
        reconciliation_date: new Date().toISOString().split('T')[0],
        bank_statement_balance: Number(selectedAccountData.current_balance),
        book_balance: Number(selectedAccountData.current_balance),
        reconciled_balance: Number(selectedAccountData.current_balance),
        differences: 0,
        is_completed: true,
      });
      toast({ title: "Rapprochement finalisé", description: "Le rapprochement bancaire a été enregistré." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de finaliser.", variant: "destructive" });
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">Seuls les propriétaires et gérants peuvent accéder au rapprochement bancaire.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapprochement Bancaire</h1>
          <p className="text-muted-foreground">Rapprochez vos mouvements de trésorerie</p>
        </div>
      </div>

      {/* Sélection du compte */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Compte de trésorerie</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un compte" /></SelectTrigger>
                <SelectContent>
                  {treasuryAccounts?.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.account_name} - {a.account_number || 'N/A'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Solde actuel</Label>
              <div className="text-2xl font-bold text-green-600">
                {selectedAccountData ? formatFCFA(Number(selectedAccountData.current_balance)) : '-'}
              </div>
            </div>
            <div>
              <Label>Statut rapprochement</Label>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{reconciledCount} rapprochés</Badge>
                <Badge variant={unreconciledCount > 0 ? 'destructive' : 'default'}>{unreconciledCount} en attente</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAccount && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleFinalizeReconciliation} disabled={unreconciledCount > 0}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finaliser le rapprochement
            </Button>
          </div>

          {/* Mouvements non rapprochés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Mouvements non rapprochés ({unreconciledCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!unreconciledMovements.length ? (
                <p className="text-center text-muted-foreground py-4">Tous les mouvements sont rapprochés ✓</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>N°</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unreconciledMovements.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell>{new Date(m.movement_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="font-mono text-sm">{m.movement_number}</TableCell>
                        <TableCell>{m.description}</TableCell>
                        <TableCell>
                          <Badge variant={m.movement_type === 'income' ? 'default' : 'destructive'}>
                            {m.movement_type === 'income' ? 'Entrée' : 'Sortie'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatFCFA(Number(m.amount))}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleToggleReconcile(m.id, false)}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Rapprocher
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Mouvements rapprochés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Mouvements rapprochés ({reconciledCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reconciledMovements.length ? (
                <p className="text-center text-muted-foreground py-4">Aucun mouvement rapproché.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>N°</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reconciledMovements.map((m: any) => (
                      <TableRow key={m.id} className="opacity-70">
                        <TableCell>{new Date(m.movement_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="font-mono text-sm">{m.movement_number}</TableCell>
                        <TableCell>{m.description}</TableCell>
                        <TableCell className="text-right">{formatFCFA(Number(m.amount))}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => handleToggleReconcile(m.id, true)}>
                            Annuler
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Historique */}
          {reconciliations?.length ? (
            <Card>
              <CardHeader><CardTitle>Historique des rapprochements</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Solde bancaire</TableHead>
                      <TableHead>Solde comptable</TableHead>
                      <TableHead>Différence</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reconciliations.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.reconciliation_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{formatFCFA(Number(r.bank_statement_balance))}</TableCell>
                        <TableCell>{formatFCFA(Number(r.book_balance))}</TableCell>
                        <TableCell className={Number(r.differences) !== 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatFCFA(Number(r.differences))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.is_completed ? 'default' : 'secondary'}>
                            {r.is_completed ? 'Finalisé' : 'En cours'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

export default BankReconciliationPage;
