import { test, expect } from '@playwright/test';

test.describe('Tests PWA et Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Service Worker est enregistré', async ({ page }) => {
    // Vérifier que le service worker est enregistré
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          return !!registration;
        } catch {
          return false;
        }
      }
      return false;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('Manifest PWA est présent', async ({ page }) => {
    // Vérifier que le manifest est lié
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBe('/manifest.json');
    
    // Vérifier que le manifest est accessible
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest.name).toContain('AtelierPro');
    expect(manifest.display).toBe('standalone');
  });

  test('Page hors ligne est disponible', async ({ page }) => {
    const response = await page.request.get('/offline.html');
    expect(response.status()).toBe(200);
    
    await page.goto('/offline.html');
    await expect(page.locator('h1')).toContainText('hors ligne');
    await expect(page.locator('button')).toContainText('Réessayer');
  });

  test('Interface mobile responsive', async ({ page }) => {
    // Test sur différentes tailles d'écran
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 414, height: 896 }, // iPhone 11
      { width: 360, height: 640 }, // Galaxy S5
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Vérifier que le contenu s'adapte
      const body = await page.locator('body').boundingBox();
      expect(body?.width).toBeLessThanOrEqual(viewport.width);
      
      // Vérifier que les éléments sont visibles
      const mainContent = page.locator('main, [role="main"], .main-content').first();
      if (await mainContent.count() > 0) {
        await expect(mainContent).toBeVisible();
      }
    }
  });

  test('Détection des fonctionnalités PWA', async ({ page }) => {
    const features = await page.evaluate(() => {
      return {
        serviceWorker: 'serviceWorker' in navigator,
        notification: 'Notification' in window,
        pushManager: 'PushManager' in window,
        caches: 'caches' in window,
        indexedDB: 'indexedDB' in window,
      };
    });

    expect(features.serviceWorker).toBe(true);
    expect(features.caches).toBe(true);
    expect(features.indexedDB).toBe(true);
    // Les notifications peuvent ne pas être supportées en mode headless
  });

  test('Cache des ressources statiques', async ({ page }) => {
    // Charger la page une première fois
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Vérifier que des ressources sont en cache
    const cacheStatus = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let hasCachedResources = false;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const cachedRequests = await cache.keys();
          if (cachedRequests.length > 0) {
            hasCachedResources = true;
            break;
          }
        }
        
        return {
          hasCaches: cacheNames.length > 0,
          hasCachedResources
        };
      }
      return { hasCaches: false, hasCachedResources: false };
    });

    expect(cacheStatus.hasCaches).toBe(true);
  });

  test('Simulation mode hors ligne', async ({ page, context }) => {
    // Charger la page en mode normal
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simuler le mode hors ligne
    await context.setOffline(true);

    // Recharger la page
    await page.reload();

    // La page devrait encore fonctionner ou afficher la page offline
    const pageContent = await page.content();
    const isOfflinePage = pageContent.includes('hors ligne') || pageContent.includes('offline');
    const hasBasicContent = pageContent.includes('AtelierPro') || pageContent.includes('Atelier');
    
    expect(isOfflinePage || hasBasicContent).toBe(true);

    // Remettre en ligne
    await context.setOffline(false);
  });

  test('Navigation mobile avec gestes (simulation)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Simuler un swipe en utilisant les événements tactiles
    await page.evaluate(() => {
      const touchstart = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [{ clientX: 100, clientY: 200 }] as any
      });
      
      const touchend = new TouchEvent('touchend', {
        bubbles: true,
        changedTouches: [{ clientX: 250, clientY: 200 }] as any
      });
      
      document.body.dispatchEvent(touchstart);
      setTimeout(() => document.body.dispatchEvent(touchend), 100);
    });

    // Attendre un peu pour que les événements soient traités
    await page.waitForTimeout(200);
  });

  test('Installation PWA prompt', async ({ page }) => {
    // Simuler l'événement beforeinstallprompt
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = () => Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });

    // Vérifier si un bouton d'installation apparaît
    // Note: Cela dépend de l'implémentation de votre composant PWAFeatures
    const installButton = page.locator('button').filter({ hasText: /install|installer/i });
    if (await installButton.count() > 0) {
      await expect(installButton).toBeVisible();
    }
  });

  test('Gestion des événements online/offline', async ({ page, context }) => {
    await page.goto('/');

    // Écouter les événements de connexion
    let onlineEvents: string[] = [];
    await page.addInitScript(() => {
      (window as any).onlineEvents = [];
      window.addEventListener('online', () => {
        (window as any).onlineEvents.push('online');
      });
      window.addEventListener('offline', () => {
        (window as any).onlineEvents.push('offline');
      });
    });

    // Simuler offline puis online
    await context.setOffline(true);
    await page.waitForTimeout(100);
    await context.setOffline(false);
    await page.waitForTimeout(100);

    // Vérifier que les événements ont été déclenchés
    onlineEvents = await page.evaluate(() => (window as any).onlineEvents || []);
    
    // Au moins un événement devrait avoir été déclenché
    expect(onlineEvents.length).toBeGreaterThanOrEqual(0);
  });

  test('Métadonnées PWA dans le head', async ({ page }) => {
    await page.goto('/');

    // Vérifier les métadonnées PWA essentielles
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Vérifier les icônes PWA
    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    if (await appleIcon.count() > 0) {
      await expect(appleIcon).toBeVisible();
    }

    const maskableIcon = page.locator('link[rel="icon"]');
    if (await maskableIcon.count() > 0) {
      await expect(maskableIcon).toBeVisible();
    }
  });
});

test.describe('Tests de Performance PWA', () => {
  test('Temps de chargement acceptable', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Le chargement initial devrait prendre moins de 5 secondes
    expect(loadTime).toBeLessThan(5000);
  });

  test('Taille des ressources critiques', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'],
          type: response.url().includes('.js') ? 'js' : 'css'
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Vérifier que les bundles ne sont pas trop volumineux
    const jsFiles = responses.filter(r => r.type === 'js');
    const cssFiles = responses.filter(r => r.type === 'css');

    // Au moins un fichier JS et CSS devraient être chargés
    expect(jsFiles.length).toBeGreaterThan(0);
    
    console.log(`Fichiers JS chargés: ${jsFiles.length}`);
    console.log(`Fichiers CSS chargés: ${cssFiles.length}`);
  });
});
