-- Ajout de la colonne due_date à la table orders si elle n'existe pas
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS due_date DATE;

-- Ajout de la colonne is_paid à la table work_hours si elle n'existe pas
ALTER TABLE public.work_hours ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT false;

-- Ajout de la colonne user_id à la table employees si elle n'existe pas
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_id UUID;

-- Migration pour la génération automatique des écritures comptables
-- Date: 2025-07-12

-- =====================================================
-- FONCTIONS DE GÉNÉRATION AUTOMATIQUE
-- =====================================================

-- Fonction pour générer l'écriture de vente lors de la livraison d'une commande
CREATE OR REPLACE FUNCTION public.generate_sales_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
  v_journal_id UUID;
  v_entry_id UUID;
  v_entry_number TEXT;
  v_total_amount DECIMAL(15,2) := 0;
  v_vat_rate DECIMAL(5,2) := 18.5; -- Taux TVA par défaut
  v_vat_amount DECIMAL(15,2);
  v_net_amount DECIMAL(15,2);
  v_client_account_id UUID;
  v_sales_account_id UUID;
  v_vat_account_id UUID;
  v_user_id UUID;
BEGIN
  -- Vérifier que c'est une livraison (status = 'delivered')
  IF NEW.status != 'delivered' OR OLD.status = 'delivered' THEN
    RETURN NEW;
  END IF;

  -- Récupérer les informations nécessaires
  v_company_id := NEW.company_id;
  v_user_id := auth.uid();

  -- Récupérer le journal des ventes
  SELECT id INTO v_journal_id 
  FROM public.accounting_journals 
  WHERE company_id = v_company_id AND journal_type = 'sales' AND is_active = true
  LIMIT 1;

  IF v_journal_id IS NULL THEN
    RAISE EXCEPTION 'Aucun journal de vente actif trouvé';
  END IF;

  -- Récupérer les comptes nécessaires
  SELECT id INTO v_client_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '411' AND is_active = true;

  SELECT id INTO v_sales_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '701' AND is_active = true;

  SELECT id INTO v_vat_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '443' AND is_active = true;

  IF v_client_account_id IS NULL OR v_sales_account_id IS NULL OR v_vat_account_id IS NULL THEN
    RAISE EXCEPTION 'Comptes comptables manquants pour la génération de l''écriture de vente';
  END IF;

  -- Calculer les montants
  v_total_amount := NEW.total_amount;
  v_vat_amount := v_total_amount * (v_vat_rate / 100);
  v_net_amount := v_total_amount - v_vat_amount;

  -- Générer le numéro d'écriture
  v_entry_number := 'VTE-' || to_char(now(), 'YYYYMMDD') || '-' || 
                   lpad((SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
                         FROM public.accounting_entries 
                         WHERE company_id = v_company_id 
                         AND entry_number LIKE 'VTE-' || to_char(now(), 'YYYYMMDD') || '-%'), 4, '0');

  -- Créer l'écriture principale
  INSERT INTO public.accounting_entries (
    company_id, journal_id, entry_number, entry_date, description, 
    total_debit, total_credit, source_type, source_id, created_by, updated_by
  ) VALUES (
    v_company_id, v_journal_id, v_entry_number, CURRENT_DATE, 
    'Vente commande ' || NEW.order_number,
    v_total_amount, v_total_amount, 'order', NEW.id, v_user_id, v_user_id
  ) RETURNING id INTO v_entry_id;

  -- Créer les lignes d'écriture
  -- Client (Débit)
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  ) VALUES (
    v_entry_id, v_client_account_id, 1, 'Client ' || NEW.client_name, v_total_amount, 0
  );

  -- Ventes (Crédit)
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  ) VALUES (
    v_entry_id, v_sales_account_id, 2, 'Vente marchandises', 0, v_net_amount
  );

  -- TVA (Crédit)
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  ) VALUES (
    v_entry_id, v_vat_account_id, 3, 'TVA facturée', 0, v_vat_amount
  );

  -- Poster automatiquement l'écriture
  UPDATE public.accounting_entries 
  SET is_posted = true, posted_at = now(), posted_by = v_user_id
  WHERE id = v_entry_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer l'écriture de trésorerie lors d'un paiement
CREATE OR REPLACE FUNCTION public.generate_treasury_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
  v_journal_id UUID;
  v_entry_id UUID;
  v_entry_number TEXT;
  v_treasury_account_id UUID;
  v_client_account_id UUID;
  v_user_id UUID;
BEGIN
  -- Vérifier que c'est un nouveau paiement
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Récupérer les informations nécessaires
  v_company_id := NEW.company_id;
  v_user_id := auth.uid();

  -- Récupérer le journal de trésorerie
  SELECT id INTO v_journal_id 
  FROM public.accounting_journals 
  WHERE company_id = v_company_id AND journal_type = 'treasury' AND is_active = true
  LIMIT 1;

  IF v_journal_id IS NULL THEN
    RAISE EXCEPTION 'Aucun journal de trésorerie actif trouvé';
  END IF;

  -- Récupérer le compte de trésorerie utilisé
  SELECT id INTO v_treasury_account_id 
  FROM public.treasury_accounts 
  WHERE company_id = v_company_id AND account_type = NEW.payment_method AND is_active = true
  LIMIT 1;

  -- Récupérer le compte client
  SELECT id INTO v_client_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '411' AND is_active = true;

  IF v_treasury_account_id IS NULL OR v_client_account_id IS NULL THEN
    RAISE EXCEPTION 'Comptes comptables manquants pour la génération de l''écriture de trésorerie';
  END IF;

  -- Générer le numéro d'écriture
  v_entry_number := 'TRS-' || to_char(now(), 'YYYYMMDD') || '-' || 
                   lpad((SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
                         FROM public.accounting_entries 
                         WHERE company_id = v_company_id 
                         AND entry_number LIKE 'TRS-' || to_char(now(), 'YYYYMMDD') || '-%'), 4, '0');

  -- Créer l'écriture principale
  INSERT INTO public.accounting_entries (
    company_id, journal_id, entry_number, entry_date, description, 
    total_debit, total_credit, source_type, source_id, created_by, updated_by
  ) VALUES (
    v_company_id, v_journal_id, v_entry_number, CURRENT_DATE, 
    'Encaissement ' || NEW.payment_reference,
    NEW.amount, NEW.amount, 'payment', NEW.id, v_user_id, v_user_id
  ) RETURNING id INTO v_entry_id;

  -- Créer les lignes d'écriture
  -- Trésorerie (Débit)
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  ) VALUES (
    v_entry_id, v_treasury_account_id, 1, 'Encaissement client', NEW.amount, 0
  );

  -- Client (Crédit)
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  ) VALUES (
    v_entry_id, v_client_account_id, 2, 'Règlement client', 0, NEW.amount
  );

  -- Poster automatiquement l'écriture
  UPDATE public.accounting_entries 
  SET is_posted = true, posted_at = now(), posted_by = v_user_id
  WHERE id = v_entry_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer l'écriture de paie lors du versement d'un salaire
CREATE OR REPLACE FUNCTION public.generate_payroll_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
  v_journal_id UUID;
  v_entry_id UUID;
  v_entry_number TEXT;
  v_treasury_account_id UUID;
  v_personnel_account_id UUID;
  v_social_account_id UUID;
  v_tax_account_id UUID;
  v_user_id UUID;
  v_net_salary DECIMAL(15,2);
  v_social_charges DECIMAL(15,2);
  v_taxes DECIMAL(15,2);
BEGIN
  -- Vérifier que c'est un nouveau versement de salaire
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Récupérer les informations nécessaires
  v_company_id := NEW.company_id;
  v_user_id := auth.uid();

  -- Récupérer le journal de paie
  SELECT id INTO v_journal_id 
  FROM public.accounting_journals 
  WHERE company_id = v_company_id AND journal_type = 'payroll' AND is_active = true
  LIMIT 1;

  IF v_journal_id IS NULL THEN
    RAISE EXCEPTION 'Aucun journal de paie actif trouvé';
  END IF;

  -- Récupérer les comptes nécessaires
  SELECT id INTO v_treasury_account_id 
  FROM public.treasury_accounts 
  WHERE company_id = v_company_id AND account_type = 'bank' AND is_active = true
  LIMIT 1;

  SELECT id INTO v_personnel_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '66' AND is_active = true;

  SELECT id INTO v_social_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '43' AND is_active = true;

  SELECT id INTO v_tax_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '44' AND is_active = true;

  IF v_treasury_account_id IS NULL OR v_personnel_account_id IS NULL THEN
    RAISE EXCEPTION 'Comptes comptables manquants pour la génération de l''écriture de paie';
  END IF;

  -- Calculer les montants (exemple simplifié)
  v_net_salary := NEW.net_salary;
  v_social_charges := NEW.social_charges;
  v_taxes := NEW.tax_amount;

  -- Générer le numéro d'écriture
  v_entry_number := 'PAY-' || to_char(now(), 'YYYYMMDD') || '-' || 
                   lpad((SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
                         FROM public.accounting_entries 
                         WHERE company_id = v_company_id 
                         AND entry_number LIKE 'PAY-' || to_char(now(), 'YYYYMMDD') || '-%'), 4, '0');

  -- Créer l'écriture principale
  INSERT INTO public.accounting_entries (
    company_id, journal_id, entry_number, entry_date, description, 
    total_debit, total_credit, source_type, source_id, created_by, updated_by
  ) VALUES (
    v_company_id, v_journal_id, v_entry_number, CURRENT_DATE, 
    'Paie ' || NEW.employee_name || ' - ' || to_char(NEW.pay_period_start, 'MM/YYYY'),
    v_net_salary + v_social_charges + v_taxes, v_net_salary + v_social_charges + v_taxes, 
    'payroll', NEW.id, v_user_id, v_user_id
  ) RETURNING id INTO v_entry_id;

  -- Créer les lignes d'écriture
  -- Charges de personnel (Débit)
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  ) VALUES (
    v_entry_id, v_personnel_account_id, 1, 'Charges de personnel', v_net_salary + v_social_charges, 0
  );

  -- Trésorerie (Crédit) - Net versé
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  ) VALUES (
    v_entry_id, v_treasury_account_id, 2, 'Versement net salaire', 0, v_net_salary
  );

  -- Organismes sociaux (Crédit) - Si applicable
  IF v_social_charges > 0 AND v_social_account_id IS NOT NULL THEN
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_social_account_id, 3, 'Cotisations sociales', 0, v_social_charges
    );
  END IF;

  -- État (Crédit) - Si applicable
  IF v_taxes > 0 AND v_tax_account_id IS NOT NULL THEN
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_tax_account_id, 4, 'Impôts sur salaires', 0, v_taxes
    );
  END IF;

  -- Poster automatiquement l'écriture
  UPDATE public.accounting_entries 
  SET is_posted = true, posted_at = now(), posted_by = v_user_id
  WHERE id = v_entry_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer l'écriture de stock lors d'un mouvement
CREATE OR REPLACE FUNCTION public.generate_stock_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
  v_journal_id UUID;
  v_entry_id UUID;
  v_entry_number TEXT;
  v_stock_account_id UUID;
  v_purchase_account_id UUID;
  v_variation_account_id UUID;
  v_user_id UUID;
  v_total_value DECIMAL(15,2);
BEGIN
  -- Récupérer les informations nécessaires
  v_company_id := NEW.company_id;
  v_user_id := auth.uid();

  -- Récupérer le journal des stocks
  SELECT id INTO v_journal_id 
  FROM public.accounting_journals 
  WHERE company_id = v_company_id AND journal_type = 'stock' AND is_active = true
  LIMIT 1;

  IF v_journal_id IS NULL THEN
    RAISE EXCEPTION 'Aucun journal de stock actif trouvé';
  END IF;

  -- Récupérer les comptes nécessaires
  SELECT id INTO v_stock_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '31' AND is_active = true;

  SELECT id INTO v_purchase_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '60' AND is_active = true;

  SELECT id INTO v_variation_account_id 
  FROM public.syscohada_accounts 
  WHERE company_id = v_company_id AND account_number = '603' AND is_active = true;

  IF v_stock_account_id IS NULL OR v_purchase_account_id IS NULL THEN
    RAISE EXCEPTION 'Comptes comptables manquants pour la génération de l''écriture de stock';
  END IF;

  -- Calculer la valeur totale
  v_total_value := NEW.quantity * COALESCE(NEW.unit_price, 0);

  -- Générer le numéro d'écriture
  v_entry_number := 'STK-' || to_char(now(), 'YYYYMMDD') || '-' || 
                   lpad((SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
                         FROM public.accounting_entries 
                         WHERE company_id = v_company_id 
                         AND entry_number LIKE 'STK-' || to_char(now(), 'YYYYMMDD') || '-%'), 4, '0');

  -- Créer l'écriture selon le type de mouvement
  IF NEW.movement_type = 'in' THEN
    -- Entrée en stock
    INSERT INTO public.accounting_entries (
      company_id, journal_id, entry_number, entry_date, description, 
      total_debit, total_credit, source_type, source_id, created_by, updated_by
    ) VALUES (
      v_company_id, v_journal_id, v_entry_number, CURRENT_DATE, 
      'Entrée en stock - ' || NEW.reference,
      v_total_value, v_total_value, 'stock_movement', NEW.id, v_user_id, v_user_id
    ) RETURNING id INTO v_entry_id;

    -- Stock (Débit)
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_stock_account_id, 1, 'Entrée en stock', v_total_value, 0
    );

    -- Achats (Crédit)
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_purchase_account_id, 2, 'Achat marchandises', 0, v_total_value
    );

  ELSIF NEW.movement_type = 'out' THEN
    -- Sortie de stock
    INSERT INTO public.accounting_entries (
      company_id, journal_id, v_entry_number, entry_date, description, 
      total_debit, total_credit, source_type, source_id, created_by, updated_by
    ) VALUES (
      v_company_id, v_journal_id, v_entry_number, CURRENT_DATE, 
      'Sortie de stock - ' || NEW.reference,
      v_total_value, v_total_value, 'stock_movement', NEW.id, v_user_id, v_user_id
    ) RETURNING id INTO v_entry_id;

    -- Variation de stock (Débit)
    IF v_variation_account_id IS NOT NULL THEN
      INSERT INTO public.accounting_entry_lines (
        entry_id, account_id, line_number, description, debit_amount, credit_amount
      ) VALUES (
        v_entry_id, v_variation_account_id, 1, 'Variation de stock', v_total_value, 0
      );
    END IF;

    -- Stock (Crédit)
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_stock_account_id, 2, 'Sortie de stock', 0, v_total_value
    );
  END IF;

  -- Poster automatiquement l'écriture
  UPDATE public.accounting_entries 
  SET is_posted = true, posted_at = now(), posted_by = v_user_id
  WHERE id = v_entry_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS POUR LA GÉNÉRATION AUTOMATIQUE
-- =====================================================

-- Trigger pour les ventes (commandes livrées)
CREATE TRIGGER trigger_generate_sales_entry
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_sales_entry();

-- Trigger pour les paiements
CREATE TRIGGER trigger_generate_treasury_entry
  AFTER INSERT ON public.customer_invoices
  FOR EACH ROW
  WHEN (NEW.is_paid = true)
  EXECUTE FUNCTION public.generate_treasury_entry();

-- Trigger pour les salaires
CREATE TRIGGER trigger_generate_payroll_entry
  AFTER INSERT ON public.work_hours
  FOR EACH ROW
  WHEN (NEW.is_paid = true)
  EXECUTE FUNCTION public.generate_payroll_entry();

-- Trigger pour les mouvements de stock
CREATE TRIGGER trigger_generate_stock_entry
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_stock_entry();

-- =====================================================
-- FONCTIONS UTILITAIRES POUR LA GESTION DES ÉCRITURES
-- =====================================================

-- Fonction pour annuler une écriture
CREATE OR REPLACE FUNCTION public.reverse_accounting_entry(p_entry_id UUID)
RETURNS UUID AS $$
DECLARE
  v_original_entry RECORD;
  v_reverse_entry_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  -- Récupérer l'écriture originale
  SELECT * INTO v_original_entry FROM public.accounting_entries WHERE id = p_entry_id;
  
  IF v_original_entry IS NULL THEN
    RAISE EXCEPTION 'Écriture non trouvée';
  END IF;

  IF NOT v_original_entry.is_posted THEN
    RAISE EXCEPTION 'Impossible d''annuler une écriture non postée';
  END IF;

  -- Créer l'écriture d'annulation
  INSERT INTO public.accounting_entries (
    company_id, journal_id, entry_number, entry_date, description, 
    total_debit, total_credit, source_type, source_id, created_by, updated_by
  ) VALUES (
    v_original_entry.company_id, v_original_entry.journal_id,
    v_original_entry.entry_number || '-ANN',
    CURRENT_DATE,
    'Annulation - ' || v_original_entry.description,
    v_original_entry.total_debit, v_original_entry.total_credit,
    'reversal', p_entry_id, v_user_id, v_user_id
  ) RETURNING id INTO v_reverse_entry_id;

  -- Créer les lignes d'annulation (inverser débit/crédit)
  INSERT INTO public.accounting_entry_lines (
    entry_id, account_id, line_number, description, debit_amount, credit_amount
  )
  SELECT 
    v_reverse_entry_id,
    account_id,
    line_number,
    'Annulation - ' || description,
    credit_amount, -- Inverser
    debit_amount   -- Inverser
  FROM public.accounting_entry_lines 
  WHERE entry_id = p_entry_id;

  -- Poster l'écriture d'annulation
  UPDATE public.accounting_entries 
  SET is_posted = true, posted_at = now(), posted_by = v_user_id
  WHERE id = v_reverse_entry_id;

  RETURN v_reverse_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier l'équilibre des écritures
CREATE OR REPLACE FUNCTION public.check_entry_balance(p_entry_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_debit DECIMAL(15,2);
  v_total_credit DECIMAL(15,2);
BEGIN
  SELECT 
    COALESCE(SUM(debit_amount), 0),
    COALESCE(SUM(credit_amount), 0)
  INTO v_total_debit, v_total_credit
  FROM public.accounting_entry_lines 
  WHERE entry_id = p_entry_id;

  RETURN v_total_debit = v_total_credit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON FUNCTION public.generate_sales_entry() IS 'Génère automatiquement l''écriture de vente lors de la livraison d''une commande';
COMMENT ON FUNCTION public.generate_treasury_entry() IS 'Génère automatiquement l''écriture de trésorerie lors d''un paiement client';
COMMENT ON FUNCTION public.generate_payroll_entry() IS 'Génère automatiquement l''écriture de paie lors du versement d''un salaire';
COMMENT ON FUNCTION public.generate_stock_entry() IS 'Génère automatiquement l''écriture de stock lors d''un mouvement';
COMMENT ON FUNCTION public.reverse_accounting_entry(UUID) IS 'Annule une écriture en créant une écriture d''annulation';
COMMENT ON FUNCTION public.check_entry_balance(UUID) IS 'Vérifie l''équilibre débit/crédit d''une écriture';

-- Index sur due_date supprimé pour éviter l'erreur si la colonne n'existe pas
-- CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);