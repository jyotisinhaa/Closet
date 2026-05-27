import { useState } from "react";
const API = "/api";

const CATEGORIES = ["Dress", "Top", "Skirt", "Shorts", "Jeans", "Shoes", "Sandals", "Bag", "Hat", "Bottom"];
const GENDERS = ["female", "male", "unisex"];

const empty = () => ({ name: "", brand: "H&M", category: "Dress", gender: "female", price: "", color: "", store_url: "", image_url: "", style_tags: "" });

export default function CatalogAdmin() {
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState([]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.image_url || !form.category) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        style_tags: form.style_tags ? form.style_tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${API}/catalog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLog(l => [{ ok: true, msg: `✓ Saved: ${data.name} (${data.category})`, id: data.id }, ...l]);
      setForm(f => ({ ...empty(), brand: f.brand, category: f.category, gender: f.gender }));
    } catch (err) {
      setLog(l => [{ ok: false, msg: `✗ ${err.message}` }, ...l]);
    } finally {
      setSaving(false);
    }
  }

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", fontFamily: "'Inter Tight', sans-serif", fontSize: 13, background: "var(--paper)", color: "var(--ink)", outline: "none" }}
      />
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, margin: "0 0 8px" }}>Add to Catalog</h2>
        <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, color: "var(--muted)", margin: "0 0 20px" }}>
          Upload image to Cloudinary first, then paste the Cloudinary URL + H&M store page URL here
        </p>
        <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: 0 }} />
      </div>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {field("Image URL *", "image_url", "url", "https://res.cloudinary.com/... (paste your Cloudinary URL)")}
        {field("Store URL *", "store_url", "url", "https://www2.hm.com/en_us/productpage.XXXXXXXXXX.html")}
        {field("Product Name", "name", "text", "Auto-extracted if blank")}
        {field("Brand", "brand", "text", "H&M")}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Category *</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", fontFamily: "'Inter Tight', sans-serif", fontSize: 13, background: "var(--paper)", color: "var(--ink)" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Gender</label>
            <select value={form.gender} onChange={e => set("gender", e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", fontFamily: "'Inter Tight', sans-serif", fontSize: 13, background: "var(--paper)", color: "var(--ink)" }}>
              {GENDERS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          {field("Price ($)", "price", "number", "29.99")}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {field("Color", "color", "text", "Black, White, #C4A882…")}
          {field("Style Tags", "style_tags", "text", "casual, summer, minimalist")}
        </div>

        {form.image_url && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <img src={form.image_url} alt="preview" style={{ width: 80, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Inter Tight', sans-serif", paddingTop: 4 }}>Image preview — if blank the URL isn't a direct image link</div>
          </div>
        )}

        <button type="submit" disabled={saving || !form.image_url}
          style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: saving || !form.image_url ? "var(--ink-soft)" : "var(--terracotta)", color: "#fff", fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", alignSelf: "flex-start", transition: "background 0.15s" }}>
          {saving ? "Saving…" : "Add to Catalog"}
        </button>
      </form>

      {log.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Log ({log.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {log.map((l, i) => (
              <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: l.ok ? "rgba(40,120,60,0.08)" : "rgba(194,86,58,0.08)", border: `1px solid ${l.ok ? "rgba(40,120,60,0.2)" : "rgba(194,86,58,0.2)"}`, fontFamily: "'Inter Tight', sans-serif", fontSize: 13, color: l.ok ? "#1a6b30" : "var(--terracotta)" }}>
                {l.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
