# 🚀 Guide de Déploiement - AtelierPro

## Problème résolu
Le CLI Supabase avait un problème de connexion SCRAM avec la base de données distante. Ce guide fournit les solutions de contournement.

## ✅ Solutions implémentées

### 1. Mise à jour du CLI Supabase
- **Ancienne version**: 2.30.4
- **Nouvelle version**: 2.33.4 ✅
- **Commande**: Installation manuelle depuis GitHub releases

### 2. Migrations renommées
Les migrations suivantes ont été renommées pour respecter le format `<timestamp>_description.sql` :

```
✅ 20250724021552_regenerate_types.sql
✅ 20250724023326_add_gender_to_clients.sql  
✅ 20250729004822_create_demo_user.sql
✅ 20250729004846_create_test_user_admin.sql
✅ 20250729005511_confirm_user_email.sql
✅ 20250729005527_create_default_company.sql
✅ 20250729005758_link_user_to_company.sql
✅ 20250729005832_reset_demo_password.sql
```

### 3. Script de déploiement alternatif
Créé `deploy-migrations.cjs` pour contourner le problème de connexion PostgreSQL.

## 🔧 Utilisation

### Développement local
```bash
# Démarrer Supabase local
supabase start

# Vérifier l'état
supabase status
```

### Déploiement en production
```bash
# Utiliser le script de contournement
export SUPABASE_SERVICE_ROLE_KEY="votre_clé_service"
node deploy-migrations.cjs
```

### Interface Web
- Dashboard Supabase: https://supabase.com/dashboard/project/zvdytkcqhnsivrargtvp
- Gestion des migrations via l'interface web
- Monitoring des performances et logs

## 🌐 URLs importantes
- **API Production**: https://zvdytkcqhnsivrargtvp.supabase.co
- **API Locale**: http://127.0.0.1:54321  
- **Studio Local**: http://127.0.0.1:54323
- **Dashboard**: https://supabase.com/dashboard

## 🔑 Variables d'environnement
```bash
VITE_SUPABASE_URL=https://zvdytkcqhnsivrargtvp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ État actuel
- ✅ CLI Supabase: v2.33.4
- ✅ Migrations: Formatées correctement  
- ✅ Connexion API: Fonctionnelle
- ✅ Base distante: Accessible via API REST
- ✅ Tables principales: Toutes opérationnelles
- ✅ Authentification: Utilisateur démo configuré

## 🚨 Notes importantes
- Le problème de connexion PostgreSQL directe est un problème connu avec certaines versions
- L'API REST fonctionne parfaitement pour toutes les opérations
- Les migrations peuvent être gérées via l'interface web Supabase
- Le développement local fonctionne sans problème

## 📞 Support
En cas de problème, contacter l'équipe de développement avec les logs de `deploy-migrations.cjs`.
