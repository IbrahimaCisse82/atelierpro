-- Migration globale : Sécurité & Performance AtelierPro
-- Date : 2025-07-11

-- 1️⃣ Correction des policies RLS (auth.uid() → (select auth.uid()))
-- =================================================================

-- Table : profiles
ALTER POLICY "Users can view their own profile"
  ON public.profiles
  USING (user_id = (select auth.uid()));

ALTER POLICY "Users can update their own profile"
  ON public.profiles
  USING (user_id = (select auth.uid()));

-- Table : orders
ALTER POLICY "Tailors can view their assigned orders"
  ON public.orders
  USING (assigned_tailor_id = (select auth.uid()));

-- Table : employees
ALTER POLICY "Employees can view their own data"
  ON public.employees
  USING (profile_id = (select auth.uid()));

-- (Ajoutez ici d'autres policies similaires si besoin)

-- 2️⃣ Indexes manquants sur les foreign keys
-- ==========================================

-- Table : alerts
CREATE INDEX IF NOT EXISTS idx_alerts_created_by ON public.alerts(created_by);
CREATE INDEX IF NOT EXISTS idx_alerts_read_by ON public.alerts(read_by);

-- Table : client_measurements
CREATE INDEX IF NOT EXISTS idx_client_measurements_client_id ON public.client_measurements(client_id);
CREATE INDEX IF NOT EXISTS idx_client_measurements_company_id ON public.client_measurements(company_id);
CREATE INDEX IF NOT EXISTS idx_client_measurements_created_by ON public.client_measurements(created_by);
CREATE INDEX IF NOT EXISTS idx_client_measurements_updated_by ON public.client_measurements(updated_by);
CREATE INDEX IF NOT EXISTS idx_client_measurements_validated_by ON public.client_measurements(validated_by);

-- Table : clients
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_updated_by ON public.clients(updated_by);

-- Table : customer_invoices
CREATE INDEX IF NOT EXISTS idx_customer_invoices_company_id ON public.customer_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_created_by ON public.customer_invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_order_id ON public.customer_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_paid_by ON public.customer_invoices(paid_by);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_updated_by ON public.customer_invoices(updated_by);

-- Table : employees
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_created_by ON public.employees(created_by);
CREATE INDEX IF NOT EXISTS idx_employees_profile_id ON public.employees(profile_id);
CREATE INDEX IF NOT EXISTS idx_employees_updated_by ON public.employees(updated_by);

-- Table : models
CREATE INDEX IF NOT EXISTS idx_models_company_id ON public.models(company_id);
CREATE INDEX IF NOT EXISTS idx_models_created_by ON public.models(created_by);
CREATE INDEX IF NOT EXISTS idx_models_updated_by ON public.models(updated_by);

-- Table : order_items
CREATE INDEX IF NOT EXISTS idx_order_items_model_id ON public.order_items(model_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Table : order_materials
CREATE INDEX IF NOT EXISTS idx_order_materials_order_id ON public.order_materials(order_id);
CREATE INDEX IF NOT EXISTS idx_order_materials_product_id ON public.order_materials(product_id);

-- Table : orders
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_measurements_id ON public.orders(measurements_id);
CREATE INDEX IF NOT EXISTS idx_orders_updated_by ON public.orders(updated_by);

-- Table : patterns
CREATE INDEX IF NOT EXISTS idx_patterns_company_id ON public.patterns(company_id);
CREATE INDEX IF NOT EXISTS idx_patterns_created_by ON public.patterns(created_by);
CREATE INDEX IF NOT EXISTS idx_patterns_model_id ON public.patterns(model_id);

-- Table : product_categories
CREATE INDEX IF NOT EXISTS idx_product_categories_company_id ON public.product_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_created_by ON public.product_categories(created_by);
CREATE INDEX IF NOT EXISTS idx_product_categories_updated_by ON public.product_categories(updated_by);

-- Table : production_tracking
CREATE INDEX IF NOT EXISTS idx_production_tracking_created_by ON public.production_tracking(created_by);

-- Table : products
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_updated_by ON public.products(updated_by);

-- Table : profiles
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- Table : purchase_order_items
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON public.purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON public.purchase_order_items(purchase_order_id);

-- Table : purchase_orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_updated_by ON public.purchase_orders(updated_by);

-- Table : reception_items
CREATE INDEX IF NOT EXISTS idx_reception_items_product_id ON public.reception_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reception_items_purchase_order_item_id ON public.reception_items(purchase_order_item_id);
CREATE INDEX IF NOT EXISTS idx_reception_items_reception_id ON public.reception_items(reception_id);

-- Table : receptions
CREATE INDEX IF NOT EXISTS idx_receptions_company_id ON public.receptions(company_id);
CREATE INDEX IF NOT EXISTS idx_receptions_created_by ON public.receptions(created_by);
CREATE INDEX IF NOT EXISTS idx_receptions_purchase_order_id ON public.receptions(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_receptions_validated_by ON public.receptions(validated_by);

-- Table : stock_movements
CREATE INDEX IF NOT EXISTS idx_stock_movements_company_id ON public.stock_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_by ON public.stock_movements(created_by);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);

-- Table : supplier_invoices
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_company_id ON public.supplier_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_created_by ON public.supplier_invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_paid_by ON public.supplier_invoices(paid_by);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_purchase_order_id ON public.supplier_invoices(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_updated_by ON public.supplier_invoices(updated_by);

-- Table : suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON public.suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_by ON public.suppliers(created_by);
CREATE INDEX IF NOT EXISTS idx_suppliers_updated_by ON public.suppliers(updated_by);

-- Table : work_hours
CREATE INDEX IF NOT EXISTS idx_work_hours_company_id ON public.work_hours(company_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_created_by ON public.work_hours(created_by);
CREATE INDEX IF NOT EXISTS idx_work_hours_employee_id ON public.work_hours(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_order_id ON public.work_hours(order_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_updated_by ON public.work_hours(updated_by);

-- 3️⃣ Indexes inutilisés (à vérifier/supprimer manuellement si besoin)
-- ===================================================================
-- DROP INDEX IF EXISTS idx_orders_status;
-- DROP INDEX IF EXISTS idx_purchase_orders_status;
-- DROP INDEX IF EXISTS idx_alerts_is_read;
-- DROP INDEX IF EXISTS idx_production_tracking_order_id;
-- DROP INDEX IF EXISTS idx_production_tracking_status_date;

-- 4️⃣ Fusion de policies permissives (optionnel, à faire manuellement si logique compatible)
-- =========================================================================================
-- Si vous souhaitez fusionner des policies, adaptez la logique dans les policies SELECT/UPDATE concernées.
-- Sinon, gardez-les séparées mais sachez que cela peut impacter la performance à grande échelle. 