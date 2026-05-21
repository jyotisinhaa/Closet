import { useNavigate, useLocation } from "react-router-dom";
import { NAV } from "./nav";

export default function Sidebar({ collapsed, setCollapsed, openSections, toggleSection }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey =
    NAV.find((n) => location.pathname === n.path)?.key ??
    NAV.find((n) => n.path !== '/' && location.pathname.startsWith(n.path))?.key ??
    "wardrobe";

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "240px",
        flexShrink: 0,
        background: "#F7F4EE",
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        overflow: "hidden",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Brand row */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "24px 20px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: "18px",
                fontVariationSettings: '"SOFT" 100, "WONK" 1',
                letterSpacing: "-0.02em",
                lineHeight: 1,
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
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "8px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              AI Stylist
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "var(--cream-deep)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            color: "var(--ink-soft)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {collapsed ? (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            ) : (
              <>
                <line x1="18" y1="6" x2="6" y2="6" />
                <line x1="18" y1="12" x2="6" y2="12" />
                <line x1="18" y1="18" x2="6" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "12px 0" : "12px 0",
        }}
      >
        {NAV.map((item) => {
          const isActive = activeKey === item.key;
          const isOpen = openSections[item.key];

          return (
            <div key={item.key}>
              {/* Section row */}
              <div
                onClick={() => {
                  navigate(item.path);
                  if (!collapsed) toggleSection(item.key);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: collapsed ? "10px 0" : "10px 16px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  cursor: "pointer",
                  background: isActive ? "rgba(194,86,58,0.07)" : "transparent",
                  borderLeft:
                    isActive && !collapsed
                      ? "2px solid var(--terracotta)"
                      : "2px solid transparent",
                  transition: "background 0.15s",
                  userSelect: "none",
                }}
              >
                {/* Number */}
                {!collapsed && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "8px",
                      letterSpacing: "0.15em",
                      color: isActive ? "var(--terracotta)" : "var(--muted)",
                      flexShrink: 0,
                      width: "20px",
                    }}
                  >
                    {item.num}
                  </span>
                )}

                {/* Icon */}
                <span
                  style={{
                    color: isActive ? "var(--terracotta)" : "var(--ink-soft)",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>

                {/* Label */}
                {!collapsed && (
                  <span
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "var(--ink)" : "var(--ink-soft)",
                      flex: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {/* Chevron */}
                {!collapsed && item.sub?.length > 0 && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>

              {/* Sub-items */}
              {!collapsed &&
                isOpen &&
                item.sub?.map((sub) => (
                  <div
                    key={sub}
                    style={{
                      padding: "6px 16px 6px 48px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "var(--line)",
                        flexShrink: 0,
                      }}
                    />
                    {sub}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* Bottom: Settings */}
      {!collapsed && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--line)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "8px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "4px",
            }}
          >
            v1.0 · Hackathon 2026
          </div>
        </div>
      )}
    </aside>
  );
}
