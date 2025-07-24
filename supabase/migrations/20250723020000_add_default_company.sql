-- Données de base pour l'application (entreprise par défaut)
-- Migration: 20250723020000_add_default_company.sql

-- Créer une entreprise par défaut si elle n'existe pas
INSERT INTO public.companies (
    id,
    name,
    email,
    created_at,
    updated_at,
    is_active
)
SELECT 
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Atelier Demo',
    'demo@atelierpro.com',
    NOW(),
    NOW(),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies WHERE id = '00000000-0000-0000-0000-000000000001'::UUID
);

-- Vérification : afficher les entreprises
SELECT 
    id,
    name,
    email,
    created_at
FROM public.companies;
