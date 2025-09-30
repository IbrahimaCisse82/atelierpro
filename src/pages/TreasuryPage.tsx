import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTreasury } from '@/hooks/use-treasury';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function TreasuryPage() {
  const { user } = useAuth();
  const { accounts, movements, isLoading, createAccount, createMovement } = useTreasury();
  const [dialogType, setDialogType] = useState<'account' | 'movement' | null>(null);

  const [accountForm, setAccountForm] = useState({
    account_type: 'bank',
    account_name: '',
    account_number: '',
    bank_name: '',
    currency: 'XOF',
    initial_balance: 0,
    is_active: true,
    notes: '',
  });

  const [movementForm, setMovementForm] = useState({
    treasury_account_id: '',
    movement_date: new Date().toISOString().split('T')[0],
    movement_type: 'in',
    category: 'sale',
    amount: 0,
    reference: '',
    description: '',
    beneficiary: '',
    notes: '',
  });

  const canManage = user?.role === 'owner';

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const totalIn = movements.filter(m => m.movement_type === 'in').reduce((sum, m) => sum + m.amount, 0);
  const totalOut = movements.filter(m => m.movement_type === 'out').reduce((sum, m) => sum + m.amount, 0);

  const handleSubmitAccount = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount(accountForm as any);
    setDialogType(null);
  };

  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault();
    createMovement(movementForm as any);
    setDialogType(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Trésorerie</h1>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <Dialog open={dialogType === 'account'} onOpenChange={(open) => setDialogType(open ? 'account' : null)}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Nouveau compte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau compte</DialogTitle>
                  <DialogDescription>Ajoutez un compte de trésorerie</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitAccount} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="account_type">Type *</Label>
                      <Select 
                        value={accountForm.account_type} 
                        onValueChange={(value) => setAccountForm({ ...accountForm, account_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Banque</SelectItem>
                          <SelectItem value="cash">Caisse</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="account_name">Nom du compte *</Label>
                      <Input
                        id="account_name"
                        value={accountForm.account_name}
                        onChange={(e) => setAccountForm({ ...accountForm, account_name: e.target.value })}
                        required
                      />
                    </div>

                    {accountForm.account_type === 'bank' && (
                      <>
                        <div>
                          <Label htmlFor="bank_name">Banque</Label>
                          <Input
                            id="bank_name"
                            value={accountForm.bank_name}
                            onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="account_number">Numéro de compte</Label>
                          <Input
                            id="account_number"
                            value={accountForm.account_number}
                            onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="initial_balance">Solde initial (F CFA)</Label>
                      <Input
                        id="initial_balance"
                        type="number"
                        step="0.01"
                        value={accountForm.initial_balance}
                        onChange={(e) => setAccountForm({ ...accountForm, initial_balance: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogType(null)}>
                      Annuler
                    </Button>
                    <Button type="submit">Créer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogType === 'movement'} onOpenChange={(open) => setDialogType(open ? 'movement' : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Nouveau mouvement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau mouvement</DialogTitle>
                  <DialogDescription>Enregistrez une entrée ou sortie</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitMovement} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="treasury_account_id">Compte *</Label>
                      <Select 
                        value={movementForm.treasury_account_id} 
                        onValueChange={(value) => setMovementForm({ ...movementForm, treasury_account_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="movement_date">Date *</Label>
                      <Input
                        id="movement_date"
                        type="date"
                        value={movementForm.movement_date}
                        onChange={(e) => setMovementForm({ ...movementForm, movement_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="movement_type">Type *</Label>
                      <Select 
                        value={movementForm.movement_type} 
                        onValueChange={(value) => setMovementForm({ ...movementForm, movement_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">Entrée</SelectItem>
                          <SelectItem value="out">Sortie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select 
                        value={movementForm.category} 
                        onValueChange={(value) => setMovementForm({ ...movementForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">Vente</SelectItem>
                          <SelectItem value="purchase">Achat</SelectItem>
                          <SelectItem value="salary">Salaire</SelectItem>
                          <SelectItem value="expense">Dépense</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="amount">Montant (F CFA) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={movementForm.amount}
                        onChange={(e) => setMovementForm({ ...movementForm, amount: parseFloat(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        value={movementForm.description}
                        onChange={(e) => setMovementForm({ ...movementForm, description: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="beneficiary">Bénéficiaire/Émetteur</Label>
                      <Input
                        id="beneficiary"
                        value={movementForm.beneficiary}
                        onChange={(e) => setMovementForm({ ...movementForm, beneficiary: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="reference">Référence</Label>
                      <Input
                        id="reference"
                        value={movementForm.reference}
                        onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogType(null)}>
                      Annuler
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Solde Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatFCFA(totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comptes Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.filter(a => a.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {formatFCFA(totalIn)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sorties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
              <TrendingDown className="h-5 w-5" />
              {formatFCFA(totalOut)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
        </TabsList>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Derniers mouvements</CardTitle>
              <CardDescription>{movements.length} mouvement(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.slice(0, 20).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{format(new Date(movement.movement_date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                      <TableCell>{(movement as any).treasury_accounts?.account_name}</TableCell>
                      <TableCell>{movement.description}</TableCell>
                      <TableCell>
                        {movement.movement_type === 'in' ? (
                          <Badge className="bg-green-600">Entrée</Badge>
                        ) : (
                          <Badge className="bg-red-600">Sortie</Badge>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.movement_type === 'in' ? '+' : '-'}{formatFCFA(movement.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Comptes de trésorerie</CardTitle>
              <CardDescription>{accounts.length} compte(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Banque</TableHead>
                    <TableHead className="text-right">Solde</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.account_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.account_type}</Badge>
                      </TableCell>
                      <TableCell>{account.bank_name || '-'}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatFCFA(account.current_balance)}
                      </TableCell>
                      <TableCell>
                        {account.is_active ? (
                          <Badge variant="default">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TreasuryPage;