import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import  LandingPage from "./pages/LandingPage";
import  DashboardLayout  from "./components/layout/DashboardLayout";
import  Dashboard  from "./pages/Dashboard";
import PublisherDashboard from "./pages/PublisherDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import ManagePublishers from "./pages/ManagePublishers";
import Agreements from "./pages/Agreements";

function App() {
  // In a real application, you would get the user role from your authentication system
  const [userRole, setUserRole] = useState("author") // 'admin', 'publisher', or 'author'

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              userRole === "admin" ? (
                <DashboardLayout userRole={userRole}>
                  <Dashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/manage-publishers"
            element={
              userRole === "admin" ? (
                <DashboardLayout userRole={userRole}>
                  <ManagePublishers />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/agreements"
            element={
              userRole === "admin" ? (
                <DashboardLayout userRole={userRole}>
                  <Agreements />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Publisher Routes */}
          <Route
            path="/publisher"
            element={
              userRole === "publisher" ? (
                <DashboardLayout userRole={userRole}>
                  <PublisherDashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Author Routes */}
          <Route
            path="/author"
            element={
              userRole === "author" ? (
                <DashboardLayout userRole={userRole}>
                  <AuthorDashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App

