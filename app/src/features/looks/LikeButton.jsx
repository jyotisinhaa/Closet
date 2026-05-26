import { useState } from 'react'
import { apiPost, apiDelete } from '../../api/client'

// Heart toggle overlaid on a generated look. Self-contained: saving POSTs to the
// Lookbook (/api/looks) and unliking DELETEs it. `look` carries the render_url +
// context: { render_url, title, item_name, category, price, source, item_image_urls }.
export default function LikeButton({ look, size = 36, style }) {
  const [liked, setLiked]   = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [busy, setBusy]     = useState(false)

  async function toggle(e) {
    e.stopPropagation()
    if (busy || !look?.render_url) return
    setBusy(true)
    try {
      if (liked) {
        if (savedId) await apiDelete(`/looks/${savedId}`)
        setLiked(false); setSavedId(null)
      } else {
        const saved = await apiPost('/looks', look)
        setLiked(true); setSavedId(saved.id)
      }
    } catch (err) {
      console.error('Lookbook toggle failed:', err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={liked ? 'Saved to Lookbook — click to remove' : 'Save to Lookbook'}
      style={{
        width: size, height: size, borderRadius: '50%', border: 'none', padding: 0,
        cursor: busy ? 'wait' : 'pointer',
        background: liked ? 'var(--terracotta)' : 'rgba(255,255,255,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(26,22,18,0.22)', transition: 'all 0.15s',
        ...style,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24"
        fill={liked ? 'white' : 'none'} stroke={liked ? 'white' : 'var(--terracotta)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
