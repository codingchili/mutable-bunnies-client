/*
 * Service worker.
 *
 * - prefer network.
 * - fallback on fail.
 */
const CACHE_NAME = 'bunny-cache-v1';
const urlsToCache = ['/', './index.html'];
const OFFLINE_LATCH_COUNT = 1;

let last = 0;
let offline = false;

console.log('using service worker cache ' + CACHE_NAME);

/**
 * @returns {boolean} true if a request has failed in the last 2s.
 */
function backoff() {
    return last > (performance.now() - 2000);
}

self.addEventListener('install', (event) => {
    // remove all old caches, because reasons.
    for (let i = 0; i < 128; i++) {
        caches.delete(`bunny-cache-v${i}`);
    }

    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('service worker activated on ' + CACHE_NAME);
});

self.addEventListener('message', (event) => {
    console.log("service worker query: " + event.data);
    event.ports[0].postMessage({offline: offline});
});

self.addEventListener('fetch', (event) => {

    if (event.request.method !== "GET" || event.request.headers.has('range')) {
        return false;
    }

    event.respondWith(
        caches.open(CACHE_NAME)
            .then(cache => {
                return fetch(event.request)
                    .then(response => {
                        let clone = response.clone();

                        cache.match(event.request)
                            .then(() => {
                                cache.put(event.request, clone);
                            });
                        offline = false;
                        return response;
                    })
                    .catch(() => {
                        last = performance.now()
                        offline = true;
                        return caches.match(event.request);
                    });
            })
    );
});