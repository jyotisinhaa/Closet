import { useRef, useState } from 'react'
import { TAG_COLORS } from '../../lib/categories'
import { useWardrobe } from './useWardrobe'

function ItemCard({ item, onDelete }) {
  const [hover, setHover] = useState(false)
  const tag = TAG_COLORS[item.category] ?? { bg: '#EBE3D4', fg: '#3A322A' }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden',
        position: 'relative', border: '1px solid var(--line)',
        cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 8px 24px rgba(26,22,18,0.12)' : '0 1px 4px rgba(26,22,18,0.06)',
        background: 'var(--cream-deep)',
      }}
    >
      {item.image_url ? (
        <img src={item.image_url} alt={item.description || item.category}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%', background: tag.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fraunces', serif", fontSize: '32px', fontStyle: 'italic', color: tag.fg,
        }}>
          {(item.description || item.category || '?')[0].toUpperCase()}
        </div>
      )}

      {/* Category tag */}
      <div style={{
        position: 'absolute', bottom: '8px', left: '8px',
        background: tag.bg, color: tag.fg,
        fontFamily: "'JetBrains Mono', monospace", fontSize: '7px',
        padding: '3px 8px', borderRadius: '100px',
        letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
      }}>
        {item.category}
      </div>

      {/* Delete on hover */}
      {hover && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'rgba(26,22,18,0.7)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export default function Wardrobe() {
  const fileInputRef = useRef(null)
  const { items, loading, filter, setFilter, categories: CATEGORIES, visible, counts, addItem, deleteItem } = useWardrobe()

  const [showAdd,    setShowAdd]    = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [addError,   setAddError]   = useState('')

  // Add-item form state
  const [newPhoto,    setNewPhoto]    = useState(null)
  const [newCategory, setNewCategory] = useState('')
  const [newDesc,     setNewDesc]     = useState('')

  function openAdd() {
    setNewPhoto(null); setNewCategory(''); setNewDesc(''); setAddError('')
    setShowAdd(true)
  }
  function closeAdd() { setShowAdd(false) }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewPhoto({ file, preview: URL.createObjectURL(file) })
  }

  async function handleAddItem() {
    if (!newPhoto)    { setAddError('Please upload a photo.'); return }
    if (!newCategory) { setAddError('Please select a category.'); return }
    setUploading(true); setAddError('')
    try {
      await addItem({ file: newPhoto.file, category: newCategory, description: newDesc })
      closeAdd()
    } catch {
      setAddError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, padding: 'clamp(40px, 6vw, 72px) 28px 0',
        background: 'var(--paper)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          {/* Left spacer — mirrors button width to keep title truly centered */}
          <div style={{ flex: '0 0 160px' }} />

          {/* Centered title */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 300,
              fontSize: 'clamp(36px, 5.5vw, 56px)', letterSpacing: '-0.02em',
              lineHeight: 1.1, color: 'var(--ink)', marginBottom: '4px',
            }}>
              My Wardrobe
            </h1>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)',
            }}>
              {loading ? '—' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Right: Add Item button */}
          <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center' }}>
            <button onClick={openAdd} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'white', color: 'var(--terracotta)',
              border: '1.5px solid var(--terracotta)',
              borderRadius: '10px', padding: '10px 20px', cursor: 'pointer',
              fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 600,
              boxShadow: '0 2px 10px rgba(194,86,58,0.12)',
              transition: 'all 0.18s ease',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Item
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0 14px' }} />

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0 18px', scrollbarWidth: 'none' }}>
          {['All', ...CATEGORIES].map(cat => {
            const active = filter === cat
            const count  = cat === 'All' ? items.length : (counts[cat] || 0)
            return (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                flexShrink: 0, padding: '8px 18px', borderRadius: '100px', cursor: 'pointer',
                border: active ? '1.5px solid var(--terracotta)' : '1.5px solid var(--line)',
                background: active ? 'var(--terracotta)' : 'white',
                color: active ? 'white' : 'var(--ink-soft)',
                fontFamily: "'Inter Tight', sans-serif", fontSize: '13px',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: active ? '0 4px 14px rgba(194,86,58,0.3)' : '0 1px 3px rgba(26,22,18,0.06)',
                letterSpacing: active ? '0.01em' : '0',
              }}>
                {cat}
                {count > 0 && (
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.05em',
                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--cream-deep)',
                    color: active ? 'white' : 'var(--muted)',
                    padding: '2px 6px', borderRadius: '100px',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 40px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{ aspectRatio: '3/4', borderRadius: '14px', background: 'var(--cream-deep)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Hanger illustration */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', marginBottom: '24px',
              background: 'linear-gradient(135deg, var(--cream-deep), var(--paper))',
              border: '1.5px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(26,22,18,0.07)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 18H3.62a1 1 0 0 1-.65-1.76L12 9l9.03 7.24A1 1 0 0 1 20.38 18z"/>
                <path d="M12 9V5"/>
                <path d="M12 5a2 2 0 0 1 2-2"/>
              </svg>
            </div>

            <h3 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 400, fontStyle: 'italic',
              fontSize: '22px', color: 'var(--ink)', marginBottom: '8px', letterSpacing: '-0.01em',
            }}>
              {filter === 'All' ? 'Your wardrobe is empty' : `No ${filter} items yet`}
            </h3>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif", fontSize: '13px',
              color: 'var(--muted)', marginBottom: '28px', maxWidth: '240px', lineHeight: 1.5,
            }}>
              {filter === 'All'
                ? 'Start building your digital wardrobe by adding your first piece.'
                : `Add a ${filter.toLowerCase()} to see it here.`}
            </p>

            <button onClick={openAdd} style={{
              background: 'var(--terracotta)', color: 'white', border: 'none',
              borderRadius: '10px', padding: '12px 28px', cursor: 'pointer',
              fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: '0 4px 14px rgba(194,86,58,0.3)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add your first item
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {visible.map(item => <ItemCard key={item.id} item={item} onDelete={deleteItem} />)}
          </div>
        )}
      </div>

      {/* ── Add Item Modal ── */}
      {showAdd && (
        <div
          onClick={(e) => e.target === e.currentTarget && closeAdd()}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(26,22,18,0.5)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{
            background: 'var(--paper)', borderRadius: '20px',
            width: '100%', maxWidth: '480px', padding: '28px 28px 32px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '22px', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
                Add Item
              </h2>
              <button onClick={closeAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Photo upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: '160px', borderRadius: '14px', marginBottom: '20px',
                border: newPhoto ? '1.5px solid var(--line)' : '2px dashed var(--line)',
                background: newPhoto ? 'transparent' : 'rgba(212,203,184,0.15)',
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.15s',
              }}
            >
              {newPhoto ? (
                <img src={newPhoto.preview} alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 500 }}>Click to upload photo</div>
                  <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', marginTop: '4px' }}>JPG, PNG supported</div>
                </div>
              )}
              {newPhoto && (
                <button
                  onClick={(e) => { e.stopPropagation(); setNewPhoto(null) }}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(26,22,18,0.7)', color: 'white', border: 'none',
                    borderRadius: '100px', padding: '3px 10px', cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}
                >
                  Change
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />

            {/* Category tags */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                Category
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CATEGORIES.map(cat => {
                  const sel = newCategory === cat
                  return (
                    <button key={cat} type="button" onClick={() => setNewCategory(sel ? '' : cat)} style={{
                      padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
                      border: sel ? '1.5px solid var(--terracotta)' : '1.5px solid var(--line)',
                      background: sel ? 'rgba(194,86,58,0.07)' : 'white',
                      color: sel ? 'var(--terracotta)' : 'var(--ink-soft)',
                      fontFamily: "'Inter Tight', sans-serif", fontSize: '13px',
                      fontWeight: sel ? 600 : 400, transition: 'all 0.15s',
                    }}>
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                Description <span style={{ opacity: 0.5 }}>(optional)</span>
              </div>
              <input
                type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                placeholder="e.g. White linen shirt"
                style={{
                  width: '100%', border: '1.5px solid var(--line)', borderRadius: '10px',
                  padding: '12px 14px', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px',
                  background: 'white', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {addError && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'var(--terracotta)', letterSpacing: '0.05em', marginBottom: '12px' }}>
                {addError}
              </p>
            )}

            <button onClick={handleAddItem} disabled={uploading} style={{
              width: '100%', background: 'var(--terracotta)', color: 'white', border: 'none',
              borderRadius: '12px', padding: '15px',
              fontFamily: "'Inter Tight', sans-serif", fontSize: '15px', fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {uploading ? 'Adding…' : 'Add to Wardrobe'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
