# Firebase Admin Panel - O'rnatish Qo'llanmasi

Bu qo'llanma sizning Firebase Admin Panelingizni to'liq ishga tushirish uchun zarur.

## 1. Firebase Loyihasini Sozlash

### Firebase Console'da:
1. [Firebase Console](https://console.firebase.google.com/) ga kiring
2. Yangi loyiha yarating yoki mavjud loyihangizni tanlang
3. **Firestore Database** ni yoqing:
   - Build > Firestore Database > Create database
   - Test mode'da boshlang (keyinroq production rules qo'yasiz)

### Kolleksiyalarni yaratish:
Firestore'da quyidagi kolleksiyalar avtomatik yaratiladi:
- `notifications` - barcha bildirishnomalar
- `users` - foydalanuvchilar ma'lumotlari

## 2. Firebase Config'ni Olish

1. Firebase Console'da Project Settings > General
2. "Your apps" bo'limida Web app qo'shing
3. Config obyektini nusxalang

## 3. Loyihangizda Sozlash

### `lib/firebase.ts` faylini yangilang:
\`\`\`typescript
const firebaseConfig = {
  apiKey: "sizning-api-key",
  authDomain: "loyiha-nomi.firebaseapp.com",
  projectId: "loyiha-id",
  storageBucket: "loyiha-nomi.appspot.com",
  messagingSenderId: "sender-id",
  appId: "app-id"
}
\`\`\`

## 4. Firestore Security Rules

Firebase Console > Firestore Database > Rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notifications - faqat admin yoza oladi, hamma o'qiy oladi
    match /notifications/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users - faqat admin boshqara oladi
    match /users/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

## 5. Test Ma'lumotlari

Firestore'da test uchun quyidagi ma'lumotlarni qo'shing:

### `users` kolleksiyasiga:
\`\`\`json
{
  "id": "+998901234567",
  "phone": "+998901234567",
  "isActive": true,
  "deviceTokens": ["test-token-1"]
}
\`\`\`

### `notifications` kolleksiyasiga:
\`\`\`json
{
  "title": "Test bildirishnoma",
  "body": "Bu test uchun bildirishnoma",
  "target": "all",
  "date": "2024-01-01T00:00:00Z",
  "readBy": {}
}
\`\`\`

## 6. Ishga Tushirish

\`\`\`bash
npm run dev
\`\`\`

Admin panel http://localhost:3000 da ochiladi.

## 7. Xususiyatlar

✅ **Real-time yangilanishlar** - Firestore listeners orqali
✅ **CRUD operatsiyalar** - Create, Read, Update, Delete
✅ **Maqsadli yuborish** - Barcha yoki muayyan foydalanuvchi
✅ **Statistika** - Real-time hisobotlar
✅ **Chiroyli UI** - Zamonaviy dizayn
✅ **Loading states** - Foydalanuvchi tajribasi uchun
✅ **Xatoliklarni boshqarish** - To'liq error handling

## 8. Keyingi Qadamlar

- Firebase Authentication qo'shish (admin login)
- Push notifications integratsiyasi
- Email notifications
- Bulk operations
- Export/Import funksiyalari

## 9. Muammolarni Hal Qilish

### "Firebase App already exists" xatosi:
Bu xato Firebase app bir necha marta initialize qilinganida paydo bo'ladi. Kod avtomatik ravishda buni hal qiladi.

### "API key not valid" xatosi:
1. Firebase Console'da Project Settings > General ga boring
2. Web app config'ni qayta nusxalang
3. API key to'g'ri ekanligini tekshiring
4. Firebase Console'da Analytics yoqilganligini tekshiring

### Real-time yangilanishlar ishlamayapti:
1. Internet aloqasini tekshiring
2. Firestore rules to'g'ri sozlanganligini tekshiring
3. Browser console'da xatoliklarni ko'ring

### Analytics xatoliklari:
Analytics admin panel uchun majburiy emas. Agar Analytics kerak bo'lmasa, uni o'chirib qo'yishingiz mumkin.

## Yordam

Agar muammolar bo'lsa, quyidagilarni tekshiring:
1. Firebase config to'g'ri kiritilganmi?
2. Firestore rules to'g'ri sozlanganmi?
3. Internet aloqasi bormi?
4. Browser console'da xatoliklar bormi?
