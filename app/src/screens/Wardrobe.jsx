import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORY_COLORS = {
  outerwear: { bg: '#5B6A3F', fg: '#FBF8F1' },
  top:       { bg: '#EBE3D4', fg: '#3A322A' },
  bottom:    { bg: '#1A1612', fg: '#FBF8F1' },
  dress:     { bg: '#C2563A', fg: '#FBF8F1' },
  shoes:     { bg: '#C9A961', fg: '#1A1612' },
  accessory: { bg: '#9A3E26', fg: '#FBF8F1' },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function ItemCard({ item }) {
  const colors = CATEGORY_COLORS[item.category] ?? { bg: '#EBE3D4', fg: '#3A322A' }
  const letter = (item.description || item.category || '?')[0].toUpperCase()

  return (
    <div style={{
      aspectRatio: '3/4',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid var(--line)',
      cursor: 'pointer',
    }}>
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.description}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: colors.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fraunces', serif",
          fontSize: '36px', fontStyle: 'italic',
          color: colors.fg,
        }}>
          {letter}
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: '6px', left: '6px',
        background: 'rgba(251,248,241,0.92)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '8px',
        padding: '3px 6px', borderRadius: '4px',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--ink)',
      }}>
        {item.category}
      </div>
    </div>
  )
}

export default function Wardrobe() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [wishCount, setWishCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/wardrobe').then(r => r.json()),
      fetch('/api/wishlist').then(r => r.json()),
    ]).then(([wardrobe, wishlist]) => {
      setItems(wardrobe)
      setWishCount(wishlist.length)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...new Set(items.map(i => i.category))]
  const visible = filter === 'all' ? items : items.filter(i => i.category === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>

      {/* ── Fixed top bar ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(251,248,241,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500,
          fontSize: '22px',
          fontVariationSettings: '"SOFT" 100, "WONK" 1',
          letterSpacing: '-0.02em',
        }}>
          Clos<em style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--terracotta)',
          }}>et</em>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--cream-deep)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Greeting */}
          <div style={{ padding: '20px 0 18px' }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}>
              {greeting()}
            </div>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: 'clamp(24px, 5vw, 32px)',
              lineHeight: 1.1,
              marginTop: '4px',
              letterSpacing: '-0.02em',
            }}>
              Hello,{' '}
              <em style={{
                fontStyle: 'italic',
                fontFamily: "'Instrument Serif', serif",
                color: 'var(--terracotta)',
              }}>
                Priya
              </em>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            gap: '0',
            marginBottom: '22px',
            paddingBottom: '18px',
            borderBottom: '1px solid var(--line)',
          }}>
            {[
              { num: loading ? '—' : items.length, label: 'Items' },
              { num: loading ? '—' : wishCount,    label: 'Saved' },
              { num: loading ? '—' : (items.length > 0 ? `${Math.round(items.length / 3)}+` : '0'), label: 'Looks' },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1,
                paddingRight: '16px',
                borderRight: i < 2 ? '1px solid var(--line)' : 'none',
                paddingLeft: i > 0 ? '16px' : '0',
              }}>
                <div style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 400,
                  fontSize: 'clamp(22px, 4vw, 28px)',
                  letterSpacing: '-0.02em',
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginTop: '2px',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Section title + filter */}
          <div style={{
            display: 'flex', alignItems: 'baseline',
            justifyContent: 'space-between', marginBottom: '14px',
            position: 'relative',
          }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: '18px',
              fontStyle: 'italic',
            }}>
              Your closet
            </h2>
            <button
              onClick={() => setShowFilter(v => !v)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              {filter === 'all' ? 'All' : filter} ▾
            </button>

            {showFilter && (
              <div style={{
                position: 'absolute', top: '24px', right: 0, zIndex: 30,
                background: 'var(--paper)', border: '1px solid var(--line)',
                borderRadius: '10px', padding: '6px 0',
                boxShadow: '0 8px 24px -4px rgba(26,22,18,0.15)',
                minWidth: '120px',
              }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => { setFilter(cat); setShowFilter(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 16px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase',
                      background: filter === cat ? 'var(--cream-deep)' : 'none',
                      border: 'none', cursor: 'pointer',
                      color: filter === cat ? 'var(--ink)' : 'var(--muted)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid — always 3 columns on mobile, expands on wider screens */}
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '3/4', borderRadius: '12px',
                  background: 'var(--cream-deep)', border: '1px solid var(--line)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                fontFamily: "'Fraunces', serif", fontSize: '72px',
                fontStyle: 'italic', color: 'var(--line)', marginBottom: '16px',
              }}>
                C.
              </div>
              <p style={{
                fontFamily: "'Fraunces', serif", fontStyle: 'italic',
                fontSize: '16px', color: 'var(--muted)',
              }}>
                {filter === 'all'
                  ? 'Your closet is empty. Tap + to add your first item.'
                  : `No ${filter} items yet.`}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              paddingBottom: '24px',
            }}>
              {visible.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          )}

          <div style={{ height: '16px' }} />
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => navigate('/add-item')}
        style={{
          position: 'fixed', bottom: '28px', right: '28px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--terracotta)', color: 'var(--paper)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px -4px rgba(194, 86, 58, 0.5)',
          zIndex: 20,
          fontFamily: "'Fraunces', serif", fontWeight: 300,
        }}
      >
        +
      </button>

    </div>
  )
}

const NAV_TABS = [
  { key: 'closet',   label: 'Closet',   path: '/wardrobe' },
  { key: 'tryon',    label: 'Try On',   path: '/tryon' },
  { key: 'wishlist', label: 'Wishlist', path: '/wishlist' },
  { key: 'you', label: 'You', path: '/profile' },
]

export function BottomNav({ active }) {
  const navigate = useNavigate()

  return (
    <div style={{
      flexShrink: 0,
      height: '72px',
      borderTop: '1px solid var(--line)',
      display: 'flex',
      background: 'rgba(251,248,241,0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '8px 16px env(safe-area-inset-bottom, 8px)',
      gap: '4px',
    }}>
      {NAV_TABS.map(tab => (
        <button key={tab.key} onClick={() => navigate(tab.path)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '4px',
            paddingTop: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: active === tab.key ? 'var(--ink)' : 'var(--muted)',
          }}
        >
          <NavIcon name={tab.key} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontWeight: active === tab.key ? 500 : 400,
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}

function NavIcon({ name }) {
  const s = {
    width: 22, height: 22, fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  if (name === 'closet')
    return <svg {...s} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (name === 'tryon')
    return <svg {...s} viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  if (name === 'wishlist')
    return <svg {...s} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  if (name === 'you')
    return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
  return null
}
