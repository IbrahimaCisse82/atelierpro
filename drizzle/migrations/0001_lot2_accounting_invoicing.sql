-- LOT 2 — Comptabilité SYSCOHADA et facturation

-- 1. Compteurs de numérotation continue sans trou (verrou de ligne)
CREATE TABLE public.number_counters (
  company_id uuid NOT NULL REFERENCES public.companies(id),
  scope text NOT NULL,
  last_value integer NOT NULL DEFAULT 0,
  PRIMARY KEY (company_id, scope)
);
GRANT SELECT ON public.number_counters TO authenticated;
GRANT ALL ON public.number_counters TO service_role;
ALTER TABLE public.number_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture compteurs société" ON public.number_counters FOR SELECT TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()));

CREATE OR REPLACE FUNCTION public.next_number(p_company_id uuid, p_scope text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v integer;
BEGIN
  INSERT INTO public.number_counters (company_id, scope, last_value)
  VALUES (p_company_id, p_scope, 1)
  ON CONFLICT (company_id, scope) DO UPDATE SET last_value = number_counters.last_value + 1
  RETURNING last_value INTO v;
  RETURN v;
END; $$;
REVOKE EXECUTE ON FUNCTION public.next_number(uuid, text) FROM PUBLIC, anon, authenticated;

-- 2. Exercices comptables
CREATE TABLE public.fiscal_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  closed_at timestamptz,
  closed_by uuid,
  net_result numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date > start_date),
  UNIQUE (company_id, name)
);
GRANT SELECT, INSERT, UPDATE ON public.fiscal_years TO authenticated;
GRANT ALL ON public.fiscal_years TO service_role;
ALTER TABLE public.fiscal_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture exercices" ON public.fiscal_years FOR SELECT TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()));
CREATE POLICY "Création exercices" ON public.fiscal_years FOR INSERT TO authenticated
  WITH CHECK (company_id = (SELECT public.get_user_company_id()) AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'manager')));
CREATE POLICY "Modification exercices ouverts" ON public.fiscal_years FOR UPDATE TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()) AND status = 'open' AND public.has_role(auth.uid(),'owner'))
  WITH CHECK (company_id = (SELECT public.get_user_company_id()));

-- 3. Statut des écritures + numérotation
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS fiscal_year_id uuid REFERENCES public.fiscal_years(id);
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS source_type text;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS source_id uuid;
ALTER TABLE public.journal_entry_lines ADD CONSTRAINT jel_amounts_valid
  CHECK (debit_amount >= 0 AND credit_amount >= 0 AND NOT (debit_amount > 0 AND credit_amount > 0));

CREATE OR REPLACE FUNCTION public.journal_entry_before_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_code text; v_fy RECORD;
BEGIN
  SELECT journal_code INTO v_code FROM public.accounting_journals WHERE id = NEW.journal_id;
  NEW.entry_number := v_code || '-' || to_char(NEW.entry_date, 'YYYY') || '-' ||
    lpad(public.next_number(NEW.company_id, 'journal:' || NEW.journal_id::text || ':' || to_char(NEW.entry_date,'YYYY'))::text, 5, '0');
  SELECT * INTO v_fy FROM public.fiscal_years
   WHERE company_id = NEW.company_id AND NEW.entry_date BETWEEN start_date AND end_date LIMIT 1;
  IF FOUND THEN
    IF v_fy.status = 'closed' THEN
      RAISE EXCEPTION 'Exercice % clôturé : aucune écriture possible.', v_fy.name;
    END IF;
    NEW.fiscal_year_id := v_fy.id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_journal_entry_before_insert BEFORE INSERT ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.journal_entry_before_insert();

-- 4. Écriture validée = immuable
CREATE OR REPLACE FUNCTION public.protect_posted_entry()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_posted THEN RAISE EXCEPTION 'Écriture validée : suppression interdite (passez une contre-écriture).'; END IF;
    RETURN OLD;
  END IF;
  IF OLD.is_posted THEN
    RAISE EXCEPTION 'Écriture validée : modification interdite (passez une contre-écriture).';
  END IF;
  IF NEW.is_posted AND NOT OLD.is_posted THEN
    NEW.posted_at := now();
    NEW.posted_by := COALESCE(NEW.posted_by, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_protect_posted_entry BEFORE UPDATE OR DELETE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.protect_posted_entry();

CREATE OR REPLACE FUNCTION public.protect_posted_lines()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v_posted boolean;
BEGIN
  SELECT is_posted INTO v_posted FROM public.journal_entries
   WHERE id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);
  -- Autorise l'insertion des lignes dans la même transaction que la validation automatique
  IF v_posted AND current_setting('app.posting', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Lignes d''une écriture validée : modification interdite.';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.journal_entry_id <> NEW.journal_entry_id THEN
    SELECT is_posted INTO v_posted FROM public.journal_entries WHERE id = OLD.journal_entry_id;
    IF v_posted THEN RAISE EXCEPTION 'Lignes d''une écriture validée : modification interdite.'; END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER trg_protect_posted_lines BEFORE INSERT OR UPDATE OR DELETE ON public.journal_entry_lines
FOR EACH ROW EXECUTE FUNCTION public.protect_posted_lines();

-- 5. Contrôle d'équilibre différé (fin de transaction)
CREATE OR REPLACE FUNCTION public.check_entry_balance_deferred()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_id uuid; v_posted boolean; v_d numeric; v_c numeric;
BEGIN
  IF TG_TABLE_NAME = 'journal_entries' THEN v_id := NEW.id;
  ELSE v_id := COALESCE(NEW.journal_entry_id, OLD.journal_entry_id); END IF;
  SELECT is_posted INTO v_posted FROM public.journal_entries WHERE id = v_id;
  IF v_posted THEN
    SELECT COALESCE(SUM(debit_amount),0), COALESCE(SUM(credit_amount),0) INTO v_d, v_c
      FROM public.journal_entry_lines WHERE journal_entry_id = v_id;
    IF v_d <> v_c THEN
      RAISE EXCEPTION 'Écriture déséquilibrée : débit % ≠ crédit %.', v_d, v_c;
    END IF;
    IF v_d = 0 THEN RAISE EXCEPTION 'Écriture vide : montant nul.'; END IF;
  END IF;
  RETURN NULL;
END; $$;
CREATE CONSTRAINT TRIGGER trg_entry_balance_deferred AFTER INSERT OR UPDATE ON public.journal_entries
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.check_entry_balance_deferred();
CREATE CONSTRAINT TRIGGER trg_lines_balance_deferred AFTER INSERT OR UPDATE OR DELETE ON public.journal_entry_lines
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.check_entry_balance_deferred();
DROP TRIGGER IF EXISTS trg_validate_journal_balance ON public.journal_entries;

-- 6. Factures : statut, numérotation, verrouillage
ALTER TABLE public.customer_invoices ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft','validated','cancelled'));
ALTER TABLE public.customer_invoices ADD COLUMN IF NOT EXISTS validated_at timestamptz;
ALTER TABLE public.customer_invoices ALTER COLUMN invoice_number SET DEFAULT 'BROUILLON';

CREATE TABLE public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  invoice_id uuid NOT NULL REFERENCES public.customer_invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  tax_rate numeric NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
  line_total numeric GENERATED ALWAYS AS (round(quantity * unit_price)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_lines TO authenticated;
GRANT ALL ON public.invoice_lines TO service_role;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lignes facture société" ON public.invoice_lines FOR ALL TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()))
  WITH CHECK (company_id = (SELECT public.get_user_company_id()));

CREATE TABLE public.credit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  credit_note_number text NOT NULL DEFAULT 'BROUILLON',
  invoice_id uuid NOT NULL REFERENCES public.customer_invoices(id),
  credit_date date NOT NULL DEFAULT CURRENT_DATE,
  reason text NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  tax_amount numeric NOT NULL DEFAULT 0,
  total_with_tax numeric NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.credit_notes TO authenticated;
GRANT ALL ON public.credit_notes TO service_role;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture avoirs" ON public.credit_notes FOR SELECT TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()));
CREATE POLICY "Création avoirs" ON public.credit_notes FOR INSERT TO authenticated
  WITH CHECK (company_id = (SELECT public.get_user_company_id()) AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'manager')));

CREATE TABLE public.credit_note_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  credit_note_id uuid NOT NULL REFERENCES public.credit_notes(id),
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  line_total numeric GENERATED ALWAYS AS (round(quantity * unit_price)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.credit_note_lines TO authenticated;
GRANT ALL ON public.credit_note_lines TO service_role;
ALTER TABLE public.credit_note_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lignes avoir société" ON public.credit_note_lines FOR SELECT TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()));
CREATE POLICY "Création lignes avoir" ON public.credit_note_lines FOR INSERT TO authenticated
  WITH CHECK (company_id = (SELECT public.get_user_company_id()));

-- 7. Comptes et journaux par défaut (créés à la demande)
CREATE OR REPLACE FUNCTION public.ensure_accounting_setup(p_company_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.syscohada_accounts WHERE company_id = p_company_id) THEN
    PERFORM public.seed_syscohada_accounts(p_company_id, NULL);
  END IF;
  INSERT INTO public.accounting_journals (company_id, journal_code, journal_name, journal_type, is_system_journal)
  VALUES (p_company_id,'VT','Journal des ventes','sales',true),
         (p_company_id,'AC','Journal des achats','purchases',true),
         (p_company_id,'CA','Journal de caisse','cash',true),
         (p_company_id,'OD','Opérations diverses','general',true)
  ON CONFLICT (company_id, journal_code) DO NOTHING;
END; $$;
REVOKE EXECUTE ON FUNCTION public.ensure_accounting_setup(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.post_entry(
  p_company_id uuid, p_journal_code text, p_date date, p_description text,
  p_source_type text, p_source_id uuid, p_lines jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_journal uuid; v_entry uuid; l jsonb; v_acc uuid;
BEGIN
  PERFORM public.ensure_accounting_setup(p_company_id);
  SELECT id INTO v_journal FROM public.accounting_journals WHERE company_id = p_company_id AND journal_code = p_journal_code;
  INSERT INTO public.journal_entries (company_id, journal_id, entry_number, entry_date, description, is_posted, source_type, source_id)
  VALUES (p_company_id, v_journal, 'AUTO', p_date, p_description, false, p_source_type, p_source_id)
  RETURNING id INTO v_entry;
  FOR l IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    SELECT id INTO v_acc FROM public.syscohada_accounts WHERE company_id = p_company_id AND account_number = l->>'account';
    IF v_acc IS NULL THEN RAISE EXCEPTION 'Compte % absent du plan comptable.', l->>'account'; END IF;
    INSERT INTO public.journal_entry_lines (company_id, journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (p_company_id, v_entry, v_acc, COALESCE((l->>'debit')::numeric,0), COALESCE((l->>'credit')::numeric,0), p_description);
  END LOOP;
  UPDATE public.journal_entries SET is_posted = true WHERE id = v_entry;
  RETURN v_entry;
END; $$;
REVOKE EXECUTE ON FUNCTION public.post_entry(uuid,text,date,text,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;

-- 8. Facture : numéro attribué à la validation, verrouillage, écritures automatiques
CREATE OR REPLACE FUNCTION public.invoice_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'validated' THEN
      NEW.invoice_number := 'FAC-' || to_char(NEW.invoice_date,'YYYY') || '-' ||
        lpad(public.next_number(NEW.company_id, 'invoice:' || to_char(NEW.invoice_date,'YYYY'))::text, 5, '0');
      NEW.validated_at := now();
    ELSE
      NEW.invoice_number := 'BROUILLON';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'draft' THEN RAISE EXCEPTION 'Facture validée : suppression interdite, émettez un avoir.'; END IF;
    RETURN OLD;
  END IF;

  -- UPDATE
  IF OLD.status = 'draft' AND NEW.status = 'validated' THEN
    NEW.invoice_number := 'FAC-' || to_char(NEW.invoice_date,'YYYY') || '-' ||
      lpad(public.next_number(NEW.company_id, 'invoice:' || to_char(NEW.invoice_date,'YYYY'))::text, 5, '0');
    NEW.validated_at := now();
  ELSIF OLD.status = 'validated' THEN
    IF NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
       OR NEW.invoice_date IS DISTINCT FROM OLD.invoice_date
       OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
       OR NEW.tax_amount IS DISTINCT FROM OLD.tax_amount
       OR NEW.total_with_tax IS DISTINCT FROM OLD.total_with_tax
       OR NEW.order_id IS DISTINCT FROM OLD.order_id
       OR NEW.status = 'draft' THEN
      RAISE EXCEPTION 'Facture validée non modifiable : émettez un avoir.';
    END IF;
  ELSIF OLD.status = 'draft' AND NEW.is_paid THEN
    RAISE EXCEPTION 'Validez la facture avant de l''encaisser.';
  END IF;
  IF NEW.is_paid AND NOT OLD.is_paid THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_invoice_lifecycle BEFORE INSERT OR UPDATE OR DELETE ON public.customer_invoices
FOR EACH ROW EXECUTE FUNCTION public.invoice_lifecycle();

CREATE OR REPLACE FUNCTION public.invoice_accounting()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_lines jsonb; v_cash text;
BEGIN
  -- Vente : 411 au débit / 706 (+ 443 TVA) au crédit
  IF NEW.status = 'validated' AND (TG_OP = 'INSERT' OR OLD.status <> 'validated') THEN
    v_lines := jsonb_build_array(
      jsonb_build_object('account','411','debit',NEW.total_with_tax),
      jsonb_build_object('account','706','credit',NEW.total_amount));
    IF NEW.tax_amount > 0 THEN
      v_lines := v_lines || jsonb_build_array(jsonb_build_object('account','443','credit',NEW.tax_amount));
    END IF;
    PERFORM public.post_entry(NEW.company_id,'VT',NEW.invoice_date,'Facture '||NEW.invoice_number,'invoice',NEW.id,v_lines);
  END IF;
  -- Encaissement : trésorerie au débit / 411 au crédit
  IF NEW.is_paid AND (TG_OP = 'INSERT' OR NOT OLD.is_paid) AND NEW.status = 'validated' THEN
    v_cash := CASE WHEN NEW.payment_method IN ('bank','virement','cheque','card') THEN '521'
                   WHEN NEW.payment_method IN ('mobile_money','wave','orange_money') THEN '55'
                   ELSE '571' END;
    PERFORM public.post_entry(NEW.company_id,'CA',COALESCE(NEW.paid_at::date,CURRENT_DATE),
      'Encaissement '||NEW.invoice_number,'invoice_payment',NEW.id,
      jsonb_build_array(jsonb_build_object('account',v_cash,'debit',NEW.total_with_tax),
                        jsonb_build_object('account','411','credit',NEW.total_with_tax)));
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_invoice_accounting AFTER INSERT OR UPDATE ON public.customer_invoices
FOR EACH ROW EXECUTE FUNCTION public.invoice_accounting();

-- Lignes d'une facture validée : verrouillées
CREATE OR REPLACE FUNCTION public.protect_invoice_lines()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.customer_invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  IF v_status <> 'draft' THEN RAISE EXCEPTION 'Facture validée : lignes non modifiables.'; END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER trg_protect_invoice_lines BEFORE INSERT OR UPDATE OR DELETE ON public.invoice_lines
FOR EACH ROW EXECUTE FUNCTION public.protect_invoice_lines();

-- Avoir : numéro + contrôle + écriture inverse
CREATE OR REPLACE FUNCTION public.credit_note_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_inv RECORD; v_already numeric;
BEGIN
  SELECT * INTO v_inv FROM public.customer_invoices WHERE id = NEW.invoice_id;
  IF v_inv.status <> 'validated' THEN RAISE EXCEPTION 'Un avoir ne s''applique qu''à une facture validée.'; END IF;
  SELECT COALESCE(SUM(total_with_tax),0) INTO v_already FROM public.credit_notes WHERE invoice_id = NEW.invoice_id;
  IF v_already + NEW.total_with_tax > v_inv.total_with_tax THEN
    RAISE EXCEPTION 'Avoir supérieur au montant restant de la facture.';
  END IF;
  NEW.company_id := v_inv.company_id;
  NEW.created_by := COALESCE(NEW.created_by, auth.uid());
  NEW.credit_note_number := 'AV-' || to_char(NEW.credit_date,'YYYY') || '-' ||
    lpad(public.next_number(NEW.company_id, 'credit_note:' || to_char(NEW.credit_date,'YYYY'))::text, 5, '0');
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_credit_note_lifecycle BEFORE INSERT ON public.credit_notes
FOR EACH ROW EXECUTE FUNCTION public.credit_note_lifecycle();

CREATE OR REPLACE FUNCTION public.credit_note_accounting()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_lines jsonb;
BEGIN
  v_lines := jsonb_build_array(
    jsonb_build_object('account','706','debit',NEW.total_amount),
    jsonb_build_object('account','411','credit',NEW.total_with_tax));
  IF NEW.tax_amount > 0 THEN
    v_lines := v_lines || jsonb_build_array(jsonb_build_object('account','443','debit',NEW.tax_amount));
  END IF;
  PERFORM public.post_entry(NEW.company_id,'VT',NEW.credit_date,'Avoir '||NEW.credit_note_number,'credit_note',NEW.id,v_lines);
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_credit_note_accounting AFTER INSERT ON public.credit_notes
FOR EACH ROW EXECUTE FUNCTION public.credit_note_accounting();

-- Lignes d'avoir et avoirs : immuables
CREATE OR REPLACE FUNCTION public.forbid_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Document comptable définitif : modification interdite.'; END; $$;
CREATE TRIGGER trg_credit_notes_immutable BEFORE UPDATE OR DELETE ON public.credit_notes
FOR EACH ROW EXECUTE FUNCTION public.forbid_change();

-- 9. Clôture d'exercice avec report à nouveau
CREATE OR REPLACE FUNCTION public.close_fiscal_year(p_fiscal_year_id uuid)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_fy RECORD; v_result numeric; v_next uuid;
BEGIN
  SELECT * INTO v_fy FROM public.fiscal_years WHERE id = p_fiscal_year_id FOR UPDATE;
  IF v_fy.company_id <> public.get_user_company_id() OR NOT public.has_role(auth.uid(),'owner') THEN
    RAISE EXCEPTION 'Seul le propriétaire peut clôturer l''exercice.';
  END IF;
  IF v_fy.status = 'closed' THEN RAISE EXCEPTION 'Exercice déjà clôturé.'; END IF;
  IF EXISTS (SELECT 1 FROM public.journal_entries WHERE company_id = v_fy.company_id
             AND entry_date BETWEEN v_fy.start_date AND v_fy.end_date AND NOT is_posted) THEN
    RAISE EXCEPTION 'Des écritures en brouillon restent dans l''exercice.';
  END IF;
  -- Résultat = produits (7, 8x produits) - charges (6, 8x charges)
  SELECT COALESCE(SUM(l.credit_amount - l.debit_amount),0) INTO v_result
  FROM public.journal_entry_lines l
  JOIN public.journal_entries e ON e.id = l.journal_entry_id
  JOIN public.syscohada_accounts a ON a.id = l.account_id
  WHERE e.company_id = v_fy.company_id AND e.entry_date BETWEEN v_fy.start_date AND v_fy.end_date
    AND left(a.account_number,1) IN ('6','7','8');

  UPDATE public.fiscal_years SET status = 'closed', closed_at = now(), closed_by = auth.uid(), net_result = v_result
   WHERE id = p_fiscal_year_id;

  -- Nouvel exercice + report à nouveau (compte 12)
  INSERT INTO public.fiscal_years (company_id, name, start_date, end_date)
  VALUES (v_fy.company_id, to_char(v_fy.end_date + 1,'YYYY'), v_fy.end_date + 1, (v_fy.end_date + interval '1 year')::date)
  ON CONFLICT (company_id, name) DO NOTHING;
  IF v_result <> 0 THEN
    PERFORM public.post_entry(v_fy.company_id,'OD',v_fy.end_date + 1,'Report à nouveau '||v_fy.name,'carry_forward',v_fy.id,
      CASE WHEN v_result > 0
        THEN jsonb_build_array(jsonb_build_object('account','13','debit',v_result), jsonb_build_object('account','12','credit',v_result))
        ELSE jsonb_build_array(jsonb_build_object('account','12','debit',-v_result), jsonb_build_object('account','13','credit',-v_result)) END);
  END IF;
  RETURN v_result;
END; $$;
REVOKE EXECUTE ON FUNCTION public.close_fiscal_year(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.close_fiscal_year(uuid) TO authenticated;

-- 10. Écritures : policies RLS (pas de modification d'écriture validée)
DROP POLICY IF EXISTS "Users can update journal entries in their company" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete journal entries in their company" ON public.journal_entries;
CREATE POLICY "Modification écritures brouillon" ON public.journal_entries FOR UPDATE TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()) AND is_posted = false)
  WITH CHECK (company_id = (SELECT public.get_user_company_id()));
CREATE POLICY "Suppression écritures brouillon" ON public.journal_entries FOR DELETE TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()) AND is_posted = false);

CREATE INDEX IF NOT EXISTS idx_journal_entries_company_date ON public.journal_entries(company_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_jel_entry ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_date ON public.customer_invoices(company_id, invoice_date);
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoice_number ON public.customer_invoices(company_id, invoice_number) WHERE invoice_number <> 'BROUILLON';