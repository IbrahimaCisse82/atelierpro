-- Créer un utilisateur de test via les fonctions administratives
-- Cette approche utilise les fonctions intégrées de Supabase

DO $$
DECLARE
    user_id uuid;
    company_id uuid;
BEGIN
    -- Obtenir l'ID de la première entreprise
    SELECT id INTO company_id FROM public.companies ORDER BY created_at LIMIT 1;
    
    IF company_id IS NULL THEN
        RAISE EXCEPTION 'Aucune entreprise trouvée. Veuillez créer une entreprise d''abord.';
    END IF;
    
    -- Générer un ID utilisateur
    user_id := gen_random_uuid();
    
    -- Créer le profil utilisateur directement
    INSERT INTO public.profiles (
        user_id,
        company_id,
        email,
        role,
        first_name,
        last_name,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        company_id,
        'ict@growhubsenegal.com',
        'owner',
        'Demo',
        'User',
        now(),
        now()
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Profil utilisateur créé avec ID: %', user_id;
    RAISE NOTICE 'Email: ict@growhubsenegal.com';
    RAISE NOTICE 'Mot de passe: Demo123456!';
    RAISE NOTICE 'IMPORTANT: Utilisez la fonction d''inscription de l''application pour créer le compte auth complet.';
END $$;