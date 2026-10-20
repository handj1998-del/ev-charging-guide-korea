// Bump VERSION on every deploy so clients pick up the new files.
const VERSION = 'ev-v5';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isNav = req.mode === 'navigate';
  e.respondWith(
    caches.open(VERSION).then(c =>
      c.match(isNav ? './index.html' : req, { ignoreSearch: isNav }).then(hit => hit || fetch(req).then(res => {
        if (res.ok && !isNav) c.put(req, res.clone());
        return res;
      }).catch(() => isNav ? c.match('./index.html') : Response.error()))
    )
  );
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
