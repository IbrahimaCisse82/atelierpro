-- Migration finale pour nettoyer et optimiser toutes les politiques RLS
-- Supprime TOUTES les politiques existantes et créé une politique unique par table
-- Créé le: 2025-01-29 15:50:56

-- 1. NETTOYAGE COMPLET - Supprimer toutes les politiques RLS existantes
DO $$
DECLARE
    pol_record RECORD;
    success_count integer := 0;
    error_count integer := 0;
BEGIN
    RAISE NOTICE '=== DÉBUT DU NETTOYAGE COMPLET DES POLITIQUES RLS ===';
    
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                pol_record.policyname, pol_record.schemaname, pol_record.tablename);
            success_count := success_count + 1;
            RAISE NOTICE 'Supprimé: % sur %', pol_record.policyname, pol_record.tablename;
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            RAISE NOTICE 'ERREUR suppression % sur %: %', pol_record.policyname, pol_record.tablename, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Nettoyage terminé: % succès, % erreurs', success_count, error_count;
END
$$;

-- 2. CRÉER DES POLITIQUES UNIFIÉES OPTIMISÉES
DO $$
DECLARE
    table_name text;
    policy_created boolean;
    
    -- Tables avec company_id
    company_tables text[] := ARRAY[
        'companies', 'profiles', 'clients', 'employees', 'products', 'suppliers',
        'purchase_orders', 'purchase_order_items', 'customer_invoices', 'alerts',
        'models', 'patterns', 'order_items', 'client_measurements', 'orders',
        'production_tracking', 'work_hours', 'product_categories', 'receptions',
        'reception_items', 'supplier_invoices', 'stock_movements', 'accounting_entries',
        'accounting_journals', 'accounting_entry_lines', 'bank_reconciliations',
        'bank_reconciliation_lines', 'depreciations', 'fixed_assets', 'syscohada_accounts',
        'treasury_accounts', 'stock_valuation_movements', 'stock_valuation_settings',
        'production_tasks', 'remunerations', 'employee_payment_types', 'order_materials'
    ];
BEGIN
    RAISE NOTICE '=== CRÉATION DES POLITIQUES UNIFIÉES ===';
    
    FOREACH table_name IN ARRAY company_tables
    LOOP
        policy_created := false;
        
        BEGIN
            -- Politique unifiée pour toutes les opérations
            EXECUTE format('
                CREATE POLICY "unified_access_%I" ON public.%I 
                FOR ALL TO authenticated 
                USING (company_id = (select get_user_company_id()))
                WITH CHECK (company_id = (select get_user_company_id()))
            ', table_name, table_name);
            
            policy_created := true;
            RAISE NOTICE '✅ Politique unifiée créée pour: %', table_name;
            
        EXCEPTION 
            WHEN undefined_table THEN
                RAISE NOTICE '⚠️  Table % n''existe pas', table_name;
            WHEN undefined_column THEN
                -- Tables sans company_id - politique simple
                BEGIN
                    EXECUTE format('
                        CREATE POLICY "unified_access_%I" ON public.%I 
                        FOR ALL TO authenticated 
                        USING (true)
                    ', table_name, table_name);
                    policy_created := true;
                    RAISE NOTICE '✅ Politique simple créée pour: % (pas de company_id)', table_name;
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE '❌ Erreur politique simple pour %: %', table_name, SQLERRM;
                END;
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Erreur sur %: %', table_name, SQLERRM;
        END;
    END LOOP;
END
$$;

-- 3. POLITIQUES SPÉCIALES AVEC LOGIQUE MÉTIER
DO $$
BEGIN
    RAISE NOTICE '=== POLITIQUES SPÉCIALES ===';
    
    -- Companies: accès seulement à sa propre entreprise
    BEGIN
        DROP POLICY IF EXISTS "unified_access_companies" ON public.companies;
        CREATE POLICY "company_own_access" ON public.companies
        FOR ALL TO authenticated
        USING (id = (select get_user_company_id()))
        WITH CHECK (id = (select get_user_company_id()));
        RAISE NOTICE '✅ Politique spéciale companies';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur companies: %', SQLERRM;
    END;
    
    -- Profiles: accès à son profil + vue des collègues de l'entreprise
    BEGIN
        DROP POLICY IF EXISTS "unified_access_profiles" ON public.profiles;
        CREATE POLICY "profiles_access" ON public.profiles
        FOR ALL TO authenticated
        USING (
            user_id = (select auth.uid()) OR 
            company_id = (select get_user_company_id())
        )
        WITH CHECK (
            user_id = (select auth.uid()) OR 
            company_id = (select get_user_company_id())
        );
        RAISE NOTICE '✅ Politique spéciale profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur profiles: %', SQLERRM;
    END;
    
    -- Employees: voir ses propres données + données de l'entreprise
    BEGIN
        DROP POLICY IF EXISTS "unified_access_employees" ON public.employees;
        CREATE POLICY "employees_access" ON public.employees  
        FOR ALL TO authenticated
        USING (
            user_id = (select auth.uid()) OR
            company_id = (select get_user_company_id())
        )
        WITH CHECK (
            user_id = (select auth.uid()) OR
            company_id = (select get_user_company_id())
        );
        RAISE NOTICE '✅ Politique spéciale employees';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur employees: %', SQLERRM;
    END;
END
$$;

-- 4. OPTIMISATION DES FONCTIONS POUR LA PERFORMANCE
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM profiles 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- 5. VÉRIFICATION FINALE
DO $$
DECLARE
    policy_count integer;
    table_count integer;
    duplicate_count integer;
BEGIN
    -- Compter les politiques par table pour détecter les doublons
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT tablename, COUNT(*) as nb_policies
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
        HAVING COUNT(*) > 2
    ) duplicates;
    
    -- Statistiques finales
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO table_count FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
    
    RAISE NOTICE '=== OPTIMISATION RLS FINALE TERMINÉE ===';
    RAISE NOTICE 'Politiques totales: %', policy_count;
    RAISE NOTICE 'Tables avec RLS: %', table_count;
    RAISE NOTICE 'Tables avec doublons: %', duplicate_count;
    
    IF duplicate_count = 0 THEN
        RAISE NOTICE '🎉 SUCCÈS: Aucun doublon détecté !';
    ELSE
        RAISE NOTICE '⚠️  Attention: % tables ont encore des doublons', duplicate_count;
    END IF;
END
$$;
