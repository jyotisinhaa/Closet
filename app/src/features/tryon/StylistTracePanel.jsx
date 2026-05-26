import { useState } from 'react'

// Collapsible reasoning trace from the multi-step stylist agent — each step is
// a Nemotron-backed sub-agent (or a deterministic tool) with a one-line summary.
// Default collapsed so non-agentic users see a clean page; expand to show the
// full plan → tool → observation chain that produced the honest take.
//
// Shared between TryOnResult and TryOnStyled so the accessory path (which skips
// the regular Results page and lands users straight on the styled picker) still
// surfaces the agent's reasoning.
export default function StylistTracePanel({ trace, versatility, gap, fitNote }) {
  const [open, setOpen] = useState(false)
  if (!Array.isArray(trace) || trace.length === 0) return null

  return (
    <div style={{
      background: 'var(--cream-deep)', borderRadius: '14px', border: '1.5px solid var(--line)',
      padding: '14px 18px', marginBottom: '20px',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--terracotta)', fontSize: '12px' }}>◆</span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
            How the stylist thought about this
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--terracotta)', background: 'rgba(194,86,58,0.08)', borderRadius: '100px', padding: '2px 8px',
          }}>
            Nemotron · {trace.length} step{trace.length === 1 ? '' : 's'}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s', color: 'var(--ink-soft)' }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {open && (
        <div style={{ marginTop: '14px', borderTop: '1px solid var(--line)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {trace.map((s) => (
            <div key={s.step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
                background: 'var(--ink)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600,
              }}>{s.step}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  {s.title}
                </div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                  {s.detail}
                </div>
              </div>
            </div>
          ))}

          {/* Quick numeric callouts the trace lines reference. */}
          {(versatility || gap || fitNote) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', paddingTop: '12px', borderTop: '1px dashed var(--line)' }}>
              {versatility && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--olive)', background: 'rgba(91,106,63,0.1)', borderRadius: '6px', padding: '4px 8px' }}>
                  Versatility {versatility.score}/100
                </span>
              )}
              {gap && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: gap.fills_gap ? 'var(--olive)' : 'var(--muted)', background: gap.fills_gap ? 'rgba(91,106,63,0.1)' : 'var(--cream)', borderRadius: '6px', padding: '4px 8px' }}>
                  {gap.fills_gap ? 'Fills a gap' : 'No gap filled'}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
