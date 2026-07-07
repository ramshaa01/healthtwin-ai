export default function RiskCard({ condition, risk_probability,
                                    risk_level, top_shap_features }) {
  const colors = {
    High:     { bg: "#fef2f2", border: "#fca5a5", badge: "#dc2626" },
    Moderate: { bg: "#fffbeb", border: "#fcd34d", badge: "#d97706" },
    Low:      { bg: "#f0fdf4", border: "#86efac", badge: "#16a34a" }
  }
  const c = colors[risk_level] || colors.Low

  const labels = {
    diabetes:     "Type 2 Diabetes",
    hypertension: "Hypertension",
    heart:        "Heart Disease",
    obesity:      "Obesity",
    stress:       "Stress"
  }

  return (
    <div style={{
      background: c.bg, border: `2px solid ${c.border}`,
      borderRadius: "12px", padding: "1.25rem",
      minWidth: "200px", flex: "1"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "0.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600" }}>
          {labels[condition] || condition}
        </h3>
        <span style={{
          background: c.badge, color: "white",
          padding: "0.2rem 0.6rem", borderRadius: "999px",
          fontSize: "0.75rem", fontWeight: "bold"
        }}>
          {risk_level}
        </span>
      </div>
      <p style={{ fontSize: "2rem", fontWeight: "bold",
                  color: c.badge, marginBottom: "0.75rem" }}>
        {(risk_probability * 100).toFixed(1)}%
      </p>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#6b7280",
                    marginBottom: "0.25rem" }}>
          Top risk factors:
        </p>
        {top_shap_features?.slice(0, 3).map((f, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between",
            fontSize: "0.8rem", padding: "0.15rem 0"
          }}>
            <span>{f.feature}</span>
            <span style={{ color: f.shap_value > 0 ? "#dc2626" : "#16a34a",
                           fontWeight: "600" }}>
              {f.shap_value > 0 ? "▲" : "▼"} {Math.abs(f.shap_value).toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
