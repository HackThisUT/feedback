/* Wochenreflexion Schulalltag – Service Worker
 * Cache-first for the app shell, network-first for everything else,
 * offline fallback to the cached index.html. Bump CACHE_VERSION to invalidate.
 */
'use strict';

const CACHE_VERSION  = 'wr-v1';
const SHELL_CACHE    = `wr-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE  = `wr-runtime-${CACHE_VERSION}`;

// App shell – everything needed to render the PWA offline.
// Paths are RELATIVE so this works under any GitHub Pages subpath (e.g. /repo/).
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon-180.png',
  './icons/apple-touch-icon-167.png',
  './icons/apple-touch-icon-152.png',
  './icons/splash-1206x2622.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k.startsWith('wr-shell-') || k.startsWith('wr-runtime-'))
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Same-origin only: skip third-party beacons (e.g. Cloudflare analytics)
  // so analytics don't get cached and offline doesn't break on them.
  if (url.origin !== self.location.origin) return;

  // Cache-first for the app shell (navigations + core assets).
  if (req.mode === 'navigate' || APP_SHELL.includes(url.pathname.replace(self.location.pathname.replace(/\/$/, ''), './')) || APP_SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')))) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')));
      })
    );
    return;
  }

  // Network-first for everything else, with cache fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
