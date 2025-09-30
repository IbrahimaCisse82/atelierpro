-- =====================================================
-- PHASE 2: IMMOBILISATIONS, FACTURES CLIENTS ET TRÉSORERIE
-- =====================================================

-- Table pour les catégories d'immobilisations
CREATE TABLE IF NOT EXISTS public.fixed_asset_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  depreciation_method TEXT NOT NULL DEFAULT 'linear' CHECK (depreciation_method IN ('linear', 'declining_balance', 'units_of_production')),
  default_useful_life INTEGER,
  default_rate NUMERIC(5,2),
  syscohada_account TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  UNIQUE(company_id, name)
);

CREATE INDEX idx_fixed_asset_categories_company ON public.fixed_asset_categories(company_id);

-- RLS pour fixed_asset_categories
ALTER TABLE public.fixed_asset_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage fixed asset categories"
ON public.fixed_asset_categories FOR ALL
USING (company_id = get_user_company_id() AND has_role('owner'::user_role));

CREATE POLICY "Users can view fixed asset categories from their company"
ON public.fixed_asset_categories FOR SELECT
USING (company_id = get_user_company_id());

-- Table pour les mouvements de trésorerie
CREATE TABLE IF NOT EXISTS public.treasury_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  movement_number TEXT NOT NULL,
  treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts(id),
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer')),
  category TEXT NOT NULL CHECK (category IN ('sale', 'purchase', 'salary', 'expense', 'investment', 'loan', 'other')),
  amount NUMERIC(15,2) NOT NULL,
  reference TEXT,
  description TEXT NOT NULL,
  beneficiary TEXT,
  source_type TEXT,
  source_id UUID,
  transfer_to_account_id UUID REFERENCES public.treasury_accounts(id),
  accounting_entry_id UUID REFERENCES public.accounting_entries(id),
  notes TEXT,
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  UNIQUE(company_id, movement_number)
);

CREATE INDEX idx_treasury_movements_company ON public.treasury_movements(company_id);
CREATE INDEX idx_treasury_movements_account ON public.treasury_movements(treasury_account_id);
CREATE INDEX idx_treasury_movements_date ON public.treasury_movements(company_id, movement_date);

-- RLS pour treasury_movements
ALTER TABLE public.treasury_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage treasury movements"
ON public.treasury_movements FOR ALL
USING (company_id = get_user_company_id() AND has_role('owner'::user_role));

CREATE POLICY "Users can view treasury movements from their company"
ON public.treasury_movements FOR SELECT
USING (company_id = get_user_company_id());

-- Table pour les lignes de factures clients (détails)
CREATE TABLE IF NOT EXISTS public.customer_invoice_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.customer_invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 18.5,
  total_before_tax NUMERIC(15,2) NOT NULL,
  tax_amount NUMERIC(15,2) NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(invoice_id, line_number)
);

CREATE INDEX idx_customer_invoice_lines_invoice ON public.customer_invoice_lines(invoice_id);

-- RLS pour customer_invoice_lines
ALTER TABLE public.customer_invoice_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage invoice lines from their company"
ON public.customer_invoice_lines FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.customer_invoices ci
    WHERE ci.id = customer_invoice_lines.invoice_id
    AND ci.company_id = get_user_company_id()
    AND (has_role('orders'::user_role) OR has_role('manager'::user_role) OR has_role('owner'::user_role))
  )
);

CREATE POLICY "Users can view invoice lines from their company"
ON public.customer_invoice_lines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.customer_invoices ci
    WHERE ci.id = customer_invoice_lines.invoice_id
    AND ci.company_id = get_user_company_id()
  )
);

-- Table pour les relances de paiement
CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.customer_invoices(id) ON DELETE CASCADE,
  reminder_number INTEGER NOT NULL DEFAULT 1,
  reminder_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('friendly', 'formal', 'final', 'legal')),
  sent_by TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(invoice_id, reminder_number)
);

CREATE INDEX idx_payment_reminders_company ON public.payment_reminders(company_id);
CREATE INDEX idx_payment_reminders_invoice ON public.payment_reminders(invoice_id);

-- RLS pour payment_reminders
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders and manager can manage payment reminders"
ON public.payment_reminders FOR ALL
USING (
  company_id = get_user_company_id() 
  AND (has_role('orders'::user_role) OR has_role('manager'::user_role) OR has_role('owner'::user_role))
);

CREATE POLICY "Users can view payment reminders from their company"
ON public.payment_reminders FOR SELECT
USING (company_id = get_user_company_id());

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_fixed_asset_categories_updated_at BEFORE UPDATE ON public.fixed_asset_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treasury_movements_updated_at BEFORE UPDATE ON public.treasury_movements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer le numéro de mouvement de trésorerie
CREATE OR REPLACE FUNCTION generate_treasury_movement_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.treasury_movements 
  WHERE company_id = p_company_id 
  AND DATE(created_at) = CURRENT_DATE;
  
  v_number := 'TRES-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le solde du compte de trésorerie
CREATE OR REPLACE FUNCTION update_treasury_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.movement_type = 'in' THEN
      UPDATE public.treasury_accounts 
      SET current_balance = current_balance + NEW.amount
      WHERE id = NEW.treasury_account_id;
    ELSIF NEW.movement_type = 'out' THEN
      UPDATE public.treasury_accounts 
      SET current_balance = current_balance - NEW.amount
      WHERE id = NEW.treasury_account_id;
    ELSIF NEW.movement_type = 'transfer' AND NEW.transfer_to_account_id IS NOT NULL THEN
      UPDATE public.treasury_accounts 
      SET current_balance = current_balance - NEW.amount
      WHERE id = NEW.treasury_account_id;
      
      UPDATE public.treasury_accounts 
      SET current_balance = current_balance + NEW.amount
      WHERE id = NEW.transfer_to_account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER treasury_movement_update_balance
AFTER INSERT ON public.treasury_movements
FOR EACH ROW EXECUTE FUNCTION update_treasury_account_balance();