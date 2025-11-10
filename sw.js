
const VERSION = "v67-202511092130";
const CACHE = "safety-pwa-" + VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./assets/styles.css",
  "./app.js",
  "./data-loader.js",
  "./data/reagents.json",
  "./manifest.webmanifest",
  // Modular database files
  "./data/modular/index.json",
  "./data/modular/reagents.json",
  "./data/modular/substances.json",
  "./data/modular/id_guide.json",
  "./data/modular/methods.json",
  "./data/modular/vendors.json",
  "./data/modular/first_responder.json",
  "./data/modular/counterfeit_pills.json",
  "./data/modular/medical_treatment.json",
  "./data/modular/myths.json",
  "./data/modular/config.json"
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
