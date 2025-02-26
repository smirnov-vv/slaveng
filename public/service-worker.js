// public/service-worker.js
const CACHE_NAME = 'fastify-pwa-cache-v1';
// Fallback pages for offline use
const urlsToCache = [
  '/',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  '/images/192logo.png',
  '/images/512logo.png'
];

// Install Service Worker and cache fallback resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event with Network First strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone the response before using it
        const responseClone = networkResponse.clone();

        // Update the cache with the cloned response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        // Return the original response
        return networkResponse;
      })
      .catch(() => {
        // If the network fails, serve from the cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/'); // Fallback to offline resources
        });
      })
  );
});