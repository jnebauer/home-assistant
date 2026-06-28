import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ha } from './ws.js'

// ----------------------------------------------------------------
// Auth token resolution order:
//   1. URL hash: #token=xxxx
//   2. URL search param: ?token=xxxx
//   3. sessionStorage (cached from prior load)
//   4. Prompt user (fallback)
// ----------------------------------------------------------------
function getToken() {
  const hash   = new URLSearchParams(window.location.hash.replace('#', ''))
  const search = new URLSearchParams(window.location.search)
  const fromUrl = hash.get('token') || search.get('token')
  if (fromUrl) { sessionStorage.setItem('ha_token', fromUrl); return fromUrl }
  const cached = sessionStorage.getItem('ha_token')
  if (cached) return cached
  // Fallback prompt (only hits on first ever load without token in URL)
  const entered = window.prompt('Enter Home Assistant long-lived access token:')
  if (entered) sessionStorage.setItem('ha_token', entered)
  return entered
}

const token = getToken()
if (!token) {
  document.getElementById('root').textContent = 'No HA token provided. Reload with ?token=xxx in the URL.'
} else {
  ha.connect(token)
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
