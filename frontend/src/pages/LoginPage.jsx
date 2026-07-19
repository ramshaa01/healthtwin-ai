import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function LoginPage() {
  const [form, setForm]       = useState({ username: "", password: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [waking, setWaking]   = useState(false)
  const { login } = useAuth()
  const navigate   = useNavigate()

  // Wake up Render backend on page load (free tier cold-start)
  useEffect(() => {
    setWaking(true)
    fetch(`${API}/api/health-check`, { signal: AbortSignal.timeout(20000) })
      .catch(() => {}) // ignore errors — just a warm-up ping
      .finally(() => setWaking(false))
  }, [])

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Please enter both username and password")
      return
    }
    setError("")
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate("/dashboard")
    } catch (e) {
      const msg = e.response?.data?.detail
      if (!msg && (e.code === "ECONNABORTED" || e.message?.includes("timeout") || e.message?.includes("Network"))) {
        setError("Server is waking up (free tier cold start) — please wait 30 seconds and try again.")
      } else {
        setError(msg || "Incorrect username or password")
      }
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
                     marginBottom: "0.5rem" }}>🏥 HealthTwin AI</h1>
        <p style={{ textAlign: "center", color: "#6b7280",
                    marginBottom: "2rem" }}>Sign in to your health profile</p>

        {waking && (
          <div style={{ background: "#eff6ff", border: "1px solid #93c5fd",
                        padding: "0.75rem", borderRadius: "8px",
                        color: "#1e40af", marginBottom: "1rem",
                        fontSize: "0.85rem", textAlign: "center" }}>
            ⏳ Connecting to server… (may take ~30s on first load)
          </div>
        )}

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5",
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
          style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem",
                   borderRadius: "8px", border: "1px solid #d1d5db",
                   fontSize: "1rem", boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", padding: "0.75rem", marginBottom: "1.5rem",
                   borderRadius: "8px", border: "1px solid #d1d5db",
                   fontSize: "1rem", boxSizing: "border-box" }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || waking}
          style={{ width: "100%", padding: "0.85rem",
                   background: (loading || waking) ? "#93c5fd" : "#1e40af",
                   color: "white", border: "none", borderRadius: "8px",
                   fontSize: "1rem", fontWeight: "bold",
                   cursor: (loading || waking) ? "not-allowed" : "pointer" }}>
          {waking ? "Connecting…" : loading ? "Signing in…" : "Sign In"}
        </button>
        <p style={{ textAlign: "center", marginTop: "1rem",
                    color: "#6b7280", fontSize: "0.9rem" }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "#1e40af" }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
