import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

// Firebase Admin SDK initialization
function initializeFirebaseAdmin() {
  console.log("[v0] API: Initializing Firebase Admin SDK...")

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
      console.error("[v0] API: Missing environment variables:", missingVars)
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
    }

    console.log("[v0] API: All environment variables present")
    console.log("[v0] API: Project ID:", process.env.FIREBASE_PROJECT_ID)
    console.log("[v0] API: Client Email:", process.env.FIREBASE_CLIENT_EMAIL)

    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (!privateKey?.includes("BEGIN PRIVATE KEY")) {
      console.error("[v0] API: Private key format invalid - missing BEGIN PRIVATE KEY")
      throw new Error("Invalid private key format")
    }
    console.log("[v0] API: Private key format looks valid")

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey.replace(/\\n/g, "\n"),
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
      console.log("[v0] API: Firebase Admin SDK initialized successfully")
    } catch (error: any) {
      console.error("[v0] API: Firebase Admin SDK initialization failed:", error.message)
      console.error("[v0] API: Full error:", error)
      throw error
    }
  } else {
    console.log("[v0] API: Firebase Admin SDK already initialized")
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] API: ========== FCM API ROUTE CALLED ==========")

  try {
    const body = await request.json()
    console.log("[v0] API: Request body received:", JSON.stringify(body, null, 2))

    const { deviceTokens, notification } = body

    if (!deviceTokens || !Array.isArray(deviceTokens) || deviceTokens.length === 0) {
      console.log("[v0] API: Invalid device tokens:", deviceTokens)
      return NextResponse.json({ success: false, error: "Device tokens required" }, { status: 400 })
    }

    if (!notification || !notification.title || !notification.body) {
      console.log("[v0] API: Invalid notification data:", notification)
      return NextResponse.json({ success: false, error: "Notification title and body required" }, { status: 400 })
    }

    console.log("[v0] API: Validation passed - tokens:", deviceTokens.length, "notification:", notification.title)

    // Initialize Firebase Admin
    try {
      initializeFirebaseAdmin()
    } catch (initError: any) {
      console.error("[v0] API: Initialization error:", initError.message)
      return NextResponse.json(
        { success: false, error: `Firebase initialization failed: ${initError.message}` },
        { status: 500 },
      )
    }

    const messaging = getMessaging()
    console.log("[v0] API: Firebase Messaging instance created")

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      // Android-specific configuration
      android: {
        priority: "high" as const,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || "ic_launcher",
          color: "#4F46E5",
          sound: "default",
          channelId: "default",
          priority: "high" as const,
          defaultSound: true,
          defaultVibrateTimings: true,
          defaultLightSettings: true,
        },
      },
      // Web push configuration (for browser notifications)
      webpush: {
        fcmOptions: {
          link: notification.click_action || "/",
        },
        notification: {
          icon: notification.icon || "/icon-192x192.png",
          badge: "/icon-192x192.png",
        },
      },
      // Apple Push Notification Service (APNS) configuration
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    console.log("[v0] API: Message prepared with Android config, sending to", deviceTokens.length, "tokens")
    let results = []

    if (deviceTokens.length === 1) {
      // Single token
      try {
        console.log("[v0] API: Sending to single token...")
        const result = await messaging.send({
          ...message,
          token: deviceTokens[0],
        })
        console.log("[v0] API: Single send SUCCESS - messageId:", result)
        results.push({ success: true, messageId: result })
      } catch (error: any) {
        console.error("[v0] API: Single send FAILED:", error.message)
        console.error("[v0] API: Error code:", error.code)
        console.error("[v0] API: Full error:", error)
        results.push({ success: false, error: error.message, code: error.code })
      }
    } else {
      // Multiple tokens
      try {
        console.log("[v0] API: Sending to", deviceTokens.length, "tokens...")
        const result = await messaging.sendEachForMulticast({
          ...message,
          tokens: deviceTokens,
        })
        console.log(
          "[v0] API: Multicast send completed - success:",
          result.successCount,
          "failed:",
          result.failureCount,
        )

        results = result.responses.map((response, index) => {
          if (response.success) {
            console.log("[v0] API: Token", index, "SUCCESS - messageId:", response.messageId)
          } else {
            console.error("[v0] API: Token", index, "FAILED:", response.error?.message)
          }

          return {
            token: deviceTokens[index],
            success: response.success,
            messageId: response.success ? response.messageId : undefined,
            error: response.success ? undefined : response.error?.message,
            errorCode: response.success ? undefined : response.error?.code,
          }
        })
      } catch (error: any) {
        console.error("[v0] API: Multicast send FAILED:", error.message)
        console.error("[v0] API: Error code:", error.code)
        console.error("[v0] API: Full error:", error)
        return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: 500 })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    console.log("[v0] API: ========== FINAL RESULTS ==========")
    console.log("[v0] API: Success:", successCount, "Failed:", failureCount, "Total:", results.length)
    console.log("[v0] API: =====================================")

    return NextResponse.json({
      success: successCount > 0,
      results,
      successCount,
      failureCount,
      totalCount: results.length,
    })
  } catch (error: any) {
    console.error("[v0] API: ========== CRITICAL ERROR ==========")
    console.error("[v0] API: Error message:", error.message)
    console.error("[v0] API: Error stack:", error.stack)
    console.error("[v0] API: ====================================")

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
