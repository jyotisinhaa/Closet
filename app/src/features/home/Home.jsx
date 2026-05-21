import { useNavigate } from 'react-router-dom'
import { useHome } from './useHome'

const SECTIONS = [
  {
    num: '01', key: 'onboarding', path: '/onboarding',
    title: 'Onboarding',
    sub: 'Style profile, body type, your photo',
    color: 'var(--terracotta)',
    bg: 'rgba(194,86,58,0.06)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    num: '02', key: 'wardrobe', path: '/wardrobe',
    title: 'My Wardrobe',
    sub: 'All your clothes, organised and tagged',
    color: 'var(--olive)',
    bg: 'rgba(91,106,63,0.06)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    num: '03', key: 'tryon', path: '/tryon',
    title: 'Try On',
    sub: 'Snap an item, see yourself wearing it',
    color: 'var(--ink)',
    bg: 'rgba(26,22,18,0.04)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    num: '04', key: 'result', path: '/results',
    title: 'Results',
    sub: 'Try-on renders + honest AI feedback',
    color: 'var(--gold)',
    bg: 'rgba(201,169,97,0.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    num: '05', key: 'wishlist', path: '/wishlist',
    title: 'Wishlist',
    sub: 'Saved items — mark bought to add to closet',
    color: 'var(--terracotta)',
    bg: 'rgba(194,86,58,0.06)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    num: '06', key: 'profile', path: '/profile',
    title: 'My Profile',
    sub: 'Style analysis, body type, score',
    color: 'var(--olive)',
    bg: 'rgba(91,106,63,0.06)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { profile, itemCount } = useHome()

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }}>

      {/* ── Hero header ── */}
      <div style={{
        padding: '40px 40px 32px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--paper)',
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--terracotta)',
          marginBottom: '12px',
        }}>
          DevNetwork AI+ML Hackathon · 2026
        </div>

        {/* Main title */}
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontSize: 'clamp(32px, 4vw, 56px)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariationSettings: '"SOFT" 50, "WONK" 1',
          marginBottom: '10px',
        }}>
          CLOSET
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: "'Fraunces', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(13px, 1.5vw, 16px)',
          color: 'var(--ink-soft)',
          letterSpacing: '0.01em',
        }}>
          Your AI Stylist&nbsp;&nbsp;·&nbsp;&nbsp;Your Honest Mirror&nbsp;&nbsp;·&nbsp;&nbsp;Your Best Look
        </p>

        {/* Stats row — shown when profile exists */}
        {(profile || itemCount !== null) && (
          <div style={{
            display: 'flex', gap: '32px', marginTop: '28px',
          }}>
            {profile?.name && (
              <div>
                <div style={{
                  fontFamily: "'Fraunces', serif", fontStyle: 'italic',
                  fontSize: '15px', color: 'var(--ink)',
                }}>
                  Hello, <em style={{ color: 'var(--terracotta)', fontFamily: "'Instrument Serif', serif" }}>{profile.name}</em>
                </div>
              </div>
            )}
            {itemCount !== null && (
              <div>
                <span style={{
                  fontFamily: "'Fraunces', serif", fontSize: '22px',
                  fontWeight: 400, letterSpacing: '-0.02em',
                }}>
                  {itemCount}
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--muted)', marginLeft: '6px',
                }}>
                  items
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section grid ── */}
      <div style={{ padding: '32px 40px 48px' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px', letterSpacing: '0.25em',
          textTransform: 'uppercase', color: 'var(--muted)',
          marginBottom: '20px',
        }}>
          Sections
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => navigate(s.path)}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(26,22,18,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Number watermark */}
              <div style={{
                position: 'absolute', top: '12px', right: '16px',
                fontFamily: "'Fraunces', serif",
                fontSize: '48px', fontWeight: 300,
                color: s.bg.replace('0.06', '0.4').replace('0.08', '0.4').replace('0.04', '0.25'),
                lineHeight: 1,
                fontStyle: 'italic',
                userSelect: 'none',
              }}>
                {s.num}
              </div>

              {/* Icon */}
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: s.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color,
                marginBottom: '14px',
              }}>
                {s.icon}
              </div>

              {/* Label */}
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontSize: '17px',
                color: 'var(--ink)',
                marginBottom: '5px',
              }}>
                {s.title}
              </div>

              {/* Sub */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '8px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                lineHeight: 1.5,
              }}>
                {s.sub}
              </div>

              {/* Arrow */}
              <div style={{
                position: 'absolute', bottom: '16px', right: '16px',
                color: 'var(--line)',
                fontSize: '14px',
              }}>
                →
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
