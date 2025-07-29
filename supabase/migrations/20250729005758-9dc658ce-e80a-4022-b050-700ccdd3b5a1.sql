-- Vérifier TOUS les utilisateurs avec cet email
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'ict@growhubsenegal.com'
ORDER BY created_at;