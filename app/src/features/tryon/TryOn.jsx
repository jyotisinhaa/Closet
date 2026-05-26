import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTryOn } from './useTryOn'
import { getStylesForCategory } from '../../lib/categories'

const COLOR_SWATCHES = [
  '#1a1612', '#3a322a', '#c2563a', '#e63946',
  '#f4a261', '#e76f51', '#c9a961', '#5b6a3f',
  '#2d6a4f', '#264653', '#4a6b8a', '#a8dadc',
  '#6d6875', '#b5838d', '#8c8273', '#d4cbb8',
  '#1d3557', '#9b5de5', '#a7c4a0', '#6f4e37',
  '#00b4d8', '#7f7f7f', '#e8d5b7', '#fbf8f1',
]

export default function TryOn() {
  const fileInputRef = useRef(null)
  const videoRef     = useRef(null)
  const streamRef    = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()
  // Set when arriving from the Lookbook via "Style this look": the saved look's
  // render becomes the base the new item is layered onto.
  const baseLook = location.state?.baseLook || null

  const { categories, category, setCategory, generating, genStatus, genError, generate } = useTryOn()

  const [photo,       setPhoto]       = useState(null)
  const [showCamera,  setShowCamera]  = useState(false)
  const [price,       setPrice]       = useState('')
  const [store,       setStore]       = useState('')
  const [color,       setColor]       = useState('')
  const [style,       setStyle]       = useState('')
  const [dragOver,    setDragOver]    = useState(false)

  // Style presets only apply to accessory categories (Hat/Scarf/Bag/Shoes).
  // Reset the choice whenever the category changes so a stale style isn't sent.
  const styleOptions = getStylesForCategory(category)
  useEffect(() => { setStyle('') }, [category])

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto({ file, preview: URL.createObjectURL(file) })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setPhoto({ file, preview: URL.createObjectURL(file) })
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      setShowCamera(true)
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 50)
    } catch {
      fileInputRef.current?.click()
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      setPhoto({ file, preview: URL.createObjectURL(blob) })
      closeCamera()
    }, 'image/jpeg', 0.92)
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setShowCamera(false)
  }

  const priceNum     = parseFloat(price) || 0
  const projectedTotal = priceNum

  return (
    <>
    <div style={{
      flex: 1, background: 'var(--paper)', overflowY: 'auto',
      padding: 'clamp(40px, 6vw, 72px) clamp(24px, 6vw, 80px) 80px',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>


        {/* ── Hero heading ── */}
        <div style={{ marginBottom: '36px', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Fraunces', serif", fontWeight: 600,
            fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.02em',
            lineHeight: 1.1, color: 'var(--ink)', marginBottom: '0',
          }}>
            {baseLook ? (
              <>Add to{' '}
                <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>
                  this look.
                </em>
              </>
            ) : (
              <>Wear it before{' '}
                <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>
                  you buy it.
                </em>
              </>
            )}
          </h1>
          <p style={{
            fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300,
            fontSize: '17px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6,
            maxWidth: '520px', margin: '12px auto 0',
          }}>
            {baseLook
              ? "Upload a new piece and we'll layer it onto your saved look — see how it changes the outfit."
              : "Upload a photo of something you're considering and we'll show you exactly how it looks on you — paired with pieces you already own."}
          </p>
          {!baseLook && (
            <button
              onClick={() => navigate('/wardrobe')}
              style={{
                marginTop: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--terracotta)',
              }}
            >
              No new item? Try on pieces from your wardrobe →
            </button>
          )}
        </div>

        {/* ── Base-look banner (when styling on top of a saved look) ── */}
        {baseLook && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            background: 'var(--cream-deep)', border: '1.5px solid var(--line)',
            borderRadius: '14px', padding: '12px 16px', marginBottom: '28px',
          }}>
            <div style={{ width: '52px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--cream)', border: '1px solid var(--line)' }}>
              {baseLook.render_url
                ? <img src={baseLook.render_url} alt={baseLook.title || 'Saved look'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: '4px' }}>
                Styling on top of
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '16px', color: 'var(--ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {baseLook.title || 'Your saved look'}
              </div>
            </div>
            <button
              onClick={() => navigate('/tryon', { replace: true, state: null })}
              style={{
                background: 'transparent', color: 'var(--ink-soft)', border: '1.5px solid var(--line)',
                borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
                fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap',
              }}
            >
              Start from my photo
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--line)', margin: '0 0 36px' }} />

        {/* ── Section 1: Upload ── */}
        <div style={{ marginBottom: '24px' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '24px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                Add what you're considering
              </div>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>
                Spotted something you love? Upload it and we'll style it with what you own.
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => !photo && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              borderRadius: '16px', overflow: 'hidden',
              border: dragOver ? '2px dashed var(--terracotta)' : photo ? '1.5px solid var(--line)' : '2px dashed var(--line)',
              background: dragOver ? 'rgba(194,86,58,0.04)' : photo ? 'transparent' : 'var(--cream-deep)',
              minHeight: '200px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: photo ? 'default' : 'pointer', transition: 'all 0.18s ease',
            }}
          >
            {photo ? (
              <>
                <img
                  src={photo.preview} alt="Uploaded garment"
                  style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', display: 'block', padding: '16px' }}
                />
                <button
                  onClick={e => { e.stopPropagation(); setPhoto(null) }}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(26,22,18,0.65)', color: 'white', border: 'none',
                    borderRadius: '100px', padding: '4px 12px', cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}
                >
                  Change
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '30px', color: 'var(--ink)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  Drop a photo here
                </div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, maxWidth: '320px', margin: '0 auto 20px' }}>
                  Drag the garment or the link, or upload one from your device. High-quality photos give the best results.
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={e => { e.stopPropagation(); openCamera() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'var(--ink)', color: 'white', border: 'none',
                      borderRadius: '8px', padding: '9px 18px', cursor: 'pointer',
                      fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 500,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Take photo
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'white', color: 'var(--ink)',
                      border: '1.5px solid var(--line)',
                      borderRadius: '8px', padding: '9px 18px', cursor: 'pointer',
                      fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 500,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload
                  </button>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <span style={{ fontSize: '6px', color: 'var(--muted)', marginRight: '5px', verticalAlign: 'middle' }}>◆</span>
                  <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>
                    Supports JPG, PNG and WEBP files up to 10MB
                  </span>
                </div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />

        </div>

        {/* ── Section 2: Item details ── */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '24px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Item details
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>
            A few quick details, then we'll generate looks together
          </div>
        </div>

        <div style={{
          border: '1.5px solid var(--line)', borderRadius: '16px',
          background: 'var(--paper)',
        }}>

          {/* Form */}
          <div style={{ padding: '20px 24px 24px' }}>

            {/* Row 1: Price | Store | Color | … */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>

              {/* Price */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ ...labelStyle, fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em', textTransform: 'none' }}>Price</div>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--muted)',
                  }}>$</span>
                  <input
                    type="number" value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '150px', height: '42px', border: '1.5px solid var(--line)', borderRadius: '8px',
                      padding: '0 14px 0 26px', boxSizing: 'border-box',
                      fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 500,
                      color: 'var(--ink)', background: 'white', outline: 'none',
                      boxShadow: '0 1px 4px rgba(26,22,18,0.06)',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--terracotta)'; e.target.style.boxShadow = '0 0 0 3px rgba(194,86,58,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = '0 1px 4px rgba(26,22,18,0.06)' }}
                  />
                </div>
              </div>

              {/* Store */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ ...labelStyle, fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em', textTransform: 'none' }}>
                  Store <span style={{ fontWeight: 400, fontSize: '10px', color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </div>
                <input
                  type="text" value={store} onChange={e => setStore(e.target.value)}
                  placeholder="e.g. Target"
                  style={{
                    width: '150px', height: '42px', border: '1.5px solid var(--line)', borderRadius: '8px',
                    padding: '0 14px', boxSizing: 'border-box',
                    fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 500,
                    color: 'var(--ink)', background: 'white', outline: 'none',
                    boxShadow: '0 1px 4px rgba(26,22,18,0.06)',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--terracotta)'; e.target.style.boxShadow = '0 0 0 3px rgba(194,86,58,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = '0 1px 4px rgba(26,22,18,0.06)' }}
                />
              </div>

              {/* Color */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ ...labelStyle, fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em', textTransform: 'none' }}>Color</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '220px', paddingTop: '4px' }}>
                  {COLOR_SWATCHES.map(hex => (
                    <button
                      key={hex} onClick={() => setColor(color === hex ? '' : hex)}
                      style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: hex, border: 'none', cursor: 'pointer', padding: 0,
                        outline: color === hex ? `2px solid ${hex}` : 'none',
                        outlineOffset: '2px',
                        boxShadow: '0 1px 3px rgba(26,22,18,0.18)',
                        transition: 'transform 0.15s',
                        transform: color === hex ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Row 2: Category (full width) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ ...labelStyle, fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em', textTransform: 'none' }}>Category</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map(cat => {
                  const active = category === cat
                  return (
                    <button key={cat} onClick={() => setCategory(cat)} style={{
                      padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', border: 'none',
                      background: active ? 'var(--ink)' : 'var(--cream-deep)',
                      color: active ? 'white' : 'var(--ink-soft)',
                      fontFamily: "'Inter Tight', sans-serif", fontSize: '12px',
                      fontWeight: active ? 600 : 400, transition: 'all 0.15s',
                    }}>
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Row 3: Style (accessories only) */}
            {styleOptions.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ ...labelStyle, fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em', textTransform: 'none' }}>
                    Style <span style={{ fontWeight: 400, fontSize: '10px', color: 'var(--muted)' }}>(how we style the rest of the look)</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[{ value: '', label: 'Auto' }, ...styleOptions].map(opt => {
                    const active = style === opt.value
                    return (
                      <button key={opt.value || 'auto'} onClick={() => setStyle(opt.value)} style={{
                        padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', border: 'none',
                        background: active ? 'var(--terracotta)' : 'var(--cream-deep)',
                        color: active ? 'white' : 'var(--ink-soft)',
                        fontFamily: "'Inter Tight', sans-serif", fontSize: '12px',
                        fontWeight: active ? 600 : 400, transition: 'all 0.15s',
                      }}>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--line)', margin: '20px 0 16px' }} />

            {/* Bottom row: Price breakdown + Generate button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Item price', val: `$${priceNum.toFixed(2)}` },
                  { label: 'From your wardrobe', val: '$0.00' },
                  { label: 'Outfit total', val: `$${projectedTotal.toFixed(2)}`, bold: true, accent: true },
                ].map(({ label, val, bold, accent }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: accent ? 'var(--terracotta)' : 'var(--muted)', marginBottom: '3px' }}>
                      {label}
                    </div>
                    <div style={{
                      fontFamily: "'Fraunces', serif", fontSize: bold ? '20px' : '15px',
                      fontWeight: bold ? 600 : 400, color: accent ? 'var(--terracotta)' : 'var(--ink)', letterSpacing: '-0.01em',
                    }}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => generate({ photo, price, store, color, style, baseImageUrl: baseLook?.render_url || '' })}
                disabled={generating || !photo}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#2d7a3a',
                  color: 'white',
                  border: 'none', borderRadius: '10px', padding: '12px 24px',
                  cursor: !photo || generating ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600,
                  opacity: generating ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(45,122,58,0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                {generating ? 'Generating…' : 'Generate Looks'}
                {!generating && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>
            </div>
          {/* Status / error */}
          {generating && (
            <div style={{ marginTop: '16px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              ◆ {genStatus}
            </div>
          )}
          {genError && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(194,86,58,0.08)', border: '1px solid rgba(194,86,58,0.25)', borderRadius: '8px', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--terracotta)' }}>
              {genError}
            </div>
          )}
          </div>
        </div>

      </div>
    </div>

    {/* ── Camera modal ── */}
    {showCamera && (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        zIndex: 200, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '24px',
      }}>
        <video ref={videoRef} autoPlay playsInline
          style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '16px', background: '#111', display: 'block' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={capturePhoto} style={{
            background: 'var(--terracotta)', color: 'white', border: 'none',
            borderRadius: '100px', padding: '14px 32px',
            fontFamily: "'Inter Tight', sans-serif", fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Capture
          </button>
          <button onClick={closeCamera} style={{
            background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '100px', padding: '14px 28px',
            fontFamily: "'Inter Tight', sans-serif", fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </div>
    )}
    </>
  )
}

const labelStyle = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: 'var(--ink-soft)', marginBottom: '6px', display: 'block',
}
