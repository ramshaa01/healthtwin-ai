import { Link, useNavigate } from "react-router-dom"

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav style={{
      background: "#1e40af", color: "white",
      padding: "1rem 2rem", display: "flex",
      justifyContent: "space-between", alignItems: "center"
    }}>
      <Link to="/dashboard" style={{
        color: "white", textDecoration: "none",
        fontWeight: "bold", fontSize: "1.25rem"
      }}>
        🏥 HealthTwin AI
      </Link>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/dashboard"
          style={{ color: "white", textDecoration: "none",
                   fontSize: "0.85rem" }}>
          Dashboard
        </Link>
        <Link to="/simulate"
          style={{ color: "white", textDecoration: "none",
                   fontSize: "0.85rem" }}>
          Simulate
        </Link>
        <Link to="/forecast"
          style={{ color: "white", textDecoration: "none",
                   fontSize: "0.85rem" }}>
          Forecast
        </Link>
        <Link to="/history"
          style={{ color: "white", textDecoration: "none",
                   fontSize: "0.85rem" }}>
          History
        </Link>
        <span style={{ fontSize: "0.9rem", marginLeft: "1rem" }}>
          Welcome, Demo User
        </span>
      </div>
    </nav>
  )
}
