self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            
            const options = {
                body: data.body,
                icon: '/icons/icon-192x192.png', // Assuming there's a PWA icon, fallback is default
                badge: '/icons/icon-192x192.png',
                vibrate: [100, 50, 100],
                data: {
                    url: data.url || '/'
                }
            };
            
            event.waitUntil(
                self.registration.showNotification(data.title, options)
            );
        } catch (e) {
            // Fallback for plain text
            event.waitUntil(
                self.registration.showNotification(event.data.text())
            );
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window/tab
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
