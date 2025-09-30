"use client"

import { useState, useEffect } from "react"
import { NotificationForm } from "@/components/notification-form"
import { NotificationsList } from "@/components/notifications-list"
import { StatsCards } from "@/components/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Settings, Database } from "lucide-react"
import {
  subscribeToNotifications,
  subscribeToUsers,
  addNotification,
  deleteNotification,
  markNotificationAsRead,
  type Notification,
  type User,
} from "@/lib/firebase-functions"

export default function AdminPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined
    let unsubscribeUsers: (() => void) | undefined

    try {
      // Subscribe to notifications
      unsubscribeNotifications = subscribeToNotifications((notificationData) => {
        setNotifications(notificationData)
        setConnected(true)
        setLoading(false)
      })

      // Subscribe to users
      unsubscribeUsers = subscribeToUsers((userData) => {
        setUsers(userData)
      })
    } catch (error) {
      console.error("Firebase connection error:", error)
      setConnected(false)
      setLoading(false)
    }

    return () => {
      unsubscribeNotifications?.()
      unsubscribeUsers?.()
    }
  }, [])

  const handleSendNotification = async (notificationData: {
    title: string
    body: string
    target: string
    targetUserId?: string
  }) => {
    const result = await addNotification(notificationData)

    if (!result.success) {
      alert("Xatolik yuz berdi: " + result.error)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    const result = await deleteNotification(id)

    if (!result.success) {
      alert("O'chirishda xatolik: " + result.error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    const result = await markNotificationAsRead(id, "admin")

    if (!result.success) {
      alert("Belgilashda xatolik: " + result.error)
    }
  }

  const stats = {
    totalNotifications: notifications.length,
    totalUsers: users.length,
    readNotifications: notifications.filter((n) => Object.keys(n.readBy).length > 0).length,
    unreadNotifications: notifications.filter((n) => Object.keys(n.readBy).length === 0).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">Firebase ga ulanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Firebase Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Bildirishnomalarni boshqarish tizimi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={connected ? "border-green-500/20 text-green-600" : "border-red-500/20 text-red-600"}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? "bg-green-500" : "bg-red-500"}`}></div>
                {connected ? "Firebase Connected" : "Firebase Disconnected"}
              </Badge>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats */}
          <StatsCards {...stats} />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <NotificationForm onSendNotification={handleSendNotification} users={users} />
            <NotificationsList
              notifications={notifications}
              onDeleteNotification={handleDeleteNotification}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
