
-- 1. Migrate existing account_type values to SYSCOHADA classes
UPDATE public.syscohada_accounts SET account_type = 'classe_1' WHERE account_number LIKE '1%' AND account_type IN ('equity','liability');
UPDATE public.syscohada_accounts SET account_type = 'classe_2' WHERE account_number LIKE '2%' AND account_type = 'asset';
UPDATE public.syscohada_accounts SET account_type = 'classe_3' WHERE account_number LIKE '3%' AND account_type = 'asset';
UPDATE public.syscohada_accounts SET account_type = 'classe_4' WHERE account_number LIKE '4%' AND account_type IN ('asset','liability');
UPDATE public.syscohada_accounts SET account_type = 'classe_5' WHERE account_number LIKE '5%' AND account_type = 'asset';
UPDATE public.syscohada_accounts SET account_type = 'classe_6' WHERE account_number LIKE '6%' AND account_type = 'expense';
UPDATE public.syscohada_accounts SET account_type = 'classe_7' WHERE account_number LIKE '7%' AND account_type = 'revenue';
UPDATE public.syscohada_accounts SET account_type = 'classe_8' WHERE account_number LIKE '8%';
UPDATE public.syscohada_accounts SET account_type = 'classe_9' WHERE account_number LIKE '9%';

-- Catch-all: auto-detect from first digit for any remaining
UPDATE public.syscohada_accounts 
SET account_type = 'classe_' || LEFT(account_number, 1)
WHERE account_type NOT LIKE 'classe_%' AND LEFT(account_number, 1) BETWEEN '1' AND '9';

-- 2. Function to auto-detect SYSCOHADA class from account number
CREATE OR REPLACE FUNCTION public.get_syscohada_class(p_account_number text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN LEFT(p_account_number, 1) = '1' THEN 'classe_1'
    WHEN LEFT(p_account_number, 1) = '2' THEN 'classe_2'
    WHEN LEFT(p_account_number, 1) = '3' THEN 'classe_3'
    WHEN LEFT(p_account_number, 1) = '4' THEN 'classe_4'
    WHEN LEFT(p_account_number, 1) = '5' THEN 'classe_5'
    WHEN LEFT(p_account_number, 1) = '6' THEN 'classe_6'
    WHEN LEFT(p_account_number, 1) = '7' THEN 'classe_7'
    WHEN LEFT(p_account_number, 1) = '8' THEN 'classe_8'
    WHEN LEFT(p_account_number, 1) = '9' THEN 'classe_9'
    ELSE 'autre'
  END;
$$;

-- 3. Auto-set account_type on insert/update based on account_number
CREATE OR REPLACE FUNCTION public.auto_set_syscohada_class()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.account_type := get_syscohada_class(NEW.account_number);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_syscohada_class
  BEFORE INSERT OR UPDATE ON public.syscohada_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_syscohada_class();

-- 4. Validation trigger: debit = credit on journal entry posting
CREATE OR REPLACE FUNCTION public.validate_journal_entry_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_debit numeric;
  v_total_credit numeric;
BEGIN
  -- Only validate when posting (is_posted changes to true)
  IF NEW.is_posted = true AND (OLD.is_posted IS NULL OR OLD.is_posted = false) THEN
    SELECT COALESCE(SUM(debit_amount), 0), COALESCE(SUM(credit_amount), 0)
    INTO v_total_debit, v_total_credit
    FROM public.journal_entry_lines
    WHERE journal_entry_id = NEW.id;

    IF v_total_debit != v_total_credit THEN
      RAISE EXCEPTION 'Écriture déséquilibrée : débit (%) ≠ crédit (%). L''écriture ne peut pas être validée.', v_total_debit, v_total_credit;
    END IF;

    IF v_total_debit = 0 THEN
      RAISE EXCEPTION 'L''écriture ne contient aucune ligne. Ajoutez au moins une ligne débit et crédit.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_journal_balance
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_journal_entry_balance();

-- 5. Function to seed standard SYSCOHADA chart of accounts for a company
CREATE OR REPLACE FUNCTION public.seed_syscohada_accounts(p_company_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  v_accounts text[][] := ARRAY[
    -- Classe 1: Ressources durables
    ARRAY['10', 'Capital', 'classe_1', 'Capitaux propres'],
    ARRAY['101', 'Capital social', 'classe_1', 'Capitaux propres'],
    ARRAY['104', 'Compte de l''exploitant', 'classe_1', 'Capitaux propres'],
    ARRAY['11', 'Réserves', 'classe_1', 'Capitaux propres'],
    ARRAY['12', 'Report à nouveau', 'classe_1', 'Capitaux propres'],
    ARRAY['13', 'Résultat net de l''exercice', 'classe_1', 'Capitaux propres'],
    ARRAY['16', 'Emprunts et dettes assimilées', 'classe_1', 'Dettes financières'],
    ARRAY['17', 'Dettes de crédit-bail', 'classe_1', 'Dettes financières'],
    -- Classe 2: Actif immobilisé
    ARRAY['21', 'Immobilisations incorporelles', 'classe_2', 'Immobilisations'],
    ARRAY['22', 'Terrains', 'classe_2', 'Immobilisations'],
    ARRAY['23', 'Bâtiments', 'classe_2', 'Immobilisations'],
    ARRAY['24', 'Matériel et mobilier', 'classe_2', 'Immobilisations'],
    ARRAY['28', 'Amortissements', 'classe_2', 'Amortissements'],
    ARRAY['29', 'Dépréciations', 'classe_2', 'Dépréciations'],
    -- Classe 3: Stocks
    ARRAY['31', 'Marchandises', 'classe_3', 'Stocks'],
    ARRAY['32', 'Matières premières', 'classe_3', 'Stocks'],
    ARRAY['33', 'Autres approvisionnements', 'classe_3', 'Stocks'],
    ARRAY['34', 'Produits en cours', 'classe_3', 'En-cours'],
    ARRAY['35', 'Services en cours', 'classe_3', 'En-cours'],
    ARRAY['36', 'Produits finis', 'classe_3', 'Stocks'],
    ARRAY['37', 'Produits intermédiaires et résiduels', 'classe_3', 'Stocks'],
    -- Classe 4: Tiers
    ARRAY['40', 'Fournisseurs et comptes rattachés', 'classe_4', 'Fournisseurs'],
    ARRAY['401', 'Fournisseurs', 'classe_4', 'Fournisseurs'],
    ARRAY['41', 'Clients et comptes rattachés', 'classe_4', 'Clients'],
    ARRAY['411', 'Clients', 'classe_4', 'Clients'],
    ARRAY['42', 'Personnel', 'classe_4', 'Personnel'],
    ARRAY['421', 'Personnel - Rémunérations dues', 'classe_4', 'Personnel'],
    ARRAY['43', 'Organismes sociaux', 'classe_4', 'Organismes sociaux'],
    ARRAY['44', 'État et collectivités publiques', 'classe_4', 'État'],
    ARRAY['441', 'État - Impôts sur les bénéfices', 'classe_4', 'État'],
    ARRAY['443', 'État - TVA facturée', 'classe_4', 'État'],
    ARRAY['445', 'État - TVA récupérable', 'classe_4', 'État'],
    ARRAY['447', 'État - Impôts retenus à la source', 'classe_4', 'État'],
    -- Classe 5: Trésorerie
    ARRAY['52', 'Banques', 'classe_5', 'Banques'],
    ARRAY['521', 'Banques locales', 'classe_5', 'Banques'],
    ARRAY['53', 'Établissements financiers', 'classe_5', 'Établissements financiers'],
    ARRAY['55', 'Instruments de monnaie électronique', 'classe_5', 'Mobile Money'],
    ARRAY['57', 'Caisse', 'classe_5', 'Caisse'],
    ARRAY['571', 'Caisse siège social', 'classe_5', 'Caisse'],
    ARRAY['58', 'Virements internes', 'classe_5', 'Virements'],
    -- Classe 6: Charges
    ARRAY['60', 'Achats', 'classe_6', 'Achats'],
    ARRAY['601', 'Achats de marchandises', 'classe_6', 'Achats'],
    ARRAY['602', 'Achats de matières premières', 'classe_6', 'Achats'],
    ARRAY['61', 'Transports', 'classe_6', 'Services extérieurs'],
    ARRAY['62', 'Services extérieurs A', 'classe_6', 'Services extérieurs'],
    ARRAY['63', 'Services extérieurs B', 'classe_6', 'Services extérieurs'],
    ARRAY['64', 'Impôts et taxes', 'classe_6', 'Impôts et taxes'],
    ARRAY['65', 'Autres charges', 'classe_6', 'Autres charges'],
    ARRAY['66', 'Charges de personnel', 'classe_6', 'Personnel'],
    ARRAY['661', 'Rémunérations du personnel', 'classe_6', 'Personnel'],
    ARRAY['664', 'Charges sociales', 'classe_6', 'Personnel'],
    ARRAY['67', 'Frais financiers', 'classe_6', 'Charges financières'],
    ARRAY['68', 'Dotations aux amortissements', 'classe_6', 'Dotations'],
    ARRAY['69', 'Dotations aux provisions', 'classe_6', 'Dotations'],
    -- Classe 7: Produits
    ARRAY['70', 'Ventes', 'classe_7', 'Ventes'],
    ARRAY['701', 'Ventes de marchandises', 'classe_7', 'Ventes'],
    ARRAY['702', 'Ventes de produits finis', 'classe_7', 'Ventes'],
    ARRAY['706', 'Services vendus', 'classe_7', 'Ventes'],
    ARRAY['71', 'Subventions d''exploitation', 'classe_7', 'Subventions'],
    ARRAY['72', 'Production immobilisée', 'classe_7', 'Production'],
    ARRAY['75', 'Autres produits', 'classe_7', 'Autres produits'],
    ARRAY['77', 'Revenus financiers', 'classe_7', 'Produits financiers'],
    ARRAY['78', 'Transferts de charges', 'classe_7', 'Transferts'],
    ARRAY['79', 'Reprises de provisions', 'classe_7', 'Reprises'],
    -- Classe 8: HAO
    ARRAY['81', 'Valeurs comptables des cessions', 'classe_8', 'HAO Charges'],
    ARRAY['82', 'Produits des cessions d''immobilisations', 'classe_8', 'HAO Produits'],
    ARRAY['83', 'Charges HAO', 'classe_8', 'HAO Charges'],
    ARRAY['84', 'Produits HAO', 'classe_8', 'HAO Produits'],
    ARRAY['85', 'Dotations HAO', 'classe_8', 'HAO Charges'],
    ARRAY['86', 'Reprises HAO', 'classe_8', 'HAO Produits'],
    ARRAY['87', 'Participation des travailleurs', 'classe_8', 'Participation'],
    ARRAY['89', 'Impôts sur le résultat', 'classe_8', 'Impôts']
  ];
  v_row text[];
BEGIN
  FOREACH v_row SLICE 1 IN ARRAY v_accounts LOOP
    INSERT INTO public.syscohada_accounts (
      company_id, account_number, account_name, account_type, account_category,
      is_system_account, is_active, created_by
    ) VALUES (
      p_company_id, v_row[1], v_row[2], v_row[3], v_row[4],
      true, true, p_user_id
    )
    ON CONFLICT DO NOTHING;
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;
