"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Users, Eye, Clock } from "lucide-react"

interface StatsCardsProps {
  totalNotifications: number
  totalUsers: number
  readNotifications: number
  unreadNotifications: number
}

export function StatsCards({
  totalNotifications,
  totalUsers,
  readNotifications,
  unreadNotifications,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Jami Bildirishnomalar",
      value: totalNotifications,
      icon: Bell,
      color: "text-primary",
      bgColor: "bg-primary/10",
      percentage: totalNotifications > 0 ? 100 : 0,
    },
    {
      title: "Foydalanuvchilar",
      value: totalUsers,
      icon: Users,
      color: "text-success",
      bgColor: "bg-success/10",
      percentage: totalUsers > 0 ? 100 : 0,
    },
    {
      title: "O'qilgan",
      value: readNotifications,
      icon: Eye,
      color: "text-info",
      bgColor: "bg-info/10",
      percentage: totalNotifications > 0 ? Math.round((readNotifications / totalNotifications) * 100) : 0,
    },
    {
      title: "O'qilmagan",
      value: unreadNotifications,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      percentage: totalNotifications > 0 ? Math.round((unreadNotifications / totalNotifications) * 100) : 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="glass-effect border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
                Real-time
              </Badge>
              {index > 1 && (
                <Badge variant="outline" className={`${stat.color.replace("text-", "border-")}/20 ${stat.color}`}>
                  {stat.percentage}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
