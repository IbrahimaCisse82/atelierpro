# ✅ Solution Erreur "invalid_credentials" - AtelierPro

## 🎯 Problème Identifié

Le diagnostic a révélé que l'utilisateur `demo@atelierpro.com` existe dans Supabase mais **l'email n'est pas confirmé**, ce qui cause l'erreur "Invalid login credentials".

## 🔧 Solution Immédiate

### Option 1: Confirmation via Script (Recommandée)

1. **Récupérer votre SERVICE_ROLE_KEY :**
   - Allez dans votre dashboard Supabase
   - Settings → API
   - Copiez la "service_role" key

2. **Exécuter le script de confirmation :**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role npx tsx scripts/confirm-demo-user.ts
   ```

3. **Vérifier la connexion :**
   - Allez sur https://atelierpro-production.up.railway.app
   - Connectez-vous avec :
     - Email: `demo@atelierpro.com`
     - Mot de passe: `DemoTest@1234`

### Option 2: Confirmation Manuelle via Dashboard

1. **Dans Supabase Dashboard :**
   - Authentication → Users
   - Trouver `demo@atelierpro.com`
   - Cliquer sur l'utilisateur
   - Section "User Management"
   - Cocher "Email confirmed"
   - Sauvegarder

2. **Créer l'entreprise et le profil :**
   - SQL Editor → Nouvelle requête
   - Exécuter ce code :

```sql
-- Créer l'entreprise
INSERT INTO companies (name, email, is_active) 
VALUES ('Atelier Demo', 'demo@atelierpro.com', true)
ON CONFLICT (email) DO NOTHING;

-- Récupérer l'ID de l'entreprise
WITH company AS (
  SELECT id FROM companies WHERE email = 'demo@atelierpro.com'
)
-- Créer le profil
INSERT INTO profiles (user_id, email, first_name, last_name, role, company_id, is_active)
SELECT 
  '68a7d8cd-0e35-420f-aacb-af4f75b8cf7d',
  'demo@atelierpro.com',
  'Demo',
  'User',
  'owner',
  company.id,
  true
FROM company
ON CONFLICT (user_id) DO NOTHING;
```

## 🧪 Tests de Validation

### Test 1: Script de Diagnostic
```bash
npx tsx scripts/test-login.ts
```
**Résultat attendu :** ✅ Connexion réussie

### Test 2: Page de Test Web
1. Allez sur : https://atelierpro-production.up.railway.app/test-login.html
2. Cliquez sur "Tester la Connexion"
3. **Résultat attendu :** ✅ Connexion réussie

### Test 3: Application Principale
1. Allez sur : https://atelierpro-production.up.railway.app
2. Connectez-vous avec les identifiants demo
3. **Résultat attendu :** Accès au dashboard

## 📋 Checklist de Vérification

- [ ] Utilisateur `demo@atelierpro.com` existe dans Supabase Auth
- [ ] Email confirmé (`email_confirmed_at` non null)
- [ ] Entreprise "Atelier Demo" créée dans la table `companies`
- [ ] Profil utilisateur créé dans la table `profiles`
- [ ] Variables d'environnement configurées sur Railway
- [ ] Test de connexion réussi
- [ ] Accès au dashboard fonctionnel

## 🔍 Logs de Diagnostic

Après la correction, vous devriez voir ces logs dans la console :

```
[AuthContext] Tentative de connexion...
[AuthContext] Email: demo@atelierpro.com
[AuthContext] URL Supabase: https://zvdytkcqhnsivrargtvp.supabase.co
[AuthContext] Durée de connexion: XXXms
[AuthContext] Connexion réussie pour: demo@atelierpro.com
[AuthContext] Email confirmé: Oui
```

## 🚀 Prévention Future

### Pour éviter ce problème :

1. **Toujours confirmer les emails lors de la création d'utilisateurs de test**
2. **Utiliser le script `create-demo-user.ts` avec `email_confirm: true`**
3. **Vérifier les variables d'environnement avant chaque déploiement**
4. **Tester la connexion après chaque déploiement**

### Script de Création Automatique

Pour créer de futurs utilisateurs de test :

```bash
# Créer un utilisateur avec confirmation automatique
SUPABASE_SERVICE_ROLE_KEY=votre_cle npx tsx scripts/create-demo-user.ts
```

## 📞 Support

Si le problème persiste après ces étapes :

1. **Vérifiez les logs Railway** pour des erreurs supplémentaires
2. **Testez en navigation privée** pour éliminer les problèmes de cache
3. **Vérifiez la connectivité réseau** vers Supabase
4. **Contactez l'équipe** avec les logs complets

## 🎉 Résultat Final

Une fois la solution appliquée, l'utilisateur demo pourra se connecter normalement et accéder à toutes les fonctionnalités de l'application AtelierPro. 