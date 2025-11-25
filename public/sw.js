// sw.js
const CACHE_NAME = "app-cache-v2";
const OFFLINE_URL = "/offline.html";
self.addEventListener("install", (event) => {
  console.log("🧩 Service Worker installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching offline assets");
      return cache
        .addAll([
          OFFLINE_URL,
          "/logo.webp",
          "/NOinternet.json",
          "/lottie.min.js",
        ])
        .catch((err) => {
          console.error("Failed to cache:", err);
        });
    })
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  event.waitUntil(clients.claim());
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Try network for new requests
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Show offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          // Return nothing for other failed requests
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

// REMOVED: Periodic sync and automatic notification checks
// If you want notifications in the future, you can add them back with proper user permission

// 🔔 Notification click handler (in case you enable notifications later)
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   event.waitUntil(clients.openWindow("/projects"));
// });
