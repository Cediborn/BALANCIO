const CACHE = 'balancio-v1'

// sw.js is served at the deployment base (e.g. /BALANCIO/sw.js), so derive the
// app root from the script URL instead of assuming "/".
const BASE = self.location.pathname.replace(/sw\.js$/, '')
const CORE = ['index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png', 'icon.svg'].map(
  (file) => `${BASE}${file}`,
)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  const isNavigation =
    req.destination === 'document' ||
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html')

  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
          return res
        })
        .catch(() =>
          caches.match(req).then((hit) => (hit ? hit : caches.match(`${BASE}index.html`))),
        ),
    )
    return
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(req, copy))
          }
          return res
        }),
    ),
  )
})