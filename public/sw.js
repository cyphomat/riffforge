// Die App laeuft komplett im Browser: kein Server, keine API, der Uebungs-Log
// liegt in localStorage. Sie kann also vollstaendig offline laufen — sobald
// die Huelle einmal im Cache liegt, braucht eine Session kein Netz mehr.
const CACHE = 'mga-2026-10-14.1'

// Nur stabile URLs. Die JS-Chunks von Next tragen Hashes im Namen und koennen
// hier nicht stehen — die kommen beim ersten Online-Besuch ueber den
// Laufzeit-Cache dazu.
const SHELL = [
  './',
  'session/',
  'drills/',
  'wissen/',
  'daten/',
  'manifest.json',
  'worklets/onset-processor.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Einzeln statt addAll: eine fehlende Datei darf nicht die ganze
      // Installation scheitern lassen.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== location.origin) return

  // Der Bau-Stempel darf nie aus dem Cache kommen: er ist die Auskunft
  // darueber, ob der Cache veraltet ist. Aus dem Cache beantwortet wuerde er
  // jede Fassung fuer aktuell erklaeren.
  if (url.pathname.endsWith('/version.json')) return

  // Netz zuerst, damit ein Deploy sofort ankommt. 'no-cache' erzwingt die
  // Rueckfrage beim Server: sonst beantwortet der HTTP-Cache des Browsers die
  // Anfrage selbst und die zehn Minuten Cache-Lebensdauer von GitHub Pages
  // verzoegern jedes Update.
  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached
          // Unbekannte Seite ohne Netz: die Startseite ist besser als der
          // Dinosaurier.
          if (request.mode === 'navigate') return caches.match('./')
          return Response.error()
        }),
      ),
  )
})
