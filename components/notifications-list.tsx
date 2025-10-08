"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, Clock, Users, User, CheckCircle, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Notification } from "@/lib/firebase-functions"
import { useState } from "react"

interface NotificationsListProps {
  notifications: Notification[]
  onDeleteNotification: (id: string) => Promise<void>
  onMarkAsRead: (id: string) => Promise<void>
}

export function NotificationsList({ notifications, onDeleteNotification, onMarkAsRead }: NotificationsListProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, "delete" | "read" | null>>({})

  const formatDate = (date: any) => {
    if (!date) return "Noma'lum vaqt"

    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date)
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch {
      return "Noma'lum vaqt"
    }
  }

  const handleDelete = async (id: string) => {
    setLoadingStates((prev) => ({ ...prev, [id]: "delete" }))
    try {
      await onDeleteNotification(id)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleMarkAsRead = async (id: string) => {
    setLoadingStates((prev) => ({ ...prev, [id]: "read" }))
    try {
      await onMarkAsRead(id)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: null }))
    }
  }

  const getTargetBadge = (notification: Notification) => {
    if (notification.target === "all") {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <Users className="h-3 w-3 mr-1" />
          Barcha
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="border-success/20 text-success">
        <User className="h-3 w-3 mr-1" />
        {notification.targetUserId || "Muayyan"}
      </Badge>
    )
  }

  const getReadStatus = (notification: Notification) => {
    const readCount = Object.keys(notification.readBy || {}).length
    if (readCount > 0) {
      return (
        <Badge variant="outline" className="border-success/20 text-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          {readCount} o'qilgan
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-warning/20 text-warning">
        <Clock className="h-3 w-3 mr-1" />
        O'qilmagan
      </Badge>
    )
  }

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Bildirishnomalar</CardTitle>
        <CardDescription>Yuborilgan bildirishnomalar ro'yxati ({notifications.length} ta)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Hozircha bildirishnomalar yo'q</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="gradient-border">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.body}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={loadingStates[notification.id] === "read"}
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        {loadingStates[notification.id] === "read" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={loadingStates[notification.id] === "delete"}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {loadingStates[notification.id] === "delete" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      {getTargetBadge(notification)}
                      {getReadStatus(notification)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(notification.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
