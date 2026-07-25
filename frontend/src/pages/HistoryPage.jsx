import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { healthAPI } from "../api/client"

const CONDITION_LABELS = {
  diabetes: "Diabetes", hypertension: "Hypertension",
  heart: "Heart", obesity: "Obesity", stress: "Stress"
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    healthAPI.history()
      .then(res => setHistory(res.data.history || []))
      .catch(console.error)
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
    sessionStorage.setItem("healthtwin_result", JSON.stringify({
      bmi: record.bmi,
      predictions: record.predictions,
      health_score: record.health_score
    }))
    if (record.input)
      sessionStorage.setItem("healthtwin_input", JSON.stringify(record.input))
    navigate("/dashboard")
  }

  const getScoreColor = (score) => {
    const s = score?.total ?? score ?? 0
    return s >= 75 ? "text-emerald-600" :
           s >= 50 ? "text-amber-600" : "text-red-600"
  }

  const getRiskBadge = (level) =>
    level === "High" ? "badge-high" :
    level === "Moderate" ? "badge-moderate" : "badge-low"

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Assessment History
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Your past health assessments, most recent first
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i}
                className="card animate-pulse h-32 bg-gray-100" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              No assessments yet
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Complete your first health assessment to see history here.
            </p>
            <button onClick={() => navigate("/assessment")}
              className="btn-primary mx-auto">
              Start Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record, idx) => {
              const score = record.health_score?.total ??
                            record.health_score ?? "—"
              return (
                <div key={idx}
                  className="card-hover animate-fade-in cursor-pointer"
                  onClick={() => loadResult(record)}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">
                          Assessment #{history.length - idx}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatDate(record.timestamp)}
                        </span>
                      </div>

                      {/* Risk badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(record.predictions || []).map(p => (
                          <span key={p.condition}
                            className={`${getRiskBadge(p.risk_level)}
                              text-xs px-2 py-0.5`}>
                            {CONDITION_LABELS[p.condition]}:
                            {(p.risk_probability * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>

                      {/* Input summary */}
                      {record.input && (
                        <div className="flex flex-wrap gap-3 mt-3
                                        text-xs text-gray-400">
                          <span>BMI: <b className="text-gray-600">
                            {record.bmi?.toFixed(1)}</b></span>
                          <span>Sleep: <b className="text-gray-600">
                            {record.input.sleep_hours}h</b></span>
                          <span>Activity: <b className="text-gray-600">
                            {record.input.physical_activity}x/wk</b></span>
                          <span>Stress: <b className="text-gray-600">
                            {record.input.stress_level}/10</b></span>
                        </div>
                      )}
                    </div>

                    <div className="text-center shrink-0">
                      <div className={`text-2xl font-bold ${getScoreColor(record.health_score)}`}>
                        {score}
                      </div>
                      <div className="text-gray-400 text-xs">/ 100</div>
                      <div className="text-primary-600 text-xs mt-1
                                      font-medium">
                        View →
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
