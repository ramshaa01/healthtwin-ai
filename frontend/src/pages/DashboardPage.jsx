import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts"
import Navbar from "../components/Navbar"
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
  const { user } = useAuth()
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
      const res = await healthAPI.recommendations()
      setRecommendations(res.data.recommendations || [])
      setActiveTab("recommendations")
    } catch (e) {
      console.error("Recommendations failed:", e)
    } finally {
      setLoadingRecs(false)
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
            <button onClick={() => navigate("/assessment")}
              className="btn-primary text-sm py-2 px-4">
              🩺 {hasResults ? "Retake Assessment" : "Start Assessment"}
            </button>
            {hasResults && (
              <>
                <button onClick={() => navigate("/simulate")}
                  className="btn-secondary text-sm py-2 px-4">
                  🔮 Simulate
                </button>
                <button onClick={downloadReport}
                  className="btn-success text-sm py-2 px-4">
                  📄 PDF
                </button>
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
              <div className="flex flex-wrap gap-4 animate-fade-in">
                {predictions.map(p => (
                  <RiskCard key={p.condition} {...p} />
                ))}
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
