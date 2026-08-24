import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { demoInput, demoResult } from "../data/demoProfile"

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, enterDemo } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleDemo = () => {
    enterDemo()
    sessionStorage.setItem("healthtwin_input", JSON.stringify(demoInput))
    sessionStorage.setItem("healthtwin_result", JSON.stringify(demoResult))
    navigate("/results")
  }

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Please enter username and password")
      return
    }
    setError("")
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate("/dashboard")
    } catch (e) {
      setError(e.response?.data?.detail || "Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#fafbfc",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px", position:"relative", overflow:"hidden"
    }}>
      {/* Animated mesh gradient blobs */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0
      }}>
        <div style={{
          position:"absolute", width:"500px", height:"500px",
          borderRadius:"50%", filter:"blur(80px)", opacity:0.45,
          background:"#a7f3d0",
          top:"-120px", left:"-120px",
          animation:"blobDrift1 12s ease-in-out infinite alternate"
        }}/>
        <div style={{
          position:"absolute", width:"420px", height:"420px",
          borderRadius:"50%", filter:"blur(80px)", opacity:0.4,
          background:"#93c5fd",
          top:"30%", right:"-80px",
          animation:"blobDrift2 15s ease-in-out infinite alternate"
        }}/>
        <div style={{
          position:"absolute", width:"360px", height:"360px",
          borderRadius:"50%", filter:"blur(80px)", opacity:0.35,
          background:"#c4b5fd",
          bottom:"-80px", left:"30%",
          animation:"blobDrift3 10s ease-in-out infinite alternate"
        }}/>
      </div>

      {/* Glassmorphism card */}
      <div className="w-full max-w-md animate-slide-up" style={{position:"relative", zIndex:1}}>

        {/* Logo area */}
        <div className="text-center mb-8">
          <div style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:"72px", height:"72px",
            background:"linear-gradient(135deg,#10b981,#3b82f6)",
            borderRadius:"20px", boxShadow:"0 8px 32px rgba(16,185,129,0.35)",
            marginBottom:"16px"
          }}>
            <span style={{fontSize:"36px"}}>🧬</span>
          </div>
          <h1 style={{fontSize:"28px", fontWeight:"800", color:"#0f172a", margin:0}}>
            HealthTwin AI
          </h1>
          <p style={{color:"#64748b", marginTop:"6px", fontSize:"14px"}}>
            {t("login_subtitle")}
          </p>
        </div>

        {/* Glass card */}
        <div style={{
          background:"rgba(255,255,255,0.65)",
          backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
          border:"1px solid rgba(255,255,255,0.8)",
          borderRadius:"24px",
          boxShadow:"0 8px 40px rgba(0,0,0,0.10)",
          padding:"32px"
        }}>
          <h2 style={{fontSize:"18px", fontWeight:"700", color:"#0f172a", marginBottom:"20px"}}>
            {t("login_title")}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("login_username")}
              </label>
              <input
                className="input-field"
                placeholder={t("login_username_placeholder")}
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("login_password")}
              </label>
              <input
                type="password"
                className="input-field"
                placeholder={t("login_password_placeholder")}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex:1, padding:"12px", borderRadius:"12px",
                background:"linear-gradient(135deg,#10b981,#3b82f6)",
                color:"white", fontWeight:"700", border:"none",
                cursor: loading?"not-allowed":"pointer",
                opacity: loading?0.7:1, fontSize:"15px",
                boxShadow:"0 4px 16px rgba(16,185,129,0.3)"
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {t("assess_analysing")}
                </span>
              ) : t("login_btn")}
            </button>
            <button
              onClick={handleDemo}
              style={{
                flex:1, padding:"12px", borderRadius:"12px",
                background:"rgba(255,255,255,0.5)",
                border:"1.5px solid rgba(139,92,246,0.45)",
                color:"#7c3aed", fontWeight:"700", fontSize:"15px",
                cursor:"pointer", position:"relative", overflow:"hidden",
                backdropFilter:"blur(6px)",
                boxShadow:"0 0 20px rgba(139,92,246,0.15)",
                animation:"demoBtnPulse 2.5s ease-in-out infinite"
              }}>
              <span style={{position:"relative", zIndex:1}}>🎬 {t("try_demo")}</span>
            </button>
          </div>

          <button
            onClick={() => navigate("/asha")}
            style={{
              width:"100%", padding:"12px", borderRadius:"12px",
              background:"#f3f4f6", border:"1px solid #d1d5db",
              color:"#4b5563", fontWeight:"600", fontSize:"15px",
              cursor:"pointer", marginTop:"12px"
            }}>
            ASHA मोड
          </button>

          <p className="text-center mt-5 text-sm text-gray-500">
            {t("login_no_account")}{" "}
            <Link to="/signup" className="text-primary-700 font-semibold hover:underline">
              {t("login_create")}
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-400 text-xs mt-5">
          {t("login_tagline")}
        </p>
      </div>

      <style>{`
        @keyframes blobDrift1 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(40px, 60px) scale(1.1); }
        }
        @keyframes blobDrift2 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-50px, 30px) scale(0.95); }
        }
        @keyframes blobDrift3 {
          0%   { transform: translate(0,0) scale(1.05); }
          100% { transform: translate(30px,-40px) scale(1); }
        }
        @keyframes demoBtnPulse {
          0%,100% { box-shadow: 0 0 16px rgba(139,92,246,0.15); }
          50%      { box-shadow: 0 0 28px rgba(139,92,246,0.35); }
        }
      `}</style>
    </div>
  )
}
