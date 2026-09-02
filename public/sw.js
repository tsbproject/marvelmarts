const CACHE_VERSION = "marvelmarts-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;

const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
];

/**
 * Install
 *
 * Pre-cache only safe, public resources.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );

  self.skipWaiting();
});

/**
 * Activate
 *
 * Remove caches belonging to older service-worker versions.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("marvelmarts-") &&
                cacheName !== STATIC_CACHE &&
                cacheName !== OFFLINE_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch
 *
 * Conservative caching strategy:
 *
 * 1. API requests are ALWAYS network-only.
 * 2. Auth/account/payment/private routes are ALWAYS network-only.
 * 3. Next.js static assets use cache-first.
 * 4. Public static assets use cache-first.
 * 5. Page navigations use network-first with /offline fallback.
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  const pathname = url.pathname;

  /*
   * Never cache API requests.
   *
   * This protects authentication, customer data,
   * orders, payments, wallets, vendor data, etc.
   */
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/account/") ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/payment/") ||
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/wallet/") ||
    pathname.startsWith("/vendor/")
  ) {
    return;
  }

  /*
   * Cache Next.js immutable static assets.
   */
  if (pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);

        if (cached) {
          return cached;
        }

        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put(request, response.clone());
          }

          return response;
        } catch {
          return Response.error();
        }
      })
    );

    return;
  }

  /*
   * Cache safe public assets.
   */
  if (
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/images/") ||
    pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/i)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);

        if (cached) {
          return cached;
        }

        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put(request, response.clone());
          }

          return response;
        } catch {
          return Response.error();
        }
      })
    );

    return;
  }

  /*
   * Page navigation:
   *
   * Always prefer the live application.
   * If the network is unavailable, show the offline page.
   */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        return cache.match(OFFLINE_URL);
      })
    );
  }
});