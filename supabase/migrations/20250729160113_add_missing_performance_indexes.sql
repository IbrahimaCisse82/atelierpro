-- Migration pour ajouter les index de performance manquants
-- Détectés par le Performance Advisor
-- Créé le: 2025-01-29 16:01:13

-- Index manquants détectés
DO $$
BEGIN
    -- Index pour bank_reconciliations
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_reconciliations_company_id') THEN
        CREATE INDEX idx_bank_reconciliations_company_id ON public.bank_reconciliations(company_id);
        RAISE NOTICE '✅ Index créé: idx_bank_reconciliations_company_id';
    END IF;

    -- Index pour depreciations
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_depreciations_company_id') THEN
        CREATE INDEX idx_depreciations_company_id ON public.depreciations(company_id);
        RAISE NOTICE '✅ Index créé: idx_depreciations_company_id';
    END IF;

    -- Index pour stock_valuation_movements
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_valuation_movements_company_id') THEN
        CREATE INDEX idx_stock_valuation_movements_company_id ON public.stock_valuation_movements(company_id);
        RAISE NOTICE '✅ Index créé: idx_stock_valuation_movements_company_id';
    END IF;

    -- Index pour stock_valuation_settings
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_valuation_settings_company_id') THEN
        CREATE INDEX idx_stock_valuation_settings_company_id ON public.stock_valuation_settings(company_id);
        RAISE NOTICE '✅ Index créé: idx_stock_valuation_settings_company_id';
    END IF;

    -- Index pour treasury_accounts
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_treasury_accounts_company_id') THEN
        CREATE INDEX idx_treasury_accounts_company_id ON public.treasury_accounts(company_id);
        RAISE NOTICE '✅ Index créé: idx_treasury_accounts_company_id';
    END IF;

    RAISE NOTICE '=== INDEX DE PERFORMANCE AJOUTÉS ===';
    RAISE NOTICE 'Toutes les tables avec company_id ont maintenant des index optimisés';
END
$$;

-- Vérification finale des performances
DO $$
DECLARE
    missing_indexes integer;
BEGIN
    -- Compter les tables avec company_id qui n'ont pas d'index
    SELECT COUNT(*) INTO missing_indexes
    FROM pg_tables t
    WHERE t.schemaname = 'public'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_schema = 'public' 
          AND c.table_name = t.tablename 
          AND c.column_name = 'company_id'
      )
      AND NOT EXISTS (
        SELECT 1 FROM pg_indexes i 
        WHERE i.tablename = t.tablename 
          AND i.schemaname = t.schemaname 
          AND i.indexdef LIKE '%company_id%'
      );
    
    IF missing_indexes = 0 THEN
        RAISE NOTICE '🎉 PERFORMANCE OPTIMALE: Tous les index nécessaires sont présents';
    ELSE
        RAISE NOTICE '⚠️  Il reste % tables sans index company_id', missing_indexes;
    END IF;
END
$$;

COMMENT ON SCHEMA public IS 'Schéma avec RLS optimisé et index de performance complets';
