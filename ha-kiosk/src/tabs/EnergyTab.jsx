import { useHAState } from '../ws.js'
import { ENTITIES } from '../config.js'

// ================================================================
//  Power Flow SVG diagram
//  Nodes: Solar (top), Battery (left), Grid (right), Home (bottom)
//  When Sigenergy is connected, lines animate and show live kW.
// ================================================================
function PowerFlowDiagram({ solar, battery, grid, home }) {
  const hasData = solar !== null

  const NodeBox = ({ x, y, label, value, unit, color, icon }) => (
    <g transform={`translate(${x},${y})`}>
      <rect x="-52" y="-36" width="104" height="72" rx="12"
        fill="rgba(255,255,255,0.06)"
        stroke={color + '55'}
        strokeWidth="1"
      />
      <text x="0" y="-10" textAnchor="middle" fill="#9fb0d8" fontSize="10" fontWeight="700" letterSpacing="1" textTransform="uppercase">{label}</text>
      <text x="0" y="18" textAnchor="middle" fill={color}
        fontSize="22" fontWeight="700"
        fontFamily="'Space Grotesk', sans-serif">
        {hasData ? `${value}` : '—'}
      </text>
      <text x="0" y="34" textAnchor="middle" fill="#8ea0cc" fontSize="10">{unit}</text>
    </g>
  )

  const FlowLine = ({ x1, y1, x2, y2, active, color }) => {
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    return (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={active ? color : 'rgba(255,255,255,0.1)'}
        strokeWidth="2"
        strokeDasharray="8 4"
        strokeLinecap="round"
        style={{ animation: active ? `flowDash 1.2s linear infinite` : 'none' }}
      />
    )
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 280 280" style={{ overflow: 'visible' }}>
      {/* Flow lines */}
      <FlowLine x1={140} y1={70} x2={140} y2={200} active={hasData && solar > 0} color="#2dd4bf" />
      <FlowLine x1={80} y1={155} x2={130} y2={210} active={hasData && battery > 0} color="#7c83ff" />
      <FlowLine x1={200} y1={155} x2={150} y2={210} active={hasData && grid > 0} color="#ffae3d" />

      {/* Solar */}
      <NodeBox x={140} y={50} label="Solar" value={hasData ? solar.toFixed(1) : '—'} unit="kW" color="#ffae3d" />
      {/* Battery */}
      <NodeBox x={60} y={155} label="Battery" value={hasData ? battery.toFixed(0) : '—'} unit="%" color="#7c83ff" />
      {/* Grid */}
      <NodeBox x={220} y={155} label="Grid" value={hasData ? (grid > 0 ? `+${grid.toFixed(1)}` : grid.toFixed(1)) : '—'} unit="kW" color="#9fb0d8" />
      {/* Home */}
      <NodeBox x={140} y={230} label="Home" value={hasData ? home.toFixed(1) : '—'} unit="kW" color="#38e0ff" />
    </svg>
  )
}

// ================================================================
//  Energy Tab
// ================================================================
export default function EnergyTab() {
  // All Sigenergy entities — will return null until integrated
  const solarState   = useHAState(ENTITIES.energy.solar_power)
  const batterySOC   = useHAState(ENTITIES.energy.battery_soc)
  const batteryPower = useHAState(ENTITIES.energy.battery_power)
  const gridState    = useHAState(ENTITIES.energy.grid_power)
  const yieldState   = useHAState(ENTITIES.energy.yield_today)

  const solar   = solarState   ? parseFloat(solarState.state)   : null
  const soc     = batterySOC   ? parseFloat(batterySOC.state)   : null
  const batKW   = batteryPower ? parseFloat(batteryPower.state) : null
  const grid    = gridState    ? parseFloat(gridState.state)    : null
  const yieldTd = yieldState   ? parseFloat(yieldState.state)   : null

  // Derived home load = solar + battery discharge + grid import
  const home = solar !== null
    ? Math.max(0, (solar ?? 0) - (batKW ?? 0) - (grid ?? 0))
    : null

  const pending = solar === null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 600, color: '#f3f6ff' }}>Energy</div>
        <div style={{ fontSize: 12, color: '#9fb0d8', marginTop: 2 }}>Live power flow</div>
      </div>

      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        {/* Left — power flow diagram */}
        <div className="glass" style={{ flex: 1.3, borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {pending && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              borderRadius: 18,
              background: 'rgba(10,19,48,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffae3d" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#9fb0d8' }}>Sigenergy not yet connected</div>
              <div style={{ fontSize: 11, color: '#8ea0cc', textAlign: 'center', maxWidth: 200 }}>
                Add inverter IP in HA settings and install the Sigenergy integration to see live power flow.
              </div>
            </div>
          )}
          <PowerFlowDiagram solar={solar} battery={soc} grid={grid} home={home} />
        </div>

        {/* Right column — stat cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Solar generation — hero card */}
          <div style={{
            flex: 1.4,
            background: pending ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(56,224,255,0.1))',
            border: `1px solid ${pending ? 'rgba(255,255,255,0.1)' : 'rgba(56,224,255,0.3)'}`,
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Solar Generation</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 52, fontWeight: 600, lineHeight: 1, color: pending ? '#8ea0cc' : '#2dd4bf' }}>
              {pending ? '—' : solar?.toFixed(1) ?? '0.0'}
            </div>
            <div style={{ fontSize: 14, color: '#9fb0d8' }}>kW live</div>
          </div>

          {/* Battery */}
          <div className="glass" style={{ borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8' }}>Battery</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#7c83ff' }}>
                {soc !== null ? `${Math.round(soc)}%` : '—'}
                {batKW !== null ? ` · ${batKW > 0 ? '+' : ''}${batKW?.toFixed(1)} kW` : ''}
              </span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${soc ?? 0}%`,
                background: 'linear-gradient(90deg, #7c83ff, #a78bfa)',
                borderRadius: 4, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Grid export + Yield today */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="glass" style={{ flex: 1, borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8', marginBottom: 6 }}>Grid Export</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 600, color: grid !== null && grid < 0 ? '#2dd4bf' : '#9fb0d8' }}>
                {grid !== null ? `${Math.abs(grid).toFixed(1)}` : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#8ea0cc' }}>kW</div>
            </div>
            <div className="glass" style={{ flex: 1, borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0d8', marginBottom: 6 }}>Yield Today</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 600, color: yieldTd !== null ? '#ffae3d' : '#9fb0d8' }}>
                {yieldTd !== null ? yieldTd.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#8ea0cc' }}>kWh</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
