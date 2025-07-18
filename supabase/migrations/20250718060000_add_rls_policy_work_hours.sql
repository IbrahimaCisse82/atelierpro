-- Migration pour ajouter une policy RLS sur la table work_hours
-- Date: 2025-07-18

DROP POLICY IF EXISTS "Users can view work hours from their company" ON public.work_hours;
CREATE POLICY "Users can view work hours from their company"
  ON public.work_hours FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage work hours from their company" ON public.work_hours;
CREATE POLICY "Users can manage work hours from their company"
  ON public.work_hours FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());
