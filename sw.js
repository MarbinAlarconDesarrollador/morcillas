const CACHE_NAME = 'delicias-cache-v3'; // Incrementamos la versión
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';

const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 1. Instalación: Cacheamos el "esqueleto" de la App
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // Fuerza la activación inmediata
    );
});

// 2. Activación: Limpiamos cachés antiguas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// 3. Fetch: Estrategia "Cache First" con fallback a Red
self.addEventListener('fetch', event => {
    // Ignorar peticiones de Google Maps (ya que no se pueden cachear fácilmente)
    if (event.request.url.includes('googleusercontent') || event.request.url.includes('google.com/maps')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Si está en caché, lo devolvemos inmediatamente
            if (response) return response;

            // Si no está, lo buscamos en internet y lo guardamos en la caché dinámica
            return fetch(event.request).then(networkResponse => {
                return caches.open(DYNAMIC_CACHE).then(cache => {
                    // Solo cacheamos si la petición es exitosa
                    if (event.request.method === 'GET') {
                        cache.put(event.request.url, networkResponse.clone());
                    }
                    return networkResponse;
                });
            }).catch(() => {
                // Si falla internet y no hay caché, podrías mostrar una página de error offline
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});