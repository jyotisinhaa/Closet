import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STYLE_LABELS = {
  casual: 'Casual', formal: 'Formal', minimalist: 'Minimalist',
  bohemian: 'Bohemian', streetwear: 'Street', romantic: 'Romantic',
  sporty: 'Sporty', classic: 'Classic',
}

const PALETTE_COLORS = {
  warm:   ['#C9A961', '#C2563A', '#9A3E26', '#EBE3D4', '#D4C4A0'],
  cool:   ['#8C8273', '#9BA3A8', '#5B6A7A', '#D0D5DA', '#EFF1F3'],
  earthy: ['#5B6A3F', '#3F4B2A', '#8B7355', '#A0895A', '#D4C4A0'],
  mono:   ['#1A1612', '#3A322A', '#8C8273', '#D4CBB8', '#FBF8F1'],
  bold:   ['#E63946', '#4361EE', '#2DC653', '#FF9800', '#9B59B6'],
}

const PALETTE_LABELS = {
  warm: 'Warm neutrals', cool: 'Cool neutrals', earthy: 'Earthy greens',
  mono: 'Monochrome', bold: 'Bold & bright',
}

const BODY_LABELS = {
  hourglass: 'Hourglass', pear: 'Pear', apple: 'Apple',
  rectangle: 'Rectangle', inverted: 'Inverted Triangle',
}

// Radar chart axes map to style preference keys
const RADAR_AXES = [
  { label: 'Casual',   keys: ['casual', 'sporty'] },
  { label: 'Formal',   keys: ['formal', 'classic'] },
  { label: 'Creative', keys: ['bohemian', 'romantic'] },
  { label: 'Classic',  keys: ['classic', 'minimalist'] },
  { label: 'Sporty',   keys: ['sporty', 'streetwear'] },
]

function RadarChart({ prefs = [] }) {
  const S = 200, cx = 100, cy = 105, maxR = 68

  const scores = RADAR_AXES.map(a => {
    if (prefs.length === 0) return 45
    const hit = a.keys.filter(k => prefs.includes(k)).length
    return hit > 0 ? 72 + hit * 6 : 22
  })

  const angles = RADAR_AXES.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI / 5))

  function pt(angle, value, r = maxR) {
    const rv = (value / 100) * r
    return [cx + rv * Math.cos(angle), cy + rv * Math.sin(angle)]
  }

  const bgPoints = angles.map(a => pt(a, 100))
  const scorePoints = angles.map((a, i) => pt(a, scores[i]))

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ overflow: 'visible' }}>
      {/* Grid rings */}
      {[30, 60, 100].map(pct => (
        <polygon key={pct}
          points={angles.map(a => pt(a, pct).join(',')).join(' ')}
          fill="none" stroke="var(--line)" strokeWidth="0.75"
        />
      ))}
      {/* Axis lines */}
      {angles.map((a, i) => {
        const [x, y] = pt(a, 100)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="0.75" />
      })}
      {/* Score fill */}
      <polygon
        points={scorePoints.map(p => p.join(',')).join(' ')}
        fill="rgba(91,106,63,0.2)"
        stroke="var(--olive)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Dots on score */}
      {scorePoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--olive)" />
      ))}
      {/* Labels */}
      {RADAR_AXES.map(({ label }, i) => {
        const labelR = maxR + 17
        const [x, y] = [cx + labelR * Math.cos(angles[i]), cy + labelR * Math.sin(angles[i])]
        return (
          <text key={i} x={x} y={y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fill="var(--ink-soft)"
            fontFamily="'JetBrains Mono', monospace"
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

function getStyleTip(p) {
  const prefs = p.stylePrefs || []
  if (!prefs.length) return 'Complete your style profile to receive personalised tips on building a wardrobe that truly works for you.'
  if (prefs.includes('minimalist') && prefs.includes('casual'))
    return '"Your minimalist-casual profile thrives on quality basics. Invest in a few well-cut neutral pieces — they will carry 80% of your wardrobe without effort."'
  if (prefs.includes('formal') && prefs.includes('casual'))
    return '"You bridge formal and casual naturally. A well-fitted blazer in a neutral tone is your most versatile single purchase."'
  if (prefs.includes('bohemian') || prefs.includes('romantic'))
    return '"Your expressive style loves texture and movement. Layer patterns at different scales — one bold, one subtle — to add depth without chaos."'
  if (prefs.includes('minimalist'))
    return '"Your clean aesthetic is powerful. One unexpected texture each season keeps minimalism from feeling flat."'
  if (prefs.includes('sporty') || prefs.includes('streetwear'))
    return '"The best street looks nail contrast — pair an oversized piece with something fitted. Proportion is everything."'
  return '"A great wardrobe is one you dress from without thinking. Keep editing — the pieces that stay are the ones that truly belong."'
}

function styleScore(prefs) {
  if (!prefs?.length) return null
  return Math.min(58 + prefs.length * 7, 94)
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [wardrobeCount, setWardrobeCount] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('closet_profile')
    if (saved) setProfile(JSON.parse(saved))
    fetch('/api/wardrobe').then(r => r.json()).then(items => setWardrobeCount(items.length)).catch(() => {})
  }, [])

  const p = profile || {}
  const colors = PALETTE_COLORS[p.colorPalette] || null
  const score = styleScore(p.stylePrefs)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>

      {/* Top bar */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(251,248,241,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontWeight: 400, fontSize: '22px',
          color: 'var(--ink)',
        }}>
          <em style={{ fontFamily: "'Instrument Serif', serif" }}>Me</em>
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            background: 'var(--cream-deep)', border: '1px solid var(--line)',
            borderRadius: '100px', padding: '6px 14px', cursor: 'pointer',
            color: 'var(--ink)',
          }}
        >
          Edit
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 22px 32px' }}>

          {/* ── Hero: photo + name + swatches ── */}
          <div style={{
            display: 'flex', gap: '18px', padding: '22px 0 22px',
            borderBottom: '1px solid var(--line)',
          }}>
            {/* Photo */}
            <div style={{
              width: '100px', flexShrink: 0,
              aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden',
              border: '1px solid var(--line)', background: 'var(--cream-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {p.profilePhotoUrl ? (
                <img src={p.profilePhotoUrl} alt={p.name || 'Profile'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{
                  fontFamily: "'Fraunces', serif", fontSize: '40px',
                  fontStyle: 'italic', color: 'var(--muted)',
                }}>
                  {(p.name || 'U')[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={monoLabel}>Your profile</div>
                <div style={{
                  fontFamily: "'Fraunces', serif", fontWeight: 300,
                  fontSize: 'clamp(20px, 4vw, 26px)', letterSpacing: '-0.02em', lineHeight: 1.1,
                  marginTop: '4px',
                }}>
                  {p.name
                    ? <>Hello, <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: 'var(--terracotta)' }}>{p.name}</em></>
                    : <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '16px' }}>No profile yet</span>
                  }
                </div>
              </div>

              {/* Color swatches */}
              {colors && (
                <div>
                  <div style={{ ...monoLabel, marginBottom: '6px' }}>My palette</div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {colors.map((c, i) => (
                      <div key={i} style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: c, border: '1px solid rgba(0,0,0,0.08)',
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{
                    fontFamily: "'Fraunces', serif", fontSize: '22px',
                    fontWeight: 400, letterSpacing: '-0.02em',
                  }}>
                    {wardrobeCount ?? '—'}
                  </div>
                  <div style={monoLabel}>items</div>
                </div>
                {score && (
                  <div>
                    <div style={{
                      fontFamily: "'Fraunces', serif", fontSize: '22px',
                      fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--olive)',
                    }}>
                      {score}
                    </div>
                    <div style={monoLabel}>style score</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── My Style ── */}
          {p.stylePrefs?.length > 0 && (
            <Section label="My Style">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {p.stylePrefs.map(k => (
                  <span key={k} style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '6px 12px', borderRadius: '100px',
                    background: 'var(--ink)', color: 'var(--paper)',
                  }}>
                    {STYLE_LABELS[k] || k}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* ── Body Analysis ── */}
          <Section label="Body Analysis">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flexShrink: 0 }}>
                <RadarChart prefs={p.stylePrefs || []} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
                {/* Body type */}
                {p.bodyType && (
                  <div style={{
                    background: 'var(--cream)', borderRadius: '10px', padding: '12px 14px',
                  }}>
                    <div style={monoLabel}>Body shape</div>
                    <div style={{
                      fontFamily: "'Fraunces', serif", fontStyle: 'italic',
                      fontSize: '17px', marginTop: '4px',
                    }}>
                      {BODY_LABELS[p.bodyType] || p.bodyType}
                    </div>
                  </div>
                )}
                {/* Style score */}
                {score && (
                  <div style={{
                    background: 'var(--cream)', borderRadius: '10px', padding: '12px 14px',
                    borderLeft: '3px solid var(--olive)',
                  }}>
                    <div style={{ ...monoLabel, color: 'var(--olive)' }}>Style score</div>
                    <div style={{
                      fontFamily: "'Fraunces', serif", fontSize: '32px',
                      fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1,
                      marginTop: '4px',
                    }}>
                      {score}<span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300 }}>/100</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ── Style Tip ── */}
          <Section label="Style Tip">
            <div style={{
              background: 'var(--cream-deep)', borderRadius: '12px', padding: '16px 18px',
              borderLeft: '3px solid var(--terracotta)',
            }}>
              <div style={{ ...monoLabel, color: 'var(--terracotta)', marginBottom: '8px' }}>
                ★ Your tip
              </div>
              <p style={{
                fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300,
                fontSize: '15px', lineHeight: 1.55, color: 'var(--ink-soft)',
              }}>
                {getStyleTip(p)}
              </p>
            </div>
          </Section>

          {/* ── Settings / info ── */}
          <Section label="Settings">
            {[
              { label: 'Name', value: p.name },
              { label: 'Color palette', value: PALETTE_LABELS[p.colorPalette] },
              { label: 'Body type', value: BODY_LABELS[p.bodyType] },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0', borderBottom: '1px solid var(--line)',
              }}>
                <span style={monoLabel}>{row.label}</span>
                <span style={{
                  fontFamily: "'Fraunces', serif", fontStyle: 'italic',
                  fontSize: '15px', color: row.value ? 'var(--ink)' : 'var(--muted)',
                }}>
                  {row.value || '—'}
                </span>
              </div>
            ))}
          </Section>

          {!profile && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                fontFamily: "'Fraunces', serif", fontSize: '64px',
                fontStyle: 'italic', color: 'var(--line)', marginBottom: '16px',
              }}>C.</div>
              <p style={{
                fontFamily: "'Fraunces', serif", fontStyle: 'italic',
                fontSize: '16px', color: 'var(--muted)', marginBottom: '24px',
              }}>
                You haven't set up your profile yet.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                style={{
                  background: 'var(--ink)', color: 'var(--paper)',
                  border: 'none', borderRadius: '100px', padding: '14px 28px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px', fontWeight: 500, letterSpacing: '0.25em',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                Set up profile →
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ ...monoLabel, marginBottom: '12px' }}>{label}</div>
      {children}
    </div>
  )
}

const monoLabel = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '9px', letterSpacing: '0.22em',
  textTransform: 'uppercase', color: 'var(--muted)',
}
