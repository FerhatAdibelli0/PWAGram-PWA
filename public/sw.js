importScripts('./src/js/idb.js');
importScripts('./src/js/utility.js');

const CACHE_STATIC_NAME = 'static-v2';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];

// const dbPromise = idb.open('posts-store', 1, function (db) {
//   if (!db.objectStoreNames.contains('posts')) {
//     db.createObjectStore('posts', { keyPath: 'id' });
//   }
// });

// function trimCache(cacheName, maxSize) {
//   caches.open(cacheName).then((cache) => {
//     return cache.keys().then((keys) => {
//       if (keys.length > maxSize) {
//         cache.delete(keys[0]).then(() => {
//           trimCache(cacheName, maxSize);
//         });
//       }
//     });
//   });
// }

self.addEventListener('install', (event) => {
  console.log('[serviceWorker] is installed ');
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log('[serviceWorker] precaching app shell');
      cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  //?This event is triggered when user close all active tabs and open up new one
  console.log('[serviceWorker] is activated');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('Deleted key :', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

//? Cache-with-network-fallback strategy-1
// self.addEventListener('fetch', (event) => {
//   // event.respondWith(null);
//   event.respondWith(
//     caches.match(event.request).then((result) => {
//       if (result) {
//         return result;
//       } else {
//         return fetch(event.request)
//           .then((response) => {
//             return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//               cache.put(event.request.url, response.clone());
//               return response;
//             });
//           })
//           .catch((err) => {
//             return caches.match('/offline.html');
//           });
//       }
//     })
//   );
// });

//? Cache-only strategy-2
// self.addEventListener('fetch', (event) => {
//   event.respondWith(caches.match(event.request));
// });

//? Network-only strategy-3
// self.addEventListener('fetch', (event) => {
//   event.respondWith(fetch(event.request));
// });

//? Network-with-caches-fallback strategy-4
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//           cache.put(event.request.url, response.clone());
//           return response;
//         });
//       })
//       .catch((err) => {
//         caches.match(event.request);
//       })
//   );
// });

function isInArray(string, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }
  return false;
}

//? Mix of Cache-then-network strategy-5 and Cache-with-network-fallback strategy-1
self.addEventListener('fetch', (event) => {
  const api =
    'https://pwagram-5e122-default-rtdb.europe-west1.firebasedatabase.app/posts.json';
  if (event.request.url.indexOf(api) !== -1) {
    //? Cache-then-network strategy-5 (Check cache inside frontend)
    event.respondWith(
      fetch(event.request).then((response) => {
        // return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
        // trimCache(CACHE_DYNAMIC_NAME, 3);
        // cache.put(event.request.url, response.clone());
        const clonedResponse = response.clone();
        clearAllData('posts')
          .then(() => {
            return clonedResponse.json();
          })
          .then((data) => {
            for (let key in data) {
              // dbPromise.then((db) => {
              //   const transaction = db.transaction('posts', 'readwrite');
              //   const store = transaction.objectStore('posts');
              //   console.log(data[key]);
              //   store.put(data[key]);
              //   return transaction.complete;
              // });
              writeData('posts', data[key]).then(() => {
                deleteItemFromData('posts', key);
              });
            }
          });
        return response;
        // });
      })
    );
  } else if (isInArray(event.request.url, STATIC_ASSETS)) {
    event.respondWith(caches.match(event.request));
  } else {
    //? Cache-with-network-fallback strategy-1
    event.respondWith(
      caches.match(event.request).then((result) => {
        if (result) {
          return result;
        } else {
          return fetch(event.request)
            .then((response) => {
              return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
                // trimCache(CACHE_DYNAMIC_NAME, 4);
                cache.put(event.request.url, response.clone());
                return response;
              });
            })
            .catch((err) => {
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.open(CACHE_STATIC_NAME).then((cache) => {
                  return cache.match('/offline.html');
                });
              }
            });
        }
      })
    );
  }
});
