-- =====================================================
-- CORRECTION: Ajouter le rôle MANAGER aux permissions
-- =====================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Stocks can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Stocks can manage receptions" ON public.receptions;
DROP POLICY IF EXISTS "Stocks can manage reception items" ON public.reception_items;

-- NOUVELLE POLITIQUE pour suppliers avec MANAGER
CREATE POLICY "Stocks and managers can manage suppliers"
ON public.suppliers FOR ALL
USING (
  company_id = get_user_company_id() 
  AND (
    has_role('stocks'::user_role) 
    OR has_role('manager'::user_role) 
    OR has_role('owner'::user_role)
  )
);

-- NOUVELLE POLITIQUE pour receptions avec MANAGER
CREATE POLICY "Stocks and managers can manage receptions"
ON public.receptions FOR ALL
USING (
  company_id = get_user_company_id() 
  AND (
    has_role('stocks'::user_role) 
    OR has_role('manager'::user_role) 
    OR has_role('owner'::user_role)
  )
);

-- NOUVELLE POLITIQUE pour reception_items avec MANAGER
CREATE POLICY "Stocks and managers can manage reception items"
ON public.reception_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.receptions r 
    WHERE r.id = reception_items.reception_id 
    AND r.company_id = get_user_company_id() 
    AND (
      has_role('stocks'::user_role) 
      OR has_role('manager'::user_role) 
      OR has_role('owner'::user_role)
    )
  )
);