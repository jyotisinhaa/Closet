import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Wardrobe from "./screens/Wardrobe";
import TryOn from "./screens/TryOn";
import TryOnResult from "./screens/TryOnResult";
import Profile from "./screens/Profile";
import Home from "./screens/Home";

const NAV = [
  {
    num: "",
    key: "onboarding",
    label: "Onboarding",
    path: "/onboarding",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    sub: [],
  },
  {
    num: "",
    key: "wardrobe",
    label: "My Wardrobe",
    path: "/wardrobe",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    sub: [],
  },
  {
    num: "",
    key: "tryon",
    label: "Try On",
    path: "/tryon",
    icon: (
      <svg
        width="16"
        height="16"
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
    sub: [],
  },
  {
    num: "",
    key: "results",
    label: "Results",
    path: "/tryon/result",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    sub: [],
  },
  {
    num: "04",
    key: "wishlist",
    label: "Wishlist",
    path: "/wishlist",
    icon: (
      <svg
        width="16"
        height="16"
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
    sub: ["Saved items", "Bought"],
  },
  {
    num: "05",
    key: "profile",
    label: "My Profile",
    path: "/profile",
    icon: (
      <svg
        width="16"
        height="16"
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
    sub: ["Style analysis", "Body type", "Settings"],
  },
];

function Sidebar({ collapsed, setCollapsed, openSections, toggleSection }) {
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

function AppShell() {
  const location = useLocation();
  const isAuthPage = ["/", "/login"].includes(location.pathname);

  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({ wardrobe: true });

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
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
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openSections={openSections}
        toggleSection={toggleSection}
      />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/wardrobe" element={<Wardrobe sidebar />} />
          <Route path="/tryon" element={<TryOn />} />
          <Route path="/tryon/result" element={<TryOnResult />} />
          <Route path="/profile" element={<Profile sidebar />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
