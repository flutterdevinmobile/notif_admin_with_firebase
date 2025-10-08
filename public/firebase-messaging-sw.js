// Firebase Cloud Messaging Service Worker
// Bu fayl push notifications uchun kerak

importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

// Firebase konfiguratsiya
const firebaseConfig = {
  apiKey: "AIzaSyBvN6pHs3NqZ5iznYP1WDS34acD8XYX7UA",
  authDomain: "rentify-dff8d.firebaseapp.com",
  projectId: "rentify-dff8d",
  storageBucket: "rentify-dff8d.firebasestorage.app",
  messagingSenderId: "49144144598",
  appId: "1:49144144598:web:72cc566dd55d506a309f77",
  measurementId: "G-R4TPBB7GN0",
}

const firebase = self.firebase // Declare the firebase variable

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload)

  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/icon-192x192.jpg",
    badge: "/icon-192x192.jpg",
    tag: "notification-tag",
    requireInteraction: true,
    actions: [
      {
        action: "open",
        title: "Ochish",
      },
      {
        action: "close",
        title: "Yopish",
      },
    ],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.")

  event.notification.close()

  if (event.action === "open") {
    // Open the app
    event.waitUntil(clients.openWindow("/"))
  }
})
