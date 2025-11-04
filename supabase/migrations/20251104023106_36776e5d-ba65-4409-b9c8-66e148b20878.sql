-- ============================================
-- CORRECTION: Fixer tous les problèmes de sécurité search_path
-- ============================================

-- 1. Corriger generate_treasury_movement_number (avec paramètre)
CREATE OR REPLACE FUNCTION public.generate_treasury_movement_number(p_company_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_count INTEGER;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.treasury_movements 
  WHERE company_id = p_company_id 
  AND DATE(created_at) = CURRENT_DATE;
  
  v_number := 'TRES-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_number;
END;
$function$;

-- 2. Corriger toutes les versions de generate_accounting_entry
-- Version avec 4 paramètres
CREATE OR REPLACE FUNCTION public.generate_accounting_entry(
  p_company_id uuid, 
  p_journal_id uuid, 
  p_description text, 
  p_entries json
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_entry_id UUID;
  v_entry_number TEXT;
  v_total_debit DECIMAL(15,2) := 0;
  v_total_credit DECIMAL(15,2) := 0;
  v_line_number INTEGER := 1;
  v_entry JSON;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Générer le numéro d'écriture
  v_entry_number := 'GEN-' || to_char(now(), 'YYYYMMDD') || '-' || 
                   lpad((SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
                         FROM public.accounting_entries 
                         WHERE company_id = p_company_id 
                         AND entry_number LIKE 'GEN-' || to_char(now(), 'YYYYMMDD') || '-%'), 4, '0');

  -- Calculer les totaux
  FOR v_entry IN SELECT * FROM json_array_elements(p_entries)
  LOOP
    v_total_debit := v_total_debit + COALESCE((v_entry->>'debit_amount')::DECIMAL, 0);
    v_total_credit := v_total_credit + COALESCE((v_entry->>'credit_amount')::DECIMAL, 0);
  END LOOP;

  -- Vérifier l'équilibre
  IF v_total_debit != v_total_credit THEN
    RAISE EXCEPTION 'Écriture déséquilibrée: débit % != crédit %', v_total_debit, v_total_credit;
  END IF;

  -- Créer l'écriture principale
  INSERT INTO public.accounting_entries (
    company_id, journal_id, entry_number, entry_date, description, 
    total_debit, total_credit, created_by, updated_by
  ) VALUES (
    p_company_id, p_journal_id, v_entry_number, CURRENT_DATE, p_description,
    v_total_debit, v_total_credit, v_user_id, v_user_id
  ) RETURNING id INTO v_entry_id;

  -- Créer les lignes d'écriture
  FOR v_entry IN SELECT * FROM json_array_elements(p_entries)
  LOOP
    INSERT INTO public.accounting_entry_lines (
      entry_id, account_id, line_number, description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, 
      (v_entry->>'account_id')::UUID,
      v_line_number,
      v_entry->>'description',
      COALESCE((v_entry->>'debit_amount')::DECIMAL, 0),
      COALESCE((v_entry->>'credit_amount')::DECIMAL, 0)
    );
    
    v_line_number := v_line_number + 1;
  END LOOP;

  RETURN v_entry_id;
END;
$function$;

-- 3. Corriger toutes les versions de get_production_stats
-- Version sans paramètre
CREATE OR REPLACE FUNCTION public.get_production_stats()
RETURNS TABLE(
  total_orders integer, 
  completed_orders integer, 
  pending_orders integer, 
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_orders,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_orders,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_orders,
    COALESCE(SUM(total_amount), 0) as total_revenue
  FROM public.orders
  WHERE company_id = public.get_user_company_id();
END;
$function$;

-- Version avec paramètre p_company_id
CREATE OR REPLACE FUNCTION public.get_production_stats(p_company_id uuid)
RETURNS TABLE(
  total_orders integer, 
  pending_orders integer, 
  in_production_orders integer, 
  completed_orders integer, 
  total_tasks integer, 
  pending_tasks integer, 
  in_progress_tasks integer, 
  completed_tasks integer, 
  total_remuneration numeric, 
  pending_remuneration numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT o.id)::INTEGER as total_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END)::INTEGER as pending_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'in_production' THEN o.id END)::INTEGER as in_production_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END)::INTEGER as completed_orders,
        COUNT(pt.id)::INTEGER as total_tasks,
        COUNT(CASE WHEN pt.status = 'pending' THEN pt.id END)::INTEGER as pending_tasks,
        COUNT(CASE WHEN pt.status = 'in_progress' THEN pt.id END)::INTEGER as in_progress_tasks,
        COUNT(CASE WHEN pt.status = 'completed' THEN pt.id END)::INTEGER as completed_tasks,
        COALESCE(SUM(r.amount), 0) as total_remuneration,
        COALESCE(SUM(CASE WHEN r.status = 'pending' THEN r.amount ELSE 0 END), 0) as pending_remuneration
    FROM orders o
    LEFT JOIN production_tasks pt ON o.id = pt.order_id
    LEFT JOIN remunerations r ON pt.id = r.production_task_id
    WHERE o.company_id = p_company_id;
END;
$function$;

-- 4. Corriger get_employee_remunerations (avec paramètres)
CREATE OR REPLACE FUNCTION public.get_employee_remunerations(
  p_employee_id uuid, 
  p_start_date date, 
  p_end_date date
)
RETURNS TABLE(
  task_name character varying, 
  order_number character varying, 
  completion_date date, 
  hours_worked numeric, 
  remuneration_amount numeric, 
  remuneration_status character varying, 
  payment_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        pt.task_name,
        o.order_number,
        pt.completion_date,
        pt.actual_hours,
        r.amount as remuneration_amount,
        r.status as remuneration_status,
        r.payment_date
    FROM production_tasks pt
    JOIN orders o ON pt.order_id = o.id
    LEFT JOIN remunerations r ON pt.id = r.production_task_id
    WHERE pt.employee_id = p_employee_id
    AND pt.completion_date BETWEEN p_start_date AND p_end_date
    ORDER BY pt.completion_date DESC;
END;
$function$;