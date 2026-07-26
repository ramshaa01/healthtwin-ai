import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend
} from "recharts"
import Navbar from "../components/Navbar"
import { healthAPI } from "../api/client"

const SLIDERS = [
  { key: "sleep_hours", label: "Sleep Hours/Night",
    min: 3, max: 12, step: 0.5, unit: "hrs", icon: "😴",
    tip: "Optimal: 7-9 hours" },
  { key: "physical_activity", label: "Exercise Sessions/Week",
    min: 0, max: 14, step: 0.5, unit: "sessions", icon: "🏃",
    tip: "Target: 3-5 sessions" },
  { key: "dietary_quality", label: "Dietary Quality",
    min: 1, max: 10, step: 1, unit: "/10", icon: "🥗",
    tip: "10 = excellent diet" },
  { key: "stress_level", label: "Stress Level",
    min: 1, max: 10, step: 1, unit: "/10", icon: "🧘",
    tip: "1 = very low stress" },
  { key: "weight_kg", label: "Weight (kg)",
    min: 40, max: 200, step: 0.5, unit: "kg", icon: "⚖️",
    tip: "BMI updates automatically" },
  { key: "systolic_bp", label: "Systolic Blood Pressure",
    min: 80, max: 200, step: 1, unit: "mmHg", icon: "❤️",
    tip: "Healthy: below 120 mmHg" },
]

const CONDITIONS = ["diabetes","hypertension","heart","obesity","stress"]
const LABELS = { diabetes:"Diabetes", hypertension:"Hypertension",
  heart:"Heart", obesity:"Obesity", stress:"Stress" }
const RISK_COLOR = p =>
  p >= 0.7 ? "#ef4444" : p >= 0.4 ? "#f59e0b" : "#10b981"

export default function SimulatePage() {
  const [baseline, setBaseline] = useState(null)
  const [vals, setVals] = useState({})
  const [simResult, setSimResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem("healthtwin_result")
    if (!stored) { navigate("/assessment"); return }
    setBaseline(JSON.parse(stored))
    const inp = sessionStorage.getItem("healthtwin_input")
    if (inp) {
      const p = JSON.parse(inp)
      const init = {}
      SLIDERS.forEach(s => { if (p[s.key] !== undefined) init[s.key] = p[s.key] })
      setVals(init)
    }
  }, [navigate])

  const simulate = useCallback(async (v) => {
    if (!Object.keys(v).length) return
    setLoading(true)
    try {
      const res = await healthAPI.simulate(v)
      setSimResult(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  const handleSlider = (key, value) => {
    const updated = { ...vals, [key]: parseFloat(value) }
    setVals(updated)
    simulate(updated)
  }

  const reset = () => {
    const inp = sessionStorage.getItem("healthtwin_input")
    if (inp) {
      const p = JSON.parse(inp)
      const init = {}
      SLIDERS.forEach(s => { if (p[s.key] !== undefined) init[s.key] = p[s.key] })
      setVals(init)
      setSimResult(null)
    }
  }

  const radarData = CONDITIONS.map(c => ({
    condition: LABELS[c],
    Baseline: Math.round((baseline?.predictions?.find(p => p.condition===c)?.risk_probability ?? 0) * 100),
    Simulated: Math.round((simResult?.predictions?.find(p => p.condition===c)?.risk_probability ?? baseline?.predictions?.find(p => p.condition===c)?.risk_probability ?? 0) * 100),
  }))

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔮 What-If Simulation</h2>
            <p className="text-gray-500 text-sm mt-1">
              Adjust sliders to simulate lifestyle changes instantly
            </p>
          </div>
          <div className="flex gap-2">
            {loading && <span className="text-xs text-primary-600 animate-pulse self-center font-medium">⏳ Simulating...</span>}
            <button onClick={reset} className="btn-secondary text-sm py-2 px-4">↺ Reset</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card space-y-5">
            <h3 className="font-bold text-gray-800">Lifestyle Factors</h3>
            {SLIDERS.map(s => (
              <div key={s.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span>{s.icon}</span>{s.label}
                  </label>
                  <span className="text-sm font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg">
                    {vals[s.key] ?? "—"} {s.unit}
                  </span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step}
                  value={vals[s.key] ?? s.min}
                  onChange={e => handleSlider(s.key, e.target.value)}
                  className="w-full accent-primary-600" />
                <p className="text-xs text-gray-400 mt-0.5">{s.tip}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3">Risk Profile Comparison</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="condition" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip formatter={v => v + "%"} />
                  <Legend />
                  <Radar name="Baseline" dataKey="Baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                  <Radar name="Simulated" dataKey="Simulated" stroke="#1e40af" fill="#1e40af" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3">Risk Changes</h3>
              <div className="space-y-2">
                {CONDITIONS.map(c => {
                  const base = baseline?.predictions?.find(p => p.condition===c)
                  const sim = simResult?.predictions?.find(p => p.condition===c)
                  const bP = base?.risk_probability ?? 0
                  const sP = sim?.risk_probability ?? bP
                  const d = sP - bP
                  return (
                    <div key={c} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-sm font-medium text-gray-700 w-24">{LABELS[c]}</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span style={{ color: RISK_COLOR(bP) }} className="font-semibold">{(bP*100).toFixed(1)}%</span>
                        <span className="text-gray-300">→</span>
                        <span style={{ color: RISK_COLOR(sP) }} className="font-semibold">{(sP*100).toFixed(1)}%</span>
                        <span className={`font-bold text-xs w-16 text-right ${d<0?'text-emerald-600':d>0?'text-red-500':'text-gray-400'}`}>
                          {d===0?"—":(d>0?"▲ +":"▼ ")+(d*100).toFixed(1)+"%"}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
