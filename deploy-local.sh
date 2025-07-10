#!/bin/bash

echo "🚀 Déploiement local AtelierPro - Démarrage..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
print_status "Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

print_success "Prérequis vérifiés"

# Nettoyage des builds précédents
print_status "Nettoyage des builds précédents..."
rm -rf dist/
print_success "Nettoyage terminé"

# Installation des dépendances
print_status "Installation des dépendances..."
npm install
if [ $? -ne 0 ]; then
    print_error "Échec de l'installation des dépendances"
    exit 1
fi
print_success "Dépendances installées"

# Audit de sécurité
print_status "Audit de sécurité..."
npm audit
if [ $? -ne 0 ]; then
    print_warning "Vulnérabilités détectées - Vérifiez les résultats"
fi

# Linting
print_status "Vérification du code (linting)..."
npm run lint
if [ $? -ne 0 ]; then
    print_warning "Erreurs de linting détectées - Vérifiez le code"
fi

# Build de production
print_status "Build de production..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Échec du build"
    exit 1
fi
print_success "Build terminé"

# Vérification de la taille du build
print_status "Analyse de la taille du build..."
BUILD_SIZE=$(du -sh dist/ | cut -f1)
print_success "Taille du build: $BUILD_SIZE"

# Démarrage du serveur de production
print_status "Démarrage du serveur de production..."
echo ""
echo "🌐 Application disponible sur: http://localhost:3000"
echo "📊 Mode: Production"
echo "🔒 Sécurité: Activée"
echo "🗜️  Compression: Gzip"
echo "⏱️  Rate limiting: Activé"
echo ""
echo "Pour arrêter le serveur: Ctrl+C"
echo ""

# Démarrage du serveur
NODE_ENV=production node server.js 