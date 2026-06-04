// Service Worker for offline caching
const CACHE_NAME = 'serialfac-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Network first, fall back to cache
  if (event.request.url.includes('/api/')) return // Don't cache API calls
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
