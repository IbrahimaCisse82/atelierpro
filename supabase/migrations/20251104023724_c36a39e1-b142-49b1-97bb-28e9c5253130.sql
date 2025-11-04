-- Migration pour corriger les problèmes de sécurité et de performance RLS
-- 1. Optimiser auth.uid() pour éviter les re-évaluations
-- 2. Consolider les politiques RLS multiples

-- =====================================================
-- PARTIE 1: Supprimer les politiques en double
-- =====================================================

-- Accounting Entries
DROP POLICY IF EXISTS "Users can insert accounting entries for their company" ON public.accounting_entries;
DROP POLICY IF EXISTS "Users can update accounting entries for their company" ON public.accounting_entries;
DROP POLICY IF EXISTS "Users can view accounting entries for their company" ON public.accounting_entries;
DROP POLICY IF EXISTS "Users can view accounting entries from leur company" ON public.accounting_entries;
DROP POLICY IF EXISTS "Users can view accounting entries from their company" ON public.accounting_entries;

-- Accounting Entry Lines
DROP POLICY IF EXISTS "Users can insert accounting entry lines for their company" ON public.accounting_entry_lines;
DROP POLICY IF EXISTS "Users can view accounting entry lines for their company" ON public.accounting_entry_lines;
DROP POLICY IF EXISTS "Users can view accounting entry lines from leur company" ON public.accounting_entry_lines;
DROP POLICY IF EXISTS "Users can view accounting entry lines from their company" ON public.accounting_entry_lines;

-- Accounting Journals
DROP POLICY IF EXISTS "Users can insert accounting journals for their company" ON public.accounting_journals;
DROP POLICY IF EXISTS "Users can update accounting journals for their company" ON public.accounting_journals;
DROP POLICY IF EXISTS "Users can view accounting journals for their company" ON public.accounting_journals;
DROP POLICY IF EXISTS "Users can view accounting journals from leur company" ON public.accounting_journals;
DROP POLICY IF EXISTS "Users can view accounting journals from their company" ON public.accounting_journals;

-- Alerts
DROP POLICY IF EXISTS "Users can delete alerts for leur company" ON public.alerts;
DROP POLICY IF EXISTS "Users can delete alerts from their company" ON public.alerts;
DROP POLICY IF EXISTS "Users can create alerts for their company" ON public.alerts;
DROP POLICY IF EXISTS "Users can update alerts for their company" ON public.alerts;
DROP POLICY IF EXISTS "Users can update alerts from their company" ON public.alerts;
DROP POLICY IF EXISTS "Users can view alerts from their company" ON public.alerts;

-- Bank Reconciliation Lines
DROP POLICY IF EXISTS "Users can manage bank reconciliation lines from leur company" ON public.bank_reconciliation_lines;
DROP POLICY IF EXISTS "Users can view bank reconciliation lines from their company" ON public.bank_reconciliation_lines;

-- Bank Reconciliations
DROP POLICY IF EXISTS "Users can insert bank reconciliations for their company" ON public.bank_reconciliations;
DROP POLICY IF EXISTS "Users can update bank reconciliations for their company" ON public.bank_reconciliations;
DROP POLICY IF EXISTS "Users can view bank reconciliations for their company" ON public.bank_reconciliations;
DROP POLICY IF EXISTS "Users can view bank reconciliations from leur company" ON public.bank_reconciliations;
DROP POLICY IF EXISTS "Users can view bank reconciliations from their company" ON public.bank_reconciliations;

-- Client Measurements
DROP POLICY IF EXISTS "Users can view client measurements from their company" ON public.client_measurements;

-- Clients
DROP POLICY IF EXISTS "Users can view clients from their company" ON public.clients;

-- Customer Invoice Lines
DROP POLICY IF EXISTS "Users can view invoice lines from their company" ON public.customer_invoice_lines;

-- Customer Invoices
DROP POLICY IF EXISTS "Users can view customer invoices from their company" ON public.customer_invoices;

-- Depreciations
DROP POLICY IF EXISTS "Users can insert depreciations for their company" ON public.depreciations;
DROP POLICY IF EXISTS "Users can view depreciations for their company" ON public.depreciations;
DROP POLICY IF EXISTS "Users can view depreciations from leur company" ON public.depreciations;
DROP POLICY IF EXISTS "Users can view depreciations from their company" ON public.depreciations;

-- Employee Payment Types
DROP POLICY IF EXISTS "Users can view employee payment types from their company" ON public.employee_payment_types;

-- Employees
DROP POLICY IF EXISTS "Users can view employees from their company" ON public.employees;

-- Fixed Asset Categories
DROP POLICY IF EXISTS "Users can view fixed asset categories from their company" ON public.fixed_asset_categories;

-- Fixed Assets
DROP POLICY IF EXISTS "Users can insert fixed assets for their company" ON public.fixed_assets;
DROP POLICY IF EXISTS "Users can update fixed assets for their company" ON public.fixed_assets;
DROP POLICY IF EXISTS "Users can view fixed assets for their company" ON public.fixed_assets;
DROP POLICY IF EXISTS "Users can view fixed assets from leur company" ON public.fixed_assets;
DROP POLICY IF EXISTS "Users can view fixed assets from their company" ON public.fixed_assets;

-- Models
DROP POLICY IF EXISTS "Users can view models from leur company" ON public.models;
DROP POLICY IF EXISTS "Users can view models from their company" ON public.models;

-- Order Items
DROP POLICY IF EXISTS "Users can view order_items from their company" ON public.order_items;

-- Order Materials
DROP POLICY IF EXISTS "Users can view order materials from leur company" ON public.order_materials;
DROP POLICY IF EXISTS "Users can view order materials from their company" ON public.order_materials;
DROP POLICY IF EXISTS "Users can view order_materials from their company" ON public.order_materials;

-- Orders
DROP POLICY IF EXISTS "Users can view orders from their company" ON public.orders;

-- Patterns
DROP POLICY IF EXISTS "Users can view patterns from leur company" ON public.patterns;
DROP POLICY IF EXISTS "Users can view patterns from their company" ON public.patterns;

-- Payment Reminders
DROP POLICY IF EXISTS "Users can view payment reminders from their company" ON public.payment_reminders;

-- Product Categories
DROP POLICY IF EXISTS "Users can view product categories from leur company" ON public.product_categories;
DROP POLICY IF EXISTS "Users can view product categories from their company" ON public.product_categories;

-- Products
DROP POLICY IF EXISTS "Users can view products from their company" ON public.products;

-- Production Tasks
DROP POLICY IF EXISTS "Employees can update their own tasks" ON public.production_tasks;
DROP POLICY IF EXISTS "Users can view production tasks from their company" ON public.production_tasks;

-- Production Tracking
DROP POLICY IF EXISTS "Users can view production tracking from leur company" ON public.production_tracking;
DROP POLICY IF EXISTS "Users can view production tracking from their company" ON public.production_tracking;

-- =====================================================
-- PARTIE 2: Recréer les politiques optimisées
-- =====================================================

-- Production Tasks (fix auth_rls_initplan)
CREATE POLICY "Employees can update their own tasks"
ON public.production_tasks
FOR UPDATE
TO authenticated
USING (
  company_id = get_user_company_id() 
  AND employee_id IN (
    SELECT id FROM employees WHERE user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can view production tasks"
ON public.production_tasks
FOR SELECT
TO authenticated
USING (company_id = get_user_company_id());

-- Les politiques "Owner can manage" et "Managers can manage" restent inchangées car elles utilisent déjà les bonnes pratiques