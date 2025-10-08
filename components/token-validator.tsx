"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Trash2, RefreshCw, Shield } from "lucide-react"
import type { User } from "@/lib/firebase-functions"

interface TokenValidationResult {
  token: string
  userId: string
  userEmail?: string
  status: "success" | "failed"
  error?: string
}

interface TokenValidatorProps {
  users: User[]
  onCleanupTokens: (results: TokenValidationResult[]) => Promise<void>
}

export function TokenValidator({ users, onCleanupTokens }: TokenValidatorProps) {
  const [validationResults, setValidationResults] = useState<TokenValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)

  const validateTokens = async () => {
    setIsValidating(true)
    setValidationResults([])

    try {
      // Collect all tokens with user info
      const allTokens: { token: string; userId: string; userEmail?: string }[] = []

      users.forEach((user) => {
        if (user.deviceTokens && Array.isArray(user.deviceTokens)) {
          user.deviceTokens.forEach((token) => {
            allTokens.push({
              token,
              userId: user.id,
              userEmail: user.email || user.phone,
            })
          })
        }
      })

      if (allTokens.length === 0) {
        alert("Hech qanday device token topilmadi")
        setIsValidating(false)
        return
      }

      // Send test notification to validate tokens
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceTokens: allTokens.map((t) => t.token),
          notification: {
            title: "Token Validation",
            body: "Testing token validity",
            icon: "/icon-192x192.png",
            click_action: "/",
          },
        }),
      })

      const result = await response.json()

      if (result.success && result.results) {
        const validationResults: TokenValidationResult[] = allTokens.map((tokenInfo, index) => ({
          token: tokenInfo.token,
          userId: tokenInfo.userId,
          userEmail: tokenInfo.userEmail,
          status: result.results[index]?.success ? "success" : "failed",
          error: result.results[index]?.error,
        }))

        setValidationResults(validationResults)
      }
    } catch (error) {
      console.error("Error validating tokens:", error)
      alert("Token validation xatosi")
    } finally {
      setIsValidating(false)
    }
  }

  const cleanupInvalidTokens = async () => {
    const failedTokens = validationResults.filter((r) => r.status === "failed")

    if (failedTokens.length === 0) {
      alert("Tozalanadigan invalid tokenlar yo'q")
      return
    }

    if (!confirm(`${failedTokens.length} ta invalid tokenni o'chirmoqchimisiz?`)) {
      return
    }

    setIsCleaning(true)
    try {
      await onCleanupTokens(failedTokens)
      alert(`${failedTokens.length} ta invalid token o'chirildi`)
      setValidationResults([])
    } catch (error) {
      console.error("Error cleaning tokens:", error)
      alert("Tokenlarni tozalashda xatolik")
    } finally {
      setIsCleaning(false)
    }
  }

  const successCount = validationResults.filter((r) => r.status === "success").length
  const failedCount = validationResults.filter((r) => r.status === "failed").length

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Token Validator</CardTitle>
            <CardDescription>Device tokenlarni tekshirish va tozalash</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={validateTokens}
            disabled={isValidating || users.length === 0}
            className="flex-1 bg-transparent"
            variant="outline"
          >
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Tekshirilmoqda...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tokenlarni Tekshirish
              </>
            )}
          </Button>

          {failedCount > 0 && (
            <Button onClick={cleanupInvalidTokens} disabled={isCleaning} variant="destructive">
              {isCleaning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Tozalanmoqda...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Invalid Tokenlarni O'chirish
                </>
              )}
            </Button>
          )}
        </div>

        {validationResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Badge variant="outline" className="border-green-500/20 text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Success: {successCount}
              </Badge>
              <Badge variant="outline" className="border-red-500/20 text-red-600">
                <XCircle className="h-3 w-3 mr-1" />
                Failed: {failedCount}
              </Badge>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-border/50 rounded-lg p-3">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === "success"
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {result.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">{result.userEmail || result.userId}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {result.token.substring(0, 40)}...
                      </p>
                      {result.error && <p className="text-xs text-red-600 mt-1">{result.error}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
