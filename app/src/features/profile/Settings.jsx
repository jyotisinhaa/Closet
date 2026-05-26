import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiDelete, apiGet, apiPatch } from "../../api/client";
import { clearAll, getUser } from "../../lib/session";

// ── Shared styles ──────────────────────────────────────────────────────────
const CARD = {
  background: "white",
  border: "1px solid var(--line)",
  borderRadius: "12px",
  marginBottom: "20px",
  overflow: "hidden",
};

const CARD_TITLE = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 600,
  fontSize: "22px",
  color: "var(--ink)",
  marginBottom: "3px",
};

const CARD_SUBTITLE = {
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "12px",
  color: "var(--muted)",
};

const ROW_LABEL = {
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--ink)",
};

const ROW_HINT = {
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "11px",
  color: "var(--muted)",
  marginTop: "2px",
};

const BTN_OUTLINE = {
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "12px",
  color: "var(--ink)",
  background: "transparent",
  border: "1px solid var(--line)",
  borderRadius: "8px",
  padding: "7px 14px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const BTN_DANGER = {
  fontFamily: "'Inter Tight', sans-serif",
  fontSize: "12px",
  color: "#C0392B",
  background: "transparent",
  border: "1.5px solid rgba(192,57,43,0.45)",
  borderRadius: "8px",
  padding: "7px 16px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

function row(last = false) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: last ? "none" : "1px solid var(--line)",
    gap: "24px",
  };
}

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        background: on ? "var(--ink)" : "#D5D0C8",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: on ? "23px" : "3px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
          display: "block",
        }}
      />
    </button>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(getUser()?.email || "");
  const [currency, setCurrency] = useState("USD");
  const [wishlistReminders, setWishlistReminders] = useState(true);
  const [newFeatures, setNewFeatures] = useState(true);
  const [styleInsights, setStyleInsights] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Change-password state
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState({ text: "", ok: false });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    apiGet("/auth/me")
      .then((u) => {
        if (u?.email) setEmail(u.email);
      })
      .catch(() => {});
  }, []);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    setPwLoading(true);
    setPwMsg({ text: "", ok: false });
    try {
      await apiPatch("/auth/password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwMsg({ text: "Password updated.", ok: true });
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => {
        setShowPwForm(false);
        setPwMsg({ text: "", ok: false });
      }, 1500);
    } catch (err) {
      setPwMsg({
        text: err.message || "Failed to update password.",
        ok: false,
      });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleResetProfile() {
    if (
      !window.confirm(
        "Reset your style profile? Your wardrobe stays, but learned style inferences will be cleared.",
      )
    )
      return;
    await apiDelete("/profile/reset").catch(() => {});
  }

  async function handleDeleteWardrobe() {
    if (
      !window.confirm(
        "Permanently delete all wardrobe items, wishlist, and try-on history? Your account stays.",
      )
    )
      return;
    await apiDelete("/wardrobe/all").catch(() => {});
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm("Permanently delete your account? This cannot be undone.")
    )
      return;
    await apiDelete("/profile").catch(() => {});
    clearAll();
    navigate("/");
  }

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "var(--paper)",
        padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 56px)",
      }}
    >
      {/* ── Constrained content width ─────────────────────────────────────── */}
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* ── Page header ───────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: "clamp(30px, 4vw, 42px)",
              color: "var(--ink)",
              margin: "0 0 10px",
            }}
          >
            Settings
          </h2>
          <p
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: "13px",
              color: "var(--muted)",
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            Manage your account, notifications, and data. For style and identity
            details, see your{" "}
            <Link
              to="/profile"
              style={{
                color: "var(--terracotta)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Profile
            </Link>
            .
          </p>
          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: 0 }} />
        </div>

        {/* ── Account card ──────────────────────────────────────────────────── */}
        <div style={CARD}>
          <div
            style={{
              padding: "18px 24px 14px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div style={CARD_TITLE}>Account</div>
            <div style={CARD_SUBTITLE}>Login, language, and your data.</div>
          </div>

          {/* Email */}
          <div style={row()}>
            <div>
              <div style={ROW_LABEL}>Email</div>
              <div style={ROW_HINT}>Your sign-in email</div>
            </div>
            <input
              type="email"
              value={email}
              readOnly
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                color: "var(--ink)",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "7px 12px",
                outline: "none",
                width: "220px",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ borderBottom: "1px solid var(--line)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 24px",
                gap: "24px",
              }}
            >
              <div>
                <div style={ROW_LABEL}>Password</div>
                <div style={ROW_HINT}>Last changed 3 months ago</div>
              </div>
              <button
                style={BTN_OUTLINE}
                onClick={() => {
                  setShowPwForm((v) => !v);
                  setPwMsg({ text: "", ok: false });
                }}
              >
                {showPwForm ? "Cancel" : "Change password"}
              </button>
            </div>
            {showPwForm && (
              <form
                onSubmit={handleChangePassword}
                style={{
                  padding: "0 24px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    outline: "none",
                    background: "var(--paper)",
                    width: "260px",
                    maxWidth: "100%",
                  }}
                />
                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    outline: "none",
                    background: "var(--paper)",
                    width: "260px",
                    maxWidth: "100%",
                  }}
                />
                {pwMsg.text && (
                  <p
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "12px",
                      color: pwMsg.ok ? "var(--olive)" : "#C0392B",
                      margin: 0,
                    }}
                  >
                    {pwMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pwLoading}
                  style={{
                    ...BTN_OUTLINE,
                    background: "var(--ink)",
                    color: "white",
                    border: "none",
                    alignSelf: "flex-start",
                    opacity: pwLoading ? 0.6 : 1,
                  }}
                >
                  {pwLoading ? "Saving..." : "Save new password"}
                </button>
              </form>
            )}
          </div>

          {/* Language */}
          <div style={row()}>
            <div>
              <div style={ROW_LABEL}>Language</div>
              <div style={ROW_HINT}>Used across the app</div>
            </div>
            <select
              defaultValue="English (US)"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                color: "var(--ink)",
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "7px 12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option>English (US)</option>
              <option>Hindi</option>
              <option>French</option>
            </select>
          </div>

          {/* Currency */}
          <div style={row()}>
            <div>
              <div style={ROW_LABEL}>Currency</div>
              <div style={ROW_HINT}>For prices and totals</div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { code: "USD", label: "$USD" },
                { code: "EUR", label: "€EUR" },
                { code: "GBP", label: "£GBP" },
                { code: "INR", label: "₹INR" },
              ].map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setCurrency(code)}
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "12px",
                    padding: "5px 11px",
                    borderRadius: "20px",
                    border: "1px solid var(--line)",
                    background: currency === code ? "var(--ink)" : "transparent",
                    color: currency === code ? "white" : "var(--ink-soft)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <div style={row(true)}>
            <div>
              <div style={ROW_LABEL}>Export your data</div>
              <div style={ROW_HINT}>
                Download everything in your account as a ZIP
              </div>
            </div>
            <button style={BTN_OUTLINE}>↓ Export</button>
          </div>
        </div>

        {/* ── Notifications card ────────────────────────────────────────────── */}
        <div style={CARD}>
          <div
            style={{
              padding: "18px 24px 14px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div style={CARD_TITLE}>Notifications</div>
            <div style={CARD_SUBTITLE}>Decide when Closet should reach out.</div>
          </div>

          {[
            {
              label: "Wishlist reminders",
              hint: "Nudge you about items sitting for more than 7 days",
              value: wishlistReminders,
              set: setWishlistReminders,
            },
            {
              label: "New feature announcements",
              hint: "Be first to know when we ship new try-on features",
              value: newFeatures,
              set: setNewFeatures,
            },
            {
              label: "Style insights weekly",
              hint: "A short Sunday email about your week's looks",
              value: styleInsights,
              set: setStyleInsights,
            },
            {
              label: "Marketing emails",
              hint: "Promotional content from Closet",
              value: marketingEmails,
              set: setMarketingEmails,
              last: true,
            },
          ].map(({ label, hint, value, set, last }) => (
            <div key={label} style={row(last)}>
              <div>
                <div
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: value ? "var(--terracotta)" : "var(--ink)",
                    marginBottom: "2px",
                    transition: "color 0.2s",
                  }}
                >
                  {label}
                </div>
                <div style={ROW_HINT}>{hint}</div>
              </div>
              <Toggle on={value} onChange={set} />
            </div>
          ))}
        </div>

        {/* ── Danger zone card ──────────────────────────────────────────────── */}
        <div style={{ ...CARD, marginBottom: "48px" }}>
          <div
            style={{
              padding: "18px 24px 14px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div style={{ ...CARD_TITLE, color: "#C0392B" }}>Danger zone</div>
            <div style={CARD_SUBTITLE}>These actions can&apos;t be undone.</div>
          </div>

          <div style={row()}>
            <div>
              <div style={ROW_LABEL}>Reset your style profile</div>
              <div style={ROW_HINT}>
                Wipes Closet&apos;s learned persona, fit, and vibe inferences.
                We&apos;ll re-learn from your wardrobe.
              </div>
            </div>
            <button onClick={handleResetProfile} style={BTN_DANGER}>
              Reset profile
            </button>
          </div>

          <div style={row()}>
            <div>
              <div style={ROW_LABEL}>Delete all wardrobe items</div>
              <div style={ROW_HINT}>
                Permanently removes your wardrobe, wishlist, and try-on history.
                Your account stays.
              </div>
            </div>
            <button onClick={handleDeleteWardrobe} style={BTN_DANGER}>
              Delete wardrobe
            </button>
          </div>

          <div style={row(true)}>
            <div>
              <div style={ROW_LABEL}>Delete account</div>
              <div style={ROW_HINT}>
                Permanently delete everything. This cannot be reversed.
              </div>
            </div>
            <button onClick={handleDeleteAccount} style={BTN_DANGER}>
              Delete account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
