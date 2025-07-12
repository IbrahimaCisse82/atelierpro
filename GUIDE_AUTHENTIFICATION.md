# Guide de résolution des problèmes d'authentification AtelierPro

## Problème identifié

L'erreur 400 (Bad Request) sur le token indique un problème d'authentification avec Supabase. Voici les causes possibles et les solutions :

## 🔍 Diagnostic

### 1. Variables d'environnement
✅ **Résolu** : Les variables d'environnement sont maintenant correctement configurées :
- `VITE_SUPABASE_URL`: https://zvdytkcqhnsivrargtvp.supabase.co
- `VITE_SUPABASE_ANON_KEY`: Configurée
- `VITE_APP_VERSION`: 1.0.0
- `NODE_ENV`: development

### 2. Problème d'email non confirmé
❌ **Problème principal** : L'utilisateur demo existe mais l'email n'est pas confirmé.

### 3. Restrictions d'emails
❌ **Problème secondaire** : Supabase rejette les emails avec des domaines comme `example.com` et `atelierpro.com`.

## 🛠️ Solutions

### Solution 1 : Confirmation forcée avec clé service role (Recommandée)

1. **Récupérer la clé service role** :
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet
   - Settings > API
   - Copiez la "service_role" key

2. **Ajouter la clé au fichier .env** :
   ```bash
   echo "SUPABASE_SERVICE_ROLE_KEY=votre_vraie_cle_ici" >> .env
   ```

3. **Forcer la confirmation** :
   ```bash
   npx tsx scripts/force-confirm-user.ts
   ```

### Solution 2 : Créer un nouvel utilisateur avec email valide

1. **Modifier le script** :
   ```bash
   # Éditer scripts/create-real-user.ts
   # Remplacer "votre-email@gmail.com" par votre vrai email
   ```

2. **Créer l'utilisateur** :
   ```bash
   npx tsx scripts/create-real-user.ts
   ```

3. **Confirmer l'email** :
   - Vérifiez votre boîte mail
   - Cliquez sur le lien de confirmation

### Solution 3 : Désactiver temporairement la confirmation d'email

1. **Dans le dashboard Supabase** :
   - Authentication > Settings
   - Désactiver "Enable email confirmations"

2. **Tester la connexion** :
   ```bash
   npx tsx scripts/test-login.ts
   ```

## 🧪 Tests

### Test de connexion
```bash
npx tsx scripts/test-login.ts
```

### Test de debug
```bash
npx tsx scripts/test-auth-debug.ts
```

### Vérification des variables
```bash
npx tsx scripts/check-env.ts
```

## 🔧 Configuration recommandée

### Fichier .env
```env
VITE_SUPABASE_URL=https://zvdytkcqhnsivrargtvp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
VITE_APP_VERSION=1.0.0
NODE_ENV=development
```

### Identifiants de test
- **Email** : Votre vrai email (pas demo@atelierpro.com)
- **Mot de passe** : Demo123456!

## 🚀 Déploiement

### Variables d'environnement sur Railway/Vercel
Assurez-vous que toutes les variables sont configurées sur votre plateforme de déploiement.

### Test en production
1. Déployez l'application
2. Testez la connexion avec les identifiants valides
3. Vérifiez les logs pour d'éventuelles erreurs

## 📞 Support

Si les problèmes persistent :
1. Vérifiez les logs Supabase dans le dashboard
2. Testez avec un autre navigateur/incognito
3. Vérifiez la configuration réseau
4. Contactez le support Supabase si nécessaire

## ✅ Checklist de résolution

- [ ] Variables d'environnement configurées
- [ ] Clé service role ajoutée (si nécessaire)
- [ ] Utilisateur créé avec email valide
- [ ] Email confirmé
- [ ] Test de connexion réussi
- [ ] Application déployée avec les bonnes variables
- [ ] Test en production réussi 