// SYSCOHADA 9 classes and labels
export const SYSCOHADA_CLASSES: Record<string, string> = {
  classe_1: 'Classe 1 – Ressources durables',
  classe_2: 'Classe 2 – Actif immobilisé',
  classe_3: 'Classe 3 – Stocks',
  classe_4: 'Classe 4 – Tiers',
  classe_5: 'Classe 5 – Trésorerie',
  classe_6: 'Classe 6 – Charges',
  classe_7: 'Classe 7 – Produits',
  classe_8: 'Classe 8 – Autres charges/produits (HAO)',
  classe_9: 'Classe 9 – Engagements hors bilan',
};

export const SYSCOHADA_CLASS_SHORT: Record<string, string> = {
  classe_1: 'Ressources durables',
  classe_2: 'Actif immobilisé',
  classe_3: 'Stocks',
  classe_4: 'Tiers',
  classe_5: 'Trésorerie',
  classe_6: 'Charges',
  classe_7: 'Produits',
  classe_8: 'HAO',
  classe_9: 'Hors bilan',
};

export const SYSCOHADA_CLASS_COLORS: Record<string, string> = {
  classe_1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  classe_2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  classe_3: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  classe_4: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  classe_5: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  classe_6: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  classe_7: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  classe_8: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  classe_9: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function getClassFromAccountNumber(accountNumber: string): string {
  const first = accountNumber.charAt(0);
  if (first >= '1' && first <= '9') return `classe_${first}`;
  return 'autre';
}

export function getClassLabel(classKey: string): string {
  return SYSCOHADA_CLASS_SHORT[classKey] || classKey;
}
