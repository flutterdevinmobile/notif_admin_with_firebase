# 🌐 Production'ga Deploy Qilish

## Vercel'ga Deploy

### 1. GitHub'ga Push
\`\`\`bash
git init
git add .
git commit -m "Firebase Admin Panel"
git remote add origin your-repo-url
git push -u origin main
\`\`\`

### 2. Vercel'da Import
1. vercel.com → "New Project"
2. GitHub repo'ni tanlang
3. Deploy tugmasini bosing

### 3. Environment Variables Qo'shish
Vercel dashboard → Settings → Environment Variables:

\`\`\`
FCM_SERVER_KEY = your_server_key
NEXT_PUBLIC_VAPID_KEY = your_vapid_key
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBvN6pHs3NqZ5iznYP1WDS34acD8XYX7UA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = rentify-dff8d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = rentify-dff8d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = rentify-dff8d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 49144144598
NEXT_PUBLIC_FIREBASE_APP_ID = 1:49144144598:web:72cc566dd55d506a309f77
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-R4TPBB7GN0
\`\`\`

### 4. Redeploy
Environment variables qo'shgandan keyin "Redeploy" tugmasini bosing.

## Custom Domain (Ixtiyoriy)
1. Vercel dashboard → Settings → Domains
2. Domain qo'shing va DNS sozlang

---
**Admin panel production'da tayyor!** 🎉
