// Service Worker pour AtelierPro
const CACHE_NAME = 'atelierpro-v1';
const STATIC_CACHE = 'atelierpro-static-v1';
const DYNAMIC_CACHE = 'atelierpro-dynamic-v1';

// URLs à mettre en cache statiquement
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
];

// Install event - Mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        console.log('[SW] Service worker installé');
        return self.skipWaiting();
      })
  );
});

// Activate event - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activé');
        return self.clients.claim();
      })
  );
});

// Fetch event - Stratégie de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Stratégie pour les ressources statiques
  if (STATIC_URLS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response; // Retourner depuis le cache
          }
          return fetch(request)
            .then((response) => {
              // Mettre en cache la réponse
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }

  // Stratégie pour l'API Supabase
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache les réponses réussies
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, essayer le cache
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Retourner une réponse d'erreur offline
              return new Response(
                JSON.stringify({ 
                  error: 'Offline', 
                  message: 'Aucune connexion disponible' 
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Stratégie par défaut : Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache les réponses réussies
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // En cas d'erreur, essayer le cache
        return caches.match(request);
      })
  );
});

// Message event - Communication avec l'app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;
  }
});

// Background sync pour les actions offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Synchroniser les données en arrière-plan
      syncData()
    );
  }
});

// Fonction de synchronisation des données
async function syncData() {
  try {
    // Récupérer les actions en attente depuis IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        // Exécuter l'action
        await executeAction(action);
        // Marquer comme terminée
        await markActionComplete(action.id);
      } catch (error) {
        console.error('[SW] Erreur lors de la synchronisation:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Erreur de synchronisation:', error);
  }
}

// Fonctions utilitaires pour IndexedDB
async function getPendingActions() {
  // Implémentation simplifiée - à adapter selon vos besoins
  return [];
}

async function executeAction(action) {
  // Implémentation simplifiée - à adapter selon vos besoins
  console.log('[SW] Exécution de l\'action:', action);
}

async function markActionComplete(actionId) {
  // Implémentation simplifiée - à adapter selon vos besoins
  console.log('[SW] Action terminée:', actionId);
} 