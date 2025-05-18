const CACHE_NAME = 'church-app-v5';
const HYMN_CACHE_NAME = 'church-hymns-v1';
const BIBLE_CACHE_NAME = 'church-bible-v1';
const IMAGES_CACHE_NAME = 'church-images-v1';

// Only these routes should not be available offline
const NETWORK_ONLY_ROUTES = [
  '/online',
  '/live'
];

// Cache-first routes
const CACHE_FIRST_ROUTES = [
  '/',
  '/hymns',
  new RegExp('/hymn/\\d+'),
  '/bible',
  new RegExp('/api/verse.*')
];

// Specific images to cache with their fallbacks
const CRITICAL_IMAGES = {
  '/pictures/banner1.jpg': '/pictures/banner1.jpg',
  '/pictures/banner2.jpg': '/pictures/banner2.jpg',
  '/pictures/community1.jpg': '/pictures/community1.jpg',
  '/pictures/community2.jpg': '/pictures/community2.jpg',
  '/pictures/community3.jpg': '/pictures/community3.jpg',
  '/pictures/image1.jpg': '/pictures/image1.jpg',
  '/pictures/image2.jpg': '/pictures/image2.jpg',
  '/pictures/image3.jpg': '/pictures/image3.jpg',
  '/pictures/image4.jpg': '/pictures/image4.jpg',
  '/pictures/image5.jpg': '/pictures/image5.jpg',
  '/pictures/image6.jpg': '/pictures/image6.jpg',
  '/pictures/image7.jpg': '/pictures/image7.jpg',
  '/pictures/image8.jpg': '/pictures/image8.jpg',
  '/pictures/image9.jpg': '/pictures/image9.jpg',
  '/logo.png': '/logo.png'
};

// Image extensions to cache
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.PNG'];

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/hymns.ts',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
  ...Object.values(CRITICAL_IMAGES)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
      caches.open(HYMN_CACHE_NAME),
      caches.open(BIBLE_CACHE_NAME),
      caches.open(IMAGES_CACHE_NAME)
    ])
  );
});

// Helper function to check if URL is an image
const isImageUrl = (url) => {
  return IMAGE_EXTENSIONS.some(ext => url.toLowerCase().endsWith(ext.toLowerCase())) || 
         url.includes('/pictures/') ||
         url.includes('/images/') ||
         url.includes('/icons/');
};

// Helper function to check if a URL matches any regex pattern
const matchesPattern = (url, patterns) => {
  return patterns.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }
    return url.includes(pattern);
  });
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-only routes
  if (matchesPattern(url.pathname, NETWORK_ONLY_ROUTES)) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html')
            .then(response => response || new Response('Offline page not found', {
              status: 404,
              statusText: 'Not Found'
            }));
        })
    );
    return;
  }

  // Handle critical images (Cache First with specific fallbacks)
  if (isImageUrl(url.toString())) {
    const imagePath = url.pathname;
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }
              const responseToCache = networkResponse.clone();
              caches.open(IMAGES_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              return networkResponse;
            })
            .catch(() => {
              // Try to find a matching fallback image
              const fallbackPath = Object.entries(CRITICAL_IMAGES)
                .find(([key]) => imagePath.includes(key))?.[1];
              
              return fallbackPath 
                ? caches.match(fallbackPath)
                : caches.match('/logo.png');
            });
        })
    );
    return;
  }

  // Handle hymns and Bible routes (Cache First)
  if (matchesPattern(url.pathname, CACHE_FIRST_ROUTES)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              const responseToCache = networkResponse.clone();
              const cacheName = url.pathname.includes('hymn') 
                ? HYMN_CACHE_NAME 
                : BIBLE_CACHE_NAME;
              caches.open(cacheName)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              return networkResponse;
            })
            .catch(() => {
              return new Response(JSON.stringify({
                message: 'This content is not available offline. Please check your connection.'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Network First with Cache Fallback for all other routes
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Return the offline page if we can't get from cache
        return caches.match('/offline.html');
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, HYMN_CACHE_NAME, BIBLE_CACHE_NAME, IMAGES_CACHE_NAME].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
