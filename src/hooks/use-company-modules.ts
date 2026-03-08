import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ModuleDefinition {
  key: string;
  label: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  category: string;
  dependencies: string[];
  version: string;
  author: string;
  price: 'Gratuit' | string;
  screenshots?: string[];
  features: string[];
}

export const ALL_MODULES: ModuleDefinition[] = [
  // ── Essentiel Couture ─────────────────────
  {
    key: 'clients',
    label: 'Clients',
    shortDesc: 'Gestion de la clientèle',
    fullDesc: 'Gérez votre portefeuille clients avec fiches détaillées, historique des commandes, et suivi de la fidélité.',
    icon: '👥',
    category: 'Couture',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Fiches clients complètes', 'Historique des commandes', 'Recherche et filtrage', 'Import/Export'],
  },
  {
    key: 'orders',
    label: 'Commandes',
    shortDesc: 'Prise et suivi des commandes',
    fullDesc: 'Créez des commandes clients avec suivi du statut, des acomptes, et des délais de livraison.',
    icon: '📋',
    category: 'Couture',
    dependencies: ['clients'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Création de commandes', '14 étapes de production', 'Suivi des acomptes', 'Attribution aux tailleurs'],
  },
  {
    key: 'measurements',
    label: 'Mensurations',
    shortDesc: 'Prise de mesures corporelles',
    fullDesc: 'Enregistrez et consultez les mensurations de vos clients pour chaque type de vêtement.',
    icon: '📏',
    category: 'Couture',
    dependencies: ['clients'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['8+ mesures corporelles', 'Types de vêtements', 'Historique des mesures', 'Notes par client'],
  },
  {
    key: 'patterns',
    label: 'Modèles & Patrons',
    shortDesc: 'Catalogue de modèles de couture',
    fullDesc: 'Organisez votre catalogue de modèles avec photos, catégories, et patrons de coupe associés.',
    icon: '✂️',
    category: 'Couture',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Catalogue de modèles', 'Patrons par taille', 'Catégorisation', 'Photos de référence'],
  },
  // ── Production ─────────────────────
  {
    key: 'production',
    label: 'Production',
    shortDesc: 'Suivi de la fabrication',
    fullDesc: 'Planifiez et suivez les tâches de production : coupe, assemblage, finition, contrôle qualité.',
    icon: '🏭',
    category: 'Production',
    dependencies: ['orders'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Tâches de production', 'Attribution aux tailleurs', 'Suivi des étapes', 'Tableau Kanban'],
  },
  {
    key: 'stocks',
    label: 'Stocks & Inventaire',
    shortDesc: 'Gestion des tissus et fournitures',
    fullDesc: 'Gérez votre inventaire de tissus, boutons, fils et autres fournitures avec alertes de réapprovisionnement.',
    icon: '📦',
    category: 'Production',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Catalogue produits', 'Niveaux de stock', 'Alertes stock faible', 'Catégories'],
  },
  // ── Commercial ─────────────────────
  {
    key: 'customer_invoices',
    label: 'Facturation',
    shortDesc: 'Édition de factures clients',
    fullDesc: 'Créez des factures professionnelles, suivez les paiements et envoyez des relances automatiques.',
    icon: '🧾',
    category: 'Commercial',
    dependencies: ['clients', 'orders'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Factures PDF', 'Suivi des paiements', 'Relances automatiques', 'TVA configurable'],
  },
  // ── Achats ─────────────────────
  {
    key: 'suppliers',
    label: 'Fournisseurs',
    shortDesc: 'Carnet de fournisseurs',
    fullDesc: 'Gérez vos fournisseurs de tissus et matériaux avec évaluation, conditions de paiement et historique.',
    icon: '🚚',
    category: 'Achats',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Fiches fournisseurs', 'Évaluation / notation', 'Conditions de paiement', 'Contacts'],
  },
  {
    key: 'purchases',
    label: 'Bons de Commande',
    shortDesc: 'Commandes fournisseurs',
    fullDesc: 'Créez des bons de commande fournisseurs et suivez leur statut jusqu\'au paiement.',
    icon: '🛒',
    category: 'Achats',
    dependencies: ['suppliers'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Bons de commande', 'Suivi des statuts', 'Dates de livraison', 'Montants TTC'],
  },
  {
    key: 'receptions',
    label: 'Réceptions',
    shortDesc: 'Contrôle des livraisons',
    fullDesc: 'Réceptionnez et contrôlez les livraisons fournisseurs, avec validation et mise à jour automatique du stock.',
    icon: '📥',
    category: 'Achats',
    dependencies: ['suppliers', 'purchases'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Bons de réception', 'Contrôle qualité', 'Mise à jour stock', 'Validation'],
  },
  {
    key: 'supplier_invoices',
    label: 'Factures Fournisseurs',
    shortDesc: 'Suivi des factures d\'achat',
    fullDesc: 'Enregistrez et suivez les factures de vos fournisseurs pour une comptabilité précise.',
    icon: '🧾',
    category: 'Achats',
    dependencies: ['suppliers'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Saisie des factures', 'Rapprochement', 'Échéances', 'Historique'],
  },
  // ── Finance ─────────────────────
  {
    key: 'finance_dashboard',
    label: 'Finance',
    shortDesc: 'Vue d\'ensemble financière',
    fullDesc: 'Tableau de bord financier avec revenus, dépenses, marges et indicateurs clés.',
    icon: '💳',
    category: 'Finance',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Revenus & dépenses', 'Marges', 'Graphiques', 'KPI financiers'],
  },
  {
    key: 'treasury',
    label: 'Trésorerie',
    shortDesc: 'Comptes et mouvements',
    fullDesc: 'Gérez vos comptes bancaires, mouvements de trésorerie et soldes en temps réel.',
    icon: '🏦',
    category: 'Finance',
    dependencies: ['finance_dashboard'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Multi-comptes', 'Mouvements', 'Soldes temps réel', 'Catégories'],
  },
  {
    key: 'fixed_assets',
    label: 'Immobilisations',
    shortDesc: 'Machines et équipements',
    fullDesc: 'Suivez vos machines à coudre, surjeteuses et autres équipements avec calcul automatique des amortissements.',
    icon: '🏢',
    category: 'Finance',
    dependencies: ['finance_dashboard'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Registre des actifs', 'Amortissements', 'Valeur nette comptable', 'SYSCOHADA'],
  },
  {
    key: 'financial_reports',
    label: 'Rapports Financiers',
    shortDesc: 'Bilan et compte de résultat',
    fullDesc: 'Générez des rapports financiers conformes : bilan, compte de résultat, balance des comptes.',
    icon: '📊',
    category: 'Finance',
    dependencies: ['finance_dashboard'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Bilan', 'Compte de résultat', 'Balance', 'Export PDF'],
  },
  {
    key: 'bank_reconciliation',
    label: 'Rapprochement Bancaire',
    shortDesc: 'Réconciliation bancaire',
    fullDesc: 'Rapprochez automatiquement vos écritures comptables avec vos relevés bancaires.',
    icon: '🔄',
    category: 'Finance',
    dependencies: ['treasury'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Import relevés', 'Rapprochement auto', 'Écarts', 'Validation'],
  },
  {
    key: 'syscohada',
    label: 'SYSCOHADA',
    shortDesc: 'Plan comptable OHADA',
    fullDesc: 'Conformité au plan comptable SYSCOHADA pour l\'Afrique de l\'Ouest et Centrale.',
    icon: '📚',
    category: 'Finance',
    dependencies: ['finance_dashboard'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Plan comptable OHADA', 'Classes de comptes', 'Journaux', 'Grand livre'],
  },
  // ── RH ─────────────────────
  {
    key: 'employees',
    label: 'Employés',
    shortDesc: 'Gestion du personnel',
    fullDesc: 'Gérez les fiches employés, contrats, heures de travail et compétences de votre atelier.',
    icon: '👤',
    category: 'Ressources Humaines',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Fiches employés', 'Heures de travail', 'Taux horaire', 'Statut actif'],
  },
  {
    key: 'remunerations',
    label: 'Paie',
    shortDesc: 'Rémunérations et fiches de paie',
    fullDesc: 'Calculez les salaires, générez les fiches de paie et suivez les coûts RH.',
    icon: '💰',
    category: 'Ressources Humaines',
    dependencies: ['employees'],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Calcul de paie', 'Fiches de salaire', 'Heures supplémentaires', 'Historique'],
  },
  // ── Outils ─────────────────────
  {
    key: 'reports',
    label: 'Rapports',
    shortDesc: 'Rapports d\'activité',
    fullDesc: 'Générez des rapports personnalisés sur l\'activité de votre atelier.',
    icon: '📑',
    category: 'Outils',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Rapports personnalisés', 'Filtres avancés', 'Export PDF/Excel', 'Graphiques'],
  },
  {
    key: 'alerts',
    label: 'Alertes',
    shortDesc: 'Notifications automatiques',
    fullDesc: 'Recevez des alertes en temps réel : stock faible, commande en retard, paiement en attente.',
    icon: '🔔',
    category: 'Outils',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Alertes temps réel', 'Stock faible', 'Retards', 'Personnalisation'],
  },
  {
    key: 'audit',
    label: 'Journal d\'Activité',
    shortDesc: 'Traçabilité complète',
    fullDesc: 'Consultez l\'historique de toutes les actions effectuées dans votre atelier.',
    icon: '📝',
    category: 'Outils',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['Historique complet', 'Qui a fait quoi', 'Filtres par date', 'Export'],
  },
  {
    key: 'export',
    label: 'Export Avancé',
    shortDesc: 'Export multi-format',
    fullDesc: 'Exportez vos données en PDF, Excel, CSV pour vos déclarations et archives.',
    icon: '📤',
    category: 'Outils',
    dependencies: [],
    version: '1.0.0',
    author: 'AteliérPro',
    price: 'Gratuit',
    features: ['PDF', 'Excel', 'CSV', 'Sélection de tables'],
  },
];

export const MODULE_CATEGORIES = [
  'Couture', 'Production', 'Commercial', 'Achats', 'Finance', 'Ressources Humaines', 'Outils'
];

// Map module keys to sidebar routes
const MODULE_ROUTE_MAP: Record<string, string[]> = {};
ALL_MODULES.forEach(m => {
  const routes = getModuleRoutes(m.key);
  if (routes.length) MODULE_ROUTE_MAP[m.key] = routes;
});

function getModuleRoutes(key: string): string[] {
  const map: Record<string, string[]> = {
    clients: ['/dashboard/clients'],
    orders: ['/dashboard/orders'],
    measurements: ['/dashboard/measurements'],
    patterns: ['/dashboard/patterns'],
    production: ['/dashboard/production'],
    stocks: ['/dashboard/stocks'],
    customer_invoices: ['/dashboard/customer-invoices'],
    suppliers: ['/dashboard/suppliers'],
    purchases: ['/dashboard/purchases'],
    receptions: ['/dashboard/receptions'],
    supplier_invoices: ['/dashboard/invoices'],
    finance_dashboard: ['/dashboard/finances'],
    treasury: ['/dashboard/treasury'],
    fixed_assets: ['/dashboard/fixed-assets'],
    financial_reports: ['/dashboard/financial-reports'],
    bank_reconciliation: ['/dashboard/bank-reconciliation'],
    syscohada: ['/dashboard/syscohada'],
    employees: ['/dashboard/hr'],
    remunerations: ['/dashboard/remunerations'],
    reports: ['/dashboard/reports'],
    alerts: ['/dashboard/alerts'],
    audit: ['/dashboard/audit'],
    export: ['/dashboard/export'],
  };
  return map[key] || [];
}

export function useCompanyModules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: installedModules, isLoading } = useQuery({
    queryKey: ['company-modules', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return [];
      const { data, error } = await supabase
        .from('company_modules')
        .select('module_key, is_enabled')
        .eq('company_id', user.companyId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.companyId,
  });

  const isModuleInstalled = (moduleKey: string): boolean => {
    if (!installedModules || installedModules.length === 0) return false;
    return installedModules.some(m => m.module_key === moduleKey && m.is_enabled);
  };

  const isRouteEnabled = (route: string): boolean => {
    const alwaysAllowed = ['/dashboard', '/', '/dashboard/settings', '/dashboard/profile', '/dashboard/apps'];
    if (alwaysAllowed.includes(route)) return true;
    
    // If no modules installed yet, allow all (first-time user)
    if (!installedModules || installedModules.length === 0) return true;
    
    const mod = ALL_MODULES.find(m => getModuleRoutes(m.key).includes(route));
    if (!mod) return true;
    return isModuleInstalled(mod.key);
  };

  const getInstalledModules = () => {
    if (!installedModules) return [];
    return installedModules.filter(m => m.is_enabled).map(m => m.module_key);
  };

  const getMissingDependencies = (moduleKey: string): string[] => {
    const mod = ALL_MODULES.find(m => m.key === moduleKey);
    if (!mod) return [];
    return mod.dependencies.filter(dep => !isModuleInstalled(dep));
  };

  const getDependentModules = (moduleKey: string): string[] => {
    return ALL_MODULES
      .filter(m => m.dependencies.includes(moduleKey) && isModuleInstalled(m.key))
      .map(m => m.key);
  };

  const installModule = useMutation({
    mutationFn: async (moduleKey: string) => {
      if (!user?.companyId) throw new Error('No company');
      
      const mod = ALL_MODULES.find(m => m.key === moduleKey);
      if (!mod) throw new Error('Module not found');

      // Install dependencies first
      const missingDeps = getMissingDependencies(moduleKey);
      const allToInstall = [...missingDeps, moduleKey];

      for (const key of allToInstall) {
        const { data: existing } = await supabase
          .from('company_modules')
          .select('id')
          .eq('company_id', user.companyId)
          .eq('module_key', key)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('company_modules')
            .update({ is_enabled: true })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('company_modules')
            .insert({
              company_id: user.companyId,
              module_key: key,
              is_enabled: true,
              enabled_by: user.id,
            });
        }
      }

      return { installed: allToInstall };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
      if (data.installed.length > 1) {
        toast.success(`Module installé avec ${data.installed.length - 1} dépendance(s)`);
      } else {
        toast.success('Module installé !');
      }
    },
    onError: () => {
      toast.error('Erreur lors de l\'installation');
    },
  });

  const uninstallModule = useMutation({
    mutationFn: async (moduleKey: string) => {
      if (!user?.companyId) throw new Error('No company');

      // Check if other installed modules depend on this one
      const dependents = getDependentModules(moduleKey);
      if (dependents.length > 0) {
        const depLabels = dependents.map(k => ALL_MODULES.find(m => m.key === k)?.label).join(', ');
        throw new Error(`Impossible de désinstaller : utilisé par ${depLabels}`);
      }

      const { error } = await supabase
        .from('company_modules')
        .update({ is_enabled: false })
        .eq('company_id', user.companyId)
        .eq('module_key', moduleKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
      toast.success('Module désinstallé');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    installedModules,
    isLoading,
    isModuleInstalled,
    isRouteEnabled,
    getInstalledModules,
    getMissingDependencies,
    getDependentModules,
    installModule,
    uninstallModule,
  };
}
