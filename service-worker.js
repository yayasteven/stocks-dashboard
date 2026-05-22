// 個股追蹤 PWA Service Worker
// v2: 改為網路優先（network-first），確保更新即時可見
const CACHE_NAME = 'stocks-dashboard-v2';
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
  // 動態 API 直接讓瀏覽器處理，不快取
  if (url.includes('api.github.com') ||
      url.includes('api.finmindtrade.com') ||
      url.includes('gist.githubusercontent.com')) {
    return;
  }
  // 網路優先：每次先試網路，網路失敗才用快取
  e.respondWith(
    fetch(e.request).then(resp => {
      if (resp.ok && e.request.method === 'GET') {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, respClone));
      }
      return resp;
    }).catch(() =>
      caches.match(e.request).then(r => r || caches.match('./index.html'))
    )
  );
});
