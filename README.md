# 🏭 AtelierPro - Gestion d'Atelier de Couture

Application web moderne pour la gestion complète d'ateliers de couture, développée avec React, TypeScript, Vite et Supabase.

## 🚀 Déploiement Vercel

### Prérequis
- Compte Vercel (gratuit)
- Projet Supabase configuré
- Git installé

### Étapes de Déploiement

#### 1. Préparer le Repository
```bash
# Vérifier que tout est commité
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### 2. Déployer sur Vercel

**Option A : Interface Web (Recommandée)**
1. Va sur [vercel.com](https://vercel.com)
2. Clique "New Project"
3. Importe ton repository GitHub
4. Configure les variables d'environnement :
   ```
   VITE_SUPABASE_URL=https://zvdytkcqhnsivrargtvp.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZHl0a2NxaG5zaXZyYXJndHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2NTMsImV4cCI6MjA2NzUxMjY1M30.VG0gPQFIYskyiRLgbC7A3kq7rpHghxWH4US3ghXDqPc
   ```
5. Clique "Deploy"

**Option B : CLI Vercel**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Suivre les instructions et configurer les variables d'environnement
```

#### 3. Configuration Post-Déploiement

1. **Vérifier l'URL de production** (ex: `https://atelierpro.vercel.app`)
2. **Tester l'authentification** avec un compte existant
3. **Vérifier les fonctionnalités** principales

### Variables d'Environnement Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de ton projet Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | `eyJhbGciOiJIUzI1NiIs...` |

### Optimisations Actives

- ✅ **Bundle Splitting** : Code divisé par fonctionnalité
- ✅ **Lazy Loading** : Pages chargées à la demande
- ✅ **Image Optimization** : Images compressées
- ✅ **Minification** : Code minifié avec Terser
- ✅ **Cache Headers** : Assets mis en cache 1 an
- ✅ **Security Headers** : Protection XSS, Clickjacking, etc.

### Monitoring et Analytics

- **Vercel Analytics** : Activable dans le dashboard
- **Performance** : Métriques automatiques
- **Logs** : Accessibles via Vercel CLI ou dashboard

## 🛠️ Développement Local

```bash
# Installation
npm install

# Développement
npm run dev

# Build de production
npm run build

# Preview locale
npm run preview
```

## 📊 Fonctionnalités

- 🔐 **Authentification** : Connexion/Inscription avec Supabase
- 👥 **Gestion des Rôles** : Owner, Manager, Employee
- 📦 **Gestion des Commandes** : Suivi complet
- 👤 **Gestion des Clients** : Base de données clients
- 🏭 **Production** : Planning et suivi
- 📊 **Finances** : Facturation et comptabilité
- 📦 **Stocks** : Gestion des matières premières
- 📏 **Mesures** : Base de données mesures clients
- 📋 **Rapports** : Analytics et exports

## 🏗️ Architecture

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : Shadcn/ui + Tailwind CSS
- **Backend** : Supabase (Auth + Database)
- **Routing** : React Router v6
- **State Management** : React Context + TanStack Query
- **Charts** : Chart.js + Recharts

## 🔧 Scripts Disponibles

```bash
npm run dev          # Développement local
npm run build        # Build de production
npm run preview      # Preview du build
npm run lint         # Vérification du code
npm run start:prod   # Serveur de production local
```

## 📝 Notes de Déploiement

- L'application utilise le **SPA routing** (React Router)
- Toutes les routes sont redirigées vers `index.html`
- Les assets sont optimisés et mis en cache
- Les variables d'environnement sont sécurisées

## 🆘 Support

En cas de problème :
1. Vérifier les logs dans le dashboard Vercel
2. Tester en local avec `npm run preview`
3. Vérifier les variables d'environnement
4. Consulter la documentation Supabase

---

**AtelierPro** - Gestion moderne d'ateliers de couture 🧵✨
