import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Calculator, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Save,
  X,
  Eye,
  Download,
  Upload,
  Settings,
  BookOpen,
  CreditCard,
  Building,
  FileText,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types pour le plan comptable SYSCOHADA
interface SyscohadaAccount {
  id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_category: string;
  is_active: boolean;
  is_system_account: boolean;
  parent_account_id?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les comptes de trésorerie
interface TreasuryAccount {
  id: string;
  account_name: string;
  account_type: 'cash' | 'bank' | 'mobile_money' | 'other';
  account_number?: string;
  bank_name?: string;
  branch_code?: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  is_reconciled: boolean;
  last_reconciliation_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les journaux comptables
interface AccountingJournal {
  id: string;
  journal_code: string;
  journal_name: string;
  journal_type: 'sales' | 'treasury' | 'payroll' | 'stock' | 'general' | 'purchase' | 'bank_reconciliation';
  is_active: boolean;
  is_system_journal: boolean;
  created_at: string;
  updated_at: string;
}

export function SyscohadaSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editingTreasury, setEditingTreasury] = useState<string | null>(null);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [showAddTreasuryDialog, setShowAddTreasuryDialog] = useState(false);
  const [autoGenerationEnabled, setAutoGenerationEnabled] = useState(true);

  // États pour l'édition en ligne
  const [editForm, setEditForm] = useState({
    account_number: '',
    account_name: '',
    account_type: 'asset' as const,
    account_category: '',
    is_active: true
  });

  const [treasuryForm, setTreasuryForm] = useState({
    account_name: '',
    account_type: 'cash' as const,
    account_number: '',
    bank_name: '',
    branch_code: '',
    currency: 'XOF',
    initial_balance: 0,
    notes: ''
  });

  // Récupération des données
  const { data: accounts, loading: accountsLoading, refetch: refetchAccounts } = useSupabaseQuery(
    'syscohada_accounts',
    {
      select: '*',
      orderBy: { column: 'account_number', ascending: true }
    }
  );

  const { data: treasuryAccounts, loading: treasuryLoading, refetch: refetchTreasury } = useSupabaseQuery(
    'treasury_accounts',
    {
      select: '*',
      orderBy: { column: 'account_name', ascending: true }
    }
  );

  const { data: journals, loading: journalsLoading } = useSupabaseQuery(
    'accounting_journals',
    {
      select: '*',
      orderBy: { column: 'journal_code', ascending: true }
    }
  );

  // Mutations
  const { update: updateAccount, loading: updatingAccount } = useSupabaseMutation('syscohada_accounts');
  const { create: createAccount, loading: creatingAccount } = useSupabaseMutation('syscohada_accounts');
  const { update: updateTreasury, loading: updatingTreasury } = useSupabaseMutation('treasury_accounts');
  const { create: createTreasury, loading: creatingTreasury } = useSupabaseMutation('treasury_accounts');

  // Filtrage des comptes
  const filteredAccounts = accounts?.filter((account: SyscohadaAccount) => {
    const matchesSearch = account.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.account_type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  // Gestion de l'édition en ligne des comptes
  const handleEditAccount = (account: SyscohadaAccount) => {
    setEditingAccount(account.id);
    setEditForm({
      account_number: account.account_number,
      account_name: account.account_name,
      account_type: account.account_type as 'asset',
      account_category: account.account_category,
      is_active: account.is_active
    });
  };

  const handleSaveAccount = async (accountId: string) => {
    try {
      await updateAccount(accountId, {
        ...editForm,
        updated_by: user?.id
      });
      
      setEditingAccount(null);
      refetchAccounts();
      toast({
        title: "Compte mis à jour",
        description: "Le compte a été modifié avec succès.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le compte.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
  };

  // Gestion de l'ajout de compte
  const handleAddAccount = async () => {
    try {
      await createAccount({
        ...editForm,
        created_by: user?.id,
        updated_by: user?.id
      });
      
      setShowAddAccountDialog(false);
      setEditForm({
        account_number: '',
        account_name: '',
        account_type: 'asset',
        account_category: '',
        is_active: true
      });
      refetchAccounts();
      toast({
        title: "Compte créé",
        description: "Le nouveau compte a été ajouté au plan comptable.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte.",
        variant: "destructive"
      });
    }
  };

  // Gestion de l'édition des comptes de trésorerie
  const handleEditTreasury = (treasury: TreasuryAccount) => {
    setEditingTreasury(treasury.id);
    setTreasuryForm({
      account_name: treasury.account_name,
      account_type: treasury.account_type as 'cash',
      account_number: treasury.account_number || '',
      bank_name: treasury.bank_name || '',
      branch_code: treasury.branch_code || '',
      currency: treasury.currency,
      initial_balance: treasury.initial_balance,
      notes: treasury.notes || ''
    });
  };

  const handleSaveTreasury = async (treasuryId: string) => {
    try {
      await updateTreasury(treasuryId, {
        ...treasuryForm,
        updated_by: user?.id
      });
      
      setEditingTreasury(null);
      refetchTreasury();
      toast({
        title: "Compte de trésorerie mis à jour",
        description: "Le compte a été modifié avec succès.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le compte de trésorerie.",
        variant: "destructive"
      });
    }
  };

  const handleAddTreasury = async () => {
    try {
      await createTreasury({
        ...treasuryForm,
        current_balance: treasuryForm.initial_balance,
        created_by: user?.id,
        updated_by: user?.id
      });
      
      setShowAddTreasuryDialog(false);
      setTreasuryForm({
        account_name: '',
        account_type: 'cash',
        account_number: '',
        bank_name: '',
        branch_code: '',
        currency: 'XOF',
        initial_balance: 0,
        notes: ''
      });
      refetchTreasury();
      toast({
        title: "Compte de trésorerie créé",
        description: "Le nouveau compte de trésorerie a été ajouté.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte de trésorerie.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour obtenir la couleur du type de compte
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'text-blue-600 bg-blue-50';
      case 'liability': return 'text-red-600 bg-red-50';
      case 'equity': return 'text-green-600 bg-green-50';
      case 'revenue': return 'text-purple-600 bg-purple-50';
      case 'expense': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Fonction pour obtenir l'icône du type de compte
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'asset': return <Building className="h-4 w-4" />;
      case 'liability': return <CreditCard className="h-4 w-4" />;
      case 'equity': return <BarChart3 className="h-4 w-4" />;
      case 'revenue': return <FileText className="h-4 w-4" />;
      case 'expense': return <Calculator className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les propriétaires et gérants peuvent accéder aux paramètres comptables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramétrage SYSCOHADA</h1>
          <p className="text-muted-foreground">
            Gestion du plan comptable et des paramètres financiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Plan Comptable</TabsTrigger>
          <TabsTrigger value="treasury">Trésorerie</TabsTrigger>
          <TabsTrigger value="journals">Journaux</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Onglet Plan Comptable */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plan Comptable SYSCOHADA</CardTitle>
                  <CardDescription>
                    Gestion des comptes du plan comptable avec édition en ligne
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddAccountDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un compte
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtres et recherche */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher un compte..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="asset">Actifs</SelectItem>
                    <SelectItem value="liability">Passifs</SelectItem>
                    <SelectItem value="equity">Capitaux propres</SelectItem>
                    <SelectItem value="revenue">Produits</SelectItem>
                    <SelectItem value="expense">Charges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tableau des comptes */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Intitulé</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account: SyscohadaAccount) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          {editingAccount === account.id ? (
                            <Input
                              value={editForm.account_number}
                              onChange={(e) => setEditForm({...editForm, account_number: e.target.value})}
                              className="w-24"
                            />
                          ) : (
                            <span className="font-mono">{account.account_number}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingAccount === account.id ? (
                            <Input
                              value={editForm.account_name}
                              onChange={(e) => setEditForm({...editForm, account_name: e.target.value})}
                            />
                          ) : (
                            account.account_name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingAccount === account.id ? (
                            <Select 
                              value={editForm.account_type} 
                              onValueChange={(value: any) => setEditForm({...editForm, account_type: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="asset">Actif</SelectItem>
                                <SelectItem value="liability">Passif</SelectItem>
                                <SelectItem value="equity">Capitaux</SelectItem>
                                <SelectItem value="revenue">Produit</SelectItem>
                                <SelectItem value="expense">Charge</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={cn("flex items-center gap-1", getAccountTypeColor(account.account_type))}>
                              {getAccountTypeIcon(account.account_type)}
                              {account.account_type === 'asset' && 'Actif'}
                              {account.account_type === 'liability' && 'Passif'}
                              {account.account_type === 'equity' && 'Capitaux'}
                              {account.account_type === 'revenue' && 'Produit'}
                              {account.account_type === 'expense' && 'Charge'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingAccount === account.id ? (
                            <Input
                              value={editForm.account_category}
                              onChange={(e) => setEditForm({...editForm, account_category: e.target.value})}
                            />
                          ) : (
                            account.account_category
                          )}
                        </TableCell>
                        <TableCell>
                          {editingAccount === account.id ? (
                            <Switch
                              checked={editForm.is_active}
                              onCheckedChange={(checked) => setEditForm({...editForm, is_active: checked})}
                            />
                          ) : (
                            <Badge variant={account.is_active ? "default" : "secondary"}>
                              {account.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingAccount === account.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSaveAccount(account.id)}
                                disabled={updatingAccount}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAccount(account)}
                                disabled={account.is_system_account}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Trésorerie */}
        <TabsContent value="treasury" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comptes de Trésorerie</CardTitle>
                  <CardDescription>
                    Gestion des comptes caisse, banque et mobile money
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddTreasuryDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un compte
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du compte</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Banque</TableHead>
                      <TableHead>Solde actuel</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treasuryAccounts?.map((treasury: TreasuryAccount) => (
                      <TableRow key={treasury.id}>
                        <TableCell>
                          {editingTreasury === treasury.id ? (
                            <Input
                              value={treasuryForm.account_name}
                              onChange={(e) => setTreasuryForm({...treasuryForm, account_name: e.target.value})}
                            />
                          ) : (
                            treasury.account_name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingTreasury === treasury.id ? (
                            <Select 
                              value={treasuryForm.account_type} 
                              onValueChange={(value: any) => setTreasuryForm({...treasuryForm, account_type: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Caisse</SelectItem>
                                <SelectItem value="bank">Banque</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline">
                              {treasury.account_type === 'cash' && 'Caisse'}
                              {treasury.account_type === 'bank' && 'Banque'}
                              {treasury.account_type === 'mobile_money' && 'Mobile Money'}
                              {treasury.account_type === 'other' && 'Autre'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingTreasury === treasury.id ? (
                            <Input
                              value={treasuryForm.account_number}
                              onChange={(e) => setTreasuryForm({...treasuryForm, account_number: e.target.value})}
                            />
                          ) : (
                            treasury.account_number || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingTreasury === treasury.id ? (
                            <Input
                              value={treasuryForm.bank_name}
                              onChange={(e) => setTreasuryForm({...treasuryForm, bank_name: e.target.value})}
                            />
                          ) : (
                            treasury.bank_name || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">
                            {treasury.current_balance.toLocaleString('fr-FR')} {treasury.currency}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={treasury.is_active ? "default" : "secondary"}>
                            {treasury.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingTreasury === treasury.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSaveTreasury(treasury.id)}
                                disabled={updatingTreasury}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTreasury(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditTreasury(treasury)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Journaux */}
        <TabsContent value="journals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journaux Comptables</CardTitle>
              <CardDescription>
                Configuration des journaux pour la saisie des écritures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Système</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journals?.map((journal: AccountingJournal) => (
                      <TableRow key={journal.id}>
                        <TableCell className="font-mono">{journal.journal_code}</TableCell>
                        <TableCell>{journal.journal_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {journal.journal_type === 'sales' && 'Ventes'}
                            {journal.journal_type === 'treasury' && 'Trésorerie'}
                            {journal.journal_type === 'payroll' && 'Paie'}
                            {journal.journal_type === 'stock' && 'Stocks'}
                            {journal.journal_type === 'general' && 'Général'}
                            {journal.journal_type === 'purchase' && 'Achats'}
                            {journal.journal_type === 'bank_reconciliation' && 'Rapprochement'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={journal.is_active ? "default" : "secondary"}>
                            {journal.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {journal.is_system_journal ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Génération Automatique</CardTitle>
              <CardDescription>
                Configuration de la génération automatique des écritures comptables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-generation">Génération automatique des écritures</Label>
                  <p className="text-sm text-muted-foreground">
                    Active la génération automatique des écritures à partir des flux métiers
                  </p>
                </div>
                <Switch
                  id="auto-generation"
                  checked={autoGenerationEnabled}
                  onCheckedChange={setAutoGenerationEnabled}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Écritures automatiques activées</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Commandes livrées → Ventes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Paiements clients → Trésorerie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Salaires versés → Paie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Mouvements de stock → Stocks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Immobilisations → Amortissements</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Journaux utilisés</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Journal des Ventes (VTE)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Journal de Trésorerie (TRS)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Journal de Paie (PAY)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Journal des Stocks (STK)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Journal Divers (DIV)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'ajout de compte */}
      <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un compte</DialogTitle>
            <DialogDescription>
              Créer un nouveau compte dans le plan comptable SYSCOHADA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="account-number">Numéro de compte</Label>
              <Input
                id="account-number"
                value={editForm.account_number}
                onChange={(e) => setEditForm({...editForm, account_number: e.target.value})}
                placeholder="Ex: 701"
              />
            </div>
            <div>
              <Label htmlFor="account-name">Intitulé du compte</Label>
              <Input
                id="account-name"
                value={editForm.account_name}
                onChange={(e) => setEditForm({...editForm, account_name: e.target.value})}
                placeholder="Ex: Ventes de marchandises"
              />
            </div>
            <div>
              <Label htmlFor="account-type">Type de compte</Label>
              <Select 
                value={editForm.account_type} 
                onValueChange={(value: any) => setEditForm({...editForm, account_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Actif</SelectItem>
                  <SelectItem value="liability">Passif</SelectItem>
                  <SelectItem value="equity">Capitaux propres</SelectItem>
                  <SelectItem value="revenue">Produit</SelectItem>
                  <SelectItem value="expense">Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="account-category">Catégorie</Label>
              <Input
                id="account-category"
                value={editForm.account_category}
                onChange={(e) => setEditForm({...editForm, account_category: e.target.value})}
                placeholder="Ex: Ventes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAccount} disabled={creatingAccount}>
              {creatingAccount ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le compte'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout de compte de trésorerie */}
      <Dialog open={showAddTreasuryDialog} onOpenChange={setShowAddTreasuryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un compte de trésorerie</DialogTitle>
            <DialogDescription>
              Créer un nouveau compte de trésorerie (caisse, banque, mobile money)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="treasury-name">Nom du compte</Label>
              <Input
                id="treasury-name"
                value={treasuryForm.account_name}
                onChange={(e) => setTreasuryForm({...treasuryForm, account_name: e.target.value})}
                placeholder="Ex: Caisse principale"
              />
            </div>
            <div>
              <Label htmlFor="treasury-type">Type de compte</Label>
              <Select 
                value={treasuryForm.account_type} 
                onValueChange={(value: any) => setTreasuryForm({...treasuryForm, account_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Caisse</SelectItem>
                  <SelectItem value="bank">Banque</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="treasury-number">Numéro de compte</Label>
              <Input
                id="treasury-number"
                value={treasuryForm.account_number}
                onChange={(e) => setTreasuryForm({...treasuryForm, account_number: e.target.value})}
                placeholder="Ex: 123456789"
              />
            </div>
            <div>
              <Label htmlFor="treasury-bank">Nom de la banque</Label>
              <Input
                id="treasury-bank"
                value={treasuryForm.bank_name}
                onChange={(e) => setTreasuryForm({...treasuryForm, bank_name: e.target.value})}
                placeholder="Ex: BICICI"
              />
            </div>
            <div>
              <Label htmlFor="treasury-balance">Solde initial</Label>
              <Input
                id="treasury-balance"
                type="number"
                value={treasuryForm.initial_balance}
                onChange={(e) => setTreasuryForm({...treasuryForm, initial_balance: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="treasury-notes">Notes</Label>
              <Textarea
                id="treasury-notes"
                value={treasuryForm.notes}
                onChange={(e) => setTreasuryForm({...treasuryForm, notes: e.target.value})}
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTreasuryDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTreasury} disabled={creatingTreasury}>
              {creatingTreasury ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le compte'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 