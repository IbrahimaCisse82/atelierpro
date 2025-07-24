// @ts-nocheck
// @ts-nocheck
// Enhanced AtelierPro Service Worker v3 - With Push Notifications & Offline Support
const CACHE_NAME = 'atelierpro-v3';
const STATIC_CACHE = 'atelierpro-static-v3';
const DYNAMIC_CACHE = 'atelierpro-dynamic-v3';
const API_CACHE = 'atelierpro-api-v3';
const OFFLINE_PAGE = '/offline.html';

// URLs à mettre en cache statiquement
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/offline.html'
];

// Patterns d'URL pour le cache dynamique
const CACHE_PATTERNS = {
  STATIC: /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/,
  API: /\/api\//,
  PAGES: /^\/$|\/dashboard|\/clients|\/orders|\/finances/
};

// Install event - Mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du service worker v3');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        try {
          await cache.addAll(STATIC_URLS);
          console.log('[SW] Cache statique créé avec succès');
        } catch (error) {
          console.warn('[SW] Certaines ressources statiques non disponibles:', error);
          // Cache individuellement pour éviter l'échec global
          for (const url of STATIC_URLS) {
            try {
              await cache.add(url);
            } catch (err) {
              console.warn(`[SW] Impossible de cacher ${url}:`, err);
            }
          }
        }
        return self.skipWaiting();
      })
  );
});

// Activate event - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du service worker v3');
  
  event.waitUntil(
    Promise.all([
      // Nettoyage des anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  );
});

// Fetch event - Stratégie de cache intelligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers des domaines externes (sauf Supabase)
  if (!url.origin.includes(location.origin) && !url.origin.includes('supabase')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

// Fonction principale de gestion des requêtes
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // 1. Ressources statiques - Cache First
    if (CACHE_PATTERNS.STATIC.test(url.pathname) || url.pathname === '/') {
      return await cacheFirstStrategy(request, STATIC_CACHE);
    }
    
    // 2. API Supabase - Network First avec cache de secours
    if (CACHE_PATTERNS.API.test(url.pathname) || url.origin.includes('supabase')) {
      return await networkFirstStrategy(request, API_CACHE);
    }
    
    // 3. Pages de l'application - Stale While Revalidate
    if (CACHE_PATTERNS.PAGES.test(url.pathname)) {
      return await staleWhileRevalidateStrategy(request, DYNAMIC_CACHE);
    }
    
    // 4. Autres ressources - Network First
    return await networkFirstStrategy(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('[SW] Erreur dans handleFetch:', error);
    
    // Page de fallback pour les erreurs de navigation
    if (request.destination === 'document') {
      const offlineResponse = await caches.match(OFFLINE_PAGE);
      return offlineResponse || new Response('Application hors ligne', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    return new Response('Ressource non disponible', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Stratégie Cache First - Pour les ressources statiques
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Cache hit pour:', request.url);
    return cachedResponse;
  }
  
  console.log('[SW] Cache miss, récupération réseau pour:', request.url);
  const networkResponse = await fetch(request);
  
  if (networkResponse && networkResponse.status === 200) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stratégie Network First - Pour les données dynamiques
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('[SW] Tentative réseau pour:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Réseau échoué, tentative cache pour:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stratégie Stale While Revalidate - Pour un équilibre performance/fraîcheur
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Mise à jour en arrière-plan
  const fetchPromise = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('[SW] Échec de la mise à jour en arrière-plan:', error);
  });
  
  // Retourner immédiatement la version cachée si disponible
  if (cachedResponse) {
    console.log('[SW] Retour cache + update background pour:', request.url);
    return cachedResponse;
  }
  
  // Sinon attendre la réponse réseau
  console.log('[SW] Attente réseau pour:', request.url);
  return await fetchPromise;
}

// ==================== NOTIFICATIONS PUSH ====================

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue');
  
  const options = {
    body: 'Nouvelle activité dans AtelierPro',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir détails',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/pwa-192x192.png'
      }
    ]
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      options.title = pushData.title || 'AtelierPro';
      options.body = pushData.body || options.body;
      options.icon = pushData.icon || options.icon;
      options.data = { ...options.data, ...pushData.data };
    } catch (error) {
      console.error('[SW] Erreur parsing données push:', error);
      options.title = 'AtelierPro';
    }
  } else {
    options.title = 'AtelierPro';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event.notification.tag);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focaliser
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// ==================== SYNCHRONISATION EN ARRIÈRE-PLAN ====================

// Synchronisation des données en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('[SW] Événement de synchronisation:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('[SW] Synchronisation en arrière-plan démarrée');
  
  try {
    // Synchroniser les données pending depuis IndexedDB ou localStorage
    // Cette partie dépendra de votre implémentation de stockage offline
    
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('[SW] Synchronisation réussie');
      
      // Notifier l'utilisateur si l'app n'est pas active
      const clientList = await clients.matchAll({ type: 'window' });
      if (clientList.length === 0) {
        self.registration.showNotification('AtelierPro', {
          body: 'Données synchronisées avec succès',
          icon: '/pwa-192x192.png'
        });
      }
    }
  } catch (error) {
    console.error('[SW] Erreur de synchronisation:', error);
    throw error; // Pour relancer la sync plus tard
  }
}

// ==================== GESTION DES MISES À JOUR ====================

// Message du client pour forcer la mise à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Activation forcée demandée');
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker AtelierPro v3 chargé avec succès'); 