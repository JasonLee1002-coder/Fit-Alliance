// Fit Alliance Service Worker
const CACHE_NAME = 'fit-alliance-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Network-first strategy — always fresh data, fallback to cache
self.addEventListener('fetch', (event) => {
  // Only cache GET requests for static assets
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  const isStatic = url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/)
  if (!isStatic) return

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return res
      })
      .catch(() => caches.match(event.request))
  )
})
