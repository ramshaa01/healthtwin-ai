export default function HealthScoreGauge({ score, breakdown }) {
  const getColor = (val) => {
    if (val >= 75) return "#16a34a"
    if (val >= 50) return "#d97706"
    return "#dc2626"
  }

  const pillars = breakdown ? [
    { label: "Physical",  value: breakdown.physical,  max: 25 },
    { label: "Mental",    value: breakdown.mental,    max: 25 },
    { label: "Nutrition", value: breakdown.nutrition, max: 25 },
    { label: "Sleep",     value: breakdown.sleep,     max: 25 },
  ] : []

  return (
    <div style={{
      background: "white", borderRadius: "16px",
      padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      textAlign: "center"
    }}>
      <h2 style={{ marginBottom: "0.5rem", color: "#1e40af" }}>
        Health Score
      </h2>
      <div style={{
        fontSize: "5rem", fontWeight: "bold",
        color: getColor(score?.total || score || 0)
      }}>
        {score?.total || score || 0}
      </div>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        out of 100
      </p>
      {pillars.length > 0 && (
        <div style={{ display: "flex", gap: "1rem",
                      justifyContent: "center", flexWrap: "wrap" }}>
          {pillars.map(p => (
            <div key={p.label} style={{ textAlign: "center",
                                        minWidth: "70px" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "#f1f5f9", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 0.25rem",
                border: `3px solid ${getColor(p.value / p.max * 100)}`
              }}>
                <span style={{ fontWeight: "bold", fontSize: "0.9rem",
                               color: getColor(p.value / p.max * 100) }}>
                  {p.value?.toFixed(0)}
                </span>
              </div>
              <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                {p.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
