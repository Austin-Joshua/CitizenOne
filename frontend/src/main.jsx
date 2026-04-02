import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { queryClient } from './lib/queryClient'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary.jsx'
import { I18nProvider } from './context/I18nContext'
import { InclusionProvider } from './context/InclusionContext'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((registrations) => {
    registrations.forEach((registration) => registration.unregister())
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <InclusionProvider>
            <App />
          </InclusionProvider>
        </I18nProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
