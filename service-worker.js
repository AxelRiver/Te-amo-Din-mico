const CACHE_NAME = 'te-amo-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Como CSS y JS están inline, no necesitamos cachearlos por separado
  // Cacheamos la canción y efectos de sonido para offline
  'https://www.fesliyanstudios.com/royalty-free-music/download/love-spell/364',
  'https://www.freesound.org/data/previews/265/265115_4373976-lq.mp3',
  // mo.js desde CDN – intentamos cachear si se llega a solicitar
  'https://cdn.jsdelivr.net/mojs/latest/mo.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve del cache si existe
        if (response) return response;

        // Si no, intenta fetch y cachea la respuesta para la próxima
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));

          return networkResponse;
        }).catch(() => {
          // Si falla la red y no hay cache → podrías mostrar una página offline custom
          // Por ahora devolvemos lo que haya
          return caches.match('/');
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});