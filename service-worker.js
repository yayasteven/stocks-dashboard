// v15 kill switch: 新 SW 啟動後立即 unregister 自己 + 清光所有快取 + 強制 reload 控制中的頁面
// 目的：清除卡住的舊 SW 緩存，讓使用者看到最新版本

self.addEventListener('install', () => {
  self.skipWaiting(); // 立即接管，不等舊 SW 退場
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // 1. 清光所有 cache
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // 2. unregister 自己
    await self.registration.unregister();
    // 3. 強制 reload 所有正在用此 SW 的頁面
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => {
      try { c.navigate(c.url); } catch {}
    });
  })());
});

// fetch 事件直接 passthrough，不快取任何東西
self.addEventListener('fetch', () => {});
