// Read To Me — offline support. Pages: network first. Helper libraries & fonts: cache first.
const CACHE = 'rtm-v1';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  const url = new URL(req.url);
  const lib = /(cdn\.jsdelivr\.net|unpkg\.com|tessdata|fonts\.gstatic\.com|fonts\.googleapis\.com)/.test(url.host + url.pathname);
  if(url.origin === location.origin){
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else if(lib){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if(r.ok || r.type === 'opaque'){ const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); } return r; })));
  }
});
