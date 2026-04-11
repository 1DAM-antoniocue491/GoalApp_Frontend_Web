import { Route, Routes } from 'react-router'
import './App.css'
import DashboardPage from './features/main/pages/DashboardPage'
import PublicDashboardPage from './features/main/pages/PublicDashboardPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import FormComunication from './features/main/pages/FormComunication'
import SendEmailForgottenPasswd from './features/auth/pages/SendEmailForgottenPasswd'
import LeaguePage from './features/league/pages/LeaguePage'
import TeamPage from './features/team/pages/TeamPage'
import StatisticPage from './features/statistic/pages/StatisticPage'
import PrivateRoute from './features/auth/components/PrivateRoute'
import { OnboardingPage } from './features/onboarding'

function App() {

  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path='/' element={<PublicDashboardPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route path='/onboarding' element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
        <Route path='/dashboard' element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path='/comunication_form' element={<PrivateRoute><FormComunication /></PrivateRoute>} />
        <Route path='/send-email' element={<PrivateRoute><SendEmailForgottenPasswd /></PrivateRoute>} />
        <Route path='/leagues' element={<PrivateRoute><LeaguePage /></PrivateRoute>} />
        <Route path='/teams' element={<PrivateRoute><TeamPage /></PrivateRoute>} />
        <Route path='/statistics' element={<PrivateRoute><StatisticPage /></PrivateRoute>} />
      </Routes>
    </>
  )
}

export default App
