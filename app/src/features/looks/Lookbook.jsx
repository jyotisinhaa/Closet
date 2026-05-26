import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiDelete } from '../../api/client'

const SOURCE_LABEL = { solo: 'Solo look', pairing: 'AI pairing', custom: 'Custom look' }

export default function Lookbook() {
  const navigate = useNavigate()
  const [looks, setLooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/looks').then(setLooks).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function remove(id) {
    try {
      await apiDelete(`/looks/${id}`)
      setLooks(ls => ls.filter(l => l.id !== id))
    } catch (err) {
      console.error('Remove look failed:', err.message)
    }
  }

  return (
    <div style={{ flex: 1, background: 'var(--paper)', overflowY: 'auto', padding: 'clamp(32px, 5vw, 56px) clamp(24px, 5vw, 72px) 80px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(24px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)', margin: '0 0 10px' }}>
            Liked Styles{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>♥</em>
          </h1>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
            The generated looks you loved, saved in one place.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: 0 }} />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', paddingTop: '80px', fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'var(--muted)' }}>
            Loading your looks…
          </div>
        )}

        {!loading && looks.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: 'var(--ink)', marginBottom: '10px' }}>No saved looks yet</div>
            <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>
              Tap the ♥ on any generated look in Try-On to save it here.
            </p>
            <button onClick={() => navigate('/tryon')} style={ctaBtn}>Go to Try On</button>
          </div>
        )}

        {!loading && looks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {looks.map(look => (
              <LookCard
                key={look.id}
                look={look}
                onRemove={() => remove(look.id)}
                onStyle={() => navigate('/tryon', { state: { baseLook: { render_url: look.render_url, title: look.title || look.item_name || 'Your saved look' } } })}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function LookCard({ look, onRemove, onStyle }) {
  const items = Array.isArray(look.item_image_urls) ? look.item_image_urls : []
  const price = parseFloat(look.price) || 0

  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--cream-deep)' }}>
        {look.render_url
          ? <img src={look.render_url} alt={look.title || 'Saved look'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px' }}>No image</div>}

        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,22,18,0.7)', color: '#fff', borderRadius: '100px', padding: '3px 9px', fontFamily: "'JetBrains Mono', monospace", fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {SOURCE_LABEL[look.source] || 'Look'}
        </div>

        <button onClick={onRemove} title="Remove from Lookbook" style={{
          position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%',
          border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.92)', color: 'var(--terracotta)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(26,22,18,0.2)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
          {look.title || look.item_name || 'Saved look'}
        </div>

        {items.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {items.slice(0, 5).map((url, i) => (
              <img key={i} src={url} alt="" style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--line)', display: 'block' }} />
            ))}
          </div>
        )}

        {price > 0 && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>New piece</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 600, color: 'var(--terracotta)' }}>${price.toFixed(2)}</span>
          </div>
        )}

        <button onClick={onStyle} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%',
          background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '9px', padding: '9px 14px',
          cursor: 'pointer', marginTop: '2px',
          fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 600,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Style this look
        </button>
      </div>
    </div>
  )
}

const ctaBtn = {
  background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '10px',
  padding: '11px 22px', cursor: 'pointer', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
}
