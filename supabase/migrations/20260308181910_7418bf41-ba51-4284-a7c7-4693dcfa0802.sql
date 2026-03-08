
-- FIX: Prevent company_id manipulation on profiles
-- Drop existing profile policies and recreate with proper checks
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own and company profiles" ON public.profiles;

-- SELECT: view own + same company
CREATE POLICY "Users can view own and company profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR company_id = public.get_user_company_id());

-- INSERT: only own user_id, company_id must match what trigger sets (no direct override)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND company_id = public.get_user_company_id());

-- UPDATE: can update own profile but CANNOT change company_id
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND company_id = public.get_user_company_id());

-- FIX: Add company_id scope to has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id 
      AND ur.role::text = _role
      AND ur.company_id = (SELECT p.company_id FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1)
  )
$$;
