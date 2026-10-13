-- LOT 1 — Intégrité des paiements

-- 1. Trigger de recalcul du montant payé : gère INSERT, UPDATE (ancienne + nouvelle commande), DELETE
CREATE OR REPLACE FUNCTION public.update_order_paid_amount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.order_id IS NOT NULL THEN
      UPDATE public.orders
      SET paid_amount = COALESCE((SELECT SUM(amount) FROM public.payments WHERE order_id = OLD.order_id), 0)
      WHERE id = OLD.order_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.order_id IS NOT NULL AND NEW.order_id IS DISTINCT FROM OLD.order_id THEN
      UPDATE public.orders
      SET paid_amount = COALESCE((SELECT SUM(amount) FROM public.payments WHERE order_id = OLD.order_id), 0)
      WHERE id = OLD.order_id;
    END IF;
    IF NEW.order_id IS NOT NULL THEN
      UPDATE public.orders
      SET paid_amount = COALESCE((SELECT SUM(amount) FROM public.payments WHERE order_id = NEW.order_id), 0)
      WHERE id = NEW.order_id;
    END IF;
    RETURN NEW;
  ELSE -- INSERT
    IF NEW.order_id IS NOT NULL THEN
      UPDATE public.orders
      SET paid_amount = COALESCE((SELECT SUM(amount) FROM public.payments WHERE order_id = NEW.order_id), 0)
      WHERE id = NEW.order_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$function$;

-- 2. Validation des paiements : pas de paiement sur commande annulée, pas de dépassement du solde
CREATE OR REPLACE FUNCTION public.validate_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order RECORD;
  v_paid numeric;
BEGIN
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Le montant du paiement doit être positif.';
  END IF;

  IF NEW.order_id IS NOT NULL THEN
    SELECT id, status, total_amount INTO v_order
    FROM public.orders WHERE id = NEW.order_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Commande introuvable.';
    END IF;

    IF v_order.status = 'cancelled' THEN
      RAISE EXCEPTION 'Paiement impossible : la commande est annulée.';
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid
    FROM public.payments
    WHERE order_id = NEW.order_id
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_paid + NEW.amount > v_order.total_amount THEN
      RAISE EXCEPTION 'Paiement refusé : supérieur au solde restant (% FCFA).', (v_order.total_amount - v_paid);
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_validate_payment
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.validate_payment();

-- 3. Contraintes d'intégrité sur les commandes
ALTER TABLE public.orders
  ADD CONSTRAINT orders_paid_not_negative CHECK (paid_amount >= 0),
  ADD CONSTRAINT orders_paid_not_exceed_total CHECK (paid_amount <= total_amount);

-- 4. Cohérence du statut « paid » : paid_amount >= total_amount => statut paid
CREATE OR REPLACE FUNCTION public.sync_order_paid_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.paid_amount >= NEW.total_amount
     AND NEW.total_amount > 0
     AND NEW.status NOT IN ('paid', 'cancelled') THEN
    NEW.status := 'paid';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_sync_order_paid_status
BEFORE UPDATE OF paid_amount ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.sync_order_paid_status();

-- 5. Annulation avec acompte : flux explicite et tracé
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS deposit_handling text;

CREATE OR REPLACE FUNCTION public.handle_order_cancellation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
    IF NEW.paid_amount > 0 AND NEW.deposit_handling IS NULL THEN
      RAISE EXCEPTION 'Commande avec acompte (% FCFA) : précisez deposit_handling (''refund'' ou ''keep'') avant annulation.', NEW.paid_amount;
    END IF;

    IF NEW.deposit_handling IS NOT NULL AND NEW.deposit_handling NOT IN ('refund', 'keep') THEN
      RAISE EXCEPTION 'deposit_handling invalide : ''refund'' ou ''keep'' attendu.';
    END IF;

    NEW.cancelled_at := now();

    -- Traçabilité dans le suivi de production
    INSERT INTO public.production_tracking (company_id, order_id, status, notes, created_by)
    VALUES (
      NEW.company_id,
      NEW.id,
      'cancelled',
      CASE
        WHEN NEW.paid_amount > 0 AND NEW.deposit_handling = 'refund'
          THEN 'Annulation avec remboursement de l''acompte de ' || NEW.paid_amount || ' FCFA. ' || COALESCE(NEW.cancellation_reason, '')
        WHEN NEW.paid_amount > 0 AND NEW.deposit_handling = 'keep'
          THEN 'Annulation avec conservation de l''acompte de ' || NEW.paid_amount || ' FCFA. ' || COALESCE(NEW.cancellation_reason, '')
        ELSE 'Annulation sans acompte. ' || COALESCE(NEW.cancellation_reason, '')
      END,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_handle_order_cancellation
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_cancellation();