import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import DashboardPage from "./pages/DashboardPage"
import AssessmentPage from "./pages/AssessmentPage"
import SimulatePage from "./pages/SimulatePage"
import ForecastPage from "./pages/ForecastPage"
import HistoryPage from "./pages/HistoryPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/simulate" element={<SimulatePage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
