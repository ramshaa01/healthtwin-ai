import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { healthAPI } from "../api/client"

const CONDITION_LABELS = {
  diabetes: "Diabetes", hypertension: "Hypertension",
  heart: "Heart Disease", obesity: "Obesity", stress: "Stress"
}
const RISK_COLOR = (level) =>
  level === "High" ? "#ef4444" :
  level === "Moderate" ? "#f59e0b" : "#22c55e"

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    healthAPI.history()
      .then(res => setHistory(res.data.history || []))
      .catch(e => setError(
        e.response?.data?.detail || "Failed to load history"
      ))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (ts) => {
    if (!ts) return "Unknown"
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const loadResult = (record) => {
    sessionStorage.setItem("healthtwin_result",
      JSON.stringify({
        bmi: record.bmi,
        predictions: record.predictions,
        health_score: record.health_score
      })
    )
    if (record.input) {
      sessionStorage.setItem("healthtwin_input",
        JSON.stringify(record.input))
    }
    navigate("/dashboard")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto",
                    padding: "2rem 1rem" }}>
        <h2 style={{ color: "#1e40af", marginBottom: "0.5rem" }}>
          📋 Assessment History
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.9rem",
                    marginBottom: "1.5rem" }}>
          Your last {history.length} health assessments,
          most recent first.
        </p>

        {error && (
          <div style={{ background: "#fef2f2",
                        border: "1px solid #fca5a5",
                        padding: "0.75rem", borderRadius: "8px",
                        color: "#dc2626", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading history...</p>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem",
                        background: "white", borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "2rem" }}>📭</p>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
              No assessments yet. Complete your first assessment to
              see history here.
            </p>
          </div>
        ) : (
          history.map((record, idx) => (
            <div key={idx} style={{
              background: "white", borderRadius: "16px",
              padding: "1.5rem", marginBottom: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb"
            }}>
              {/* Header row */}
              <div style={{ display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                            flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <p style={{ fontWeight: "700", color: "#111827",
                               fontSize: "1rem" }}>
                    Assessment #{history.length - idx}
                  </p>
                  <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                    {formatDate(record.timestamp)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem",
                              alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold",
                                color: record.health_score?.total >= 75
                                  ? "#16a34a"
                                  : record.health_score?.total >= 50
                                  ? "#d97706" : "#dc2626" }}>
                      {record.health_score?.total ?? record.health_score ?? "—"}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                      Health Score
                    </p>
                  </div>
                  <button onClick={() => loadResult(record)}
                    style={{ padding: "0.5rem 1rem",
                             background: "#1e40af", color: "white",
                             border: "none", borderRadius: "8px",
                             fontWeight: "600", cursor: "pointer",
                             fontSize: "0.85rem" }}>
                    View →
                  </button>
                </div>
              </div>

              {/* Risk badges */}
              <div style={{ display: "flex", gap: "0.5rem",
                            flexWrap: "wrap" }}>
                {(record.predictions || []).map(p => (
                  <span key={p.condition} style={{
                    padding: "0.25rem 0.75rem", borderRadius: "999px",
                    fontSize: "0.75rem", fontWeight: "600",
                    background: RISK_COLOR(p.risk_level) + "20",
                    color: RISK_COLOR(p.risk_level),
                    border: `1px solid ${RISK_COLOR(p.risk_level)}`
                  }}>
                    {CONDITION_LABELS[p.condition]}:&nbsp;
                    {(p.risk_probability * 100).toFixed(0)}%
                  </span>
                ))}
              </div>

              {/* Key inputs summary */}
              {record.input && (
                <div style={{ marginTop: "0.75rem", padding: "0.75rem",
                              background: "#f8fafc",
                              borderRadius: "8px",
                              fontSize: "0.8rem", color: "#6b7280",
                              display: "flex", gap: "1.5rem",
                              flexWrap: "wrap" }}>
                  <span>BMI: <b>{record.bmi?.toFixed(1)}</b></span>
                  <span>Sleep: <b>{record.input.sleep_hours}h</b></span>
                  <span>Activity: <b>{record.input.physical_activity}x/wk</b></span>
                  <span>Stress: <b>{record.input.stress_level}/10</b></span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
