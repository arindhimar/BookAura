import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import { UserProvider, useUser } from "./contexts/UserContext"
import LandingPage from "./pages/LandingPage"
import DashboardLayout from "./components/layout/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import PublisherDashboard from "./pages/PublisherDashboard"
import AuthorDashboard from "./pages/AuthorDashboard"
import ManagePublishers from "./pages/ManagePublishers"
import Agreements from "./pages/Agreements"
import ManageBooks from "./pages/publisher/ManageBooks"
import Analytics from "./pages/publisher/Analytics"
import MyBooks from "./pages/author/MyBooks"
import Reviews from "./pages/author/Reviews"
import Settings from "./pages/Settings"

function AppRoutes() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Send a request to the backend to validate the token and get user data
      fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/me`, {
        headers: {
          Authorization: token,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Token invalid")
          }
          return response.json()
        })
        .then((data) => {
          setUser(data.user)
          // Only navigate if we're on the root path
          if (location.pathname === "/") {
            if (data.user.role_id === 1) {
              navigate("/admin")
            } else if (data.user.role_id === 2) {
              navigate("/publisher")
            } else if (data.user.role_id === 3) {
              navigate("/author")
            }
          }
        })
        .catch((error) => {
          console.error("Error validating token:", error)
          localStorage.removeItem("token")
        })
    }
  }, [setUser, navigate, location])

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (user === null) {
      return <div>Loading...</div> // Or a more sophisticated loading component
    }
    if (!allowedRoles.includes(user.role_id)) {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <DashboardLayout userRole="admin">
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-publishers"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <DashboardLayout userRole="admin">
              <ManagePublishers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agreements"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <DashboardLayout userRole="admin">
              <Agreements />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Publisher Routes */}
      <Route
        path="/publisher"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <DashboardLayout userRole="publisher">
              <PublisherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publisher/books"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <DashboardLayout userRole="publisher">
              <ManageBooks />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publisher/analytics"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <DashboardLayout userRole="publisher">
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Author Routes */}
      <Route
        path="/author"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <DashboardLayout userRole="author">
              <AuthorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/author/books"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <DashboardLayout userRole="author">
              <MyBooks />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/author/reviews"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <DashboardLayout userRole="author">
              <Reviews />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <DashboardLayout userRole={user?.role_id === 1 ? "admin" : user?.role_id === 2 ? "publisher" : "author"}>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App

