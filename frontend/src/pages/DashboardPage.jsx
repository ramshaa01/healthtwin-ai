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

const CONDITIONS_LABEL = {
  diabetes: "Type 2 Diabetes", hypertension: "Hypertension",
  heart: "Heart Disease",      obesity: "Obesity",
  stress: "Stress"
}

function ShapChart({ condition, features }) {
  if (!features || features.length === 0) return null
  const data = [...features]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 6)
    .map(f => ({
      feature: f.feature.length > 14
        ? f.feature.slice(0, 13) + "…"
        : f.feature,
      value: parseFloat(f.shap_value.toFixed(4)),
      abs: Math.abs(f.shap_value)
    }))

  return (
    <div style={{ background: "white", borderRadius: "12px",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  marginBottom: "1rem" }}>
      <h4 style={{ color: "#374151", marginBottom: "0.75rem",
                   fontSize: "0.95rem" }}>
        {CONDITIONS_LABEL[condition]} — Feature Impact (SHAP)
      </h4>
      <p style={{ fontSize: "0.75rem", color: "#9ca3af",
                  marginBottom: "0.75rem" }}>
        🔴 Red = increases risk &nbsp;|&nbsp; 🟢 Green = reduces risk
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical"
                  margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="feature"
                 tick={{ fontSize: 11 }} width={110} />
          <Tooltip
            formatter={(v) => [v.toFixed(4), "SHAP value"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.value > 0 ? "#ef4444" : "#22c55e"} />
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

  const hasResults = predictions.length > 0

  const tabStyle = (tab) => ({
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    background: activeTab === tab ? "#1e40af" : "#e5e7eb",
    color: activeTab === tab ? "white" : "#374151"
  })

  const tierColors = { 1: "#fef2f2", 2: "#fffbeb", 3: "#f0fdf4" }
  const tierBorder = { 1: "#fca5a5", 2: "#fcd34d", 3: "#86efac" }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto",
                    padding: "2rem 1rem" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "1.5rem",
                      flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ color: "#1e40af" }}>Your Health Dashboard</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/assessment")}
              style={{ padding: "0.75rem 1.5rem", background: "#1e40af",
                       color: "white", border: "none", borderRadius: "10px",
                       fontWeight: "bold", cursor: "pointer",
                       fontSize: "0.95rem" }}>
              🩺 {hasResults ? "Retake Assessment" : "Start Assessment"}
            </button>
            <button
              onClick={() => navigate("/simulate")}
              style={{ padding: "0.75rem 1.5rem", background: "#7c3aed",
                       color: "white", border: "none", borderRadius: "10px",
                       fontWeight: "bold", cursor: "pointer",
                       fontSize: "0.95rem" }}>
              🔮 What-If Simulation
            </button>
          </div>
        </div>

        {!hasResults ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem",
                        background: "white", borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏥</p>
            <h3 style={{ color: "#374151", marginBottom: "0.75rem" }}>
              No health data yet
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Complete your health assessment to see personalised
              risk predictions and recommendations.
            </p>
            <button
              onClick={() => navigate("/assessment")}
              style={{ padding: "0.85rem 2rem", background: "#1e40af",
                       color: "white", border: "none",
                       borderRadius: "10px", fontWeight: "bold",
                       cursor: "pointer", fontSize: "1rem" }}>
              Start Your Assessment →
            </button>
          </div>
        ) : (
          <>
            {/* Health Score */}
            <div style={{ marginBottom: "2rem" }}>
              <HealthScoreGauge
                score={healthScore}
                breakdown={healthScore?.breakdown}
              />
            </div>

            {/* Tab navigation */}
            <div style={{ display: "flex", gap: "0.5rem",
                          marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {["overview", "explainability", "recommendations"].map(tab => (
                <button key={tab} style={tabStyle(tab)}
                  onClick={() => {
                    if (tab === "recommendations") fetchRecommendations()
                    else setActiveTab(tab)
                  }}>
                  {tab === "overview"        ? "📊 Risk Overview" :
                   tab === "explainability"  ? "🔍 Explainability" :
                   "💡 Recommendations"}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", gap: "1rem",
                            flexWrap: "wrap" }}>
                {predictions.map(p => (
                  <RiskCard key={p.condition} {...p} />
                ))}
              </div>
            )}

            {/* Explainability tab */}
            {activeTab === "explainability" && (
              <div>
                <p style={{ color: "#6b7280", marginBottom: "1rem",
                            fontSize: "0.9rem" }}>
                  These charts show which factors are driving each
                  risk prediction. Red bars push risk up,
                  green bars pull it down.
                </p>
                {predictions.map(p => (
                  <ShapChart key={p.condition}
                    condition={p.condition}
                    features={p.top_shap_features} />
                ))}
              </div>
            )}

            {/* Recommendations tab */}
            {activeTab === "recommendations" && (
              <div>
                {loadingRecs ? (
                  <p style={{ color: "#6b7280" }}>
                    Generating recommendations...
                  </p>
                ) : recommendations.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>
                    No recommendations loaded yet.
                  </p>
                ) : (
                  recommendations.map((rec, i) => (
                    <div key={i} style={{
                      background: tierColors[rec.tier] || "#f9fafb",
                      border: `1px solid ${tierBorder[rec.tier] || "#e5e7eb"}`,
                      borderRadius: "12px", padding: "1.25rem",
                      marginBottom: "0.75rem"
                    }}>
                      <div style={{ display: "flex", gap: "0.75rem",
                                    alignItems: "flex-start" }}>
                        <span style={{ fontSize: "1.25rem" }}>
                          {rec.tier === 1 ? "⚠️" :
                           rec.tier === 2 ? "📋" : "✅"}
                        </span>
                        <div>
                          <p style={{ fontWeight: "600", fontSize: "0.85rem",
                                      color: "#6b7280",
                                      marginBottom: "0.25rem" }}>
                            {rec.priority} — {rec.condition.toUpperCase()}
                          </p>
                          <p style={{ color: "#111827",
                                      lineHeight: "1.5" }}>
                            {rec.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
