import { Route, Routes } from 'react-router'
import './App.css'
import DashboardPage from './features/main/pages/DashboardPage'
import PublicDashboardPage from './features/main/pages/PublicDashboardPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import SendEmailForgottenPasswd from './features/auth/pages/SendEmailForgottenPasswd'
import LeaguePage from './features/league/pages/LeaguePage'
import TeamPage from './features/team/pages/TeamPage'
import StatisticPage from './features/statistic/pages/StatisticPage'
// TODO: Restaurar PrivateRoute cuando el backend funcione correctamente
// import PrivateRoute from './features/auth/components/PrivateRoute'
import { OnboardingPage } from './features/onboarding'

function App() {

  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path='/' element={<PublicDashboardPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* Rutas protegidas (temporalmente sin autenticación) */}
        <Route path='/onboarding' element={<OnboardingPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/send-email' element={<SendEmailForgottenPasswd />} />
        <Route path='/leagues' element={<LeaguePage />} />
        <Route path='/teams' element={<TeamPage />} />
        <Route path='/statistics' element={<StatisticPage />} />
      </Routes>
    </>
  )
}

export default App
