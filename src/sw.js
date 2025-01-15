const CACHE_NAME = 'tac-nbc-v2';
const HYMN_CACHE = 'tac-nbc-hymns';
const GALLERY_CACHE = 'tac-nbc-gallery';

// Separate cache lists
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(HYMN_CACHE),
      caches.open(GALLERY_CACHE)
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache-first strategy for hymns and gallery
  if (url.pathname.includes('/hymns') || url.pathname.includes('/gallery')) {
    const cacheName = url.pathname.includes('/hymns') ? HYMN_CACHE : GALLERY_CACHE;
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => cachedResponse || fetch(event.request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(cacheName)
              .then(cache => cache.put(event.request, responseClone));
            return response;
          })
        )
    );
    return;
  }

  // Network-first strategy for other content
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && 
                          name !== HYMN_CACHE && 
                          name !== GALLERY_CACHE)
            .map(name => caches.delete(name))
        );
      })
    ])
  );
}); 