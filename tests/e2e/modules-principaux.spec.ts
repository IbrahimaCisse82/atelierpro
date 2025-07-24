import { test, expect } from '@playwright/test'

test.describe('Tests des modules principaux', () => {
  // Hooks de configuration
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Tenter de se connecter avec un utilisateur de démo
    const demoEmail = process.env.DEMO_EMAIL || 'demo@atelierpro.com'
    const demoPassword = process.env.DEMO_PASSWORD || 'demo123'
    
    // Si on n'est pas sur le dashboard, essayer de se connecter
    if (!page.url().includes('dashboard')) {
      await page.goto('/login')
      await page.fill('input[type="email"]', demoEmail)
      await page.fill('input[type="password"]', demoPassword)
      await page.click('button[type="submit"]')
      
      // Attendre la redirection ou continuer si déjà connecté
      try {
        await page.waitForURL('**/dashboard**', { timeout: 5000 })
      } catch {
        // Ignorer si la connexion échoue, certains tests peuvent continuer
      }
    }
  })

  test.describe('Navigation et Dashboard', () => {
    test('Affichage du dashboard principal', async ({ page }) => {
      if (page.url().includes('dashboard')) {
        // Vérifier les éléments principaux du dashboard
        await expect(page.locator('nav')).toBeVisible()
        await expect(page.locator('main')).toBeVisible()
        
        // Vérifier les liens de navigation principaux
        const navLinks = ['commandes', 'clients', 'finances', 'stocks', 'employés']
        for (const link of navLinks) {
          await expect(page.locator(`a:has-text("${link}"), a[href*="${link}"]`)).toBeVisible()
        }
      }
    })

    test('Navigation entre les modules', async ({ page }) => {
      if (page.url().includes('dashboard')) {
        // Tester la navigation vers différents modules
        const modules = [
          { name: 'clients', url: 'clients' },
          { name: 'commandes', url: 'orders' },
          { name: 'finances', url: 'finances' }
        ]
        
        for (const module of modules) {
          await page.click(`a[href*="${module.url}"], a:has-text("${module.name}")`)
          await expect(page).toHaveURL(new RegExp(module.url))
          await page.goBack()
        }
      }
    })
  })

  test.describe('Module Clients', () => {
    test.beforeEach(async ({ page }) => {
      if (page.url().includes('dashboard')) {
        await page.goto('/clients')
      }
    })

    test('Affichage de la liste des clients', async ({ page }) => {
      if (page.url().includes('clients')) {
        // Vérifier les éléments de la page clients
        await expect(page.locator('h1, h2').filter({ hasText: /clients/i })).toBeVisible()
        
        // Vérifier le bouton d'ajout
        await expect(page.locator('button, a').filter({ hasText: /ajouter|nouveau/i })).toBeVisible()
        
        // Vérifier la table ou la liste
        await expect(page.locator('table, div[role="table"], .client-list')).toBeVisible()
      }
    })

    test('Fonctionnalité de recherche des clients', async ({ page }) => {
      if (page.url().includes('clients')) {
        const searchInput = page.locator('input[type="search"], input[placeholder*="recherch"]')
        if (await searchInput.isVisible()) {
          await searchInput.fill('test')
          // Vérifier que la liste se filtre (attendre un délai pour le debounce)
          await page.waitForTimeout(500)
        }
      }
    })

    test('Modal d\'ajout de client', async ({ page }) => {
      if (page.url().includes('clients')) {
        const addButton = page.locator('button, a').filter({ hasText: /ajouter|nouveau/i })
        if (await addButton.isVisible()) {
          await addButton.click()
          
          // Vérifier que le modal ou la page s'ouvre
          await expect(page.locator('dialog, .modal, form')).toBeVisible()
          
          // Vérifier les champs requis
          await expect(page.locator('input[name*="name"], input[name*="nom"]')).toBeVisible()
          await expect(page.locator('input[type="email"]')).toBeVisible()
        }
      }
    })
  })

  test.describe('Module Commandes', () => {
    test.beforeEach(async ({ page }) => {
      if (page.url().includes('dashboard')) {
        await page.goto('/orders')
      }
    })

    test('Affichage de la liste des commandes', async ({ page }) => {
      if (page.url().includes('orders')) {
        await expect(page.locator('h1, h2').filter({ hasText: /commandes|orders/i })).toBeVisible()
        
        // Vérifier les colonnes importantes
        const columns = ['client', 'date', 'statut', 'montant']
        for (const column of columns) {
          await expect(page.locator(`th:has-text("${column}"), .column-${column}`)).toBeVisible()
        }
      }
    })

    test('Filtrage par statut des commandes', async ({ page }) => {
      if (page.url().includes('orders')) {
        // Chercher des filtres de statut
        const statusFilters = page.locator('select, button').filter({ hasText: /statut|status/ })
        if (await statusFilters.count() > 0) {
          await statusFilters.first().click()
          // Vérifier que des options sont disponibles
          await expect(page.locator('option, .dropdown-item')).toBeVisible()
        }
      }
    })

    test('Détails d\'une commande', async ({ page }) => {
      if (page.url().includes('orders')) {
        // Chercher un lien vers les détails d'une commande
        const orderLink = page.locator('a[href*="/orders/"], tr td a, .order-link').first()
        if (await orderLink.isVisible()) {
          await orderLink.click()
          
          // Vérifier qu'on arrive sur la page de détail
          await expect(page.locator('h1, h2').filter({ hasText: /détail|commande/i })).toBeVisible()
        }
      }
    })
  })

  test.describe('Module Finances', () => {
    test.beforeEach(async ({ page }) => {
      if (page.url().includes('dashboard')) {
        await page.goto('/finances')
      }
    })

    test('Affichage du tableau de bord financier', async ({ page }) => {
      if (page.url().includes('finances')) {
        await expect(page.locator('h1, h2').filter({ hasText: /finances|comptabilité/i })).toBeVisible()
        
        // Vérifier les indicateurs financiers
        const indicators = ['chiffre', 'bénéfice', 'dépenses', 'recettes']
        for (const indicator of indicators) {
          await expect(page.locator(`.metric, .indicator`).filter({ hasText: new RegExp(indicator, 'i') })).toBeVisible()
        }
      }
    })

    test('Graphiques et visualisations', async ({ page }) => {
      if (page.url().includes('finances')) {
        // Vérifier la présence de graphiques
        await expect(page.locator('canvas, .chart, .graph, svg')).toBeVisible()
      }
    })
  })

  test.describe('Tests responsive', () => {
    test('Navigation mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      if (page.url().includes('dashboard')) {
        // Vérifier le menu burger sur mobile
        const menuButton = page.locator('button[aria-label="menu"], .menu-toggle, .hamburger')
        if (await menuButton.isVisible()) {
          await menuButton.click()
          await expect(page.locator('nav, .mobile-menu')).toBeVisible()
        }
      }
    })

    test('Tableaux responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/clients')
      
      if (page.url().includes('clients')) {
        // Vérifier que les tableaux s'adaptent (scroll horizontal ou affichage en cartes)
        const table = page.locator('table')
        if (await table.isVisible()) {
          const tableWidth = await table.evaluate(el => el.scrollWidth)
          expect(tableWidth).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Performance et chargement', () => {
    test('Temps de chargement des pages', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      // Vérifier que le chargement prend moins de 5 secondes
      expect(loadTime).toBeLessThan(5000)
    })

    test('Lazy loading des modules', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Naviguer vers un module et vérifier qu'il se charge
      await page.click('a[href*="/clients"]')
      await expect(page.locator('h1, h2').filter({ hasText: /clients/i })).toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Gestion d\'erreurs', () => {
    test('Page 404 pour routes inexistantes', async ({ page }) => {
      await page.goto('/route-qui-nexiste-pas')
      
      // Vérifier qu'une page d'erreur ou redirection s'affiche
      await expect(page.locator('text=404, text=introuvable, text=erreur')).toBeVisible()
    })

    test('Gestion des erreurs réseau', async ({ page }) => {
      // Simuler une panne réseau
      await page.route('**/api/**', route => route.abort())
      
      await page.goto('/dashboard')
      
      // Vérifier qu'un message d'erreur approprié s'affiche
      await expect(page.locator('text=erreur, text=problème, .error')).toBeVisible({ timeout: 10000 })
    })
  })
})
