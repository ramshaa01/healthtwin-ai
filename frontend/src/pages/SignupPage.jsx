import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "", password: "", full_name: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      await signup(form.username, form.password, form.full_name)
      navigate("/dashboard")
    } catch (e) {
      const msg = e.response?.data?.detail
      if (!msg && (e.code === "ECONNABORTED" || e.message?.includes("timeout") || e.message?.includes("Network"))) {
        setError("Server is waking up (free tier cold start) — please wait 30 seconds and try again.")
      } else {
        setError(msg || "Signup failed. Please try again.")
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
                    marginBottom: "2rem" }}>Create your health profile</p>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5",
                        padding: "0.75rem", borderRadius: "8px",
                        color: "#dc2626", marginBottom: "1rem",
                        fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        {[
          { key: "full_name", placeholder: "Full Name" },
          { key: "username",  placeholder: "Username" },
          { key: "password",  placeholder: "Password", type: "password" }
        ].map(field => (
          <input
            key={field.key}
            type={field.type || "text"}
            placeholder={field.placeholder}
            value={form[field.key]}
            onChange={e => setForm({ ...form, [field.key]: e.target.value })}
            style={{ width: "100%", padding: "0.75rem",
                     marginBottom: "1rem", borderRadius: "8px",
                     border: "1px solid #d1d5db", fontSize: "1rem",
                     boxSizing: "border-box" }}
          />
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "0.85rem",
                   background: loading ? "#93c5fd" : "#1e40af",
                   color: "white", border: "none", borderRadius: "8px",
                   fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <p style={{ textAlign: "center", marginTop: "1rem",
                    color: "#6b7280", fontSize: "0.9rem" }}>
          Have an account?{" "}
          <Link to="/login" style={{ color: "#1e40af" }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
