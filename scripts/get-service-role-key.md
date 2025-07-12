# Guide pour récupérer la clé Service Role Supabase

## Étapes à suivre :

1. **Accédez au dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Connectez-vous à votre compte

2. **Sélectionnez votre projet**
   - Cliquez sur le projet "atelierpro" ou votre projet

3. **Accédez aux paramètres API**
   - Dans le menu de gauche, cliquez sur "Settings"
   - Puis cliquez sur "API"

4. **Copiez la clé Service Role**
   - Dans la section "Project API keys"
   - Copiez la valeur de "service_role" (commence par `eyJ...`)
   - ⚠️ **NE PARTAGEZ JAMAIS CETTE CLÉ PUBLIQUEMENT**

5. **Ajoutez la clé au fichier .env**
   ```bash
   echo "SUPABASE_SERVICE_ROLE_KEY=votre_vraie_cle_ici" >> .env
   ```

6. **Testez la configuration**
   ```bash
   npx tsx scripts/force-confirm-user.ts
   ```

## Important :
- La clé Service Role a des privilèges d'administration complets
- Elle peut contourner les politiques RLS (Row Level Security)
- Utilisez-la uniquement pour les opérations d'administration
- Ne l'exposez jamais côté client

## Alternative temporaire :
Si vous ne pouvez pas accéder au dashboard, vous pouvez :
1. Désactiver temporairement la confirmation d'email dans Supabase Auth
2. Ou créer un nouvel utilisateur avec un email valide 