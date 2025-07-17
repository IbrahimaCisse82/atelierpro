import { test, expect } from '@playwright/test';

test.describe('AtelierPro - Parcours complet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
  });

  test('Tous les boutons sont actifs et affichent un toast', async ({ page }) => {
    // Ouvre le ButtonTester
    await page.locator('button', { hasText: 'Test Boutons' }).click();
    // Clique sur chaque bouton du ButtonTester
    const buttonNames = [
      'Créer', 'Modifier', 'Supprimer', 'Télécharger', 'Uploader',
      'Voir', 'Sauvegarder', 'Envoyer', 'Démarrer', 'Pause', 'Arrêter'
    ];
    for (const name of buttonNames) {
      await page.getByRole('button', { name }).click();
      await expect(page.getByText(`${name} activé`)).toBeVisible();
    }
  });

  test('Navigation et CRUD sur les modules principaux', async ({ page }) => {
    // Dashboard
    await expect(page.getByText('Tableau de bord')).toBeVisible();

    // Clients
    await page.getByRole('link', { name: /clients/i }).click();
    await expect(page.getByText('Gestion des Clients')).toBeVisible();
    await page.getByRole('button', { name: /nouveau client/i }).click();
    await expect(page.getByText(/Créer un nouveau client/i)).toBeVisible();

    // Achats
    await page.getByRole('link', { name: /achats/i }).click();
    await expect(page.getByText('Gestion des Achats')).toBeVisible();
    await page.getByRole('button', { name: /nouvel achat/i }).click();
    await expect(page.getByText(/Créer un achat/i)).toBeVisible();

    // RH
    await page.getByRole('link', { name: /ressources humaines/i }).click();
    await expect(page.getByText('Ressources Humaines')).toBeVisible();
    await page.getByRole('button', { name: /nouvel employé/i }).click();
    await expect(page.getByText(/ajout d'employé/i)).toBeVisible();
  });

  test('Aucun bouton désactivé dans le DOM', async ({ page }) => {
    const disabledButtons = await page.locator('button[disabled]').count();
    expect(disabledButtons).toBe(0);
  });

  test('Connexion/déconnexion et création de compte', async ({ page }) => {
    // Aller sur la page d'auth
    await page.goto('http://localhost:5175');
    // Test login (adaptez les sélecteurs selon votre UI)
    await page.getByPlaceholder('Votre email').fill('test@atelierpro.com');
    await page.getByPlaceholder('Votre mot de passe').fill('test1234');
    await page.getByRole('button', { name: /se connecter/i }).click();
    // Vérifier l'accès au dashboard
    await expect(page.getByText('Tableau de bord')).toBeVisible();
    // Déconnexion
    await page.getByRole('button', { name: /déconnexion/i }).click();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });

  test('Vérification des notifications toast', async ({ page }) => {
    await page.getByRole('button', { name: /Test Boutons/i }).click();
    await expect(page.getByText(/activé/)).toBeVisible();
  });
}); 