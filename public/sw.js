self.addEventListener('install', (event) => {
  console.log('[serviceWorker] is installed ', event);
});

self.addEventListener('activate', (event) => {
  console.log('[serviceWorker] is activated ', event);
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log('[serviceWorker] fetch is triggered ', event);
  // event.respondWith(null);
  event.respondWith(fetch(event.request));
});
