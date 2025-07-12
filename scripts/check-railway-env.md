# Guide de configuration Railway pour AtelierPro

## 🔍 Problème identifié
L'application ne s'affiche pas sur https://atelierpro-production.up.railway.app/dashboard/hr

## 🛠️ Solutions

### 1. Vérifier les variables d'environnement sur Railway

#### Accéder au dashboard Railway :
1. Allez sur https://railway.app/dashboard
2. Sélectionnez votre projet "atelierpro-production"
3. Cliquez sur l'onglet "Variables"

#### Variables requises :
```env
VITE_SUPABASE_URL=https://zvdytkcqhnsivrargtvp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZHl0a2NxaG5zaXZyYXJndHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2NTMsImV4cCI6MjA2NzUxMjY1M30.VG0gPQFIYskyiRLgbC7A3kq7rpHghxWH4US3ghXDqPc
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

### 2. Vérifier les logs de déploiement

#### Dans le dashboard Railway :
1. Cliquez sur votre service
2. Onglet "Deployments"
3. Cliquez sur le dernier déploiement
4. Vérifiez les logs pour d'éventuelles erreurs

### 3. Redéployer l'application

#### Option 1 : Redéploiement automatique
```bash
# Pousser les changements sur GitHub
git add .
git commit -m "Fix: Remove next-themes dependency and improve error handling"
git push origin main
```

#### Option 2 : Redéploiement manuel
1. Dans Railway dashboard
2. Cliquez sur "Deploy" dans votre service

### 4. Vérifier la configuration du build

#### Vérifier le script de build dans package.json :
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 5. Tester l'application

#### URLs à tester :
- https://atelierpro-production.up.railway.app/ (page d'accueil)
- https://atelierpro-production.up.railway.app/login (page de connexion)
- https://atelierpro-production.up.railway.app/dashboard (dashboard principal)

## 🔧 Commandes utiles

### Vérifier le build localement :
```bash
npm run build
npm run preview
```

### Tester l'application locale :
```bash
npm run dev
# Puis ouvrir http://localhost:5173
```

### Vérifier les variables d'environnement :
```bash
npx tsx scripts/check-env.ts
```

## 📋 Checklist de résolution

- [ ] Variables d'environnement configurées sur Railway
- [ ] Dépendance next-themes supprimée
- [ ] Build local réussi
- [ ] Déploiement Railway réussi
- [ ] Application accessible sur l'URL de production
- [ ] Authentification fonctionnelle
- [ ] Dashboard accessible

## 🚨 Erreurs courantes

### 1. Variables d'environnement manquantes
**Symptôme** : Page blanche ou erreur 500
**Solution** : Vérifier toutes les variables dans Railway

### 2. Build échoué
**Symptôme** : Déploiement en échec
**Solution** : Vérifier les logs de build et corriger les erreurs

### 3. Problème d'authentification
**Symptôme** : Erreur 400 sur le token
**Solution** : Vérifier les clés Supabase et créer un utilisateur valide

### 4. Problème de routing
**Symptôme** : Page 404 sur certaines routes
**Solution** : Vérifier la configuration SPA dans Railway 