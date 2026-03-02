
-- Fix overly permissive INSERT policies
DROP POLICY "Allow insert for new companies" ON public.companies;
DROP POLICY "Allow insert user roles" ON public.user_roles;

-- Companies: only the handle_new_user trigger (SECURITY DEFINER) inserts companies
-- No direct user insert needed
CREATE POLICY "No direct company insert" ON public.companies FOR INSERT WITH CHECK (false);

-- User roles: only the handle_new_user trigger inserts roles
CREATE POLICY "No direct user role insert" ON public.user_roles FOR INSERT WITH CHECK (false);
