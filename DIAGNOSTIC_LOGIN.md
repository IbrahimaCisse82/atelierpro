# 🔍 Diagnostic Erreur "invalid_credentials" - AtelierPro

## 🎯 Problème
L'utilisateur `demo@atelierpro.com` ne peut pas se connecter avec l'erreur :
```json
{
  "code": "invalid_credentials",
  "message": "Invalid login credentials"
}
```

## 📋 Checklist de Diagnostic

### 1. ✅ Vérification des Variables d'Environnement Railway

**Variables requises :**
```
VITE_SUPABASE_URL=https://zvdytkcqhnsivrargtvp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZHl0a2NxaG5zaXZyYXJndHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2NTMsImV4cCI6MjA2NzUxMjY1M30.VG0gPQFIYskyiRLgbC7A3kq7rpHghxWH4US3ghXDqPc
```

**Comment vérifier :**
1. Dashboard Railway → Projet AtelierPro → Variables
2. Vérifiez que les variables sont présentes et correctes
3. Redéployez si nécessaire

### 2. ✅ Test de Connexion Isolé

**Exécuter le script de test :**
```bash
# Installer tsx si pas déjà fait
npm install -g tsx

# Tester la connexion
tsx scripts/test-login.ts
```

**Résultats attendus :**
- ✅ Configuration valide
- ✅ Connexion réussie ou diagnostic détaillé de l'erreur

### 3. ✅ Vérification de l'Utilisateur dans Supabase

**Dans le dashboard Supabase :**
1. Authentication → Users
2. Rechercher `demo@atelierpro.com`
3. Vérifier :
   - ✅ L'utilisateur existe
   - ✅ Email confirmé (`email_confirmed_at` non null)
   - ✅ Compte actif

### 4. ✅ Création Forcée de l'Utilisateur (si nécessaire)

**Si l'utilisateur n'existe pas ou n'est pas confirmé :**

```bash
# 1. Récupérer votre SERVICE_ROLE_KEY depuis Supabase
# Dashboard → Settings → API → service_role

# 2. Créer l'utilisateur avec confirmation forcée
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role tsx scripts/create-demo-user.ts
```

**Identifiants créés :**
- Email: `demo@atelierpro.com`
- Mot de passe: `DemoTest@1234`

### 5. ✅ Vérification des Logs de Production

**Dans Railway :**
1. Dashboard → Projet → Deployments → Latest
2. Onglet "Logs"
3. Rechercher les logs `[AuthContext]`

**Logs attendus :**
```
[AuthContext] Tentative de connexion...
[AuthContext] Email: demo@atelierpro.com
[AuthContext] URL Supabase: https://zvdytkcqhnsivrargtvp.supabase.co
[AuthContext] Durée de connexion: XXXms
[AuthContext] Connexion réussie pour: demo@atelierpro.com
```

### 6. ✅ Test en Navigation Privée

**Pour éliminer les problèmes de cache :**
1. Ouvrir une fenêtre de navigation privée
2. Aller sur https://atelierpro-production.up.railway.app
3. Tenter la connexion avec les identifiants

## 🛠️ Scripts de Diagnostic

### Test de Connexion
```bash
tsx scripts/test-login.ts
```

### Vérification des Variables d'Environnement
```bash
tsx scripts/check-env.ts
```

### Création d'Utilisateur de Test
```bash
SUPABASE_SERVICE_ROLE_KEY=votre_cle tsx scripts/create-demo-user.ts
```

## 🔧 Corrections Possibles

### Problème 1: Variables d'environnement manquantes
**Solution :** Ajouter les variables dans Railway et redéployer

### Problème 2: Utilisateur inexistant
**Solution :** Utiliser le script `create-demo-user.ts`

### Problème 3: Email non confirmé
**Solution :** Confirmer manuellement via Supabase Admin ou recréer l'utilisateur

### Problème 4: Problème de cache
**Solution :** Tester en navigation privée ou vider le cache

### Problème 5: Problème de réseau
**Solution :** Vérifier la connectivité et les timeouts

## 📊 Logs de Diagnostic

**Logs ajoutés dans `AuthContext.tsx` :**
- Tentative de connexion avec email et durée
- Configuration Supabase utilisée
- Erreurs détaillées avec codes
- Statut de confirmation email

**Pour voir les logs :**
1. Console du navigateur (F12)
2. Logs Railway
3. Scripts de test

## 🎯 Résolution Finale

Une fois le diagnostic terminé :

1. **Si l'utilisateur n'existe pas :** Créer avec `create-demo-user.ts`
2. **Si les variables sont manquantes :** Configurer Railway
3. **Si c'est un problème de cache :** Tester en navigation privée
4. **Si c'est un problème de réseau :** Vérifier la connectivité

## 📞 Support

En cas de problème persistant :
1. Vérifier les logs Railway
2. Tester avec les scripts fournis
3. Vérifier la configuration Supabase
4. Contacter l'équipe de développement avec les logs complets 