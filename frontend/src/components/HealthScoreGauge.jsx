import { useEffect, useRef, useState } from "react"

export default function HealthScoreGauge({ score, breakdown }) {
  const total = score?.total ?? score ?? 0
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef(null)

  // Animated count-up
  useEffect(() => {
    if (!total) return
    let start = 0
    const duration = 1200
    const startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayed(Math.round(eased * total))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [total])

  const getColor = (val) =>
    val >= 75 ? "#10b981" : val >= 50 ? "#f59e0b" : "#ef4444"

  const getLabel = (val) =>
    val >= 75 ? "Good" : val >= 50 ? "Fair" : "Poor"

  const getBg = (val) =>
    val >= 75 ? "bg-emerald-500" : val >= 50 ? "bg-amber-500" : "bg-red-500"

  // SVG circle progress
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  const color = getColor(total)

  const pillars = breakdown ? [
    { label: "Physical",  value: breakdown.physical,  max: 25, icon: "💪" },
    { label: "Mental",    value: breakdown.mental,    max: 25, icon: "🧠" },
    { label: "Nutrition", value: breakdown.nutrition, max: 25, icon: "🥗" },
    { label: "Sleep",     value: breakdown.sleep,     max: 25, icon: "😴" },
  ] : []

  return (
    <div className="card dark:bg-gray-900 dark:border-gray-800 animate-slide-up">
      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* Animated SVG circle */}
        <div className="shrink-0 text-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle cx="70" cy="70" r={radius}
              fill="none" stroke="#e5e7eb" strokeWidth="10"
              className="dark:stroke-gray-700"/>
            {/* Progress arc */}
            <circle cx="70" cy="70" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{
                transition:"stroke-dashoffset 0.05s linear, stroke 0.4s ease",
                filter:`drop-shadow(0 0 8px ${color}66)`
              }}
            />
            {/* Score number */}
            <text x="70" y="65" textAnchor="middle"
              fontSize="28" fontWeight="700" fill={color}>
              {displayed}
            </text>
            <text x="70" y="83" textAnchor="middle"
              fontSize="12" fill="#9ca3af">
              out of 100
            </text>
          </svg>
          <div style={{color}} className="text-sm font-bold mt-1">
            {getLabel(total)} Health
          </div>
        </div>

        {/* Pillar bars */}
        {pillars.length > 0 && (
          <div className="flex-1 w-full">
            <h3 className="text-sm font-semibold text-gray-400
                           dark:text-gray-500 uppercase tracking-wide mb-4">
              Score Breakdown
            </h3>
            <div className="space-y-3">
              {pillars.map((p, i) => {
                const pct = Math.round((p.value / p.max) * 100)
                return (
                  <div key={p.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700
                                       dark:text-gray-300 flex items-center gap-1.5">
                        <span>{p.icon}</span>{p.label}
                      </span>
                      <span className="text-sm font-bold"
                        style={{color:getColor(pct)}}>
                        {p.value?.toFixed(1)} / {p.max}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800
                                    rounded-full h-2 overflow-hidden">
                      <div
                        className={`${getBg(pct)} h-2 rounded-full`}
                        style={{
                          width: "0%",
                          transition: `width 1s ease ${i * 0.15}s`,
                          animation: `fillBar${i} 1s ease ${i*0.15}s forwards`
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        ${pillars.map((p, i) => {
          const pct = Math.round((p.value / p.max) * 100)
          return `
            @keyframes fillBar${i} {
              from { width: 0% }
              to { width: ${pct}% }
            }
          `
        }).join("")}
      `}</style>
    </div>
  )
}
