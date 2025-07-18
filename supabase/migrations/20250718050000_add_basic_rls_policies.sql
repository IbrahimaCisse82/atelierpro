-- Migration pour ajouter les policies RLS manquantes - Version simplifiée
-- Date: 2025-07-18

-- =====================================================
-- POLICIES POUR LES TABLES PRINCIPALES
-- =====================================================

-- Table: alerts
DROP POLICY IF EXISTS "Users can view alerts from their company" ON public.alerts;
CREATE POLICY "Users can view alerts from their company"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage alerts from their company" ON public.alerts;
CREATE POLICY "Users can manage alerts from their company"
  ON public.alerts FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Table: client_measurements
DROP POLICY IF EXISTS "Users can view client measurements from their company" ON public.client_measurements;
CREATE POLICY "Users can view client measurements from their company"
  ON public.client_measurements FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage client measurements from their company" ON public.client_measurements;
CREATE POLICY "Users can manage client measurements from their company"
  ON public.client_measurements FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Table: models
DROP POLICY IF EXISTS "Users can view models from their company" ON public.models;
CREATE POLICY "Users can view models from their company"
  ON public.models FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage models from their company" ON public.models;
CREATE POLICY "Users can manage models from their company"
  ON public.models FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Table: patterns
DROP POLICY IF EXISTS "Users can view patterns from their company" ON public.patterns;
CREATE POLICY "Users can view patterns from their company"
  ON public.patterns FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage patterns from their company" ON public.patterns;
CREATE POLICY "Users can manage patterns from their company"
  ON public.patterns FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Table: product_categories
DROP POLICY IF EXISTS "Users can view product categories from their company" ON public.product_categories;
CREATE POLICY "Users can view product categories from their company"
  ON public.product_categories FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage product categories from their company" ON public.product_categories;
CREATE POLICY "Users can manage product categories from their company"
  ON public.product_categories FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Table: suppliers
DROP POLICY IF EXISTS "Users can view suppliers from their company" ON public.suppliers;
CREATE POLICY "Users can view suppliers from their company"
  ON public.suppliers FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage suppliers from their company" ON public.suppliers;
CREATE POLICY "Users can manage suppliers from their company"
  ON public.suppliers FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Table: stock_movements
DROP POLICY IF EXISTS "Users can view stock movements from their company" ON public.stock_movements;
CREATE POLICY "Users can view stock movements from their company"
  ON public.stock_movements FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can manage stock movements from their company" ON public.stock_movements;
CREATE POLICY "Users can manage stock movements from their company"
  ON public.stock_movements FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id());
