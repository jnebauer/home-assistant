import { useHAState } from '../ws.js'
import { ha } from '../ws.js'
import { ENTITIES } from '../config.js'

// ================================================================
//  Camera tile (larger version for Security tab)
// ================================================================
const SECURITY_CAMS = [
  { label: 'Garage',    entity: ENTITIES.cameras.garage    },
  { label: 'Pool',      entity: ENTITIES.cameras.pool      },
  { label: 'Julia St',  entity: ENTITIES.cameras.julia     },
  { label: 'Chermside', entity: ENTITIES.cameras.chermside },
]

function BigCameraGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gridTemplateRows: 'repeat(2,1fr)', gap: 8, flex: 1.5, minHeight: 0 }}>
      {SECURITY_CAMS.map(cam => (
        <div key={cam.label} style={{
          background: 'linear-gradient(135deg, rgba(10,18,42,0.9), rgba(15,28,64,0.85))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Camera icon placeholder */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f3f6ff" strokeWidth="1.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </div>
          {/* LIVE badge */}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,93,108,0.2)', border: '1px solid rgba(255,93,108,0.4)', borderRadius: 6, padding: '3px 8px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5d6c', animation: 'livePulse 1.6s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#ff9aa5' }}>LIVE</span>
          </div>
          {/* Label */}
          <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}>{cam.label}</div>
          {/* go2rtc placeholder note */}
          {!cam.entity && (
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#8ea0cc', whiteSpace: 'nowrap' }}>go2rtc pending</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ================================================================
//  Garage door cards (full card with tap-to-toggle)
// ================================================================
function GarageCard({ label, entity, installed = true }) {
  const state  = useHAState(entity)
  const isOpen = state?.state === 'open' || state?.state === 'opening'

  const toggle = () => {
    if (!entity) return
    if (isOpen) ha.closeCover(entity)
    else ha.openCover(entity)
  }

  return (
    <div
      className="glass"
      onClick={toggle}
      style={{
        flex: 1, padding: '12px 14px', borderRadius: 14,
        display: 'flex', flexDirection: 'column', gap: 8,
        cursor: installed ? 'pointer' : 'default',
        opacity: installed ? 1 : 0.4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9fb0d8" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f3f6ff' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: isOpen ? '#ff5d6c' : installed ? '#2dd4bf' : '#8ea0cc' }}>
        {installed ? (state?.state ?? 'unknown') : 'Not installed'}
      </div>
      {installed && (
        <div style={{ fontSize: 11, color: '#9fb0d8' }}>
          Tap to {isOpen ? 'close' : 'open'}
        </div>
      )}
    </div>
  )
}

// ================================================================
//  Motion sensors
// ================================================================
const PIR_DEFS = [
  { label: 'Kitchen',    entity: ENTITIES.pir.kitchen },
  { label: 'Piano Nook', entity: ENTITIES.pir.piano   },
  { label: 'Hallway',    entity: ENTITIES.pir.hallway  },
]

function MotionSensors() {
  return (
    <div className="glass" style={{ padding: '12px 14px', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Motion Sensors</div>
      {PIR_DEFS.map(def => {
        const [state, setState] = [useHAState(def.entity), null]
        const active = state?.state === 'on'
        return (
          <div key={def.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: active ? 'rgba(255,174,61,0.2)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${active ? 'rgba(255,174,61,0.5)' : 'rgba(255,255,255,0.12)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#ffae3d' : '#8ea0cc'} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.31M17.7 6.3a8 8 0 0 1 0 11.31M3.5 3.5a12 12 0 0 0 0 16.97M20.5 3.5a12 12 0 0 1 0 16.97"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f3f6ff' }}>{def.label}</div>
              <div style={{ fontSize: 11, color: active ? '#ffae3d' : '#8ea0cc', marginTop: 2 }}>
                {active ? 'Motion detected now' : 'No motion · clear'}
              </div>
            </div>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: active ? '#ffae3d' : '#2dd4bf',
              boxShadow: active ? '0 0 12px #ffae3d99' : '0 0 6px #2dd4bf66',
              animation: active ? 'glowPulse 1.4s ease-in-out infinite' : 'none',
            }} />
          </div>
        )
      })}
    </div>
  )
}

// ================================================================
//  Security Tab
// ================================================================
export default function SecurityTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 600, color: '#f3f6ff' }}>Security</div>
        <div style={{ fontSize: 12, color: '#9fb0d8', marginTop: 2 }}>4 cameras · live</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        {/* Left — cameras */}
        <BigCameraGrid />

        {/* Right column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Garage doors */}
          <div style={{ display: 'flex', gap: 8 }}>
            <GarageCard
              label="Chermside"
              entity={ENTITIES.covers.garage_chermside}
              installed={true}
            />
            <GarageCard
              label="Julia St"
              entity={ENTITIES.covers.garage_julia}
              installed={false}
            />
          </div>

          {/* Motion sensors */}
          <MotionSensors />

          {/* Alarm panel stub */}
          <div className="glass" style={{ padding: '12px 14px', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8ea0cc" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Inception Alarm</span>
            </div>
            <div style={{ fontSize: 12, color: '#8ea0cc' }}>Integration not yet configured in HA. Once Inception is set up, alarm control will appear here.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
