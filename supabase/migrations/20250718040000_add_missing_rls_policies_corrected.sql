-- Migration pour ajouter les policies RLS manquantes
-- Date: 2025-07-18

-- =====================================================
-- POLICIES MANQUANTES POUR LES TABLES AVEC RLS ACTIVÉ
-- =====================================================

-- Table: alerts
DROP POLICY IF EXISTS "Users can view alerts from their company" ON public.alerts;
CREATE POLICY "Users can view alerts from their company"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can create alerts for their company" ON public.alerts;
CREATE POLICY "Users can create alerts for their company"
  ON public.alerts FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can update alerts from their company" ON public.alerts;
CREATE POLICY "Users can update alerts for their company"
  ON public.alerts FOR UPDATE
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can delete alerts from leur company" ON public.alerts;
CREATE POLICY "Users can delete alerts for leur company"
  ON public.alerts FOR DELETE
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Table: bank_reconciliation_lines
DROP POLICY IF EXISTS "Users can view bank reconciliation lines from their company" ON public.bank_reconciliation_lines;
CREATE POLICY "Users can view bank reconciliation lines from their company"
  ON public.bank_reconciliation_lines FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bank_reconciliations br
    WHERE br.id = bank_reconciliation_lines.reconciliation_id
    AND br.company_id = public.get_user_company_id()
  ));

DROP POLICY IF EXISTS "Users can manage bank reconciliation lines from their company" ON public.bank_reconciliation_lines;
CREATE POLICY "Users can manage bank reconciliation lines from their company"
  ON public.bank_reconciliation_lines FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bank_reconciliations br
    WHERE br.id = bank_reconciliation_lines.reconciliation_id
    AND br.company_id = public.get_user_company_id()
  ));

-- Table: client_measurements
DROP POLICY IF EXISTS "Users can view client measurements from their company" ON public.client_measurements;
CREATE POLICY "Users can view client measurements from their company"
  ON public.client_measurements FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Tailors can manage client measurements" ON public.client_measurements;
CREATE POLICY "Tailors can manage client measurements"
  ON public.client_measurements FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('tailor') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: customer_invoices
DROP POLICY IF EXISTS "Users can view customer invoices from their company" ON public.customer_invoices;
CREATE POLICY "Users can view customer invoices from their company"
  ON public.customer_invoices FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Orders and manager can manage customer invoices" ON public.customer_invoices;
CREATE POLICY "Orders and manager can manage customer invoices"
  ON public.customer_invoices FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('orders') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: models
DROP POLICY IF EXISTS "Users can view models from their company" ON public.models;
CREATE POLICY "Users can view models from their company"
  ON public.models FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Tailors can manage models" ON public.models;
CREATE POLICY "Tailors can manage models"
  ON public.models FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('tailor') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: patterns
DROP POLICY IF EXISTS "Users can view patterns from their company" ON public.patterns;
CREATE POLICY "Users can view patterns from their company"
  ON public.patterns FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Tailors can manage patterns" ON public.patterns;
CREATE POLICY "Tailors can manage patterns"
  ON public.patterns FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('tailor') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: product_categories
DROP POLICY IF EXISTS "Users can view product categories from their company" ON public.product_categories;
CREATE POLICY "Users can view product categories from their company"
  ON public.product_categories FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Stocks can manage product categories" ON public.product_categories;
CREATE POLICY "Stocks can manage product categories"
  ON public.product_categories FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('stocks') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: production_tracking
DROP POLICY IF EXISTS "Users can view production tracking from their company" ON public.production_tracking;
CREATE POLICY "Users can view production tracking from their company"
  ON public.production_tracking FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = production_tracking.order_id
    AND o.company_id = public.get_user_company_id()
  ));

DROP POLICY IF EXISTS "Tailors can manage production tracking" ON public.production_tracking;
CREATE POLICY "Tailors can manage production tracking"
  ON public.production_tracking FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = production_tracking.order_id
    AND o.company_id = public.get_user_company_id()
    AND (public.has_role('tailor') OR public.has_role('manager') OR public.has_role('owner'))
  ));

-- Table: receptions
DROP POLICY IF EXISTS "Users can view receptions from their company" ON public.receptions;
CREATE POLICY "Users can view receptions from their company"
  ON public.receptions FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Stocks can manage receptions" ON public.receptions;
CREATE POLICY "Stocks can manage receptions"
  ON public.receptions FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('stocks') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: stock_movements
DROP POLICY IF EXISTS "Users can view stock movements from their company" ON public.stock_movements;
CREATE POLICY "Users can view stock movements from their company"
  ON public.stock_movements FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Stocks can manage stock movements" ON public.stock_movements;
CREATE POLICY "Stocks can manage stock movements"
  ON public.stock_movements FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('stocks') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: stock_valuation_movements
DROP POLICY IF EXISTS "Users can view stock valuation movements from their company" ON public.stock_valuation_movements;
CREATE POLICY "Users can view stock valuation movements from their company"
  ON public.stock_valuation_movements FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Owner can manage stock valuation movements" ON public.stock_valuation_movements;
CREATE POLICY "Owner can manage stock valuation movements"
  ON public.stock_valuation_movements FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND public.has_role('owner'));

-- Table: stock_valuation_settings
DROP POLICY IF EXISTS "Users can view stock valuation settings from their company" ON public.stock_valuation_settings;
CREATE POLICY "Users can view stock valuation settings from their company"
  ON public.stock_valuation_settings FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Owner can manage stock valuation settings" ON public.stock_valuation_settings;
CREATE POLICY "Owner can manage stock valuation settings"
  ON public.stock_valuation_settings FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND public.has_role('owner'));

-- Table: supplier_invoices
DROP POLICY IF EXISTS "Users can view supplier invoices from their company" ON public.supplier_invoices;
CREATE POLICY "Users can view supplier invoices from their company"
  ON public.supplier_invoices FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Stocks can manage supplier invoices" ON public.supplier_invoices;
CREATE POLICY "Stocks can manage supplier invoices"
  ON public.supplier_invoices FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('stocks') OR public.has_role('manager') OR public.has_role('owner')));

-- Table: suppliers
DROP POLICY IF EXISTS "Users can view suppliers from their company" ON public.suppliers;
CREATE POLICY "Users can view suppliers from their company"
  ON public.suppliers FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Stocks can manage suppliers" ON public.suppliers;
CREATE POLICY "Stocks can manage suppliers"
  ON public.suppliers FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('stocks') OR public.has_role('manager') OR public.has_role('owner')));

-- =====================================================
-- COMMENTAIRES ET VÉRIFICATIONS
-- =====================================================

-- Cette migration ajoute les policies RLS manquantes pour les tables principales
-- qui ont RLS activé mais n'ont pas encore de policies définies.
-- 
-- Les policies suivent le principe de sécurité basé sur l'entreprise :
-- - Les utilisateurs ne peuvent voir que les données de leur entreprise
-- - Les permissions sont basées sur les rôles utilisateur
-- - Les propriétaires ont accès complet
-- - Les rôles spécifiques ont accès à leurs modules respectifs
--
-- Note: Certaines tables ont été exclues car elles n'existent pas encore
-- dans le schéma actuel (ex: work_hours, etc.)
