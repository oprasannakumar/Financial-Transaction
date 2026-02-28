const CACHE_NAME = "finance-v3-cache";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./sw.js"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Network First (for API calls)
// Cache First (for static)
self.addEventListener("fetch", event => {

  const url = new URL(event.request.url);

  // Google Apps Script API → Network First
  if (url.href.includes("script.google.com")) {

    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return new Response(JSON.stringify({ offline: true }), {
            headers: { "Content-Type": "application/json" }
          });
        })
    );
    return;
  }

  // Static files → Cache First
  event.respondWith(
    caches.match(event.request)
      .then(res => res || fetch(event.request))
  );
});