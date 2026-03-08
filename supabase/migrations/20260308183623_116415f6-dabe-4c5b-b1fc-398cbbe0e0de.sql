
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS ninea text,
  ADD COLUMN IF NOT EXISTS rccm text,
  ADD COLUMN IF NOT EXISTS legal_notice text;
