import React, { useState } from "react";
import { useNavigate } from "wouter";

interface FormData {
  fullName: string;
  phone: string;
  emiratesId: string;
  email: string;
  emirate: string;
  plateCode: string;
  plateNumber: string;
  totalAmount: string;
  bank: string;
  duration: string;
}

export default function InstallmentRequestAr() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    emiratesId: "",
    email: "",
    emirate: "",
    plateCode: "",
    plateNumber: "",
    totalAmount: "",
    bank: "",
    duration: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim())
      newErrors.fullName = "الاسم الكامل مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.emiratesId.trim())
      newErrors.emiratesId = "رقم الهوية الإماراتية مطلوب";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!formData.emirate) newErrors.emirate = "الإمارة مطلوبة";
    if (!formData.plateCode) newErrors.plateCode = "رمز اللوحة مطلوب";
    if (!formData.plateNumber.trim())
      newErrors.plateNumber = "رقم اللوحة مطلوب";
    if (!formData.totalAmount.trim())
      newErrors.totalAmount = "المبلغ الإجمالي مطلوب";
    if (parseFloat(formData.totalAmount) < 3000)
      newErrors.totalAmount = "يجب أن يكون المبلغ 3000 درهم على الأقل";
    if (!formData.bank) newErrors.bank = "البنك مطلوب";
    if (!formData.duration) newErrors.duration = "مدة التقسيط مطلوبة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save installment data to localStorage
      localStorage.setItem("installmentData", JSON.stringify(formData));
      
      // Navigate to payment page
      navigate("/payment");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px", textAlign: "right" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#008755",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            ← العودة
          </button>
          <h1 style={{ color: "#1f2937", fontSize: "28px", fontWeight: 800, margin: "0 0 10px 0" }}>
            نموذج طلب التقسيط
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
            يرجى ملء البيانات الشخصية والمركبة
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "15px", padding: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {/* Personal Data Section */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#008755", fontSize: "16px", fontWeight: 700, marginBottom: "15px" }}>
              البيانات الشخصية
            </h3>

            {/* Full Name */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                الاسم الكامل *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="أدخل اسمك الكامل"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.fullName ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "rtl",
                }}
              />
              {errors.fullName && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="971501234567"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.phone ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "right",
                }}
              />
              {errors.phone && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Emirates ID */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                رقم الهوية الإماراتية *
              </label>
              <input
                type="text"
                name="emiratesId"
                value={formData.emiratesId}
                onChange={handleChange}
                placeholder="784-1234-1234567-1"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.emiratesId ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "right",
                }}
              />
              {errors.emiratesId && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.emiratesId}
                </p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.email ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "right",
                }}
              />
              {errors.email && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Data Section */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#008755", fontSize: "16px", fontWeight: 700, marginBottom: "15px" }}>
              بيانات المركبة
            </h3>

            {/* Emirate */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                الإمارة *
              </label>
              <select
                name="emirate"
                value={formData.emirate}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.emirate ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "rtl",
                }}
              >
                <option value="">اختر الإمارة</option>
                <option value="dubai">دبي</option>
                <option value="abudhabi">أبو ظبي</option>
                <option value="sharjah">الشارقة</option>
                <option value="ajman">عجمان</option>
                <option value="ummalquwain">أم القيوين</option>
                <option value="ras-al-khaimah">رأس الخيمة</option>
                <option value="fujairah">الفجيرة</option>
              </select>
              {errors.emirate && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.emirate}
                </p>
              )}
            </div>

            {/* Plate Code */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                رمز اللوحة *
              </label>
              <select
                name="plateCode"
                value={formData.plateCode}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.plateCode ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "rtl",
                }}
              >
                <option value="">اختر رمز اللوحة</option>
                <option value="A">أ</option>
                <option value="B">ب</option>
                <option value="C">ج</option>
                <option value="D">د</option>
                <option value="E">هـ</option>
                <option value="F">و</option>
              </select>
              {errors.plateCode && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.plateCode}
                </p>
              )}
            </div>

            {/* Plate Number */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                رقم اللوحة *
              </label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="12345"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.plateNumber ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "right",
                }}
              />
              {errors.plateNumber && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.plateNumber}
                </p>
              )}
            </div>
          </div>

          {/* Installment Data Section */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#008755", fontSize: "16px", fontWeight: 700, marginBottom: "15px" }}>
              بيانات التقسيط
            </h3>

            {/* Total Amount */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                المبلغ الإجمالي (درهم) - الحد الأدنى 3000 *
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="3000"
                min="3000"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.totalAmount ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "right",
                }}
              />
              {errors.totalAmount && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.totalAmount}
                </p>
              )}
            </div>

            {/* Bank */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                البنك *
              </label>
              <select
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.bank ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "rtl",
                }}
              >
                <option value="">اختر البنك</option>
                <option value="adib">بنك أبو ظبي الإسلامي</option>
                <option value="adcb">بنك أبو ظبي التجاري</option>
                <option value="fab">بنك الإمارات الأول</option>
                <option value="enbd">بنك الإمارات دبي الوطني</option>
                <option value="raka">بنك الراجحي</option>
                <option value="aib">بنك الإمارات الإسلامي</option>
              </select>
              {errors.bank && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.bank}
                </p>
              )}
            </div>

            {/* Duration */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                مدة التقسيط (بالأشهر) *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.duration ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  direction: "rtl",
                }}
              >
                <option value="">اختر مدة التقسيط</option>
                <option value="3">3 أشهر</option>
                <option value="6">6 أشهر</option>
                <option value="12">12 شهر</option>
                <option value="24">24 شهر</option>
                <option value="36">36 شهر</option>
              </select>
              {errors.duration && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                  {errors.duration}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              backgroundColor: "#008755",
              color: "white",
              border: "none",
              padding: "14px 20px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "16px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = "#006b45";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#008755";
            }}
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
          </button>
        </form>
      </div>
    </div>
  );
}
