# Dubai Fines Bot - Installment Payment Feature

## نظرة عامة | Overview

تم إضافة نظام التقسيط الشامل للتطبيق يسمح للمستخدمين بسداد المخالفات على دفعات بدلاً من دفعة واحدة.

A comprehensive installment payment system has been added to the application, allowing users to pay traffic fines in installments instead of a lump sum.

---

## المميزات الرئيسية | Key Features

### 1. رسالة الخصم 50% | 50% Discount Message
- ✅ رسالة خصم عائمة (Floating Banner) في أسفل الصفحة
- ✅ مؤقت تنازلي 40 ثانية
- ✅ رسالة خصم على كل بطاقة مخالفة
- ✅ دعم RTL/LTR كامل

### 2. Modal الشروط والأحكام | Terms & Conditions Modal
- ✅ 7 شروط محددة بوضوح
- ✅ نسخة عربية وإنجليزية منفصلة
- ✅ تصميم احترافي بألوان أخضر
- ✅ زر "موافق" للمتابعة

### 3. صفحة UAE PASS Login | UAE PASS Login Simulation
- ✅ محاكاة تسجيل الدخول عبر UAE PASS
- ✅ التحقق من صيغة الهوية الإماراتية
- ✅ إرسال رمز OTP (محاكاة)
- ✅ التحقق من الهوية بنجاح

### 4. نموذج طلب التقسيط | Installment Request Form
- ✅ نسخة عربية منفصلة (InstallmentRequestAr.tsx)
- ✅ نسخة إنجليزية منفصلة (InstallmentRequestEn.tsx)
- ✅ ثلاثة أقسام:
  - البيانات الشخصية (الاسم، الهاتف، الهوية، البريد)
  - بيانات المركبة (الإمارة، رمز اللوحة، رقم اللوحة)
  - بيانات التقسيط (المبلغ، البنك، المدة)
- ✅ التحقق من صحة البيانات
- ✅ حد أدنى 3000 درهم للمبلغ

### 5. صفحة الدفع المحدثة | Updated Payment Page
- ✅ Component InstallmentSummary لعرض تفاصيل التقسيط
- ✅ عرض البيانات الشخصية والمركبة والتقسيط
- ✅ دعم RTL/LTR

---

## سير العمل | Workflow

### المسار الكامل للتقسيط:

```
1. الصفحة الرئيسية (Home)
   ↓
2. المستخدم يضغط "Pay by Installment"
   ↓
3. Modal الشروط والأحكام يظهر
   ↓
4. المستخدم يضغط "موافق"
   ↓
5. صفحة UAE PASS Login
   ↓
6. التحقق من الهوية والـ OTP
   ↓
7. نموذج طلب التقسيط
   ↓
8. ملء البيانات والتحقق من الصحة
   ↓
9. حفظ البيانات في localStorage
   ↓
10. صفحة الدفع مع ملخص التقسيط
```

---

## الملفات المضافة | Added Files

### صفحات جديدة:
- `client/src/pages/InstallmentRequestAr.tsx` - نموذج التقسيط العربي
- `client/src/pages/InstallmentRequestEn.tsx` - نموذج التقسيط الإنجليزي
- `client/src/pages/UaePassLogin.tsx` - محاكاة UAE PASS Login

### الملفات المعدلة:
- `client/src/pages/Home.tsx` - إضافة Modal الشروط والأحكام والـ Floating Banner
- `client/src/pages/Payment.tsx` - إضافة Component InstallmentSummary
- `client/src/App.tsx` - إضافة المسارات الجديدة

---

## البيانات المحفوظة | Stored Data

### localStorage:
```javascript
// installmentData - بيانات نموذج التقسيط
{
  fullName: string,
  phone: string,
  emiratesId: string,
  email: string,
  emirate: string,
  plateCode: string,
  plateNumber: string,
  totalAmount: string,
  bank: string,
  duration: string
}

// uaePassVerified - علم التحقق من UAE PASS
"true" | undefined
```

---

## الشروط والأحكام | Terms & Conditions

1. **تقتصر على دبي**: الخدمة محصورة في المخالفات الصادرة عن شرطة دبي فقط
2. **عدم شمول الإمارات الأخرى**: لا تشمل المخالفات من الإمارات الأخرى أو دول الخليج
3. **الحد الأدنى 3000 درهم**: يجب أن يتجاوز إجمالي المخالفات 3000 درهم
4. **استخدام الهوية الصحيحة**: يجب استخدام هوية مالك المركبة
5. **الموافقة البنكية**: الخدمة خاضعة للموافقة البنكية
6. **التعميم عند عدم السداد**: في حال عدم الالتزام، يتم إصدار تعميم
7. **تسوية جميع المخالفات**: يجب سداد جميع المخالفات دفعة واحدة

---

## البنوك المدعومة | Supported Banks

- بنك أبو ظبي الإسلامي (ADIB)
- بنك أبو ظبي التجاري (ADCB)
- بنك الإمارات الأول (FAB)
- بنك الإمارات دبي الوطني (ENBD)
- بنك الراجحي (RAKA)
- بنك الإمارات الإسلامي (AIB)

---

## مدد التقسيط | Installment Durations

- 3 أشهر
- 6 أشهر
- 12 شهر
- 24 شهر
- 36 شهر

---

## التحقق من البيانات | Data Validation

### صيغة الهوية الإماراتية:
```
Format: XXX-XXXX-XXXXXXX-X
Example: 784-1234-1234567-1
```

### رمز OTP:
```
Format: 6 أرقام
Example: 123456
```

### المبلغ:
```
الحد الأدنى: 3000 AED
```

---

## الاختبار | Testing

### اختبار المسار الكامل:

1. **الصفحة الرئيسية**:
   - تحقق من ظهور Floating Banner بـ 40 ثانية
   - تحقق من رسالة الخصم على البطاقات

2. **Modal الشروط**:
   - اضغط "Pay by Installment"
   - تحقق من ظهور 7 شروط
   - تحقق من اللغة (عربي/إنجليزي)

3. **UAE PASS**:
   - أدخل هوية صحيحة: `784-1234-1234567-1`
   - أدخل OTP صحيح: `123456`
   - تحقق من رسالة النجاح

4. **نموذج التقسيط**:
   - ملء جميع البيانات
   - اختبر التحقق من الحد الأدنى 3000 درهم
   - اختبر حفظ البيانات في localStorage

5. **صفحة الدفع**:
   - تحقق من ظهور ملخص التقسيط
   - تحقق من عرض جميع البيانات بشكل صحيح

---

## ملاحظات مهمة | Important Notes

⚠️ **هذا التطبيق محاكاة**:
- UAE PASS Login هو محاكاة فقط وليس متصلاً بخادم حقيقي
- البيانات تُحفظ في localStorage وليس في قاعدة بيانات
- لا يتم إرسال البيانات إلى أي خادم حالياً

✅ **الخطوات التالية**:
- ربط نموذج التقسيط بـ API حقيقي
- إضافة تكامل UAE PASS الحقيقي
- إضافة معالجة الدفع الفعلية
- إضافة قاعدة بيانات لحفظ طلبات التقسيط

---

## الدعم | Support

للمزيد من المعلومات أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.

For more information or to report issues, please contact the development team.

---

**آخر تحديث | Last Updated**: April 25, 2026
**الإصدار | Version**: 1.0.0
