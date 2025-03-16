const CACHE_NAME = 'fastify-pwa-cache-v1';

// Fallback pages for offline use
const urlsToCache = [
  '/',
  '/api/offline',
  '/images/192logo.png',
  '/images/512logo.png',
  '/manifest.json',
  '/mystyles.css'
];

// Install Service Worker and cache fallback resources
self.addEventListener('install', (event) => {
  // Skip the "waiting" state and activate the new service worker immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching URLs:', urlsToCache);
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('All URLs cached successfully');
          })
          .catch((error) => {
            console.error('Failed to cache URLs:', error);
          });
      })
  );
});

// Activate the new service worker and claim control
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event with Network First strategy
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);

  if (event.request.mode === 'navigate') {
    // Handle navigation requests
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          console.log('Network response:', event.request.url);
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          console.log('Network failed, serving /api/offline');
          return caches.match('/api/offline')
            .then((offlineResponse) => {
              if (offlineResponse) {
                return offlineResponse;
              } else {
                return new Response('Offline fallback', {
                  headers: { 'Content-Type': 'text/html' },
                });
              }
            });
        })
    );
  } else {
    // Handle non-navigation requests
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          console.log('Network response:', event.request.url);
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          console.log('Network failed, serving from cache:', event.request.url);
          return caches.match(event.request);
        })
    );
  }
});