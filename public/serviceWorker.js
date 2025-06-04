/**
 * SERVICE WORKER - OFFLINE CDN RESOURCE CACHING
 * 
 * PROBLEM SOLVED:
 * When developing on mobile/unreliable connections, the system may report as 
 * "connected" but lack actual internet access. This causes external CDN resources
 * (CodeMirror, SQL formatter) to fail loading, breaking the SQL lab application.
 * 
 * SOLUTION STRATEGY:
 * Implements a cache-first approach for specific external dependencies:
 * 1. Cache critical CDN resources on first successful load
 * 2. Serve from cache on subsequent requests (works offline)
 * 3. Fall back to network only if cache miss occurs
 * 4. Handle network failures gracefully without breaking the app
 * 
 * CACHE LIFECYCLE:
 * - INSTALL: Download and cache all external resources on service worker installation
 * - ACTIVATE: Clean up old cache versions, take control of existing pages
 * - FETCH: Intercept requests for cached resources, serve from cache or network
 * 
 * RESOURCES MANAGED:
 * - CodeMirror core library (CSS + JS)
 * - CodeMirror SQL syntax highlighting mode
 * - CodeMirror placeholder addon
 * - SQL formatter library
 * 
 * CACHE UPDATE STRATEGY:
 * - Change CACHE_NAME version to force cache refresh
 * - Old caches automatically deleted on activation
 * - Service worker updates when file changes detected
 * 
 * DEPLOYMENT:
 * - Must be served from web root (same origin as main app)
 * - Requires HTTPS in production (localhost exempt)
 * - Register via navigator.serviceWorker.register('/service-worker.js')
 * 
 * DEBUGGING:
 * - Chrome DevTools → Application → Service Workers
 * - Check Cache Storage for cached resources
 * - Console logs show cache hits/misses and network activity
 */


const EXTERNAL_RESOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/sql/sql.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/display/placeholder.min.js',
    'https://unpkg.com/sql-formatter@15.6.2/dist/sql-formatter.min.js'
];

/**
 * CACHE VERSION - Update when external dependencies change
 * 
 * Increment version (v1 → v2) when:
 * - Updating CodeMirror/SQL formatter library versions
 * - Adding/removing external CDN resources
 * - Troubleshooting cache corruption issues
 * 
 * Changing version forces fresh download of all cached resources
 * and automatic cleanup of old cache on next page load.
 */
const CACHE_NAME = 'sqlab-cache-v1';

// Install event - cache external resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching external resources...');
                return cache.addAll(EXTERNAL_RESOURCES);
            })
            .then(() => {
                console.log('Service Worker: All external resources cached');
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache resources:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // Only handle external resources we care about
    if (EXTERNAL_RESOURCES.includes(url)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('Service Worker: Serving from cache:', url);
                        return response;
                    }
                    
                    // Not in cache, try to fetch from network
                    console.log('Service Worker: Fetching from network:', url);
                    return fetch(event.request)
                        .then(response => {
                            // Cache the response for future use
                            if (response.ok) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, responseClone));
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error('Service Worker: Network fetch failed:', error);
                            // Return a basic error response or empty response
                            return new Response('Resource unavailable offline', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
    }
    // For all other requests, let them go through normally
});