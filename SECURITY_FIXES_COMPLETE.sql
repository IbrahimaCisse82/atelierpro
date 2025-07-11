-- =====================================================
-- SCRIPT COMPLET DE CORRECTION DE SÉCURITÉ SUPABASE
-- À exécuter MANUELLEMENT dans le SQL Editor Supabase
-- =====================================================

-- ÉTAPE 1: Suppression de tous les triggers dépendants
-- =====================================================

-- Suppression des triggers qui utilisent update_updated_at_column()
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients CASCADE;
DROP TRIGGER IF EXISTS update_client_measurements_updated_at ON client_measurements CASCADE;
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers CASCADE;
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories CASCADE;
DROP TRIGGER IF EXISTS update_products_updated_at ON products CASCADE;
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders CASCADE;
DROP TRIGGER IF EXISTS update_purchase_order_items_updated_at ON purchase_order_items CASCADE;
DROP TRIGGER IF EXISTS update_supplier_invoices_updated_at ON supplier_invoices CASCADE;
DROP TRIGGER IF EXISTS update_models_updated_at ON models CASCADE;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders CASCADE;
DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items CASCADE;
DROP TRIGGER IF EXISTS update_order_materials_updated_at ON order_materials CASCADE;
DROP TRIGGER IF EXISTS update_customer_invoices_updated_at ON customer_invoices CASCADE;
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees CASCADE;
DROP TRIGGER IF EXISTS update_work_hours_updated_at ON work_hours CASCADE;

-- Suppression des triggers qui utilisent update_created_at_column()
DROP TRIGGER IF EXISTS update_clients_created_at ON clients CASCADE;
DROP TRIGGER IF EXISTS update_client_measurements_created_at ON client_measurements CASCADE;
DROP TRIGGER IF EXISTS update_suppliers_created_at ON suppliers CASCADE;
DROP TRIGGER IF EXISTS update_product_categories_created_at ON product_categories CASCADE;
DROP TRIGGER IF EXISTS update_products_created_at ON products CASCADE;
DROP TRIGGER IF EXISTS update_purchase_orders_created_at ON purchase_orders CASCADE;
DROP TRIGGER IF EXISTS update_purchase_order_items_created_at ON purchase_order_items CASCADE;
DROP TRIGGER IF EXISTS update_supplier_invoices_created_at ON supplier_invoices CASCADE;
DROP TRIGGER IF EXISTS update_models_created_at ON models CASCADE;
DROP TRIGGER IF EXISTS update_orders_created_at ON orders CASCADE;
DROP TRIGGER IF EXISTS update_order_items_created_at ON order_items CASCADE;
DROP TRIGGER IF EXISTS update_order_materials_created_at ON order_materials CASCADE;
DROP TRIGGER IF EXISTS update_customer_invoices_created_at ON customer_invoices CASCADE;
DROP TRIGGER IF EXISTS update_employees_created_at ON employees CASCADE;
DROP TRIGGER IF EXISTS update_work_hours_created_at ON work_hours CASCADE;

-- ÉTAPE 2: Suppression des fonctions
-- =====================================================

-- Suppression des fonctions avec CASCADE pour forcer la suppression
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_created_at_column() CASCADE;

-- ÉTAPE 3: Recréation des fonctions avec search_path fixe
-- =====================================================

-- Fonction pour mettre à jour updated_at avec search_path fixe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = 'public';

-- Fonction pour mettre à jour created_at avec search_path fixe
CREATE OR REPLACE FUNCTION update_created_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = 'public';

-- ÉTAPE 4: Recréation des triggers
-- =====================================================

-- Triggers pour updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_measurements_updated_at
    BEFORE UPDATE ON client_measurements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at
    BEFORE UPDATE ON purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_invoices_updated_at
    BEFORE UPDATE ON supplier_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_materials_updated_at
    BEFORE UPDATE ON order_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_invoices_updated_at
    BEFORE UPDATE ON customer_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_hours_updated_at
    BEFORE UPDATE ON work_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour created_at
CREATE TRIGGER update_clients_created_at
    BEFORE INSERT ON clients
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_client_measurements_created_at
    BEFORE INSERT ON client_measurements
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_suppliers_created_at
    BEFORE INSERT ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_product_categories_created_at
    BEFORE INSERT ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_products_created_at
    BEFORE INSERT ON products
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_purchase_orders_created_at
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_purchase_order_items_created_at
    BEFORE INSERT ON purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_supplier_invoices_created_at
    BEFORE INSERT ON supplier_invoices
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_models_created_at
    BEFORE INSERT ON models
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_orders_created_at
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_order_items_created_at
    BEFORE INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_order_materials_created_at
    BEFORE INSERT ON order_materials
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_customer_invoices_created_at
    BEFORE INSERT ON customer_invoices
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_employees_created_at
    BEFORE INSERT ON employees
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_work_hours_created_at
    BEFORE INSERT ON work_hours
    FOR EACH ROW EXECUTE FUNCTION update_created_at_column();

-- ÉTAPE 5: Vérification de la sécurité
-- =====================================================

-- Vérifier que les fonctions ont maintenant un search_path fixe
SELECT 
    proname as function_name,
    prosrc as function_source,
    CASE 
        WHEN proconfig IS NULL OR array_length(proconfig, 1) IS NULL THEN 'NON SÉCURISÉ'
        ELSE 'SÉCURISÉ'
    END as security_status
FROM pg_proc 
WHERE proname IN ('update_updated_at_column', 'update_created_at_column');

-- Vérifier que les triggers ont été recréés
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%' OR trigger_name LIKE '%created_at%'
ORDER BY trigger_name;

-- Message de confirmation
SELECT 'Script de correction de sécurité terminé avec succès!' as status; 