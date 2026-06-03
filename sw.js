// Our Story Service Worker v3
const CACHE_NAME = 'ourstory-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Simple pass-through — no caching that could cause 404
self.addEventListener('fetch', event => {
  // Skip non-GET and external requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.includes(self.location.origin)) return;
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Our Story 🌸', {
      body: data.body || 'You have a new message 💌',
      tag: data.tag || 'ourstory',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});
