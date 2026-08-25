import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts"
import Navbar from "../components/Navbar"
import DigitalTwinBody from "../components/DigitalTwinBody"
import HealthScoreGauge from "../components/HealthScoreGauge"
import RiskCard from "../components/RiskCard"
import { healthAPI } from "../api/client"
import { useAuth } from "../context/AuthContext"

const CONDITIONS_LABEL = {
  diabetes: "Type 2 Diabetes", hypertension: "Hypertension",
  heart: "Heart Disease", obesity: "Obesity", stress: "Stress"
}

function ShapChart({ condition, features }) {
  if (!features || features.length === 0) return null
  const data = [...features]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 6)
    .map(f => ({
      feature: f.feature.length > 14 ? f.feature.slice(0, 13) + "…" : f.feature,
      value: parseFloat(f.shap_value.toFixed(4)),
    }))

  return (
    <div className="card mb-4 animate-fade-in">
      <h4 className="font-semibold text-gray-700 mb-1 text-sm">
        {CONDITIONS_LABEL[condition]} — Feature Impact
      </h4>
      <p className="text-xs text-gray-400 mb-3">
        🔴 Increases risk &nbsp;·&nbsp; 🟢 Reduces risk
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical"
                  margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="feature"
                 tick={{ fontSize: 11 }} width={110} />
          <Tooltip formatter={(v) => [v.toFixed(4), "SHAP value"]} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.value > 0 ? "#ef4444" : "#10b981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardPage() {
  const [predictions, setPredictions] = useState([])
  const [healthScore, setHealthScore] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loadingRecs, setLoadingRecs] = useState(false)
  const { user, isDemoMode } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem("healthtwin_result")
    if (stored) {
      const data = JSON.parse(stored)
      setPredictions(data.predictions || [])
      setHealthScore(data.health_score || null)
    }
  }, [])

  const fetchRecommendations = async () => {
    setLoadingRecs(true)
    try {
      if (isDemoMode) {
        // Mock recommendations for demo mode
        setTimeout(() => {
          setRecommendations([
            "Reduce sodium intake to lower systolic blood pressure.",
            "Incorporate 30 minutes of aerobic exercise daily.",
            "Improve sleep hygiene to lower stress and hypertension risk.",
            "Switch to a Mediterranean diet to control cholesterol."
          ])
          setActiveTab("recommendations")
          setLoadingRecs(false)
        }, 1000)
        return
      }
      const res = await healthAPI.recommendations()
      setRecommendations(res.data.recommendations || [])
      setActiveTab("recommendations")
    } catch (e) {
      setRecommendations([{ text: "Could not load recommendations. Please check your connection and try again." }])
    } finally {
      if (!isDemoMode) setLoadingRecs(false)
    }
  }

  const downloadReport = async () => {
    try {
      const token = sessionStorage.getItem("healthtwin_token")
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/api/export-pdf`,
        { headers: { Authorization: "Bearer " + token } }
      )
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "healthtwin_report.pdf"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert("PDF export failed. Please run an assessment first.")
    }
  }

  const hasResults = predictions.length > 0

  const TABS = [
    { id: "overview",        label: "📊 Overview" },
    { id: "explainability",  label: "🔍 Explainability" },
    { id: "recommendations", label: "💡 Recommendations" },
  ]

  const tierColors = {
    1: "bg-red-50 border-red-200",
    2: "bg-amber-50 border-amber-200",
    3: "bg-emerald-50 border-emerald-200"
  }
  const tierIcons = { 1: "⚠️", 2: "📋", 3: "✅" }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Health Dashboard
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, {user?.full_name || user?.username} 👋
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!isDemoMode && (
              <button onClick={() => navigate("/assessment")}
                className="btn-primary text-sm py-2 px-4">
                🩺 {hasResults ? "Retake Assessment" : "Start Assessment"}
              </button>
            )}
            {hasResults && (
              <>
                <button onClick={() => navigate("/twin")}
                  className="btn-primary text-sm py-2 px-4"
                  style={{background:"linear-gradient(135deg,#1e40af,#7c3aed)"}}>
                  🫀 Digital Twin
                </button>
                <button onClick={() => navigate("/trends")}
                  className="btn-secondary text-sm py-2 px-4">
                  📊 View Trends
                </button>
                <button onClick={() => navigate("/simulate")}
                  className="btn-secondary text-sm py-2 px-4">
                  🔮 Simulate
                </button>
                {!isDemoMode && (
                  <button onClick={downloadReport}
                    className="btn-success text-sm py-2 px-4">
                    📄 PDF
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {!hasResults ? (
          /* Empty state */
          <div className="card text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No health data yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Complete your first health assessment to get personalised
              AI-powered risk predictions and recommendations.
            </p>
            <button onClick={() => navigate("/assessment")}
              className="btn-primary mx-auto">
              Start Your Assessment →
            </button>
          </div>
        ) : (
          <>
            {/* Health Score */}
            <div className="mb-6">
              <HealthScoreGauge
                score={healthScore}
                breakdown={healthScore?.breakdown}
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {TABS.map(tab => (
                <button key={tab.id}
                  onClick={() => {
                    if (tab.id === "recommendations") fetchRecommendations()
                    else setActiveTab(tab.id)
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold
                    transition-all duration-150 border
                    ${activeTab === tab.id
                      ? 'bg-primary-700 text-white border-primary-700 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                    }`}>
                  {tab.label}
                  {tab.id === "recommendations" && loadingRecs &&
                    <span className="ml-1 animate-spin inline-block">⏳</span>}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
        <div className="animate-fade-in">
          {/* Twin + Cards layout */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"1fr auto 1fr",
            gap:"16px",
            alignItems:"start",
            background:"linear-gradient(135deg,#06111f,#0d1f35)",
            borderRadius:"20px",
            padding:"20px",
            marginBottom:"20px"
          }}>
            {/* Left cards */}
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {predictions.filter(p =>
                ["stress","hypertension","heart"].includes(p.condition)
              ).map(p => (
                <div key={p.condition} style={{
                  background:"rgba(6,17,31,0.9)",
                  border:"0.5px solid rgba(255,255,255,0.1)",
                  borderRadius:"12px", padding:"12px 14px"
                }}>
                  <div style={{
                    fontSize:"10px",color:"rgba(255,255,255,0.4)",
                    marginBottom:"4px",display:"flex",
                    justifyContent:"space-between"
                  }}>
                    {({stress:"Stress",hypertension:"Hypertension",
                       heart:"Heart Disease"})[p.condition]}
                    <span>→</span>
                  </div>
                  <div style={{
                    fontSize:"24px",fontWeight:"700",color:"white",lineHeight:1
                  }}>
                    {Math.round(p.risk_probability*100)}
                    <span style={{fontSize:"12px",color:"rgba(255,255,255,0.4)"}}>%</span>
                  </div>
                  <div style={{
                    display:"inline-block",fontSize:"9px",fontWeight:"700",
                    padding:"2px 8px",borderRadius:"999px",marginTop:"6px",
                    background:p.risk_probability>=0.7?"rgba(239,68,68,0.15)":
                               p.risk_probability>=0.4?"rgba(251,191,36,0.15)":
                               "rgba(74,222,128,0.12)",
                    color:p.risk_probability>=0.7?"#f87171":
                          p.risk_probability>=0.4?"#fbbf24":"#4ade80",
                    border:`0.5px solid ${p.risk_probability>=0.7?"rgba(248,113,113,0.4)":
                            p.risk_probability>=0.4?"rgba(251,191,36,0.4)":
                            "rgba(74,222,128,0.3)"}`
                  }}>
                    {p.risk_probability>=0.7?"High":
                     p.risk_probability>=0.4?"Moderate":"Low"}
                  </div>
                </div>
              ))}
            </div>

            {/* Center body */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
              <DigitalTwinBody
                predictions={predictions}
                animated={true}
                size="md"
              />
              <div style={{
                marginTop:"8px",fontSize:"10px",
                color:"rgba(255,255,255,0.35)",
                textAlign:"center",letterSpacing:".04em"
              }}>
                YOUR DIGITAL TWIN
              </div>
            </div>

            {/* Right cards */}
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {predictions.filter(p =>
                ["diabetes","obesity"].includes(p.condition)
              ).map(p => (
                <div key={p.condition} style={{
                  background:"rgba(6,17,31,0.9)",
                  border:"0.5px solid rgba(255,255,255,0.1)",
                  borderRadius:"12px", padding:"12px 14px"
                }}>
                  <div style={{
                    fontSize:"10px",color:"rgba(255,255,255,0.4)",
                    marginBottom:"4px",display:"flex",
                    justifyContent:"space-between"
                  }}>
                    {({diabetes:"Diabetes",obesity:"Obesity"})[p.condition]}
                    <span>→</span>
                  </div>
                  <div style={{
                    fontSize:"24px",fontWeight:"700",color:"white",lineHeight:1
                  }}>
                    {Math.round(p.risk_probability*100)}
                    <span style={{fontSize:"12px",color:"rgba(255,255,255,0.4)"}}>%</span>
                  </div>
                  <div style={{
                    display:"inline-block",fontSize:"9px",fontWeight:"700",
                    padding:"2px 8px",borderRadius:"999px",marginTop:"6px",
                    background:p.risk_probability>=0.7?"rgba(239,68,68,0.15)":
                               p.risk_probability>=0.4?"rgba(251,191,36,0.15)":
                               "rgba(74,222,128,0.12)",
                    color:p.risk_probability>=0.7?"#f87171":
                          p.risk_probability>=0.4?"#fbbf24":"#4ade80",
                    border:`0.5px solid ${p.risk_probability>=0.7?"rgba(248,113,113,0.4)":
                            p.risk_probability>=0.4?"rgba(251,191,36,0.4)":
                            "rgba(74,222,128,0.3)"}`
                  }}>
                    {p.risk_probability>=0.7?"High":
                     p.risk_probability>=0.4?"Moderate":"Low"}
                  </div>
                </div>
              ))}

              {/* Health score card */}
              <div style={{
                background:"rgba(99,179,237,0.07)",
                border:"0.5px solid rgba(99,179,237,0.25)",
                borderRadius:"12px",padding:"12px 14px"
              }}>
                <div style={{
                  fontSize:"10px",color:"rgba(255,255,255,0.4)",marginBottom:"4px"
                }}>
                  Health Score
                </div>
                <div style={{
                  fontSize:"24px",fontWeight:"700",lineHeight:1,
                  color:healthScore?.total>=75?"#4ade80":
                        healthScore?.total>=50?"#fbbf24":"#f87171"
                }}>
                  {healthScore?.total ?? healthScore ?? 0}
                  <span style={{fontSize:"12px",color:"rgba(255,255,255,0.4)"}}>
                    /100
                  </span>
                </div>
                <div style={{
                  display:"inline-block",fontSize:"9px",fontWeight:"700",
                  padding:"2px 8px",borderRadius:"999px",marginTop:"6px",
                  background:"rgba(99,179,237,0.12)",color:"#63b3ed",
                  border:"0.5px solid rgba(99,179,237,0.3)"
                }}>
                  {(healthScore?.total??0)>=75?"Good":
                   (healthScore?.total??0)>=50?"Fair":"Poor"}
                </div>
              </div>
            </div>
          </div>

          {/* Insight bar */}
          <div style={{
            background:"rgba(99,179,237,0.06)",
            border:"0.5px solid rgba(99,179,237,0.18)",
            borderRadius:"12px",padding:"12px 16px",
            fontSize:"13px",color:"rgba(255,255,255,0.65)",
            lineHeight:"1.6"
          }}>
            <span style={{color:"#63b3ed",fontWeight:"600"}}>
              🧬 Twin insight:{" "}
            </span>
            {(() => {
              const high = predictions.filter(p=>p.risk_probability>=0.7)
              if(!high.length) return "All risk levels are manageable. Your twin is in good shape — keep up your current habits."
              const top = [...high].sort((a,b)=>b.risk_probability-a.risk_probability)[0]
              const feat = top.top_shap_features?.[0]?.feature||"lifestyle inputs"
              const labels = {stress:"Stress",hypertension:"Hypertension",
                heart:"Heart Disease",diabetes:"Diabetes",obesity:"Obesity"}
              return `High ${labels[top.condition]||top.condition} risk detected. Key driver: "${feat}". Use the Simulate tab to test lifestyle changes in real time.`
            })()}
          </div>
        </div>
      )}


            {/* Explainability */}
            {activeTab === "explainability" && (
              <div className="animate-fade-in">
                <p className="text-gray-500 text-sm mb-4">
                  These charts show which factors are driving each
                  risk prediction. Red = increases risk, Green = reduces risk.
                </p>
                {predictions.map(p => (
                  <ShapChart key={p.condition}
                    condition={p.condition}
                    features={p.top_shap_features} />
                ))}
              </div>
            )}

            {/* Recommendations */}
            {activeTab === "recommendations" && (
              <div className="animate-fade-in space-y-3">
                {loadingRecs ? (
                  <div className="card text-center py-8 text-gray-400">
                    ⏳ Generating personalised recommendations...
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="card text-center py-8 text-gray-400">
                    No recommendations yet.
                  </div>
                ) : recommendations.map((rec, i) => (
                  <div key={i}
                    className={`rounded-2xl border-2 p-4 ${tierColors[rec.tier] || tierColors[3]}`}>
                    <div className="flex gap-3">
                      <span className="text-xl shrink-0">
                        {tierIcons[rec.tier]}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          {rec.priority} — {rec.condition}
                        </p>
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {rec.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
