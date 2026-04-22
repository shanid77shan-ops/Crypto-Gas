// Bump version whenever you need to force-evict all cached assets
const CACHE   = 'cryptogas-v3'
const STATIC  = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
]

// Install: pre-cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())   // take over immediately
  )
})

// Activate: delete every cache that isn't the current version
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// Routes that must NEVER be served from cache
const NETWORK_ONLY = [
  'alchemy.com',
  'li.quest',
  'cryptocompare.com',
  'tronweb.org',
  'trongrid.io',
  'supabase.co',
  'changenow.io',   // safety net — proxy should handle this, but skip cache if hit directly
  '/api/',          // our own Vercel serverless proxy routes
]

self.addEventListener('fetch', e => {
  const url = e.request.url

  // Network-only for all live data
  if (NETWORK_ONLY.some(p => url.includes(p))) {
    e.respondWith(
      fetch(e.request).catch(
        () => new Response(JSON.stringify({ error: 'Network unavailable' }), {
          status : 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    return
  }

  // Stale-while-revalidate for app shell + static assets
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request)

      const networkFetch = fetch(e.request)
        .then(res => {
          if (res && res.ok) cache.put(e.request, res.clone())
          return res
        })
        .catch(() => null)

      // Return cached immediately; if nothing cached, wait for network
      if (cached) {
        networkFetch.catch(() => {}) // background refresh — ignore errors
        return cached
      }

      const fresh = await networkFetch
      return fresh ?? new Response('Offline', { status: 503 })
    })
  )
})
