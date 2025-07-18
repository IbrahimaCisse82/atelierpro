# 🏭 AtelierPro - Gestion d'Atelier de Couture

Application web moderne pour la gestion complète d'ateliers de couture, développée ave## 🗂️ Roadmap & To-Do

### ✅ Complété
- **Surveillance continue** (monitoring, alertes)
- **Optimisation des performances** (bundle splitting, lazy loading)
- **Mise à jour régulière des dépendances**
- **Renforcement de la sécurité** (audit, patchs, RLS, search_path)
- **Automatisation du déploiement** et des migrations (Supabase CLI, scripts)
- **Gestion avancée des rôles/permissions** (RLS, policies)
- **Tests E2E et unitaires** sur les modules principaux
- **Documentation et guides utilisateurs** (README, guides Supabase)
- **Conformité RGPD et sécurité des données** (logs, anonymisation)
- **Correction des cycles d'import** et ReferenceError (toast, hooks)
- **Implémentation landing page** pour utilisateurs non connectés
- **Routage public/privé** avec React Router v6
- **Synchronisation complète** GitHub/Supabase/Vercel
- **Stabilité en production** (erreurs critiques résolues)

### 🚧 En cours / À faire
- **Résolution des problèmes de création utilisateur** (triggers auth.users)
- **Ajout de nouveaux modules métier** (gestion avancée des patrons, planification)
- **Amélioration de la gestion multi-tenant** (isolation des données)
- **Optimisation mobile** (PWA, offline capabilities)
- **Notifications push** et alertes temps réel
- **Analytics avancés** et reporting personnalisé

> **Dernière mise à jour : 18/07/2025** — Corrections critiques appliquées. Application stable en production. Voir l'historique des migrations et la documentation pour les détails.eScript, Vite et Supabase.

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

## 🚀 Optimisations Actives

- ✅ **Découpage du bundle** (bundle splitting) avec lazy loading
- ✅ **Lazy loading des modules** pour optimiser les performances
- ✅ **Monitoring Sentry** (erreurs, performance)
- ✅ **Sécurité avancée Supabase** (RLS, triggers, fonctions, search_path)
- ✅ **Conformité RGPD** (logs, anonymisation, documentation)
- ✅ **Tests automatisés** (scripts, audit, performance)
- ✅ **Documentation intégrée** (modules, API, sécurité)
- ✅ **UI/UX harmonisée** et responsive
- ✅ **Maintenance proactive** (scripts, audit, surveillance)
- ✅ **Correction des cycles d'import** (toast, hooks)
- ✅ **Landing page publique** pour utilisateurs non connectés
- ✅ **React Router v7** (flags d'anticipation activés)
- ✅ **Synchronisation continue** GitHub/Supabase/Vercel

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
- **Backend** : Supabase (Auth + Database + Storage)
- **Routing** : React Router v6 (public/private routes)
- **State Management** : React Context + TanStack Query
- **Charts** : Chart.js + Recharts
- **Monitoring** : Sentry (errors & performance)
- **Deployment** : Vercel (production) + GitHub Actions
- **Database** : PostgreSQL (Supabase) avec RLS activé

## 🔧 Scripts Disponibles

### Scripts de base
```bash
npm run dev          # Développement local
npm run build        # Build de production
npm run preview      # Preview du build
npm run lint         # Vérification du code
npm run start:prod   # Serveur de production local
```

### Scripts utilitaires (dans `scripts/`)
```bash
# Tests et diagnostics
npm run test         # Tests E2E avec Playwright
bun run scripts/test-auth-debug.ts    # Test debug authentification
bun run scripts/test-performance.ts   # Test performance

# Gestion des utilisateurs
bun run scripts/create-demo-user.ts   # Créer utilisateur de démo
bun run scripts/create-real-user.ts   # Créer utilisateur réel
bun run scripts/force-confirm-user.ts # Forcer confirmation

# Supabase
supabase db push     # Appliquer migrations
supabase db diff     # Voir différences
supabase db reset    # Reset base locale
```

## 📝 Notes de Déploiement

### Configuration Vercel
- **Framework** : Vite (SPA routing)
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Node Version** : 18.x
- **Install Command** : `npm install`

### Fonctionnalités
- **SPA Routing** : Toutes les routes redirigées vers `index.html`
- **Assets optimisés** : Compression et mise en cache automatique
- **Variables d'environnement** : Sécurisées et chiffrées
- **Landing page publique** : Accessible sans authentification
- **Redirections automatiques** : Utilisateurs connectés → dashboard
- **Gestion d'erreurs** : Sentry intégré pour monitoring

### Sécurité
- **RLS activé** : Toutes les tables avec policies
- **Search path sécurisé** : Fonctions PL/pgSQL protégées
- **Validation côté serveur** : Triggers et contraintes
- **Audit trail** : Logs complets des actions utilisateur

## 🚀 État du Projet

### ✅ Production Ready
- **Build** : ✅ Aucune erreur critique
- **Tests** : ✅ E2E passent sur modules principaux
- **Sécurité** : ✅ Audit complet, RLS, search_path
- **Performance** : ✅ Bundle optimisé, lazy loading
- **Monitoring** : ✅ Sentry configuré
- **Documentation** : ✅ Guides et README à jour

### 🔧 Points d'amélioration
- **Création utilisateur** : Triggers auth.users à finaliser
- **Tests** : Augmenter la couverture
- **PWA** : Améliorer capacités offline
- **Multi-tenant** : Isolation des données

## 🗂️ Roadmap & To-Do

- [x] Surveillance continue (monitoring, alertes)
- [x] Optimisation des performances
- [x] Mise à jour régulière des dépendances
- [x] Renforcement de la sécurité (audit, patchs, RLS, search_path)
- [x] Automatisation du déploiement et des migrations (Supabase CLI, scripts)
- [x] Gestion avancée des rôles/permissions (RLS, policies)
- [x] Tests E2E et unitaires sur les modules principaux
- [x] Documentation et guides utilisateurs (README, guides Supabase)
- [x] Conformité RGPD et sécurité des données (logs, anonymisation)
- [ ] Ajout de nouveaux modules métier
- [ ] Amélioration de la gestion multi-tenant

> Dernière mise à jour : 18/07/2025 — la plupart des points critiques sont réalisés. Voir l’historique des migrations et la documentation pour les détails.

## 🆘 Support & Dépannage

### Problèmes courants
1. **Erreur d'authentification** : Vérifier les variables d'environnement Supabase
2. **Page blanche** : Vérifier les logs dans le dashboard Vercel
3. **Erreurs de build** : Tester localement avec `npm run preview`
4. **Problèmes de base de données** : Vérifier les migrations Supabase

### Debug local
```bash
# Vérifier l'environnement
bun run scripts/check-env.ts

# Tester l'authentification
bun run scripts/test-auth-debug.ts

# Vérifier la performance
bun run scripts/test-performance.ts
```

### Ressources
- **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Guides projet** : Voir fichiers `*.md` dans le repo
- **Logs production** : Dashboard Vercel
- **Monitoring** : Dashboard Sentry

---

**🧵 AtelierPro** - Solution complète pour la gestion d'ateliers de couture ✨

*Application stable en production, prête pour l'utilisation quotidienne.*
