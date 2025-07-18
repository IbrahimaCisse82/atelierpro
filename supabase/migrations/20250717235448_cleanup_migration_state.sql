-- Migration de nettoyage pour résoudre les problèmes d'état des migrations
-- Cette migration s'assure que l'état des migrations est cohérent

-- Vérifier et créer la table de migrations si elle n'existe pas
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY,
    statements text[],
    name text
);

-- Nettoyer les triggers en double ou problématiques
-- Ceci est idempotent et ne causera pas d'erreur si les triggers n'existent pas
DO $$
DECLARE
    trigger_name text;
    table_name text;
BEGIN
    -- Liste des triggers à nettoyer
    FOR trigger_name, table_name IN VALUES
        ('update_companies_updated_at', 'companies'),
        ('update_profiles_updated_at', 'profiles'),
        ('update_clients_updated_at', 'clients'),
        ('update_client_measurements_updated_at', 'client_measurements'),
        ('update_suppliers_updated_at', 'suppliers'),
        ('update_product_categories_updated_at', 'product_categories'),
        ('update_products_updated_at', 'products'),
        ('update_purchase_orders_updated_at', 'purchase_orders'),
        ('update_purchase_order_items_updated_at', 'purchase_order_items'),
        ('update_supplier_invoices_updated_at', 'supplier_invoices'),
        ('update_models_updated_at', 'models'),
        ('update_orders_updated_at', 'orders'),
        ('update_order_items_updated_at', 'order_items'),
        ('update_order_materials_updated_at', 'order_materials'),
        ('update_customer_invoices_updated_at', 'customer_invoices'),
        ('update_employees_updated_at', 'employees'),
        ('update_work_hours_updated_at', 'work_hours')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trigger_name, table_name);
        RAISE NOTICE 'Trigger %s supprimé de la table %s si il existait', trigger_name, table_name;
    END LOOP;
END $$;

-- Nettoyer les triggers d'authentification
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

-- Recréer les triggers updated_at de manière idempotente
-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recréer les triggers pour toutes les tables qui ont une colonne updated_at
DO $$
DECLARE
    table_info RECORD;
BEGIN
    FOR table_info IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'updated_at'
        AND table_name NOT IN ('schema_migrations')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', table_info.table_name, table_info.table_name);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', table_info.table_name, table_info.table_name);
        RAISE NOTICE 'Trigger update_%_updated_at créé pour la table %', table_info.table_name, table_info.table_name;
    END LOOP;
END $$;

-- Recréer les triggers d'authentification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET last_login = NOW(), updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- Recréer les triggers d'authentification
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.update_last_login();

-- Marquer cette migration comme appliquée (idempotent)
-- Cette partie sera gérée automatiquement par le système de migration de Supabase

-- Log de fin
DO $$
BEGIN
    RAISE NOTICE 'Migration de nettoyage terminée avec succès';
END $$;
