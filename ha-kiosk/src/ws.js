// ============================================================
//  HA WebSocket client
//  Handles auth, get_states, state_changed subscription,
//  and service calls. Auto-reconnects on disconnect.
// ============================================================

const WS_URL = (() => {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/api/websocket`
})()

class HAWebSocket {
  constructor() {
    this.ws = null
    this._msgId = 1
    this._pending = new Map()       // id → resolve fn
    this._listeners = new Map()     // entity_id → Set<fn>
    this._globalListeners = new Set()
    this.states = new Map()         // entity_id → state object
    this._token = null
    this._reconnectDelay = 3000
    this._reconnectTimer = null
    this._ready = false
    this._onReadyCbs = []
  }

  // ---- Public API ----

  connect(token) {
    this._token = token
    this._connect()
  }

  onReady(cb) {
    if (this._ready) cb()
    else this._onReadyCbs.push(cb)
  }

  /** Get current state object for an entity */
  getState(entityId) {
    return this.states.get(entityId) ?? null
  }

  /** Returns state string (e.g. 'on', 'off', 'closed') */
  getStateStr(entityId) {
    return this.states.get(entityId)?.state ?? 'unknown'
  }

  /** Returns attribute value */
  getAttribute(entityId, attr) {
    return this.states.get(entityId)?.attributes?.[attr]
  }

  /**
   * Subscribe to state changes for specific entity (or '*' for all).
   * Returns an unsubscribe function.
   */
  subscribe(entityId, cb) {
    if (entityId === '*') {
      this._globalListeners.add(cb)
      return () => this._globalListeners.delete(cb)
    }
    if (!this._listeners.has(entityId)) this._listeners.set(entityId, new Set())
    this._listeners.get(entityId).add(cb)
    return () => this._listeners.get(entityId)?.delete(cb)
  }

  /** Call a HA service. Returns a promise resolving when HA acks. */
  callService(domain, service, serviceData = {}, target = null) {
    const msg = { type: 'call_service', domain, service, service_data: serviceData }
    if (target) msg.target = target
    return this._sendCmd(msg)
  }

  // ---- Convenience helpers ----

  turnOn(entityId, data = {}) {
    const domain = entityId.split('.')[0]
    return this.callService(domain, 'turn_on', data, { entity_id: entityId })
  }

  turnOff(entityId, data = {}) {
    const domain = entityId.split('.')[0]
    return this.callService(domain, 'turn_off', data, { entity_id: entityId })
  }

  activateScene(entityId) {
    return this.callService('scene', 'turn_on', {}, { entity_id: entityId })
  }

  setClimateTemp(entityId, temperature) {
    return this.callService('climate', 'set_temperature', { temperature }, { entity_id: entityId })
  }

  setHvacMode(entityId, hvacMode) {
    return this.callService('climate', 'set_hvac_mode', { hvac_mode: hvacMode }, { entity_id: entityId })
  }

  openCover(entityId) {
    return this.callService('cover', 'open_cover', {}, { entity_id: entityId })
  }

  closeCover(entityId) {
    return this.callService('cover', 'close_cover', {}, { entity_id: entityId })
  }

  // ---- Internal ----

  _connect() {
    clearTimeout(this._reconnectTimer)
    this.ws = new WebSocket(WS_URL)
    this.ws.onmessage = (e) => this._onMessage(JSON.parse(e.data))
    this.ws.onerror = (e) => console.error('HA WS error', e)
    this.ws.onclose = () => {
      console.warn('HA WS closed — reconnecting in', this._reconnectDelay, 'ms')
      this._ready = false
      this._reconnectTimer = setTimeout(() => this._connect(), this._reconnectDelay)
    }
  }

  _raw(msg) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg))
  }

  _sendCmd(msg) {
    const id = this._msgId++
    return new Promise((resolve) => {
      this._pending.set(id, resolve)
      this._raw({ id, ...msg })
    })
  }

  _onMessage(msg) {
    switch (msg.type) {
      case 'auth_required':
        this._raw({ type: 'auth', access_token: this._token })
        break

      case 'auth_ok':
        this._fetchStates()
        break

      case 'auth_invalid':
        console.error('HA auth invalid — check your long-lived token')
        break

      case 'result': {
        const resolve = this._pending.get(msg.id)
        if (resolve) { resolve(msg); this._pending.delete(msg.id) }
        break
      }

      case 'event': {
        const ev = msg.event
        if (ev?.event_type === 'state_changed') {
          const { entity_id, new_state } = ev.data
          if (new_state) {
            this.states.set(entity_id, new_state)
          } else {
            this.states.delete(entity_id)
          }
          this._notify(entity_id, new_state)
        }
        break
      }
    }
  }

  _notify(entityId, newState) {
    this._listeners.get(entityId)?.forEach(cb => cb(newState))
    this._globalListeners.forEach(cb => cb(entityId, newState))
  }

  async _fetchStates() {
    const result = await this._sendCmd({ type: 'get_states' })
    if (result.result) {
      result.result.forEach(s => this.states.set(s.entity_id, s))
    }
    // Subscribe to all state_changed events
    this._raw({ id: this._msgId++, type: 'subscribe_events', event_type: 'state_changed' })
    // Mark as ready
    this._ready = true
    this._onReadyCbs.forEach(cb => cb())
    this._onReadyCbs = []
  }
}

// Singleton
export const ha = new HAWebSocket()

// Helper hook — use inside React components
// import { useHAState } from './ws.js'
import { useState, useEffect } from 'react'

export function useHAState(entityId) {
  const [state, setState] = useState(() => ha.getState(entityId))
  useEffect(() => {
    setState(ha.getState(entityId))
    const unsub = ha.subscribe(entityId, (s) => setState(s))
    return unsub
  }, [entityId])
  return state
}

/** Watch multiple entities — re-renders on any change */
export function useHAStates(entityIds) {
  const [, tick] = useState(0)
  useEffect(() => {
    const unsubs = entityIds.map(id => ha.subscribe(id, () => tick(n => n + 1)))
    return () => unsubs.forEach(fn => fn())
  }, [entityIds.join(',')])
  return entityIds.map(id => ha.getState(id))
}

/** Global listener — any entity change triggers re-render. Use sparingly. */
export function useHAGlobal() {
  const [, tick] = useState(0)
  useEffect(() => {
    const unsub = ha.subscribe('*', () => tick(n => n + 1))
    return unsub
  }, [])
}
