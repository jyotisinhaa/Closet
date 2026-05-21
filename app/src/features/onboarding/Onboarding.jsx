import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "./useOnboarding";

const BODY_TYPES = [
  {
    key: "hourglass", label: "Hourglass", desc: "Balanced shoulders & hips, defined waist",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor"/>
        <path d="M 25,18 C 16,22 7,24 7,26 C 4,36 10,48 20,56 C 12,62 4,66 7,68 L 7,78 L 23,78 L 23,118 L 37,118 L 37,78 L 53,78 L 53,68 C 56,66 48,62 40,56 C 50,48 56,36 53,26 C 53,24 44,22 35,18 Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "rectangle", label: "Rectangle", desc: "Shoulders, waist & hips similar width",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor"/>
        <path d="M 25,18 C 20,22 16,23 16,26 C 14,36 16,48 16,56 C 15,62 14,66 16,68 L 16,78 L 24,78 L 24,118 L 36,118 L 36,78 L 44,78 L 44,68 C 46,66 45,62 44,56 C 44,48 46,36 44,26 C 44,23 40,22 35,18 Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "pear", label: "Pear", desc: "Hips wider than shoulders",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor"/>
        <path d="M 26,18 C 22,22 20,23 20,26 C 18,36 18,48 18,56 C 14,62 6,66 7,68 L 7,78 L 23,78 L 23,118 L 37,118 L 37,78 L 53,78 L 53,68 C 54,66 46,62 42,56 C 42,48 42,36 40,26 C 40,23 38,22 34,18 Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "apple", label: "Apple", desc: "Shoulders wider, fuller midsection",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor"/>
        <path d="M 25,18 C 19,22 14,23 14,26 C 8,34 5,46 7,56 C 5,62 8,66 14,68 L 14,78 L 24,78 L 24,118 L 36,118 L 36,78 L 46,78 L 46,68 C 52,66 55,62 53,56 C 55,46 52,34 46,26 C 46,23 41,22 35,18 Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "inverted", label: "Inverted Triangle", desc: "Shoulders notably wider than hips",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor"/>
        <path d="M 25,18 C 15,22 5,23 5,26 C 4,36 12,48 18,56 C 16,62 18,66 22,68 L 22,78 L 27,78 L 27,118 L 33,118 L 33,78 L 38,78 L 38,68 C 42,66 44,62 42,56 C 48,48 56,36 55,26 C 55,23 45,22 35,18 Z" fill="currentColor"/>
      </svg>
    ),
  },
];

export default function Onboarding() {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef     = useRef(null);
  const streamRef    = useRef(null);

  const { savedProfile, isComplete, uploading, error, setError, submit, resetProfile } = useOnboarding();

  const [gender,      setGender]      = useState("");
  const [bodyType,    setBodyType]    = useState("");
  const [photo,       setPhoto]       = useState(null);
  const [hoveredBody, setHoveredBody] = useState("");
  const [showCamera,  setShowCamera]  = useState(false);

  if (isComplete) {
    const bodyLabel = BODY_TYPES.find(b => b.key === savedProfile.bodyType)?.label ?? savedProfile.bodyType;
    const bodySvg   = BODY_TYPES.find(b => b.key === savedProfile.bodyType)?.svg;

    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "var(--paper)", padding: "48px 32px",
        textAlign: "center",
      }}>

        {/* Decorative sparkles */}
        <div style={{ position: "relative", marginBottom: "28px" }}>
          <span style={{ position: "absolute", top: "-18px", left: "-24px", fontSize: "18px", color: "var(--gold)", opacity: 0.6 }}>✦</span>
          <span style={{ position: "absolute", top: "-8px",  right: "-28px", fontSize: "11px", color: "var(--terracotta)", opacity: 0.5 }}>✦</span>
          <span style={{ position: "absolute", bottom: "-12px", left: "-10px", fontSize: "9px", color: "var(--gold)", opacity: 0.4 }}>✦</span>

          {/* Check badge */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(91,106,63,0.15), rgba(91,106,63,0.05))",
            border: "1.5px solid rgba(91,106,63,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(91,106,63,0.15)",
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontWeight: 600,
          fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.03em",
          color: "var(--ink)", marginBottom: "10px", lineHeight: 1.1,
        }}>
          You&apos;re all set{" "}
          <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "var(--terracotta)" }}>✦</em>
        </h1>

        <p style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic",
          fontWeight: 300, fontSize: "18px", color: "var(--ink-soft)",
          marginBottom: "36px",
        }}>
          Your style profile is ready.
        </p>

        {/* Profile summary cards */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>

          {/* Photo card */}
          {savedProfile.profilePhotoUrl && (
            <div style={{
              width: "100px", borderRadius: "16px", overflow: "hidden",
              border: "1.5px solid var(--line)", aspectRatio: "3/4",
              boxShadow: "0 4px 20px rgba(26,22,18,0.1)",
            }}>
              <img src={savedProfile.profilePhotoUrl} alt="Your photo"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}

          {/* Info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>

            {/* Gender card */}
            <div style={{
              background: "white", border: "1.5px solid var(--line)", borderRadius: "14px",
              padding: "14px 20px", textAlign: "left", minWidth: "160px",
              boxShadow: "0 2px 12px rgba(26,22,18,0.05)",
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                Gender
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "20px", letterSpacing: "-0.01em", color: "var(--ink)" }}>
                {savedProfile.gender}
              </div>
            </div>

            {/* Body shape card */}
            <div style={{
              background: "white", border: "1.5px solid var(--line)", borderRadius: "14px",
              padding: "14px 20px", textAlign: "left",
              boxShadow: "0 2px 12px rgba(26,22,18,0.05)",
              display: "flex", alignItems: "center", gap: "14px",
            }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                  Body Shape
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "20px", letterSpacing: "-0.01em", color: "var(--ink)" }}>
                  {bodyLabel}
                </div>
              </div>
              {bodySvg && (
                <div style={{ color: "var(--terracotta)", opacity: 0.7, flexShrink: 0 }}>
                  {bodySvg}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/wardrobe")}
            style={{
              background: "var(--terracotta)", color: "white", border: "none",
              borderRadius: "100px", padding: "14px 32px", cursor: "pointer",
              fontFamily: "'Inter Tight', sans-serif", fontSize: "14px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 16px rgba(194,86,58,0.35)",
            }}
          >
            Go to My Wardrobe
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button
            onClick={resetProfile}
            style={{
              background: "none", color: "var(--muted)", border: "1.5px solid var(--line)",
              borderRadius: "100px", padding: "14px 24px", cursor: "pointer",
              fontFamily: "'Inter Tight', sans-serif", fontSize: "14px", fontWeight: 500,
            }}
          >
            Redo setup
          </button>
        </div>

      </div>
    );
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError("");
    setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  async function openCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch {
      setError("Camera access denied. Please allow camera permission or upload a photo instead.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      setPhoto({ file, preview: URL.createObjectURL(blob) });
      closeCamera();
    }, "image/jpeg", 0.92);
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }

  return (
    <>
    <div
      style={{
        flex: 1, background: "var(--paper)",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: "clamp(40px, 6vw, 72px) clamp(24px, 6vw, 80px) 60px",
        overflowY: "auto",
      }}
    >
        <div style={{ width: "100%", maxWidth: "540px" }}>

          {/* Heading */}
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--ink)", marginBottom: "8px", textAlign: "center" }}>
            Let&apos;s get to know you <span style={{ color: "var(--gold)", fontSize: "0.7em" }}>✦</span>
          </h1>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 300, fontSize: "17px", color: "var(--ink-soft)", marginBottom: "20px", textAlign: "center" }}>
            Just a few things so we can style you perfectly.
          </p>
          <div style={{ height: "1px", background: "var(--line)", margin: "0 0 40px" }} />

          {/* Gender */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={sectionHeader}>Gender</h3>
            <p style={sectionSub}>Helps us show the most relevant clothing fits</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["Female", "Male", "Non-binary", "Prefer not to say"].map((opt) => (
                <button key={opt} type="button" onClick={() => setGender(opt === gender ? "" : opt)} style={{
                  padding: "10px 20px", borderRadius: "100px", cursor: "pointer",
                  border: gender === opt ? "1.5px solid var(--terracotta)" : "1.5px solid var(--line)",
                  background: gender === opt ? "rgba(194,86,58,0.07)" : "white",
                  color: gender === opt ? "var(--terracotta)" : "var(--ink-soft)",
                  fontFamily: "'Inter Tight', sans-serif", fontSize: "13px",
                  fontWeight: gender === opt ? 600 : 400, transition: "all 0.15s",
                }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Body type */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={sectionHeader}>Body Shape</h3>
            <p style={sectionSub}>So we can suggest the best cuts and silhouettes for you</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {BODY_TYPES.map((b) => {
                const sel     = bodyType === b.key;
                const hovered = hoveredBody === b.key && !sel;
                return (
                  <button
                    key={b.key} type="button"
                    onClick={() => setBodyType(sel ? "" : b.key)}
                    onMouseEnter={() => setHoveredBody(b.key)}
                    onMouseLeave={() => setHoveredBody("")}
                    style={{
                      flex: "1 1 calc(33% - 8px)", minWidth: "110px",
                      padding: "16px 12px 14px", borderRadius: "14px", textAlign: "center",
                      border: sel ? "1.5px solid var(--terracotta)" : hovered ? "1.5px solid rgba(194,86,58,0.4)" : "1.5px solid var(--line)",
                      background: sel ? "rgba(194,86,58,0.06)" : hovered ? "rgba(194,86,58,0.03)" : "white",
                      cursor: "pointer", transition: "all 0.18s ease",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                      transform: hovered ? "translateY(-2px)" : "none",
                      boxShadow: hovered ? "0 4px 16px rgba(194,86,58,0.1)" : "none",
                    }}
                  >
                    <div style={{ color: sel ? "var(--terracotta)" : hovered ? "rgba(194,86,58,0.7)" : "var(--ink-soft)", opacity: sel ? 1 : hovered ? 0.85 : 0.55, transition: "all 0.18s ease" }}>
                      {b.svg}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: "13px", fontWeight: 700, color: sel ? "var(--terracotta)" : hovered ? "var(--ink)" : "var(--ink)", marginBottom: "3px" }}>
                        {b.label}
                      </div>
                      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: "10px", color: "var(--muted)", lineHeight: 1.4 }}>
                        {b.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo */}
          <div style={{ marginBottom: "36px" }}>
            <h3 style={sectionHeader}>Your Photo</h3>
            <p style={sectionSub}>A full-body shot works best — we use it to render every try-on</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {photo && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: "rgba(91,106,63,0.08)", border: "1.5px solid rgba(91,106,63,0.2)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: "13px", color: "var(--olive-deep)", fontWeight: 500, flex: 1 }}>Photo selected</span>
                  <button onClick={() => setPhoto(null)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter Tight', sans-serif", fontSize: "12px", color: "var(--muted)", padding: 0 }}>Remove</button>
                </div>
              )}
              <button onClick={openCamera} style={btnDark}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                Take a Photo
              </button>
              <button onClick={() => fileInputRef.current?.click()} style={btnOutline}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload from Gallery
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: "11px", color: "var(--muted)" }}>Private — only you can see it</span>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--terracotta)", letterSpacing: "0.05em", marginBottom: "16px" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button onClick={() => submit({ photo, gender, bodyType })} disabled={uploading} style={{
            width: "100%", background: "var(--terracotta)", color: "var(--paper)", border: "none",
            borderRadius: "12px", padding: "16px",
            fontFamily: "'Inter Tight', sans-serif", fontSize: "15px", fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            transition: "opacity 0.15s",
          }}>
            {uploading ? "Setting up your wardrobe…" : (
              <>
                Set up my wardrobe
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>

        </div>
    </div>

    {/* ── Camera modal ── */}

    {showCamera && (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
        zIndex: 200, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "24px",
        padding: "24px",
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "16px", background: "#111", display: "block" }}
        />
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={capturePhoto} style={{
            background: "var(--terracotta)", color: "white", border: "none",
            borderRadius: "100px", padding: "14px 32px",
            fontFamily: "'Inter Tight', sans-serif", fontSize: "15px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Capture
          </button>
          <button onClick={closeCamera} style={{
            background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "100px", padding: "14px 28px",
            fontFamily: "'Inter Tight', sans-serif", fontSize: "15px", fontWeight: 500, cursor: "pointer",
          }}>
            Cancel
          </button>
        </div>
      </div>
    )}
    </>
  );
}

const sectionHeader = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 500,
  fontSize: "20px",
  letterSpacing: "-0.01em",
  color: "var(--ink)",
  marginBottom: "4px",
};

const sectionSub = {
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "13px",
  color: "var(--muted)",
  marginBottom: "16px",
};

const btnDark = {
  background: "var(--ink)", color: "var(--paper)", border: "none",
  borderRadius: "10px", padding: "13px 18px",
  fontFamily: "'Inter Tight', sans-serif", fontSize: "14px", fontWeight: 500,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
};

const btnOutline = {
  background: "white", color: "var(--ink)", border: "1.5px solid var(--line)",
  borderRadius: "10px", padding: "12px 18px",
  fontFamily: "'Inter Tight', sans-serif", fontSize: "14px", fontWeight: 500,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
};
