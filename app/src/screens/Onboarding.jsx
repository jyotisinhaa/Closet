import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Sidebar nav definition ────────────────────────────────────────────────────
const NAV = [
  {
    key: "onboarding",
    label: "Onboarding",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: "wardrobe",
    label: "Wardrobe",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    key: "tryon",
    label: "Try On",
    icon: (
      <svg
        width="15"
        height="15"
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
  },
  {
    key: "results",
    label: "Results",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    key: "wishlist",
    label: "Wishlist",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: "additem",
    label: "Add Item",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    key: "uploadphoto",
    label: "Upload Photo",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Profile",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "Settings",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  async function handleNext() {
    if (!photo) {
      setError("Please add a photo to continue.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("photo", photo.file);
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { profile_photo_url } = await res.json();
      const existing = JSON.parse(
        localStorage.getItem("closet_profile") || "{}",
      );
      localStorage.setItem(
        "closet_profile",
        JSON.stringify({ ...existing, profilePhotoUrl: profile_photo_url }),
      );
      navigate("/wardrobe");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{ display: "flex", minHeight: "100svh", background: "var(--ink)" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="ob-sidebar"
        style={{
          width: "200px",
          flexShrink: 0,
          background: "var(--ink)",
          padding: "32px 18px",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100svh",
          overflowY: "auto",
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: "20px",
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            letterSpacing: "-0.01em",
            color: "var(--paper)",
            marginBottom: "32px",
          }}
        >
          Clos
          <em
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--terracotta)",
            }}
          >
            et
          </em>
        </div>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            flex: 1,
          }}
        >
          {NAV.map((item) => {
            const active = item.key === "onboarding";
            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  cursor: "default",
                }}
              >
                <span
                  style={{
                    color: active ? "var(--paper)" : "rgba(251,248,241,0.3)",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--paper)" : "rgba(251,248,241,0.3)",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Log out */}
        <button
          onClick={() => navigate("/login")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 10px",
            borderRadius: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            marginTop: "12px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(251,248,241,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: "13px",
              color: "rgba(251,248,241,0.35)",
            }}
          >
            Log out
          </span>
        </button>
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="ob-mobile-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: "var(--ink)",
          padding: "16px 22px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: "18px",
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            color: "var(--paper)",
          }}
        >
          Clos
          <em
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--terracotta)",
            }}
          >
            et
          </em>
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(251,248,241,0.45)",
          }}
        >
          Onboarding
        </span>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          background: "var(--paper)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "clamp(72px, 8vw, 96px) clamp(24px, 6vw, 80px) 60px",
          minHeight: "100svh",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "460px" }}>
          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 4.5vw, 40px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "var(--ink)",
              marginBottom: "10px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            Let's get to know you
            <span
              style={{
                color: "var(--gold)",
                fontSize: "0.7em",
                lineHeight: 1.4,
              }}
            >
              ✦
            </span>
          </h1>

          {/* Italic sub */}
          <p
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "18px",
              color: "var(--ink)",
              marginBottom: "14px",
            }}
          >
            Show us you, once.
          </p>

          {/* Description */}
          <p
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: "14px",
              color: "var(--muted)",
              lineHeight: 1.7,
              maxWidth: "360px",
              marginBottom: "36px",
            }}
          >
            One clean full-body photo. We use it to render every try-on going
            forward.{" "}
            <strong style={{ color: "var(--ink-soft)", fontWeight: 500 }}>
              Your photo stays yours.
            </strong>
          </p>

          {/* Photo preview (if selected) */}
          {photo && (
            <div
              style={{
                marginBottom: "28px",
                width: "180px",
                aspectRatio: "3/4",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1.5px solid var(--line)",
                position: "relative",
              }}
            >
              <img
                src={photo.preview}
                alt="Your photo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={() => setPhoto(null)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(26,22,18,0.72)",
                  color: "var(--paper)",
                  border: "none",
                  borderRadius: "100px",
                  padding: "3px 10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "8px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Retake
              </button>
            </div>
          )}

          {/* CTA buttons */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <button
              onClick={() => cameraInputRef.current?.click()}
              style={btnDark}
            >
              <svg
                width="17"
                height="17"
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
              Take a Photo
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={btnOutline}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Upload from Camera Roll
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {/* Privacy notice */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
              marginTop: "20px",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: "2px" }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "12px",
                color: "var(--muted)",
                lineHeight: 1.55,
              }}
            >
              Your photo is private and secure. Only you can see it.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                color: "var(--terracotta)",
                letterSpacing: "0.05em",
                marginTop: "14px",
              }}
            >
              {error}
            </p>
          )}

          {/* Next button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: "36px",
            }}
          >
            <button
              onClick={handleNext}
              disabled={uploading}
              style={{
                background: "var(--olive)",
                color: "var(--paper)",
                border: "none",
                borderRadius: "100px",
                padding: "13px 28px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "opacity 0.15s",
              }}
            >
              {uploading ? (
                "Saving…"
              ) : (
                <>
                  Next
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const btnDark = {
  width: "100%",
  background: "var(--ink)",
  color: "var(--paper)",
  border: "none",
  borderRadius: "10px",
  padding: "16px 20px",
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "15px",
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
};

const btnOutline = {
  width: "100%",
  background: "var(--paper)",
  color: "var(--ink)",
  border: "1.5px solid var(--line)",
  borderRadius: "10px",
  padding: "15px 20px",
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "15px",
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
};
