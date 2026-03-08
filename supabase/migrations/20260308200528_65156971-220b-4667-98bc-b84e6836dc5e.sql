
-- 1. Table plan comptable SYSCOHADA
CREATE TABLE public.syscohada_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'asset',
  account_category TEXT NOT NULL DEFAULT '',
  parent_account_id UUID REFERENCES public.syscohada_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_account BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, account_number)
);

ALTER TABLE public.syscohada_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select" ON public.syscohada_accounts FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company members can insert" ON public.syscohada_accounts FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company members can update" ON public.syscohada_accounts FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company members can delete" ON public.syscohada_accounts FOR DELETE USING (company_id = get_user_company_id());

-- 2. Table journaux comptables
CREATE TABLE public.accounting_journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  journal_code TEXT NOT NULL,
  journal_name TEXT NOT NULL,
  journal_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_journal BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, journal_code)
);

ALTER TABLE public.accounting_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select" ON public.accounting_journals FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company members can insert" ON public.accounting_journals FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company members can update" ON public.accounting_journals FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company members can delete" ON public.accounting_journals FOR DELETE USING (company_id = get_user_company_id());

-- 3. Table écritures comptables
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  journal_id UUID NOT NULL REFERENCES public.accounting_journals(id),
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL DEFAULT '',
  is_posted BOOLEAN NOT NULL DEFAULT false,
  posted_by UUID,
  posted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select" ON public.journal_entries FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company members can insert" ON public.journal_entries FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company members can update" ON public.journal_entries FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company members can delete" ON public.journal_entries FOR DELETE USING (company_id = get_user_company_id());

-- 4. Table lignes d'écritures
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.syscohada_accounts(id),
  debit_amount NUMERIC NOT NULL DEFAULT 0,
  credit_amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select" ON public.journal_entry_lines FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company members can insert" ON public.journal_entry_lines FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company members can update" ON public.journal_entry_lines FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company members can delete" ON public.journal_entry_lines FOR DELETE USING (company_id = get_user_company_id());

-- 5. Table rapprochements bancaires
CREATE TABLE public.bank_reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts(id),
  reconciliation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bank_statement_balance NUMERIC NOT NULL DEFAULT 0,
  book_balance NUMERIC NOT NULL DEFAULT 0,
  reconciled_balance NUMERIC NOT NULL DEFAULT 0,
  differences NUMERIC NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select" ON public.bank_reconciliations FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company members can insert" ON public.bank_reconciliations FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company members can update" ON public.bank_reconciliations FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company members can delete" ON public.bank_reconciliations FOR DELETE USING (company_id = get_user_company_id());

-- 6. Table relevés bancaires importés
CREATE TABLE public.bank_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts(id),
  statement_date DATE NOT NULL,
  reference TEXT,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  movement_type TEXT NOT NULL DEFAULT 'credit',
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  matched_movement_id UUID REFERENCES public.treasury_movements(id),
  reconciliation_id UUID REFERENCES public.bank_reconciliations(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select" ON public.bank_statements FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company members can insert" ON public.bank_statements FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company members can update" ON public.bank_statements FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company members can delete" ON public.bank_statements FOR DELETE USING (company_id = get_user_company_id());
