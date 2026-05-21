import { useLocation, useNavigate } from 'react-router-dom'
import { getLastResult } from '../../lib/session'

export default function TryOnStyled() {
  const location = useLocation()
  const navigate = useNavigate()

  const result = location.state?.result ?? getLastResult()

  if (!result) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: 'var(--ink)', marginBottom: '12px' }}>No result found</div>
          <button onClick={() => navigate('/tryon')} style={outlineBtn}>← Back to Try On</button>
        </div>
      </div>
    )
  }

  const { new_item_image_url, combinations, price, item_name, detected_category, category } = result
  const displayName = item_name || detected_category || category || 'New Piece'

  return (
    <div style={{ flex: 1, background: 'var(--paper)', overflowY: 'auto', padding: 'clamp(40px, 6vw, 72px) clamp(24px, 6vw, 80px) 80px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(24px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)', margin: '0 0 10px' }}>
            Styled with your closet{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>✦</em>
          </h1>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
            See how the {displayName.toLowerCase()} pairs with items already in your wardrobe.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: 0 }} />
        </div>

        {/* Back button */}
        <button onClick={() => navigate('/tryon/result')} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, marginBottom: '28px',
          fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)',
          textDecoration: 'underline', textDecorationColor: 'var(--line)',
        }}>
          ← Back to just the new piece
        </button>

        {/* Combo cards */}
        {combinations?.length > 0 ? (
          <>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
              {combinations.length} closet pairing{combinations.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {combinations.map((combo, i) => (
                <ComboCard key={i} combo={combo} newItemImageUrl={new_item_image_url} price={price} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'var(--muted)' }}>
            No outfit pairings available — add more items to your wardrobe.
          </div>
        )}

      </div>
    </div>
  )
}

function ComboCard({ combo, newItemImageUrl, price }) {
  const { composite_render_url, name, styling_note, wardrobe_item_details } = combo

  return (
    <div style={{ border: '1.5px solid var(--line)', borderRadius: '16px', overflow: 'hidden', background: 'var(--paper)', display: 'flex' }}>
      {/* Render thumbnail */}
      <div style={{ width: '200px', flexShrink: 0, background: 'var(--cream-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '240px' }}>
        {composite_render_url ? (
          <img src={composite_render_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)', textAlign: 'center', padding: '12px' }}>No render</span>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '18px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {name}
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)', lineHeight: 1.55, marginBottom: '16px' }}>
            {styling_note}
          </div>
          {/* Item thumbnails */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <img src={newItemImageUrl} alt="New item" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--terracotta)', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', background: 'var(--terracotta)', color: 'white', fontSize: '6px', padding: '1px 4px', borderRadius: '100px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>NEW</div>
            </div>
            {(wardrobe_item_details || []).map(item => (
              <img key={item.id} src={item.image_url} alt={item.description || item.category} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--line)', display: 'block' }} />
            ))}
          </div>
        </div>
        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Outfit total</span>
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
