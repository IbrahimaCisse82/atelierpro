-- Migration pour corriger les avertissements de sécurité search_path
-- Date: 2025-07-18

-- =====================================================
-- CORRECTION DES FONCTIONS AVEC search_path MUTABLE
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
      company_id, journal_id, entry_number, entry_date, description, 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fonction pour créer le plan comptable SYSCOHADA
CREATE OR REPLACE FUNCTION public.create_syscohada_chart_of_accounts(p_company_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est connecté
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non connecté';
  END IF;

  -- Insérer les comptes SYSCOHADA de base
  INSERT INTO public.syscohada_accounts (
    company_id, account_number, account_name, account_type, account_class, 
    parent_account_id, is_active, created_by, updated_by
  ) VALUES
    -- Classe 1 : Comptes de ressources durables
    (p_company_id, '1', 'COMPTES DE RESSOURCES DURABLES', 'class', '1', NULL, true, v_user_id, v_user_id),
    (p_company_id, '10', 'CAPITAL ET RESERVES', 'group', '1', NULL, true, v_user_id, v_user_id),
    (p_company_id, '101', 'Capital social', 'detail', '1', NULL, true, v_user_id, v_user_id),
    (p_company_id, '106', 'Réserves', 'detail', '1', NULL, true, v_user_id, v_user_id),
    
    -- Classe 2 : Comptes d'actif immobilisé
    (p_company_id, '2', 'COMPTES D''ACTIF IMMOBILISE', 'class', '2', NULL, true, v_user_id, v_user_id),
    (p_company_id, '21', 'IMMOBILISATIONS CORPORELLES', 'group', '2', NULL, true, v_user_id, v_user_id),
    (p_company_id, '213', 'Constructions', 'detail', '2', NULL, true, v_user_id, v_user_id),
    (p_company_id, '215', 'Installations techniques', 'detail', '2', NULL, true, v_user_id, v_user_id),
    (p_company_id, '218', 'Matériel de transport', 'detail', '2', NULL, true, v_user_id, v_user_id),
    
    -- Classe 3 : Comptes de stocks
    (p_company_id, '3', 'COMPTES DE STOCKS', 'class', '3', NULL, true, v_user_id, v_user_id),
    (p_company_id, '31', 'MARCHANDISES', 'group', '3', NULL, true, v_user_id, v_user_id),
    (p_company_id, '311', 'Marchandises A', 'detail', '3', NULL, true, v_user_id, v_user_id),
    (p_company_id, '32', 'MATIERES PREMIERES', 'group', '3', NULL, true, v_user_id, v_user_id),
    (p_company_id, '321', 'Matières premières A', 'detail', '3', NULL, true, v_user_id, v_user_id),
    
    -- Classe 4 : Comptes de tiers
    (p_company_id, '4', 'COMPTES DE TIERS', 'class', '4', NULL, true, v_user_id, v_user_id),
    (p_company_id, '41', 'CLIENTS ET COMPTES RATTACHES', 'group', '4', NULL, true, v_user_id, v_user_id),
    (p_company_id, '411', 'Clients', 'detail', '4', NULL, true, v_user_id, v_user_id),
    (p_company_id, '401', 'Fournisseurs', 'detail', '4', NULL, true, v_user_id, v_user_id),
    (p_company_id, '43', 'ORGANISMES SOCIAUX', 'group', '4', NULL, true, v_user_id, v_user_id),
    (p_company_id, '431', 'Sécurité sociale', 'detail', '4', NULL, true, v_user_id, v_user_id),
    (p_company_id, '44', 'ETAT, IMPOTS ET TAXES', 'group', '4', NULL, true, v_user_id, v_user_id),
    (p_company_id, '443', 'TVA facturée', 'detail', '4', NULL, true, v_user_id, v_user_id),
    
    -- Classe 5 : Comptes de trésorerie
    (p_company_id, '5', 'COMPTES DE TRESORERIE', 'class', '5', NULL, true, v_user_id, v_user_id),
    (p_company_id, '52', 'BANQUES', 'group', '5', NULL, true, v_user_id, v_user_id),
    (p_company_id, '521', 'Banques locales', 'detail', '5', NULL, true, v_user_id, v_user_id),
    (p_company_id, '53', 'ETABLISSEMENTS FINANCIERS', 'group', '5', NULL, true, v_user_id, v_user_id),
    (p_company_id, '57', 'CAISSE', 'group', '5', NULL, true, v_user_id, v_user_id),
    (p_company_id, '571', 'Caisse principale', 'detail', '5', NULL, true, v_user_id, v_user_id),
    
    -- Classe 6 : Comptes de charges
    (p_company_id, '6', 'COMPTES DE CHARGES', 'class', '6', NULL, true, v_user_id, v_user_id),
    (p_company_id, '60', 'ACHATS ET VARIATIONS DE STOCKS', 'group', '6', NULL, true, v_user_id, v_user_id),
    (p_company_id, '601', 'Achats de marchandises', 'detail', '6', NULL, true, v_user_id, v_user_id),
    (p_company_id, '603', 'Variations de stocks', 'detail', '6', NULL, true, v_user_id, v_user_id),
    (p_company_id, '66', 'CHARGES DE PERSONNEL', 'group', '6', NULL, true, v_user_id, v_user_id),
    (p_company_id, '661', 'Salaires', 'detail', '6', NULL, true, v_user_id, v_user_id),
    
    -- Classe 7 : Comptes de produits
    (p_company_id, '7', 'COMPTES DE PRODUITS', 'class', '7', NULL, true, v_user_id, v_user_id),
    (p_company_id, '70', 'VENTES', 'group', '7', NULL, true, v_user_id, v_user_id),
    (p_company_id, '701', 'Ventes de marchandises', 'detail', '7', NULL, true, v_user_id, v_user_id),
    (p_company_id, '702', 'Ventes de produits finis', 'detail', '7', NULL, true, v_user_id, v_user_id);
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fonction pour générer une écriture comptable
CREATE OR REPLACE FUNCTION public.generate_accounting_entry(
  p_company_id UUID,
  p_journal_id UUID,
  p_description TEXT,
  p_entries JSON
) RETURNS UUID AS $$
DECLARE
  v_entry_id UUID;
  v_entry_number TEXT;
  v_total_debit DECIMAL(15,2) := 0;
  v_total_credit DECIMAL(15,2) := 0;
  v_line_number INTEGER := 1;
  v_entry JSON;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Générer le numéro d'écriture
  v_entry_number := 'GEN-' || to_char(now(), 'YYYYMMDD') || '-' || 
                   lpad((SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
                         FROM public.accounting_entries 
                         WHERE company_id = p_company_id 
                         AND entry_number LIKE 'GEN-' || to_char(now(), 'YYYYMMDD') || '-%'), 4, '0');

  -- Calculer les totaux
  FOR v_entry IN SELECT * FROM json_array_elements(p_entries)
  LOOP
    v_total_debit := v_total_debit + COALESCE((v_entry->>'debit_amount')::DECIMAL, 0);
    v_total_credit := v_total_credit + COALESCE((v_entry->>'credit_amount')::DECIMAL, 0);
  END LOOP;

  -- Vérifier l'équilibre
  IF v_total_debit != v_total_credit THEN
    RAISE EXCEPTION 'Écriture déséquilibrée: débit % != crédit %', v_total_debit, v_total_credit;
  END IF;

  -- Créer l'écriture principale
  INSERT INTO public.accounting_entries (
    company_id, journal_id, entry_number, entry_date, description, 
    total_debit, total_credit, created_by, updated_by
  ) VALUES (
    p_company_id, p_journal_id, v_entry_number, CURRENT_DATE, p_description,
    v_total_debit, v_total_credit, v_user_id, v_user_id
  ) RETURNING id INTO v_entry_id;

  -- Créer les lignes d'écriture
  FOR v_entry IN SELECT * FROM json_array_elements(p_entries)
  LOOP
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, 
      (v_entry->>'account_id')::UUID,
      v_line_number,
      v_entry->>'description',
      COALESCE((v_entry->>'debit_amount')::DECIMAL, 0),
      COALESCE((v_entry->>'credit_amount')::DECIMAL, 0)
    );
    
    v_line_number := v_line_number + 1;
  END LOOP;

  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fonction pour poster une écriture comptable
CREATE OR REPLACE FUNCTION public.post_accounting_entry(p_entry_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_entry RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Récupérer l'écriture
  SELECT * INTO v_entry FROM public.accounting_entries WHERE id = p_entry_id;
  
  IF v_entry IS NULL THEN
    RAISE EXCEPTION 'Écriture non trouvée';
  END IF;
  
  IF v_entry.is_posted THEN
    RAISE EXCEPTION 'Écriture déjà postée';
  END IF;
  
  -- Vérifier l'équilibre
  IF NOT public.check_entry_balance(p_entry_id) THEN
    RAISE EXCEPTION 'Impossible de poster une écriture déséquilibrée';
  END IF;
  
  -- Poster l'écriture
  UPDATE public.accounting_entries 
  SET is_posted = true, posted_at = now(), posted_by = v_user_id
  WHERE id = p_entry_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Autres fonctions avec correction du search_path
DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;
DROP FUNCTION IF EXISTS public.generate_order_number();
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_month TEXT;
  v_sequence INTEGER;
BEGIN
  v_year := to_char(now(), 'YY');
  v_month := to_char(now(), 'MM');
  
  -- Obtenir le prochain numéro de séquence
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM public.orders
  WHERE order_number LIKE 'CMD-' || v_year || v_month || '-%';
  
  RETURN 'CMD-' || v_year || v_month || '-' || lpad(v_sequence::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le statut automatiquement selon certaines conditions
  IF NEW.delivered_at IS NOT NULL AND OLD.delivered_at IS NULL THEN
    NEW.status := 'delivered';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.calculate_remuneration()
RETURNS TRIGGER AS $$
DECLARE
  v_base_salary DECIMAL(15,2);
  v_commission DECIMAL(15,2) := 0;
  v_bonus DECIMAL(15,2) := 0;
BEGIN
  -- Récupérer le salaire de base
  SELECT salary INTO v_base_salary
  FROM public.employees
  WHERE id = NEW.employee_id;
  
  -- Calculer la commission (exemple simplifié)
  IF NEW.sales_amount > 0 THEN
    v_commission := NEW.sales_amount * 0.05; -- 5% de commission
  END IF;
  
  -- Calculer le bonus (exemple simplifié)
  IF NEW.hours_worked > 40 THEN
    v_bonus := (NEW.hours_worked - 40) * 15; -- 15 par heure supplémentaire
  END IF;
  
  -- Calculer le total
  NEW.total_remuneration := v_base_salary + v_commission + v_bonus;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_production_stats()
RETURNS TABLE (
  total_orders INTEGER,
  completed_orders INTEGER,
  pending_orders INTEGER,
  total_revenue DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_orders,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_orders,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_orders,
    COALESCE(SUM(total_amount), 0) as total_revenue
  FROM public.orders
  WHERE company_id = public.get_user_company_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_employee_remunerations()
RETURNS TABLE (
  employee_id UUID,
  employee_name TEXT,
  total_remuneration DECIMAL(15,2),
  month_year TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    COALESCE(SUM(r.total_remuneration), 0),
    to_char(r.period_start, 'MM/YYYY')
  FROM public.employees e
  LEFT JOIN public.remunerations r ON e.id = r.employee_id
  WHERE e.company_id = public.get_user_company_id()
  GROUP BY e.id, e.name, to_char(r.period_start, 'MM/YYYY');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.generate_sales_entry() IS 'Génère automatiquement l''écriture de vente lors de la livraison d''une commande - SÉCURISÉ';
COMMENT ON FUNCTION public.generate_treasury_entry() IS 'Génère automatiquement l''écriture de trésorerie lors d''un paiement client - SÉCURISÉ';
COMMENT ON FUNCTION public.generate_payroll_entry() IS 'Génère automatiquement l''écriture de paie lors du versement d''un salaire - SÉCURISÉ';
COMMENT ON FUNCTION public.generate_stock_entry() IS 'Génère automatiquement l''écriture de stock lors d''un mouvement - SÉCURISÉ';
COMMENT ON FUNCTION public.reverse_accounting_entry(UUID) IS 'Annule une écriture en créant une écriture d''annulation - SÉCURISÉ';
COMMENT ON FUNCTION public.check_entry_balance(UUID) IS 'Vérifie l''équilibre débit/crédit d''une écriture - SÉCURISÉ';
COMMENT ON FUNCTION public.create_syscohada_chart_of_accounts(UUID) IS 'Crée le plan comptable SYSCOHADA pour une entreprise - SÉCURISÉ';
COMMENT ON FUNCTION public.generate_accounting_entry(UUID, UUID, TEXT, JSON) IS 'Génère une écriture comptable à partir de données JSON - SÉCURISÉ';
COMMENT ON FUNCTION public.post_accounting_entry(UUID) IS 'Poste une écriture comptable après vérification - SÉCURISÉ';
