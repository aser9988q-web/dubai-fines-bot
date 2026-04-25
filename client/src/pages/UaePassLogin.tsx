import React, { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function UaePassLogin() {
  const [, setLocation] = useLocation();
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [step, setStep] = useState<"login" | "otp" | "success">("login");
  const [emiratesId, setEmiratesId] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emiratesId.trim()) {
      setError(lang === "ar" ? "يرجى إدخال رقم الهوية الإماراتية" : "Please enter your Emirates ID");
      return;
    }

    if (!/^\d{3}-\d{4}-\d{7}-\d{1}$/.test(emiratesId)) {
      setError(lang === "ar" ? "صيغة الهوية غير صحيحة" : "Invalid Emirates ID format");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError(lang === "ar" ? "يرجى إدخال رمز التحقق" : "Please enter the OTP");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(lang === "ar" ? "رمز التحقق يجب أن يكون 6 أرقام" : "OTP must be 6 digits");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1500);
  };

  const handleContinue = () => {
    // Navigate back to installment form with UAE PASS verified flag
    localStorage.setItem("uaePassVerified", "true");
    const lang_code = lang === "ar" ? "ar" : "en";
    setLocation(`/installment-${lang_code}`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "20px", direction: isRTL ? "rtl" : "ltr" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px", textAlign: isRTL ? "right" : "left" }}>
          <button
            onClick={() => window.history.back()}
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
            {isRTL ? "← العودة" : "← Back"}
          </button>
          <h1 style={{ color: "#1f2937", fontSize: "28px", fontWeight: 800, margin: "0 0 10px 0" }}>
            {lang === "ar" ? "التحقق عبر UAE PASS" : "Verify with UAE PASS"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
            {lang === "ar" ? "تحقق من هويتك الإماراتية" : "Verify your Emirates ID"}
          </p>
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "60px", marginBottom: "10px" }}>🔐</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#008755" }}>
            {lang === "ar" ? "خدمة التحقق الآمنة" : "Secure Verification Service"}
          </div>
        </div>

        {/* Form Container */}
        <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {step === "login" && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                  {lang === "ar" ? "رقم الهوية الإماراتية *" : "Emirates ID *"}
                </label>
                <input
                  type="text"
                  value={emiratesId}
                  onChange={(e) => {
                    setEmiratesId(e.target.value);
                    setError("");
                  }}
                  placeholder={lang === "ar" ? "784-1234-1234567-1" : "784-1234-1234567-1"}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: error ? "2px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    direction: "ltr",
                    textAlign: isRTL ? "right" : "left",
                  }}
                />
                {error && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                    {error}
                  </p>
                )}
              </div>

              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "20px", textAlign: isRTL ? "right" : "left" }}>
                {lang === "ar"
                  ? "سيتم إرسال رمز تحقق إلى رقم الهاتف المسجل لديك"
                  : "A verification code will be sent to your registered phone number"}
              </p>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  backgroundColor: "#008755",
                  color: "white",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#006b45";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#008755";
                }}
              >
                {isLoading ? (lang === "ar" ? "جاري المعالجة..." : "Processing...") : (lang === "ar" ? "التالي" : "Next")}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit}>
              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 20px 0" }}>
                  {lang === "ar" ? "تم إرسال رمز التحقق إلى هاتفك" : "A verification code has been sent to your phone"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                  {lang === "ar" ? "رمز التحقق (6 أرقام) *" : "Verification Code (6 digits) *"}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder={lang === "ar" ? "000000" : "000000"}
                  maxLength={6}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: error ? "2px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
                    boxSizing: "border-box",
                    textAlign: "center",
                    letterSpacing: "4px",
                    fontWeight: 600,
                    direction: "ltr",
                  }}
                />
                {error && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", margin: "5px 0 0 0" }}>
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  backgroundColor: "#008755",
                  color: "white",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "all 0.3s ease",
                  marginBottom: "12px",
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#006b45";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#008755";
                }}
              >
                {isLoading ? (lang === "ar" ? "جاري التحقق..." : "Verifying...") : (lang === "ar" ? "تحقق" : "Verify")}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setOtp("");
                  setError("");
                }}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#008755",
                  border: "1px solid #008755",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0fdf4";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {lang === "ar" ? "تغيير الهوية" : "Change ID"}
              </button>
            </form>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "50px", marginBottom: "20px" }}>✅</div>
              <h2 style={{ color: "#008755", fontSize: "22px", fontWeight: 800, marginBottom: "10px" }}>
                {lang === "ar" ? "تم التحقق بنجاح!" : "Verification Successful!"}
              </h2>
              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "30px" }}>
                {lang === "ar"
                  ? "تم التحقق من هويتك بنجاح. يمكنك الآن متابعة طلب التقسيط."
                  : "Your identity has been verified successfully. You can now continue with your installment request."}
              </p>

              <button
                onClick={handleContinue}
                style={{
                  width: "100%",
                  backgroundColor: "#008755",
                  color: "white",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#006b45";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#008755";
                }}
              >
                {lang === "ar" ? "متابعة" : "Continue"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginTop: "20px" }}>
          {lang === "ar"
            ? "بيانات التحقق محمية وآمنة"
            : "Your verification data is protected and secure"}
        </p>
      </div>
    </div>
  );
}
