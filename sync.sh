#!/bin/bash

# Arrêt en cas d'erreur
set -e

echo "🔄 1. Commit & push du code local vers GitHub..."
git add .
git commit -m "Sync automatique : code, migrations et assets"
git push origin main

echo "🔄 2. Application des migrations sur Supabase..."
supabase db push

echo "🔄 3. (Optionnel) Génération des types TypeScript à partir de Supabase..."
supabase gen types typescript --project-id zvdytkcqhnsivrargtvp > src/types/supabase.ts

echo "✅ Synchronisation terminée !"
