import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginHero from "../../assets/login-hero.png";
import { useAuth } from "./useAuth";

const FEATURES = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: "AI Virtual Try-On",
    desc: "See any outfit on your own body before buying.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Smart Outfit Styling",
    desc: "Outfits curated daily to your taste and shape.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Daily Outfit Suggestions",
    desc: "Wake up to a ready-made outfit every morning.",
  },
];

const inputStyle = {
  width: "100%",
  border: "1.5px solid var(--line)",
  borderRadius: "10px",
  padding: "13px 14px",
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "14px",
  background: "white",
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
};

export default function Login() {
  const navigate = useNavigate();
  const { error, setError, loading, submit } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    submit({ isSignUp, name, email, password });
  }

  function switchMode() {
    setIsSignUp((v) => !v);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100svh",
        overflow: "hidden",
        background: "var(--cream)",
      }}
    >
      {/* ═══════════════════════ LEFT PANEL ═══════════════════════ */}
      <div
        className="login-panel"
        style={{
          width: "80%",
          flexShrink: 0,
          background:
            "linear-gradient(150deg, #FAF6F0 0%, #EEE5D5 55%, #E8DDD0 100%)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Full-height image — absolute, right 48%, behind everything */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "48%",
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <img
            src={loginHero}
            alt="Wardrobe"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        </div>

        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 32px",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "9px",
                background: "var(--terracotta)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h1.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontSize: "22px",
                  letterSpacing: "0.07em",
                  color: "var(--ink)",
                  lineHeight: 1,
                }}
              >
                CLOSET
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginTop: "4px",
                }}
              >
                AI Wardrobe
              </div>
            </div>
          </div>
        </div>

        {/* ── Main area: text only (image is absolutely positioned behind) ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Text column */}
          <div
            style={{
              width: "52%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: "140px 24px 24px 80px",
            }}
          >
            {/* Tag pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                border: "1px solid rgba(194,86,58,0.25)",
                borderRadius: "100px",
                padding: "7px 18px",
                background: "rgba(194,86,58,0.07)",
                marginBottom: "20px",
                width: "fit-content",
              }}
            >
              <span style={{ color: "var(--terracotta)", fontSize: "13px" }}>
                &#9733;
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--terracotta)",
                }}
              >
                AI-Powered Style Platform
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "clamp(38px, 4vw, 64px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "var(--ink)",
                marginBottom: "16px",
              }}
            >
              Dress smarter,
              <br />
              <span style={{ color: "var(--terracotta)" }}>
                every single day.
              </span>
            </h1>

            {/* Body */}
            <p
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--ink-soft)",
                lineHeight: 1.6,
                marginBottom: "28px",
                maxWidth: "520px",
                whiteSpace: "nowrap",
              }}
            >
              Upload your wardrobe once. Closet AI builds outfits, suggests what
              to wear,
              <br />
              and lets you virtually try on new looks before you buy.
            </p>

            {/* Feature cards — 3 in a row */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(194,86,58,0.12)",
                    borderRadius: "14px",
                    padding: "16px 14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "9px",
                    boxShadow: "0 2px 12px rgba(194,86,58,0.07)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background:
                        "linear-gradient(135deg, rgba(194,86,58,0.18), rgba(194,86,58,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--terracotta)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontWeight: 800,
                      fontSize: "15px",
                      color: "var(--ink)",
                      lineHeight: 1.25,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "13px",
                      color: "var(--ink-soft)",
                      lineHeight: 1.55,
                      fontWeight: 500,
                    }}
                  >
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits — 4 in a row */}
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              {[
                {
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  label: "Save Time",
                  desc: "Plan in seconds",
                },
                {
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ),
                  label: "Look Better",
                  desc: "Curated for you",
                },
                {
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  ),
                  label: "Shop Smarter",
                  desc: "AI picks",
                },
                {
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ),
                  label: "Feel Confident",
                  desc: "Every day",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    borderRadius: "14px",
                    padding: "14px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "center",
                    boxShadow: "0 1px 8px rgba(194,86,58,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, rgba(194,86,58,0.15), rgba(194,86,58,0.05))",
                      border: "1px solid rgba(194,86,58,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--terracotta)",
                    }}
                  >
                    {b.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontWeight: 700,
                      fontSize: "11px",
                      color: "var(--ink)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {b.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "9px",
                      color: "var(--muted)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {b.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ RIGHT PANEL ═══════════════════════ */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(16px, 2vw, 28px) clamp(24px, 5vw, 60px)",
          background: "var(--paper)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "56px",
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              {isSignUp ? "Create account" : "Welcome back"}
            </h2>
            <p
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              {isSignUp
                ? "Sign up to start your wardrobe"
                : "Log in to continue to your wardrobe"}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Name — sign up only */}
            {isSignUp && (
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    display: "flex",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name (optional)"
                  autoComplete="name"
                  style={{ ...inputStyle, paddingLeft: "38px" }}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted)",
                  display: "flex",
                  pointerEvents: "none",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                style={{ ...inputStyle, paddingLeft: "38px" }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    display: "flex",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  style={{
                    ...inputStyle,
                    paddingLeft: "38px",
                    paddingRight: "42px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  {showPw ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ textAlign: "right", marginTop: "5px" }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "12px",
                    color: "var(--terracotta)",
                    fontWeight: 500,
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  color: "var(--terracotta)",
                  letterSpacing: "0.05em",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            {/* Submit — terracotta */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "var(--terracotta)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "14px",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "2px",
                letterSpacing: "0.01em",
              }}
            >
              {loading
                ? isSignUp
                  ? "Creating account..."
                  : "Logging in..."
                : isSignUp
                  ? "Sign up"
                  : "Log in"}
            </button>
          </form>

          {/* Sign up */}
          <p
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: "13px",
              color: "var(--muted)",
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--terracotta)",
                padding: 0,
              }}
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
