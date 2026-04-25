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

export default function InstallmentRequestEn() {
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
      newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.emiratesId.trim())
      newErrors.emiratesId = "Emirates ID is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.emirate) newErrors.emirate = "Emirate is required";
    if (!formData.plateCode) newErrors.plateCode = "Plate code is required";
    if (!formData.plateNumber.trim())
      newErrors.plateNumber = "Plate number is required";
    if (!formData.totalAmount.trim())
      newErrors.totalAmount = "Total amount is required";
    if (parseFloat(formData.totalAmount) < 3000)
      newErrors.totalAmount = "Amount must be at least AED 3,000";
    if (!formData.bank) newErrors.bank = "Bank is required";
    if (!formData.duration) newErrors.duration = "Duration is required";

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
      // TODO: Submit form data to backend
      console.log("Form data:", formData);
      // For now, just navigate to payment page
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
        <div style={{ marginBottom: "30px", textAlign: "left" }}>
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
            ← Back
          </button>
          <h1 style={{ color: "#1f2937", fontSize: "28px", fontWeight: 800, margin: "0 0 10px 0" }}>
            Installment Request Form
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
            Please fill in your personal and vehicle information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "15px", padding: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {/* Personal Data Section */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#008755", fontSize: "16px", fontWeight: 700, marginBottom: "15px" }}>
              Personal Information
            </h3>

            {/* Full Name */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.fullName ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
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
                Phone Number *
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
                Emirates ID *
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
                Email *
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
              Vehicle Information
            </h3>

            {/* Emirate */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                Emirate *
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
                }}
              >
                <option value="">Select Emirate</option>
                <option value="dubai">Dubai</option>
                <option value="abudhabi">Abu Dhabi</option>
                <option value="sharjah">Sharjah</option>
                <option value="ajman">Ajman</option>
                <option value="ummalquwain">Umm Al Quwain</option>
                <option value="ras-al-khaimah">Ras Al Khaimah</option>
                <option value="fujairah">Fujairah</option>
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
                Plate Code *
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
                }}
              >
                <option value="">Select Plate Code</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
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
                Plate Number *
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
              Installment Details
            </h3>

            {/* Total Amount */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                Total Amount (AED) - Minimum 3,000 *
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
                Bank *
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
                }}
              >
                <option value="">Select Bank</option>
                <option value="adib">Abu Dhabi Islamic Bank</option>
                <option value="adcb">Abu Dhabi Commercial Bank</option>
                <option value="fab">First Abu Dhabi Bank</option>
                <option value="enbd">Emirates NBD</option>
                <option value="raka">Al Rajhi Bank</option>
                <option value="aib">Islamic Bank of Asia</option>
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
                Installment Duration (Months) *
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
                }}
              >
                <option value="">Select Duration</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
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
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
