-- Migration pour éliminer toutes les politiques RLS en double restantes
-- Consolidation finale pour optimiser les performances

-- Client Measurements
DROP POLICY IF EXISTS "Tailors can manage client measurements" ON public.client_measurements;

-- Employees  
DROP POLICY IF EXISTS "Employees can view their own data" ON public.employees;

-- Models
DROP POLICY IF EXISTS "Tailors can manage models" ON public.models;

-- Order Materials
DROP POLICY IF EXISTS "Orders and manager can manage order_materials" ON public.order_materials;

-- Orders
DROP POLICY IF EXISTS "Managers can manage orders from their company" ON public.orders;
DROP POLICY IF EXISTS "Tailors can view their assigned orders" ON public.orders;

-- Patterns
DROP POLICY IF EXISTS "Tailors can manage patterns" ON public.patterns;

-- Product Categories
DROP POLICY IF EXISTS "Stocks can manage product categories" ON public.product_categories;

-- Production Tasks
DROP POLICY IF EXISTS "Managers can manage production tasks from their company" ON public.production_tasks;

-- Profiles
DROP POLICY IF EXISTS "Users can view profiles from their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Purchase Order Items
DROP POLICY IF EXISTS "Users can view purchase_order_items from their company" ON public.purchase_order_items;

-- Reception Items
DROP POLICY IF EXISTS "Stocks can manage reception_items" ON public.reception_items;
DROP POLICY IF EXISTS "Users can view reception items from leur company" ON public.reception_items;
DROP POLICY IF EXISTS "Users can view reception items from their company" ON public.reception_items;
DROP POLICY IF EXISTS "Users can view reception_items from their company" ON public.reception_items;

-- Receptions
DROP POLICY IF EXISTS "Users can view receptions from leur company" ON public.receptions;
DROP POLICY IF EXISTS "Users can view receptions from their company" ON public.receptions;

-- Remunerations
DROP POLICY IF EXISTS "Users can view remunerations from their company" ON public.remunerations;

-- Stock Movements
DROP POLICY IF EXISTS "Users can view stock movements from leur company" ON public.stock_movements;
DROP POLICY IF EXISTS "Users can view stock movements from their company" ON public.stock_movements;

-- Stock Valuation Movements
DROP POLICY IF EXISTS "Users can view stock valuation movements from leur company" ON public.stock_valuation_movements;
DROP POLICY IF EXISTS "Users can view stock valuation movements from their company" ON public.stock_valuation_movements;

-- Stock Valuation Settings
DROP POLICY IF EXISTS "Users can view stock valuation settings from leur company" ON public.stock_valuation_settings;
DROP POLICY IF EXISTS "Users can view stock valuation settings from their company" ON public.stock_valuation_settings;

-- Supplier Invoices
DROP POLICY IF EXISTS "Users can view supplier invoices from leur company" ON public.supplier_invoices;
DROP POLICY IF EXISTS "Users can view supplier invoices from their company" ON public.supplier_invoices;

-- Suppliers
DROP POLICY IF EXISTS "Users can manage suppliers from their company" ON public.suppliers;

-- Syscohada Accounts
DROP POLICY IF EXISTS "Users can view syscohada accounts from leur company" ON public.syscohada_accounts;
DROP POLICY IF EXISTS "Users can view syscohada accounts from their company" ON public.syscohada_accounts;

-- Treasury Accounts
DROP POLICY IF EXISTS "Users can insert treasury accounts for their company" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Users can update treasury accounts for their company" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Users can view treasury accounts for their company" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Users can view treasury accounts from leur company" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Users can view treasury accounts from their company" ON public.treasury_accounts;

-- Treasury Movements
DROP POLICY IF EXISTS "Users can insert treasury movements for their company" ON public.treasury_movements;
DROP POLICY IF EXISTS "Users can view treasury movements for their company" ON public.treasury_movements;
DROP POLICY IF EXISTS "Users can view treasury movements from leur company" ON public.treasury_movements;
DROP POLICY IF EXISTS "Users can view treasury movements from their company" ON public.treasury_movements;

-- =====================================================
-- Toutes les politiques restantes "Owner can manage" et 
-- les politiques de gestion par rôle sont conservées
-- car elles sont correctement structurées
-- =====================================================