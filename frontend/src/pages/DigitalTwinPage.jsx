import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import DigitalTwinBody from "../components/DigitalTwinBody"

const CONDITIONS_LABEL = {
  diabetes:"Type 2 Diabetes", hypertension:"Hypertension",
  heart:"Heart Disease", obesity:"Obesity", stress:"Stress"
}
const RISK_COLOR = p => p>=70?"#ef4444":p>=40?"#f59e0b":"#10b981"
const RISK_LABEL = p => p>=70?"High":p>=40?"Moderate":"Low"

export default function DigitalTwinPage() {
  const [predictions, setPredictions]   = useState([])
  const [healthScore, setHealthScore]   = useState(null)
  const [hoveredOrgan, setHoveredOrgan] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem("healthtwin_result")
    if (!stored) { navigate("/assessment"); return }
    const data = JSON.parse(stored)
    setPredictions(data.predictions || [])
    setHealthScore(data.health_score || null)
  }, [navigate])

  if (!predictions.length) return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🏥</p>
          <p className="text-gray-500">Loading your Digital Twin...</p>
        </div>
      </div>
    </div>
  )

  const score = healthScore?.total ?? healthScore ?? 0
  const scoreColor = score>=75?"#10b981":score>=50?"#f59e0b":"#ef4444"
  const leftCards  = predictions.filter(p =>
    ["stress","hypertension","heart"].includes(p.condition))
  const rightCards = predictions.filter(p =>
    ["diabetes","obesity"].includes(p.condition))

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{background:"#06111f"}}>
      <Navbar />

      {/* Dark themed header */}
      <div style={{
        background:"linear-gradient(180deg,#0d2035,#06111f)",
        padding:"12px 20px", borderBottom:"0.5px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", justifyContent:"space-between"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
          <div style={{
            width:"8px", height:"8px", borderRadius:"50%",
            background:"#4ade80", boxShadow:"0 0 8px #4ade80",
            animation:"blink 2s infinite"
          }}/>
          <span style={{fontSize:"13px", fontWeight:"600", color:"white"}}>
            Digital Twin — Live
          </span>
        </div>
        <div style={{display:"flex", gap:"8px"}}>
          <button onClick={() => navigate("/simulate")}
            style={{
              background:"rgba(99,179,237,0.12)", border:"0.5px solid rgba(99,179,237,0.3)",
              color:"#63b3ed", fontSize:"11px", padding:"4px 12px",
              borderRadius:"999px", cursor:"pointer"
            }}>
            🔮 Simulate
          </button>
          <button onClick={() => navigate("/dashboard")}
            style={{
              background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)",
              color:"rgba(255,255,255,0.6)", fontSize:"11px", padding:"4px 12px",
              borderRadius:"999px", cursor:"pointer"
            }}>
            Dashboard
          </button>
        </div>
      </div>

      <div style={{
        textAlign:"center", padding:"10px 0 2px",
        fontSize:"11px", color:"rgba(255,255,255,0.35)",
        letterSpacing:".06em", textTransform:"uppercase"
      }}>
        Risk map — your body systems
      </div>

      {/* Main body layout */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr auto 1fr",
        gap:"8px", padding:"8px 12px", alignItems:"center",
        maxWidth:"700px", margin:"0 auto"
      }}>

        {/* Left cards */}
        <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
          {leftCards.map(p => (
            <div key={p.condition} style={{
              background:"rgba(6,17,31,0.88)",
              border:"0.5px solid rgba(255,255,255,0.1)",
              borderRadius:"12px", padding:"10px 12px",
              backdropFilter:"blur(8px)"
            }}>
              <div style={{
                fontSize:"10px", color:"rgba(255,255,255,0.4)",
                display:"flex", justifyContent:"space-between", marginBottom:"3px"
              }}>
                {CONDITIONS_LABEL[p.condition]} <span>→</span>
              </div>
              <div style={{fontSize:"22px", fontWeight:"600", color:"white", lineHeight:1}}>
                {Math.round(p.risk_probability*100)}
                <span style={{fontSize:"11px", color:"rgba(255,255,255,0.4)"}}>%</span>
              </div>
              <div style={{
                display:"inline-block", fontSize:"9px", fontWeight:"700",
                padding:"2px 7px", borderRadius:"999px", marginTop:"4px",
                background: p.risk_probability>=0.7?"rgba(239,68,68,0.15)":
                            p.risk_probability>=0.4?"rgba(251,191,36,0.15)":"rgba(74,222,128,0.12)",
                color: RISK_COLOR(p.risk_probability*100),
                border:`0.5px solid ${RISK_COLOR(p.risk_probability*100)}55`
              }}>
                {RISK_LABEL(p.risk_probability*100)}
              </div>
            </div>
          ))}
        </div>

        {/* Center: Glowing Human Body */}
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"8px"}}>
          <DigitalTwinBody
            predictions={predictions}
            onOrganHover={setHoveredOrgan}
            animated={true}
            size="md"
          />
          {hoveredOrgan && (
            <div style={{
              fontSize:"11px", color:"rgba(255,255,255,0.6)",
              textAlign:"center", background:"rgba(255,255,255,0.05)",
              padding:"4px 10px", borderRadius:"6px"
            }}>
              {hoveredOrgan}
            </div>
          )}
        </div>

        {/* Right cards */}
        <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
          {rightCards.map(p => (
            <div key={p.condition} style={{
              background:"rgba(6,17,31,0.88)",
              border:"0.5px solid rgba(255,255,255,0.1)",
              borderRadius:"12px", padding:"10px 12px",
              backdropFilter:"blur(8px)"
            }}>
              <div style={{
                fontSize:"10px", color:"rgba(255,255,255,0.4)",
                display:"flex", justifyContent:"space-between", marginBottom:"3px"
              }}>
                {CONDITIONS_LABEL[p.condition]} <span>→</span>
              </div>
              <div style={{fontSize:"22px", fontWeight:"600", color:"white", lineHeight:1}}>
                {Math.round(p.risk_probability*100)}
                <span style={{fontSize:"11px", color:"rgba(255,255,255,0.4)"}}>%</span>
              </div>
              <div style={{
                display:"inline-block", fontSize:"9px", fontWeight:"700",
                padding:"2px 7px", borderRadius:"999px", marginTop:"4px",
                background: p.risk_probability>=0.7?"rgba(239,68,68,0.15)":
                            p.risk_probability>=0.4?"rgba(251,191,36,0.15)":"rgba(74,222,128,0.12)",
                color: RISK_COLOR(p.risk_probability*100),
                border:`0.5px solid ${RISK_COLOR(p.risk_probability*100)}55`
              }}>
                {RISK_LABEL(p.risk_probability*100)}
              </div>
            </div>
          ))}

          {/* Health Score mini card */}
          <div style={{
            background:"rgba(99,179,237,0.06)",
            border:"0.5px solid rgba(99,179,237,0.2)",
            borderRadius:"12px", padding:"10px 12px"
          }}>
            <div style={{fontSize:"10px", color:"rgba(255,255,255,0.4)", marginBottom:"3px"}}>
              Health Score
            </div>
            <div style={{fontSize:"22px", fontWeight:"600", color:scoreColor, lineHeight:1}}>
              {score}<span style={{fontSize:"11px", color:"rgba(255,255,255,0.4)"}}>/100</span>
            </div>
            <div style={{
              display:"inline-block", fontSize:"9px", fontWeight:"700",
              padding:"2px 7px", borderRadius:"999px", marginTop:"4px",
              background:"rgba(99,179,237,0.12)", color:"#63b3ed",
              border:"0.5px solid rgba(99,179,237,0.3)"
            }}>
              {score>=75?"Good":score>=50?"Fair":"Poor"}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom insight bar */}
      <div style={{maxWidth:"700px", margin:"0 auto", padding:"0 12px 12px"}}>
        <div style={{
          background:"rgba(99,179,237,0.07)",
          border:"0.5px solid rgba(99,179,237,0.2)",
          borderRadius:"10px", padding:"10px 14px",
          fontSize:"12px", color:"rgba(255,255,255,0.65)", lineHeight:"1.5"
        }}>
          <span style={{color:"#63b3ed", fontWeight:"600"}}>Twin insight: </span>
          {(() => {
            const high = predictions.filter(p => p.risk_probability >= 0.7)
            if (high.length === 0) return "All risk levels manageable. Your twin is in good shape — keep up your current lifestyle."
            const top = [...high].sort((a,b) => b.risk_probability - a.risk_probability)[0]
            const topFeat = top.top_shap_features?.[0]?.feature || "lifestyle inputs"
            return `High ${CONDITIONS_LABEL[top.condition]} risk detected. Key driver: "${topFeat}". Use the Simulate tab to see how lifestyle changes can reduce this.`
          })()}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  )
}
