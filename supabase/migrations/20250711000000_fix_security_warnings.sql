-- Migration pour corriger les avertissements de sécurité Supabase
-- Date: 2025-07-11

-- 1. Corriger les fonctions avec search_path mutable
-- ================================================

-- Fonction get_user_company_id avec search_path fixe
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Fonction has_role avec search_path fixe
CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
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

-- Fonction update_updated_at_column avec search_path fixe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

-- Fonction update_last_login avec search_path fixe
CREATE OR REPLACE FUNCTION public.update_last_login()
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

-- 2. Améliorer la sécurité des fonctions existantes
-- ================================================

-- Fonction handle_new_user avec search_path fixe et améliorations
CREATE OR REPLACE FUNCTION public.handle_new_user()
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

-- 3. Ajouter des commentaires pour la documentation
-- ================================================

COMMENT ON FUNCTION public.get_user_company_id() IS 'Returns the company ID of the currently authenticated user. Used for RLS policies.';
COMMENT ON FUNCTION public.has_role(public.user_role) IS 'Checks if the currently authenticated user has the specified role. Used for RLS policies.';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to automatically update the updated_at timestamp column.';
COMMENT ON FUNCTION public.update_last_login() IS 'Trigger function to update the last_login timestamp when a user signs in.';
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to automatically create company and profile when a new user signs up.';

-- 4. Vérification des corrections
-- ==============================

-- Vérifier que toutes les fonctions ont un search_path fixe
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT proname, prosrc 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' 
    AND proname IN ('get_user_company_id', 'has_role', 'update_updated_at_column', 'update_last_login', 'handle_new_user')
  LOOP
    IF func_record.prosrc NOT LIKE '%SET search_path = public%' THEN
      RAISE NOTICE 'Warning: Function % does not have search_path set', func_record.proname;
    ELSE
      RAISE NOTICE 'OK: Function % has search_path set correctly', func_record.proname;
    END IF;
  END LOOP;
END;
$$; 