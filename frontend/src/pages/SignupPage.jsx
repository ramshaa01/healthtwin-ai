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
    if (!form.username || !form.password || !form.full_name) {
      setError("Please fill in all fields")
      return
    }
    setError("")
    setLoading(true)
    try {
      await signup(form.username, form.password, form.full_name)
      navigate("/dashboard")
    } catch (e) {
      setError(e.response?.data?.detail || "Signup failed. Try a different username.")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: "full_name", label: "Full Name",
      placeholder: "e.g. Ramsha Fatima", type: "text" },
    { key: "username",  label: "Username",
      placeholder: "Choose a username", type: "text" },
    { key: "password",  label: "Password",
      placeholder: "Min 6 characters", type: "password" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-white">HealthTwin AI</h1>
          <p className="text-primary-200 mt-1 text-sm">
            Create your personalised health profile
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Get started — it's free
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  className="input-field"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full mt-6">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating account...
              </span>
            ) : "Create My Health Profile"}
          </button>

          <p className="text-center mt-5 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login"
              className="text-primary-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center mt-6 text-primary-300 text-xs space-y-1">
          <p>🔒 Your data is encrypted and stays private</p>
          <p>No ads. No data selling. Ever.</p>
        </div>
      </div>
    </div>
  )
}
