import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate("/dashboard")
    } catch (e) {
      setError(e.response?.data?.detail || "Login failed. Check credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc",
                  display: "flex", alignItems: "center",
                  justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "16px",
                    padding: "2.5rem", width: "100%", maxWidth: "400px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
        <h1 style={{ textAlign: "center", color: "#1e40af",
                     marginBottom: "0.5rem" }}>
          🏥 HealthTwin AI
        </h1>
        <p style={{ textAlign: "center", color: "#6b7280",
                    marginBottom: "2rem" }}>
          Sign in to your health profile
        </p>
        {error && (
          <div style={{ background: "#fef2f2",
                        border: "1px solid #fca5a5",
                        padding: "0.75rem", borderRadius: "8px",
                        color: "#dc2626", marginBottom: "1rem",
                        fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
        <input
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          style={{ width: "100%", padding: "0.75rem",
                   marginBottom: "1rem", borderRadius: "8px",
                   border: "1px solid #d1d5db", fontSize: "1rem",
                   boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", padding: "0.75rem",
                   marginBottom: "1.5rem", borderRadius: "8px",
                   border: "1px solid #d1d5db", fontSize: "1rem",
                   boxSizing: "border-box" }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "0.85rem",
                   background: loading ? "#93c5fd" : "#1e40af",
                   color: "white", border: "none",
                   borderRadius: "8px", fontSize: "1rem",
                   fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p style={{ textAlign: "center", marginTop: "1rem",
                    color: "#6b7280", fontSize: "0.9rem" }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "#1e40af" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
