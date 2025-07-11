-- Script SQL à exécuter MANUELLEMENT dans le SQL Editor de Supabase
-- Date: 2025-07-11
-- Ce script corrige définitivement les avertissements de sécurité

-- 1. Supprimer et recréer les fonctions avec search_path fixe
-- ==========================================================

-- Supprimer d'abord les triggers qui dépendent des fonctions
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

-- Supprimer les policies qui dépendent des fonctions
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Only owners can update company" ON public.companies;
DROP POLICY IF EXISTS "Users can view profiles from their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only owners can manage all profiles in their company" ON public.profiles;

-- Maintenant supprimer les fonctions
DROP FUNCTION IF EXISTS public.get_user_company_id();
DROP FUNCTION IF EXISTS public.has_role(public.user_role);
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_last_login();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recréer les fonctions avec search_path fixe
CREATE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = required_role
  );
$$;

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_data RECORD;
BEGIN
  -- Validation des données d'entrée
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Si c'est une inscription d'entreprise (données dans raw_user_meta_data)
  IF NEW.raw_user_meta_data ? 'company_name' THEN
    -- Validation des données d'entreprise
    IF NEW.raw_user_meta_data->>'company_name' IS NULL OR NEW.raw_user_meta_data->>'company_name' = '' THEN
      RAISE EXCEPTION 'Company name is required';
    END IF;
    
    IF NEW.raw_user_meta_data->>'first_name' IS NULL OR NEW.raw_user_meta_data->>'first_name' = '' THEN
      RAISE EXCEPTION 'First name is required';
    END IF;
    
    IF NEW.raw_user_meta_data->>'last_name' IS NULL OR NEW.raw_user_meta_data->>'last_name' = '' THEN
      RAISE EXCEPTION 'Last name is required';
    END IF;

    -- Créer l'entreprise avec validation
    INSERT INTO public.companies (name, email)
    VALUES (
      TRIM(NEW.raw_user_meta_data->>'company_name'),
      LOWER(TRIM(NEW.email))
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING * INTO company_data;
    
    -- Si l'entreprise n'a pas été créée (conflit), la récupérer
    IF company_data.id IS NULL THEN
      SELECT * INTO company_data FROM public.companies WHERE name = TRIM(NEW.raw_user_meta_data->>'company_name');
    END IF;
    
    -- Créer le profil propriétaire
    INSERT INTO public.profiles (
      user_id,
      company_id,
      email,
      first_name,
      last_name,
      role
    )
    VALUES (
      NEW.id,
      company_data.id,
      LOWER(TRIM(NEW.email)),
      TRIM(NEW.raw_user_meta_data->>'first_name'),
      TRIM(NEW.raw_user_meta_data->>'last_name'),
      'owner'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Recréer les triggers
-- =======================

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();

-- 3. Recréer les policies RLS
-- ===========================

CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (id = public.get_user_company_id());

CREATE POLICY "Only owners can update company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (id = public.get_user_company_id() AND public.has_role('owner'));

CREATE POLICY "Users can view profiles from their company"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Only owners can manage all profiles in their company"
  ON public.profiles FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND public.has_role('owner'));

-- 4. Vérification finale
-- ======================

DO $$
DECLARE
  func_record RECORD;
  all_secure BOOLEAN := true;
BEGIN
  RAISE NOTICE 'Vérification finale des fonctions de sécurité...';
  
  FOR func_record IN 
    SELECT proname, prosrc 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' 
    AND proname IN ('get_user_company_id', 'has_role', 'update_updated_at_column', 'update_last_login', 'handle_new_user')
  LOOP
    IF func_record.prosrc LIKE '%SET search_path = public%' THEN
      RAISE NOTICE '✅ %: Sécurisé', func_record.proname;
    ELSE
      RAISE NOTICE '❌ %: NON SÉCURISÉ', func_record.proname;
      all_secure := false;
    END IF;
  END LOOP;
  
  IF all_secure THEN
    RAISE NOTICE '🎉 Toutes les fonctions sont maintenant sécurisées!';
  ELSE
    RAISE NOTICE '⚠️  Certaines fonctions ne sont pas sécurisées.';
  END IF;
END;
$$; 