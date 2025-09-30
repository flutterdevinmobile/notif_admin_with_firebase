"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { validateFirebaseConnection } from "@/lib/firebase-utils"

export function ConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    message: string
    error?: string
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    const status = await validateFirebaseConnection()
    setConnectionStatus(status)
    setIsChecking(false)
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (!connectionStatus) {
    return (
      <Card className="glass-effect border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Firebase ulanishini tekshirmoqda...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connectionStatus.connected ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            <CardTitle className="text-lg">Firebase Ulanishi</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={checkConnection} disabled={isChecking}>
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge
            variant="outline"
            className={
              connectionStatus.connected ? "border-success/20 text-success" : "border-destructive/20 text-destructive"
            }
          >
            {connectionStatus.connected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Ulangan
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Ulanmagan
              </>
            )}
          </Badge>

          <CardDescription>
            {connectionStatus.message}
            {connectionStatus.error && (
              <div className="mt-2 text-xs text-destructive">Xatolik: {connectionStatus.error}</div>
            )}
          </CardDescription>

          {!connectionStatus.connected && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-medium mb-2">Firebase ulanishida muammo</p>
              <ul className="text-xs text-destructive/80 space-y-1">
                <li>• Firebase config to'g'ri kiritilganmi tekshiring</li>
                <li>• Internet aloqasi borligini tasdiqlang</li>
                <li>• Firestore Database yoqilganmi tekshiring</li>
                <li>• FIREBASE_SETUP.md faylini o'qing</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
