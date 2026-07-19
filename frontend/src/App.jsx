import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardPage from "./pages/DashboardPage"
import AssessmentPage from "./pages/AssessmentPage"
import SimulatePage from "./pages/SimulatePage"
import ForecastPage from "./pages/ForecastPage"
import HistoryPage from "./pages/HistoryPage"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/signup"  element={<SignupPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/assessment" element={
            <ProtectedRoute><AssessmentPage /></ProtectedRoute>
          } />
          <Route path="/simulate" element={
            <ProtectedRoute><SimulatePage /></ProtectedRoute>
          } />
          <Route path="/forecast" element={
            <ProtectedRoute><ForecastPage /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><HistoryPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
