import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "./useProfile";
import { apiGet, apiPatch, apiUpload } from "../../api/client";
import { getProfile, setProfile } from "../../lib/session";
import { BODY_TYPES, GENDERS } from "../../lib/profileConstants.jsx";

const STYLE_LABELS = {
  casual: "Casual",
  formal: "Formal",
  minimalist: "Minimalist",
  bohemian: "Bohemian",
  streetwear: "Street",
  romantic: "Romantic",
  sporty: "Sporty",
  classic: "Classic",
};

const PALETTE_COLORS = {
  warm: ["#C9A961", "#C2563A", "#9A3E26", "#EBE3D4", "#D4C4A0"],
  cool: ["#8C8273", "#9BA3A8", "#5B6A7A", "#D0D5DA", "#EFF1F3"],
  earthy: ["#5B6A3F", "#3F4B2A", "#8B7355", "#A0895A", "#D4C4A0"],
  mono: ["#1A1612", "#3A322A", "#8C8273", "#D4CBB8", "#FBF8F1"],
  bold: ["#E63946", "#4361EE", "#2DC653", "#FF9800", "#9B59B6"],
};

const PALETTE_LABELS = {
  warm: "Warm neutrals",
  cool: "Cool neutrals",
  earthy: "Earthy greens",
  mono: "Monochrome",
  bold: "Bold & bright",
};

const BODY_LABELS = {
  hourglass: "Hourglass",
  pear: "Pear",
  apple: "Apple",
  rectangle: "Rectangle",
  inverted: "Inverted Triangle",
};

// Radar chart axes map to style preference keys
const RADAR_AXES = [
  { label: "Casual", keys: ["casual", "sporty"] },
  { label: "Formal", keys: ["formal", "classic"] },
  { label: "Creative", keys: ["bohemian", "romantic"] },
  { label: "Classic", keys: ["classic", "minimalist"] },
  { label: "Sporty", keys: ["sporty", "streetwear"] },
];

function RadarChart({ prefs = [] }) {
  const S = 200,
    cx = 100,
    cy = 105,
    maxR = 68;

  const scores = RADAR_AXES.map((a) => {
    if (prefs.length === 0) return 45;
    const hit = a.keys.filter((k) => prefs.includes(k)).length;
    return hit > 0 ? 72 + hit * 6 : 22;
  });

  const angles = RADAR_AXES.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5);

  function pt(angle, value, r = maxR) {
    const rv = (value / 100) * r;
    return [cx + rv * Math.cos(angle), cy + rv * Math.sin(angle)];
  }

  const scorePoints = angles.map((a, i) => pt(a, scores[i]));

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      style={{ overflow: "visible" }}
    >
      {/* Grid rings */}
      {[30, 60, 100].map((pct) => (
        <polygon
          key={pct}
          points={angles.map((a) => pt(a, pct).join(",")).join(" ")}
          fill="none"
          stroke="var(--line)"
          strokeWidth="0.75"
        />
      ))}
      {/* Axis lines */}
      {angles.map((a, i) => {
        const [x, y] = pt(a, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--line)"
            strokeWidth="0.75"
          />
        );
      })}
      {/* Score fill */}
      <polygon
        points={scorePoints.map((p) => p.join(",")).join(" ")}
        fill="rgba(91,106,63,0.2)"
        stroke="var(--olive)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Dots on score */}
      {scorePoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--olive)" />
      ))}
      {/* Labels */}
      {RADAR_AXES.map(({ label }, i) => {
        const labelR = maxR + 17;
        const [x, y] = [
          cx + labelR * Math.cos(angles[i]),
          cy + labelR * Math.sin(angles[i]),
        ];
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8.5"
            fill="var(--ink-soft)"
            fontFamily="'JetBrains Mono', monospace"
            style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function getStyleTip(p) {
  const prefs = p.stylePrefs || [];
  if (!prefs.length)
    return "Complete your style profile to receive personalised tips on building a wardrobe that truly works for you.";
  if (prefs.includes("minimalist") && prefs.includes("casual"))
    return '"Your minimalist-casual profile thrives on quality basics. Invest in a few well-cut neutral pieces — they will carry 80% of your wardrobe without effort."';
  if (prefs.includes("formal") && prefs.includes("casual"))
    return '"You bridge formal and casual naturally. A well-fitted blazer in a neutral tone is your most versatile single purchase."';
  if (prefs.includes("bohemian") || prefs.includes("romantic"))
    return '"Your expressive style loves texture and movement. Layer patterns at different scales — one bold, one subtle — to add depth without chaos."';
  if (prefs.includes("minimalist"))
    return '"Your clean aesthetic is powerful. One unexpected texture each season keeps minimalism from feeling flat."';
  if (prefs.includes("sporty") || prefs.includes("streetwear"))
    return '"The best street looks nail contrast — pair an oversized piece with something fitted. Proportion is everything."';
  return '"A great wardrobe is one you dress from without thinking. Keep editing — the pieces that stay are the ones that truly belong."';
}

function styleScore(prefs) {
  if (!prefs?.length) return null;
  return Math.min(58 + prefs.length * 7, 94);
}

export default function Profile() {
  const navigate = useNavigate();
  const { profile, wardrobeCount } = useProfile();

  const p = profile || {};
  const colors = PALETTE_COLORS[p.colorPalette] || null;
  const score = styleScore(p.stylePrefs);

  // ── Edit-mode state ───────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [dbName, setDbName] = useState("");
  const [gender, setGender] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [sizeTops, setSizeTops] = useState("");
  const [sizeBottoms, setSizeBottoms] = useState("");
  const [sizeShoes, setSizeShoes] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiGet("/profile")
      .then((data) => {
        if (data) {
          setDbName(data.name || "");
          setGender(data.gender || "");
          setBodyType(data.body_type || "");
          setHeightFt(data.height_ft || "");
          setHeightCm(data.height_cm || "");
          setSizeTops(data.size_tops || "");
          setSizeBottoms(data.size_bottoms || "");
          setSizeShoes(data.size_shoes || "");
          setPhotoUrl(data.profile_photo_url || null);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await apiPatch("/profile", {
        name: dbName,
        gender,
        bodyType,
        heightFt,
        heightCm,
        sizeTops,
        sizeBottoms,
        sizeShoes,
      });
      const sess = getProfile() || {};
      setProfile({ ...sess, gender, bodyType });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setEditing(false);
      }, 1500);
    } catch (_) {
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const res = await apiUpload("/profile/photo", fd);
      setPhotoUrl(res.profile_photo_url);
      const sess = getProfile() || {};
      setProfile({ ...sess, profile_photo_url: res.profile_photo_url });
    } catch (_) {
    } finally {
      setPhotoUploading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--paper)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 22px 12px",
          borderBottom: "1px solid var(--line)",
          background: "rgba(251,248,241,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "22px",
            color: "var(--ink)",
          }}
        >
          <em style={{ fontFamily: "'Instrument Serif', serif" }}>Me</em>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            background: editing ? "var(--ink)" : "var(--cream-deep)",
            border: "1px solid var(--line)",
            borderRadius: "100px",
            padding: "6px 14px",
            cursor: "pointer",
            color: editing ? "var(--paper)" : "var(--ink)",
          }}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "0 22px 32px",
          }}
        >
          {/* ── Hero: photo + name + swatches ── */}
          <div
            style={{
              display: "flex",
              gap: "18px",
              padding: "22px 0 22px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            {/* Photo */}
            <div
              style={{
                width: "100px",
                flexShrink: 0,
                aspectRatio: "3/4",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid var(--line)",
                background: "var(--cream-deep)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {photoUrl || p.profilePhotoUrl ? (
                <img
                  src={photoUrl || p.profilePhotoUrl}
                  alt={dbName || p.name || "Profile"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "40px",
                    fontStyle: "italic",
                    color: "var(--muted)",
                  }}
                >
                  {(dbName || p.name || "U")[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info column */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div>
                <div style={monoLabel}>Your profile</div>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 300,
                    fontSize: "clamp(20px, 4vw, 26px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    marginTop: "4px",
                  }}
                >
                  {dbName || p.name ? (
                    <>
                      Hello,{" "}
                      <em
                        style={{
                          fontFamily: "'Instrument Serif', serif",
                          fontStyle: "italic",
                          color: "var(--terracotta)",
                        }}
                      >
                        {dbName || p.name}
                      </em>
                    </>
                  ) : (
                    <span
                      style={{
                        color: "var(--muted)",
                        fontStyle: "italic",
                        fontSize: "16px",
                      }}
                    >
                      No profile yet
                    </span>
                  )}
                </div>
              </div>

              {/* Color swatches */}
              {colors && (
                <div>
                  <div style={{ ...monoLabel, marginBottom: "6px" }}>
                    My palette
                  </div>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {colors.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: c,
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div style={{ display: "flex", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: "22px",
                      fontWeight: 400,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {wardrobeCount ?? "—"}
                  </div>
                  <div style={monoLabel}>items</div>
                </div>
                {score && (
                  <div>
                    <div
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "22px",
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        color: "var(--olive)",
                      }}
                    >
                      {score}
                    </div>
                    <div style={monoLabel}>style score</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Edit form ── */}
          {editing && (
            <div
              style={{
                padding: "20px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ ...monoLabel, marginBottom: "16px" }}>
                EDIT PROFILE
              </div>

              {/* Photo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--line)",
                    background: "var(--cream-deep)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {photoUrl || p.profilePhotoUrl ? (
                    <img
                      src={photoUrl || p.profilePhotoUrl}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--muted)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid var(--terracotta)",
                      background: "white",
                      color: "var(--terracotta)",
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: photoUploading ? "wait" : "pointer",
                    }}
                  >
                    {photoUploading ? "Uploading…" : "Change photo"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    ...monoLabel,
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Name
                </label>
                <input
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1.5px solid var(--line)",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    color: "var(--ink)",
                    background: "white",
                    outline: "none",
                  }}
                />
              </div>

              {/* Gender */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    ...monoLabel,
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Gender
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(gender === g ? "" : g)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "100px",
                        border:
                          gender === g
                            ? "1.5px solid var(--terracotta)"
                            : "1.5px solid var(--line)",
                        background:
                          gender === g ? "rgba(194,86,58,0.07)" : "white",
                        color:
                          gender === g
                            ? "var(--terracotta)"
                            : "var(--ink-soft)",
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: "13px",
                        fontWeight: gender === g ? 600 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body type */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    ...monoLabel,
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Body type
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {BODY_TYPES.map((bt) => {
                    const active = bodyType === bt.key;
                    return (
                      <button
                        key={bt.key}
                        type="button"
                        title={bt.desc}
                        onClick={() =>
                          setBodyType(bodyType === bt.key ? "" : bt.key)
                        }
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: active
                            ? "2px solid var(--terracotta)"
                            : "1.5px solid var(--line)",
                          background: active ? "rgba(194,86,58,0.07)" : "white",
                          color: active
                            ? "var(--terracotta)"
                            : "var(--ink-soft)",
                          cursor: "pointer",
                          minWidth: "58px",
                        }}
                      >
                        <span style={{ opacity: active ? 1 : 0.5 }}>
                          {bt.svg}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: "11px",
                            fontWeight: active ? 600 : 400,
                          }}
                        >
                          {bt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Height */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    ...monoLabel,
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Height
                </label>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder={`5'5"`}
                    style={{
                      width: "80px",
                      border: "1.5px solid var(--line)",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "13px",
                      color: "var(--ink)",
                      background: "white",
                      outline: "none",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "12px",
                      color: "var(--muted)",
                    }}
                  >
                    or
                  </span>
                  <input
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="165 cm"
                    style={{
                      width: "80px",
                      border: "1.5px solid var(--line)",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "13px",
                      color: "var(--ink)",
                      background: "white",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Sizes */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    ...monoLabel,
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Sizes
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[
                    { label: "Tops", val: sizeTops, set: setSizeTops, ph: "M" },
                    {
                      label: "Bottoms",
                      val: sizeBottoms,
                      set: setSizeBottoms,
                      ph: "28",
                    },
                    {
                      label: "Shoes",
                      val: sizeShoes,
                      set: setSizeShoes,
                      ph: "8",
                    },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label} style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Inter Tight', sans-serif",
                          fontSize: "11px",
                          color: "var(--muted)",
                          marginBottom: "4px",
                        }}
                      >
                        {label}
                      </div>
                      <input
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        placeholder={ph}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          border: "1.5px solid var(--line)",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          fontFamily: "'Inter Tight', sans-serif",
                          fontSize: "13px",
                          color: "var(--ink)",
                          background: "white",
                          outline: "none",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--line)",
                    background: "white",
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    color: "var(--ink-soft)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: saved ? "#5B6A3F" : "var(--ink)",
                    color: "white",
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: saving ? "wait" : "pointer",
                  }}
                >
                  {saved ? "Saved ✓" : saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* ── My Style ── */}
          {p.stylePrefs?.length > 0 && (
            <Section label="My Style">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {p.stylePrefs.map((k) => (
                  <span
                    key={k}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "6px 12px",
                      borderRadius: "100px",
                      background: "var(--ink)",
                      color: "var(--paper)",
                    }}
                  >
                    {STYLE_LABELS[k] || k}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* ── Body Analysis ── */}
          <Section label="Body Analysis">
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
            >
              <div style={{ flexShrink: 0 }}>
                <RadarChart prefs={p.stylePrefs || []} />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  paddingTop: "8px",
                }}
              >
                {/* Body type */}
                {p.bodyType && (
                  <div
                    style={{
                      background: "var(--cream)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                    }}
                  >
                    <div style={monoLabel}>Body shape</div>
                    <div
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontStyle: "italic",
                        fontSize: "17px",
                        marginTop: "4px",
                      }}
                    >
                      {BODY_LABELS[p.bodyType] || p.bodyType}
                    </div>
                  </div>
                )}
                {/* Style score */}
                {score && (
                  <div
                    style={{
                      background: "var(--cream)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      borderLeft: "3px solid var(--olive)",
                    }}
                  >
                    <div style={{ ...monoLabel, color: "var(--olive)" }}>
                      Style score
                    </div>
                    <div
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "32px",
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        marginTop: "4px",
                      }}
                    >
                      {score}
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--muted)",
                          fontWeight: 300,
                        }}
                      >
                        /100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ── Style Tip ── */}
          <Section label="Style Tip">
            <div
              style={{
                background: "var(--cream-deep)",
                borderRadius: "12px",
                padding: "16px 18px",
                borderLeft: "3px solid var(--terracotta)",
              }}
            >
              <div
                style={{
                  ...monoLabel,
                  color: "var(--terracotta)",
                  marginBottom: "8px",
                }}
              >
                ★ Your tip
              </div>
              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "15px",
                  lineHeight: 1.55,
                  color: "var(--ink-soft)",
                }}
              >
                {getStyleTip(p)}
              </p>
            </div>
          </Section>

          {!profile && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "64px",
                  fontStyle: "italic",
                  color: "var(--line)",
                  marginBottom: "16px",
                }}
              >
                C.
              </div>
              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: "var(--muted)",
                  marginBottom: "24px",
                }}
              >
                You haven't set up your profile yet.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                style={{
                  background: "var(--ink)",
                  color: "var(--paper)",
                  border: "none",
                  borderRadius: "100px",
                  padding: "14px 28px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Set up profile →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ padding: "20px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ ...monoLabel, marginBottom: "12px" }}>{label}</div>
      {children}
    </div>
  );
}

const monoLabel = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "9px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--muted)",
};
