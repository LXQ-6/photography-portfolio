/* 拾光影集 Service Worker
   策略：网络优先且绕过 HTTP 缓存（保证更新即时可见），离线时回退到缓存 */
const CACHE = "shiguang-cache-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // 只处理同源资源

  e.respondWith(
    // cache:"reload" 绕过 HTTP 缓存直取网络，避免"缓存套缓存"导致更新延迟
    fetch(req, { cache: "reload" })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
