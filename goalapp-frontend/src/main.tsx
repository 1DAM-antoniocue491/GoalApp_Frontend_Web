import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './features/auth/hooks/useAuth'
import { SelectedLeagueProvider } from './context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SelectedLeagueProvider>
          <App />
        </SelectedLeagueProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
