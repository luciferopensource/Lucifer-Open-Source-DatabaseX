import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { migrateLegacyHash } from './lib/url'
import './styles/index.css'

// Old `#/route` links still work: rewrite them to the path equivalent first.
migrateLegacyHash()

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// Offline support: registered after load so the first paint is never delayed.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {
      /* a failed registration must never break the app */
    })
  })
}
