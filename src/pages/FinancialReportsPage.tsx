import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  Eye,
  Printer
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportToPDF as exportPDF, exportToExcel as exportExcel, exportBalanceSheet, exportGeneralLedger, exportIncomeStatement, exportJournalEntries } from '@/lib/export-utils';

// Types pour les rapports financiers
interface AccountBalance {
  account_number: string;
  account_name: string;
  account_type: string;
  opening_debit: number;
  opening_credit: number;
  period_debit: number;
  period_credit: number;
  closing_debit: number;
  closing_credit: number;
}

interface GeneralLedgerEntry {
  entry_date: string;
  entry_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  journal_code: string;
}

interface IncomeStatement {
  revenue: number;
  expenses: number;
  gross_profit: number;
  operating_expenses: number;
  operating_income: number;
  net_income: number;
}

interface JournalEntry {
  entry_date: string;
  entry_number: string;
  description: string;
  total_debit: number;
  total_credit: number;
  journal_code: string;
  is_posted: boolean;
}

export function FinancialReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('balance');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedJournal, setSelectedJournal] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // États pour les données des rapports
  const [balanceData, setBalanceData] = useState<AccountBalance[]>([]);
  const [ledgerData, setLedgerData] = useState<GeneralLedgerEntry[]>([]);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement>({
    revenue: 0,
    expenses: 0,
    gross_profit: 0,
    operating_expenses: 0,
    operating_income: 0,
    net_income: 0
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Récupération des journaux comptables
  const { data: journals } = useSupabaseQuery(
    'accounting_journals',
    {
      select: '*',
      orderBy: { column: 'journal_code', ascending: true }
    }
  );

  // Fonction pour charger la balance des comptes
  const loadBalanceSheet = async () => {
    setIsLoading(true);
    try {
      // Simulation de données pour la démonstration
      const mockBalanceData: AccountBalance[] = [
        {
          account_number: '411',
          account_name: 'Clients',
          account_type: 'asset',
          opening_debit: 150000,
          opening_credit: 0,
          period_debit: 450000,
          period_credit: 380000,
          closing_debit: 220000,
          closing_credit: 0
        },
        {
          account_number: '57',
          account_name: 'Caisse',
          account_type: 'asset',
          opening_debit: 50000,
          opening_credit: 0,
          period_debit: 380000,
          period_credit: 320000,
          closing_debit: 110000,
          closing_credit: 0
        },
        {
          account_number: '52',
          account_name: 'Banques',
          account_type: 'asset',
          opening_debit: 200000,
          opening_credit: 0,
          period_debit: 0,
          period_credit: 0,
          closing_debit: 200000,
          closing_credit: 0
        },
        {
          account_number: '401',
          account_name: 'Fournisseurs',
          account_type: 'liability',
          opening_debit: 0,
          opening_credit: 80000,
          period_debit: 180000,
          period_credit: 220000,
          closing_debit: 0,
          closing_credit: 120000
        },
        {
          account_number: '701',
          account_name: 'Ventes de marchandises',
          account_type: 'revenue',
          opening_debit: 0,
          opening_credit: 0,
          period_debit: 0,
          period_credit: 450000,
          closing_debit: 0,
          closing_credit: 450000
        },
        {
          account_number: '66',
          account_name: 'Charges de personnel',
          account_type: 'expense',
          opening_debit: 0,
          opening_credit: 0,
          period_debit: 120000,
          period_credit: 0,
          closing_debit: 120000,
          closing_credit: 0
        }
      ];

      setBalanceData(mockBalanceData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la balance des comptes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger le grand livre
  const loadGeneralLedger = async () => {
    setIsLoading(true);
    try {
      // Simulation de données pour la démonstration
      const mockLedgerData: GeneralLedgerEntry[] = [
        {
          entry_date: '2024-01-15',
          entry_number: 'VTE-20240115-0001',
          description: 'Vente commande CMD-2024-001',
          debit_amount: 125000,
          credit_amount: 0,
          balance: 125000,
          journal_code: 'VTE'
        },
        {
          entry_date: '2024-01-15',
          entry_number: 'VTE-20240115-0001',
          description: 'Vente commande CMD-2024-001',
          debit_amount: 0,
          credit_amount: 105485,
          balance: 19515,
          journal_code: 'VTE'
        },
        {
          entry_date: '2024-01-16',
          entry_number: 'TRS-20240116-0001',
          description: 'Encaissement FACT-2024-001',
          debit_amount: 125000,
          credit_amount: 0,
          balance: 144515,
          journal_code: 'TRS'
        },
        {
          entry_date: '2024-01-16',
          entry_number: 'TRS-20240116-0001',
          description: 'Encaissement FACT-2024-001',
          debit_amount: 0,
          credit_amount: 125000,
          balance: 19515,
          journal_code: 'TRS'
        }
      ];

      setLedgerData(mockLedgerData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le grand livre.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger le compte de résultat
  const loadIncomeStatement = async () => {
    setIsLoading(true);
    try {
      // Simulation de données pour la démonstration
      const mockIncomeStatement: IncomeStatement = {
        revenue: 450000,
        expenses: 280000,
        gross_profit: 170000,
        operating_expenses: 95000,
        operating_income: 75000,
        net_income: 75000
      };

      setIncomeStatement(mockIncomeStatement);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le compte de résultat.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger les écritures de journal
  const loadJournalEntries = async () => {
    setIsLoading(true);
    try {
      // Simulation de données pour la démonstration
      const mockJournalEntries: JournalEntry[] = [
        {
          entry_date: '2024-01-15',
          entry_number: 'VTE-20240115-0001',
          description: 'Vente commande CMD-2024-001',
          total_debit: 125000,
          total_credit: 125000,
          journal_code: 'VTE',
          is_posted: true
        },
        {
          entry_date: '2024-01-16',
          entry_number: 'TRS-20240116-0001',
          description: 'Encaissement FACT-2024-001',
          total_debit: 125000,
          total_credit: 125000,
          journal_code: 'TRS',
          is_posted: true
        },
        {
          entry_date: '2024-01-17',
          entry_number: 'PAY-20240117-0001',
          description: 'Paie janvier 2024',
          total_debit: 85000,
          total_credit: 85000,
          journal_code: 'PAY',
          is_posted: true
        }
      ];

      setJournalEntries(mockJournalEntries);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les écritures de journal.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données selon l'onglet actif
  useEffect(() => {
    switch (activeTab) {
      case 'balance':
        loadBalanceSheet();
        break;
      case 'ledger':
        loadGeneralLedger();
        break;
      case 'income':
        loadIncomeStatement();
        break;
      case 'journals':
        loadJournalEntries();
        break;
    }
  }, [activeTab, startDate, endDate]);

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
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

  // Fonction pour exporter en PDF
  const exportToPDF = () => {
    try {
      let exportData;
      
      switch (activeTab) {
        case 'balance':
          exportData = exportBalanceSheet(balanceData, startDate || new Date(), endDate || new Date());
          break;
        case 'ledger':
          exportData = exportGeneralLedger(ledgerData, '411', 'Clients');
          break;
        case 'income':
          exportData = exportIncomeStatement(incomeStatement, startDate || new Date(), endDate || new Date());
          break;
        case 'journals':
          exportData = exportJournalEntries(journalEntries, 'VTE', 'Journal des Ventes');
          break;
        default:
          return;
      }

      exportPDF(exportData, `rapport-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export PDF réussi",
        description: "Le rapport a été exporté en PDF.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport en PDF.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour exporter en Excel
  const exportToExcel = () => {
    try {
      let exportData;
      
      switch (activeTab) {
        case 'balance':
          exportData = exportBalanceSheet(balanceData, startDate || new Date(), endDate || new Date());
          break;
        case 'ledger':
          exportData = exportGeneralLedger(ledgerData, '411', 'Clients');
          break;
        case 'income':
          exportData = exportIncomeStatement(incomeStatement, startDate || new Date(), endDate || new Date());
          break;
        case 'journals':
          exportData = exportJournalEntries(journalEntries, 'VTE', 'Journal des Ventes');
          break;
        default:
          return;
      }

      exportExcel(exportData, `rapport-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Excel réussi",
        description: "Le rapport a été exporté en Excel.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport en Excel.",
        variant: "destructive"
      });
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les propriétaires et gérants peuvent accéder aux rapports financiers.
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
          <h1 className="text-3xl font-bold tracking-tight">Rapports Financiers</h1>
          <p className="text-muted-foreground">
            Balance des comptes, grand livre, compte de résultat et journaux
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={startDate?.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="date"
                value={endDate?.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Journal</label>
              <Select value={selectedJournal} onValueChange={setSelectedJournal}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les journaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les journaux</SelectItem>
                  {journals?.map((journal: any) => (
                    <SelectItem key={journal.id} value={journal.journal_code}>
                      {journal.journal_code} - {journal.journal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Recherche</label>
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets des rapports */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="ledger">Grand Livre</TabsTrigger>
          <TabsTrigger value="income">Compte de Résultat</TabsTrigger>
          <TabsTrigger value="journals">Journaux</TabsTrigger>
        </TabsList>

        {/* Onglet Balance des Comptes */}
        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Balance des Comptes
              </CardTitle>
              <CardDescription>
                Balance générale au {endDate?.toLocaleDateString('fr-FR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Compte</TableHead>
                      <TableHead>Intitulé</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Solde Début</TableHead>
                      <TableHead className="text-right">Mouvements</TableHead>
                      <TableHead className="text-right">Solde Fin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceData.map((account, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{account.account_number}</TableCell>
                        <TableCell>{account.account_name}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", getAccountTypeColor(account.account_type))}>
                            {account.account_type === 'asset' && 'Actif'}
                            {account.account_type === 'liability' && 'Passif'}
                            {account.account_type === 'equity' && 'Capitaux'}
                            {account.account_type === 'revenue' && 'Produit'}
                            {account.account_type === 'expense' && 'Charge'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {account.opening_debit > 0 ? formatAmount(account.opening_debit) : 
                           account.opening_credit > 0 ? formatAmount(account.opening_credit) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-xs">
                            <div>D: {formatAmount(account.period_debit)}</div>
                            <div>C: {formatAmount(account.period_credit)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {account.closing_debit > 0 ? formatAmount(account.closing_debit) : 
                           account.closing_credit > 0 ? formatAmount(account.closing_credit) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Grand Livre */}
        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Grand Livre
              </CardTitle>
              <CardDescription>
                Détail des mouvements par compte
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
                      <TableHead>Journal</TableHead>
                      <TableHead className="text-right">Débit</TableHead>
                      <TableHead className="text-right">Crédit</TableHead>
                      <TableHead className="text-right">Solde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerData.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(entry.entry_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="font-mono">{entry.entry_number}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.journal_code}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.debit_amount > 0 ? formatAmount(entry.debit_amount) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit_amount > 0 ? formatAmount(entry.credit_amount) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatAmount(entry.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Compte de Résultat */}
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compte de Résultat
              </CardTitle>
              <CardDescription>
                Résultat de l'exercice du {startDate?.toLocaleDateString('fr-FR')} au {endDate?.toLocaleDateString('fr-FR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="font-medium">Produits</span>
                    <span className="text-green-600 font-bold">{formatAmount(incomeStatement.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <span className="font-medium">Charges</span>
                    <span className="text-red-600 font-bold">{formatAmount(incomeStatement.expenses)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium">Résultat brut</span>
                    <span className="text-blue-600 font-bold">{formatAmount(incomeStatement.gross_profit)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <span className="font-medium">Charges d'exploitation</span>
                    <span className="text-orange-600 font-bold">{formatAmount(incomeStatement.operating_expenses)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium">Résultat d'exploitation</span>
                    <span className="text-purple-600 font-bold">{formatAmount(incomeStatement.operating_income)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                    <span className="font-medium text-lg">Résultat net</span>
                    <span className="text-emerald-600 font-bold text-lg">{formatAmount(incomeStatement.net_income)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Journaux */}
        <TabsContent value="journals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Écritures de Journal
              </CardTitle>
              <CardDescription>
                Détail des écritures par journal
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
                      <TableHead>Journal</TableHead>
                      <TableHead className="text-right">Débit</TableHead>
                      <TableHead className="text-right">Crédit</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(entry.entry_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="font-mono">{entry.entry_number}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.journal_code}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatAmount(entry.total_debit)}</TableCell>
                        <TableCell className="text-right">{formatAmount(entry.total_credit)}</TableCell>
                        <TableCell>
                          <Badge variant={entry.is_posted ? "default" : "secondary"}>
                            {entry.is_posted ? "Postée" : "Brouillon"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Printer className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 