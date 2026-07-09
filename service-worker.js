const CACHE_NAME = "kbt-kurs-v2-guard1-fbauth2-net1";
const CORE_ASSETS = [
  "./index.html",
  "./styles.css",
  "./engine.js",
  "./protect.js",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isHTML(request) {
  return request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html") ||
    request.url.endsWith(".html") ||
    request.url.endsWith("/");
}
function isNetworkFirst(request) {
  // guard.js təhlükəsizlik üçün kritikdir - HEÇ VAXT köhnəlmiş keşdən verilməməlidir
  return isHTML(request) || request.url.endsWith("/guard.js");
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // HTML: NETWORK-FIRST — həmişə serverdəki ən son versiyanı göstər,
  // yalnız internet olmadıqda köhnə keşə keç.
  if (isNetworkFirst(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CSS/JS/Şəkillər: STALE-WHILE-REVALIDATE — sürətli göstər, arxada yenilə.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
