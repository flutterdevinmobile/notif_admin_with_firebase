# Firebase Admin Panel - To'liq O'rnatish Yo'riqnomasi

## 1. Loyihani Download Qilish va O'rnatish

### Download qilgandan keyin:
\`\`\`bash
# 1. Fayllarni ochib, terminal ochish
cd firebase-admin-panel

# 2. Dependencies o'rnatish
npm install

# 3. Environment variables sozlash
cp .env.example .env.local
\`\`\`

## 2. Firebase Konfiguratsiyasi

### A. Firebase Console'da sozlash:
1. **Firebase Console**ga kiring: https://console.firebase.google.com
2. **rentify-dff8d** loyihangizni tanlang
3. **Project Settings** > **Service accounts** > **Generate new private key**
4. JSON faylni yuklab oling va xavfsiz joyga saqlang

### B. FCM Server Key olish:
1. Firebase Console > **Project Settings** > **Cloud Messaging**
2. **Server key**ni nusxalang
3. **Web Push certificates** > **Generate key pair** (VAPID key)

### C. Environment Variables sozlash:
`.env.local` faylini tahrirlang:

\`\`\`env
# Firebase konfiguratsiyasi (sizning mavjud ma'lumotlaringiz)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBvN6pHs3NqZ5iznYP1WDS34acD8XYX7UA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rentify-dff8d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rentify-dff8d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rentify-dff8d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=49144144598
NEXT_PUBLIC_FIREBASE_APP_ID=1:49144144598:web:72cc566dd55d506a309f77
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R4TPBB7GN0

# FCM kalitlari (Firebase Console'dan oling)
FCM_SERVER_KEY=your_fcm_server_key_here
NEXT_PUBLIC_VAPID_KEY=your_vapid_key_here
\`\`\`

## 3. Firestore Security Rules

Firebase Console > **Firestore Database** > **Rules**:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notifications collection
    match /notifications/{document} {
      allow read, write: if true; // Admin panel uchun
    }
    
    // Users collection
    match /users/{document} {
      allow read, write: if true; // Admin panel uchun
    }
  }
}
\`\`\`

## 4. Loyihani Ishga Tushirish

\`\`\`bash
# Development server ishga tushirish
npm run dev

# Browser'da ochish
# http://localhost:3000
\`\`\`

## 5. Admin Panel Xususiyatlari

### ✅ Mavjud funksiyalar:
- **Real-time notifications** - Firestore'dan real vaqtda yangilanish
- **FCM Push Notifications** - Device token'larga push yuborish
- **Target Selection** - Hammaga yoki bitta user'ga yuborish
- **CRUD Operations** - Yaratish, o'qish, yangilash, o'chirish
- **Statistics** - Users va notifications statistikasi
- **Responsive Design** - Barcha qurilmalarda ishlaydi

### 📱 FCM ishlash prinsipi:
1. **"Hammaga yuborish"** - barcha users'ning deviceTokens array'idagi tokenlar
2. **"Bitta user'ga"** - tanlangan user'ning deviceTokens'lariga
3. **Firestore + FCM** - ma'lumot bazaga yozish + push notification

## 6. Mavjud User Schema bilan Integratsiya

Sizning user strukturangiz:
\`\`\`javascript
{
  "uuid": "user_uuid",
  "phone": "+998904460100", 
  "deviceTokens": ["fcm_token_1", "fcm_token_2"],
  "isActive": true,
  "createdAt": timestamp
}
\`\`\`

Admin panel bu struktura bilan to'liq mos keladi va deviceTokens array'ini ishlatadi.

## 7. Muammolarni Hal Qilish

### FCM ishlamasa:
1. FCM_SERVER_KEY to'g'ri kiritilganini tekshiring
2. VAPID_KEY Firebase Console'dan to'g'ri olinganini tekshiring
3. Browser console'da xatolarni tekshiring

### Firestore ulanmasa:
1. Firebase konfiguratsiya ma'lumotlarini tekshiring
2. Firestore Rules'ni tekshiring
3. Network connection'ni tekshiring

### Build xatolari:
\`\`\`bash
# Cache tozalash
npm run build
# yoki
rm -rf .next && npm run dev
\`\`\`

## 8. Production'ga Deploy Qilish

### Vercel'ga deploy:
\`\`\`bash
# Vercel CLI o'rnatish
npm i -g vercel

# Deploy qilish
vercel

# Environment variables Vercel'da sozlash
vercel env add FCM_SERVER_KEY
vercel env add NEXT_PUBLIC_VAPID_KEY
\`\`\`

## 9. Qo'shimcha Xususiyatlar

### Notification Icon:
- `public/icon-192x192.jpg` - push notification icon'i
- O'z logongizni qo'yishingiz mumkin

### Service Worker:
- `public/firebase-messaging-sw.js` - background notifications uchun
- Automatic ishga tushadi

---

**Yordam kerak bo'lsa:**
- Firebase Console'da barcha sozlamalar to'g'ri ekanini tekshiring
- Environment variables to'liq kiritilganini tekshiring  
- Browser console'da xatolarni kuzating

**Admin Panel tayyor va sizning mavjud Firebase loyihangiz bilan to'liq integratsiya qilingan!** 🚀
\`\`\`

```json file="" isHidden
