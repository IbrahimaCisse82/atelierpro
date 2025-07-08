-- Migration pour ajouter les modules métier de l'atelier couture
-- Date: 2025-07-08

-- =====================================================
-- MODULE CLIENTS
-- =====================================================

-- Table des clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- MODULE MESURES
-- =====================================================

-- Table des mesures clients
CREATE TABLE public.client_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  measurement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Mesures principales
  bust DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  shoulder_width DECIMAL(5,2),
  arm_length DECIMAL(5,2),
  leg_length DECIMAL(5,2),
  neck_circumference DECIMAL(5,2),
  
  -- Mesures supplémentaires
  chest_width DECIMAL(5,2),
  back_width DECIMAL(5,2),
  arm_circumference DECIMAL(5,2),
  thigh_circumference DECIMAL(5,2),
  calf_circumference DECIMAL(5,2),
  
  -- Notes et validation
  notes TEXT,
  is_validated BOOLEAN NOT NULL DEFAULT false,
  validated_by UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- MODULE STOCKS ET FOURNISSEURS
-- =====================================================

-- Table des fournisseurs
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms INTEGER DEFAULT 30, -- jours
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des catégories de produits
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des produits (tissus, accessoires, etc.)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.product_categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  unit TEXT NOT NULL DEFAULT 'm', -- mètre, pièce, etc.
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des mouvements de stock
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  reference TEXT, -- numéro de commande, facture, etc.
  notes TEXT,
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- MODULE ACHATS ET RÉCEPTIONS
-- =====================================================

-- Enum pour les statuts d'achat
CREATE TYPE public.purchase_status AS ENUM (
  'draft',
  'ordered',
  'confirmed',
  'in_transit',
  'delivered_not_received',
  'received',
  'invoice_received',
  'ready_to_pay',
  'paid',
  'cancelled'
);

-- Table des commandes fournisseurs
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  order_number TEXT NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  status public.purchase_status NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des lignes de commande fournisseur
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  received_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des réceptions
CREATE TABLE public.receptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id),
  reception_number TEXT NOT NULL,
  reception_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_validated BOOLEAN NOT NULL DEFAULT false,
  validated_by UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des lignes de réception
CREATE TABLE public.reception_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reception_id UUID NOT NULL REFERENCES public.receptions(id) ON DELETE CASCADE,
  purchase_order_item_id UUID NOT NULL REFERENCES public.purchase_order_items(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  ordered_quantity DECIMAL(10,2) NOT NULL,
  received_quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quality_check BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des factures fournisseurs
CREATE TABLE public.supplier_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id),
  invoice_number TEXT NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- MODULE MODÈLES ET PATRONS
-- =====================================================

-- Table des modèles
CREATE TABLE public.models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_hours DECIMAL(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des patrons (fichiers PDF)
CREATE TABLE public.patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- MODULE COMMANDES ET PRODUCTION
-- =====================================================

-- Enum pour les statuts de production
CREATE TYPE public.production_status AS ENUM (
  'order_created',
  'waiting_materials',
  'materials_allocated',
  'cutting_in_progress',
  'cutting_completed',
  'assembly_in_progress',
  'assembly_completed',
  'finishing_in_progress',
  'quality_check',
  'ready_to_deliver',
  'delivered',
  'invoiced',
  'paid',
  'cancelled'
);

-- Table des commandes
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  order_number TEXT NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  status public.production_status NOT NULL DEFAULT 'order_created',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  assigned_tailor_id UUID REFERENCES public.profiles(id),
  measurements_id UUID REFERENCES public.client_measurements(id),
  fabric_photos TEXT[], -- URLs des photos
  reference_photos TEXT[], -- URLs des photos de référence
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des lignes de commande
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.models(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des matériaux utilisés par commande
CREATE TABLE public.order_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_required DECIMAL(10,2) NOT NULL,
  quantity_allocated DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table du suivi de production
CREATE TABLE public.production_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.production_status NOT NULL,
  previous_status public.production_status,
  status_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  time_spent_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- MODULE FACTURATION
-- =====================================================

-- Table des factures clients
CREATE TABLE public.customer_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  invoice_number TEXT NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_with_tax DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- =====================================================
-- MODULE RH ET PAIE
-- =====================================================

-- Table des employés (tailleurs)
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  employee_number TEXT NOT NULL,
  hire_date DATE NOT NULL,
  hourly_rate DECIMAL(8,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Table des heures travaillées
CREATE TABLE public.work_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  work_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_hours DECIMAL(4,2),
  order_id UUID REFERENCES public.orders(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.employees(id),
  updated_by UUID NOT NULL REFERENCES public.employees(id)
);

-- =====================================================
-- MODULE ALERTES ET NOTIFICATIONS
-- =====================================================

-- Enum pour les types d'alertes
CREATE TYPE public.alert_type AS ENUM (
  'stock_low',
  'order_delay',
  'payment_due',
  'supplier_delivery',
  'quality_issue',
  'system_alert'
);

-- Enum pour les niveaux d'alerte
CREATE TYPE public.alert_level AS ENUM (
  'info',
  'warning',
  'error',
  'critical'
);

-- Table des alertes
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type public.alert_type NOT NULL,
  level public.alert_level NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT, -- 'order', 'product', 'client', etc.
  related_entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- =====================================================
-- ACTIVATION RLS ET POLITIQUES
-- =====================================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reception_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLITIQUES RLS DE BASE
-- =====================================================

-- Politiques pour les clients
CREATE POLICY "Users can view clients from their company"
  ON public.clients FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Orders and customer service can manage clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('orders') OR public.has_role('customer_service') OR public.has_role('owner')));

-- Politiques pour les commandes
CREATE POLICY "Users can view orders from their company"
  ON public.orders FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Tailors can view their assigned orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (assigned_tailor_id = auth.uid() OR public.has_role('manager') OR public.has_role('orders') OR public.has_role('owner')));

CREATE POLICY "Orders and manager can manage orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('orders') OR public.has_role('manager') OR public.has_role('owner')));

-- Politiques pour les stocks
CREATE POLICY "Users can view products from their company"
  ON public.products FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Stocks can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('stocks') OR public.has_role('owner')));

-- Politiques pour les achats
CREATE POLICY "Stocks can manage purchases"
  ON public.purchase_orders FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND 
         (public.has_role('stocks') OR public.has_role('owner')));

-- Politiques pour les employés
CREATE POLICY "Users can view employees from their company"
  ON public.employees FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Employees can view their own data"
  ON public.employees FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Owner can manage employees"
  ON public.employees FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id() AND public.has_role('owner'));

-- =====================================================
-- TRIGGERS POUR UPDATED_AT
-- =====================================================

-- Créer les triggers pour toutes les nouvelles tables
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_measurements_updated_at
  BEFORE UPDATE ON public.client_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at
  BEFORE UPDATE ON public.purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_invoices_updated_at
  BEFORE UPDATE ON public.supplier_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON public.models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_materials_updated_at
  BEFORE UPDATE ON public.order_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_invoices_updated_at
  BEFORE UPDATE ON public.customer_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_hours_updated_at
  BEFORE UPDATE ON public.work_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_clients_company_id ON public.clients(company_id);
CREATE INDEX idx_orders_company_id ON public.orders(company_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_assigned_tailor ON public.orders(assigned_tailor_id);
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_purchase_orders_company_id ON public.purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_alerts_company_id ON public.alerts(company_id);
CREATE INDEX idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX idx_production_tracking_order_id ON public.production_tracking(order_id);
CREATE INDEX idx_production_tracking_status_date ON public.production_tracking(status_date); 