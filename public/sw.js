self.addEventListener("install", () => {
    console.log("Service Worker installed");
    self.skipWaiting();
});

self.addEventListener("activate", () => {
    console.log("Service Worker activated");
    return self.clients.claim();
});

/**
 * Handle Push Notification
 */
self.addEventListener("push", (event) => {
    console.log("Push received");

    let data = {};

    try {
        data = event.data.json();
    } catch (err) {
        console.log(err)
        data = {
            title: "Habit Reminder",
            body: event.data?.text() || "Jangan lupa habit hari ini 🚀",
        };
    }

    const options = {
        body: data.body,
        icon: data.icon || "/icons/icon-192x192.png",
        badge: data.badge || "/icons/badge-72x72.png",

        vibrate: [100, 50, 100],

        data: {
            url: data.url || "/",
        },

        actions: [
            {
                action: "open",
                title: "Buka App",
            },
            {
                action: "close",
                title: "Tutup",
            },
        ],

        requireInteraction: true,
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || "Habit Tracker",
            options
        )
    );
});

/**
 * Handle Notification Click
 */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "close") {
        return;
    }

    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true,
        }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(targetUrl) && "focus" in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

/**
 * Optional:
 * Handle Notification Close
 */
self.addEventListener("notificationclose", (event) => {
    console.log("Notification closed", event.notification);
});