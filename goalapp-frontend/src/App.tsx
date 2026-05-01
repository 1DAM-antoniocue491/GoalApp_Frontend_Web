import { Route, Routes } from 'react-router'
import './App.css'
import DashboardPage from './features/main/pages/DashboardPage'
import PublicDashboardPage from './features/main/pages/PublicDashboardPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import SendEmailForgottenPasswd from './features/auth/pages/SendEmailForgottenPasswd'
import EmailSentPage from './features/auth/pages/EmailSentPage'
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage'
import LeaguePage from './features/league/pages/LeaguePage'
import TeamPage from './features/team/pages/TeamPage'
import TeamDetailPage from './features/team/pages/TeamDetailPage'
import StatisticPage from './features/statistic/pages/StatisticPage'
import CalendarioPage from './features/calendario/pages/CalendarioPage'
import UsersPage from './features/users/pages/UsersPage'
import NotificationsPage from './features/notificaciones/pages/NotificationsPage'
import PrivateRoute from './features/auth/components/PrivateRoute'
import { OnboardingPage } from './features/onboarding'
import Finish from './features/main/pages/Finish'
import Live from './features/main/pages/Live'

function App() {

  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path='/' element={<PublicDashboardPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/forgot-password' element={<SendEmailForgottenPasswd />} />
        <Route path='/email-sent' element={<EmailSentPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path='/onboarding' element={<OnboardingPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/leagues' element={<LeaguePage />} />
          <Route path='/teams' element={<TeamPage />} />
          <Route path='/teams/:equipoId' element={<TeamDetailPage />} />
          <Route path='/statistics' element={<StatisticPage />} />
          <Route path='/calendar' element={<CalendarioPage />} />
          <Route path='/users' element={<UsersPage />} />
          <Route path='/notifications' element={<NotificationsPage />} />
          <Route path='/finish' element={<Finish/>}/>
          <Route path="/live" element={<Live/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
