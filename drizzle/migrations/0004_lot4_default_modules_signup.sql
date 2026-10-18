CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_company_id uuid;
  v_company_name text;
  v_first_name text;
  v_last_name text;
BEGIN
  v_company_name := COALESCE(new.raw_user_meta_data->>'company_name', 'Mon Atelier');
  v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', 'Utilisateur');
  v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');

  INSERT INTO public.companies (name, email)
  VALUES (v_company_name, new.email)
  RETURNING id INTO new_company_id;

  INSERT INTO public.profiles (user_id, email, first_name, last_name, company_id, is_active)
  VALUES (new.id, new.email, v_first_name, v_last_name, new_company_id, true);

  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (new.id, new_company_id, 'owner');

  -- Modules essentiels installés d'office (style Odoo : apps de base)
  INSERT INTO public.company_modules (company_id, module_key, is_enabled, enabled_by)
  SELECT new_company_id, m.key, true, new.id
  FROM (VALUES
    ('clients'), ('orders'), ('measurements'), ('patterns'),
    ('stocks'), ('customer_invoices'), ('alerts'), ('reports')
  ) AS m(key);

  -- Plan comptable et journaux SYSCOHADA prêts à l'emploi
  PERFORM public.ensure_accounting_setup(new_company_id);

  RETURN new;
END;
$function$;