import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAuFns1Npw9czqTPZroh1wFw4ls0U-rr8U",
  authDomain: "rentify-chat-test.firebaseapp.com",
  projectId: "rentify-chat-test",
  storageBucket: "rentify-chat-test.firebasestorage.app",
  messagingSenderId: "342807201893",
  appId: "1:342807201893:web:88cdfa3ec6bb2bd5805e8c",
  measurementId: "G-Z6MR0SQ6VJ",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export { app }
export const db = getFirestore(app)

export let analytics = null
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.warn("Firebase Analytics initialization failed:", error)
    // Analytics is optional for admin panel functionality
  }
}
