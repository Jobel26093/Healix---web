import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupMockApiInterceptor } from './services/mockDemoApi'

// Initialize demo mock interceptor for static hosts & network resilience
setupMockApiInterceptor()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
