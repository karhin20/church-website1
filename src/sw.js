const CACHE_NAME = 'tac-nbc-v2';
const HYMN_CACHE = 'tac-nbc-hymns';
const IMAGE_CACHE = 'tac-nbc-images';

// Separate cache lists
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// List of image extensions to cache
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(HYMN_CACHE),
      caches.open(IMAGE_CACHE)
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if the request is for an image
  const isImage = IMAGE_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext));
  
  if (isImage) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE)
                .then(cache => cache.put(event.request, responseClone));
              return response;
            });
        })
    );
    return;
  }

  // Handle hymns with cache-first strategy
  if (url.pathname.includes('/hymns')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => cachedResponse || fetch(event.request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(HYMN_CACHE)
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
                          name !== IMAGE_CACHE)
            .map(name => caches.delete(name))
        );
      })
    ])
  );
}); 