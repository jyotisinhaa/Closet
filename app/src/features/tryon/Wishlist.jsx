import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost, apiDelete } from '../../api/client'

const SORT_OPTIONS = ['Recently saved', 'Price: Low–High', 'Price: High–Low']

function deriveVerdict(honest_assessment) {
  if (!honest_assessment) return 'buy'
  const t = honest_assessment.toLowerCase()
  if (t.includes('skip') || t.includes('already own') || t.includes('duplicate') || t.includes('don\'t need') || t.includes('too many')) return 'skip'
  if (t.includes('wear-it-everywhere') || t.includes('wear it everywhere') || t.includes('pairs with')) return 'everywhere'
  return 'buy'
}

function getDaysSaved(addedAt) {
  if (!addedAt) return 0
  return Math.floor((Date.now() - new Date(addedAt).getTime()) / 86400000)
}

function getTimeNudge(days) {
  if (days <= 3)  return null
  if (days <= 7)  return 'Still thinking?'
  if (days <= 14) return `You've waited ${days} days…`
  return 'Maybe it\'s time to let this one go.'
}

const VERDICT = {
  skip:       { label: 'AI says skip',              bg: '#C2563A', color: '#fff' },
  buy:        { label: 'Still recommended',         bg: '#2D6A4F', color: '#fff' },
  everywhere: { label: 'Why are you still thinking?', bg: '#1D3557', color: '#fff' },
}

export default function Wishlist() {
  const navigate = useNavigate()
  const [items, setItems]         = useState([])
  const [sortOpen, setSortOpen]   = useState(false)
  const [sortBy, setSortBy]       = useState('Recently saved')
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    apiGet('/wishlist')
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  async function markBought(id) {
    const item = items.find(it => it.id === id)
    if (item) {
      try {
        await apiPost(`/wishlist/${id}/purchase`)
      } catch {}
    }
    setItems(prev => prev.filter(it => it.id !== id))
  }

  async function removeItem(id) {
    try { await apiDelete(`/wishlist/${id}`) } catch {}
    setItems(prev => prev.filter(it => it.id !== id))
  }

  const categories = ['All', ...Array.from(new Set(items.map(it => it.category).filter(Boolean)))]
  const notBought  = items.filter(it => !it.bought)

  let displayed = activeTab === 'All' ? notBought : notBought.filter(it => it.category === activeTab)
  if (sortBy === 'Price: Low–High')  displayed = [...displayed].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
  if (sortBy === 'Price: High–Low')  displayed = [...displayed].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))

  const totalConsidered = notBought.reduce((s, it) => s + (parseFloat(it.price) || 0), 0)
  const aiBuyCount      = notBought.filter(it => deriveVerdict(it.honest_assessment) !== 'skip').length

  const oldestMs = notBought.reduce((min, it) => {
    const t = new Date(it.added_at || it.addedAt).getTime()
    return t < min ? t : min
  }, Date.now())
  const daysSince = Math.max(1, Math.round((Date.now() - oldestMs) / 86400000))

  return (
    <div style={{ flex: 1, background: 'var(--paper)', overflowY: 'auto', padding: 'clamp(32px, 5vw, 56px) clamp(24px, 5vw, 72px) 80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(24px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)', margin: '0 0 10px' }}>
            My Wishlist
          </h1>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
            {notBought.length} {notBought.length === 1 ? 'item' : 'items'} you've tried on but haven't bought yet
            {totalConsidered > 0 && (
              <> · Total considered: <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>${totalConsidered.toFixed(0)}</strong></>
            )}
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: 0 }} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          <StatBox label="ITEMS SAVED"       value={notBought.length}               sub="In try-on queue" />
          <StatBox label="TOTAL CONSIDERED"  value={`$${totalConsidered.toFixed(0)}`} sub={`From ${notBought.length} ${notBought.length === 1 ? 'item' : 'items'}`} />
          <StatBox label="AI SAYS BUY"       value={aiBuyCount}                     sub="Based on wardrobe fit" />
          <StatBox label="DAYS CONSIDERING"  value={`${daysSince}d`}                sub={`${notBought.length} still undecided`} />
        </div>

        {/* Filter tabs + sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} style={tabPill(activeTab === cat)}>
                {cat}
                {activeTab === cat && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    fontFamily: "'Inter Tight', sans-serif", fontSize: '10px', fontWeight: 700,
                    marginLeft: '6px',
                  }}>
                    {(activeTab === 'All' ? notBought : notBought.filter(i => i.category === cat)).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setSortOpen(o => !o)} style={sortTrigger(sortOpen)}>
              {sortBy}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {sortOpen && (
              <div style={dropdownStyle}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false) }} style={dropItemStyle(sortBy === opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--line)', marginBottom: '28px' }} />

        {/* Empty state */}
        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: 'var(--ink)', marginBottom: '10px' }}>Nothing here yet</div>
            <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>
              Try on a new piece and save it here.
            </p>
            <button onClick={() => navigate('/tryon')} style={ctaBtn}>Try something on</button>
          </div>
        )}

        {/* Cards grid */}
        {displayed.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {displayed.map(item => (
              <WishlistCard key={item.id} item={item} onBought={() => markBought(item.id)} onRemove={() => removeItem(item.id)} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function StatBox({ label, value, sub }) {
  return (
    <div style={{
      background: 'var(--cream-deep)', border: '1px solid var(--line)',
      borderRadius: '12px', padding: '20px 18px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '48px', letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1, marginBottom: '8px' }}>
        {value}
      </div>
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>
        {sub}
      </div>
    </div>
  )
}

function WishlistCard({ item, onBought, onRemove }) {
  const [hover, setHover] = useState(false)

  const verdict     = deriveVerdict(item.honest_assessment)
  const vc          = VERDICT[verdict]
  const letter      = (item.item_name || item.category || 'I')[0].toUpperCase()
  const cardBg      = item.color || '#3A322A'
  const combosCount = item.combinations?.length || 0
  const name        = item.item_name || item.category || 'Item'
  const price       = parseFloat(item.price)
  const days        = getDaysSaved(item.added_at || item.addedAt)
  const timeNudge   = getTimeNudge(days)
  const excerpt     = item.honest_assessment
    ? `"${item.honest_assessment.slice(0, 65).trimEnd()}…"`
    : null

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ transition: 'transform 0.18s ease', transform: hover ? 'translateY(-4px)' : 'none' }}
    >
      {/* Card image block */}
      <div style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        aspectRatio: '3/4', background: cardBg, marginBottom: '12px',
        boxShadow: hover ? '0 12px 32px rgba(26,22,18,0.18)' : '0 2px 8px rgba(26,22,18,0.08)',
        transition: 'box-shadow 0.18s ease',
      }}>

        {/* Big italic letter (shown as fallback behind image) */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            fontSize: 'clamp(80px, 12vw, 130px)', color: 'rgba(255,255,255,0.18)',
            lineHeight: 1, userSelect: 'none',
          }}>
            {letter}
          </span>
        </div>

        {/* Item image */}
        {(item.new_item_image_url || item.solo_render_url) && (
          <img
            src={item.new_item_image_url || item.solo_render_url}
            alt={name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Closet styles badge */}
        {combosCount > 0 && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.55)',
            borderRadius: '100px', padding: '4px 10px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff',
          }}>
            {combosCount} closet {combosCount === 1 ? 'style' : 'styles'}
          </div>
        )}

        {/* Verdict + excerpt overlay at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
          padding: '32px 12px 14px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: vc.bg, color: vc.color,
            borderRadius: '100px', padding: '4px 10px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            fontWeight: 700, marginBottom: '6px',
          }}>
            {vc.label}
          </div>
          {excerpt && (
            <div style={{
              fontFamily: "'Inter Tight', sans-serif", fontSize: '10px',
              color: 'rgba(255,255,255,0.72)', lineHeight: 1.45, marginBottom: timeNudge ? '5px' : 0,
            }}>
              {excerpt}
            </div>
          )}
          {timeNudge && (
            <div style={{
              fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '10px',
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.4,
            }}>
              {timeNudge}
            </div>
          )}
        </div>
      </div>

      {/* Below card info */}
      <div style={{ paddingLeft: '2px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.25, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>
            {item.store ? `From ${item.store}` : '—'}
          </span>
          {!isNaN(price) && price > 0 && (
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              ${price.toFixed(0)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <button onClick={onBought} style={boughtBtn}>
            Bought it
          </button>
          <button onClick={onRemove} style={removeBtn} title="Remove">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const tabPill = (active) => ({
  display: 'inline-flex', alignItems: 'center',
  fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 600,
  color: active ? '#fff' : 'var(--ink-soft)',
  background: active ? 'var(--ink)' : 'var(--cream-deep)',
  border: active ? '1.5px solid var(--ink)' : '1.5px solid var(--line)',
  borderRadius: '100px', padding: '8px 18px',
  cursor: 'pointer', transition: 'all 0.2s ease',
  boxShadow: active ? '0 4px 12px rgba(26,22,18,0.18)' : '0 1px 3px rgba(26,22,18,0.06)',
  letterSpacing: '0.01em',
})

const sortTrigger = (open) => ({
  display: 'flex', alignItems: 'center', gap: '6px',
  fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 500,
  color: 'var(--ink-soft)', background: 'var(--cream-deep)',
  border: '1px solid var(--line)', borderRadius: '8px', padding: '6px 12px',
  cursor: 'pointer', transition: 'all 0.15s',
})

const dropdownStyle = {
  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
  background: '#fff', border: '1px solid var(--line)', borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(26,22,18,0.1)', zIndex: 50,
  minWidth: '160px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
}

const dropItemStyle = (active) => ({
  display: 'block', width: '100%', textAlign: 'left',
  padding: '9px 14px', border: 'none', cursor: 'pointer',
  fontFamily: "'Inter Tight', sans-serif", fontSize: '13px',
  color: active ? 'var(--terracotta)' : 'var(--ink)',
  background: active ? 'rgba(194,86,58,0.06)' : 'transparent',
  fontWeight: active ? 600 : 400,
})

const boughtBtn = {
  flex: 1, fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 600,
  color: '#fff', background: '#2D6A4F',
  border: '1px solid #2D6A4F', borderRadius: '8px', padding: '7px 0',
  cursor: 'pointer', transition: 'all 0.15s',
}

const removeBtn = {
  width: '32px', flexShrink: 0,
  color: 'var(--muted)', background: 'transparent',
  border: '1px solid var(--line)', borderRadius: '8px',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
}

const ctaBtn = {
  background: 'var(--ink)', color: '#fff',
  border: 'none', borderRadius: '10px', padding: '11px 24px',
  fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
  cursor: 'pointer',
}
