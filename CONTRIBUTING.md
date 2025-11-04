# 🤝 Guide de Contribution - AtelierPro

Merci de votre intérêt pour contribuer à AtelierPro ! Ce guide vous aidera à démarrer.

## 📋 Table des Matières
- [Code de Conduite](#code-de-conduite)
- [Premiers Pas](#premiers-pas)
- [Structure du Projet](#structure-du-projet)
- [Conventions de Code](#conventions-de-code)
- [Workflow Git](#workflow-git)
- [Tests](#tests)
- [Pull Requests](#pull-requests)

---

## 📜 Code de Conduite

Soyez respectueux, professionnel et constructif dans toutes les interactions.

---

## 🚀 Premiers Pas

### 1. Fork & Clone
```bash
# Fork sur GitHub puis :
git clone https://github.com/VOTRE-USERNAME/atelierpro.git
cd atelierpro
```

### 2. Installation
```bash
npm install
cp .env.example .env
# Configurer .env avec vos credentials Supabase
```

### 3. Créer une Branche
```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/mon-correctif
```

---

## 🏗️ Structure du Projet

```
src/
├── components/     # Composants UI
│   ├── ui/        # Design system (shadcn)
│   ├── common/    # Composants réutilisables
│   └── auth/      # Authentification
├── hooks/         # Custom hooks métier
├── lib/           # Utilitaires et helpers
│   ├── validations/  # Schémas Zod
│   └── error-handler.ts
├── pages/         # Pages de l'application
└── types/         # Types TypeScript
```

### Où Ajouter du Code ?

| Type | Emplacement | Exemple |
|------|-------------|---------|
| Composant UI | `src/components/ui/` | `button.tsx` |
| Page | `src/pages/` | `OrdersPage.tsx` |
| Hook métier | `src/hooks/` | `use-orders.ts` |
| Validation | `src/lib/validations/` | `order.schema.ts` |
| Utilitaire | `src/lib/` | `format-utils.ts` |
| Type | `src/types/` | `order.ts` |

---

## 📝 Conventions de Code

### TypeScript
```typescript
// ✅ BIEN : Types explicites
interface Order {
  id: string;
  total_amount: number;
}

// ❌ MAL : any
const data: any = fetchData();

// ✅ BIEN : Nommage PascalCase pour composants
function OrderList() { }

// ✅ BIEN : Nommage camelCase pour fonctions
function fetchOrders() { }

// ✅ BIEN : Nommage kebab-case pour fichiers
// order-list.tsx, use-orders.ts
```

### React
```typescript
// ✅ BIEN : Functional components avec hooks
function OrderCard({ order }: { order: Order }) {
  const { delete: deleteOrder } = useCRUD<Order>({ table: 'orders' });
  return <div>{order.total_amount}</div>;
}

// ❌ MAL : Class components
class OrderCard extends React.Component { }

// ✅ BIEN : Props typées
interface OrderCardProps {
  order: Order;
  onUpdate: (order: Order) => void;
}

// ✅ BIEN : Hooks avec dépendances correctes
useEffect(() => {
  fetchData();
}, [fetchData]); // Dépendances

// ❌ MAL : useEffect sans dépendances
useEffect(() => {
  fetchData(); // Peut causer bugs
});
```

### CSS / Tailwind
```tsx
// ✅ BIEN : Utiliser les classes du design system
<div className="bg-primary text-primary-foreground">

// ❌ MAL : Couleurs hardcodées
<div className="bg-blue-600 text-white">

// ✅ BIEN : Responsive design
<div className="flex flex-col md:flex-row gap-4">

// ✅ BIEN : Utiliser cn() pour conditions
<div className={cn(
  "base-classes",
  isActive && "active-classes"
)}>
```

### Validation Zod
```typescript
// ✅ BIEN : Schéma complet avec messages
export const orderSchema = z.object({
  total_amount: z.coerce.number()
    .min(0, "Le montant doit être positif"),
  notes: z.string()
    .max(1000, "Max 1000 caractères")
    .optional()
});

// ❌ MAL : Sans messages
export const orderSchema = z.object({
  total_amount: z.number().min(0),
  notes: z.string().max(1000)
});
```

---

## 🌿 Workflow Git

### Commits
Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Nouvelle fonctionnalité
git commit -m "feat: Add order status filter"

# Correctif
git commit -m "fix: Correct amount calculation"

# Documentation
git commit -m "docs: Update README installation steps"

# Refactoring
git commit -m "refactor: Extract order validation to schema"

# Performance
git commit -m "perf: Optimize order stats calculation"

# Tests
git commit -m "test: Add unit tests for useCRUD hook"
```

### Types de Commits
- `feat:` Nouvelle fonctionnalité
- `fix:` Correctif de bug
- `docs:` Documentation
- `style:` Formatting, manque de ;
- `refactor:` Ni feat ni fix
- `perf:` Performance
- `test:` Tests
- `chore:` Maintenance

---

## 🧪 Tests

### Avant de Soumettre
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Tests unitaires
npm run test

# Tests E2E (optionnel)
npm run test:e2e
```

### Écrire des Tests

```typescript
// hooks/__tests__/use-crud.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCRUD } from '../use-crud';

describe('useCRUD', () => {
  it('should create item successfully', async () => {
    const { result } = renderHook(() => 
      useCRUD<Order>({ table: 'orders' })
    );

    await act(async () => {
      await result.current.create({ total_amount: 100 });
    });

    expect(result.current.items).toHaveLength(1);
  });
});
```

---

## 🔀 Pull Requests

### Checklist Avant PR
- [ ] Code lint sans erreur (`npm run lint`)
- [ ] Types TypeScript valides (`npm run type-check`)
- [ ] Tests passent (`npm run test`)
- [ ] Documentation mise à jour si nécessaire
- [ ] Commits suivent Conventional Commits
- [ ] Branche à jour avec `main`

### Template de PR

```markdown
## Description
Brève description des changements

## Type de Changement
- [ ] Nouvelle fonctionnalité
- [ ] Correctif de bug
- [ ] Amélioration de performance
- [ ] Refactoring
- [ ] Documentation

## Tests
Comment les changements ont été testés ?

## Screenshots (si UI)
Avant / Après

## Checklist
- [ ] Lint OK
- [ ] Type-check OK
- [ ] Tests OK
- [ ] Documentation mise à jour
```

### Processus de Review
1. **Soumission** : Créer la PR avec template rempli
2. **CI/CD** : Vérification automatique (lint, tests)
3. **Review** : Au moins 1 approbation requise
4. **Merge** : Squash and merge dans `main`

---

## 🎯 Bonnes Pratiques

### Performance
- ✅ Utiliser `useMemo` pour calculs coûteux
- ✅ Lazy loading des pages lourdes
- ✅ Pagination pour grandes listes
- ❌ Éviter re-renders inutiles

### Sécurité
- ✅ Valider toutes les entrées utilisateur (Zod)
- ✅ Utiliser RLS pour permissions
- ✅ Pas de données sensibles en console.log
- ❌ Jamais committer .env

### Accessibilité
- ✅ Labels ARIA sur éléments interactifs
- ✅ Navigation clavier fonctionnelle
- ✅ Contrastes suffisants (WCAG AA)
- ✅ Messages d'erreur explicites

---

## 🐛 Signaler un Bug

### Template d'Issue

```markdown
## Description du Bug
Description claire et concise

## Étapes pour Reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Comportement Attendu
Ce qui devrait se passer

## Comportement Actuel
Ce qui se passe réellement

## Screenshots
Si applicable

## Environnement
- OS: [Windows/Mac/Linux]
- Navigateur: [Chrome 120]
- Version: [v2.0.0]

## Logs Console
Copier les erreurs de la console
```

---

## 💡 Proposer une Fonctionnalité

### Template d'Issue

```markdown
## Problème à Résoudre
Quel est le besoin / problème ?

## Solution Proposée
Description de la fonctionnalité souhaitée

## Alternatives Considérées
Autres approches envisagées

## Contexte Additionnel
Informations supplémentaires
```

---

## 📚 Ressources

### Documentation
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod](https://zod.dev/)

### Outils Recommandés
- **VS Code** avec extensions :
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Error Lens
- **Chrome DevTools**
- **React DevTools**

---

## 🎓 Apprendre le Projet

### Par où commencer ?

1. **Lire README.md** : Vue d'ensemble
2. **Explorer `/docs`** : Documentation détaillée
3. **Lire le code de** :
   - `src/hooks/use-crud.ts` : Hook principal
   - `src/lib/error-handler.ts` : Gestion d'erreurs
   - `src/contexts/AuthContext.tsx` : Authentification
4. **Créer une petite fonctionnalité** : Best way to learn!

---

## ❓ Questions ?

- **Issues GitHub** : Pour bugs et features
- **Discussions GitHub** : Pour questions générales
- **Email** : dev@atelierpro.com

---

**Merci de contribuer à AtelierPro ! 🎉**
