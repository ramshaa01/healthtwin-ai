export default function HealthScoreGauge({ score, breakdown }) {
  const total = score?.total ?? score ?? 0
  const getColor = (val) =>
    val >= 75 ? 'text-emerald-500' :
    val >= 50 ? 'text-amber-500' : 'text-red-500'
  const getBg = (val) =>
    val >= 75 ? 'bg-emerald-500' :
    val >= 50 ? 'bg-amber-500' : 'bg-red-500'
  const getLabel = (val) =>
    val >= 75 ? 'Good' : val >= 50 ? 'Fair' : 'Poor'

  const pillars = breakdown ? [
    { label: "Physical",  value: breakdown.physical,  max: 25, icon: "💪" },
    { label: "Mental",    value: breakdown.mental,    max: 25, icon: "🧠" },
    { label: "Nutrition", value: breakdown.nutrition, max: 25, icon: "🥗" },
    { label: "Sleep",     value: breakdown.sleep,     max: 25, icon: "😴" },
  ] : []

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Score circle */}
        <div className="text-center shrink-0">
          <div className="relative inline-flex items-center justify-center
                          w-36 h-36 rounded-full bg-gray-50 border-8
                          border-gray-100">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getColor(total)}`}>
                {total}
              </div>
              <div className="text-gray-400 text-xs">out of 100</div>
            </div>
          </div>
          <div className={`mt-2 text-sm font-semibold ${getColor(total)}`}>
            {getLabel(total)} Health
          </div>
          <p className="text-gray-400 text-xs mt-0.5">Overall Score</p>
        </div>

        {/* Pillars */}
        {pillars.length > 0 && (
          <div className="flex-1 w-full">
            <h3 className="text-sm font-semibold text-gray-500
                           uppercase tracking-wide mb-4">
              Score Breakdown
            </h3>
            <div className="space-y-3">
              {pillars.map(p => {
                const pct = Math.round((p.value / p.max) * 100)
                return (
                  <div key={p.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <span>{p.icon}</span>{p.label}
                      </span>
                      <span className={`text-sm font-bold ${getColor(pct)}`}>
                        {p.value?.toFixed(1)} / {p.max}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${getBg(pct)} h-2 rounded-full
                                       transition-all duration-700`}
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
