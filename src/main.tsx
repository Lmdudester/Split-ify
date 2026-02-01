import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TESTING_MODE, logTestingMode } from './config/testing'

async function initializeApp() {
  // Enable MSW in development testing mode
  if (import.meta.env.DEV && TESTING_MODE) {
    logTestingMode()
    const { worker } = await import('./test/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn for unhandled requests
    })
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

initializeApp()
