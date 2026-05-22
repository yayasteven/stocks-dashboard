// 個股追蹤 PWA Service Worker
const CACHE_NAME = 'stocks-dashboard-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // GitHub API、FinMind API 等動態資料一律不快取，由瀏覽器直接打
  if (url.includes('api.github.com') ||
      url.includes('api.finmindtrade.com') ||
      url.includes('gist.githubusercontent.com')) {
    return;
  }
  // 靜態資源：cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      // 動態加入快取
      if (resp.ok && e.request.method === 'GET') {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, respClone));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
