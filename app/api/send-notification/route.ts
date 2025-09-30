import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

// Firebase Admin SDK initialization
function initializeFirebaseAdmin() {
  console.log("[v0] Initializing Firebase Admin SDK...")

  if (getApps().length === 0) {
    const requiredEnvVars = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_PRIVATE_KEY_ID",
      "FIREBASE_PRIVATE_KEY",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_CLIENT_ID",
      "FIREBASE_CLIENT_X509_CERT_URL",
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
    if (missingVars.length > 0) {
      console.error("[v0] Missing environment variables:", missingVars)
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
    }

    console.log("[v0] All environment variables present")
    console.log("[v0] Project ID:", process.env.FIREBASE_PROJECT_ID)
    console.log("[v0] Client Email:", process.env.FIREBASE_CLIENT_EMAIL)

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com",
    }

    try {
      initializeApp({
        credential: cert(serviceAccount as any),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
      console.log("[v0] Firebase Admin SDK initialized successfully")
    } catch (error: any) {
      console.error("[v0] Firebase Admin SDK initialization failed:", error.message)
      throw error
    }
  } else {
    console.log("[v0] Firebase Admin SDK already initialized")
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] FCM API route called")
    const { deviceTokens, notification } = await request.json()
    console.log("[v0] Request data:", { deviceTokens, notification })

    // Initialize Firebase Admin
    initializeFirebaseAdmin()
    const messaging = getMessaging()
    console.log("[v0] Firebase Messaging instance created")

    if (!deviceTokens || !Array.isArray(deviceTokens) || deviceTokens.length === 0) {
      console.log("[v0] Invalid device tokens")
      return NextResponse.json({ success: false, error: "Device tokens required" }, { status: 400 })
    }

    if (!notification || !notification.title || !notification.body) {
      console.log("[v0] Invalid notification data")
      return NextResponse.json({ success: false, error: "Notification title and body required" }, { status: 400 })
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.icon || "/icon-192x192.png",
      },
      data: {
        title: notification.title,
        body: notification.body,
        timestamp: Date.now().toString(),
        click_action: notification.click_action || "/",
      },
      webpush: {
        fcmOptions: {
          link: notification.click_action || "/",
        },
        notification: {
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        },
      },
    }

    console.log("[v0] Message prepared:", message)
    let results = []

    if (deviceTokens.length === 1) {
      // Single token uchun
      try {
        console.log("[v0] Sending to single token:", deviceTokens[0])
        const result = await messaging.send({
          ...message,
          token: deviceTokens[0],
        })
        console.log("[v0] Single send result:", result)
        results.push({ success: true, messageId: result })
      } catch (error: any) {
        console.error("[v0] Single send error:", error.message)
        results.push({ success: false, error: error.message })
      }
    } else {
      // Multiple tokens uchun
      try {
        console.log("[v0] Sending to multiple tokens:", deviceTokens.length)
        const result = await messaging.sendEachForMulticast({
          ...message,
          tokens: deviceTokens,
        })
        console.log("[v0] Multicast send result:", result)
        results = result.responses.map((response, index) => ({
          token: deviceTokens[index],
          success: response.success,
          messageId: response.success ? response.messageId : undefined,
          error: response.success ? undefined : response.error?.message,
        }))
      } catch (error: any) {
        console.error("[v0] Multicast send error:", error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    console.log("[v0] Final results:", { successCount, failureCount, totalCount: results.length })

    return NextResponse.json({
      success: successCount > 0,
      results,
      successCount,
      failureCount,
      totalCount: results.length,
    })
  } catch (error: any) {
    console.error("[v0] FCM API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
