import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts"
import Navbar from "../components/Navbar"
import { healthAPI } from "../api/client"

const CONDITIONS = ["diabetes","hypertension","heart","obesity","stress"]
const CONDITION_LABELS = {
  diabetes: "Diabetes", hypertension: "Hypertension",
  heart: "Heart Disease", obesity: "Obesity", stress: "Stress"
}
const COLORS = {
  diabetes: "#3b82f6", hypertension: "#ef4444",
  heart: "#f97316", obesity: "#a855f7", stress: "#ec4899"
}

const MONTHS = ["Now","Jan","Feb","Mar","Apr","May",
                "Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export default function ForecastPage() {
  const [forecast, setForecast]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [selected, setSelected]       = useState("diabetes")
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem("healthtwin_result")
    if (!stored) { navigate("/assessment"); return }
    runForecast()
  }, [navigate])

  const runForecast = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await healthAPI.forecast()
      setForecast(res.data)
    } catch (e) {
      setError(e.response?.data?.detail ||
               "Forecast failed. Please run assessment first.")
    } finally {
      setLoading(false)
    }
  }

  // Build chart data: interpolate best/expected/worst over 12 months
  const buildChartData = (condition) => {
    if (!forecast) return []
    const t = forecast.trajectories[condition]
    if (!t) return []
    const stored = sessionStorage.getItem("healthtwin_result")
    const current = stored
      ? JSON.parse(stored).predictions
          .find(p => p.condition === condition)?.risk_probability ?? t.expected
      : t.expected

    return MONTHS.map((month, i) => {
      const frac = i / 12
      return {
        month,
        "Best Case":  parseFloat(
          (current + (t.best_case  - current) * frac).toFixed(4)),
        "Expected":   parseFloat(
          (current + (t.expected   - current) * frac).toFixed(4)),
        "Worst Case": parseFloat(
          (current + (t.worst_case - current) * frac).toFixed(4)),
      }
    })
  }

  const chartData = buildChartData(selected)
  const traj = forecast?.trajectories?.[selected]

  const pct = (v) => v !== undefined
    ? (v * 100).toFixed(1) + "%" : "—"

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto",
                    padding: "2rem 1rem" }}>

        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "1.5rem",
                      flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ color: "#1e40af" }}>
              📈 12-Month Risk Forecast
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Monte Carlo simulation (100 variations) showing your
              probable risk trajectory over the next year.
            </p>
          </div>
          <button onClick={runForecast}
            style={{ padding: "0.6rem 1.25rem", background: "#1e40af",
                     color: "white", border: "none",
                     borderRadius: "8px", fontWeight: "bold",
                     cursor: "pointer" }}>
            🔄 Recalculate
          </button>
        </div>

        {error && (
          <div style={{ background: "#fef2f2",
                        border: "1px solid #fca5a5",
                        padding: "0.75rem", borderRadius: "8px",
                        color: "#dc2626", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem",
                        background: "white", borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              ⏳
            </p>
            <p style={{ color: "#6b7280" }}>
              Running 100 Monte Carlo simulations...
            </p>
          </div>
        ) : (
          <>
            {/* Condition selector tabs */}
            <div style={{ display: "flex", gap: "0.5rem",
                          marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {CONDITIONS.map(c => (
                <button key={c}
                  onClick={() => setSelected(c)}
                  style={{
                    padding: "0.5rem 1rem", borderRadius: "8px",
                    border: `2px solid ${COLORS[c]}`,
                    background: selected === c ? COLORS[c] : "white",
                    color: selected === c ? "white" : COLORS[c],
                    fontWeight: "600", cursor: "pointer",
                    fontSize: "0.85rem"
                  }}>
                  {CONDITION_LABELS[c]}
                </button>
              ))}
            </div>

            {/* Summary cards */}
            {traj && (
              <div style={{ display: "flex", gap: "1rem",
                            marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "Best Case",  key: "best_case",
                    color: "#16a34a", icon: "🌟",
                    sub: "If habits improve" },
                  { label: "Expected",   key: "expected",
                    color: "#d97706", icon: "📊",
                    sub: "Most likely outcome" },
                  { label: "Worst Case", key: "worst_case",
                    color: "#dc2626", icon: "⚠️",
                    sub: "If habits worsen" },
                ].map(card => (
                  <div key={card.key} style={{
                    flex: 1, minWidth: "150px",
                    background: "white", borderRadius: "12px",
                    padding: "1.25rem", textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    borderTop: `4px solid ${card.color}`
                  }}>
                    <p style={{ fontSize: "1.5rem",
                                marginBottom: "0.25rem" }}>
                      {card.icon}
                    </p>
                    <p style={{ fontSize: "1.75rem", fontWeight: "bold",
                                color: card.color }}>
                      {pct(traj[card.key])}
                    </p>
                    <p style={{ fontWeight: "600", color: "#374151",
                                fontSize: "0.9rem" }}>
                      {card.label}
                    </p>
                    <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                      {card.sub}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Line chart */}
            <div style={{ background: "white", borderRadius: "16px",
                          padding: "1.5rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ color: "#374151", marginBottom: "1rem" }}>
                {CONDITION_LABELS[selected]} — 12-Month Trajectory
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => (v*100).toFixed(0) + "%"}
                         domain={[0, 1]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v, name) =>
                      [(v*100).toFixed(1) + "%", name]} />
                  <Legend />
                  <ReferenceLine y={0.7} stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: "High Risk", fontSize: 11,
                             fill: "#ef4444", position: "right" }} />
                  <ReferenceLine y={0.4} stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: "Moderate", fontSize: 11,
                             fill: "#f59e0b", position: "right" }} />
                  <Line type="monotone" dataKey="Best Case"
                    stroke="#16a34a" strokeWidth={2}
                    dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="Expected"
                    stroke={COLORS[selected]} strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Worst Case"
                    stroke="#ef4444" strokeWidth={2}
                    dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <p style={{ color: "#9ca3af", fontSize: "0.75rem",
                          marginTop: "0.75rem", textAlign: "center" }}>
                Based on 100 Monte Carlo simulations with realistic
                week-to-week lifestyle variability.
                Dashed lines = thresholds for High (70%) and Moderate (40%) risk.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
