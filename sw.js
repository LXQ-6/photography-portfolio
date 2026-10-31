/* 拾光影集 Service Worker v3
   策略分级：
   - 页面与数据文件（HTML / data.js / photos-data.js）：网络直取（绕过 HTTP 缓存），
     保证管理页保存后即时可见；断网时回退缓存
   - 图片、字体、图标与带版本号的 css/js（内容变更必然更换 URL）：缓存优先 + 后台静默更新。
     图片文件名唯一、内容永不改变，长期缓存绝对安全——
     二次访问与后台切回时瞬间出图，网络仅在后台刷新副本 */
const CACHE = "shiguang-cache-v3";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // 只处理同源资源

  const path = url.pathname;
  const isVolatile = path.endsWith("/") || path.endsWith(".html") ||
    /\/(data|photos-data)\.js$/.test(path);

  if (isVolatile) {
    // 页面与数据：网络直取，失败回退缓存（离线兜底）
    e.respondWith(
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
    return;
  }

  // 静态资源：缓存优先（瞬间响应），同时后台请求网络刷新副本（stale-while-revalidate）
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
