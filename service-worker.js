const CACHE_NAME = 'ssc-quizmaster-v2.0.0';
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
  '/js/data/general/islamQuestions.js'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});