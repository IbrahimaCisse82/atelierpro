-- Migration pour corriger les profils manquants

-- 1. Créer la company "Demo Couture" si elle n'existe pas
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM public.companies WHERE name = 'Demo Couture';
  
  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (name, email, is_active, created_at, updated_at)
    VALUES ('Demo Couture', 'demo@democouture.com', true, NOW(), NOW())
    RETURNING id INTO v_company_id;
    RAISE NOTICE 'Entreprise Demo Couture créée avec ID: %', v_company_id;
  ELSE
    RAISE NOTICE 'Entreprise Demo Couture existe déjà avec ID: %', v_company_id;
  END IF;
END $$;

-- 2. Créer manuellement les profils pour tous les utilisateurs auth sans profil
DO $$
DECLARE
  auth_user RECORD;
  default_company_id UUID;
  created_count INTEGER := 0;
BEGIN
  -- Obtenir l'ID de la première entreprise (ou Demo Couture)
  SELECT id INTO default_company_id 
  FROM public.companies 
  WHERE name = 'Demo Couture' OR true
  ORDER BY 
    CASE WHEN name = 'Demo Couture' THEN 0 ELSE 1 END,
    created_at 
  LIMIT 1;
  
  IF default_company_id IS NULL THEN
    RAISE EXCEPTION 'Aucune entreprise trouvée';
  END IF;
  
  -- Créer les profils manquants
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles pu ON au.id = pu.user_id
    WHERE pu.user_id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        user_id,
        company_id,
        email,
        role,
        first_name,
        last_name,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        auth_user.id,
        default_company_id,
        auth_user.email,
        'tailor'::public.user_role,
        COALESCE(auth_user.raw_user_meta_data->>'first_name', 'Prénom'),
        COALESCE(auth_user.raw_user_meta_data->>'last_name', 'Nom'),
        true,
        COALESCE(auth_user.created_at, NOW()),
        NOW()
      );
      
      created_count := created_count + 1;
      RAISE NOTICE 'Profil créé pour: % (ID: %)', auth_user.email, auth_user.id;
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'Profil existe déjà pour: %', auth_user.email;
      WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la création du profil pour %: %', auth_user.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Nombre total de profils créés: %', created_count;
END $$;