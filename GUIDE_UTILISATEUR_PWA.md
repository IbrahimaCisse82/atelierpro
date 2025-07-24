# 📱 Guide Utilisateur - Fonctionnalités PWA AtelierPro

## 🎯 Introduction

AtelierPro est maintenant une **Progressive Web App (PWA)** complète qui offre une expérience mobile native directement dans votre navigateur. Ce guide vous explique comment utiliser toutes les nouvelles fonctionnalités.

---

## 📲 Installation de l'Application

### Sur Mobile (iOS/Android)
1. **Ouvrez AtelierPro** dans Safari (iOS) ou Chrome (Android)
2. **Cherchez l'invite d'installation** qui apparaît automatiquement
3. **Appuyez sur "Installer"** ou "Ajouter à l'écran d'accueil"
4. **L'icône AtelierPro** apparaît sur votre écran d'accueil

### Sur Ordinateur (Chrome/Edge)
1. **Ouvrez AtelierPro** dans votre navigateur
2. **Cliquez sur l'icône d'installation** dans la barre d'adresse (⊕)
3. **Confirmez l'installation** dans la popup
4. **L'application** s'ouvre dans sa propre fenêtre

### Installation Manuelle
Si le prompt n'apparaît pas :
- **Allez dans Menu** → PWA Features
- **Cliquez sur "Installer l'app"**

---

## 🔔 Notifications Push

### Activation
1. **Allez dans Menu** → PWA Features
2. **Cliquez sur "Activer notifications"**
3. **Autorisez** les notifications dans le navigateur
4. **Notification de test** envoyée automatiquement

### Types de Notifications
- ✅ **Nouvelles commandes** reçues
- 💰 **Rappels de paiement** 
- 📅 **Échéances importantes**
- 🔄 **Synchronisation** des données
- ⚠️ **Alertes système**

### Actions dans les Notifications
- **"Voir détails"** : Ouvre l'élément concerné
- **"Fermer"** : Marque comme lu
- **Vibration** sur mobile pour attirer l'attention

---

## 🌐 Mode Hors Ligne

### Fonctionnement Automatique
- **Détection automatique** de la perte de connexion
- **Basculement transparent** vers les données locales
- **Notification d'état** : "Mode hors ligne activé"
- **Synchronisation automatique** au retour de connexion

### Données Disponibles Hors Ligne
- 🏠 **Dashboard principal** avec métriques récentes
- 👥 **Liste des clients** complète
- 📦 **Commandes récentes** (30 derniers jours)
- 💰 **Données financières** essentielles
- 👷 **Informations des employés**

### Actions Hors Ligne
- ✏️ **Consultation** de toutes les données
- 📝 **Modifications** sauvegardées localement
- 🔄 **Synchronisation** automatique au retour en ligne
- 📊 **Rapports** avec données locales

### Page Hors Ligne Dédiée
Si vous perdez la connexion :
- **Redirection automatique** vers `/offline.html`
- **Interface informative** et rassurante
- **Bouton "Réessayer"** pour tester la connexion
- **Vérification automatique** toutes les 30 secondes
- **Notification de reconnexion** automatique

---

## 👆 Gestes Tactiles (Mobile)

### Navigation par Gestes
- **Swipe Droite** → Page précédente
- **Swipe Gauche** → Page suivante  
- **Swipe Haut** → Actualiser les données
- **Swipe Bas** → Retour au menu principal

### Gestes Spéciaux
- **Long Press** (maintenir appuyé) → Menu contextuel
- **Pinch to Zoom** → Agrandir/réduire (tableaux, graphiques)
- **Double Tap** → Zoom rapide sur élément

### Feedback Tactile
- **Vibration courte** : Confirmation d'action
- **Vibration longue** : Long press activé
- **Vibration pattern** : Notification importante

---

## 🧭 Navigation Mobile

### Header Adaptatif
- **Bouton Menu** : Accès au menu principal (page d'accueil)
- **Bouton Retour** : Navigation arrière (autres pages)
- **Titre de page** : Indication claire de la section
- **Boutons d'action** : Recherche et notifications

### Menu Latéral
- **Swipe depuis le bord gauche** pour ouvrir
- **Tap sur overlay** pour fermer
- **Navigation rapide** vers toutes les sections
- **Statut PWA** et actions disponibles

### Navigation Inférieure
- **Accès rapide** aux 4 sections principales
- **Masquage automatique** pendant le scroll
- **Icônes colorées** pour identification rapide
- **Badge de notifications** sur les nouveautés

### Bouton d'Action Flottant
- **Position adaptative** : bas droite de l'écran
- **Action contextuelle** selon la page :
  - Dashboard → Accueil
  - Clients → Nouveau client
  - Commandes → Nouvelle commande
  - Finances → Nouvelle entrée
- **Réduction automatique** pendant le scroll

---

## 🔄 Synchronisation des Données

### Synchronisation Automatique
- **Connexion rétablie** → Sync immédiate
- **Interval régulier** → Toutes les 5 minutes en ligne
- **Modifications détectées** → Sync en temps réel
- **Background sync** → Même app fermée (si supporté)

### Gestion des Conflits
- **Dernière modification gagne** par défaut
- **Notification** en cas de conflit détecté
- **Sauvegarde locale** en cas d'échec
- **Retry automatique** avec backoff

### Indicateurs de Statut
- 🌐 **En ligne** : Icône verte dans l'en-tête
- 📶 **Synchronisation** : Animation de sync
- 📡 **Hors ligne** : Icône orange + mode offline
- ⚠️ **Erreur** : Icône rouge + message d'erreur

---

## ⚙️ Paramètres PWA

### Menu PWA Features
Accessible via le menu principal :

#### Installation
- **"Installer l'app"** : Installation PWA
- **Détection automatique** de l'éligibilité
- **Guide d'installation** par plateforme

#### Notifications  
- **"Activer notifications"** : Demande de permission
- **"Test notification"** : Vérification du fonctionnement
- **Gestion des permissions** par navigateur

#### Cache et Données
- **"Vider le cache"** : Suppression données locales
- **Rafraîchissement forcé** de l'application
- **Diagnostic** des fonctionnalités supportées

#### Informations Techniques
- ✅ **Service Worker** : État d'activation
- ✅ **Notifications** : Permissions accordées
- ✅ **Cache API** : Support navigateur
- ✅ **Background Sync** : Disponibilité

---

## 🎯 Conseils d'Utilisation

### Pour une Meilleure Expérience
1. **Installez l'app** dès la première visite
2. **Activez les notifications** pour rester informé
3. **Utilisez les gestes** pour une navigation fluide
4. **Gardez l'app à jour** (mise à jour automatique)

### Résolution de Problèmes
- **App lente** → Vider le cache
- **Notifications absentes** → Vérifier permissions navigateur
- **Sync échoue** → Vérifier connexion internet
- **Gestes ne marchent pas** → Recharger la page

### Optimisation Mobile
- **Mode portrait** recommandé pour la navigation
- **Mode paysage** optimal pour les tableaux
- **Zoom navigateur** à 100% pour interface optimale
- **Fermer autres onglets** pour meilleures performances

---

## 🆘 Support et Assistance

### Diagnostics Intégrés
- **Menu PWA** → Informations techniques
- **Console navigateur** → Logs détaillés (F12)
- **DevTools** → Application → Service Workers

### Problèmes Fréquents

**"L'app ne s'installe pas"**
- Vérifiez que le site est en HTTPS
- Utilisez Chrome/Safari récent
- Rechargez la page et réessayez

**"Notifications ne fonctionnent pas"**
- Vérifiez permissions dans réglages navigateur
- Testez avec "Test notification"
- Redémarrez le navigateur si nécessaire

**"Mode hors ligne ne marche pas"**  
- Attendez 1-2 minutes après première visite
- Vérifiez que Service Worker est activé
- Videz le cache et rechargez

**"Gestes tactiles inactifs"**
- Vérifiez que vous êtes sur mobile/tactile
- Rechargez la page
- Évitez les gestes trop rapides

---

## 🎊 Profitez de votre PWA !

AtelierPro PWA vous offre maintenant une expérience mobile native complète avec toute la puissance d'une application web moderne. 

**Bon usage de votre atelier numérique !** 🚀✨
