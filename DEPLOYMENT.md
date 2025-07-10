# 🚀 Guide de Déploiement Local - AtelierPro

## 📋 Prérequis

- Node.js 18+ 
- npm 9+
- Git

## 🛠️ Options de Déploiement

### 1. Déploiement Automatique (Recommandé)

```bash
./deploy-local.sh
```

Ce script automatise tout le processus :
- ✅ Vérification des prérequis
- ✅ Installation des dépendances
- ✅ Audit de sécurité
- ✅ Linting du code
- ✅ Build de production
- ✅ Démarrage du serveur sécurisé

### 2. Déploiement Manuel

#### Étape 1: Build
```bash
npm run build
```

#### Étape 2: Démarrage du serveur
```bash
npm run start:prod
```

### 3. Déploiement avec PM2 (Production Avancée)

```bash
# Installation de PM2
npm install -g pm2

# Démarrage avec PM2
pm2 start ecosystem.config.js

# Monitoring
pm2 monit

# Logs
pm2 logs atelierpro-production

# Arrêt
pm2 stop atelierpro-production
```

## 🌐 Accès à l'Application

- **URL**: http://localhost:3000
- **Mode**: Production
- **Sécurité**: Helmet + Rate Limiting
- **Compression**: Gzip activé
- **Cache**: Assets optimisés

## 🔧 Configuration

### Variables d'Environnement

```bash
NODE_ENV=production
PORT=3000
```

### Ports Disponibles

- **3000**: Serveur de production (défaut)
- **4173**: Vite preview
- **5173**: Vite dev server

## 📊 Monitoring

### Logs

Les logs sont disponibles dans le dossier `logs/` :
- `err.log`: Erreurs
- `out.log`: Sortie standard
- `combined.log`: Logs combinés

### Métriques

Le serveur affiche automatiquement :
- Temps de réponse
- IP des clients
- Méthodes HTTP
- URLs accédées

## 🔒 Sécurité

### Fonctionnalités Activées

- **Helmet**: Headers de sécurité
- **Rate Limiting**: 100 requêtes/15min par IP
- **CSP**: Content Security Policy
- **Compression**: Gzip pour tous les assets
- **Cache**: Headers de cache optimisés

### Headers de Sécurité

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: [configuré]
```

## 🚨 Dépannage

### Problèmes Courants

1. **Port déjà utilisé**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Permissions**
   ```bash
   chmod +x deploy-local.sh
   ```

3. **Dépendances manquantes**
   ```bash
   npm install
   ```

4. **Build échoué**
   ```bash
   npm run lint
   npm run build
   ```

### Logs de Debug

```bash
# Logs du serveur
tail -f logs/combined.log

# Logs PM2
pm2 logs atelierpro-production

# Logs en temps réel
pm2 monit
```

## 📈 Performance

### Optimisations Actives

- **Bundle Splitting**: Code divisé par fonctionnalité
- **Lazy Loading**: Pages chargées à la demande
- **Image Optimization**: Images compressées
- **Minification**: Code minifié avec Terser
- **Tree Shaking**: Code mort éliminé

### Métriques de Build

```
dist/index.html                               1.24 kB │ gzip:  0.49 kB
dist/assets/index-Cb_frHzR.css               59.49 kB │ gzip: 10.73 kB
dist/assets/index-B1OPVYd1.js               434.14 kB │ gzip: 97.98 kB
```

## 🔄 Mise à Jour

### Redéploiement Rapide

```bash
# Arrêt du serveur
Ctrl+C

# Redémarrage
./deploy-local.sh
```

### Mise à Jour avec PM2

```bash
pm2 restart atelierpro-production
```

## 📝 Notes

- Le serveur redémarre automatiquement en cas d'erreur
- Les assets sont mis en cache pendant 1 an
- Le rate limiting protège contre les attaques DDoS
- Tous les logs sont horodatés et formatés

## 🆘 Support

En cas de problème :
1. Vérifiez les logs dans `logs/`
2. Consultez la section dépannage
3. Vérifiez les prérequis
4. Relancez le script de déploiement 