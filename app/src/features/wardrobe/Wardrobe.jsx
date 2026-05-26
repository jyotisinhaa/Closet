import { useRef, useState } from "react";
import { TAG_COLORS } from "../../lib/categories";
import { useWardrobe } from "./useWardrobe";
import LikeButton from "../looks/LikeButton";
import StylistTracePanel from "../tryon/StylistTracePanel";

const CLOTHING_COLORS = [
  { hex: "#FFFFFF", name: "White" },
  { hex: "#F5F0E8", name: "Cream" },
  { hex: "#D4CBB8", name: "Linen" },
  { hex: "#C4A882", name: "Beige" },
  { hex: "#C3B091", name: "Khaki" },
  { hex: "#8C8273", name: "Taupe" },
  { hex: "#808080", name: "Gray" },
  { hex: "#36454F", name: "Charcoal" },
  { hex: "#1A1612", name: "Black" },
  { hex: "#1D3557", name: "Navy" },
  { hex: "#1560BD", name: "Denim Blue" },
  { hex: "#4A6FA5", name: "Blue" },
  { hex: "#87A9C9", name: "Light Blue" },
  { hex: "#2A9D8F", name: "Teal" },
  { hex: "#2E7D32", name: "Green" },
  { hex: "#4A7A4A", name: "Olive" },
  { hex: "#8FAF8F", name: "Sage" },
  { hex: "#800000", name: "Maroon" },
  { hex: "#C0392B", name: "Red" },
  { hex: "#800020", name: "Burgundy" },
  { hex: "#FF6B6B", name: "Coral" },
  { hex: "#C07050", name: "Terracotta" },
  { hex: "#8B4513", name: "Brown" },
  { hex: "#6B3FA0", name: "Purple" },
  { hex: "#C3A8C8", name: "Lavender" },
  { hex: "#F4A5B4", name: "Pink" },
  { hex: "#E3A008", name: "Mustard" },
  { hex: "#F0C040", name: "Yellow" },
  { hex: "#F5A623", name: "Orange" },
];

function ItemCard({ item, onDelete, isFav, onToggleFav, tryOnMode, isSelected, atMax, onSelect }) {
  const [hover, setHover] = useState(false);
  const tag = TAG_COLORS[item.category] ?? { bg: "#EBE3D4", fg: "#3A322A" };
  const dim = tryOnMode && atMax && !isSelected;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={tryOnMode && !dim ? onSelect : undefined}
      style={{
        aspectRatio: "3/4",
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        border: isSelected ? "2.5px solid var(--terracotta)" : "1px solid var(--line)",
        cursor: dim ? "not-allowed" : "pointer",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, opacity 0.15s",
        transform: hover && !dim ? "translateY(-3px)" : "none",
        boxShadow: hover && !dim
          ? "0 8px 24px rgba(26,22,18,0.12)"
          : "0 1px 4px rgba(26,22,18,0.06)",
        background: "var(--cream-deep)",
        opacity: dim ? 0.4 : 1,
      }}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.description || item.category}
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
            width: "100%",
            height: "100%",
            background: tag.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Fraunces', serif",
            fontSize: "32px",
            fontStyle: "italic",
            color: tag.fg,
          }}
        >
          {(item.description || item.category || "?")[0].toUpperCase()}
        </div>
      )}

      {/* Category tag */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          background: tag.bg,
          color: tag.fg,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "7px",
          padding: "3px 8px",
          borderRadius: "100px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {item.category}
      </div>

      {/* Selection check — only in try-on mode when selected */}
      {tryOnMode && isSelected && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "var(--terracotta)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(26,22,18,0.25)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Favorite star — hidden in try-on mode to avoid click confusion */}
      {!tryOnMode && <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav(item.id);
        }}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px",
          lineHeight: 0,
          filter: isFav ? "none" : "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isFav ? "#F5A623" : "rgba(255,255,255,0.85)"}
          stroke={isFav ? "#F5A623" : "rgba(255,255,255,0.85)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>}

      {/* Delete on hover — top-left. Suppressed in try-on mode (clicks select). */}
      {hover && !tryOnMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "rgba(26,22,18,0.7)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Wardrobe() {
  const fileInputRef = useRef(null);
  const {
    items,
    loading,
    filter,
    setFilter,
    colorFilter,
    setColorFilter,
    favorites,
    toggleFavorite,
    showFavs,
    setShowFavs,
    categories: CATEGORIES,
    visible,
    counts,
    totalValue,
    addItem,
    deleteItem,
    // Try-It-On
    tryOnMode,
    enterTryOnMode,
    exitTryOnMode,
    tryOnSelectedIds,
    tryOnSelectedItems,
    toggleTryOnSelect,
    clearTryOnSelection,
    tryOnAtMax,
    tryOnMaxItems,
    tryOnRendering,
    tryOnResult,
    tryOnError,
    runTryOn,
    closeTryOnResult,
  } = useWardrobe();

  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addError, setAddError] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Add-item form state
  const [newPhoto, setNewPhoto] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");

  function openAdd() {
    setNewPhoto(null);
    setNewCategory("");
    setNewColor("");
    setNewDesc("");
    setNewPrice("");
    setAddError("");
    setShowAdd(true);
  }
  function closeAdd() {
    setShowAdd(false);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhoto({ file, preview: URL.createObjectURL(file) });
  }

  async function handleAddItem() {
    if (!newPhoto) {
      setAddError("Please upload a photo.");
      return;
    }
    if (!newCategory) {
      setAddError("Please select a category.");
      return;
    }
    if (newPrice !== "" && parseFloat(newPrice) < 0) {
      setAddError("Price cannot be negative.");
      return;
    }
    setUploading(true);
    setAddError("");
    try {
      await addItem({
        file: newPhoto.file,
        category: newCategory,
        color: newColor,
        description: newDesc,
        price: newPrice,
      });
      closeAdd();
    } catch {
      setAddError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
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
      {/* ── Header ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "clamp(40px, 6vw, 72px) 28px 0",
          background: "var(--paper)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          {/* Left spacer — mirrors button width to keep title truly centered */}
          <div style={{ flex: "0 0 160px" }} />

          {/* Centered title */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(36px, 5.5vw, 56px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "var(--ink)",
                marginBottom: "4px",
              }}
            >
              My Wardrobe
            </h1>
            <p
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "14px",
                color: "var(--muted)",
                marginBottom: "6px",
              }}
            >
              Every piece you own, beautifully organized. Add what you wear,
              discover what to pair.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  margin: 0,
                }}
              >
                {loading
                  ? "—"
                  : `${items.length} item${items.length !== 1 ? "s" : ""}`}
              </p>
              {!loading && totalValue > 0 && (
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--terracotta)",
                    margin: 0,
                  }}
                >
                  ${totalValue.toFixed(0)} closet value
                </p>
              )}
            </div>
          </div>

          {/* Right: Add Item button */}
          <div
            style={{
              flex: "0 0 160px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={openAdd}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                background: "var(--terracotta)",
                color: "white",
                border: "1.5px solid var(--terracotta)",
                borderRadius: "10px",
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(194,86,58,0.3)",
                transition: "all 0.18s ease",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Item
            </button>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "var(--line)",
            margin: "4px 0 14px",
          }}
        />

        {/* Category filter pills + search/filter/favorites controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "4px 0 18px",
          }}
        >
          {/* Scrollable pills */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              flex: 1,
              scrollbarWidth: "none",
            }}
          >
            {["All", ...CATEGORIES].map((cat) => {
              const active = filter === cat;
              const count =
                cat === "All"
                  ? Object.values(counts).reduce((s, n) => s + n, 0)
                  : counts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    flexShrink: 0,
                    padding: "8px 18px",
                    borderRadius: "100px",
                    cursor: "pointer",
                    border: active
                      ? "1.5px solid var(--terracotta)"
                      : "1.5px solid var(--line)",
                    background: active ? "var(--terracotta)" : "white",
                    color: active ? "white" : "var(--ink-soft)",
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: active
                      ? "0 4px 14px rgba(194,86,58,0.3)"
                      : "0 1px 3px rgba(26,22,18,0.06)",
                    letterSpacing: active ? "0.01em" : "0",
                  }}
                >
                  {cat}
                  {count > 0 && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "9px",
                        letterSpacing: "0.05em",
                        background: active
                          ? "rgba(255,255,255,0.25)"
                          : "var(--cream-deep)",
                        color: active ? "white" : "var(--muted)",
                        padding: "2px 6px",
                        borderRadius: "100px",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            {/* Color filter dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowFilterPanel((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border:
                    showFilterPanel || colorFilter
                      ? "1.5px solid var(--terracotta)"
                      : "1.5px solid var(--line)",
                  background:
                    showFilterPanel || colorFilter
                      ? "rgba(194,86,58,0.15)"
                      : "rgba(194,86,58,0.07)",
                  color:
                    showFilterPanel || colorFilter
                      ? "var(--terracotta)"
                      : "var(--ink-soft)",
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >
                {colorFilter ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: colorFilter,
                        border: "1px solid rgba(0,0,0,0.15)",
                        flexShrink: 0,
                      }}
                    />
                    {CLOTHING_COLORS.find(
                      (c) => c.hex.toLowerCase() === colorFilter.toLowerCase(),
                    )?.name ?? "Color"}
                  </span>
                ) : (
                  "Filter by Color"
                )}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>

              {showFilterPanel &&
                (() => {
                  const itemColors = new Set(
                    items
                      .map((i) => (i.color || "").trim())
                      .filter(Boolean)
                      .map((c) => c.toLowerCase()),
                  );
                  const available = CLOTHING_COLORS.filter((c) =>
                    itemColors.has(c.hex.toLowerCase()),
                  );
                  return (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        right: 0,
                        background: "white",
                        border: "1.5px solid var(--line)",
                        borderRadius: "14px",
                        padding: "14px",
                        zIndex: 50,
                        boxShadow: "0 8px 24px rgba(26,22,18,0.12)",
                        minWidth: "220px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "8px",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          marginBottom: "12px",
                        }}
                      >
                        Filter by color
                      </div>
                      {available.length === 0 ? (
                        <p
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: "12px",
                            color: "var(--muted)",
                            margin: 0,
                          }}
                        >
                          No colors tagged yet — pick a color when adding items.
                        </p>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {available.map(({ hex, name }) => {
                            const active =
                              colorFilter &&
                              colorFilter.toLowerCase() === hex.toLowerCase();
                            return (
                              <button
                                key={hex}
                                title={name}
                                onClick={() => {
                                  setColorFilter(active ? null : hex);
                                  setShowFilterPanel(false);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 10px",
                                  borderRadius: "100px",
                                  cursor: "pointer",
                                  border: active
                                    ? "2px solid var(--terracotta)"
                                    : "1.5px solid var(--line)",
                                  background: active
                                    ? "rgba(194,86,58,0.06)"
                                    : "white",
                                  fontFamily: "'Inter Tight', sans-serif",
                                  fontSize: "12px",
                                  color: active
                                    ? "var(--terracotta)"
                                    : "var(--ink)",
                                  fontWeight: active ? 600 : 400,
                                }}
                              >
                                <span
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    background: hex,
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    flexShrink: 0,
                                  }}
                                />
                                {name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {colorFilter && (
                        <button
                          onClick={() => {
                            setColorFilter(null);
                            setShowFilterPanel(false);
                          }}
                          style={{
                            marginTop: "12px",
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
                          Clear color filter
                        </button>
                      )}
                    </div>
                  );
                })()}
            </div>

            {/* Try It On toggle — kicks off / cancels selection mode */}
            <button
              onClick={() => (tryOnMode ? exitTryOnMode() : enterTryOnMode())}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                border: tryOnMode
                  ? "1.5px solid var(--terracotta)"
                  : "1.5px solid var(--line)",
                background: tryOnMode
                  ? "var(--terracotta)"
                  : "rgba(194,86,58,0.07)",
                color: tryOnMode ? "white" : "var(--ink-soft)",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                fontWeight: tryOnMode ? 600 : 500,
                transition: "all 0.15s",
                boxShadow: tryOnMode ? "0 4px 14px rgba(194,86,58,0.3)" : "none",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {tryOnMode ? "Cancel" : "Try It On"}
            </button>

            {/* Favorites toggle */}
            <button
              onClick={() => setShowFavs((p) => !p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                border: showFavs
                  ? "1.5px solid #F5A623"
                  : "1.5px solid var(--line)",
                background: showFavs
                  ? "rgba(245,166,35,0.18)"
                  : "rgba(245,166,35,0.08)",
                color: showFavs ? "#C8860A" : "var(--ink-soft)",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                fontWeight: showFavs ? 600 : 500,
                transition: "all 0.15s",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={showFavs ? "#F5A623" : "none"}
                stroke={showFavs ? "#F5A623" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Favorites
            </button>
          </div>
        </div>

        {/* Active color filter indicator */}
        {colorFilter && !showFavs && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "12px",
                color: "var(--ink-soft)",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: colorFilter,
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              />
              Showing{" "}
              {CLOTHING_COLORS.find(
                (c) => c.hex.toLowerCase() === colorFilter.toLowerCase(),
              )?.name ?? colorFilter}{" "}
              items ({visible.length})
            </span>
            <button
              onClick={() => setColorFilter(null)}
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
              Clear Filter
            </button>
          </div>
        )}

        {/* Showing favorites indicator */}
        {showFavs && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "12px",
                color: "#C8860A",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#F5A623"
                stroke="#F5A623"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Showing favorites ({visible.length})
            </span>
            <button
              onClick={() => setShowFavs(false)}
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
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 40px" }}>
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "12px",
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "3/4",
                  borderRadius: "14px",
                  background: "var(--cream-deep)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Hanger illustration */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                marginBottom: "24px",
                background:
                  "linear-gradient(135deg, var(--cream-deep), var(--paper))",
                border: "1.5px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(26,22,18,0.07)",
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.38 18H3.62a1 1 0 0 1-.65-1.76L12 9l9.03 7.24A1 1 0 0 1 20.38 18z" />
                <path d="M12 9V5" />
                <path d="M12 5a2 2 0 0 1 2-2" />
              </svg>
            </div>

            <h3
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "22px",
                color: "var(--ink)",
                marginBottom: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              {filter === "All"
                ? "Your wardrobe is empty"
                : `No ${filter} items yet`}
            </h3>
            <p
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "28px",
                maxWidth: "240px",
                lineHeight: 1.5,
              }}
            >
              {filter === "All"
                ? "Start building your digital wardrobe by adding your first piece."
                : `Add a ${filter.toLowerCase()} to see it here.`}
            </p>

            <button
              onClick={openAdd}
              style={{
                background: "var(--terracotta)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "12px 28px",
                cursor: "pointer",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 4px 14px rgba(194,86,58,0.3)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add your first item
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "12px",
            }}
          >
            {visible.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={deleteItem}
                isFav={favorites.has(item.id)}
                onToggleFav={toggleFavorite}
                tryOnMode={tryOnMode}
                isSelected={tryOnSelectedIds.includes(item.id)}
                atMax={tryOnAtMax}
                onSelect={() => toggleTryOnSelect(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Try-It-On bottom action bar ── */}
      {tryOnMode && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1.5px solid var(--line)",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            boxShadow: "0 -6px 20px rgba(26,22,18,0.08)",
            zIndex: 20,
          }}
        >
          {/* Selected thumbnails */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              {tryOnSelectedIds.length} of {tryOnMaxItems} selected
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {tryOnSelectedItems.map((item) => (
                <img
                  key={item.id}
                  src={item.image_url}
                  alt={item.description || item.category}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "1.5px solid var(--terracotta)",
                    display: "block",
                  }}
                />
              ))}
            </div>
          </div>

          {tryOnError && (
            <div
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "12px",
                color: "var(--terracotta)",
                maxWidth: "240px",
              }}
            >
              {tryOnError}
            </div>
          )}

          {tryOnRendering && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              ◆ Layering each piece — this can take a minute or two
            </span>
          )}

          {tryOnSelectedIds.length > 0 && !tryOnRendering && (
            <button
              onClick={clearTryOnSelection}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                color: "var(--muted)",
                textDecoration: "underline",
                textDecorationColor: "var(--line)",
              }}
            >
              Clear
            </button>
          )}

          <button
            onClick={runTryOn}
            disabled={tryOnSelectedIds.length === 0 || tryOnRendering}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background:
                tryOnSelectedIds.length === 0 || tryOnRendering
                  ? "var(--cream-deep)"
                  : "var(--ink)",
              color:
                tryOnSelectedIds.length === 0 || tryOnRendering
                  ? "var(--muted)"
                  : "white",
              border: "none",
              borderRadius: "10px",
              padding: "11px 22px",
              cursor:
                tryOnSelectedIds.length === 0 || tryOnRendering
                  ? "not-allowed"
                  : "pointer",
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {tryOnRendering ? "Rendering…" : `Try on selected (${tryOnSelectedIds.length})`}
          </button>
        </div>
      )}

      {/* ── Try-It-On result modal ── */}
      {tryOnResult?.composite_render_url && (
        <div
          onClick={(e) => e.target === e.currentTarget && closeTryOnResult()}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,22,18,0.55)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "var(--paper)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "620px",
              padding: "24px 24px 28px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 500,
                    fontSize: "22px",
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  Your look
                </h2>
                {tryOnResult.outfit_name && (
                  <div
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: "14px",
                      color: "var(--ink-soft)",
                      marginTop: "2px",
                    }}
                  >
                    {tryOnResult.outfit_name}
                    {tryOnResult.formality ? ` · ${tryOnResult.formality.replace("_", " ")}` : ""}
                  </div>
                )}
              </div>
              <button
                onClick={closeTryOnResult}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: "4px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div
              style={{
                position: "relative",
                borderRadius: "14px",
                overflow: "hidden",
                background: "var(--cream-deep)",
                border: "1.5px solid var(--line)",
                marginBottom: "16px",
              }}
            >
              <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>
                <LikeButton
                  look={{
                    render_url: tryOnResult.composite_render_url,
                    title: "Wardrobe look",
                    source: "custom",
                    price: 0,
                    item_image_urls: (tryOnResult.wardrobe_item_details || tryOnSelectedItems)
                      .map((i) => i.image_url)
                      .filter(Boolean),
                  }}
                />
              </div>
              <img
                src={tryOnResult.composite_render_url}
                alt="Your wardrobe look"
                style={{ width: "100%", display: "block" }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {(tryOnResult.wardrobe_item_details || tryOnSelectedItems).map((item, i) => (
                <img
                  key={item.id ?? i}
                  src={item.image_url}
                  alt={item.description || item.category}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "1.5px solid var(--line)",
                    display: "block",
                  }}
                />
              ))}
            </div>

            {/* AI Honest Take — Nemotron's verdict on the outfit as a whole. */}
            {tryOnResult.honest_assessment && (
              <div
                style={{
                  background: "var(--cream-deep)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  border: "1.5px solid var(--line)",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--terracotta)", fontSize: "12px" }}>◆</span>
                  <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: "14px", color: "var(--ink)", fontWeight: 700 }}>
                    AI Honest Take
                  </span>
                  {tryOnResult.critique?.overall != null && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "9px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        background: tryOnResult.critique.overall >= 7 ? "rgba(91,106,63,0.12)" : "rgba(194,86,58,0.08)",
                        color: tryOnResult.critique.overall >= 7 ? "var(--olive)" : "var(--terracotta)",
                        borderRadius: "100px",
                        padding: "2px 8px",
                      }}
                    >
                      {tryOnResult.critique.overall}/10
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "var(--ink)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  "{tryOnResult.honest_assessment}"
                </p>
              </div>
            )}

            {/* Reasoning trace from the wardrobe orchestrator (collapsible). */}
            <StylistTracePanel
              trace={tryOnResult.trace}
              gap={tryOnResult.coverage ? { fills_gap: tryOnResult.coverage.complete, summary: tryOnResult.coverage.summary } : null}
              fitNote={tryOnResult.fit_note}
            />

            <div
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "18px",
              }}
            >
              Tap the ♥ to save this to your Lookbook.
            </div>

            <button
              onClick={closeTryOnResult}
              style={{
                width: "100%",
                background: "var(--ink)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "13px",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {showAdd && (
        <div
          onClick={(e) => e.target === e.currentTarget && closeAdd()}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,22,18,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "var(--paper)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "480px",
              padding: "28px 28px 32px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 500,
                  fontSize: "22px",
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                Add Item
              </h2>
              <button
                onClick={closeAdd}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: "4px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Photo upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: "160px",
                borderRadius: "14px",
                marginBottom: "20px",
                border: newPhoto
                  ? "1.5px solid var(--line)"
                  : "2px dashed var(--line)",
                background: newPhoto ? "transparent" : "rgba(212,203,184,0.15)",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.15s",
              }}
            >
              {newPhoto ? (
                <img
                  src={newPhoto.preview}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "var(--muted)" }}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      marginBottom: "8px",
                      display: "block",
                      margin: "0 auto 8px",
                    }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    Click to upload photo
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    JPG, PNG supported
                  </div>
                </div>
              )}
              {newPhoto && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewPhoto(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(26,22,18,0.7)",
                    color: "white",
                    border: "none",
                    borderRadius: "100px",
                    padding: "3px 10px",
                    cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "8px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Change
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {/* Category tags */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "10px",
                }}
              >
                Category
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {CATEGORIES.map((cat) => {
                  const sel = newCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(sel ? "" : cat)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "100px",
                        cursor: "pointer",
                        border: sel
                          ? "1.5px solid var(--terracotta)"
                          : "1.5px solid var(--line)",
                        background: sel ? "rgba(194,86,58,0.07)" : "white",
                        color: sel ? "var(--terracotta)" : "var(--ink-soft)",
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: "13px",
                        fontWeight: sel ? 600 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "10px",
                }}
              >
                Color <span style={{ opacity: 0.5 }}>(optional)</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {CLOTHING_COLORS.map(({ hex, name }) => {
                  const sel = newColor === hex;
                  return (
                    <button
                      key={hex}
                      type="button"
                      title={name}
                      onClick={() => setNewColor(sel ? "" : hex)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: hex,
                        cursor: "pointer",
                        border: sel
                          ? "3px solid var(--terracotta)"
                          : "2px solid rgba(0,0,0,0.12)",
                        outline: sel ? "2px solid rgba(194,86,58,0.3)" : "none",
                        transition: "all 0.15s",
                        boxSizing: "border-box",
                      }}
                    />
                  );
                })}
              </div>
              {newColor && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: newColor,
                      border: "1px solid rgba(0,0,0,0.15)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: "12px",
                      color: "var(--ink-soft)",
                    }}
                  >
                    {CLOTHING_COLORS.find((c) => c.hex === newColor)?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "8px",
                }}
              >
                Price <span style={{ opacity: 0.5 }}>(optional)</span>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "14px",
                    color: "var(--muted)",
                    pointerEvents: "none",
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    border: "1.5px solid var(--line)",
                    borderRadius: "10px",
                    padding: "12px 14px 12px 26px",
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: "14px",
                    background: "white",
                    color: "var(--ink)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "8px",
                }}
              >
                Description <span style={{ opacity: 0.5 }}>(optional)</span>
              </div>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. White linen shirt"
                style={{
                  width: "100%",
                  border: "1.5px solid var(--line)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: "14px",
                  background: "white",
                  color: "var(--ink)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {addError && (
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  color: "var(--terracotta)",
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                }}
              >
                {addError}
              </p>
            )}

            <button
              onClick={handleAddItem}
              disabled={uploading}
              style={{
                width: "100%",
                background: "var(--terracotta)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "15px",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {uploading ? "Adding…" : "Add to Wardrobe"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
