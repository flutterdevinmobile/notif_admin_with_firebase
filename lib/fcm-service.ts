// FCM (Firebase Cloud Messaging) service for sending push notifications
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { app } from "./firebase"
import { getVapidKey } from "@/app/actions/get-vapid-key"

export interface FCMNotification {
  title: string
  body: string
  icon?: string
  click_action?: string
}

export const sendNotificationToTokens = async (deviceTokens: string[], notification: FCMNotification) => {
  try {
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || "/icon-192x192.png",
          click_action: notification.click_action || "/",
        },
      }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error sending FCM notification:", error)
    return { success: false, error }
  }
}

// Get device token for current browser
export const getDeviceToken = async () => {
  try {
    const messaging = getMessaging(app)
    const vapidKey = await getVapidKey()
    const token = await getToken(messaging, {
      vapidKey,
    })
    return token
  } catch (error) {
    console.error("Error getting device token:", error)
    return null
  }
}

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app)
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
