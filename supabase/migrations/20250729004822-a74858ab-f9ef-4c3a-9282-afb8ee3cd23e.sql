-- Créer un utilisateur de test pour la démonstration
-- Nous utilisons une fonction pour créer l'utilisateur avec un profil complet

INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ict@growhubsenegal.com',
    crypt('Demo123456!', gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Demo", "last_name": "User"}',
    false,
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Créer le profil utilisateur associé
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
    (SELECT id FROM auth.users WHERE email = 'ict@growhubsenegal.com'),
    (SELECT id FROM public.companies ORDER BY created_at LIMIT 1),
    'ict@growhubsenegal.com',
    'owner',
    'Demo',
    'User',
    now(),
    now()
) ON CONFLICT (user_id) DO NOTHING;