#!/bin/zsh
# Script de synchronisation GitHub + Supabase
# Usage: ./sync.sh "message de commit"

set -e

COMMIT_MSG=${1:-"sync: maj code et migrations supabase"}

echo "[1/3] Ajout des fichiers..."
git add .

echo "[2/3] Commit..."
git commit -m "$COMMIT_MSG" || echo "Aucun changement à commit."

echo "[3/3] Push sur GitHub..."
git push origin main

echo "[Supabase] Application des migrations locales sur la base distante..."
supabase db push

echo "[Supabase] (Optionnel) Génération des types TypeScript à partir de Supabase..."
supabase gen types typescript --project-id zvdytkcqhnsivrargtvp > src/types/supabase.ts

echo "Synchronisation terminée."
