-- Correction finale du search_path pour generate_accounting_entry

-- Supprimer les deux versions de la fonction
DROP FUNCTION IF EXISTS public.generate_accounting_entry(uuid, journal_type, text, text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.generate_accounting_entry(uuid, uuid, text, json);

-- Recréer la première version avec search_path fixe
CREATE OR REPLACE FUNCTION public.generate_accounting_entry(
  p_company_id uuid, 
  p_journal_type journal_type, 
  p_description text, 
  p_source_type text, 
  p_source_id uuid, 
  p_entries jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Recréer la deuxième version avec search_path fixe
CREATE OR REPLACE FUNCTION public.generate_accounting_entry(
  p_company_id uuid, 
  p_journal_id uuid, 
  p_description text, 
  p_entries json
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;