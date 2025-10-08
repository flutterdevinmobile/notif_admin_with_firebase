# Firebase Admin Panel

Zamonaviy va chiroyli Firebase Admin Panel - bildirishnomalarni boshqarish uchun.

## Xususiyatlar

- 🔥 **Firebase Integration** - To'liq Firestore bilan integratsiya
- 📱 **Real-time Updates** - Jonli yangilanishlar
- 🎨 **Modern UI** - Vercel/Supabase kabi zamonaviy dizayn
- 📊 **Statistics** - Real-time statistika va hisobotlar
- 👥 **User Management** - Foydalanuvchilarni boshqarish
- 🔔 **Notifications** - Barcha yoki muayyan foydalanuvchilarga yuborish
- 📱 **Responsive** - Barcha qurilmalarda ishlaydi
- 🌙 **Dark Theme** - Qorong'u tema qo'llab-quvvatlash

## O'rnatish

1. **Loyihani yuklab oling**
\`\`\`bash
# ZIP faylni yuklab oling va ochib oling
cd firebase-admin-panel
\`\`\`

2. **Dependencies o'rnating**
\`\`\`bash
npm install
# yoki
yarn install
# yoki
pnpm install
\`\`\`

3. **Firebase konfiguratsiyasi**
`lib/firebase.ts` faylida o'z Firebase konfiguratsiyangizni kiriting:

\`\`\`typescript
const firebaseConfig = {
  apiKey: "sizning-api-key",
  authDomain: "sizning-project.firebaseapp.com",
  projectId: "sizning-project-id",
  storageBucket: "sizning-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "sizning-app-id"
};
\`\`\`

4. **Loyihani ishga tushiring**
\`\`\`bash
npm run dev
\`\`\`

5. **Brauzerda oching**
\`\`\`
http://localhost:3000
\`\`\`

## Firebase Setup

Batafsil setup yo'riqnomasi uchun `FIREBASE_SETUP.md` faylini o'qing.

### Kerakli Firestore Collections:

1. **notifications** - bildirishnomalar uchun
2. **users** - foydalanuvchilar uchun

### Security Rules namunasi:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notifications/{document} {
      allow read, write: if true; // Admin panel uchun
    }
    match /users/{document} {
      allow read, write: if true; // Admin panel uchun
    }
  }
}
\`\`\`

## Fayllar Strukturasi

\`\`\`
firebase-admin-panel/
├── app/
│   ├── globals.css          # Global stillar
│   ├── layout.tsx           # Asosiy layout
│   └── page.tsx             # Bosh sahifa
├── components/
│   ├── ui/                  # UI komponentlar
│   ├── connection-status.tsx # Firebase ulanish holati
│   ├── notification-form.tsx # Bildirishnoma yaratish
│   ├── notifications-list.tsx # Bildirishnomalar ro'yxati
│   └── stats-cards.tsx      # Statistika kartalar
├── lib/
│   ├── firebase.ts          # Firebase konfiguratsiya
│   ├── firebase-functions.ts # Firebase CRUD funksiyalar
│   ├── firebase-utils.ts    # Yordamchi funksiyalar
│   └── fcm-service.ts       # FCM push notifications
├── public/
│   └── firebase-messaging-sw.js # FCM service worker
├── FIREBASE_SETUP.md        # Setup yo'riqnomasi
├── README.md               # Bu fayl
└── package.json            # Dependencies
\`\`\`

## Ishlatish

1. **Bildirishnoma yaratish** - Yangi bildirishnoma qo'shish
2. **Foydalanuvchilarni ko'rish** - Ro'yxatdan o'tgan foydalanuvchilar
3. **Statistika** - Real-time hisobotlar
4. **Boshqarish** - O'chirish, tahrirlash, holat o'zgartirish

## Texnologiyalar

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Backend
- **Radix UI** - UI komponentlar
- **Lucide React** - Ikonlar

## Yordam

Muammolar yoki savollar bo'lsa, `FIREBASE_SETUP.md` faylini o'qing yoki Firebase Console'ni tekshiring.

## Litsenziya

MIT License
