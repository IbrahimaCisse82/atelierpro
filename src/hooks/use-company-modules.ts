import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ModuleDefinition {
  key: string;
  label: string;
  description: string;
  icon: string;
  category: 'core' | 'commercial' | 'production' | 'achats' | 'finance' | 'rh' | 'rapports';
  sidebarGroup: string;
  routes: string[];
  defaultEnabled: boolean;
}

export const ALL_MODULES: ModuleDefinition[] = [
  // Core — toujours visible
  {
    key: 'clients',
    label: 'Clients',
    description: 'Gestion de la clientèle, fiches clients',
    icon: '👥',
    category: 'core',
    sidebarGroup: 'commercial',
    routes: ['/dashboard/clients'],
    defaultEnabled: true,
  },
  {
    key: 'orders',
    label: 'Commandes',
    description: 'Prise de commandes, suivi des statuts',
    icon: '📋',
    category: 'core',
    sidebarGroup: 'commercial',
    routes: ['/dashboard/orders'],
    defaultEnabled: true,
  },
  {
    key: 'measurements',
    label: 'Mensurations',
    description: 'Prise de mesures corporelles des clients',
    icon: '📏',
    category: 'core',
    sidebarGroup: 'commercial',
    routes: ['/dashboard/measurements'],
    defaultEnabled: true,
  },
  // Production
  {
    key: 'patterns',
    label: 'Modèles & Patrons',
    description: 'Catalogue de modèles et patrons de coupe',
    icon: '✂️',
    category: 'production',
    sidebarGroup: 'commercial',
    routes: ['/dashboard/patterns'],
    defaultEnabled: true,
  },
  {
    key: 'production',
    label: 'Production',
    description: 'Suivi des tâches de fabrication (coupe, assemblage, finition)',
    icon: '🏭',
    category: 'production',
    sidebarGroup: 'production',
    routes: ['/dashboard/production'],
    defaultEnabled: true,
  },
  {
    key: 'stocks',
    label: 'Stocks & Inventaire',
    description: 'Gestion des tissus, fournitures et alertes de réapprovisionnement',
    icon: '📦',
    category: 'production',
    sidebarGroup: 'production',
    routes: ['/dashboard/stocks'],
    defaultEnabled: false,
  },
  // Commercial avancé
  {
    key: 'customer_invoices',
    label: 'Facturation Clients',
    description: 'Édition et suivi des factures clients',
    icon: '🧾',
    category: 'commercial',
    sidebarGroup: 'commercial',
    routes: ['/dashboard/customer-invoices'],
    defaultEnabled: false,
  },
  // Achats
  {
    key: 'suppliers',
    label: 'Fournisseurs',
    description: 'Carnet de fournisseurs de tissus et fournitures',
    icon: '🚚',
    category: 'achats',
    sidebarGroup: 'achats',
    routes: ['/dashboard/suppliers'],
    defaultEnabled: false,
  },
  {
    key: 'purchases',
    label: 'Achats',
    description: 'Bons de commande fournisseurs',
    icon: '🛒',
    category: 'achats',
    sidebarGroup: 'achats',
    routes: ['/dashboard/purchases'],
    defaultEnabled: false,
  },
  {
    key: 'receptions',
    label: 'Réceptions',
    description: 'Contrôle et validation des livraisons',
    icon: '📥',
    category: 'achats',
    sidebarGroup: 'achats',
    routes: ['/dashboard/receptions'],
    defaultEnabled: false,
  },
  {
    key: 'supplier_invoices',
    label: 'Factures Fournisseurs',
    description: 'Suivi des factures fournisseurs',
    icon: '🧾',
    category: 'achats',
    sidebarGroup: 'achats',
    routes: ['/dashboard/invoices'],
    defaultEnabled: false,
  },
  // Finance
  {
    key: 'finance_dashboard',
    label: 'Tableau de Bord Financier',
    description: 'Vue d\'ensemble de la situation financière',
    icon: '💳',
    category: 'finance',
    sidebarGroup: 'finance',
    routes: ['/dashboard/finances'],
    defaultEnabled: false,
  },
  {
    key: 'treasury',
    label: 'Trésorerie',
    description: 'Comptes bancaires et mouvements de trésorerie',
    icon: '🏦',
    category: 'finance',
    sidebarGroup: 'finance',
    routes: ['/dashboard/treasury'],
    defaultEnabled: false,
  },
  {
    key: 'fixed_assets',
    label: 'Immobilisations',
    description: 'Gestion des machines, équipements et amortissements',
    icon: '🏢',
    category: 'finance',
    sidebarGroup: 'finance',
    routes: ['/dashboard/fixed-assets'],
    defaultEnabled: false,
  },
  {
    key: 'financial_reports',
    label: 'Rapports Financiers',
    description: 'Bilan, compte de résultat, balance',
    icon: '📊',
    category: 'finance',
    sidebarGroup: 'finance',
    routes: ['/dashboard/financial-reports'],
    defaultEnabled: false,
  },
  {
    key: 'bank_reconciliation',
    label: 'Rapprochement Bancaire',
    description: 'Réconciliation des relevés bancaires',
    icon: '🔄',
    category: 'finance',
    sidebarGroup: 'finance',
    routes: ['/dashboard/bank-reconciliation'],
    defaultEnabled: false,
  },
  {
    key: 'syscohada',
    label: 'SYSCOHADA',
    description: 'Plan comptable OHADA pour l\'Afrique de l\'Ouest',
    icon: '📚',
    category: 'finance',
    sidebarGroup: 'finance',
    routes: ['/dashboard/syscohada'],
    defaultEnabled: false,
  },
  // RH
  {
    key: 'employees',
    label: 'Employés',
    description: 'Gestion du personnel de l\'atelier',
    icon: '👤',
    category: 'rh',
    sidebarGroup: 'rh',
    routes: ['/dashboard/hr'],
    defaultEnabled: false,
  },
  {
    key: 'remunerations',
    label: 'Rémunérations',
    description: 'Paie et fiches de salaire',
    icon: '💰',
    category: 'rh',
    sidebarGroup: 'rh',
    routes: ['/dashboard/remunerations'],
    defaultEnabled: false,
  },
  // Rapports
  {
    key: 'reports',
    label: 'Rapports Généraux',
    description: 'Rapports d\'activité et statistiques',
    icon: '📑',
    category: 'rapports',
    sidebarGroup: 'rapports',
    routes: ['/dashboard/reports'],
    defaultEnabled: false,
  },
  {
    key: 'alerts',
    label: 'Alertes',
    description: 'Notifications et alertes automatiques',
    icon: '🔔',
    category: 'rapports',
    sidebarGroup: 'rapports',
    routes: ['/dashboard/alerts'],
    defaultEnabled: false,
  },
  {
    key: 'audit',
    label: "Journal d'Activité",
    description: 'Traçabilité de toutes les actions',
    icon: '📝',
    category: 'rapports',
    sidebarGroup: 'rapports',
    routes: ['/dashboard/audit'],
    defaultEnabled: false,
  },
  {
    key: 'export',
    label: 'Export Avancé',
    description: 'Export des données en PDF, Excel, CSV',
    icon: '📤',
    category: 'rapports',
    sidebarGroup: 'rapports',
    routes: ['/dashboard/export'],
    defaultEnabled: false,
  },
];

export const MODULE_CATEGORIES = [
  { key: 'core', label: '🧵 Essentiel Couture', description: 'Les bases pour tout couturier' },
  { key: 'production', label: '🏭 Production', description: 'Fabrication et stocks' },
  { key: 'commercial', label: '💼 Commercial', description: 'Facturation et ventes' },
  { key: 'achats', label: '🛒 Achats', description: 'Fournisseurs et approvisionnement' },
  { key: 'finance', label: '💰 Finance', description: 'Comptabilité et trésorerie' },
  { key: 'rh', label: '👥 Ressources Humaines', description: 'Employés et paie' },
  { key: 'rapports', label: '📈 Rapports', description: 'Analyses et exports' },
];

export function useCompanyModules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: enabledModules, isLoading } = useQuery({
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

  // Si aucun module n'est configuré en DB, on utilise les défauts
  const isModuleEnabled = (moduleKey: string): boolean => {
    if (!enabledModules || enabledModules.length === 0) {
      const mod = ALL_MODULES.find(m => m.key === moduleKey);
      return mod?.defaultEnabled ?? false;
    }
    const dbEntry = enabledModules.find(m => m.module_key === moduleKey);
    if (!dbEntry) {
      const mod = ALL_MODULES.find(m => m.key === moduleKey);
      return mod?.defaultEnabled ?? false;
    }
    return dbEntry.is_enabled;
  };

  const isRouteEnabled = (route: string): boolean => {
    // Dashboard, settings, profile are always accessible
    if (['/dashboard', '/', '/dashboard/settings', '/dashboard/profile'].includes(route)) return true;
    const mod = ALL_MODULES.find(m => m.routes.includes(route));
    if (!mod) return true; // Unknown routes are allowed
    return isModuleEnabled(mod.key);
  };

  const hasConfiguredModules = !!enabledModules && enabledModules.length > 0;

  const toggleModule = useMutation({
    mutationFn: async ({ moduleKey, enabled }: { moduleKey: string; enabled: boolean }) => {
      if (!user?.companyId) throw new Error('No company');
      
      const { data: existing } = await supabase
        .from('company_modules')
        .select('id')
        .eq('company_id', user.companyId)
        .eq('module_key', moduleKey)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('company_modules')
          .update({ is_enabled: enabled })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_modules')
          .insert({ 
            company_id: user.companyId, 
            module_key: moduleKey, 
            is_enabled: enabled,
            enabled_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du module');
    },
  });

  const initializeModules = useMutation({
    mutationFn: async (moduleKeys: string[]) => {
      if (!user?.companyId) throw new Error('No company');
      
      const rows = ALL_MODULES.map(mod => ({
        company_id: user.companyId!,
        module_key: mod.key,
        is_enabled: moduleKeys.includes(mod.key),
        enabled_by: user.id,
      }));

      const { error } = await supabase
        .from('company_modules')
        .upsert(rows, { onConflict: 'company_id,module_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
      toast.success('Modules configurés avec succès !');
    },
    onError: () => {
      toast.error('Erreur lors de la configuration des modules');
    },
  });

  return {
    enabledModules,
    isLoading,
    isModuleEnabled,
    isRouteEnabled,
    hasConfiguredModules,
    toggleModule,
    initializeModules,
  };
}
