"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Users, User, Bell, Loader2 } from "lucide-react"
import type { User as FirebaseUser } from "@/lib/firebase-functions"

interface NotificationFormProps {
  onSendNotification: (notification: {
    title: string
    body: string
    target: string
    targetUserId?: string
  }) => Promise<void>
  users: FirebaseUser[]
}

export function NotificationForm({ onSendNotification, users }: NotificationFormProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [target, setTarget] = useState("all")
  const [targetUserId, setTargetUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setIsLoading(true)
    try {
      await onSendNotification({
        title: title.trim(),
        body: body.trim(),
        target,
        targetUserId: target === "specific" ? targetUserId : undefined,
      })

      setTitle("")
      setBody("")
      setTarget("all")
      setTargetUserId("")
    } catch (error) {
      console.error("Error sending notification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Yangi Bildirishnoma</CardTitle>
            <CardDescription>Foydalanuvchilarga bildirishnoma yuborish</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sarlavha</label>
            <Input
              placeholder="Bildirishnoma sarlavhasi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border/50 focus:border-primary/50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Matn</label>
            <Textarea
              placeholder="Bildirishnoma matni..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="bg-input border-border/50 focus:border-primary/50 resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">Kimga yuborish</label>
            <Select value={target} onValueChange={setTarget} disabled={isLoading}>
              <SelectTrigger className="bg-input border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Barcha foydalanuvchilar
                  </div>
                </SelectItem>
                <SelectItem value="specific">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Muayyan foydalanuvchi
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {target === "specific" && (
              <Select value={targetUserId} onValueChange={setTargetUserId} disabled={isLoading}>
                <SelectTrigger className="bg-input border-border/50">
                  <SelectValue placeholder="Foydalanuvchini tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
                        {user.email || user.phone || user.id}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {target === "all" ? `Barcha foydalanuvchilar (${users.length})` : "Muayyan foydalanuvchi"}
            </Badge>
            {target === "specific" && targetUserId && (
              <Badge variant="outline" className="border-success/20 text-success">
                {users.find((u) => u.id === targetUserId)?.email ||
                  users.find((u) => u.id === targetUserId)?.phone ||
                  targetUserId}
              </Badge>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!title.trim() || !body.trim() || (target === "specific" && !targetUserId) || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Bildirishnoma Yuborish
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
