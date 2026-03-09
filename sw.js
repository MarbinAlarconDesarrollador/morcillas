const STATIC_CACHE = 'static-v7'; // Incrementamos versión
const DYNAMIC_CACHE = 'dynamic-v7';

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

// 1. Instalación
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// 2. Activación
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

// 3. Fetch (Estrategia corregida)
self.addEventListener('fetch', event => {
    // A. EXCLUSIONES: No intentar cachear videos, mapas o peticiones parciales
    if (
        event.request.url.includes('google') || 
        event.request.url.includes('maps') || 
        event.request.headers.has('range') || // <--- ESTO EVITA EL ERROR 206
        event.request.url.includes('.mp4')    // <--- EVITA CACHEAR VIDEOS PESADOS
    ) {
        return; // Deja que el navegador lo maneje por internet normal
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;

            return fetch(event.request).then(networkResponse => {
                // Solo guardamos en caché dinámica si la respuesta es válida (Status 200)
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                return caches.open(DYNAMIC_CACHE).then(cache => {
                    if (event.request.method === 'GET') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            }).catch(() => {
                // Fallback offline para navegación HTML
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});