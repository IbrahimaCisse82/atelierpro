-- Confirmer automatiquement l'email de l'utilisateur créé
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  confirmed_at = now()
WHERE email = 'ict@growhubsenegal.com' 
  AND email_confirmed_at IS NULL;

-- Vérifier que l'utilisateur est bien confirmé
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'ict@growhubsenegal.com';