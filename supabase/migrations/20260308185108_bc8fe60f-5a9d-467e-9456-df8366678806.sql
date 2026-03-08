
CREATE TABLE public.company_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  enabled_at timestamp with time zone DEFAULT now(),
  enabled_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, module_key)
);

ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select modules"
  ON public.company_modules FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Owners and managers can manage modules"
  ON public.company_modules FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = get_user_company_id() 
    AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Owners and managers can update modules"
  ON public.company_modules FOR UPDATE
  TO authenticated
  USING (
    company_id = get_user_company_id() 
    AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Owners can delete modules"
  ON public.company_modules FOR DELETE
  TO authenticated
  USING (
    company_id = get_user_company_id() 
    AND has_role(auth.uid(), 'owner')
  );
