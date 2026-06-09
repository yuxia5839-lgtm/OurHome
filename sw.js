const CACHE_NAME = 'ourhome-v8';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './chat.html',
    './memory.html',
    './settings.html',
    './living.html',
    './letters.html',
    './gallery.html',
    './game.html',
    './game-danranle.html',
    './game-fortune.html',
    './game-truth.html',
    './mood.html',
    './diary.html',
    './wish.html',
    './study.html',
    './shared.css',
    './shared.js',
    './manifest.json',
    './icon.svg',
    './icon.jpg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
