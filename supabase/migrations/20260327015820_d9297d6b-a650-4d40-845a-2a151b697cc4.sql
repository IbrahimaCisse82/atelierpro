
-- 1. Fix handle_new_user trigger to match actual schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_company_id uuid;
  v_company_name text;
  v_first_name text;
  v_last_name text;
BEGIN
  v_company_name := COALESCE(new.raw_user_meta_data->>'company_name', 'Mon Atelier');
  v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', 'Utilisateur');
  v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');

  -- Create company
  INSERT INTO public.companies (name, email)
  VALUES (v_company_name, new.email)
  RETURNING id INTO new_company_id;

  -- Create profile
  INSERT INTO public.profiles (user_id, email, first_name, last_name, company_id, is_active)
  VALUES (new.id, new.email, v_first_name, v_last_name, new_company_id, true);

  -- Assign owner role
  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (new.id, new_company_id, 'owner');

  RETURN new;
END;
$$;

-- 2. Ensure trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Fix treasury default currency to XOF
ALTER TABLE public.treasury_accounts ALTER COLUMN currency SET DEFAULT 'XOF';
