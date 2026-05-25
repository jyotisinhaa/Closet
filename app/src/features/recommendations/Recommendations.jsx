import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Recommendations() {
  const navigate = useNavigate()
  const [recs, setRecs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch('/api/recommendations')
      .then(r => r.json())
      .then(data => { setRecs(data); setLoading(false) })
      .catch(() => { setError('Could not load recommendations.'); setLoading(false) })
  }, [])

  return (
    <div style={{ flex: 1, background: 'var(--paper)', overflowY: 'auto', padding: 'clamp(32px, 5vw, 56px) clamp(24px, 5vw, 72px) 80px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(24px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)', margin: '0 0 10px' }}>
            Styled for You
          </h1>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
            Pieces from top brands matched to what you already own.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: 0 }} />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'var(--muted)', marginBottom: '8px' }}>Matching your wardrobe…</div>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>Analysing style compatibility</div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', paddingTop: '80px', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--terracotta)' }}>
            {error}
          </div>
        )}

        {!loading && !error && recs.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: 'var(--ink)', marginBottom: '10px' }}>No recommendations yet</div>
            <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>Add items to your wardrobe first.</p>
            <button onClick={() => navigate('/wardrobe')} style={ctaBtn}>Go to Wardrobe</button>
          </div>
        )}

        {!loading && recs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {recs.map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
          </div>
        )}

      </div>
    </div>
  )
}

function RecommendationCard({ rec }) {
  const [hover, setHover]         = useState(false)
  const [tryingOn, setTryingOn]   = useState(false)
  const [renderUrl, setRenderUrl] = useState(null)
  const [tryOnError, setTryOnError] = useState(null)

  const { wardrobe_item, catalog_item, similarity_score, style_reason } = rec

  async function handleTryOn() {
    setTryingOn(true)
    setRenderUrl(null)
    setTryOnError(null)
    try {
      const res = await fetch('/api/tryon/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: catalog_item.image_url,
          category: catalog_item.category,
          wardrobe_image_url: wardrobe_item.image_url,
          wardrobe_category: wardrobe_item.category,
        }),
      })
      const data = await res.json()
      if (data.render_url) setRenderUrl(data.render_url)
      else setTryOnError(data.error || 'Render failed')
    } catch {
      setTryOnError('Could not connect')
    } finally {
      setTryingOn(false)
    }
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        padding: '20px 24px',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        boxShadow: hover ? '0 8px 28px rgba(26,22,18,0.1)' : '0 1px 4px rgba(26,22,18,0.05)',
        transform: hover ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Top row: wardrobe + plus + catalog + info */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 48px 160px 1fr', alignItems: 'center', gap: '20px' }}>

        {/* Wardrobe item */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--cream-deep)', marginBottom: '8px' }}>
            <img src={wardrobe_item.image_url} alt={wardrobe_item.category} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your {wardrobe_item.category}
          </div>
        </div>

        {/* Plus connector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--cream-deep)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontSize: '20px', color: 'var(--terracotta)' }}>
            +
          </div>
        </div>

        {/* Catalog item */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--cream-deep)', marginBottom: '8px' }}>
            <img src={catalog_item.image_url} alt={catalog_item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,22,18,0.7)', borderRadius: '100px', padding: '3px 8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
              Sponsored
            </div>
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {catalog_item.brand}
          </div>
        </div>

        {/* Info + actions */}
        <div style={{ paddingLeft: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: style_reason ? '6px' : '10px' }}>
            <div style={{ background: 'rgba(45,106,79,0.1)', color: '#2D6A4F', borderRadius: '100px', padding: '3px 10px', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 700 }}>
              ★ {similarity_score}% style match
            </div>
          </div>
          {style_reason && (
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.4 }}>
              {style_reason}
            </div>
          )}

          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '17px', color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: '4px', lineHeight: 1.2 }}>
            {catalog_item.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>From {catalog_item.brand}</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>${catalog_item.price}</span>
          </div>

          {catalog_item.style_tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {catalog_item.style_tags.map(tag => (
                <span key={tag} style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--ink-soft)', background: 'var(--cream-deep)', border: '1px solid var(--line)', borderRadius: '100px', padding: '2px 8px' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleTryOn}
              disabled={tryingOn}
              style={{ ...tryOnBtn, opacity: tryingOn ? 0.7 : 1, cursor: tryingOn ? 'wait' : 'pointer' }}
            >
              {tryingOn ? (
                <>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Rendering…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Try On
                </>
              )}
            </button>
            {catalog_item.store_url && (
              <a href={catalog_item.store_url} target="_blank" rel="noreferrer" style={shopBtn}>
                Shop Now
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </a>
            )}
          </div>

          {tryOnError && (
            <div style={{ marginTop: '8px', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', color: 'var(--terracotta)' }}>
              {tryOnError}
            </div>
          )}
        </div>
      </div>

      {/* Inline try-on result */}
      {renderUrl && (
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Virtual Try-On Result
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', width: '480px', flexShrink: 0, border: '1px solid var(--line)' }}>
              <img src={renderUrl} alt="Try-on render" style={{ width: '100%', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', paddingTop: '4px' }}>
              {/* Label */}
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                Now wearing
              </div>

              {/* Item name */}
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '22px', color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '10px' }}>
                {catalog_item.name}
              </div>

              {/* Brand + price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>
                  {catalog_item.brand}
                </span>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--line)', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  ${catalog_item.price}
                </span>
              </div>

              {/* Shop Now CTA */}
              {catalog_item.store_url && (
                <a href={catalog_item.store_url} target="_blank" rel="noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--ink)', color: '#fff',
                  border: 'none', borderRadius: '10px', padding: '12px 24px',
                  fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}>
                  Shop Now
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ctaBtn = {
  background: 'var(--ink)', color: '#fff',
  border: 'none', borderRadius: '10px', padding: '11px 24px',
  fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
  cursor: 'pointer',
}

const tryOnBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'var(--ink)', color: '#fff',
  border: '1.5px solid var(--ink)', borderRadius: '8px', padding: '8px 16px',
  fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 600,
  transition: 'all 0.15s',
}

const shopBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  background: 'transparent', color: 'var(--ink-soft)',
  border: '1.5px solid var(--line)', borderRadius: '8px', padding: '8px 16px',
  fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 500,
  cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s',
}
