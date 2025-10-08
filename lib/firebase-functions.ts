// Firebase CRUD operations for notifications and users
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "./firebase"
import { sendNotificationToTokens } from "./fcm-service"

export interface Notification {
  id: string
  title: string
  body: string
  target: string
  targetUserId?: string
  date: any
  readBy: Record<string, boolean>
}

export interface User {
  id: string
  uuid?: string // added uuid field to match your schema
  phone?: string
  email?: string
  deviceTokens?: string[]
  isActive?: boolean
  isNew?: boolean // added isNew field to match your schema
  createdAt?: any // added createdAt field to match your schema
}

// Get all notifications with real-time updates
export const subscribeToNotifications = (callback: (notifications: Notification[]) => void) => {
  const q = query(collection(db, "notifications"), orderBy("date", "desc"))

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[]

    callback(notifications)
  })
}

// Get all users with real-time updates
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[]

    callback(users)
  })
}

// Add new notification with FCM push notification
export const addNotification = async (notificationData: {
  title: string
  body: string
  target: string
  targetUserId?: string
}) => {
  try {
    // First, add to Firestore
    await addDoc(collection(db, "notifications"), {
      title: notificationData.title,
      body: notificationData.body,
      target: notificationData.target,
      targetUserId: notificationData.targetUserId || null,
      date: serverTimestamp(),
      readBy: {},
    })

    await sendFCMNotification(notificationData)

    return { success: true }
  } catch (error) {
    console.error("Error adding notification:", error)
    return { success: false, error }
  }
}

// Delete notification
export const deleteNotification = async (id: string) => {
  try {
    await deleteDoc(doc(db, "notifications", id))
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error }
  }
}

// Mark notification as read
export const markNotificationAsRead = async (id: string, userId = "admin") => {
  try {
    await updateDoc(doc(db, "notifications", id), {
      [`readBy.${userId}`]: true,
    })
    return { success: true }
  } catch (error) {
    console.error("Error marking as read:", error)
    return { success: false, error }
  }
}

export const cleanupInvalidTokens = async (failedTokens: Array<{ token: string; userId: string }>) => {
  try {
    // Group tokens by userId
    const tokensByUser = failedTokens.reduce(
      (acc, item) => {
        if (!acc[item.userId]) {
          acc[item.userId] = []
        }
        acc[item.userId].push(item.token)
        return acc
      },
      {} as Record<string, string[]>,
    )

    // Update each user's document to remove invalid tokens
    const updatePromises = Object.entries(tokensByUser).map(async ([userId, tokens]) => {
      const userRef = doc(db, "users", userId)
      const userSnapshot = await getDocs(query(collection(db, "users")))
      const userDoc = userSnapshot.docs.find((d) => d.id === userId)

      if (userDoc) {
        const userData = userDoc.data()
        const currentTokens = userData.deviceTokens || []
        const validTokens = currentTokens.filter((token: string) => !tokens.includes(token))

        await updateDoc(userRef, {
          deviceTokens: validTokens,
        })
      }
    })

    await Promise.all(updatePromises)
    return { success: true }
  } catch (error) {
    console.error("Error cleaning up tokens:", error)
    return { success: false, error }
  }
}

// Get users count
export const getUsersCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"))
    return snapshot.size
  } catch (error) {
    console.error("Error getting users count:", error)
    return 0
  }
}

const sendFCMNotification = async (notificationData: {
  title: string
  body: string
  target: string
  targetUserId?: string
}) => {
  try {
    const fcmNotification = {
      title: notificationData.title,
      body: notificationData.body,
      icon: "/icon-192x192.png",
      click_action: "/",
    }

    if (notificationData.target === "all") {
      // Send to all users
      const usersSnapshot = await getDocs(collection(db, "users"))
      const allDeviceTokens: string[] = []

      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data()
        if (userData.deviceTokens && Array.isArray(userData.deviceTokens)) {
          allDeviceTokens.push(...userData.deviceTokens)
        }
      })

      if (allDeviceTokens.length > 0) {
        console.log(`[v0] Sending FCM to ${allDeviceTokens.length} device tokens`)
        await sendNotificationToTokens(allDeviceTokens, fcmNotification)
      }
    } else if (notificationData.target === "specific" && notificationData.targetUserId) {
      // Send to specific user
      const userDoc = await getDocs(query(collection(db, "users"), orderBy("__name__")))

      const targetUser = userDoc.docs.find((doc) => doc.id === notificationData.targetUserId)

      if (targetUser) {
        const userData = targetUser.data()
        if (userData.deviceTokens && Array.isArray(userData.deviceTokens)) {
          console.log(`[v0] Sending FCM to specific user: ${userData.deviceTokens.length} tokens`)
          await sendNotificationToTokens(userData.deviceTokens, fcmNotification)
        }
      }
    }
  } catch (error) {
    console.error("Error sending FCM notification:", error)
  }
}
