
-- Add payment_method column to treasury_movements for tracking Orange Money, Wave, etc.
ALTER TABLE public.treasury_movements ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';

-- Add payment_method to customer_invoices for tracking how payments are received
ALTER TABLE public.customer_invoices ADD COLUMN IF NOT EXISTS payment_method text DEFAULT NULL;

-- Create a payments table for tracking partial payments (acomptes)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  order_id uuid REFERENCES public.orders(id),
  invoice_id uuid REFERENCES public.customer_invoices(id),
  client_id uuid REFERENCES public.clients(id),
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  reference text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can select" ON public.payments FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Company members can insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company members can update" ON public.payments FOR UPDATE TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Company members can delete" ON public.payments FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Trigger to auto-update orders.paid_amount when a payment is added
CREATE OR REPLACE FUNCTION public.update_order_paid_amount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.order_id IS NOT NULL THEN
    UPDATE public.orders
    SET paid_amount = COALESCE((
      SELECT SUM(amount) FROM public.payments WHERE order_id = NEW.order_id
    ), 0)
    WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_order_paid_amount
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_order_paid_amount();
