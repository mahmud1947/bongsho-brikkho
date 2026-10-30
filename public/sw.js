const CACHE_NAME = 'bongsho-brikkho-v10';

// Dynamic base resolution based on where the service worker is registered
const getBaseScope = () => {
  return self.registration.scope || '/';
};

self.addEventListener('install', (event) => {
  const base = getBaseScope();
  const PRECACHE_URLS = [
    base,
    `${base}manifest.json`,
    `${base}favicon.png`,
    `${base}icons/icon-192x192.png`,
    `${base}icons/icon-512x512.png`,
    `${base}icons/icon.svg`,
    `${base}flags/bd.svg`,
    `${base}flags/gb.svg`,
    `${base}flags/us.svg`,
    `${base}flags/sa.svg`,
    `${base}flags/ae.svg`,
    `${base}flags/qa.svg`,
    `${base}flags/kw.svg`,
    `${base}flags/om.svg`,
    `${base}flags/bh.svg`,
    `${base}flags/my.svg`,
    `${base}flags/sg.svg`,
    `${base}flags/ca.svg`,
    `${base}flags/au.svg`,
    `${base}flags/it.svg`,
    `${base}flags/de.svg`,
    `${base}flags/fr.svg`,
    `${base}flags/in.svg`,
    `${base}flags/pk.svg`
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use catch for individual items so one missing optional asset doesn't fail install
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[PWA SW] Precache warning for ${url}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip Firebase/Firestore/Google API calls to avoid intercepting external auth/database
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First, fallback to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const base = getBaseScope();
          const fallback = await caches.match(base);
          if (fallback) return fallback;
          return new Response('অফলাইন মোড - সংযোগ বিচ্ছিন্ন', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, images, fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

