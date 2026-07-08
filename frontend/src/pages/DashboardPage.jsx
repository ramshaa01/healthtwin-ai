import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import HealthScoreGauge from "../components/HealthScoreGauge"
import RiskCard from "../components/RiskCard"

const MOCK_PREDICTIONS = [
  { condition: "diabetes",     risk_probability: 0.36,
    risk_level: "Low",
    top_shap_features: [
      { feature: "GenHlth",    shap_value: 0.38 },
      { feature: "Age",        shap_value: 0.26 },
      { feature: "BMI",        shap_value: 0.21 }
    ]},
  { condition: "hypertension", risk_probability: 0.75,
    risk_level: "High",
    top_shap_features: [
      { feature: "Age",        shap_value: 0.65 },
      { feature: "HighChol",   shap_value: 0.38 },
      { feature: "BMI",        shap_value: 0.32 }
    ]},
  { condition: "heart",        risk_probability: 0.40,
    risk_level: "Moderate",
    top_shap_features: [
      { feature: "age",        shap_value: -0.12 },
      { feature: "sex",        shap_value:  0.10 },
      { feature: "chol",       shap_value: -0.06 }
    ]},
  { condition: "obesity",      risk_probability: 0.85,
    risk_level: "High",
    top_shap_features: [
      { feature: "family_history", shap_value: 1.21 },
      { feature: "Age",            shap_value: 1.10 },
      { feature: "CAEC",           shap_value: 0.69 }
    ]},
  { condition: "stress",       risk_probability: 0.92,
    risk_level: "High",
    top_shap_features: [
      { feature: "Quality of Sleep", shap_value:  0.37 },
      { feature: "Gender",           shap_value:  0.16 },
      { feature: "systolic_bp",      shap_value: -0.04 }
    ]}
]

const MOCK_SCORE = {
  total: 44.1,
  breakdown: { physical: 10.0, mental: 7.5,
               nutrition: 9.0, sleep: 17.5 }
}

export default function DashboardPage() {
  const navigate = useNavigate()

  // Try to load real result from assessment, fall back to mock data
  const stored = sessionStorage.getItem("healthtwin_result")
  const result = stored ? JSON.parse(stored) : null

  const [predictions] = useState(result?.predictions || MOCK_PREDICTIONS)
  const [healthScore] = useState(result?.health_score || MOCK_SCORE)

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto",
                    padding: "2rem 1rem" }}>
        <h2 style={{ color: "#1e40af", marginBottom: "1rem" }}>
          Your Health Dashboard
        </h2>

        {/* Assessment CTA Button */}
        <button
          onClick={() => navigate("/assessment")}
          style={{ marginBottom: "1.5rem", padding: "0.85rem 2rem",
                   background: "#1e40af", color: "white",
                   border: "none", borderRadius: "10px",
                   fontSize: "1rem", fontWeight: "bold",
                   cursor: "pointer" }}>
          🩺 Start Health Assessment
        </button>

        {!result && (
          <p style={{ color: "#6b7280", fontSize: "0.85rem",
                      marginBottom: "1.5rem" }}>
            📋 Showing mock data — click the button above to run your real assessment
          </p>
        )}

        {/* Health Score */}
        <div style={{ marginBottom: "2rem" }}>
          <HealthScoreGauge
            score={healthScore}
            breakdown={healthScore.breakdown}
          />
        </div>

        {/* Risk Cards */}
        <h3 style={{ marginBottom: "1rem", color: "#374151" }}>
          Disease Risk Assessment
        </h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap",
                      marginBottom: "2rem" }}>
          {predictions.map(p => (
            <RiskCard key={p.condition} {...p} />
          ))}
        </div>

        {!result && (
          <p style={{ color: "#9ca3af", fontSize: "0.85rem",
                      textAlign: "center" }}>
            📋 Mock data shown — complete the health assessment form
            to see your real predictions
          </p>
        )}
      </div>
    </div>
  )
}
