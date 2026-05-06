import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './features/auth/hooks/useAuth'
import { SelectedLeagueProvider } from './context'
import { ToastProvider } from './contexts/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SelectedLeagueProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SelectedLeagueProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
