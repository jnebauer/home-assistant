import { useState, useEffect } from 'react'
import { ha, useHAState, useHAStates } from '../ws.js'
import { ENTITIES, ZONES, SCENE_BUTTONS } from '../config.js'

// ================================================================
//  Clock
// ================================================================
function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const h = now.getHours()
  const m = now.getMinutes().toString().padStart(2, '0')
  const s = now.getSeconds().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  const dayStr = now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 54, fontWeight: 600, lineHeight: 1, letterSpacing: -1, color: '#f3f6ff' }}>
          {h12}:{m}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#9fb0d8' }}>{ampm}</span>
          <span style={{ fontSize: 13, color: '#8ea0cc', letterSpacing: 0.5 }}>{s}s</span>
        </div>
      </div>
      <span style={{ fontSize: 13, color: '#9fb0d8', letterSpacing: 0.3 }}>{dayStr}</span>
    </div>
  )
}

// ================================================================
//  PIR Chips
// ================================================================
const PIR_DEFS = [
  { label: 'Kitchen',    entity: ENTITIES.pir.kitchen },
  { label: 'Piano Nook', entity: ENTITIES.pir.piano },
  { label: 'Hallway',    entity: ENTITIES.pir.hallway },
]

function PIRChips() {
  const states = useHAStates(PIR_DEFS.map(p => p.entity))
  return (
    <div className="glass" style={{ padding: '10px 14px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9fb0d8" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Motion</span>
      </div>
      {PIR_DEFS.map((def, i) => {
        const active = states[i]?.state === 'on'
        return (
          <div key={def.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: active ? '#ffae3d' : '#2dd4bf',
              flexShrink: 0,
              animation: active ? 'glowPulse 1.4s ease-in-out infinite' : 'none',
              boxShadow: active ? '0 0 8px #ffae3d99' : '0 0 6px #2dd4bf55',
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#ffc878' : '#cdd6ee' }}>{def.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ================================================================
//  Weather Card
// ================================================================
function WeatherCard() {
  const weather = useHAState(ENTITIES.weather)
  const temp    = weather?.attributes?.temperature ?? '--'
  const cond    = weather?.state ?? 'unknown'

  const condLabel = cond.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="glass" style={{ padding: '10px 14px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9fb0d8" strokeWidth="1.6">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 600, color: '#f3f6ff' }}>{temp}°</div>
      <div style={{ fontSize: 11, color: '#9fb0d8', lineHeight: 1.3 }}>{condLabel}<br/>Highgate Hill</div>
    </div>
  )
}

// ================================================================
//  Alarm Toggle (stub — Inception not yet integrated)
// ================================================================
function AlarmToggle() {
  const [armed, setArmed] = useState(false)

  // When Inception is integrated, replace with:
  //   const alarmState = useHAState(ENTITIES.alarm)
  //   armed = alarmState?.state !== 'disarmed'

  const toggle = () => {
    if (!ENTITIES.alarm) {
      setArmed(a => !a) // local stub
      return
    }
    if (armed) {
      ha.callService('alarm_control_panel', 'alarm_disarm', {}, { entity_id: ENTITIES.alarm })
    } else {
      ha.callService('alarm_control_panel', 'alarm_arm_away', {}, { entity_id: ENTITIES.alarm })
    }
  }

  return (
    <div className="glass" style={{ padding: '10px 14px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center', cursor: 'pointer' }} onClick={toggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={armed ? '#2dd4bf' : '#8ea0cc'} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Alarm</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: armed ? '#2dd4bf' : '#8ea0cc' }}>
        {ENTITIES.alarm ? (armed ? 'Armed' : 'Disarmed') : 'Not set up'}
      </div>
      <button className={`pill-switch ${armed ? 'on' : 'off'}`} onClick={e => { e.stopPropagation(); toggle() }} />
    </div>
  )
}

// ================================================================
//  Climate Zones Panel
// ================================================================
function ZoneTile({ zone }) {
  const state = useHAState(zone.entity)
  const isOn  = state?.state !== 'off' && state?.state !== 'unavailable' && state?.state !== 'unknown'
  const setTemp = state?.attributes?.temperature ?? 22
  const curTemp = state?.attributes?.current_temperature ?? '--'

  const toggleZone = () => {
    if (isOn) {
      ha.setHvacMode(zone.entity, 'off')
    } else {
      ha.setHvacMode(zone.entity, 'fan_only')
    }
  }

  const adjustTemp = (delta) => {
    const next = Math.min(30, Math.max(16, (setTemp || 22) + delta))
    ha.setClimateTemp(zone.entity, next)
  }

  return (
    <div style={{
      background: isOn ? 'rgba(56,224,255,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${isOn ? 'rgba(56,224,255,0.25)' : 'rgba(255,255,255,0.09)'}`,
      borderRadius: 12,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      transition: 'all 0.2s',
      boxShadow: isOn ? '0 0 12px rgba(56,224,255,0.1)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: isOn ? '#f3f6ff' : '#9fb0d8' }}>{zone.name}</span>
        <button
          onClick={toggleZone}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: isOn ? '#2dd4bf' : 'rgba(255,255,255,0.1)',
            border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
            boxShadow: isOn ? '0 0 10px rgba(45,212,191,0.5)' : 'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isOn ? '#0a1330' : '#cdd6ee'} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>
      </div>
      {isOn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => adjustTemp(-1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#f3f6ff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, color: '#f3f6ff', lineHeight: 1 }}>{setTemp}°</div>
            <div style={{ fontSize: 10, color: '#38e0ff', marginTop: 2 }}>Now {curTemp}°</div>
          </div>
          <button onClick={() => adjustTemp(+1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#f3f6ff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#8ea0cc' }}>Off</span>
          <span style={{ fontSize: 11, color: '#9fb0d8' }}>Now {curTemp}°</span>
        </div>
      )}
    </div>
  )
}

function ClimateZones() {
  const [expanded, setExpanded] = useState(false)
  const visibleZones = expanded ? ZONES : ZONES.filter(z => z.common)

  const onCount = ZONES.filter(z => {
    const s = ha.getStateStr(z.entity)
    return s !== 'off' && s !== 'unavailable' && s !== 'unknown'
  }).length

  return (
    <div className="glass" style={{ flex: '1.9', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb0d8" strokeWidth="1.8"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Climate Zones</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#38e0ff', fontWeight: 600 }}>{onCount} of 8 on</span>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'rgba(56,224,255,0.12)', border: '1px solid rgba(56,224,255,0.25)', borderRadius: 20, color: '#38e0ff', fontSize: 11, fontWeight: 600, padding: '3px 10px', cursor: 'pointer' }}
          >
            {expanded ? 'Show less' : 'All zones ›'}
          </button>
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: expanded ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
        gap: 8,
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
      }}>
        {visibleZones.map(zone => <ZoneTile key={zone.id} zone={zone} />)}
      </div>
    </div>
  )
}

// ================================================================
//  Camera Tiles (2×2)
// ================================================================
const CAM_DEFS = [
  { label: 'Garage',      entity: ENTITIES.cameras.garage     },
  { label: 'Pool',        entity: ENTITIES.cameras.pool       },
  { label: 'Julia St',    entity: ENTITIES.cameras.julia      },
  { label: 'Chermside',   entity: ENTITIES.cameras.chermside  },
]

function CameraGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 6, flex: 1, minHeight: 0 }}>
      {CAM_DEFS.map(cam => (
        <div key={cam.label} style={{
          background: 'linear-gradient(135deg, rgba(10,18,42,0.9), rgba(15,28,64,0.8))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 10,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
        }}>
          {/* Camera icon */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.2 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f3f6ff" strokeWidth="1.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          {/* LIVE badge */}
          <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,93,108,0.2)', border: '1px solid rgba(255,93,108,0.4)', borderRadius: 6, padding: '2px 6px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff5d6c', animation: 'livePulse 1.6s ease-in-out infinite' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#ff9aa5' }}>LIVE</span>
          </div>
          {/* Label */}
          <div style={{ position: 'absolute', bottom: 5, left: 7, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 }}>{cam.label}</div>
        </div>
      ))}
    </div>
  )
}

// ================================================================
//  Garage Doors
// ================================================================
function GarageDoors() {
  const chermState = useHAState(ENTITIES.covers.garage_chermside)
  const chermOpen  = chermState?.state === 'open' || chermState?.state === 'opening'

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {/* Chermside St garage */}
      <div className="glass" style={{ flex: 1, padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: '#f3f6ff' }}>Chermside</div>
            <div style={{ fontSize: 10, color: chermOpen ? '#ff5d6c' : '#2dd4bf', fontWeight: 600, marginTop: 2 }}>
              {chermState?.state ?? 'unknown'}
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9fb0d8" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={() => ha.openCover(ENTITIES.covers.garage_chermside)}
            style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: '1px solid rgba(255,93,108,0.4)', background: chermOpen ? 'rgba(255,93,108,0.2)' : 'rgba(255,255,255,0.06)', color: '#ff9aa5', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >▲ Open</button>
          <button
            onClick={() => ha.closeCover(ENTITIES.covers.garage_chermside)}
            style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: '1px solid rgba(45,212,191,0.4)', background: !chermOpen ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.06)', color: '#5eead4', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >▼ Close</button>
        </div>
      </div>
      {/* Julia St garage (not installed) */}
      <div className="glass" style={{ flex: 1, padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.45 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: '#f3f6ff' }}>Julia St</div>
            <div style={{ fontSize: 10, color: '#8ea0cc', fontWeight: 600, marginTop: 2 }}>Not installed</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9fb0d8" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button disabled style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#8ea0cc', fontSize: 11, fontWeight: 700, cursor: 'not-allowed' }}>▲ Open</button>
          <button disabled style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#8ea0cc', fontSize: 11, fontWeight: 700, cursor: 'not-allowed' }}>▼ Close</button>
        </div>
      </div>
    </div>
  )
}

// ================================================================
//  Battery Card (Sigenergy stub)
// ================================================================
function BatteryCard() {
  // TODO: wire to Sigenergy sensor entities when integrated
  const soc    = ENTITIES.energy.battery_soc   ? (useHAState(ENTITIES.energy.battery_soc)?.state   ?? null) : null
  const power  = ENTITIES.energy.battery_power ? (useHAState(ENTITIES.energy.battery_power)?.state ?? null) : null
  const socNum = soc ? parseFloat(soc) : null

  return (
    <div className="glass" style={{ padding: '10px 14px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb0d8" strokeWidth="1.8"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Battery</span>
        </div>
        <span style={{ fontSize: 12, color: '#2dd4bf', fontWeight: 700 }}>
          {socNum !== null ? `${Math.round(socNum)}%` : '—'}
          {power !== null ? ` · ${parseFloat(power) > 0 ? '+' : ''}${power} kW` : ' · Sigenergy pending'}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${socNum ?? 0}%`,
          background: 'linear-gradient(90deg, #2dd4bf, #5eead4)',
          borderRadius: 4,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

// ================================================================
//  Scene Bar
// ================================================================
const SCENE_ICONS = {
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sunrise: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="2" y1="18" x2="4" y2="18"/><line x1="20" y1="18" x2="22" y2="18"/><line x1="19.78" y1="10.22" x2="18.36" y2="11.64"/></svg>,
  utensils: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="11"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  music: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  film: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  lamp: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2h8l4 10H4L8 2z"/><path d="M12 12v6"/><path d="M8 22h8"/></svg>,
}

function SceneBar({ activeScene, onScene }) {
  return (
    <div style={{ display: 'flex', gap: 7, height: 68, flexShrink: 0 }}>
      {SCENE_BUTTONS.map(scene => {
        const isActive = activeScene === scene.id
        const isGoodNight = scene.prominent
        return (
          <button
            key={scene.id}
            onClick={() => onScene(scene)}
            style={{
              flex: isGoodNight ? 1.6 : 1,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 5,
              transition: 'all 0.2s',
              background: isGoodNight
                ? (isActive ? 'linear-gradient(135deg,#9b6fff,#6b52d6)' : 'linear-gradient(135deg,#7c83ff,#5b62d6)')
                : isActive
                  ? 'rgba(56,224,255,0.18)'
                  : 'rgba(255,255,255,0.06)',
              border: isActive && !isGoodNight ? '1px solid rgba(56,224,255,0.4)' : '1px solid rgba(255,255,255,0.11)',
              color: isGoodNight ? '#f3f6ff' : isActive ? '#38e0ff' : '#9fb0d8',
              boxShadow: isGoodNight ? '0 4px 18px rgba(92,98,214,0.4)' : 'none',
            }}
          >
            {SCENE_ICONS[scene.icon] || null}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{scene.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ================================================================
//  HomeTab — main layout
// ================================================================
export default function HomeTab() {
  const [activeScene, setActiveScene] = useState(null)

  const handleScene = (scene) => {
    ha.activateScene(scene.entity)
    setActiveScene(scene.id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: 10, flexShrink: 0 }}>
        <Clock />
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 9 }}>
          <PIRChips />
          <AlarmToggle />
          <WeatherCard />
        </div>
      </div>

      {/* Body row */}
      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        {/* Left — Climate */}
        <ClimateZones />

        {/* Right column */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <CameraGrid />
          <GarageDoors />
          <BatteryCard />
        </div>
      </div>

      {/* Scene bar */}
      <SceneBar activeScene={activeScene} onScene={handleScene} />
    </div>
  )
}
