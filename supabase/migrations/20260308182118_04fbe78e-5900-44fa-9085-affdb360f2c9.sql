
-- Add missing INSERT and DELETE policies on user_roles (owner-only)
CREATE POLICY "Only owners can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND public.has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Only owners can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    company_id = public.get_user_company_id()
    AND public.has_role(auth.uid(), 'owner')
    AND user_id != auth.uid()
  );
