-- Migration pour le système de production et rémunération
-- Date: 2025-07-13

-- Table des commandes (orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'completed', 'delivered', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    total_amount DECIMAL(12,2) DEFAULT 0,
    advance_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Table des productions (production_tasks)
CREATE TABLE IF NOT EXISTS production_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    remuneration_amount DECIMAL(10,2) DEFAULT 0,
    remuneration_status VARCHAR(20) DEFAULT 'pending' CHECK (remuneration_status IN ('pending', 'approved', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Table des rémunérations (remunerations)
CREATE TABLE IF NOT EXISTS remunerations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    production_task_id UUID REFERENCES production_tasks(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'task' CHECK (payment_type IN ('task', 'fixed')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Table des types de rémunération des employés (employee_payment_types)
CREATE TABLE IF NOT EXISTS employee_payment_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('task', 'fixed')),
    fixed_salary DECIMAL(10,2) DEFAULT 0,
    task_rate DECIMAL(10,2) DEFAULT 0, -- Taux par heure ou par tâche
    effective_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);

CREATE INDEX IF NOT EXISTS idx_production_tasks_company_id ON production_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_production_tasks_order_id ON production_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_production_tasks_employee_id ON production_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_production_tasks_status ON production_tasks(status);
CREATE INDEX IF NOT EXISTS idx_production_tasks_remuneration_status ON production_tasks(remuneration_status);

CREATE INDEX IF NOT EXISTS idx_remunerations_company_id ON remunerations(company_id);
CREATE INDEX IF NOT EXISTS idx_remunerations_employee_id ON remunerations(employee_id);
CREATE INDEX IF NOT EXISTS idx_remunerations_status ON remunerations(status);
CREATE INDEX IF NOT EXISTS idx_remunerations_payment_date ON remunerations(payment_date);

CREATE INDEX IF NOT EXISTS idx_employee_payment_types_company_id ON employee_payment_types(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_payment_types_employee_id ON employee_payment_types(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_payment_types_is_active ON employee_payment_types(is_active);

-- Fonction pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    company_prefix VARCHAR(10);
BEGIN
    -- Récupérer le préfixe de l'entreprise
    SELECT SUBSTRING(name FROM 1 FOR 3) INTO company_prefix
    FROM companies
    WHERE id = NEW.company_id;
    
    -- Générer le numéro séquentiel
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH(company_prefix) + 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM orders
    WHERE company_id = NEW.company_id
    AND order_number LIKE company_prefix || '-%';
    
    -- Formater le numéro de commande
    NEW.order_number := company_prefix || '-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de commande
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION generate_order_number();

-- Fonction pour mettre à jour le statut de la commande quand toutes les tâches sont terminées
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    -- Compter le nombre total de tâches pour cette commande
    SELECT COUNT(*) INTO total_tasks
    FROM production_tasks
    WHERE order_id = NEW.order_id;
    
    -- Compter le nombre de tâches terminées
    SELECT COUNT(*) INTO completed_tasks
    FROM production_tasks
    WHERE order_id = NEW.order_id AND status = 'completed';
    
    -- Si toutes les tâches sont terminées, marquer la commande comme terminée
    IF total_tasks > 0 AND completed_tasks = total_tasks THEN
        UPDATE orders
        SET status = 'completed', completion_date = CURRENT_DATE
        WHERE id = NEW.order_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le statut de la commande
CREATE TRIGGER trigger_update_order_status
    AFTER UPDATE ON production_tasks
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_order_status();

-- Fonction pour calculer automatiquement la rémunération basée sur le type de paiement
CREATE OR REPLACE FUNCTION calculate_remuneration()
RETURNS TRIGGER AS $$
DECLARE
    payment_type_info RECORD;
    calculated_amount DECIMAL(10,2);
BEGIN
    -- Récupérer le type de paiement de l'employé
    SELECT payment_type, task_rate, fixed_salary
    INTO payment_type_info
    FROM employee_payment_types
    WHERE employee_id = NEW.employee_id
    AND is_active = true
    AND effective_date <= CURRENT_DATE
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    ORDER BY effective_date DESC
    LIMIT 1;
    
    IF FOUND THEN
        -- Calculer la rémunération selon le type
        IF payment_type_info.payment_type = 'task' THEN
            -- Rémunération à la tâche
            calculated_amount := COALESCE(NEW.actual_hours, NEW.estimated_hours) * payment_type_info.task_rate;
        ELSE
            -- Rémunération forfaitaire (proportionnelle au temps passé)
            calculated_amount := payment_type_info.fixed_salary * 
                (COALESCE(NEW.actual_hours, NEW.estimated_hours) / 160.0); -- 160h = mois standard
        END IF;
        
        -- Mettre à jour la rémunération
        NEW.remuneration_amount := calculated_amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement la rémunération
CREATE TRIGGER trigger_calculate_remuneration
    BEFORE INSERT OR UPDATE ON production_tasks
    FOR EACH ROW
    EXECUTE FUNCTION calculate_remuneration();

-- Politiques RLS pour les commandes
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders from their company" ON orders
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid()
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Managers can manage orders from their company" ON orders
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Politiques RLS pour les tâches de production
ALTER TABLE production_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view production tasks from their company" ON production_tasks
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid()
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Managers can manage production tasks from their company" ON production_tasks
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Employees can update their own tasks" ON production_tasks
    FOR UPDATE USING (
        employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

-- Politiques RLS pour les rémunérations
ALTER TABLE remunerations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view remunerations from their company" ON remunerations
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid()
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Managers can manage remunerations from their company" ON remunerations
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Politiques RLS pour les types de paiement des employés
ALTER TABLE employee_payment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employee payment types from their company" ON employee_payment_types
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid()
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Managers can manage employee payment types from their company" ON employee_payment_types
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM employees WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
            UNION
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Fonction pour obtenir les statistiques de production
CREATE OR REPLACE FUNCTION get_production_stats(p_company_id UUID)
RETURNS TABLE (
    total_orders INTEGER,
    pending_orders INTEGER,
    in_production_orders INTEGER,
    completed_orders INTEGER,
    total_tasks INTEGER,
    pending_tasks INTEGER,
    in_progress_tasks INTEGER,
    completed_tasks INTEGER,
    total_remuneration DECIMAL(12,2),
    pending_remuneration DECIMAL(12,2)
) AS $$
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
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les rémunérations d'un employé
CREATE OR REPLACE FUNCTION get_employee_remunerations(p_employee_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    task_name VARCHAR(255),
    order_number VARCHAR(50),
    completion_date DATE,
    hours_worked DECIMAL(5,2),
    remuneration_amount DECIMAL(10,2),
    remuneration_status VARCHAR(20),
    payment_date DATE
) AS $$
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
$$ LANGUAGE plpgsql;

-- Données de test pour les types de paiement
INSERT INTO employee_payment_types (company_id, employee_id, payment_type, fixed_salary, task_rate, effective_date, is_active)
SELECT 
    e.company_id,
    e.id,
    CASE 
        WHEN e.role = 'tailor' THEN 'task'
        ELSE 'fixed'
    END,
    CASE 
        WHEN e.role = 'tailor' THEN 0
        ELSE 150000 -- Salaire fixe pour les autres rôles
    END,
    CASE 
        WHEN e.role = 'tailor' THEN 2500 -- 2500 FCFA par heure pour les tailleurs
        ELSE 0
    END,
    CURRENT_DATE,
    true
FROM employees e
WHERE e.company_id IS NOT NULL
ON CONFLICT DO NOTHING; 