
-- =============================================
-- FIX 1: Convert ALL RLS policies to PERMISSIVE
-- FIX 2: Fix privilege escalation on user_roles
-- FIX 3: Recreate on_auth_user_created trigger
-- =============================================

-- Helper: Create a security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  )
$$;

-- =============================================
-- Drop ALL existing RESTRICTIVE policies
-- =============================================

-- alerts
DROP POLICY IF EXISTS "Company isolation delete" ON public.alerts;
DROP POLICY IF EXISTS "Company isolation insert" ON public.alerts;
DROP POLICY IF EXISTS "Company isolation select" ON public.alerts;
DROP POLICY IF EXISTS "Company isolation update" ON public.alerts;

-- client_measurements
DROP POLICY IF EXISTS "Company isolation delete" ON public.client_measurements;
DROP POLICY IF EXISTS "Company isolation insert" ON public.client_measurements;
DROP POLICY IF EXISTS "Company isolation select" ON public.client_measurements;
DROP POLICY IF EXISTS "Company isolation update" ON public.client_measurements;

-- clients
DROP POLICY IF EXISTS "Company isolation delete" ON public.clients;
DROP POLICY IF EXISTS "Company isolation insert" ON public.clients;
DROP POLICY IF EXISTS "Company isolation select" ON public.clients;
DROP POLICY IF EXISTS "Company isolation update" ON public.clients;

-- companies
DROP POLICY IF EXISTS "No direct company insert" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;

-- customer_invoices
DROP POLICY IF EXISTS "Company isolation delete" ON public.customer_invoices;
DROP POLICY IF EXISTS "Company isolation insert" ON public.customer_invoices;
DROP POLICY IF EXISTS "Company isolation select" ON public.customer_invoices;
DROP POLICY IF EXISTS "Company isolation update" ON public.customer_invoices;

-- depreciations
DROP POLICY IF EXISTS "Company isolation delete" ON public.depreciations;
DROP POLICY IF EXISTS "Company isolation insert" ON public.depreciations;
DROP POLICY IF EXISTS "Company isolation select" ON public.depreciations;
DROP POLICY IF EXISTS "Company isolation update" ON public.depreciations;

-- employees
DROP POLICY IF EXISTS "Company isolation delete" ON public.employees;
DROP POLICY IF EXISTS "Company isolation insert" ON public.employees;
DROP POLICY IF EXISTS "Company isolation select" ON public.employees;
DROP POLICY IF EXISTS "Company isolation update" ON public.employees;

-- fixed_assets
DROP POLICY IF EXISTS "Company isolation delete" ON public.fixed_assets;
DROP POLICY IF EXISTS "Company isolation insert" ON public.fixed_assets;
DROP POLICY IF EXISTS "Company isolation select" ON public.fixed_assets;
DROP POLICY IF EXISTS "Company isolation update" ON public.fixed_assets;

-- models
DROP POLICY IF EXISTS "Company isolation delete" ON public.models;
DROP POLICY IF EXISTS "Company isolation insert" ON public.models;
DROP POLICY IF EXISTS "Company isolation select" ON public.models;
DROP POLICY IF EXISTS "Company isolation update" ON public.models;

-- order_items
DROP POLICY IF EXISTS "Company isolation delete" ON public.order_items;
DROP POLICY IF EXISTS "Company isolation insert" ON public.order_items;
DROP POLICY IF EXISTS "Company isolation select" ON public.order_items;
DROP POLICY IF EXISTS "Company isolation update" ON public.order_items;

-- orders
DROP POLICY IF EXISTS "Company isolation delete" ON public.orders;
DROP POLICY IF EXISTS "Company isolation insert" ON public.orders;
DROP POLICY IF EXISTS "Company isolation select" ON public.orders;
DROP POLICY IF EXISTS "Company isolation update" ON public.orders;

-- patterns
DROP POLICY IF EXISTS "Company isolation delete" ON public.patterns;
DROP POLICY IF EXISTS "Company isolation insert" ON public.patterns;
DROP POLICY IF EXISTS "Company isolation select" ON public.patterns;
DROP POLICY IF EXISTS "Company isolation update" ON public.patterns;

-- payment_reminders
DROP POLICY IF EXISTS "Company isolation delete" ON public.payment_reminders;
DROP POLICY IF EXISTS "Company isolation insert" ON public.payment_reminders;
DROP POLICY IF EXISTS "Company isolation select" ON public.payment_reminders;
DROP POLICY IF EXISTS "Company isolation update" ON public.payment_reminders;

-- product_categories
DROP POLICY IF EXISTS "Company isolation delete" ON public.product_categories;
DROP POLICY IF EXISTS "Company isolation insert" ON public.product_categories;
DROP POLICY IF EXISTS "Company isolation select" ON public.product_categories;
DROP POLICY IF EXISTS "Company isolation update" ON public.product_categories;

-- production_tasks
DROP POLICY IF EXISTS "Company isolation delete" ON public.production_tasks;
DROP POLICY IF EXISTS "Company isolation insert" ON public.production_tasks;
DROP POLICY IF EXISTS "Company isolation select" ON public.production_tasks;
DROP POLICY IF EXISTS "Company isolation update" ON public.production_tasks;

-- production_tracking
DROP POLICY IF EXISTS "Company isolation delete" ON public.production_tracking;
DROP POLICY IF EXISTS "Company isolation insert" ON public.production_tracking;
DROP POLICY IF EXISTS "Company isolation select" ON public.production_tracking;
DROP POLICY IF EXISTS "Company isolation update" ON public.production_tracking;

-- products
DROP POLICY IF EXISTS "Company isolation delete" ON public.products;
DROP POLICY IF EXISTS "Company isolation insert" ON public.products;
DROP POLICY IF EXISTS "Company isolation select" ON public.products;
DROP POLICY IF EXISTS "Company isolation update" ON public.products;

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view company profiles" ON public.profiles;

-- purchase_orders
DROP POLICY IF EXISTS "Company isolation delete" ON public.purchase_orders;
DROP POLICY IF EXISTS "Company isolation insert" ON public.purchase_orders;
DROP POLICY IF EXISTS "Company isolation select" ON public.purchase_orders;
DROP POLICY IF EXISTS "Company isolation update" ON public.purchase_orders;

-- receptions
DROP POLICY IF EXISTS "Company isolation delete" ON public.receptions;
DROP POLICY IF EXISTS "Company isolation insert" ON public.receptions;
DROP POLICY IF EXISTS "Company isolation select" ON public.receptions;
DROP POLICY IF EXISTS "Company isolation update" ON public.receptions;

-- suppliers
DROP POLICY IF EXISTS "Company isolation delete" ON public.suppliers;
DROP POLICY IF EXISTS "Company isolation insert" ON public.suppliers;
DROP POLICY IF EXISTS "Company isolation select" ON public.suppliers;
DROP POLICY IF EXISTS "Company isolation update" ON public.suppliers;

-- treasury_accounts
DROP POLICY IF EXISTS "Company isolation delete" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Company isolation insert" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Company isolation select" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Company isolation update" ON public.treasury_accounts;

-- treasury_movements
DROP POLICY IF EXISTS "Company isolation delete" ON public.treasury_movements;
DROP POLICY IF EXISTS "Company isolation insert" ON public.treasury_movements;
DROP POLICY IF EXISTS "Company isolation select" ON public.treasury_movements;
DROP POLICY IF EXISTS "Company isolation update" ON public.treasury_movements;

-- user_roles
DROP POLICY IF EXISTS "No direct user role insert" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view company roles" ON public.user_roles;

-- work_hours
DROP POLICY IF EXISTS "Company isolation delete" ON public.work_hours;
DROP POLICY IF EXISTS "Company isolation insert" ON public.work_hours;
DROP POLICY IF EXISTS "Company isolation select" ON public.work_hours;
DROP POLICY IF EXISTS "Company isolation update" ON public.work_hours;

-- =============================================
-- Recreate ALL as PERMISSIVE with company isolation
-- =============================================

-- MACRO: company-isolated CRUD for standard tables
DO $$ 
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'alerts', 'client_measurements', 'clients', 'customer_invoices',
    'depreciations', 'employees', 'fixed_assets', 'models',
    'order_items', 'orders', 'patterns', 'payment_reminders',
    'product_categories', 'production_tasks', 'production_tracking',
    'products', 'purchase_orders', 'receptions', 'suppliers',
    'treasury_accounts', 'treasury_movements', 'work_hours'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY "Company members can select" ON public.%I FOR SELECT TO authenticated USING (company_id = public.get_user_company_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Company members can insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Company members can update" ON public.%I FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Company members can delete" ON public.%I FOR DELETE TO authenticated USING (company_id = public.get_user_company_id())',
      tbl
    );
  END LOOP;
END $$;

-- companies: SELECT own, UPDATE own (owners only), no direct INSERT/DELETE
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT TO authenticated
  USING (id = public.get_user_company_id());

CREATE POLICY "Owners can update own company"
  ON public.companies FOR UPDATE TO authenticated
  USING (id = public.get_user_company_id() AND public.has_role(auth.uid(), 'owner'));

-- profiles: view own + company, insert/update own
CREATE POLICY "Users can view own and company profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR company_id = public.get_user_company_id());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- user_roles: SELECT own + company, NO self-update, only owners can manage
CREATE POLICY "Users can view company roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR company_id = public.get_user_company_id());

CREATE POLICY "Only owners can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'owner')
    AND company_id = public.get_user_company_id()
    AND user_id != auth.uid()
  );

-- =============================================
-- FIX 3: Recreate trigger on auth.users
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
