import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Publishers from './pages/Publishers'
import Agreements from './pages/Agreements'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/dashboard/publishers" element={<DashboardLayout><Publishers /></DashboardLayout>} />
          <Route path="/dashboard/agreements" element={<DashboardLayout><Agreements /></DashboardLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App

