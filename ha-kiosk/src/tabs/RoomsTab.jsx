import { useState } from 'react'
import { ha, useHAState } from '../ws.js'
import { ROOMS } from '../config.js'

const ROOM_ICONS = {
  sofa: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0v5z"/><line x1="6" y1="18" x2="6" y2="22"/><line x1="18" y1="18" x2="18" y2="22"/></svg>,
  'chef-hat': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
  bed: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  utensils: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="11"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/></svg>,
  tv: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  trees: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 14l3-3.19a1 1 0 0 0 0-1.42L12 2 4 9.39a1 1 0 0 0 0 1.42L7 14"/><path d="M14 21v-5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v5"/><path d="M3 14h18"/><path d="M3 18h18"/></svg>,
}

function RoomCard({ room }) {
  // Get state of the first light to determine room on/off
  const firstLight = room.lights[0] ?? null
  const lightState = useHAState(firstLight)
  const climateState = useHAState(room.climate)
  const isOn = firstLight ? lightState?.state === 'on' : false
  const temp = climateState?.attributes?.current_temperature ?? null

  const toggleLights = () => {
    room.lights.forEach(entityId => {
      if (isOn) ha.turnOff(entityId)
      else ha.turnOn(entityId)
    })
  }

  const hasLights = room.lights.length > 0

  return (
    <div style={{
      background: isOn ? `${room.color}14` : 'rgba(255,255,255,0.05)',
      border: `1px solid ${isOn ? room.color + '44' : 'rgba(255,255,255,0.10)'}`,
      borderRadius: 16,
      padding: '16px 16px 14px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'all 0.2s',
      boxShadow: isOn ? `0 0 20px ${room.color}22` : 'none',
    }}>
      {/* Icon + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${room.color}22`,
          border: `1px solid ${room.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: room.color,
        }}>
          {ROOM_ICONS[room.icon]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f3f6ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</div>
          <div style={{ fontSize: 11, color: '#8ea0cc', marginTop: 2 }}>{room.devices}</div>
        </div>
        {temp !== null && (
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 600, color: '#7fc4ff', flexShrink: 0 }}>{temp}°</div>
        )}
      </div>

      {/* Lights toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#9fb0d8', fontWeight: 600 }}>
          {hasLights ? (isOn ? 'Lights on' : 'Lights off') : 'No lights'}
        </span>
        {hasLights && (
          <button
            className={`pill-switch ${isOn ? 'on' : 'off'}`}
            onClick={toggleLights}
          />
        )}
      </div>
    </div>
  )
}

export default function RoomsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 600, color: '#f3f6ff' }}>Rooms</div>
        <div style={{ fontSize: 12, color: '#9fb0d8', marginTop: 2 }}>Control lights and climate by room</div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 12,
        flex: 1,
        minHeight: 0,
      }}>
        {ROOMS.map(room => <RoomCard key={room.id} room={room} />)}
      </div>
    </div>
  )
}
