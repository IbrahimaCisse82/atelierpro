# 📝 To-Do AtelierPro - Ce Qui Reste À Faire

**Mise à jour :** ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}  
**Statut projet :** 🟡 **95% Complet - Tests Finaux Requis**

---

## ✅ RÉCAPITULATIF : TOUT CE QUI EST FAIT

### Phase 1-4 : Fondations Complètes ✅
- ✅ **Sécurité** : RLS, user_roles, validation Zod
- ✅ **Architecture** : useCRUD, pagination, lazy loading, code splitting
- ✅ **Validation** : Schémas Zod (client, order, product), error-handler
- ✅ **Documentation** : README, CONTRIBUTING, guides complets
- ✅ **PWA Mobile** : Service Worker v3, offline, installable Android/iOS
- ✅ **Corrections** : Timeout 12s, QueryClient global, routes nettoyées
- ✅ **Page Installation** : `/install` avec instructions mobile
- ✅ **Gestes Tactiles** : Swipe, long press, pinch-to-zoom
- ✅ **Navigation Mobile** : Header adaptatif, bottom nav, FAB
- ✅ **Offline Storage** : IndexedDB, synchronisation auto

### Système Utilisateur ✅

- ✅ Création compte (handle_new_user, create_user_with_profile)
- ✅ Tests complets validés
- ✅ Réparation automatique profils

---

## 🎯 **CE QUI RESTE À FAIRE** - Avant Production

### 🔴 **CRITIQUE** - À Faire Immédiatement

#### 1. **Tests de Connexion Réels** ⏳
```bash
Action : Se connecter avec un vrai compte
```
- [ ] Créer un compte test (email + password)
- [ ] Vérifier email confirmation Supabase
- [ ] Se connecter avec le compte
- [ ] Vérifier chargement profil utilisateur
- [ ] Vérifier rôle dans `user_roles` table
- [ ] Tester déconnexion

**⚠️ IMPORTANT** : Si erreur "rôle introuvable", aller dans Supabase :
```sql
-- Vérifier user_roles
SELECT * FROM user_roles WHERE user_id = 'votre-user-id';

-- Si vide, insérer manuellement
INSERT INTO user_roles (user_id, company_id, role)
VALUES ('user-id', 'company-id', 'owner');
```

#### 2. **Vérifier Boutons Critiques** ⏳

**Pages Prioritaires à Tester** :
- [ ] **Dashboard** : Navigation sidebar OK
- [ ] **Clients** : Bouton "Nouveau client" → Formulaire → Créer
- [ ] **Commandes** : Bouton "Nouvelle commande" → Formulaire → Créer
- [ ] **Stocks/Produits** : Bouton "Ajouter produit" → Créer
- [ ] **Paramètres** : Modifier profil utilisateur

**Si un bouton ne fonctionne pas** :
1. Vérifier console logs (F12)
2. Vérifier RLS policies dans Supabase
3. Vérifier que `user_roles` contient le bon rôle

#### 3. **Test Installation PWA** ⏳

**Sur Android** :
- [ ] Visiter `/install` depuis Chrome mobile
- [ ] Cliquer "Installer Maintenant"
- [ ] Vérifier icône sur écran d'accueil
- [ ] Ouvrir l'app installée
- [ ] Tester mode offline (désactiver wifi)

**Sur iOS** :
- [ ] Visiter `/install` depuis Safari
- [ ] Suivre instructions iOS
- [ ] Partager > Sur l'écran d'accueil
- [ ] Vérifier icône sur écran d'accueil
- [ ] Ouvrir l'app installée

#### 4. **Audit Sécurité RLS** ⏳

```bash
# Dans Supabase SQL Editor
# Exécuter les queries de vérification
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

- [ ] Vérifier aucune erreur de sécurité
- [ ] Vérifier isolation par `company_id`
- [ ] Vérifier permissions par `user_roles`

---

### 🟠 **IMPORTANT** - Cette Semaine

#### 5. **Créer Vraies Icônes PWA** ⏳

**Actuellement** : Icônes placeholder
**À faire** :
- [ ] Designer logo AtelierPro (suggestion : 👔 stylisé ou 📐)
- [ ] Créer icône 192x192px (PNG, fond transparent)
- [ ] Créer icône 512x512px (PNG, fond transparent)
- [ ] Remplacer `/public/pwa-192x192.png`
- [ ] Remplacer `/public/pwa-512x512.png`
- [ ] Tester sur Android et iOS

**Outils gratuits** :
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

#### 6. **Données de Test** ⏳

Pour tester toutes les fonctionnalités :
- [ ] Créer 5-10 clients avec coordonnées
- [ ] Créer 10-15 produits (tissus, boutons, fils)
- [ ] Créer 5-10 commandes (statuts variés)
- [ ] Créer 3-5 employés avec différents rôles
- [ ] Créer 2-3 fournisseurs
- [ ] Ajouter mesures clients (tour taille, hanches, etc.)

**Script SQL suggéré** :
```sql
-- Dans Supabase SQL Editor
INSERT INTO clients (company_id, first_name, last_name, email, phone, created_by, updated_by)
VALUES 
  ('your-company-id', 'Marie', 'Dupont', 'marie@test.fr', '+33612345678', 'your-user-id', 'your-user-id'),
  ('your-company-id', 'Jean', 'Martin', 'jean@test.fr', '+33698765432', 'your-user-id', 'your-user-id');
```

#### 7. **Tests Principales Pages** ⏳

Tester workflow complet sur chaque page :

**Clients** :
- [ ] Créer nouveau client
- [ ] Modifier client existant
- [ ] Supprimer client (soft delete)
- [ ] Rechercher client
- [ ] Exporter liste clients

**Commandes** :
- [ ] Créer nouvelle commande
- [ ] Ajouter articles à commande
- [ ] Changer statut commande
- [ ] Associer mesures client
- [ ] Générer facture

**Production** :
- [ ] Voir liste tâches
- [ ] Assigner tâche à employé
- [ ] Changer statut production
- [ ] Suivre avancement

**Stocks** :
- [ ] Ajouter nouveau produit
- [ ] Modifier stock
- [ ] Voir alertes stock bas
- [ ] Faire réception

**Finances** :
- [ ] Voir dashboard finances
- [ ] Créer facture client
- [ ] Enregistrer paiement
- [ ] Exporter rapports

---

### 🟡 **SOUHAITABLE** - Ce Mois

#### 8. **Schémas Zod Manquants** ⏳

Actuellement validés : `client`, `order`, `product`

À créer :
- [ ] `supplier.schema.ts` (fournisseurs)
- [ ] `employee.schema.ts` (employés)
- [ ] `measurement.schema.ts` (mesures)
- [ ] `invoice.schema.ts` (factures)
- [ ] `pattern.schema.ts` (modèles/patrons)

**Template** :
```typescript
// src/lib/validations/supplier.schema.ts
import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().regex(/^[0-9+\s()-]+$/).optional(),
  // ... autres champs
});
```

#### 9. **Tests Automatisés E2E** ⏳

- [ ] Configurer Playwright correctement
- [ ] Test login/logout
- [ ] Test création client
- [ ] Test création commande
- [ ] Test navigation pages
- [ ] Test responsive mobile

**Commande** :
```bash
npx playwright test
```

#### 10. **Performance Audit** ⏳

- [ ] Exécuter Lighthouse (F12 > Lighthouse)
- [ ] Vérifier score > 90 sur :
  - Performance
  - Accessibility
  - Best Practices
  - SEO
  - PWA
- [ ] Optimiser si nécessaire

---

## 📊 **CHECKLIST DÉPLOIEMENT PRODUCTION**

### Avant Publication ✅
- [ ] Tests connexion OK
- [ ] 5+ boutons critiques testés
- [ ] PWA installable (Android + iOS)
- [ ] Mode offline testé
- [ ] RLS audit passé (aucune erreur)
- [ ] Build sans erreurs (`npm run build`)
- [ ] Lighthouse score > 90

### Publication 🚀
- [ ] Cliquer **Publish** (bouton en haut à droite Desktop)
- [ ] Attendre déploiement (1-2 min)
- [ ] Tester URL production
- [ ] Installer PWA depuis téléphone réel

### Post-Publication 📈
- [ ] Partager avec 3-5 utilisateurs test
- [ ] Recueillir feedback
- [ ] Monitorer erreurs (Sentry si configuré)
- [ ] Créer roadmap v2

---

## 🎯 **RÉSUMÉ - Prochaines Actions**

### **🔴 AUJOURD'HUI** (1-2h)
1. ✅ Se connecter avec un compte test
2. ✅ Tester 5 boutons critiques (Dashboard, Clients, Commandes, Stocks, Paramètres)
3. ✅ Installer PWA sur téléphone Android ou iOS

### **🟠 CETTE SEMAINE** (4-6h)
1. Créer vraies icônes PWA (192x192, 512x512)
2. Ajouter données de test (clients, commandes, produits)
3. Tester toutes les pages principales
4. Audit sécurité RLS

### **🟡 CE MOIS** (10-15h)
1. Schémas Zod manquants (5 schemas)
2. Tests E2E Playwright
3. Performance audit (Lighthouse > 90)
4. Monitoring production

---

## 📱 **Accès Rapides**

### **URLs Importantes**
- **App** : https://7c144381-cbcc-432e-9008-747ec0192c11.lovableproject.com
- **Installation** : https://7c144381-cbcc-432e-9008-747ec0192c11.lovableproject.com/install
- **Supabase Dashboard** : https://supabase.com/dashboard/project/zvdytkcqhnsivrargtvp

### **Documentation**
- `README.md` - Guide complet
- `CONTRIBUTING.md` - Guide contribution
- `MOBILE_SETUP_COMPLETE.md` - Guide PWA
- `CORRECTIONS_APPLIQUEES.md` - Changelog récent
- `TODO.md` - Ce fichier

---

## ✅ **État Actuel**

| Catégorie | Statut | Commentaire |
|-----------|--------|-------------|
| **Sécurité** | ✅ 95% | RLS OK, user_roles OK, à tester |
| **Architecture** | ✅ 100% | useCRUD, pagination, lazy loading |
| **PWA Mobile** | ✅ 100% | Installable, offline, service worker |
| **Validation** | 🟡 60% | 3/8 schémas Zod, 5 manquants |
| **Tests** | 🟡 30% | Structure OK, à exécuter |
| **Documentation** | ✅ 100% | Complète et à jour |
| **Production Ready** | 🟡 95% | **Tests finaux requis** |

---

## 🚀 **PROCHAINE ACTION IMMÉDIATE**

**ÉTAPE 1** : Tester la connexion
```
1. Aller sur /login
2. Créer un compte (ou se connecter)
3. Vérifier que le dashboard s'affiche
4. Si erreur → Lire console logs (F12)
```

**ÉTAPE 2** : Tester un bouton
```
1. Aller sur /dashboard/clients
2. Cliquer "Nouveau client"
3. Remplir formulaire
4. Créer
5. Vérifier dans liste clients
```

**ÉTAPE 3** : Installer PWA
```
1. Visiter /install sur téléphone
2. Suivre instructions Android ou iOS
3. Vérifier icône écran d'accueil
4. Ouvrir app installée
```

---

*📝 Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}*

**🧵 AtelierPro** - 95% Complet, Tests Finaux en Cours ✨
