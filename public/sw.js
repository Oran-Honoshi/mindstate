const CACHE = "app-v3";
const STAGE_CACHE = "mindstate-stages-v1";
const STAGE_INDEX_KEY = "__stage_index__";
const MAX_STAGES = 3;

const STATIC = [
  "/",
  "/games",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.json",
];

function isStageRequest(url) {
  return url.pathname.startsWith("/games/") && url.searchParams.has("stage");
}

async function cacheStage(request, response) {
  const cache = await caches.open(STAGE_CACHE);

  // Read current index
  const indexRes = await cache.match(STAGE_INDEX_KEY);
  const index = indexRes ? await indexRes.json() : [];

  const key = request.url;
  if (!index.includes(key)) {
    // Evict oldest if at capacity
    if (index.length >= MAX_STAGES) {
      const evicted = index.shift();
      await cache.delete(evicted);
    }
    index.push(key);
  }

  // Store the response and updated index
  await cache.put(request, response.clone());
  await cache.put(STAGE_INDEX_KEY, new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  }));
}

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE && k !== STAGE_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/auth") || url.pathname.startsWith("/api/")) return;
  if (e.request.url.includes("supabase.co")) return;

  const stageRequest = isStageRequest(url);

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          if (stageRequest) {
            cacheStage(e.request, res.clone());
          } else {
            caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
          }
        }
        return res;
      })
      .catch(async () => {
        // For stage requests try the stage cache first, then general cache, then offline
        if (stageRequest) {
          const stageCache = await caches.open(STAGE_CACHE);
          const staged = await stageCache.match(e.request);
          if (staged) return staged;
        }
        const cached = await caches.match(e.request);
        if (cached) return cached;
        return caches.match("/offline");
      })
  );
});
