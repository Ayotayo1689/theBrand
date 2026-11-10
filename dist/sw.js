const V = "tb-v11";
const PRE = ["./19915.jpg","./19915.webp","./20945431.jpg","./20945431.webp","./3753717.jpg","./3753717.webp","./5124556.jpg","./5124556.webp","./app.js","./burtech.png","./burtech.webp","./bwink_msc_07_single_01.jpg","./bwink_msc_07_single_01.webp","./bwink_ppl_11_single_04.jpg","./bwink_ppl_11_single_04.webp","./cinema-camera.svg","./contact-message.svg","./contact.html","./every_travel.png","./every_travel.webp","./favicon.svg","./game-art.svg","./games-core.js","./games.css","./games.html","./games.js","./index.html","./paper_airplane_send_with_dotted_lines_flat_style.jpg","./paper_airplane_send_with_dotted_lines_flat_style.webp","./playground.svg","./scene-motion.js","./scenes.css","./social-preview.png","./software.css","./software.html","./studio-build.svg","./studio.html","./styles.css","./sw.js","./tanta.png","./tanta.webp","./tape.svg","./team-cards.mjs","./team-data.mjs","./team-placeholder.svg","./team.css","./team.html","./team.js","./vyc.png","./vyc.webp","./work.html"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(PRE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // let CDN/external requests pass
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(V).then(cache => cache.put(e.request, c)); }
    return res;
  })));
});