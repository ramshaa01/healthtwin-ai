import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts"
import Navbar from "../components/Navbar"
import { healthAPI } from "../api/client"

const CONDITIONS = ["diabetes","hypertension","heart","obesity","stress"]
const CONDITION_LABELS = {
  diabetes: "Diabetes", hypertension: "Hypertension",
  heart: "Heart", obesity: "Obesity", stress: "Stress"
}
const COLORS = {
  diabetes: "#3b82f6", hypertension: "#ef4444",
  heart: "#f97316", obesity: "#a855f7", stress: "#ec4899",
  score: "#1e40af"
}

const getRiskColor = (prob) =>
  prob >= 0.7 ? "#ef4444" : prob >= 0.4 ? "#f59e0b" : "#10b981"

const getScoreColor = (score) =>
  score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"

function StatCard({ label, value, unit, sub, color }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-bold" style={{ color }}>
        {value}{unit}
      </p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function TrendsPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCondition, setActiveCondition] = useState("diabetes")
  const navigate = useNavigate()

  useEffect(() => {
    healthAPI.history()
      .then(res => {
        const h = (res.data.history || []).reverse()
        setHistory(h)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse h-48 bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No trend data yet
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Complete at least 2 assessments to see your health trends.
            </p>
            <button onClick={() => navigate("/assessment")}
              className="btn-primary mx-auto">
              Take Your First Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Build chart data from history
  const chartData = history.map((record, idx) => {
    const score = record.health_score?.total ?? record.health_score ?? 0
    const entry = {
      name: `#${idx + 1}`,
      date: new Date(record.timestamp).toLocaleDateString("en-IN",
        { day: "2-digit", month: "short" }),
      score: parseFloat(score),
    }
    CONDITIONS.forEach(c => {
      const pred = record.predictions?.find(p => p.condition === c)
      entry[c] = pred
        ? parseFloat((pred.risk_probability * 100).toFixed(1))
        : null
    })
    return entry
  })

  // Summary stats
  const latest = chartData[chartData.length - 1]
  const first  = chartData[0]
  const scoreDelta = chartData.length > 1
    ? (latest.score - first.score).toFixed(1)
    : null
  const latestRisks = CONDITIONS.map(c => ({
    condition: c,
    value: latest[c] ?? 0
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-xl
                      shadow-lg p-3 text-xs">
        <p className="font-semibold text-gray-700 mb-1">
          Assessment {label} — {payload[0]?.payload?.date}
        </p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value}
            {p.name === "Health Score" ? "/100" : "%"}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Health Trends
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Track how your health has changed across {history.length} assessments
          </p>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Current Score"
            value={latest.score}
            unit="/100"
            color={getScoreColor(latest.score)}
            sub="Latest assessment"
          />
          {scoreDelta !== null && (
            <StatCard
              label="Score Change"
              value={scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
              unit=" pts"
              color={parseFloat(scoreDelta) >= 0 ? "#10b981" : "#ef4444"}
              sub="Since first assessment"
            />
          )}
          <StatCard
            label="Assessments"
            value={history.length}
            unit=""
            color="#1e40af"
            sub="Total completed"
          />
          <StatCard
            label="High Risk"
            value={latestRisks.filter(r => r.value >= 70).length}
            unit="/5"
            color="#ef4444"
            sub="Conditions above 70%"
          />
        </div>

        {/* Health Score trend */}
        {chartData.length > 1 && (
          <div className="card mb-5">
            <h3 className="font-bold text-gray-800 mb-4">
              Health Score Over Time
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Health Score"
                  stroke={COLORS.score}
                  strokeWidth={3}
                  dot={{ r: 5, fill: COLORS.score }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {parseFloat(scoreDelta) > 0 && (
              <p className="text-xs text-emerald-600 font-medium
                             text-center mt-2">
                Your health score improved by {scoreDelta} points!
              </p>
            )}
            {parseFloat(scoreDelta) < 0 && (
              <p className="text-xs text-amber-600 font-medium
                             text-center mt-2">
                Score decreased by {Math.abs(scoreDelta)} points.
                Check recommendations for improvement tips.
              </p>
            )}
          </div>
        )}

        {/* Current risk snapshot bar chart */}
        <div className="card mb-5">
          <h3 className="font-bold text-gray-800 mb-4">
            Current Risk Snapshot
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={latestRisks}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="condition"
                tickFormatter={c => CONDITION_LABELS[c] || c}
                tick={{ fontSize: 11 }}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }}
                tickFormatter={v => v + "%"} />
              <Tooltip
                formatter={(v, n) => [v + "%", CONDITION_LABELS[n] || n]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {latestRisks.map((entry, i) => (
                  <Cell key={i} fill={getRiskColor(entry.value / 100)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 text-center mt-2">
            Red = High risk (70%+) · Yellow = Moderate (40-70%) ·
            Green = Low (below 40%)
          </p>
        </div>

        {/* Disease risk trend over time */}
        {chartData.length > 1 && (
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3">
              Disease Risk Trends
            </h3>
            {/* Condition selector */}
            <div className="flex gap-2 flex-wrap mb-4">
              {CONDITIONS.map(c => (
                <button key={c}
                  onClick={() => setActiveCondition(c)}
                  style={activeCondition === c
                    ? { background: COLORS[c], borderColor: COLORS[c], color: "white" }
                    : { color: COLORS[c], borderColor: COLORS[c] }}
                  className="px-3 py-1 rounded-xl text-xs font-semibold
                               border-2 bg-white transition-all">
                  {CONDITION_LABELS[c]}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }}
                  tickFormatter={v => v + "%"} />
                <Tooltip
                  formatter={(v, n) => [v + "%", CONDITION_LABELS[n] || n]}
                />
                <Line
                  type="monotone"
                  dataKey={activeCondition}
                  name={activeCondition}
                  stroke={COLORS[activeCondition]}
                  strokeWidth={3}
                  dot={{ r: 5, fill: COLORS[activeCondition] }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Single assessment message */}
        {chartData.length === 1 && (
          <div className="card text-center py-8 border-dashed border-2 border-gray-200">
            <p className="text-gray-500 text-sm">
              Complete more assessments to see your risk trends over time.
              We recommend retaking every 2-4 weeks.
            </p>
            <button onClick={() => navigate("/assessment")}
              className="btn-primary mx-auto mt-4 text-sm py-2 px-4">
              Take Another Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
