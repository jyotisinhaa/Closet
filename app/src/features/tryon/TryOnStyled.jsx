import { useNavigate } from 'react-router-dom'
import { TAG_COLORS } from '../../lib/categories'
import { useStyledTryOn } from './useStyledTryOn'

export default function TryOnStyled() {
  const navigate = useNavigate()
  const {
    result, categories, filter, setFilter, visible,
    selectedIds, toggleItem, atMax, maxItems,
    rendering, manualRender, manualError, combine,
  } = useStyledTryOn()

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

        {/* ── Build your own look ── */}
        <section style={{ marginBottom: '44px' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '22px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Build your own look
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)', marginBottom: '18px' }}>
            Pick up to {maxItems} pieces from your wardrobe to wear with the new {displayName.toLowerCase()}.
          </div>

          {/* Base (new item) + selection summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img src={new_item_image_url} alt="New item" style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--terracotta)', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', background: 'var(--terracotta)', color: 'white', fontSize: '6px', padding: '1px 5px', borderRadius: '100px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>BASE</div>
            </div>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--ink-soft)' }}>
              The new {displayName.toLowerCase()} is always worn — choose what to pair it with.
            </div>
          </div>

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '2px 0 16px', scrollbarWidth: 'none' }}>
            {['All', ...categories].map(cat => {
              const active = filter === cat
              return (
                <button key={cat} onClick={() => setFilter(cat)} style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: '100px', cursor: 'pointer',
                  border: active ? '1.5px solid var(--terracotta)' : '1.5px solid var(--line)',
                  background: active ? 'var(--terracotta)' : 'white',
                  color: active ? 'white' : 'var(--ink-soft)',
                  fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: active ? 600 : 400,
                  transition: 'all 0.18s ease',
                }}>
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Wardrobe picker grid */}
          {visible.length === 0 ? (
            <div style={{
              border: '1.5px dashed var(--line)', borderRadius: '14px', padding: '36px 24px',
              textAlign: 'center', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)',
            }}>
              {filter === 'All' ? 'Your wardrobe is empty — add items to build a look.' : `No ${filter} items in your wardrobe yet.`}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))', gap: '10px' }}>
              {visible.map(item => {
                const selected = selectedIds.includes(item.id)
                const disabled = !selected && atMax
                return (
                  <PickCard key={item.id} item={item} selected={selected} disabled={disabled} onToggle={() => toggleItem(item.id)} />
                )
              })}
            </div>
          )}

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={combine}
              disabled={selectedIds.length === 0 || rendering}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: selectedIds.length === 0 || rendering ? 'var(--cream-deep)' : 'var(--ink)',
                color: selectedIds.length === 0 || rendering ? 'var(--muted)' : 'white',
                border: 'none', borderRadius: '10px', padding: '12px 24px',
                cursor: selectedIds.length === 0 || rendering ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
                transition: 'all 0.18s ease', whiteSpace: 'nowrap',
              }}
            >
              {rendering ? 'Rendering…' : `Try on selected (${selectedIds.length})`}
            </button>
            {rendering && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                ◆ Layering each piece — this can take up to a minute
              </span>
            )}
          </div>

          {manualError && (
            <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(194,86,58,0.08)', border: '1px solid rgba(194,86,58,0.25)', borderRadius: '8px', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--terracotta)' }}>
              {manualError}
            </div>
          )}

          {/* Manual render result */}
          {manualRender?.composite_render_url && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                Your custom look
              </div>
              <ResultCard
                renderUrl={manualRender.composite_render_url}
                newItemImageUrl={new_item_image_url}
                items={manualRender.wardrobe_item_details || []}
                price={price}
              />
            </div>
          )}
        </section>

        {/* ── AI suggestions ── */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '28px' }}>
          {combinations?.length > 0 ? (
            <>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
                {combinations.length} AI pairing{combinations.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {combinations.map((combo, i) => (
                  <ComboCard key={i} combo={combo} newItemImageUrl={new_item_image_url} price={price} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>
              No AI pairings yet — build your own look above.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// Selectable wardrobe item in the picker grid.
function PickCard({ item, selected, disabled, onToggle }) {
  const tag = TAG_COLORS[item.category] ?? { bg: '#EBE3D4', fg: '#3A322A' }
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        position: 'relative', padding: 0, border: 'none', background: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden',
        outline: selected ? '2.5px solid var(--terracotta)' : '1px solid var(--line)',
        outlineOffset: selected ? '-1px' : '0',
        opacity: disabled ? 0.4 : 1, transition: 'opacity 0.15s, outline 0.15s',
      }}
    >
      {item.image_url ? (
        <img src={item.image_url} alt={item.description || item.category}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%', background: tag.bg, color: tag.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fraunces', serif", fontSize: '28px', fontStyle: 'italic',
        }}>
          {(item.description || item.category || '?')[0].toUpperCase()}
        </div>
      )}

      {/* Category tag */}
      <div style={{
        position: 'absolute', bottom: '6px', left: '6px',
        background: tag.bg, color: tag.fg,
        fontFamily: "'JetBrains Mono', monospace", fontSize: '7px',
        padding: '3px 7px', borderRadius: '100px',
        letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
      }}>
        {item.category}
      </div>

      {/* Selected check */}
      {selected && (
        <div style={{
          position: 'absolute', top: '6px', right: '6px',
          width: '22px', height: '22px', borderRadius: '50%',
          background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(26,22,18,0.25)',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}
    </button>
  )
}

// Rendered composite (used by the manual picker result).
function ResultCard({ renderUrl, newItemImageUrl, items, price }) {
  return (
    <div style={{ border: '1.5px solid var(--line)', borderRadius: '16px', overflow: 'hidden', background: 'var(--paper)', display: 'flex' }}>
      <div style={{ width: '220px', flexShrink: 0, background: 'var(--cream-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
        <img src={renderUrl} alt="Your custom look" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '18px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            New piece + {items.length} from your closet
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <img src={newItemImageUrl} alt="New item" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--terracotta)', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', background: 'var(--terracotta)', color: 'white', fontSize: '6px', padding: '1px 4px', borderRadius: '100px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>NEW</div>
            </div>
            {items.map(item => (
              <img key={item.id} src={item.image_url} alt={item.description || item.category} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--line)', display: 'block' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Outfit total</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: 'var(--terracotta)', letterSpacing: '-0.01em' }}>${(price || 0).toFixed(2)}</span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>· rest from wardrobe</span>
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
