export default function RiskCard({ condition, risk_probability,
                                    risk_level, top_shap_features }) {
  const config = {
     High:     { bg: 'bg-red-50 dark:bg-red-950',
                 border: 'border-red-200 dark:border-red-800',
                 badge: 'badge-high', bar: 'bg-red-500', icon: '🔴' },
     Moderate: { bg: 'bg-amber-50 dark:bg-amber-950',
                 border: 'border-amber-200 dark:border-amber-800',
                 badge: 'badge-moderate', bar: 'bg-amber-500', icon: '🟡' },
     Low:      { bg: 'bg-emerald-50 dark:bg-emerald-950',
                 border: 'border-emerald-200 dark:border-emerald-800',
                 badge: 'badge-low', bar: 'bg-emerald-500', icon: '🟢' },
  }
  const c = config[risk_level] || config.Low
  const pct = Math.round(risk_probability * 100)

  const labels = {
    diabetes:     "Type 2 Diabetes",
    hypertension: "Hypertension",
    heart:        "Heart Disease",
    obesity:      "Obesity",
    stress:       "Stress",
  }

  return (
    <div className={`rounded-2xl border-2 ${c.bg} ${c.border} p-5
                     flex-1 min-w-[180px] transition-all duration-200
                     hover:shadow-md animate-slide-up
                     dark:border-opacity-50`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">
          {labels[condition] || condition}
        </h3>
        <span className={c.badge}>{risk_level}</span>
      </div>

      {/* Risk percentage with progress bar */}
      <div className="mb-4">
        <div className="flex items-end gap-1 mb-1.5">
          <span className="text-3xl font-bold text-gray-900">{pct}</span>
          <span className="text-gray-500 text-sm mb-1">%</span>
          <span className="ml-auto text-xl">{c.icon}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`${c.bar} h-2 rounded-full transition-all duration-700`}
               style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Top SHAP features */}
      <div className="space-y-1.5">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          Key Factors
        </p>
        {top_shap_features?.slice(0, 3).map((f, i) => (
          <div key={i}
               className="flex justify-between items-center text-xs">
            <span className="text-gray-600 truncate mr-2">{f.feature}</span>
            <span className={`font-semibold shrink-0
              ${f.shap_value > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {f.shap_value > 0 ? '▲' : '▼'}{' '}
              {Math.abs(f.shap_value).toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
