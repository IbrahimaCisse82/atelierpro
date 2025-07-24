-- Alternative: Création automatique de profil utilisateur via webhook/trigger public
-- Migration: 20250723010000_user_profile_management.sql

-- 1. Fonction publique pour créer un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    -- Créer automatiquement un profil utilisateur lors de l'inscription
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
        NEW.id,
        (SELECT id FROM public.companies ORDER BY created_at LIMIT 1), -- Première entreprise par défaut
        NEW.email,
        'tailor', -- rôle par défaut (valide dans l'enum)
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- L'utilisateur existe déjà, mettre à jour
        UPDATE public.profiles SET
            email = NEW.email,
            updated_at = NOW()
        WHERE user_id = NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'insertion
        RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- 2. Fonction pour nettoyer le profil utilisateur lors de suppression
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    -- Supprimer le profil utilisateur et données associées
    DELETE FROM public.profiles WHERE user_id = OLD.id;
    
    RETURN OLD;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer la suppression
        RAISE WARNING 'Erreur lors de la suppression du profil: %', SQLERRM;
        RETURN OLD;
END;
$$;

-- 3. Fonction utilitaire pour créer un utilisateur complet
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
    user_email TEXT,
    user_password TEXT,
    user_first_name TEXT DEFAULT '',
    user_last_name TEXT DEFAULT '',
    user_role TEXT DEFAULT 'tailor',
    user_company_id UUID DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    new_user_id UUID;
    target_company_id UUID;
    result JSON;
BEGIN
    -- Cette fonction sera appelée par les scripts côté serveur
    -- Elle crée un utilisateur dans auth.users ET dans public.profiles
    
    -- Générer un UUID pour le nouvel utilisateur
    new_user_id := gen_random_uuid();
    
    -- Déterminer l'entreprise cible
    IF user_company_id IS NULL THEN
        SELECT id INTO target_company_id FROM public.companies ORDER BY created_at LIMIT 1;
    ELSE
        target_company_id := user_company_id;
    END IF;
    
    -- Créer le profil utilisateur dans public.profiles
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
        new_user_id,
        target_company_id,
        user_email,
        user_role::public.user_role,
        user_first_name,
        user_last_name,
        NOW(),
        NOW()
    );
    
    -- Retourner les informations
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', user_email,
        'company_id', target_company_id,
        'message', 'Profil utilisateur créé. Utiliser Supabase Auth pour finaliser.'
    );
    
    RETURN result;
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Un utilisateur avec cet email existe déjà'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 4. Fonction pour vérifier la cohérence des utilisateurs
CREATE OR REPLACE FUNCTION public.check_user_consistency()
RETURNS TABLE(
    status TEXT,
    auth_users_count BIGINT,
    public_profiles_count BIGINT,
    missing_profiles BIGINT,
    orphaned_profiles BIGINT
)
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'User Consistency Check'::TEXT as status,
        (SELECT COUNT(*) FROM auth.users) as auth_users_count,
        (SELECT COUNT(*) FROM public.profiles) as public_profiles_count,
        (SELECT COUNT(*) 
         FROM auth.users au 
         LEFT JOIN public.profiles pu ON au.id = pu.user_id 
         WHERE pu.user_id IS NULL) as missing_profiles,
        (SELECT COUNT(*) 
         FROM public.profiles pu 
         LEFT JOIN auth.users au ON pu.user_id = au.id 
         WHERE au.id IS NULL) as orphaned_profiles;
END;
$$;

-- 5. Fonction pour réparer les profils manquants
CREATE OR REPLACE FUNCTION public.repair_missing_profiles()
RETURNS JSON
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    auth_user RECORD;
    default_company_id UUID;
    created_count INTEGER := 0;
    result JSON;
BEGIN
    -- Obtenir l'ID de la première entreprise
    SELECT id INTO default_company_id FROM public.companies ORDER BY created_at LIMIT 1;
    
    IF default_company_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Aucune entreprise trouvée. Créer une entreprise d''abord.'
        );
    END IF;
    
    -- Créer les profils manquants pour les utilisateurs auth existants
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
        FROM auth.users au
        LEFT JOIN public.profiles pu ON au.id = pu.user_id
        WHERE pu.user_id IS NULL
    LOOP
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
            auth_user.id,
            default_company_id,
            auth_user.email,
            'tailor'::public.user_role,
            COALESCE(auth_user.raw_user_meta_data->>'first_name', ''),
            COALESCE(auth_user.raw_user_meta_data->>'last_name', ''),
            COALESCE(auth_user.created_at, NOW()),
            NOW()
        );
        
        created_count := created_count + 1;
        RAISE NOTICE 'Profil créé pour: %', auth_user.email;
    END LOOP;
    
    result := json_build_object(
        'success', true,
        'profiles_created', created_count,
        'message', format('%s profils créés', created_count)
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'profiles_created', created_count
        );
END;
$$;

-- 6. Réparer les profils manquants existants
SELECT public.repair_missing_profiles();

-- 7. Vérification finale
SELECT * FROM public.check_user_consistency();
