// SSCQuizMaster Service Worker
// Version: 1.0.0
// Cache Name with versioning
const CACHE_NAME = 'ssc-quizmaster-v1.0.0';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Assets to cache during installation
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles/style.css',
    '/js/main.js',
    '/js/admin.js',
    '/js/data/subjects.js',
    '/manifest.json',
    // Science subjects
    '/js/data/science/physicsQuestions.js',
    '/js/data/science/chemistryQuestions.js',
    '/js/data/science/biologyQuestions.js',
    '/js/data/science/mathQuestions.js',
    // Arts subjects
    '/js/data/arts/historyQuestions.js',
    '/js/data/arts/geographyQuestions.js',
    '/js/data/arts/scienceQuestions.js',
    '/js/data/arts/civicsQuestions.js',
    // General subjects
    '/js/data/general/banglaQuestions.js',
    '/js/data/general/agricultureQuestions.js',
    '/js/data/general/ictQuestions.js',
    '/js/data/general/islamQuestions.js'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Installation completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME && cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
        .then(() => {
            console.log('Service Worker: Cleanup completed');
            return self.clients.claim();
        })
    );
});

// Fetch Event - Serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Handle different types of requests
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((fetchResponse) => {
                        // Check if we received a valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Clone the response
                        const responseToCache = fetchResponse.clone();

                        // Add to dynamic cache
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch((error) => {
                        console.log('Service Worker: Fetch failed, serving offline page', error);
                        
                        // If it's an HTML request and we're offline, serve the cached index.html
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // For CSS and JS files, try to serve from cache
                        if (event.request.url.match(/\.(css|js)$/)) {
                            return caches.match(event.request);
                        }
                        
                        return new Response('You are offline. Please check your internet connection.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background Sync for offline quiz data
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'quiz-sync') {
        event.waitUntil(
            syncQuizData()
        );
    }
});

// Sync quiz data when online
function syncQuizData() {
    // This function can be used to sync quiz progress or results when back online
    console.log('Service Worker: Syncing quiz data...');
    return Promise.resolve();
}

// Push Notification Event
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'SSCQuizMaster থেকে নতুন নোটিফিকেশন',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'অ্যাপ ওপেন করুন'
            },
            {
                action: 'close',
                title: 'বন্ধ করুন'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'SSCQuizMaster', options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url === self.location.origin && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url || '/');
                }
            })
    );
});

// Message Event - Communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_QUIZ_DATA') {
        cacheQuizData(event.data.payload);
    }
});

// Cache quiz data dynamically
function cacheQuizData(quizData) {
    caches.open(DYNAMIC_CACHE)
        .then((cache) => {
            // Store quiz data in cache
            const blob = new Blob([JSON.stringify(quizData)], { type: 'application/json' });
            const response = new Response(blob);
            cache.put('/api/quiz-data', response);
        })
        .then(() => {
            console.log('Service Worker: Quiz data cached successfully');
        })
        .catch((error) => {
            console.error('Service Worker: Failed to cache quiz data', error);
        });
}

// Periodic cache cleanup
function cleanupOldCache() {
    caches.open(DYNAMIC_CACHE)
        .then((cache) => {
            cache.keys().then((requests) => {
                requests.forEach((request) => {
                    // Remove old dynamic cache entries (older than 7 days)
                    // This is a simplified version - in production you'd track cache age
                    cache.delete(request);
                });
            });
        });
}

// Run cleanup once a week
setInterval(cleanupOldCache, 7 * 24 * 60 * 60 * 1000);

console.log('Service Worker: Loaded successfully');