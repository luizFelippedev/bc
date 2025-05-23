const CACHE_NAME = 'portfolio-v1.0.0';
const STATIC_CACHE = 'portfolio-static-v1';
const DYNAMIC_CACHE = 'portfolio-dynamic-v1';

// Assets para cache estático
const STATIC_ASSETS = [
  '/',
  '/about',
  '/projects',
  '/skills',
  '/certificates',
  '/contact',
  '/manifest.json',
  '/offline.html'
];

// Assets para cache dinâmico
const CACHE_STRATEGIES = {
  images: {
    strategy: 'cache-first',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    maxEntries: 100
  },
  api: {
    strategy: 'network-first',
    maxAge: 5 * 60 * 1000, // 5 minutos
    maxEntries: 50
  },
  pages: {
    strategy: 'stale-while-revalidate',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    maxEntries: 25
  }
};

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return handleExternalRequest(event);
  }
  
  // Route requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Helper functions
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(request.url);
}

function isApiRequest(request) {
  return request.url.includes('/api/');
}

function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Image from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('[SW] Image cached:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Image fetch failed:', error);
    return new Response('Image not available', { status: 404 });
  }
}

async function handleApiRequest(request) {
  try {
    // Network first para APIs
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('[SW] API response cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API network failed, trying cache:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] API from cache:', request.url);
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Network unavailable',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePageRequest(request) {
  try {
    // Stale while revalidate para páginas
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Page from cache (stale):', request.url);
      // Revalidate in background
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response);
          console.log('[SW] Page revalidated:', request.url);
        }
      }).catch(() => {});
      
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('[SW] Page cached:', request.url);
    }
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Page fetch failed:', error);
    
    // Fallback para página offline
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline.html');
    
    if (offlinePage) {
      return offlinePage;
    }
    
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Portfolio</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: #0f172a;
              color: #f8fafc;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { color: #60a5fa; }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📡</div>
            <h1>Você está offline</h1>
            <p>Verifique sua conexão com a internet e tente novamente.</p>
            <button onclick="window.location.reload()">Tentar novamente</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Static from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('[SW] Static cached:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static fetch failed:', error);
    return new Response('Resource not available', { status: 404 });
  }
}

function handleExternalRequest(event) {
  // Para requests externos (CDNs, etc), usar cache simples
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(event.request, responseClone));
            }
            return response;
          });
      })
      .catch(() => {
        return new Response('External resource not available', { status: 404 });
      })
  );
}

// Background sync para analytics offline
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  try {
    const offlineActions = await getOfflineActions();
    for (const action of offlineActions) {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      });
    }
    await clearOfflineActions();
    console.log('[SW] Analytics synced successfully');
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'portfolio-update',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Portfolio - João Silva', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handling
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CACHE_URLS':
        cacheUrls(event.data.urls);
        break;
    }
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.addAll(urls);
  console.log('[SW] URLs cached:', urls);
}

// Helper functions for offline storage
async function getOfflineActions() {
  // Implementation would use IndexedDB
  return [];
}

async function clearOfflineActions() {
  // Implementation would clear IndexedDB
}

console.log('[SW] Service Worker loaded');