import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function TryOnResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, preview } = location.state || {}

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  if (!result) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: 'var(--ink)', marginBottom: '12px' }}>No result found</div>
          <button onClick={() => navigate('/tryon')} style={btnOutline}>← Back to Try On</button>
        </div>
      </div>
    )
  }

  const { solo_render_url, new_item_image_url, honest_assessment, combinations, price, store, category } = result
  const heroSrc = solo_render_url || preview || new_item_image_url

  async function saveToWishlist() {
    setSaving(true)
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_item_image_url,
          category,
          price,
          store,
          solo_render_url,
          combinations,
          honest_assessment,
          description: category,
        }),
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ flex: 1, background: 'var(--paper)', overflowY: 'auto', padding: 'clamp(40px, 6vw, 72px) clamp(24px, 6vw, 80px) 80px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0' }}>
          <div>
            <h1 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 600,
              fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.02em',
              lineHeight: 1.1, color: 'var(--ink)', marginBottom: '0',
            }}>
              Your{' '}
              <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>
                Look.
              </em>
            </h1>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '17px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
              Here's how it looks on you — with pieces you already own.
            </p>
          </div>
          <button onClick={() => navigate('/tryon')} style={{ ...btnOutline, flexShrink: 0, marginBottom: '4px' }}>
            ← Try another
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--line)', margin: '16px 0 36px' }} />

        {/* Solo render */}
        <div style={{
          borderRadius: '20px', overflow: 'hidden', border: '1.5px solid var(--line)',
          background: 'var(--cream-deep)', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '280px',
        }}>
          {heroSrc ? (
            <img src={heroSrc} alt="You wearing the item" style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }} />
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px' }}>
              Render not available
            </div>
          )}
        </div>

        {/* Honest assessment */}
        {honest_assessment && (
          <div style={{
            marginBottom: '36px', padding: '18px 20px',
            background: 'var(--cream-deep)', borderRadius: '12px',
            borderLeft: '3px solid var(--terracotta)',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0, marginTop: '1px', color: 'var(--terracotta)' }}>◆</span>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '16px', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
              {honest_assessment}
            </p>
          </div>
        )}

        {/* Outfit pairings */}
        {combinations?.length > 0 && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '24px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                Outfit pairings
              </div>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>
                Styled with pieces already in your wardrobe
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '36px' }}>
              {combinations.map((combo, idx) => (
                <ComboCard key={idx} combo={combo} newItemImageUrl={new_item_image_url} price={price} />
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {saved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--olive)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Saved to Wishlist
            </div>
          ) : (
            <button
              onClick={saveToWishlist}
              disabled={saving}
              style={{
                background: 'var(--terracotta)', color: 'white', border: 'none',
                borderRadius: '10px', padding: '12px 24px', cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
                opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s',
                boxShadow: '0 4px 16px rgba(194,86,58,0.3)', display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {saving ? 'Saving…' : 'Save to Wishlist'}
            </button>
          )}
          <button onClick={() => navigate('/tryon')} style={btnOutline}>
            Try a different item
          </button>
        </div>

      </div>
    </div>
  )
}

function ComboCard({ combo, newItemImageUrl, price }) {
  const { composite_render_url, name, styling_note, wardrobe_item_details } = combo
  const renderSrc = composite_render_url

  return (
    <div style={{
      border: '1.5px solid var(--line)', borderRadius: '16px', overflow: 'hidden',
      background: 'var(--paper)', display: 'flex',
    }}>
      {/* Render image */}
      <div style={{
        width: '200px', flexShrink: 0, background: 'var(--cream-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '240px',
      }}>
        {renderSrc ? (
          <img src={renderSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif", fontSize: '11px' }}>
            Render<br/>unavailable
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, padding: '20px 20px 20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '18px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {name}
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '16px' }}>
            {styling_note}
          </div>

          {/* Item thumbnails */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {/* New item */}
            <div style={{ position: 'relative' }}>
              <img
                src={newItemImageUrl} alt="New item"
                style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--terracotta)', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', background: 'var(--terracotta)', color: 'white', fontSize: '7px', padding: '1px 5px', borderRadius: '100px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                NEW
              </div>
            </div>
            {/* Wardrobe items */}
            {(wardrobe_item_details || []).map(item => (
              <img
                key={item.id} src={item.image_url} alt={item.description || item.category}
                style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--line)', display: 'block' }}
              />
            ))}
          </div>
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Outfit total
          </span>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 600, color: 'var(--terracotta)', letterSpacing: '-0.01em' }}>
            ${(price || 0).toFixed(2)}
          </span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>
            · rest from wardrobe
          </span>
        </div>
      </div>
    </div>
  )
}

const btnOutline = {
  background: 'transparent', color: 'var(--ink-soft)',
  border: '1.5px solid var(--line)', borderRadius: '8px', padding: '9px 16px',
  cursor: 'pointer', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 500,
}
