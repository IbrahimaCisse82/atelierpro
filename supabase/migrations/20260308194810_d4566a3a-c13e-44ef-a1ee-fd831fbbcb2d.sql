
-- Supprimer la policy UPDATE redondante sur companies
DROP POLICY IF EXISTS "Owners can update own company" ON public.companies;
