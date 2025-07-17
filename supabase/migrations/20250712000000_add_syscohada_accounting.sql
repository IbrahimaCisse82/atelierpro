-- Migration pour implémenter le plan comptable SYSCOHADA et les modules financiers
-- Date: 2025-07-12

-- =====================================================
-- PLAN COMPTABLE SYSCOHADA
-- =====================================================

-- Table du plan comptable SYSCOHADA
CREATE TABLE IF NOT EXISTS public.syscohada_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  account_category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_account BOOLEAN NOT NULL DEFAULT false,
  parent_account_id UUID REFERENCES public.syscohada_accounts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id),
  
  UNIQUE(company_id, account_number)
);

-- =====================================================
-- COMPTES DE TRÉSORERIE
-- =====================================================

-- Table des comptes de trésorerie
CREATE TABLE IF NOT EXISTS public.treasury_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.syscohada_accounts(id),
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'bank', 'mobile_money', 'other')),
  account_number TEXT,
  bank_name TEXT,
  branch_code TEXT,
  currency TEXT NOT NULL DEFAULT 'XOF',
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  last_reconciliation_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- JOURNAUX COMPTABLES
-- =====================================================

-- Enum pour les types de journaux
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'journal_type') THEN
    CREATE TYPE public.journal_type AS ENUM (
      'sales',
      'treasury',
      'payroll',
      'stock',
      'general',
      'purchase',
      'bank_reconciliation'
    );
  END IF;
END
$$;

-- Table des journaux comptables
CREATE TABLE IF NOT EXISTS public.accounting_journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  journal_code TEXT NOT NULL,
  journal_name TEXT NOT NULL,
  journal_type public.journal_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_journal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id),
  
  UNIQUE(company_id, journal_code)
);

-- =====================================================
-- ÉCRITURES COMPTABLES
-- =====================================================

-- Table des écritures comptables
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  journal_id UUID NOT NULL REFERENCES public.accounting_journals(id),
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  reference TEXT,
  description TEXT NOT NULL,
  total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_posted BOOLEAN NOT NULL DEFAULT false,
  posted_at TIMESTAMP WITH TIME ZONE,
  posted_by UUID REFERENCES public.profiles(id),
  source_type TEXT, -- 'order', 'invoice', 'payment', 'salary', 'stock_movement', etc.
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id),
  
  UNIQUE(company_id, entry_number)
);

-- Table des lignes d'écritures comptables
CREATE TABLE IF NOT EXISTS public.accounting_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.accounting_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.syscohada_accounts(id),
  line_number INTEGER NOT NULL,
  description TEXT,
  debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CHECK (debit_amount >= 0 AND credit_amount >= 0),
  CHECK ((debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0))
);

-- =====================================================
-- RAPPROCHEMENT BANCAIRE
-- =====================================================

-- Table des rapprochements bancaires
CREATE TABLE IF NOT EXISTS public.bank_reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts(id),
  reconciliation_date DATE NOT NULL,
  bank_statement_balance DECIMAL(15,2) NOT NULL,
  book_balance DECIMAL(15,2) NOT NULL,
  reconciled_balance DECIMAL(15,2) NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des lignes de rapprochement
CREATE TABLE IF NOT EXISTS public.bank_reconciliation_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconciliation_id UUID NOT NULL REFERENCES public.bank_reconciliations(id) ON DELETE CASCADE,
  entry_line_id UUID REFERENCES public.accounting_entry_lines(id),
  bank_statement_reference TEXT,
  bank_statement_date DATE,
  bank_statement_amount DECIMAL(15,2),
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- VALORISATION DES STOCKS
-- =====================================================

-- Enum pour les méthodes de valorisation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_valuation_method') THEN
    CREATE TYPE public.stock_valuation_method AS ENUM (
      'fifo',
      'lifo',
      'average_cost',
      'standard_cost'
    );
  END IF;
END
$$;

-- Table des paramètres de valorisation des stocks
CREATE TABLE IF NOT EXISTS public.stock_valuation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_category_id UUID REFERENCES public.product_categories(id),
  valuation_method public.stock_valuation_method NOT NULL DEFAULT 'fifo',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des mouvements de valorisation
CREATE TABLE IF NOT EXISTS public.stock_valuation_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_id UUID NOT NULL REFERENCES public.stock_movements(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  valuation_method public.stock_valuation_method NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- AMORTISSEMENTS
-- =====================================================

-- Enum pour les types d'amortissement
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'depreciation_type') THEN
    CREATE TYPE public.depreciation_type AS ENUM (
      'linear',
      'declining_balance',
      'units_of_production'
    );
  END IF;
END
$$;

-- Table des immobilisations
CREATE TABLE IF NOT EXISTS public.fixed_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_code TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_category TEXT NOT NULL,
  acquisition_date DATE NOT NULL,
  acquisition_cost DECIMAL(15,2) NOT NULL,
  useful_life INTEGER NOT NULL, -- en années
  salvage_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  depreciation_type public.depreciation_type NOT NULL DEFAULT 'linear',
  depreciation_rate DECIMAL(5,2), -- pour amortissement dégressif
  accumulated_depreciation DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_book_value DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id),
  
  UNIQUE(company_id, asset_code)
);

-- Table des amortissements
CREATE TABLE IF NOT EXISTS public.depreciations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  fixed_asset_id UUID NOT NULL REFERENCES public.fixed_assets(id),
  depreciation_date DATE NOT NULL,
  depreciation_amount DECIMAL(15,2) NOT NULL,
  accumulated_depreciation DECIMAL(15,2) NOT NULL,
  net_book_value DECIMAL(15,2) NOT NULL,
  entry_id UUID REFERENCES public.accounting_entries(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- INDEX ET CONTRAINTES
-- =====================================================

-- Index pour les performances
CREATE INDEX idx_syscohada_accounts_company ON public.syscohada_accounts(company_id);
CREATE INDEX idx_syscohada_accounts_number ON public.syscohada_accounts(account_number);
CREATE INDEX idx_treasury_accounts_company ON public.treasury_accounts(company_id);
CREATE INDEX idx_accounting_journals_company ON public.accounting_journals(company_id);
CREATE INDEX idx_accounting_entries_company ON public.accounting_entries(company_id);
CREATE INDEX idx_accounting_entries_date ON public.accounting_entries(entry_date);
CREATE INDEX idx_accounting_entries_source ON public.accounting_entries(source_type, source_id);
CREATE INDEX idx_accounting_entry_lines_entry ON public.accounting_entry_lines(entry_id);
CREATE INDEX idx_accounting_entry_lines_account ON public.accounting_entry_lines(account_id);
CREATE INDEX idx_bank_reconciliations_account ON public.bank_reconciliations(treasury_account_id);
CREATE INDEX idx_bank_reconciliations_date ON public.bank_reconciliations(reconciliation_date);
CREATE INDEX idx_stock_valuation_movements_product ON public.stock_valuation_movements(product_id);
CREATE INDEX idx_fixed_assets_company ON public.fixed_assets(company_id);
CREATE INDEX idx_depreciations_asset ON public.depreciations(fixed_asset_id);
CREATE INDEX idx_depreciations_date ON public.depreciations(depreciation_date);

-- =====================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers
CREATE TRIGGER update_syscohada_accounts_updated_at
  BEFORE UPDATE ON public.syscohada_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treasury_accounts_updated_at
  BEFORE UPDATE ON public.treasury_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounting_journals_updated_at
  BEFORE UPDATE ON public.accounting_journals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounting_entries_updated_at
  BEFORE UPDATE ON public.accounting_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_reconciliations_updated_at
  BEFORE UPDATE ON public.bank_reconciliations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_valuation_settings_updated_at
  BEFORE UPDATE ON public.stock_valuation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fixed_assets_updated_at
  BEFORE UPDATE ON public.fixed_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activation RLS
ALTER TABLE public.syscohada_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reconciliation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_valuation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_valuation_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les comptes SYSCOHADA
CREATE POLICY "Users can view syscohada accounts for their company" ON public.syscohada_accounts
  FOR SELECT USING (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can insert syscohada accounts for their company" ON public.syscohada_accounts
  FOR INSERT WITH CHECK (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can update syscohada accounts for their company" ON public.syscohada_accounts
  FOR UPDATE USING (company_id = (SELECT get_user_company_id()));

-- Politiques RLS pour les comptes de trésorerie
CREATE POLICY "Users can view treasury accounts for their company" ON public.treasury_accounts
  FOR SELECT USING (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can insert treasury accounts for their company" ON public.treasury_accounts
  FOR INSERT WITH CHECK (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can update treasury accounts for their company" ON public.treasury_accounts
  FOR UPDATE USING (company_id = (SELECT get_user_company_id()));

-- Politiques RLS pour les journaux comptables
CREATE POLICY "Users can view accounting journals for their company" ON public.accounting_journals
  FOR SELECT USING (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can insert accounting journals for their company" ON public.accounting_journals
  FOR INSERT WITH CHECK (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can update accounting journals for their company" ON public.accounting_journals
  FOR UPDATE USING (company_id = (SELECT get_user_company_id()));

-- Politiques RLS pour les écritures comptables
CREATE POLICY "Users can view accounting entries for their company" ON public.accounting_entries
  FOR SELECT USING (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can insert accounting entries for their company" ON public.accounting_entries
  FOR INSERT WITH CHECK (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can update accounting entries for their company" ON public.accounting_entries
  FOR UPDATE USING (company_id = (SELECT get_user_company_id()));

-- Politiques RLS pour les lignes d'écritures
CREATE POLICY "Users can view accounting entry lines for their company" ON public.accounting_entry_lines
  FOR SELECT USING (
    entry_id IN (
      SELECT id FROM public.accounting_entries 
      WHERE company_id = (SELECT get_user_company_id())
    )
  );

CREATE POLICY "Users can insert accounting entry lines for their company" ON public.accounting_entry_lines
  FOR INSERT WITH CHECK (
    entry_id IN (
      SELECT id FROM public.accounting_entries 
      WHERE company_id = (SELECT get_user_company_id())
    )
  );

-- Politiques RLS pour les rapprochements bancaires
CREATE POLICY "Users can view bank reconciliations for their company" ON public.bank_reconciliations
  FOR SELECT USING (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can insert bank reconciliations for their company" ON public.bank_reconciliations
  FOR INSERT WITH CHECK (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can update bank reconciliations for their company" ON public.bank_reconciliations
  FOR UPDATE USING (company_id = (SELECT get_user_company_id()));

-- Politiques RLS pour les immobilisations
CREATE POLICY "Users can view fixed assets for their company" ON public.fixed_assets
  FOR SELECT USING (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can insert fixed assets for their company" ON public.fixed_assets
  FOR INSERT WITH CHECK (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can update fixed assets for their company" ON public.fixed_assets
  FOR UPDATE USING (company_id = (SELECT get_user_company_id()));

-- Politiques RLS pour les amortissements
CREATE POLICY "Users can view depreciations for their company" ON public.depreciations
  FOR SELECT USING (company_id = (SELECT get_user_company_id()));

CREATE POLICY "Users can insert depreciations for their company" ON public.depreciations
  FOR INSERT WITH CHECK (company_id = (SELECT get_user_company_id()));

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour créer automatiquement le plan comptable SYSCOHADA pour une nouvelle entreprise
CREATE OR REPLACE FUNCTION public.create_syscohada_chart_of_accounts(p_company_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_user_id := auth.uid();
  
  -- Insérer les comptes principaux du plan SYSCOHADA
  -- (Cette fonction sera complétée avec tous les comptes du plan fourni)
  
  -- Exemple pour quelques comptes principaux
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    (p_company_id, '10', 'CAPITAL', 'equity', 'capital', v_user_id, v_user_id),
    (p_company_id, '101', 'CAPITAL SOCIAL', 'equity', 'capital', v_user_id, v_user_id),
    (p_company_id, '11', 'RESERVES', 'equity', 'reserves', v_user_id, v_user_id),
    (p_company_id, '12', 'REPORT A NOUVEAU', 'equity', 'retained_earnings', v_user_id, v_user_id),
    (p_company_id, '13', 'RESULTAT NET DE L''EXERCICE', 'equity', 'net_income', v_user_id, v_user_id),
    (p_company_id, '14', 'SUBVENTIONS D''INVESTISSEMENT', 'equity', 'investment_grants', v_user_id, v_user_id),
    (p_company_id, '15', 'PROVISIONS REGLEMENTEES ET FONDS ASSIMILES', 'equity', 'regulated_provisions', v_user_id, v_user_id),
    (p_company_id, '16', 'EMPRUNTS ET DETTES ASSIMILEES', 'liability', 'loans', v_user_id, v_user_id),
    (p_company_id, '17', 'DETTES DE LOCATION-ACQUISITION', 'liability', 'lease_liabilities', v_user_id, v_user_id),
    (p_company_id, '18', 'DETTES LIEES A DES PARTICIPATIONS ET COMPTES DE LIAISON', 'liability', 'related_party_liabilities', v_user_id, v_user_id),
    (p_company_id, '19', 'PROVISIONS POUR RISQUES ET CHARGES', 'liability', 'provisions', v_user_id, v_user_id),
    (p_company_id, '21', 'IMMOBILISATIONS INCORPORELLES', 'asset', 'intangible_assets', v_user_id, v_user_id),
    (p_company_id, '22', 'TERRAINS', 'asset', 'land', v_user_id, v_user_id),
    (p_company_id, '23', 'BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS', 'asset', 'buildings', v_user_id, v_user_id),
    (p_company_id, '24', 'MATERIEL, MOBILIER ET ACTIFS BIOLOGIQUES', 'asset', 'equipment', v_user_id, v_user_id),
    (p_company_id, '25', 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', 'asset', 'advances_on_assets', v_user_id, v_user_id),
    (p_company_id, '26', 'TITRES DE PARTICIPATION', 'asset', 'investments', v_user_id, v_user_id),
    (p_company_id, '27', 'AUTRES IMMOBLISATIONS FINANCIERES', 'asset', 'other_financial_assets', v_user_id, v_user_id),
    (p_company_id, '28', 'AMORTISSEMENTS', 'asset', 'depreciation', v_user_id, v_user_id),
    (p_company_id, '29', 'DEPRECIATIONS DES IMMOBILISATIONS', 'asset', 'asset_impairment', v_user_id, v_user_id),
    (p_company_id, '31', 'MARCHANDISES', 'asset', 'merchandise', v_user_id, v_user_id),
    (p_company_id, '32', 'MATIERES PREMIERES ET FOURNITURES LIEES', 'asset', 'raw_materials', v_user_id, v_user_id),
    (p_company_id, '33', 'AUTRES APPROVISIONNEMENTS', 'asset', 'other_supplies', v_user_id, v_user_id),
    (p_company_id, '34', 'PRODUITS EN COURS', 'asset', 'work_in_progress', v_user_id, v_user_id),
    (p_company_id, '35', 'SERVICES EN COURS', 'asset', 'services_in_progress', v_user_id, v_user_id),
    (p_company_id, '36', 'PRODUITS FINIS', 'asset', 'finished_goods', v_user_id, v_user_id),
    (p_company_id, '37', 'PRODUITS INTERMEDIAIRES ET RESIDUELS', 'asset', 'intermediate_products', v_user_id, v_user_id),
    (p_company_id, '38', 'STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DEPOT', 'asset', 'stock_in_transit', v_user_id, v_user_id),
    (p_company_id, '39', 'DEPRECIATIONS DES STOCKS ET ENCOURS DE PRODUCTION', 'asset', 'stock_impairment', v_user_id, v_user_id),
    (p_company_id, '40', 'FOURNISSEURS ET COMPTES RATTACHES', 'liability', 'suppliers', v_user_id, v_user_id),
    (p_company_id, '41', 'CLIENTS ET COMPTES RATTACHES', 'asset', 'customers', v_user_id, v_user_id),
    (p_company_id, '42', 'PERSONNEL', 'liability', 'personnel', v_user_id, v_user_id),
    (p_company_id, '43', 'ORGANISMES SOCIAUX', 'liability', 'social_organizations', v_user_id, v_user_id),
    (p_company_id, '44', 'ETAT ET COLLECTIVITES PUBLIQUES', 'liability', 'government', v_user_id, v_user_id),
    (p_company_id, '45', 'ORGANISMES INTERNATIONAUX', 'liability', 'international_organizations', v_user_id, v_user_id),
    (p_company_id, '46', 'APPORTEURS, ASSOCIES ET GROUPE', 'liability', 'shareholders', v_user_id, v_user_id),
    (p_company_id, '47', 'DEBITEURS ET CREDITEURS DIVERS', 'asset', 'other_debtors_creditors', v_user_id, v_user_id),
    (p_company_id, '48', 'CREANCES ET DETTES HORS ACTIVITES ORDINAIRES', 'asset', 'non_operating_items', v_user_id, v_user_id),
    (p_company_id, '49', 'DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME', 'asset', 'short_term_provisions', v_user_id, v_user_id),
    (p_company_id, '50', 'TITRES DE PLACEMENT', 'asset', 'marketable_securities', v_user_id, v_user_id),
    (p_company_id, '51', 'VALEURS A ENCAISSER', 'asset', 'receivables', v_user_id, v_user_id),
    (p_company_id, '52', 'BANQUES', 'asset', 'banks', v_user_id, v_user_id),
    (p_company_id, '53', 'ETABLISSEMENTS FINANCIERS ET ASSIMILES', 'asset', 'financial_institutions', v_user_id, v_user_id),
    (p_company_id, '54', 'INSTRUMENTS DE TRESORERIE', 'asset', 'treasury_instruments', v_user_id, v_user_id),
    (p_company_id, '55', 'INSTRUMENTS DE MONNAIE ELECTRONIQUE', 'asset', 'electronic_money', v_user_id, v_user_id),
    (p_company_id, '56', 'BANQUES, CREDITS DE TRESORERIE ET D''ESCOMPTE', 'liability', 'bank_credits', v_user_id, v_user_id),
    (p_company_id, '57', 'CAISSE', 'asset', 'cash', v_user_id, v_user_id),
    (p_company_id, '58', 'REGIES D''AVANCES, ACCREDITIFS ET VIREMENTS INTERNES', 'asset', 'advances', v_user_id, v_user_id),
    (p_company_id, '59', 'DEPRECIATIONS ET PROVISIONS POUR RISQUE A COURT TERME', 'asset', 'short_term_risk_provisions', v_user_id, v_user_id),
    (p_company_id, '60', 'ACHATS ET VARIATIONS DE STOCKS', 'expense', 'purchases', v_user_id, v_user_id),
    (p_company_id, '61', 'TRANSPORTS', 'expense', 'transport', v_user_id, v_user_id),
    (p_company_id, '62', 'SERVICES EXTERIEURS', 'expense', 'external_services', v_user_id, v_user_id),
    (p_company_id, '63', 'AUTRES SERVICES EXTERIEURS', 'expense', 'other_external_services', v_user_id, v_user_id),
    (p_company_id, '64', 'IMPOTS ET TAXES', 'expense', 'taxes', v_user_id, v_user_id),
    (p_company_id, '65', 'AUTRES CHARGES', 'expense', 'other_expenses', v_user_id, v_user_id),
    (p_company_id, '66', 'CHARGES DE PERSONNEL', 'expense', 'personnel_expenses', v_user_id, v_user_id),
    (p_company_id, '67', 'FRAIS FINANCIERS ET CHARGES ASSIMILEES', 'expense', 'financial_expenses', v_user_id, v_user_id),
    (p_company_id, '68', 'DOTATIONS AUX AMORTISSEMENTS', 'expense', 'depreciation_expenses', v_user_id, v_user_id),
    (p_company_id, '69', 'DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS', 'expense', 'provision_expenses', v_user_id, v_user_id),
    (p_company_id, '70', 'VENTES', 'revenue', 'sales', v_user_id, v_user_id),
    (p_company_id, '71', 'SUBVENTIONS D''EXPLOITATION', 'revenue', 'operating_grants', v_user_id, v_user_id),
    (p_company_id, '72', 'PRODUCTION IMMOBILISEE', 'revenue', 'capitalized_production', v_user_id, v_user_id),
    (p_company_id, '73', 'VARIATIONS DES STOCKS DE BIENS ET DE SERVICES PRODUITS', 'revenue', 'stock_variations', v_user_id, v_user_id),
    (p_company_id, '75', 'AUTRES PRODUITS', 'revenue', 'other_revenues', v_user_id, v_user_id),
    (p_company_id, '77', 'REVENUS FINANCIERS ET PRODUITS ASSIMILES', 'revenue', 'financial_revenues', v_user_id, v_user_id),
    (p_company_id, '78', 'TRANSFERTS DE CHARGES', 'revenue', 'expense_transfers', v_user_id, v_user_id),
    (p_company_id, '79', 'REPRISES DE PROVISIONS, DE DEPRECIATIONS ET AUTRES', 'revenue', 'provision_reversals', v_user_id, v_user_id),
    (p_company_id, '81', 'VALEURS COMPTABLES DES CESSIONS D''IMMOBILISATIONS', 'expense', 'asset_disposal_expenses', v_user_id, v_user_id),
    (p_company_id, '82', 'PRODUITS DES CESSIONS D''IMMOBILISATIONS', 'revenue', 'asset_disposal_revenues', v_user_id, v_user_id),
    (p_company_id, '83', 'CHARGES HORS ACTIVITES ORDINAIRES', 'expense', 'non_operating_expenses', v_user_id, v_user_id),
    (p_company_id, '84', 'PRODUITS HORS ACTIVITES ORDINAIRES', 'revenue', 'non_operating_revenues', v_user_id, v_user_id),
    (p_company_id, '85', 'DOTATIONS HORS ACTIVITES ORDINAIRES', 'expense', 'non_operating_provisions', v_user_id, v_user_id),
    (p_company_id, '86', 'REPRISES DE CHARGES, PROVISIONS ET DEPRECIATIONS HAO', 'revenue', 'non_operating_reversals', v_user_id, v_user_id),
    (p_company_id, '87', 'PARTICIPATION DES TRAVAILLEURS', 'expense', 'employee_participation', v_user_id, v_user_id),
    (p_company_id, '88', 'SUBVENTIONS D''EQUILIBRE', 'revenue', 'equilibrium_grants', v_user_id, v_user_id),
    (p_company_id, '89', 'IMPOTS SUR LE RESULTAT', 'expense', 'income_taxes', v_user_id, v_user_id),
    (p_company_id, '90', 'ENGAGEMENTS OBTENUS ET ENGAGEMENTS ACCORDES', 'asset', 'commitments', v_user_id, v_user_id),
    (p_company_id, '91', 'CONTREPARTIES DES ENGAGEMENTS', 'liability', 'commitment_counterparts', v_user_id, v_user_id),
    (p_company_id, '92', 'COMPTES REFLECHIS', 'asset', 'reflected_accounts', v_user_id, v_user_id),
    (p_company_id, '93', 'COMPTES DE RECLASSEMENTS', 'asset', 'reclassification_accounts', v_user_id, v_user_id),
    (p_company_id, '94', 'COMPTES DE COUTS', 'expense', 'cost_accounts', v_user_id, v_user_id),
    (p_company_id, '95', 'COMPTES DE STOCKS', 'asset', 'stock_accounts', v_user_id, v_user_id),
    (p_company_id, '96', 'COMPTES D''ECARTS SUR COUTS PREETABLIS', 'expense', 'standard_cost_variances', v_user_id, v_user_id),
    (p_company_id, '97', 'COMPTES DE DIFFERENCES DE TRAITEMENT COMPTABLE', 'expense', 'accounting_differences', v_user_id, v_user_id),
    (p_company_id, '98', 'COMPTES DE RESULTATS', 'revenue', 'result_accounts', v_user_id, v_user_id),
    (p_company_id, '99', 'COMPTES DE LIAISONS INTERNES', 'asset', 'internal_links', v_user_id, v_user_id);

  -- =====================================================
  -- COMPTES SPÉCIFIQUES POUR ATELIER DE COUTURE
  -- =====================================================

  -- A. CHARGES D'EXPLOITATION (Classe 6)
  
  -- 1. Achats de Matières Premières et Fournitures
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    -- 601 : Achats de matières premières (tissus principaux)
    (p_company_id, '601', 'ACHATS DE MATIERES PREMIERES', 'expense', 'raw_materials_purchases', v_user_id, v_user_id),
    (p_company_id, '6011', 'Achats de tissus', 'expense', 'fabric_purchases', v_user_id, v_user_id),
    (p_company_id, '6012', 'Achats de fils', 'expense', 'thread_purchases', v_user_id, v_user_id),
    (p_company_id, '6013', 'Achats de doublures', 'expense', 'lining_purchases', v_user_id, v_user_id),
    
    -- 6021 : Matières consommables stockées
    (p_company_id, '6021', 'MATIERES CONSOMMABLES STOCKEES', 'expense', 'consumable_materials', v_user_id, v_user_id),
    (p_company_id, '60211', 'Fils de couture', 'expense', 'sewing_threads', v_user_id, v_user_id),
    (p_company_id, '60212', 'Fils de broderie', 'expense', 'embroidery_threads', v_user_id, v_user_id),
    (p_company_id, '60213', 'Élastiques', 'expense', 'elastic_bands', v_user_id, v_user_id),
    
    -- 6022 : Fournitures consommables stockées
    (p_company_id, '6022', 'FOURNITURES CONSOMMABLES STOCKEES', 'expense', 'consumable_supplies', v_user_id, v_user_id),
    (p_company_id, '60221', 'Boutons', 'expense', 'buttons', v_user_id, v_user_id),
    (p_company_id, '60222', 'Fermetures éclair', 'expense', 'zippers', v_user_id, v_user_id),
    (p_company_id, '60223', 'Biais', 'expense', 'bias_tape', v_user_id, v_user_id),
    (p_company_id, '60224', 'Entoilage', 'expense', 'interfacing', v_user_id, v_user_id),
    
    -- 6056 : Achats de petit matériel et outillage
    (p_company_id, '6056', 'ACHATS DE PETIT MATERIEL ET OUTILLAGE', 'expense', 'small_tools', v_user_id, v_user_id),
    (p_company_id, '60561', 'Aiguilles de machine', 'expense', 'machine_needles', v_user_id, v_user_id),
    (p_company_id, '60562', 'Ciseaux', 'expense', 'scissors', v_user_id, v_user_id),
    (p_company_id, '60563', 'Épingles', 'expense', 'pins', v_user_id, v_user_id),
    (p_company_id, '60564', 'Craies de tailleur', 'expense', 'tailor_chalk', v_user_id, v_user_id),
    (p_company_id, '60565', 'Mètres-rubans', 'expense', 'measuring_tapes', v_user_id, v_user_id),
    
    -- 6063 : Fournitures d'entretien et petit équipement
    (p_company_id, '6063', 'FOURNITURES D''ENTRETIEN ET PETIT EQUIPEMENT', 'expense', 'maintenance_supplies', v_user_id, v_user_id),
    (p_company_id, '60631', 'Huile pour machines', 'expense', 'machine_oil', v_user_id, v_user_id),
    (p_company_id, '60632', 'Produits de nettoyage', 'expense', 'cleaning_products', v_user_id, v_user_id);

  -- 2. Autres Achats et Charges Externes
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    -- 621 : Loyers et charges locatives
    (p_company_id, '621', 'LOYERS ET CHARGES LOCATIVES', 'expense', 'rent_and_charges', v_user_id, v_user_id),
    (p_company_id, '6211', 'Loyer atelier', 'expense', 'workshop_rent', v_user_id, v_user_id),
    (p_company_id, '6212', 'Charges locatives', 'expense', 'rental_charges', v_user_id, v_user_id),
    
    -- 6052 : Fournitures non stockables - Électricité
    (p_company_id, '6052', 'FOURNITURES NON STOCKABLES - ELECTRICITE', 'expense', 'electricity', v_user_id, v_user_id),
    (p_company_id, '60521', 'Électricité atelier', 'expense', 'workshop_electricity', v_user_id, v_user_id),
    
    -- 6053 : Fournitures non stockables - Autres énergies
    (p_company_id, '6053', 'FOURNITURES NON STOCKABLES - AUTRES ENERGIES', 'expense', 'other_energies', v_user_id, v_user_id),
    (p_company_id, '60531', 'Gaz', 'expense', 'gas', v_user_id, v_user_id),
    
    -- 6061 : Achats non stockés de matières et fournitures
    (p_company_id, '6061', 'ACHATS NON STOCKES DE MATIERES ET FOURNITURES', 'expense', 'non_stored_materials', v_user_id, v_user_id),
    (p_company_id, '60611', 'Eau', 'expense', 'water', v_user_id, v_user_id),
    
    -- 622 : Primes d'assurances
    (p_company_id, '622', 'PRIMES D''ASSURANCES', 'expense', 'insurance_premiums', v_user_id, v_user_id),
    (p_company_id, '6221', 'Assurance locaux', 'expense', 'building_insurance', v_user_id, v_user_id),
    (p_company_id, '6222', 'Assurance matériel', 'expense', 'equipment_insurance', v_user_id, v_user_id),
    (p_company_id, '6223', 'Responsabilité civile', 'expense', 'civil_liability', v_user_id, v_user_id),
    
    -- 624 : Entretien, réparations et maintenance
    (p_company_id, '624', 'ENTRETIEN, REPARATIONS ET MAINTENANCE', 'expense', 'maintenance_repairs', v_user_id, v_user_id),
    (p_company_id, '6241', 'Entretien et réparations matériel', 'expense', 'equipment_maintenance', v_user_id, v_user_id),
    (p_company_id, '6242', 'Entretien et réparations bâtiments', 'expense', 'building_maintenance', v_user_id, v_user_id),
    (p_company_id, '6243', 'Maintenance machines à coudre', 'expense', 'sewing_machine_maintenance', v_user_id, v_user_id),
    
    -- 6241 : Transports sur achats
    (p_company_id, '6241', 'TRANSPORTS SUR ACHATS', 'expense', 'purchase_transport', v_user_id, v_user_id),
    (p_company_id, '62411', 'Transport matières premières', 'expense', 'raw_materials_transport', v_user_id, v_user_id),
    
    -- 6242 : Transports sur ventes
    (p_company_id, '6242', 'TRANSPORTS SUR VENTES', 'expense', 'sales_transport', v_user_id, v_user_id),
    (p_company_id, '62421', 'Livraison produits finis', 'expense', 'finished_products_delivery', v_user_id, v_user_id),
    
    -- 625 : Frais postaux et de télécommunications
    (p_company_id, '625', 'FRAIS POSTAUX ET DE TELECOMMUNICATIONS', 'expense', 'postal_telecom', v_user_id, v_user_id),
    (p_company_id, '6251', 'Téléphone', 'expense', 'telephone', v_user_id, v_user_id),
    (p_company_id, '6252', 'Internet', 'expense', 'internet', v_user_id, v_user_id),
    (p_company_id, '6253', 'Frais postaux', 'expense', 'postal_expenses', v_user_id, v_user_id),
    
    -- 623 : Publicité, publications, relations publiques
    (p_company_id, '623', 'PUBLICITE, PUBLICATIONS, RELATIONS PUBLIQUES', 'expense', 'advertising_publicity', v_user_id, v_user_id),
    (p_company_id, '6231', 'Publicité', 'expense', 'advertising', v_user_id, v_user_id),
    (p_company_id, '6232', 'Carts de visite', 'expense', 'business_cards', v_user_id, v_user_id),
    (p_company_id, '6233', 'Site web', 'expense', 'website', v_user_id, v_user_id),
    
    -- 6324 : Honoraires des professions réglementées
    (p_company_id, '6324', 'HONORAIRES DES PROFESSIONS REGLEMENTEES', 'expense', 'regulated_professions', v_user_id, v_user_id),
    (p_company_id, '63241', 'Expert-comptable', 'expense', 'accountant_fees', v_user_id, v_user_id),
    (p_company_id, '63242', 'Avocat', 'expense', 'lawyer_fees', v_user_id, v_user_id),
    
    -- 6327 : Rémunération des autres prestataires de services
    (p_company_id, '6327', 'REMUNERATIONS DES AUTRES PRESTATAIRES DE SERVICES', 'expense', 'other_service_providers', v_user_id, v_user_id),
    (p_company_id, '63271', 'Conseil en style/mode', 'expense', 'fashion_consulting', v_user_id, v_user_id),
    
    -- 6318 : Autres frais bancaires
    (p_company_id, '6318', 'AUTRES FRAIS BANCAIRES', 'expense', 'other_bank_fees', v_user_id, v_user_id),
    (p_company_id, '63181', 'Agios', 'expense', 'bank_charges', v_user_id, v_user_id),
    (p_company_id, '63182', 'Commissions bancaires', 'expense', 'bank_commissions', v_user_id, v_user_id),
    
    -- 6064 : Fournitures de bureau
    (p_company_id, '6064', 'FOURNITURES DE BUREAU', 'expense', 'office_supplies', v_user_id, v_user_id),
    (p_company_id, '60641', 'Papeterie', 'expense', 'stationery', v_user_id, v_user_id),
    (p_company_id, '60642', 'Fournitures administratives', 'expense', 'administrative_supplies', v_user_id, v_user_id);

  -- 3. Charges de Personnel
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    -- 6621 : Appointements, salaires et commissions
    (p_company_id, '6621', 'APPOINTEMENTS, SALAIRES ET COMMISSIONS', 'expense', 'salaries_commissions', v_user_id, v_user_id),
    (p_company_id, '66211', 'Salaires couturiers', 'expense', 'tailor_salaries', v_user_id, v_user_id),
    (p_company_id, '66212', 'Salaires apprentis', 'expense', 'apprentice_salaries', v_user_id, v_user_id),
    (p_company_id, '66213', 'Salaires personnel de vente', 'expense', 'sales_staff_salaries', v_user_id, v_user_id),
    
    -- 664 : Charges sociales
    (p_company_id, '664', 'CHARGES SOCIALES', 'expense', 'social_charges', v_user_id, v_user_id),
    (p_company_id, '6641', 'Charges sociales personnel national', 'expense', 'national_social_charges', v_user_id, v_user_id),
    (p_company_id, '6642', 'Charges sociales personnel non national', 'expense', 'foreign_social_charges', v_user_id, v_user_id),
    
    -- 666 : Rémunération et charges sociales de l'exploitant individuel
    (p_company_id, '666', 'REMUNERATION ET CHARGES SOCIALES DE L''EXPLOITANT INDIVIDUEL', 'expense', 'individual_operator_remuneration', v_user_id, v_user_id),
    (p_company_id, '6661', 'Rémunération exploitant', 'expense', 'operator_remuneration', v_user_id, v_user_id),
    (p_company_id, '6662', 'Charges sociales exploitant', 'expense', 'operator_social_charges', v_user_id, v_user_id);

  -- 4. Impôts et Taxes
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    -- 64 : Impôts et taxes
    (p_company_id, '641', 'IMPOTS ET TAXES DIRECTS', 'expense', 'direct_taxes', v_user_id, v_user_id),
    (p_company_id, '6411', 'Impôt synthétique', 'expense', 'synthetic_tax', v_user_id, v_user_id),
    (p_company_id, '6412', 'Patente', 'expense', 'patent_tax', v_user_id, v_user_id),
    
    -- 646 : Taxe sur la Valeur Ajoutée (TVA) facturée
    (p_company_id, '646', 'TAXE SUR LA VALEUR AJOUTEE (TVA) FACTUREE', 'expense', 'output_vat', v_user_id, v_user_id),
    (p_company_id, '6461', 'TVA collectée', 'expense', 'collected_vat', v_user_id, v_user_id);

  -- B. INVESTISSEMENTS (Classe 2)
  
  -- 1. Acquisition de Machines à Coudre Industrielles
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    -- 2154 : Matériel industriel
    (p_company_id, '2154', 'MATERIEL INDUSTRIEL', 'asset', 'industrial_equipment', v_user_id, v_user_id),
    (p_company_id, '21541', 'Machines à coudre industrielles', 'asset', 'industrial_sewing_machines', v_user_id, v_user_id),
    (p_company_id, '21542', 'Surjeteuses', 'asset', 'overlock_machines', v_user_id, v_user_id),
    (p_company_id, '21543', 'Repasseuses', 'asset', 'ironing_machines', v_user_id, v_user_id),
    
    -- 28154 : Amortissements du matériel industriel
    (p_company_id, '28154', 'AMORTISSEMENTS DU MATERIEL INDUSTRIEL', 'asset', 'industrial_equipment_depreciation', v_user_id, v_user_id),
    (p_company_id, '281541', 'Amortissements machines à coudre', 'asset', 'sewing_machines_depreciation', v_user_id, v_user_id),
    (p_company_id, '281542', 'Amortissements surjeteuses', 'asset', 'overlock_machines_depreciation', v_user_id, v_user_id),
    (p_company_id, '281543', 'Amortissements repasseuses', 'asset', 'ironing_machines_depreciation', v_user_id, v_user_id);

  -- 2. Aménagements et Agencements de l'Atelier
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    -- 212 : Bâtiments (si propriétaire)
    (p_company_id, '212', 'BATIMENTS', 'asset', 'buildings', v_user_id, v_user_id),
    (p_company_id, '2121', 'Atelier de couture', 'asset', 'sewing_workshop', v_user_id, v_user_id),
    
    -- 214 : Agencements et aménagements des biens pris en location
    (p_company_id, '214', 'AGENCEMENTS ET AMENAGEMENTS DES BIENS PRIS EN LOCATION', 'asset', 'rental_improvements', v_user_id, v_user_id),
    (p_company_id, '2141', 'Aménagements atelier', 'asset', 'workshop_fittings', v_user_id, v_user_id),
    (p_company_id, '2142', 'Installations électriques', 'asset', 'electrical_installations', v_user_id, v_user_id),
    (p_company_id, '2143', 'Sols adaptés', 'asset', 'adapted_flooring', v_user_id, v_user_id),
    (p_company_id, '2144', 'Éclairage fixe', 'asset', 'fixed_lighting', v_user_id, v_user_id),
    
    -- 213 : Installations techniques, matériel et outillage industriel
    (p_company_id, '213', 'INSTALLATIONS TECHNIQUES, MATERIEL ET OUTILLAGE INDUSTRIEL', 'asset', 'technical_installations', v_user_id, v_user_id),
    (p_company_id, '2131', 'Systèmes de ventilation', 'asset', 'ventilation_systems', v_user_id, v_user_id),
    (p_company_id, '2132', 'Établis intégrés', 'asset', 'integrated_workbenches', v_user_id, v_user_id),
    
    -- Amortissements correspondants
    (p_company_id, '2812', 'AMORTISSEMENTS DES BATIMENTS', 'asset', 'buildings_depreciation', v_user_id, v_user_id),
    (p_company_id, '28121', 'Amortissements atelier', 'asset', 'workshop_depreciation', v_user_id, v_user_id),
    
    (p_company_id, '2814', 'AMORTISSEMENTS DES AGENCEMENTS ET AMENAGEMENTS', 'asset', 'fittings_depreciation', v_user_id, v_user_id),
    (p_company_id, '28141', 'Amortissements aménagements', 'asset', 'fittings_depreciation', v_user_id, v_user_id),
    
    (p_company_id, '2813', 'AMORTISSEMENTS DES INSTALLATIONS TECHNIQUES', 'asset', 'technical_installations_depreciation', v_user_id, v_user_id),
    (p_company_id, '28131', 'Amortissements installations techniques', 'asset', 'technical_depreciation', v_user_id, v_user_id);

  -- Charges d'amortissement
  INSERT INTO public.syscohada_accounts (company_id, account_number, account_name, account_type, account_category, created_by, updated_by)
  VALUES 
    -- 68112 : Dotations aux amortissements sur immobilisations corporelles
    (p_company_id, '68112', 'DOTATIONS AUX AMORTISSEMENTS SUR IMMOBILISATIONS CORPORELLES', 'expense', 'tangible_assets_depreciation', v_user_id, v_user_id),
    (p_company_id, '681121', 'Amortissements machines', 'expense', 'machines_depreciation', v_user_id, v_user_id),
    (p_company_id, '681122', 'Amortissements bâtiments', 'expense', 'buildings_depreciation_expense', v_user_id, v_user_id),
    (p_company_id, '681123', 'Amortissements agencements', 'expense', 'fittings_depreciation_expense', v_user_id, v_user_id),
    (p_company_id, '681124', 'Amortissements installations techniques', 'expense', 'technical_depreciation_expense', v_user_id, v_user_id);
    
  -- Créer les journaux comptables par défaut
  INSERT INTO public.accounting_journals (company_id, journal_code, journal_name, journal_type, is_system_journal, created_by, updated_by)
  VALUES 
    (p_company_id, 'VTE', 'Journal des Ventes', 'sales', true, v_user_id, v_user_id),
    (p_company_id, 'TRS', 'Journal de Trésorerie', 'treasury', true, v_user_id, v_user_id),
    (p_company_id, 'PAY', 'Journal de Paie', 'payroll', true, v_user_id, v_user_id),
    (p_company_id, 'STK', 'Journal des Stocks', 'stock', true, v_user_id, v_user_id),
    (p_company_id, 'ACH', 'Journal des Achats', 'purchase', true, v_user_id, v_user_id),
    (p_company_id, 'DIV', 'Journal Divers', 'general', true, v_user_id, v_user_id);
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer automatiquement les écritures comptables
CREATE OR REPLACE FUNCTION public.generate_accounting_entry(
  p_company_id UUID,
  p_journal_type public.journal_type,
  p_description TEXT,
  p_source_type TEXT,
  p_source_id UUID,
  p_entries JSONB -- Format: [{"account_number": "701", "debit": 0, "credit": 1000, "description": "Vente marchandises"}]
)
RETURNS UUID AS $$
DECLARE
  v_journal_id UUID;
  v_entry_id UUID;
  v_entry_number TEXT;
  v_total_debit DECIMAL(15,2) := 0;
  v_total_credit DECIMAL(15,2) := 0;
  v_entry JSONB;
  v_account_id UUID;
BEGIN
  -- Récupérer le journal correspondant
  SELECT id INTO v_journal_id 
  FROM public.accounting_journals 
  WHERE company_id = p_company_id AND journal_type = p_journal_type AND is_active = true
  LIMIT 1;
  
  IF v_journal_id IS NULL THEN
    RAISE EXCEPTION 'Aucun journal actif trouvé pour le type %', p_journal_type;
  END IF;
  
  -- Générer le numéro d'écriture
  v_entry_number := p_journal_type || '-' || to_char(now(), 'YYYYMMDD') || '-' || 
                   lpad((SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
                         FROM public.accounting_entries 
                         WHERE company_id = p_company_id 
                         AND entry_number LIKE p_journal_type || '-' || to_char(now(), 'YYYYMMDD') || '-%'), 4, '0');
  
  -- Créer l'écriture principale
  INSERT INTO public.accounting_entries (
    company_id, journal_id, entry_number, entry_date, description, 
    source_type, source_id, created_by, updated_by
  ) VALUES (
    p_company_id, v_journal_id, v_entry_number, CURRENT_DATE, p_description,
    p_source_type, p_source_id, auth.uid(), auth.uid()
  ) RETURNING id INTO v_entry_id;
  
  -- Créer les lignes d'écriture
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
  LOOP
    -- Récupérer l'ID du compte
    SELECT id INTO v_account_id 
    FROM public.syscohada_accounts 
    WHERE company_id = p_company_id AND account_number = (v_entry->>'account_number')
    AND is_active = true;
    
    IF v_account_id IS NULL THEN
      RAISE EXCEPTION 'Compte % non trouvé ou inactif', v_entry->>'account_number';
    END IF;
    
    -- Insérer la ligne
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_account_id, 
      (SELECT COALESCE(MAX(line_number), 0) + 1 FROM public.accounting_entry_lines WHERE entry_id = v_entry_id),
      COALESCE(v_entry->>'description', ''),
      COALESCE(CAST(v_entry->>'debit' AS DECIMAL(15,2)), 0),
      COALESCE(CAST(v_entry->>'credit' AS DECIMAL(15,2)), 0)
    );
    
    -- Accumuler les totaux
    v_total_debit := v_total_debit + COALESCE(CAST(v_entry->>'debit' AS DECIMAL(15,2)), 0);
    v_total_credit := v_total_credit + COALESCE(CAST(v_entry->>'credit' AS DECIMAL(15,2)), 0);
  END LOOP;
  
  -- Vérifier l'équilibre
  IF v_total_debit != v_total_credit THEN
    RAISE EXCEPTION 'L''écriture n''est pas équilibrée: Débit=%, Crédit=%', v_total_debit, v_total_credit;
  END IF;
  
  -- Mettre à jour les totaux de l'écriture
  UPDATE public.accounting_entries 
  SET total_debit = v_total_debit, total_credit = v_total_credit
  WHERE id = v_entry_id;
  
  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour poster une écriture
CREATE OR REPLACE FUNCTION public.post_accounting_entry(p_entry_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_entry RECORD;
BEGIN
  -- Récupérer l'écriture
  SELECT * INTO v_entry FROM public.accounting_entries WHERE id = p_entry_id;
  
  IF v_entry IS NULL THEN
    RAISE EXCEPTION 'Écriture non trouvée';
  END IF;
  
  IF v_entry.is_posted THEN
    RAISE EXCEPTION 'Écriture déjà postée';
  END IF;
  
  -- Vérifier l'équilibre
  IF v_entry.total_debit != v_entry.total_credit THEN
    RAISE EXCEPTION 'Écriture non équilibrée';
  END IF;
  
  -- Poster l'écriture
  UPDATE public.accounting_entries 
  SET is_posted = true, posted_at = now(), posted_by = auth.uid()
  WHERE id = p_entry_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE public.syscohada_accounts IS 'Plan comptable SYSCOHADA pour chaque entreprise';
COMMENT ON TABLE public.treasury_accounts IS 'Comptes de trésorerie (caisse, banque, mobile money)';
COMMENT ON TABLE public.accounting_journals IS 'Journaux comptables';
COMMENT ON TABLE public.accounting_entries IS 'Écritures comptables';
COMMENT ON TABLE public.accounting_entry_lines IS 'Lignes d''écritures comptables';
COMMENT ON TABLE public.bank_reconciliations IS 'Rapprochements bancaires';
COMMENT ON TABLE public.stock_valuation_settings IS 'Paramètres de valorisation des stocks';
COMMENT ON TABLE public.fixed_assets IS 'Immobilisations';
COMMENT ON TABLE public.depreciations IS 'Amortissements des immobilisations';

COMMENT ON FUNCTION public.create_syscohada_chart_of_accounts(UUID) IS 'Crée automatiquement le plan comptable SYSCOHADA pour une nouvelle entreprise';
COMMENT ON FUNCTION public.generate_accounting_entry(UUID, public.journal_type, TEXT, TEXT, UUID, JSONB) IS 'Génère automatiquement une écriture comptable';
COMMENT ON FUNCTION public.post_accounting_entry(UUID) IS 'Poste une écriture comptable'; 