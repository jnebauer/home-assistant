import { useState, useEffect } from 'react'
import { ha } from './ws.js'
import HomeTab from './tabs/HomeTab.jsx'
import RoomsTab from './tabs/RoomsTab.jsx'
import SecurityTab from './tabs/SecurityTab.jsx'
import EnergyTab from './tabs/EnergyTab.jsx'
import './App.css'

// ---- Nav icons ----
const HomeIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const RoomsIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
const SecurityIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const EnergyIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>

const TABS = [
  { id: 'home',     label: 'Home',     Icon: HomeIcon },
  { id: 'rooms',    label: 'Rooms',    Icon: RoomsIcon },
  { id: 'security', label: 'Security', Icon: SecurityIcon },
  { id: 'energy',   label: 'Energy',   Icon: EnergyIcon },
]

export default function App() {
  const [tab, setTab]     = useState('home')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ha.onReady(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="loading">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
        <span style={{ marginLeft: 8 }}>Connecting to Home Assistant…</span>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="content">
        {tab === 'home'     && <HomeTab />}
        {tab === 'rooms'    && <RoomsTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'energy'   && <EnergyTab />}
      </div>
      <nav className="bottom-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
