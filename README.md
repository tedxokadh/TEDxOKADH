# TEDxOkadh Website

موقع TEDxOkadh الكامل مع نظام التسجيل والحضور.

## 🚀 تشغيل المشروع

```bash
# 1. تثبيت المكتبات
npm install

# 2. تشغيل المشروع
npm run dev

# 3. افتح المتصفح على
http://localhost:5173
```

## 📄 الصفحات

| الصفحة | الرابط | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | Landing page كاملة |
| التسجيل | `/register` | فورم تسجيل 3 خطوات + QR Code |
| السكان | `/scanner` | صفحة الفريق لسكان الحضور |
| الداشبورد | `/dashboard` | إحصائيات وقائمة المسجلين |

## 🔐 كلمات المرور

- صفحة السكان: `tedx2026`
- الداشبورد: `tedxadmin2026`

## 🔗 ربط Firebase

في كل ملف توجد تعليقات للربط بـ Firebase:

```js
// استبدل mockDB بـ Firestore
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore"
```

## 📦 المكتبات المستخدمة

- React + Vite
- React Router
- html5-qrcode (كاميرا QR)
- qrcode (توليد QR)

## 🌐 النشر على Vercel

```bash
npm run build
# ثم ارفع مجلد dist على Vercel
```
