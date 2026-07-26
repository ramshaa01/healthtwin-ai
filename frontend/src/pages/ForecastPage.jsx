import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts"
import Navbar from "../components/Navbar"
import { healthAPI } from "../api/client"

const CONDITIONS = ["diabetes","hypertension","heart","obesity","stress"]
const LABELS = { diabetes:"Diabetes", hypertension:"Hypertension",
  heart:"Heart Disease", obesity:"Obesity", stress:"Stress" }
const COLORS = { diabetes:"#3b82f6", hypertension:"#ef4444",
  heart:"#f97316", obesity:"#a855f7", stress:"#ec4899" }
const MONTHS = ["Now","Jan","Feb","Mar","Apr","May",
                "Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export default function ForecastPage() {
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState("diabetes")
  const [error, setError]       = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem("healthtwin_result")
    if (!stored) { navigate("/assessment"); return }
    run()
  }, [navigate])

  const run = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await healthAPI.forecast()
      setForecast(res.data)
    } catch (e) {
      setError("Forecast failed. Please run assessment first.")
    } finally {
      setLoading(false)
    }
  }

  const buildData = (c) => {
    if (!forecast) return []
    const t = forecast.trajectories[c]
    if (!t) return []
    const stored = sessionStorage.getItem("healthtwin_result")
    const cur = stored
      ? JSON.parse(stored).predictions.find(p=>p.condition===c)?.risk_probability ?? t.expected
      : t.expected
    return MONTHS.map((month, i) => {
      const f = i / 12
      return {
        month,
        "Best Case":  parseFloat((cur+(t.best_case -cur)*f).toFixed(4)),
        "Expected":   parseFloat((cur+(t.expected  -cur)*f).toFixed(4)),
        "Worst Case": parseFloat((cur+(t.worst_case-cur)*f).toFixed(4)),
      }
    })
  }

  const traj = forecast?.trajectories?.[selected]

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📈 12-Month Forecast</h2>
            <p className="text-gray-500 text-sm mt-1">Monte Carlo simulation — 100 variations</p>
          </div>
          <button onClick={run} className="btn-secondary text-sm py-2 px-4">🔄 Recalculate</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <p className="text-gray-500 font-medium">Running 100 Monte Carlo simulations...</p>
            <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
          </div>
        ) : (
          <>
            {/* Condition selector pills */}
            <div className="flex gap-2 flex-wrap mb-5">
              {CONDITIONS.map(c => (
                <button key={c} onClick={() => setSelected(c)}
                  style={selected===c
                    ? { background: COLORS[c], borderColor: COLORS[c], color: 'white' }
                    : { color: COLORS[c], borderColor: COLORS[c] }}
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold border-2 bg-white transition-all">
                  {LABELS[c]}
                </button>
              ))}
            </div>

            {/* 3-scenario summary cards */}
            {traj && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Best Case",  k: "best_case",  icon: "🌟", sub: "If habits improve",  cls: "border-emerald-400 text-emerald-600" },
                  { label: "Expected",   k: "expected",   icon: "📊", sub: "Most likely",         cls: "border-amber-400 text-amber-600" },
                  { label: "Worst Case", k: "worst_case", icon: "⚠️", sub: "If habits worsen",   cls: "border-red-400 text-red-600" },
                ].map(c => (
                  <div key={c.k} className={`card border-t-4 ${c.cls} text-center p-4`}>
                    <p className="text-xl mb-1">{c.icon}</p>
                    <p className={`text-xl font-bold ${c.cls.split(' ')[1]}`}>
                      {traj[c.k] !== undefined ? (traj[c.k] * 100).toFixed(1) + "%" : "—"}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">{c.label}</p>
                    <p className="text-xs text-gray-400">{c.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Line chart */}
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">
                {LABELS[selected]} — 12-Month Trajectory
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={buildData(selected)}
                  margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => (v * 100).toFixed(0) + "%"} domain={[0, 1]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n) => [(v * 100).toFixed(1) + "%", n]} />
                  <Legend />
                  <ReferenceLine y={0.7} stroke="#ef4444" strokeDasharray="4 4"
                    label={{ value: "High 70%", fontSize: 10, fill: "#ef4444", position: "right" }} />
                  <ReferenceLine y={0.4} stroke="#f59e0b" strokeDasharray="4 4"
                    label={{ value: "Mod 40%", fontSize: 10, fill: "#f59e0b", position: "right" }} />
                  <Line type="monotone" dataKey="Best Case" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="Expected" stroke={COLORS[selected]} strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Worst Case" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 text-center mt-2">
                Dashed lines = risk thresholds. Green dashed = best case, Red dashed = worst case.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
