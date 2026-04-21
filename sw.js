/* Chip-IT Service Worker
   Lightweight offline + faster repeat loads (images + assets).
*/
const CACHE_VERSION = 'chipit-v1.2.2';
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMG_CACHE = `${CACHE_VERSION}-images`;

const CORE_ASSETS = [
  './',
  './index.html',
  './services.html',
  './about-us.html',
  './invitations.html',
  './quote.html',
  './booking.html',
  './portfolio.html',
  './assets/css/site.css',
  './assets/js/site.js',
  './assets/js/services-page.js',
  './homepage.css',
  './homepage-mobi.css',
  './homepage.js',
  './services.css',
  './services-mobi.css',
  './about-us.css',
  './about-us-mobi.css',
  './invitations.css',
  './invitations-mobi.css',
  './quote.css',
  './booking.css',
  './portfolio.css',
  './quote.js',
  './booking.js',
  './portfolio.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.startsWith('chipit-') && !k.startsWith(CACHE_VERSION) ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return cached || Response.error();
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(req);
    return cached || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) return; // let the browser handle third-party (Bootstrap CDN, etc.)

  const accept = req.headers.get('accept') || '';

  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req, IMG_CACHE));
    return;
  }

  if (req.destination === 'style' || req.destination === 'script') {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  if (accept.includes('text/html')) {
    event.respondWith(networkFirst(req, CORE_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});
