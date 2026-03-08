// Utilitaires d'export PDF et CSV pour les rapports financiers

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Types pour les données d'export
export interface ExportData {
  title: string;
  headers: string[];
  rows: any[][];
  summary?: {
    label: string;
    value: number;
    type: 'currency' | 'number' | 'text';
  }[];
}

// Configuration PDF
const PDF_CONFIG = {
  fontSize: 10,
  headerFontSize: 12,
  titleFontSize: 16,
  margin: 20,
  currency: 'XOF'
};

// Configuration Excel
const EXCEL_CONFIG = {
  currency: 'XOF',
  dateFormat: 'dd/mm/yyyy'
};

// Fonction pour formater les montants
const formatAmount = (amount: number, currency: string = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
};

// Fonction pour formater les dates
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

// Export PDF
export const exportToPDF = (data: ExportData, filename: string = 'rapport.pdf') => {
  const doc = new jsPDF();
  let yPosition = PDF_CONFIG.margin;

  // Titre
  doc.setFontSize(PDF_CONFIG.titleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title, PDF_CONFIG.margin, yPosition);
  yPosition += 20;

  // Date d'export
  doc.setFontSize(PDF_CONFIG.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, PDF_CONFIG.margin, yPosition);
  yPosition += 15;

  // Tableau principal
  if (data.rows.length > 0) {
    const tableData = data.rows.map(row => 
      row.map((cell: any) => {
        if (typeof cell === 'number') {
          return formatAmount(cell);
        }
        if (cell instanceof Date) {
          return formatDate(cell);
        }
        return cell?.toString() || '';
      })
    );

    (doc as any).autoTable({
      head: [data.headers],
      body: tableData,
      startY: yPosition,
      margin: { top: PDF_CONFIG.margin },
      styles: {
        fontSize: PDF_CONFIG.fontSize,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Résumé si disponible
  if (data.summary && data.summary.length > 0) {
    doc.setFontSize(PDF_CONFIG.headerFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé', PDF_CONFIG.margin, yPosition);
    yPosition += 10;

    doc.setFontSize(PDF_CONFIG.fontSize);
    doc.setFont('helvetica', 'normal');

    data.summary.forEach(item => {
      const value = item.type === 'currency' ? formatAmount(item.value) : 
                   item.type === 'number' ? item.value.toLocaleString('fr-FR') : 
                   item.value.toString();
      
      doc.text(`${item.label}: ${value}`, PDF_CONFIG.margin, yPosition);
      yPosition += 8;
    });
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.width - PDF_CONFIG.margin, doc.internal.pageSize.height - 10);
  }

  // Téléchargement
  doc.save(filename);
};

// Export Excel (CSV compatible - sans dépendance vulnérable)
export const exportToExcel = (data: ExportData, filename: string = 'rapport.csv') => {
  const csvFilename = filename.replace(/\.xlsx$/, '.csv');
  
  const escapeCSV = (value: any): string => {
    const str = value?.toString() || '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  
  // Titre
  lines.push(escapeCSV(data.title));
  lines.push('');
  lines.push(`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`);
  lines.push('');
  
  // En-têtes
  lines.push(data.headers.map(escapeCSV).join(','));
  
  // Données
  data.rows.forEach(row => {
    lines.push(row.map((cell: any) => {
      if (cell instanceof Date) {
        return escapeCSV(cell.toLocaleDateString('fr-FR'));
      }
      return escapeCSV(cell);
    }).join(','));
  });

  // Résumé
  if (data.summary && data.summary.length > 0) {
    lines.push('');
    lines.push('Résumé');
    data.summary.forEach(item => {
      const value = item.type === 'currency' ? formatAmount(item.value) :
                   item.type === 'number' ? item.value.toLocaleString('fr-FR') :
                   item.value.toString();
      lines.push(`${escapeCSV(item.label)},${escapeCSV(value)}`);
    });
  }

  // BOM pour Excel UTF-8
  const BOM = '\uFEFF';
  const csvContent = BOM + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = csvFilename;
  link.click();
  URL.revokeObjectURL(url);
};

// Fonction pour exporter la balance des comptes
export const exportBalanceSheet = (balanceData: any[], startDate: Date, endDate: Date) => {
  const data: ExportData = {
    title: `Balance des Comptes - ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
    headers: ['Compte', 'Intitulé', 'Type', 'Solde Début', 'Mouvements', 'Solde Fin'],
    rows: balanceData.map(account => [
      account.account_number,
      account.account_name,
      account.account_type,
      account.opening_debit > 0 ? account.opening_debit : account.opening_credit,
      `${account.period_debit} / ${account.period_credit}`,
      account.closing_debit > 0 ? account.closing_debit : account.closing_credit
    ]),
    summary: [
      {
        label: 'Total Actifs',
        value: balanceData.filter(a => a.account_type === 'asset').reduce((sum, a) => sum + (a.closing_debit || 0), 0),
        type: 'currency'
      },
      {
        label: 'Total Passifs',
        value: balanceData.filter(a => a.account_type === 'liability').reduce((sum, a) => sum + (a.closing_credit || 0), 0),
        type: 'currency'
      }
    ]
  };

  return data;
};

// Fonction pour exporter le grand livre
export const exportGeneralLedger = (ledgerData: any[], accountNumber: string, accountName: string) => {
  const data: ExportData = {
    title: `Grand Livre - Compte ${accountNumber} - ${accountName}`,
    headers: ['Date', 'Écriture', 'Description', 'Débit', 'Crédit', 'Solde'],
    rows: ledgerData.map(entry => [
      new Date(entry.entry_date),
      entry.entry_number,
      entry.description,
      entry.debit_amount,
      entry.credit_amount,
      entry.balance
    ])
  };

  return data;
};

// Fonction pour exporter le compte de résultat
export const exportIncomeStatement = (incomeData: any, startDate: Date, endDate: Date) => {
  const data: ExportData = {
    title: `Compte de Résultat - ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
    headers: ['Poste', 'Montant'],
    rows: [
      ['Produits', incomeData.revenue],
      ['Charges', incomeData.expenses],
      ['Résultat brut', incomeData.gross_profit],
      ['Charges d\'exploitation', incomeData.operating_expenses],
      ['Résultat d\'exploitation', incomeData.operating_income],
      ['Résultat net', incomeData.net_income]
    ],
    summary: [
      {
        label: 'Résultat net',
        value: incomeData.net_income,
        type: 'currency'
      }
    ]
  };

  return data;
};

// Fonction pour exporter les écritures de journal
export const exportJournalEntries = (entries: any[], journalCode: string, journalName: string) => {
  const data: ExportData = {
    title: `Journal ${journalCode} - ${journalName}`,
    headers: ['Date', 'Écriture', 'Description', 'Débit', 'Crédit', 'Statut'],
    rows: entries.map(entry => [
      new Date(entry.entry_date),
      entry.entry_number,
      entry.description,
      entry.total_debit,
      entry.total_credit,
      entry.is_posted ? 'Postée' : 'Brouillon'
    ]),
    summary: [
      {
        label: 'Total Débit',
        value: entries.reduce((sum, e) => sum + e.total_debit, 0),
        type: 'currency'
      },
      {
        label: 'Total Crédit',
        value: entries.reduce((sum, e) => sum + e.total_credit, 0),
        type: 'currency'
      }
    ]
  };

  return data;
};

// Fonction pour exporter le rapprochement bancaire
export const exportBankReconciliation = (statements: any[], entries: any[], accountName: string) => {
  const data: ExportData = {
    title: `Rapprochement Bancaire - ${accountName}`,
    headers: ['Date', 'Référence', 'Description', 'Montant', 'Type', 'Statut'],
    rows: [
      ...statements.map(s => [
        new Date(s.statement_date),
        s.reference,
        s.description,
        s.amount,
        s.type === 'credit' ? 'Crédit' : 'Débit',
        s.is_reconciled ? 'Rapproché' : 'Non rapproché'
      ]),
      ...entries.map(e => [
        new Date(e.entry_date),
        e.entry_number,
        e.description,
        e.amount,
        'Comptable',
        e.is_reconciled ? 'Rapproché' : 'Non rapproché'
      ])
    ]
  };

  return data;
}; 