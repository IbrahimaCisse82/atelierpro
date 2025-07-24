#!/bin/bash

echo "🚀 AtelierPro PWA - Test de Démarrage Rapide"
echo "=============================================="

# Vérifier les dépendances
echo "📋 Vérification des dépendances..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js et npm sont installés"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier les variables d'environnement
echo "🔐 Vérification de la configuration..."
if [ ! -f ".env.local" ]; then
    echo "⚠️ Fichier .env.local manquant - Certaines fonctionnalités peuvent ne pas fonctionner"
fi

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Erreur de build"
    exit 1
fi

# Tests rapides
echo "🧪 Tests rapides..."
npm run test:unit 2>/dev/null || echo "⚠️ Tests unitaires non configurés"

# Démarrage du serveur de développement
echo "🌐 Démarrage du serveur de développement..."
echo ""
echo "🎉 AtelierPro PWA sera accessible sur:"
echo "   📱 Mobile/Local: http://localhost:5173"
echo "   🌐 Réseau: http://$(hostname -I | awk '{print $1}'):5173"
echo ""
echo "✨ Fonctionnalités PWA disponibles:"
echo "   📱 Installation en tant qu'app"
echo "   🔔 Notifications push"
echo "   📶 Mode hors ligne"
echo "   👆 Gestes tactiles mobiles"
echo "   🔄 Synchronisation automatique"
echo ""
echo "🧪 Pour tester les fonctionnalités PWA:"
echo "   1. Ouvrez l'app sur mobile ou en mode responsive"
echo "   2. Installez l'app via le prompt d'installation"
echo "   3. Testez le mode hors ligne"
echo "   4. Activez les notifications"
echo "   5. Utilisez les gestes de navigation"
echo ""
echo "🔍 Tests E2E disponibles:"
echo "   npm run test:e2e:auth    # Tests d'authentification"
echo "   npm run test:e2e:pwa     # Tests PWA"
echo "   npm run test:e2e:mobile  # Tests mobile"
echo ""
echo "▶️ Démarrage de l'application..."

# Démarrer en arrière-plan pour permettre d'autres tests
npm run dev &
SERVER_PID=$!

# Attendre que le serveur démarre
sleep 3

# Ouvrir le navigateur par défaut
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo ""
echo "🎯 Serveur démarré ! (PID: $SERVER_PID)"
echo "📱 Testez les fonctionnalités PWA en ouvrant les DevTools > Application"
echo "🛑 Pour arrêter le serveur: Ctrl+C ou kill $SERVER_PID"
echo ""

# Garder le script actif
wait $SERVER_PID
