const CACHE_NAME = 'mhstock-v1';
// Déterminer le base path depuis l'URL du service worker
const getBasePath = () => {
  const swUrl = self.location.pathname;
  // sw.js est à la racine du base path, donc on enlève 'sw.js'
  return swUrl.replace('/sw.js', '');
};

const basePath = getBasePath();
const urlsToCache = [
  basePath + '/',
  basePath + '/index.html',
  basePath + '/favicon.svg',
  basePath + '/favicon.ico',
  basePath + '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse du cache si disponible, sinon faire une requête réseau
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Vérifier si la réponse est valide
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cloner la réponse
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // En cas d'erreur, retourner une page hors ligne si c'est une navigation
        if (event.request.mode === 'navigate') {
          return caches.match(basePath + '/index.html');
        }
      })
  );
});

