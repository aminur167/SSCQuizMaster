// SSCQuizMaster Service Worker
// Version: 2.0.0
const CACHE_NAME = 'ssc-quizmaster-v2.0.0';
const STATIC_CACHE = 'static-cache-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v2';

// Assets to cache during installation
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/js/main.js',
  '/js/admin.js',
  '/js/data/subjects.js',
  '/js/data/science/physicsQuestions.js',
  '/js/data/science/chemistryQuestions.js',
  '/js/data/science/biologyQuestions.js',
  '/js/data/science/mathQuestions.js',
  '/js/data/arts/historyQuestions.js',
  '/js/data/arts/geographyQuestions.js',
  '/js/data/arts/scienceQuestions.js',
  '/js/data/arts/civicsQuestions.js',
  '/js/data/general/banglaQuestions.js',
  '/js/data/general/agricultureQuestions.js',
  '/js/data/general/ictQuestions.js',
  '/js/data/general/islamQuestions.js',
  '/manifest.json'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
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
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

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

            // Add to dynamic cache for API calls and other dynamic content
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
            
            // For CSS and JS files, try to serve from static cache
            if (event.request.url.match(/\.(css|js)$/)) {
              return caches.match(event.request);
            }
            
            // Return offline page for other requests
            return new Response(`
              <!DOCTYPE html>
              <html lang="bn">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>অফলাইন - SSCQuizMaster</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; 
                    text-align: center; 
                    padding: 50px 20px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                  }
                  .offline-container {
                    background: rgba(255,255,255,0.95);
                    color: #333;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    max-width: 400px;
                  }
                  h1 { color: #e74c3c; margin-bottom: 20px; }
                  p { margin-bottom: 20px; line-height: 1.6; }
                  .icon { font-size: 4rem; margin-bottom: 20px; }
                </style>
              </head>
              <body>
                <div class="offline-container">
                  <div class="icon">📶</div>
                  <h1>ইন্টারনেট সংযোগ নেই</h1>
                  <p>আপনার ইন্টারনেট সংযোগ চেক করুন এবং পৃষ্ঠাটি রিফ্রেশ করুন।</p>
                  <p>অফলাইন মোডে শুধুমাত্র ক্যাশে করা কন্টেন্ট দেখানো হবে।</p>
                  <button onclick="window.location.reload()">রিফ্রেশ করুন</button>
                </div>
              </body>
              </html>
            `, {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/html'
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

// Sync quiz data when back online
function syncQuizData() {
  // This function can be used to sync quiz progress or results when back online
  console.log('Service Worker: Syncing quiz data...');
  
  // Get any pending quiz results from IndexedDB or localStorage
  return getPendingQuizResults()
    .then((pendingResults) => {
      if (pendingResults && pendingResults.length > 0) {
        return sendPendingResultsToServer(pendingResults);
      }
      return Promise.resolve();
    })
    .then(() => {
      console.log('Service Worker: Quiz data synced successfully');
    })
    .catch((error) => {
      console.error('Service Worker: Quiz data sync failed', error);
    });
}

// Get pending quiz results (placeholder function)
function getPendingQuizResults() {
  // In a real app, you would get this from IndexedDB or localStorage
  return Promise.resolve([]);
}

// Send pending results to server (placeholder function)
function sendPendingResultsToServer(results) {
  // In a real app, you would send this to your backend
  console.log('Service Worker: Sending pending results to server', results);
  return Promise.resolve();
}

// Push Notification Event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (!event.data) return;
  
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    data = {
      title: 'SSCQuizMaster',
      body: event.data.text() || 'নতুন আপডেট উপলব্ধ!'
    };
  }
  
  const options = {
    body: data.body || 'SSCQuizMaster থেকে নতুন নোটিফিকেশন',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
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
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    })
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
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    });
  }
});

// Cache quiz data dynamically
function cacheQuizData(quizData) {
  return caches.open(DYNAMIC_CACHE)
    .then((cache) => {
      // Store quiz data in cache
      const blob = new Blob([JSON.stringify(quizData)], { type: 'application/json' });
      const response = new Response(blob);
      return cache.put('/api/quiz-data', response);
    })
    .then(() => {
      console.log('Service Worker: Quiz data cached successfully');
    })
    .catch((error) => {
      console.error('Service Worker: Failed to cache quiz data', error);
    });
}

// Get cache status
function getCacheStatus() {
  return caches.open(CACHE_NAME)
    .then(cache => cache.keys())
    .then(requests => {
      return {
        totalCached: requests.length,
        cacheName: CACHE_NAME,
        timestamp: Date.now()
      };
    });
}

// Periodic cache cleanup (every 7 days)
function cleanupOldCache() {
  caches.open(DYNAMIC_CACHE)
    .then((cache) => {
      return cache.keys().then((requests) => {
        const cleanupPromises = requests.map((request) => {
          // Remove dynamic cache entries older than 7 days
          // This is a simplified version - in production you'd track cache age
          return cache.delete(request);
        });
        return Promise.all(cleanupPromises);
      });
    })
    .then(() => {
      console.log('Service Worker: Dynamic cache cleanup completed');
    })
    .catch((error) => {
      console.error('Service Worker: Cache cleanup failed', error);
    });
}

// Run cleanup once a week (commented out for now)
// setInterval(cleanupOldCache, 7 * 24 * 60 * 60 * 1000);

// Network status monitoring
function updateOnlineStatus() {
  console.log('Service Worker: Network status -', navigator.onLine ? 'online' : 'offline');
}

self.addEventListener('online', updateOnlineStatus);
self.addEventListener('offline', updateOnlineStatus);

console.log('Service Worker: Loaded successfully - Version 2.0.0');