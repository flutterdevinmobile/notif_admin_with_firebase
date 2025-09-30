"use server"

// Server action to get VAPID key
// VAPID keys are public by design but we fetch from server to satisfy security warnings
export async function getVapidKey() {
  return process.env.NEXT_PUBLIC_VAPID_KEY || ""
}
