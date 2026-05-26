import { useEffect, useState } from "react";
import { apiGet, apiUpload, apiDelete, apiPost } from "../../api/client";
import { getProfile } from "../../lib/session";
import { getCategoriesForGender } from "../../lib/categories";

// Wardrobe data + operations: load items, add (with photo upload), delete, and
// derive the filtered view and per-category counts. Also drives the inline
// "Try It On" mode where the user picks pieces and renders them on themselves.
const FAV_KEY = "closet_wardrobe_favorites";
const MAX_TRYON = 4;
const loadFavs = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  } catch {
    return new Set();
  }
};
const saveFavs = (s) => localStorage.setItem(FAV_KEY, JSON.stringify([...s]));

export function useWardrobe() {
  const profile = getProfile() || {};
  const categories = getCategoriesForGender(profile.gender);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState(null);
  const [favorites, setFavorites] = useState(loadFavs);
  const [showFavs, setShowFavs] = useState(false);

  // ── Try-It-On mode ─────────────────────────────────────────────────────
  const [tryOnMode, setTryOnMode] = useState(false);
  const [tryOnSelectedIds, setTryOnSelectedIds] = useState([]);
  const [tryOnRendering, setTryOnRendering] = useState(false);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [tryOnError, setTryOnError] = useState("");

  function enterTryOnMode() {
    setTryOnSelectedIds([]);
    setTryOnResult(null);
    setTryOnError("");
    setTryOnMode(true);
  }
  function exitTryOnMode() {
    setTryOnMode(false);
    setTryOnSelectedIds([]);
    setTryOnRendering(false);
    setTryOnError("");
  }
  function toggleTryOnSelect(id) {
    setTryOnError("");
    setTryOnSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_TRYON) return prev;
      return [...prev, id];
    });
  }
  function clearTryOnSelection() {
    setTryOnSelectedIds([]);
    setTryOnError("");
  }
  function closeTryOnResult() {
    setTryOnResult(null);
  }
  async function runTryOn() {
    if (tryOnSelectedIds.length === 0) return;
    setTryOnRendering(true);
    setTryOnError("");
    setTryOnResult(null);
    try {
      const data = await apiPost("/tryon/wardrobe", {
        wardrobe_item_ids: tryOnSelectedIds,
        gender: profile.gender || "",
      });
      setTryOnResult(data);
    } catch (err) {
      setTryOnError(err.message || "Render failed. Please try again.");
    } finally {
      setTryOnRendering(false);
    }
  }

  useEffect(() => {
    apiGet("/wardrobe")
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function addItem({ file, category, color, description, price }) {
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("category", category);
    if (color) fd.append("color", color);
    fd.append("description", description);
    if (price) fd.append("price", price);
    const item = await apiUpload("/wardrobe", fd);
    setItems((prev) => [item, ...prev]);
    return item;
  }

  async function deleteItem(id) {
    await apiDelete(`/wardrobe/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavs(next);
      return next;
    });
  }

  // Items passing the non-category filters (favs + color). Used for counts so
  // the category pills reflect how many items exist under the active filters.
  const baseFiltered = items.filter((i) => {
    if (showFavs && !favorites.has(i.id)) return false;
    if (
      colorFilter &&
      (i.color || "").toLowerCase() !== colorFilter.toLowerCase()
    )
      return false;
    return true;
  });

  const visible = baseFiltered.filter(
    (i) => filter === "All" || i.category === filter,
  );

  const counts = baseFiltered.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  const tryOnSelectedItems = tryOnSelectedIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean);

  return {
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
    categories,
    visible,
    counts,
    totalValue,
    addItem,
    deleteItem,
    // Try-It-On mode
    tryOnMode,
    enterTryOnMode,
    exitTryOnMode,
    tryOnSelectedIds,
    tryOnSelectedItems,
    toggleTryOnSelect,
    clearTryOnSelection,
    tryOnAtMax: tryOnSelectedIds.length >= MAX_TRYON,
    tryOnMaxItems: MAX_TRYON,
    tryOnRendering,
    tryOnResult,
    tryOnError,
    runTryOn,
    closeTryOnResult,
  };
}
