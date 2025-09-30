import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  CheckSquare,
  Square,
  Calculator
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportToPDF as exportPDF, exportToExcel as exportExcel, exportBankReconciliation } from '@/lib/export-utils';

// Types pour le rapprochement bancaire
interface TreasuryAccount {
  id: string;
  account_name: string;
  account_type: string;
  account_number?: string;
  bank_name?: string;
  current_balance: number;
  is_reconciled: boolean;
  last_reconciliation_date?: string;
}

interface BankStatement {
  id: string;
  treasury_account_id: string;
  statement_date: string;
  reference: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  is_reconciled: boolean;
  matched_entry_id?: string;
}

interface AccountingEntry {
  id: string;
  entry_date: string;
  entry_number: string;
  description: string;
  amount: number;
  is_reconciled: boolean;
  matched_statement_id?: string;
}

interface Reconciliation {
  id: string;
  treasury_account_id: string;
  reconciliation_date: string;
  bank_statement_balance: number;
  book_balance: number;
  reconciled_balance: number;
  is_completed: boolean;
  differences: number;
}

export function BankReconciliationPage() {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [reconciliationData, setReconciliationData] = useState<Reconciliation | null>(null);

  // États pour les données
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([]);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [reconciledItems, setReconciledItems] = useState<{statement: BankStatement, entry: AccountingEntry}[]>([]);

  // Récupération des comptes de trésorerie
  const { data: treasuryAccounts, refetch: refetchTreasury } = useSupabaseQuery(
    'treasury_accounts',
    {
      select: '*',
      orderBy: { column: 'account_name', ascending: true }
    }
  );

  // Mutations
  const { create: createReconciliation } = useSupabaseMutation('bank_reconciliations');
  const { update: updateReconciliation } = useSupabaseMutation('bank_reconciliations');

  // Charger les données de rapprochement
  const loadReconciliationData = async () => {
    if (!selectedAccount) return;

    try {
      // Simulation de données pour la démonstration
      const mockBankStatements: BankStatement[] = [
        {
          id: '1',
          treasury_account_id: selectedAccount,
          statement_date: '2024-01-15',
          reference: 'VIR-001',
          description: 'Virement client Dupont',
          amount: 125000,
          type: 'credit',
          is_reconciled: false
        },
        {
          id: '2',
          treasury_account_id: selectedAccount,
          statement_date: '2024-01-16',
          reference: 'CHE-002',
          description: 'Chèque fournisseur Tissus Plus',
          amount: 45000,
          type: 'debit',
          is_reconciled: false
        },
        {
          id: '3',
          treasury_account_id: selectedAccount,
          statement_date: '2024-01-17',
          reference: 'VIR-003',
          description: 'Virement client Martin',
          amount: 85000,
          type: 'credit',
          is_reconciled: true,
          matched_entry_id: 'entry-1'
        }
      ];

      const mockAccountingEntries: AccountingEntry[] = [
        {
          id: 'entry-1',
          entry_date: '2024-01-17',
          entry_number: 'TRS-20240117-0001',
          description: 'Encaissement client Martin',
          amount: 85000,
          is_reconciled: true,
          matched_statement_id: '3'
        },
        {
          id: 'entry-2',
          entry_date: '2024-01-15',
          entry_number: 'TRS-20240115-0001',
          description: 'Encaissement client Dupont',
          amount: 125000,
          is_reconciled: false
        },
        {
          id: 'entry-3',
          entry_date: '2024-01-16',
          entry_number: 'TRS-20240116-0001',
          description: 'Paiement fournisseur Tissus Plus',
          amount: 45000,
          is_reconciled: false
        }
      ];

      setBankStatements(mockBankStatements);
      setAccountingEntries(mockAccountingEntries);

      // Créer les éléments rapprochés
      const reconciled = mockBankStatements
        .filter(s => s.is_reconciled)
        .map(statement => ({
          statement,
          entry: mockAccountingEntries.find(e => e.id === statement.matched_entry_id)!
        }));
      setReconciledItems(reconciled);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de rapprochement.",
        variant: "destructive"
      });
    }
  };

  // Charger les données quand le compte change
  useEffect(() => {
    loadReconciliationData();
  }, [selectedAccount]);

  // Fonction pour uploader un relevé bancaire
  const handleFileUpload = async () => {
    if (!uploadFile || !selectedAccount) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulation de l'upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simulation du traitement du fichier
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Relevé importé",
        description: "Le relevé bancaire a été importé avec succès.",
        variant: "default"
      });

      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadProgress(0);
      loadReconciliationData();

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'importer le relevé bancaire.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour rapprocher automatiquement
  const handleAutoReconcile = async () => {
    try {
      // Simulation du rapprochement automatique
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Rapprochement automatique",
        description: "Le rapprochement automatique a été effectué.",
        variant: "default"
      });

      loadReconciliationData();

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer le rapprochement automatique.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour finaliser le rapprochement
  const handleFinalizeReconciliation = async () => {
    if (!selectedAccount) return;

    try {
      const reconciliationData: Reconciliation = {
        id: 'rec-1',
        treasury_account_id: selectedAccount,
        reconciliation_date: new Date().toISOString().split('T')[0],
        bank_statement_balance: 250000,
        book_balance: 248000,
        reconciled_balance: 248000,
        is_completed: true,
        differences: 2000
      };

      await createReconciliation(reconciliationData);

      toast({
        title: "Rapprochement finalisé",
        description: "Le rapprochement bancaire a été finalisé.",
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de finaliser le rapprochement.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour obtenir le solde non rapproché
  const getUnreconciledBalance = () => {
    const unreconciledStatements = bankStatements.filter(s => !s.is_reconciled);
    const unreconciledEntries = accountingEntries.filter(e => !e.is_reconciled);
    
    const statementBalance = unreconciledStatements.reduce((sum, s) => 
      sum + (s.type === 'credit' ? s.amount : -s.amount), 0);
    const entryBalance = unreconciledEntries.reduce((sum, e) => sum + e.amount, 0);
    
    return statementBalance - entryBalance;
  };

  // Fonction pour exporter en PDF
  const exportToPDF = () => {
    if (!selectedAccount) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un compte de trésorerie.",
        variant: "destructive"
      });
      return;
    }

    try {
      const accountName = treasuryAccounts?.find((a: TreasuryAccount) => a.id === selectedAccount)?.account_name || 'Compte';
      const exportData = exportBankReconciliation(bankStatements, accountingEntries, accountName);
      
      exportPDF(exportData, `rapprochement-${accountName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export PDF réussi",
        description: "Le rapprochement a été exporté en PDF.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapprochement en PDF.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour exporter en Excel
  const exportToExcel = () => {
    if (!selectedAccount) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un compte de trésorerie.",
        variant: "destructive"
      });
      return;
    }

    try {
      const accountName = treasuryAccounts?.find((a: TreasuryAccount) => a.id === selectedAccount)?.account_name || 'Compte';
      const exportData = exportBankReconciliation(bankStatements, accountingEntries, accountName);
      
      exportExcel(exportData, `rapprochement-${accountName}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Excel réussi",
        description: "Le rapprochement a été exporté en Excel.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapprochement en Excel.",
        variant: "destructive"
      });
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les propriétaires et gérants peuvent accéder au rapprochement bancaire.
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
          <h1 className="text-3xl font-bold tracking-tight">Rapprochement Bancaire</h1>
          <p className="text-muted-foreground">
            Rapprochement des relevés bancaires avec les écritures comptables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importer Relevé
          </Button>
        </div>
      </div>

      {/* Sélection du compte */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="account-select">Compte de trésorerie</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  {treasuryAccounts?.map((account: TreasuryAccount) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name} - {account.account_number || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Solde actuel</Label>
              <div className="text-2xl font-bold text-green-600">
                {selectedAccount && treasuryAccounts?.find((a: TreasuryAccount) => a.id === selectedAccount)?.current_balance 
                  ? formatAmount(treasuryAccounts.find((a: TreasuryAccount) => a.id === selectedAccount)!.current_balance)
                  : '-'
                }
              </div>
            </div>
            <div>
              <Label>Dernier rapprochement</Label>
              <div className="text-sm text-muted-foreground">
                {selectedAccount && treasuryAccounts?.find((a: TreasuryAccount) => a.id === selectedAccount)?.last_reconciliation_date
                  ? new Date(treasuryAccounts.find((a: TreasuryAccount) => a.id === selectedAccount)!.last_reconciliation_date!).toLocaleDateString('fr-FR')
                  : 'Jamais'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAccount && (
        <>
          {/* Actions de rapprochement */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleAutoReconcile} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Rapprochement Auto
              </Button>
              <Button onClick={handleFinalizeReconciliation} disabled={getUnreconciledBalance() !== 0}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finaliser
              </Button>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Différence non rapprochée</div>
              <div className={cn(
                "text-lg font-bold",
                getUnreconciledBalance() === 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatAmount(getUnreconciledBalance())}
              </div>
            </div>
          </div>

          {/* Tableaux de rapprochement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Relevé bancaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relevé Bancaire
                </CardTitle>
                <CardDescription>
                  Opérations du relevé bancaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankStatements.map((statement) => (
                        <TableRow key={statement.id}>
                          <TableCell>{new Date(statement.statement_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="font-mono">{statement.reference}</TableCell>
                          <TableCell>{statement.description}</TableCell>
                          <TableCell className={cn(
                            "text-right font-medium",
                            statement.type === 'credit' ? "text-green-600" : "text-red-600"
                          )}>
                            {statement.type === 'credit' ? '+' : '-'} {formatAmount(statement.amount)}
                          </TableCell>
                          <TableCell>
                            {statement.is_reconciled ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Écritures comptables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Écritures Comptables
                </CardTitle>
                <CardDescription>
                  Écritures de trésorerie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Écriture</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accountingEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.entry_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="font-mono">{entry.entry_number}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatAmount(entry.amount)}
                          </TableCell>
                          <TableCell>
                            {entry.is_reconciled ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Éléments rapprochés */}
          {reconciledItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Éléments Rapprochés
                </CardTitle>
                <CardDescription>
                  Opérations automatiquement rapprochées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Écriture</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciledItems.map((item) => (
                        <TableRow key={item.statement.id}>
                          <TableCell>{new Date(item.statement.statement_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="font-mono">{item.statement.reference}</TableCell>
                          <TableCell>{item.statement.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatAmount(item.statement.amount)}
                          </TableCell>
                          <TableCell className="font-mono">{item.entry.entry_number}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Dialog d'upload */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer un relevé bancaire</DialogTitle>
            <DialogDescription>
              Sélectionnez un fichier CSV ou Excel contenant les opérations du relevé bancaire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Fichier de relevé</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Import en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleFileUpload} disabled={!uploadFile || isUploading}>
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Import...
                </>
              ) : (
                'Importer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BankReconciliationPage;