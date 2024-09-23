const CACHE_NAME = 'carioca-score-cache-v3';

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
  // Claim clients immediately so the new service worker starts controlling them
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        return self.clients.claim();
      });
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        const fetchPromise = fetch(event.request)
          .then(function(networkResponse) {
            // Update the cache with the new response
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(function() {
            // If network fetch fails, return the cached response
            return response;
          });

        // Return the cached response immediately if available, or wait for network
        return response || fetchPromise;
      });
    })
  );
});

// Optional: Listen for messages from the client
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});