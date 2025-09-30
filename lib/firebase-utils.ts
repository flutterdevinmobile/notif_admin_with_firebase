// Additional utility functions for Firebase operations
import { collection, query, where, getDocs, writeBatch, doc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

// Bulk operations for notifications
export const bulkDeleteNotifications = async (notificationIds: string[]) => {
  try {
    const batch = writeBatch(db)

    notificationIds.forEach((id) => {
      const notificationRef = doc(db, "notifications", id)
      batch.delete(notificationRef)
    })

    await batch.commit()
    return { success: true }
  } catch (error) {
    console.error("Error bulk deleting notifications:", error)
    return { success: false, error }
  }
}

// Mark multiple notifications as read
export const bulkMarkAsRead = async (notificationIds: string[], userId = "admin") => {
  try {
    const batch = writeBatch(db)

    notificationIds.forEach((id) => {
      const notificationRef = doc(db, "notifications", id)
      batch.update(notificationRef, {
        [`readBy.${userId}`]: true,
      })
    })

    await batch.commit()
    return { success: true }
  } catch (error) {
    console.error("Error bulk marking as read:", error)
    return { success: false, error }
  }
}

// Get notifications by date range
export const getNotificationsByDateRange = async (startDate: Date, endDate: Date) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
    )

    const snapshot = await getDocs(q)
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, data: notifications }
  } catch (error) {
    console.error("Error getting notifications by date range:", error)
    return { success: false, error }
  }
}

// Get active users count
export const getActiveUsersCount = async () => {
  try {
    const q = query(collection(db, "users"), where("isActive", "==", true))

    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error("Error getting active users count:", error)
    return 0
  }
}

// Get notifications statistics
export const getNotificationStats = async () => {
  try {
    const notificationsSnapshot = await getDocs(collection(db, "notifications"))
    const notifications = notificationsSnapshot.docs.map((doc) => doc.data())

    const stats = {
      total: notifications.length,
      read: notifications.filter((n) => Object.keys(n.readBy || {}).length > 0).length,
      unread: notifications.filter((n) => Object.keys(n.readBy || {}).length === 0).length,
      broadcast: notifications.filter((n) => n.target === "all").length,
      targeted: notifications.filter((n) => n.target === "specific").length,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error("Error getting notification stats:", error)
    return { success: false, error }
  }
}

// Validate Firebase connection
export const validateFirebaseConnection = async () => {
  try {
    // Try to read from a collection to test connection
    const snapshot = await getDocs(collection(db, "notifications"))
    return { connected: true, message: "Firebase connection successful" }
  } catch (error) {
    console.error("Firebase connection error:", error)
    return {
      connected: false,
      message: "Firebase connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Format Firebase Timestamp to readable date
export const formatFirebaseDate = (timestamp: any) => {
  if (!timestamp) return "Noma'lum vaqt"

  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return "Noma'lum vaqt"
  }
}
