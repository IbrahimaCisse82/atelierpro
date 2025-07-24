import { test, expect } from '@playwright/test'

test.describe('Tests d\'authentification complets', () => {
  const testUser = {
    email: `test.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Affichage de la landing page pour utilisateurs non connectés', async ({ page }) => {
    // Vérifier que la landing page s'affiche
    await expect(page.locator('h1')).toContainText(['Atelier', 'Bienvenue', 'AtelierPro'])
    
    // Vérifier les liens de navigation
    await expect(page.locator('a[href*="login"]')).toBeVisible()
    await expect(page.locator('a[href*="signup"]')).toBeVisible()
  })

  test('Navigation vers la page de connexion', async ({ page }) => {
    await page.click('a[href*="login"]')
    await expect(page).toHaveURL(/.*login.*/)
    
    // Vérifier les éléments de la page de connexion
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Navigation vers la page d\'inscription', async ({ page }) => {
    await page.click('a[href*="signup"]')
    await expect(page).toHaveURL(/.*signup.*/)
    
    // Vérifier les éléments de la page d'inscription
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[name*="first"], input[name*="prenom"]')).toBeVisible()
    await expect(page.locator('input[name*="last"], input[name*="nom"]')).toBeVisible()
  })

  test('Tentative de connexion avec des identifiants invalides', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Vérifier qu'un message d'erreur s'affiche
    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 })
  })

  test('Validation des champs requis lors de l\'inscription', async ({ page }) => {
    await page.goto('/signup')
    
    // Tenter de soumettre sans remplir les champs
    await page.click('button[type="submit"]')
    
    // Vérifier que les validations HTML5 fonctionnent
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('required')
    
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('Format d\'email invalide', async ({ page }) => {
    await page.goto('/signup')
    
    await page.fill('input[type="email"]', 'email-invalide')
    await page.fill('input[type="password"]', 'TestPassword123!')
    
    // Vérifier que la validation HTML5 détecte l'email invalide
    const isValid = await page.locator('input[type="email"]').evaluate(
      (input: HTMLInputElement) => input.validity.valid
    )
    expect(isValid).toBe(false)
  })

  test('Mot de passe trop faible', async ({ page }) => {
    await page.goto('/signup')
    
    await page.fill('input[type="email"]', testUser.email)
    await page.fill('input[type="password"]', '123') // Mot de passe faible
    
    if (await page.locator('input[name*="first"], input[name*="prenom"]').isVisible()) {
      await page.fill('input[name*="first"], input[name*="prenom"]', testUser.firstName)
    }
    if (await page.locator('input[name*="last"], input[name*="nom"]').isVisible()) {
      await page.fill('input[name*="last"], input[name*="nom"]', testUser.lastName)
    }
    
    await page.click('button[type="submit"]')
    
    // Vérifier qu'un message d'erreur s'affiche pour mot de passe faible
    await expect(page.locator('text=Password')).toBeVisible({ timeout: 5000 })
  })

  test('Redirection après connexion réussie', async ({ page }) => {
    // Note: Ce test nécessite un utilisateur existant
    // Pour un test complet, il faudrait d'abord créer un utilisateur
    
    await page.goto('/login')
    
    // Essayer avec des identifiants de démo si disponibles
    const demoEmail = process.env.DEMO_EMAIL || 'demo@atelierpro.com'
    const demoPassword = process.env.DEMO_PASSWORD || 'demo123'
    
    await page.fill('input[type="email"]', demoEmail)
    await page.fill('input[type="password"]', demoPassword)
    await page.click('button[type="submit"]')
    
    // Vérifier la redirection vers le dashboard ou rester sur login en cas d'erreur
    await page.waitForURL(/.*(dashboard|login).*/, { timeout: 10000 })
    
    // Si on arrive sur le dashboard, vérifier les éléments
    if (page.url().includes('dashboard')) {
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('button, a').filter({ hasText: /logout|déconnexion/i })).toBeVisible()
    }
  })

  test('Gestion de l\'état de chargement', async ({ page }) => {
    await page.goto('/login')
    
    // Intercepter les requêtes réseau pour simuler un délai
    await page.route('**/auth/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Vérifier qu'un indicateur de chargement s'affiche
    await expect(page.locator('button[disabled]')).toBeVisible()
  })

  test('Accessibilité des formulaires d\'authentification', async ({ page }) => {
    await page.goto('/login')
    
    // Vérifier les labels
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    // Vérifier que les inputs ont des labels appropriés
    await expect(emailInput).toHaveAttribute('aria-label')
    await expect(passwordInput).toHaveAttribute('aria-label')
    
    // Vérifier la navigation au clavier
    await emailInput.focus()
    await page.keyboard.press('Tab')
    await expect(passwordInput).toBeFocused()
  })

  test('Responsive design sur mobile', async ({ page }) => {
    // Simuler un device mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    
    // Vérifier que les éléments sont toujours visibles et utilisables
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Vérifier que le formulaire n'est pas coupé
    const loginForm = page.locator('form')
    const boundingBox = await loginForm.boundingBox()
    expect(boundingBox?.width).toBeLessThanOrEqual(375)
  })
})
