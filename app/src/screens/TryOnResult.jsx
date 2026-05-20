import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const COLOR_NAMES = {
  '#1a1612': 'Espresso', '#3a322a': 'Dark Brown', '#c2563a': 'Terracotta',
  '#e63946': 'Red', '#f4a261': 'Sandy Orange', '#e76f51': 'Burnt Orange',
  '#c9a961': 'Gold', '#5b6a3f': 'Olive', '#2d6a4f': 'Forest Green',
  '#264653': 'Deep Teal', '#4a6b8a': 'Steel Blue', '#a8dadc': 'Sky Blue',
  '#6d6875': 'Mauve', '#b5838d': 'Dusty Rose', '#8c8273': 'Taupe',
  '#d4cbb8': 'Linen', '#1d3557': 'Navy', '#9b5de5': 'Purple',
  '#a7c4a0': 'Sage', '#6f4e37': 'Coffee', '#00b4d8': 'Cobalt Blue',
  '#7f7f7f': 'Grey', '#e8d5b7': 'Cream', '#fbf8f1': 'White',
}
function colorLabel(hex) {
  if (!hex) return ''
  return COLOR_NAMES[hex.toLowerCase()] || hex
}

export default function TryOnResult() {
  const location = useLocation()
  const navigate  = useNavigate()
  const stateResult = location.state?.result
  const preview     = location.state?.preview
  const result      = stateResult ?? (() => {
    try { return JSON.parse(localStorage.getItem('closet_last_result') || 'null') } catch { return null }
  })()

  const [activeTab, setActiveTab] = useState('solo')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)

  if (!result) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: 'var(--ink)', marginBottom: '12px' }}>
            No result found
          </div>
          <button onClick={() => navigate('/tryon')} style={outlineBtn}>← Back to Try On</button>
        </div>
      </div>
    )
  }

  const { solo_render_url, new_item_image_url, honest_assessment, combinations, price, store, category, color, item_name, detected_category, style_tags, similar_owned } = result
  const displayCategory = detected_category || category
  const activeCombo  = combinations?.[0]
  const renderSrc    = activeTab === 'styled'
    ? (activeCombo?.composite_render_url || solo_render_url || preview || new_item_image_url)
    : (solo_render_url || preview || new_item_image_url)

  const styleTags = [color, category, store].filter(Boolean)

  async function saveToWishlist() {
    setSaving(true)
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_item_image_url, category, price, store, solo_render_url, combinations, honest_assessment, description: category }),
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ flex: 1, background: 'var(--paper)', overflowY: 'auto', padding: 'clamp(40px, 6vw, 72px) clamp(24px, 6vw, 80px) 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(24px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)', margin: '0 0 10px' }}>
            Here's your look{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>✦</em>
          </h1>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
            See how the new piece looks on you, and discover outfit combinations from your wardrobe.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: 0 }} />
        </div>

        {/* Two-column main */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '64px', marginBottom: '32px', alignItems: 'start' }}>

          {/* LEFT — Honest take + tags + actions */}
          <div>
            {/* New piece info card */}
            <div style={{ background: 'var(--cream-deep)', borderRadius: '14px', padding: '18px 20px', marginBottom: '16px', border: '1.5px solid var(--line)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: 700, marginBottom: '10px' }}>The new piece</div>
              {item_name && (
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '18px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '14px', lineHeight: 1.2 }}>
                  {item_name}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {price > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>Price</span>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 600, color: 'var(--terracotta)' }}>${parseFloat(price).toFixed(2)}</span>
                  </div>
                )}
                {store && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>From</span>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 500 }}>{store}</span>
                  </div>
                )}
                {displayCategory && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>Category</span>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 500 }}>{displayCategory}</span>
                  </div>
                )}
                {color && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>Detected color</span>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 500 }}>{colorLabel(color)}</span>
                  </div>
                )}
                {style_tags?.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>Style</span>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 500 }}>{style_tags.join(', ')}</span>
                  </div>
                )}
                {similar_owned && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>Similar pieces owned</span>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 500 }}>{similar_owned}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Honest take card — only on solo tab */}
            {activeTab === 'solo' && <div style={{ background: 'var(--cream-deep)', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', border: '1.5px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--terracotta)', fontSize: '12px' }}>◆</span>
                <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '16px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>
                  AI Honest Take
                </span>
              </div>
              <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '15px', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>
                "{honest_assessment || 'This piece complements several items already in your wardrobe.'}"
              </p>
            </div>}


            {/* Save to Wishlist */}
            {saved ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--olive)', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Saved to Wishlist
              </div>
            ) : (
              <button onClick={saveToWishlist} disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center',
                background: 'rgba(194,86,58,0.08)', color: 'var(--terracotta)',
                border: '1.5px solid rgba(194,86,58,0.25)', borderRadius: '10px', padding: '11px 20px',
                cursor: saving ? 'not-allowed' : 'pointer', marginBottom: '12px',
                fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
                opacity: saving ? 0.7 : 1, transition: 'all 0.15s',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {saving ? 'Saving…' : 'Save to Wishlist'}
              </button>
            )}

            <button onClick={() => navigate('/tryon')} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center',
              background: 'rgba(0,0,0,0.04)', color: 'var(--ink-soft)',
              border: '1.5px solid var(--line)', borderRadius: '10px', padding: '11px 20px',
              cursor: 'pointer', marginBottom: '12px',
              fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
              transition: 'all 0.15s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Try a different item
            </button>

            {activeTab === 'solo' && (
              <button onClick={() => setActiveTab('styled')} style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center',
                background: 'var(--ink)', color: 'white',
                border: '1.5px solid var(--ink)', borderRadius: '10px', padding: '11px 20px',
                cursor: 'pointer',
                fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
                transition: 'all 0.15s',
              }}>
                Styled with your closet
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            )}
          </div>

          {/* RIGHT — Header + render */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '20px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                The New {item_name || displayCategory || 'Piece'}, on you
              </div>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)', lineHeight: 1.55 }}>
                Showing the {(item_name || displayCategory)?.toLowerCase() || 'item'} on your profile photo, without any closet pairing.
              </div>
            </div>

            {/* Render image */}
            <div style={{
              borderRadius: '16px', overflow: 'hidden', border: '1.5px solid var(--line)',
              background: 'var(--cream-deep)',
            }}>
              {renderSrc ? (
                <img src={renderSrc} alt="Your look" style={{ width: '100%', display: 'block' }} />
              ) : (
                <div style={{ minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center', color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px' }}>
                  Render unavailable
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
          {activeTab === 'styled' && combinations?.length > 0 ? (
            <>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
                {combinations.length} closet pairing{combinations.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {combinations.map((combo, i) => (
                  <ComboCard key={i} combo={combo} newItemImageUrl={new_item_image_url} price={price} />
                ))}
              </div>
            </>
          ) : null}
        </div>

      </div>
    </div>
  )
}

function ComboCard({ combo, newItemImageUrl, price }) {
  const { composite_render_url, name, styling_note, wardrobe_item_details } = combo

  return (
    <div style={{ border: '1.5px solid var(--line)', borderRadius: '16px', overflow: 'hidden', background: 'var(--paper)', display: 'flex' }}>
      {/* Render thumbnail */}
      <div style={{ width: '160px', flexShrink: 0, background: 'var(--cream-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        {composite_render_url ? (
          <img src={composite_render_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)', textAlign: 'center', padding: '12px' }}>No render</span>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '17px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {name}
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            {styling_note}
          </div>
          {/* Item thumbnails */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <img src={newItemImageUrl} alt="New item" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--terracotta)', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', background: 'var(--terracotta)', color: 'white', fontSize: '6px', padding: '1px 4px', borderRadius: '100px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>NEW</div>
            </div>
            {(wardrobe_item_details || []).map(item => (
              <img key={item.id} src={item.image_url} alt={item.description || item.category} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--line)', display: 'block' }} />
            ))}
          </div>
        </div>
        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)', fontWeight: 700 }}>Outfit total</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: 'var(--terracotta)', letterSpacing: '-0.01em' }}>${(price || 0).toFixed(2)}</span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>· rest from wardrobe</span>
        </div>
      </div>
    </div>
  )
}

const outlineBtn = {
  background: 'transparent', color: 'var(--ink-soft)',
  border: '1.5px solid var(--line)', borderRadius: '8px', padding: '9px 16px',
  cursor: 'pointer', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 500,
}
