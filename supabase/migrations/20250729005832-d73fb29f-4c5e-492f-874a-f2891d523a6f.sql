-- Réinitialiser le mot de passe de l'utilisateur confirmé
UPDATE auth.users 
SET 
  encrypted_password = crypt('Demo123456!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'ict@growhubsenegal.com';

-- Vérifier que l'utilisateur est prêt pour la connexion
SELECT 
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  updated_at
FROM auth.users 
WHERE email = 'ict@growhubsenegal.com';