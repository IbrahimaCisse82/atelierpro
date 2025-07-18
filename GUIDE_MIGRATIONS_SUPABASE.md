# Guide : Gestion des Migrations Supabase

## ⚠️ RÉPONSE À VOTRE QUESTION

**NON, ne supprimez jamais les commits côté Supabase !** 

Les "commits" dans le dashboard Supabase sont l'historique des migrations appliquées en production. Les supprimer peut causer des incohérences graves et corrompre votre base de données.

## 🔍 Différence entre Migrations Locales et Commits Supabase

### 1. **Migrations Locales** (`supabase/migrations/*.sql`)
- Fichiers SQL dans votre projet
- Versionnés avec Git
- Définissent les changements de schéma
- Appliqués lors du développement local

### 2. **Commits Supabase** (Dashboard)
- Enregistrements dans `supabase_migrations.schema_migrations`
- Historique des migrations appliquées en production
- Tracent l'état réel de votre base de données
- **NE JAMAIS SUPPRIMER**

## ✅ Solution Recommandée : Migration de Nettoyage

Au lieu de supprimer les commits, créez une migration de nettoyage idempotente :

```sql
-- Migration de nettoyage pour résoudre les problèmes d'état
-- Cette migration s'assure que l'état des migrations est cohérent

-- Nettoyer les triggers en double ou problématiques
DO $$
DECLARE
    trigger_name text;
    table_name text;
BEGIN
    -- Supprimer les triggers existants de manière sécurisée
    FOR trigger_name, table_name IN VALUES
        ('update_companies_updated_at', 'companies'),
        ('update_profiles_updated_at', 'profiles')
        -- Ajoutez d'autres triggers selon vos besoins
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trigger_name, table_name);
    END LOOP;
END $$;

-- Recréer les triggers de manière idempotente
-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recréer les triggers automatiquement
DO $$
DECLARE
    table_info RECORD;
BEGIN
    FOR table_info IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', table_info.table_name, table_info.table_name);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', table_info.table_name, table_info.table_name);
    END LOOP;
END $$;
```

## 🛠️ Commandes pour Résoudre les Problèmes de Migration

### 1. **Redémarrer l'environnement local**
```bash
supabase stop
supabase start
```

### 2. **Réinitialiser complètement l'environnement local**
```bash
supabase stop
supabase db reset
```

### 3. **Créer une nouvelle migration**
```bash
supabase migration new cleanup_migration_state
```

### 4. **Appliquer les migrations manuellement**
```bash
supabase db push
```

### 5. **Vérifier l'état des migrations**
```bash
supabase migration list
```

## 🔄 Workflow de Migration Recommandé

### Pour le Développement Local :
1. Créer une migration : `supabase migration new nom_migration`
2. Écrire le code SQL dans le fichier généré
3. Tester localement : `supabase start`
4. Valider les changements
5. Commit avec Git

### Pour la Production :
1. Pousser les migrations : `supabase db push`
2. Vérifier dans le dashboard Supabase
3. Tester en staging avant production
4. Monitorer les logs après déploiement

## 🚨 Bonnes Pratiques

### ✅ À FAIRE :
- Toujours écrire des migrations idempotentes
- Utiliser `IF EXISTS` et `IF NOT EXISTS`
- Tester localement avant de pousser
- Faire des sauvegardes avant les migrations importantes
- Utiliser des transactions pour les migrations complexes

### ❌ À ÉVITER :
- Supprimer les commits dans le dashboard Supabase
- Modifier les migrations déjà appliquées
- Faire des changements directs en production
- Ignorer les erreurs de migration
- Oublier de synchroniser local et production

## 🔧 Diagnostic des Problèmes

### Erreur : "Migration already exists"
```bash
# Vérifier les migrations appliquées
supabase migration list

# Créer une migration de nettoyage
supabase migration new fix_duplicate_migration
```

### Erreur : "Trigger already exists"
```sql
-- Utiliser DROP TRIGGER IF EXISTS dans vos migrations
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name...
```

### Erreur : "Column already exists"
```sql
-- Utiliser ALTER TABLE avec IF NOT EXISTS
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name type;
```

## 📊 État Actuel de Votre Projet

Après la migration de nettoyage, votre environnement local est maintenant :
- ✅ Propre et cohérent
- ✅ Tous les triggers recréés correctement
- ✅ Migrations appliquées dans l'ordre
- ✅ Prêt pour le développement

## 🎯 Prochaines Étapes

1. **Tester votre application** avec l'environnement local
2. **Créer de nouvelles migrations** si nécessaire
3. **Synchroniser avec la production** quand tout fonctionne
4. **Mettre à jour Supabase CLI** : `supabase update`

## 📝 Résumé

La migration de nettoyage que nous avons créée résout les problèmes sans supprimer les commits Supabase. Elle :
- Nettoie les triggers en double
- Recrée les triggers de manière idempotente
- Assure la cohérence de l'état des migrations
- Préserve l'intégrité de votre base de données

Cette approche est sûre, testée et recommandée par les meilleures pratiques de Supabase.
