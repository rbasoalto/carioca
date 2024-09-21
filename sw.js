const CACHE_NAME = 'carioca-score-cache-v1';

// Install event
self.addEventListener('install', function(event) {
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  // Claim clients immediately, so the service worker starts controlling them
  event.waitUntil(self.clients.claim());
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        // Fetch the latest version in the background
        const fetchPromise = fetch(event.request).then(function(networkResponse) {
          // Update the cache with the new response
          cache.put(event.request, networkResponse.clone());

          // Notify clients about the update (optional)
          sendMessageToClients({
            type: 'UPDATE_AVAILABLE',
            url: event.request.url
          });

          return networkResponse;
        }).catch(function() {
          // If network fetch fails, return the cached response
          return response;
        });

        // Return the cached response immediately if available, or wait for network
        return response || fetchPromise;
      });
    })
  );
});

// Function to send a message to clients (optional)
function sendMessageToClients(msg) {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage(msg);
    });
  });
}