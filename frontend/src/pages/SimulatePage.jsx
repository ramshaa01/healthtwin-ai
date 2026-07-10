import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend
} from "recharts"
import Navbar from "../components/Navbar"
import { healthAPI } from "../api/client"

const SLIDERS = [
  { key: "sleep_hours",       label: "Sleep Hours/Night",
    min: 3, max: 12, step: 0.5, unit: "hrs",
    tip: "Optimal: 7-9 hours" },
  { key: "physical_activity", label: "Exercise Sessions/Week",
    min: 0, max: 14, step: 0.5, unit: "sessions",
    tip: "Target: 3-5 sessions" },
  { key: "dietary_quality",   label: "Dietary Quality",
    min: 1, max: 10, step: 1,   unit: "/10",
    tip: "10 = excellent diet" },
  { key: "stress_level",      label: "Stress Level",
    min: 1, max: 10, step: 1,   unit: "/10",
    tip: "1 = very low stress" },
  { key: "weight_kg",         label: "Weight (kg)",
    min: 40, max: 200, step: 0.5, unit: "kg",
    tip: "BMI updates automatically" },
  { key: "systolic_bp",       label: "Systolic Blood Pressure",
    min: 80, max: 200, step: 1, unit: "mmHg",
    tip: "Healthy: below 120 mmHg" },
]

const CONDITIONS = ["diabetes","hypertension","heart","obesity","stress"]
const CONDITION_LABELS = {
  diabetes: "Diabetes", hypertension: "Hypertension",
  heart: "Heart", obesity: "Obesity", stress: "Stress"
}
const RISK_COLOR = (prob) =>
  prob >= 0.7 ? "#ef4444" : prob >= 0.4 ? "#f59e0b" : "#22c55e"

export default function SimulatePage() {
  const [baseline, setBaseline]   = useState(null)
  const [sliderVals, setSliderVals] = useState({})
  const [simResult, setSimResult]   = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")
  const navigate = useNavigate()

  // Load baseline predictions from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("healthtwin_result")
    if (!stored) { navigate("/assessment"); return }
    const data = JSON.parse(stored)
    setBaseline(data)

    // Initialise sliders from the stored input
    const storedInput = sessionStorage.getItem("healthtwin_input")
    if (storedInput) {
      const inp = JSON.parse(storedInput)
      const init = {}
      SLIDERS.forEach(s => { if (inp[s.key] !== undefined)
        init[s.key] = inp[s.key] })
      setSliderVals(init)
    }
  }, [navigate])

  const runSimulation = useCallback(async (vals) => {
    if (Object.keys(vals).length === 0) return
    setLoading(true)
    setError("")
    try {
      const res = await healthAPI.simulate(vals)
      setSimResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail ||
               "Simulation failed. Run assessment first.")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSlider = (key, value) => {
    const updated = { ...sliderVals, [key]: parseFloat(value) }
    setSliderVals(updated)
    runSimulation(updated)
  }

  const resetSliders = () => {
    const storedInput = sessionStorage.getItem("healthtwin_input")
    if (storedInput) {
      const inp = JSON.parse(storedInput)
      const init = {}
      SLIDERS.forEach(s => { if (inp[s.key] !== undefined)
        init[s.key] = inp[s.key] })
      setSliderVals(init)
      setSimResult(null)
    }
  }

  // Build radar chart data comparing baseline vs simulated
  const radarData = CONDITIONS.map(c => {
    const base = baseline?.predictions?.find(p => p.condition === c)
    const sim  = simResult?.predictions?.find(p => p.condition === c)
    return {
      condition: CONDITION_LABELS[c],
      Baseline:  base ? Math.round(base.risk_probability * 100) : 0,
      Simulated: sim  ? Math.round(sim.risk_probability  * 100) : 0,
    }
  })

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto",
                    padding: "2rem 1rem" }}>

        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "1.5rem",
                      flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ color: "#1e40af" }}>
              🔮 What-If Simulation
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Adjust the sliders to simulate lifestyle changes and
              instantly see how your risk profile changes.
            </p>
          </div>
          <button onClick={resetSliders}
            style={{ padding: "0.6rem 1.25rem", background: "white",
                     color: "#1e40af", border: "2px solid #1e40af",
                     borderRadius: "8px", fontWeight: "bold",
                     cursor: "pointer" }}>
            ↺ Reset to Baseline
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

        <div style={{ display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem" }}>

          {/* Left: Sliders */}
          <div style={{ background: "white", borderRadius: "16px",
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ color: "#374151", marginBottom: "1.25rem" }}>
              Adjust Lifestyle Factors
            </h3>
            {loading && (
              <p style={{ color: "#3b82f6", fontSize: "0.85rem",
                          marginBottom: "0.75rem" }}>
                ⏳ Simulating...
              </p>
            )}
            {SLIDERS.map(slider => (
              <div key={slider.key}
                   style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.25rem" }}>
                  <label style={{ fontWeight: "500",
                                  color: "#374151",
                                  fontSize: "0.9rem" }}>
                    {slider.label}
                  </label>
                  <span style={{ fontWeight: "bold",
                                 color: "#1e40af" }}>
                    {sliderVals[slider.key] ?? "—"} {slider.unit}
                  </span>
                </div>
                <input type="range"
                  min={slider.min} max={slider.max} step={slider.step}
                  value={sliderVals[slider.key] ?? slider.min}
                  onChange={e => handleSlider(slider.key, e.target.value)}
                  style={{ width: "100%", accentColor: "#1e40af" }}
                />
                <p style={{ fontSize: "0.75rem", color: "#9ca3af",
                            marginTop: "0.15rem" }}>
                  {slider.tip}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Results */}
          <div>
            {/* Radar chart */}
            <div style={{ background: "white", borderRadius: "16px",
                          padding: "1.5rem", marginBottom: "1rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ color: "#374151", marginBottom: "1rem" }}>
                Risk Profile: Baseline vs Simulated
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="condition"
                    tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => v + "%"} />
                  <Legend />
                  <Radar name="Baseline" dataKey="Baseline"
                    stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                  <Radar name="Simulated" dataKey="Simulated"
                    stroke="#1e40af" fill="#1e40af" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-condition comparison */}
            <div style={{ background: "white", borderRadius: "16px",
                          padding: "1.5rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ color: "#374151",
                           marginBottom: "1rem" }}>
                Risk Change
              </h3>
              {CONDITIONS.map(c => {
                const base = baseline?.predictions
                  ?.find(p => p.condition === c)
                const sim  = simResult?.predictions
                  ?.find(p => p.condition === c)
                const baseP = base?.risk_probability ?? 0
                const simP  = sim?.risk_probability  ?? baseP
                const delta = simP - baseP
                return (
                  <div key={c} style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid #f3f4f6"
                  }}>
                    <span style={{ fontWeight: "500",
                                   fontSize: "0.9rem",
                                   color: "#374151", minWidth: "110px" }}>
                      {CONDITION_LABELS[c]}
                    </span>
                    <span style={{ color: RISK_COLOR(baseP),
                                   fontWeight: "600", minWidth: "55px",
                                   textAlign: "right" }}>
                      {(baseP * 100).toFixed(1)}%
                    </span>
                    <span style={{ color: "#9ca3af",
                                   margin: "0 0.5rem" }}>→</span>
                    <span style={{ color: RISK_COLOR(simP),
                                   fontWeight: "600", minWidth: "55px" }}>
                      {(simP * 100).toFixed(1)}%
                    </span>
                    <span style={{
                      fontWeight: "bold", fontSize: "0.85rem",
                      color: delta < 0 ? "#16a34a" :
                             delta > 0 ? "#dc2626" : "#6b7280",
                      minWidth: "65px", textAlign: "right"
                    }}>
                      {delta === 0 ? "—" :
                       (delta > 0 ? "▲ +" : "▼ ") +
                       (delta * 100).toFixed(1) + "%"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
