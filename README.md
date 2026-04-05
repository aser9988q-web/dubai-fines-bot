# 🚔 Dubai Police Fines Bot

نظام ويب للاستعلام عن المخالفات المرورية من موقع شرطة دبي الرسمي.

## المميزات

- استعلام مباشر من API شرطة دبي الرسمي
- واجهة عربية بالكامل مع دعم RTL
- دعم جميع إمارات الدولة
- حفظ سجل الاستعلامات السابقة
- عرض تفاصيل المخالفات (المبلغ، التاريخ، النقاط السوداء، حالة الدفع)

## التقنيات المستخدمة

- **Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend:** Node.js + Express + tRPC
- **Database:** MySQL (Drizzle ORM)
- **Language:** TypeScript

## النشر على Railway

### 1. إنشاء مشروع جديد على Railway
- اذهب إلى [railway.app](https://railway.app)
- اضغط على "New Project"
- اختر "Deploy from GitHub repo"
- اختر هذا الـ repository

### 2. إضافة قاعدة بيانات MySQL
- في مشروع Railway، اضغط على "Add Service"
- اختر "MySQL"
- انسخ الـ `DATABASE_URL` من إعدادات MySQL

### 3. متغيرات البيئة المطلوبة

| المتغير | الوصف |
|---------|-------|
| `DATABASE_URL` | رابط قاعدة بيانات MySQL |
| `JWT_SECRET` | مفتاح سري عشوائي لتشفير الجلسات |
| `NODE_ENV` | `production` |

### 4. أوامر البناء
- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `pnpm run start`

## التشغيل المحلي

```bash
# تثبيت الحزم
pnpm install

# تشغيل بيئة التطوير
pnpm run dev

# تشغيل الاختبارات
pnpm test
```

## ملاحظة

هذا النظام تعليمي يجلب البيانات من موقع شرطة دبي الرسمي. يُرجى استخدامه بشكل مسؤول.
