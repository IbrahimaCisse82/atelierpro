-- Allow managers to update their own company
DROP POLICY IF EXISTS "Owners can update own company " ON public.companies;

CREATE POLICY "Owners and managers can update company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id = get_user_company_id() AND (
    has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')
  )
);

-- Enable realtime for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;