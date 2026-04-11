import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, Plus, Search, Edit, Save, X, Download, Upload, Settings, BookOpen, AlertTriangle, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SYSCOHADA_CLASSES, SYSCOHADA_CLASS_SHORT, SYSCOHADA_CLASS_COLORS, getClassFromAccountNumber } from '@/lib/syscohada-constants';

const journalTypeLabels: Record<string, string> = {
  sales: 'Ventes', treasury: 'Trésorerie', payroll: 'Paie', stock: 'Stocks',
  general: 'Général', purchase: 'Achats', bank_reconciliation: 'Rapprochement'
};

export function SyscohadaSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [showAddJournalDialog, setShowAddJournalDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const [accountForm, setAccountForm] = useState({
    account_number: '', account_name: '', account_type: 'classe_1', account_category: '', is_active: true
  });
  const [journalForm, setJournalForm] = useState({
    journal_code: '', journal_name: '', journal_type: 'general', is_active: true
  });

  const { data: accounts, loading: accountsLoading, refetch: refetchAccounts } = useSupabaseQuery('syscohada_accounts', {
    select: '*', orderBy: { column: 'account_number', ascending: true }
  });
  const { data: journals, loading: journalsLoading, refetch: refetchJournals } = useSupabaseQuery('accounting_journals', {
    select: '*', orderBy: { column: 'journal_code', ascending: true }
  });

  const { create: createAccount } = useSupabaseMutation('syscohada_accounts');
  const { update: updateAccount } = useSupabaseMutation('syscohada_accounts');
  const { remove: deleteAccount } = useSupabaseMutation('syscohada_accounts');
  const { create: createJournal } = useSupabaseMutation('accounting_journals');
  const { remove: deleteJournal } = useSupabaseMutation('accounting_journals');

  const filteredAccounts = accounts?.filter((a: any) => {
    const matchSearch = a.account_number.includes(searchTerm) || a.account_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || a.account_type === filterType;
    return matchSearch && matchType;
  }) || [];

  // Auto-detect class when account number changes
  const handleAccountNumberChange = (value: string) => {
    const detectedClass = getClassFromAccountNumber(value);
    setAccountForm(prev => ({ 
      ...prev, 
      account_number: value,
      account_type: detectedClass !== 'autre' ? detectedClass : prev.account_type 
    }));
  };

  const handleAddAccount = async () => {
    if (!accountForm.account_number || !accountForm.account_name) {
      toast({ title: "Erreur", description: "Numéro et intitulé requis.", variant: "destructive" });
      return;
    }
    try {
      await createAccount(accountForm);
      toast({ title: "Compte créé", description: `Compte ${accountForm.account_number} – ${SYSCOHADA_CLASS_SHORT[accountForm.account_type] || ''} ajouté.` });
      setShowAddAccountDialog(false);
      setAccountForm({ account_number: '', account_name: '', account_type: 'classe_1', account_category: '', is_active: true });
      refetchAccounts();
    } catch { toast({ title: "Erreur", description: "Impossible de créer le compte.", variant: "destructive" }); }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateAccount(id, accountForm);
      toast({ title: "Compte mis à jour" });
      setEditingId(null);
      refetchAccounts();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleAddJournal = async () => {
    if (!journalForm.journal_code || !journalForm.journal_name) {
      toast({ title: "Erreur", description: "Code et nom requis.", variant: "destructive" });
      return;
    }
    try {
      await createJournal(journalForm);
      toast({ title: "Journal créé", description: `Journal ${journalForm.journal_code} ajouté.` });
      setShowAddJournalDialog(false);
      setJournalForm({ journal_code: '', journal_name: '', journal_type: 'general', is_active: true });
      refetchJournals();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleSeedAccounts = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.rpc('seed_syscohada_accounts', {
        p_company_id: user?.company_id || '',
        p_user_id: user?.id || ''
      } as any);
      if (error) throw error;
      toast({ title: "Plan comptable chargé", description: `${data} comptes SYSCOHADA standard ont été ajoutés.` });
      refetchAccounts();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">Seuls les propriétaires et gérants peuvent accéder aux paramètres comptables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramétrage SYSCOHADA</h1>
          <p className="text-muted-foreground">Plan comptable (9 classes) et journaux</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">Plan Comptable</TabsTrigger>
          <TabsTrigger value="journals">Journaux Comptables</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plan Comptable SYSCOHADA</CardTitle>
                  <CardDescription>{accounts?.length || 0} comptes • 9 classes</CardDescription>
                </div>
                <div className="flex gap-2">
                  {(!accounts?.length || accounts.length < 10) && (
                    <Button variant="outline" onClick={handleSeedAccounts} disabled={isSeeding}>
                      {isSeeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Charger plan standard
                    </Button>
                  )}
                  <Button onClick={() => setShowAddAccountDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input placeholder="Rechercher par numéro ou intitulé..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {Object.entries(SYSCOHADA_CLASSES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!filteredAccounts.length ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {accountsLoading ? 'Chargement...' : 'Aucun compte. Cliquez sur "Charger plan standard" pour initialiser le plan comptable SYSCOHADA.'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Compte</TableHead>
                        <TableHead>Intitulé</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((a: any) => (
                        <TableRow key={a.id}>
                          {editingId === a.id ? (
                            <>
                              <TableCell><Input value={accountForm.account_number} onChange={e => handleAccountNumberChange(e.target.value)} className="w-24" /></TableCell>
                              <TableCell><Input value={accountForm.account_name} onChange={e => setAccountForm({...accountForm, account_name: e.target.value})} /></TableCell>
                              <TableCell>
                                <Badge className={cn('text-xs', SYSCOHADA_CLASS_COLORS[accountForm.account_type])}>
                                  {SYSCOHADA_CLASS_SHORT[accountForm.account_type] || accountForm.account_type}
                                </Badge>
                              </TableCell>
                              <TableCell><Input value={accountForm.account_category} onChange={e => setAccountForm({...accountForm, account_category: e.target.value})} /></TableCell>
                              <TableCell>-</TableCell>
                              <TableCell className="flex gap-1">
                                <Button size="sm" onClick={() => handleSaveEdit(a.id)}><Save className="h-3 w-3" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="font-mono font-bold">{a.account_number}</TableCell>
                              <TableCell>{a.account_name}</TableCell>
                              <TableCell>
                                <Badge className={cn('text-xs', SYSCOHADA_CLASS_COLORS[a.account_type])}>
                                  {SYSCOHADA_CLASS_SHORT[a.account_type] || a.account_type}
                                </Badge>
                              </TableCell>
                              <TableCell>{a.account_category || '-'}</TableCell>
                              <TableCell><Badge variant={a.is_active ? 'default' : 'secondary'}>{a.is_active ? 'Actif' : 'Inactif'}</Badge></TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setEditingId(a.id);
                                  setAccountForm({ account_number: a.account_number, account_name: a.account_name, account_type: a.account_type, account_category: a.account_category || '', is_active: a.is_active });
                                }}><Edit className="h-3 w-3" /></Button>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Journaux Comptables</CardTitle>
                  <CardDescription>{journals?.length || 0} journaux</CardDescription>
                </div>
                <Button onClick={() => setShowAddJournalDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!journals?.length ? (
                <p className="text-center text-muted-foreground py-8">
                  {journalsLoading ? 'Chargement...' : 'Aucun journal. Créez vos journaux comptables (Ventes, Achats, Trésorerie...).'}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journals.map((j: any) => (
                      <TableRow key={j.id}>
                        <TableCell className="font-mono font-bold">{j.journal_code}</TableCell>
                        <TableCell>{j.journal_name}</TableCell>
                        <TableCell><Badge variant="outline">{journalTypeLabels[j.journal_type] || j.journal_type}</Badge></TableCell>
                        <TableCell><Badge variant={j.is_active ? 'default' : 'secondary'}>{j.is_active ? 'Actif' : 'Inactif'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog ajout compte */}
      <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un compte SYSCOHADA</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>N° Compte</Label>
              <Input value={accountForm.account_number} onChange={e => handleAccountNumberChange(e.target.value)} placeholder="Ex: 411" />
              {accountForm.account_number && (
                <p className="text-xs text-muted-foreground mt-1">
                  Classe détectée : <span className="font-semibold">{SYSCOHADA_CLASS_SHORT[getClassFromAccountNumber(accountForm.account_number)] || 'Non reconnu'}</span>
                </p>
              )}
            </div>
            <div><Label>Intitulé</Label><Input value={accountForm.account_name} onChange={e => setAccountForm({...accountForm, account_name: e.target.value})} placeholder="Ex: Clients" /></div>
            <div>
              <Label>Classe SYSCOHADA</Label>
              <Select value={accountForm.account_type} onValueChange={v => setAccountForm({...accountForm, account_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SYSCOHADA_CLASSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Catégorie</Label><Input value={accountForm.account_category} onChange={e => setAccountForm({...accountForm, account_category: e.target.value})} placeholder="Ex: Clients, Personnel, Banques..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>Annuler</Button>
            <Button onClick={handleAddAccount}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ajout journal */}
      <Dialog open={showAddJournalDialog} onOpenChange={setShowAddJournalDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un journal comptable</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Code</Label><Input value={journalForm.journal_code} onChange={e => setJournalForm({...journalForm, journal_code: e.target.value})} placeholder="Ex: VTE" /></div>
            <div><Label>Nom</Label><Input value={journalForm.journal_name} onChange={e => setJournalForm({...journalForm, journal_name: e.target.value})} placeholder="Ex: Journal des Ventes" /></div>
            <div>
              <Label>Type</Label>
              <Select value={journalForm.journal_type} onValueChange={v => setJournalForm({...journalForm, journal_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(journalTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddJournalDialog(false)}>Annuler</Button>
            <Button onClick={handleAddJournal}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SyscohadaSettingsPage;
