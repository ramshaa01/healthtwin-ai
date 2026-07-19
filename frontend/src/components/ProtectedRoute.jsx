import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center",
                  alignItems: "center", minHeight: "100vh",
                  fontSize: "1.1rem", color: "#6b7280" }}>
      Loading HealthTwin AI...
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}
