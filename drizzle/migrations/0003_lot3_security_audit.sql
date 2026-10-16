-- LOT 3 — Sécurité multi-tenant

-- 1. Seul le propriétaire installe/désinstalle des modules
DROP POLICY IF EXISTS "Owners and managers can manage modules" ON public.company_modules;
DROP POLICY IF EXISTS "Owners and managers can update modules" ON public.company_modules;
CREATE POLICY "Owners can install modules" ON public.company_modules FOR INSERT TO authenticated
  WITH CHECK (company_id = (SELECT public.get_user_company_id()) AND public.has_role(auth.uid(),'owner'));
CREATE POLICY "Owners can update modules" ON public.company_modules FOR UPDATE TO authenticated
  USING (company_id = (SELECT public.get_user_company_id()) AND public.has_role(auth.uid(),'owner'))
  WITH CHECK (company_id = (SELECT public.get_user_company_id()));

-- 2. Un utilisateur ne peut jamais changer son company_id (même via son profil)
CREATE OR REPLACE FUNCTION public.protect_profile_company()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.company_id IS DISTINCT FROM OLD.company_id AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Changement de société interdit.';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Identifiant utilisateur non modifiable.';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_protect_profile_company BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_company();

-- Un rôle ne peut pas être déplacé vers une autre société ni attribué hors de sa société
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF; -- trigger d'inscription / fonctions serveur
  IF TG_OP = 'UPDATE' AND (NEW.company_id <> OLD.company_id OR NEW.user_id <> OLD.user_id) THEN
    RAISE EXCEPTION 'Rôle : société ou utilisateur non modifiable.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.user_id AND company_id = NEW.company_id) THEN
    RAISE EXCEPTION 'Cet utilisateur n''appartient pas à votre société.';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_protect_user_role BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_user_role();

-- 3. Journal d'audit réel
CREATE TABLE public.audit_log (
  id bigserial PRIMARY KEY,
  company_id uuid NOT NULL,
  user_id uuid,
  user_email text,
  table_name text NOT NULL,
  record_id text,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  changed_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Propriétaire et gérant lisent l'audit" ON public.audit_log FOR SELECT TO authenticated
  USING (company_id = (SELECT public.get_user_company_id())
         AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'manager')));
CREATE INDEX idx_audit_company_date ON public.audit_log(company_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_new jsonb; v_old jsonb; v_diff jsonb; v_company uuid; v_id text;
BEGIN
  v_new := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END;
  v_old := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END;
  v_company := COALESCE((v_new->>'company_id')::uuid, (v_old->>'company_id')::uuid);
  IF v_company IS NULL THEN RETURN NULL; END IF;
  v_id := COALESCE(v_new->>'id', v_old->>'id');
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(k, jsonb_build_object('avant', v_old->k, 'apres', v_new->k)) INTO v_diff
    FROM jsonb_object_keys(v_new) k
    WHERE v_new->k IS DISTINCT FROM v_old->k AND k NOT IN ('updated_at','updated_by');
    IF v_diff IS NULL THEN RETURN NULL; END IF;
  ELSE
    v_diff := COALESCE(v_new, v_old);
  END IF;
  INSERT INTO public.audit_log (company_id, user_id, user_email, table_name, record_id, action, changed_fields)
  VALUES (v_company, auth.uid(), (SELECT email FROM public.profiles WHERE user_id = auth.uid()),
          TG_TABLE_NAME, v_id, TG_OP, v_diff);
  RETURN NULL;
END; $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','orders','payments','customer_invoices','credit_notes','journal_entries',
    'products','suppliers','purchase_orders','receptions','employees','treasury_accounts','treasury_movements',
    'user_roles','company_modules','companies','fiscal_years','fixed_assets'] LOOP
    EXECUTE format('CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_trigger()', t);
  END LOOP;
END $$;

-- companies n'a pas de company_id : audit spécifique
CREATE OR REPLACE FUNCTION public.audit_company()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.audit_log (company_id, user_id, user_email, table_name, record_id, action, changed_fields)
  VALUES (NEW.id, auth.uid(), (SELECT email FROM public.profiles WHERE user_id = auth.uid()),
          'companies', NEW.id::text, TG_OP, to_jsonb(NEW));
  RETURN NULL;
END; $$;
DROP TRIGGER IF EXISTS trg_audit ON public.companies;
CREATE TRIGGER trg_audit AFTER UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.audit_company();

-- 4. Index manquants
CREATE INDEX IF NOT EXISTS idx_payments_company ON public.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(company_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_orders_due ON public.orders(company_id, due_date);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_jel_company ON public.journal_entry_lines(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_company ON public.bank_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_reconc_company ON public.bank_reconciliations(company_id);
CREATE INDEX IF NOT EXISTS idx_treasury_mov_date ON public.treasury_movements(company_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_credit_notes_company ON public.credit_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice ON public.credit_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON public.invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_measurements_company ON public.client_measurements(company_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_emp ON public.work_hours(employee_id, work_date);