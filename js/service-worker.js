// ============================================
// SERVICE WORKER FOR OFFLINE SUPPORT
// ============================================

const CACHE_NAME = 'ngo-erp-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/offline.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css',
    'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('cdnjs') && 
        !event.request.url.includes('font-awesome')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response for cache
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If offline and it's a page navigation, show offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Push notifications
self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Sync offline data with server
async function syncData() {
    try {
        const db = await openDB();
        const offlineData = await getAllOfflineData(db);
        
        for (const item of offlineData) {
            try {
                await sendToServer(item);
                await markAsSynced(db, item.id);
            } catch (error) {
                console.error('Sync failed for item:', item.id, error);
            }
        }
        
        // Notify all clients about sync completion
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETED',
                timestamp: Date.now()
            });
        });
        
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// IndexedDB helper functions
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NGODB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('offlineData')) {
                const store = db.createObjectStore('offlineData', { keyPath: 'id' });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function getAllOfflineData(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offlineData'], 'readonly');
        const store = transaction.objectStore('offlineData');
        const index = store.index('synced');
        const request = index.getAll(false);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function markAsSynced(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        const request = store.get(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const data = request.result;
            data.synced = true;
            store.put(data);
            resolve();
        };
    });
}

async function sendToServer(data) {
    // In a real app, this would send to your backend API
    const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Server sync failed');
    }
    
    return response.json();
}