const CACHE   = 'cryptogas-v1'
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
      .then(() => self.skipWaiting())
  )
})

// Activate: purge old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch strategy:
//   - API / RPC calls → network-only (always fresh prices)
//   - Everything else → stale-while-revalidate (fast load + background refresh)
const API_PATTERNS = [
  'alchemy.com',
  'li.quest',
  'cryptocompare.com',
  'tronweb.org',
  'trongrid.io',
  'supabase.co',
]

self.addEventListener('fetch', e => {
  const url = e.request.url

  // Always hit the network for live API data
  if (API_PATTERNS.some(p => url.includes(p))) {
    e.respondWith(fetch(e.request))
    return
  }

  // Stale-while-revalidate for app shell + assets
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request)
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok) cache.put(e.request, res.clone())
        return res
      }).catch(() => null)

      return cached ?? await networkFetch
    })
  )
})
