
const VERSION = "v25-202511081350";
const CACHE = "safety-pwa-" + VERSION;
const ASSETS = [
  "./", "./index.html", "./assets/styles.css", "./app.js", "./data/reagents.json", "./manifest.webmanifest"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("safety-pwa-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
// Allow client to trigger skipWaiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;
    try { return await fetch(e.request); }
    catch { return caches.match("./index.html"); }
  })());
});
