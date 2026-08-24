import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import DigitalTwinBody from "../components/DigitalTwinBody"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"

const CONDITIONS_LABEL = {
  diabetes: "cond_diabetes", hypertension: "cond_hypertension",
  heart: "cond_heart", obesity: "cond_obesity", stress: "cond_stress"
}
const RISK_COLOR = p => p>=70?"#ef4444":p>=40?"#f59e0b":"#10b981"
const RISK_LABEL_KEY = p => p>=70?"risk_high":p>=40?"risk_moderate":"risk_low"

export default function ResultsPage() {
  const [predictions, setPredictions] = useState([])
  const [healthScore, setHealthScore] = useState(null)
  const [hoveredOrgan, setHoveredOrgan] = useState(null)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const { isDemoMode } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const stored = sessionStorage.getItem("healthtwin_result")
    if (!stored) { navigate("/assessment"); return }
    const data = JSON.parse(stored)
    setPredictions(data.predictions || [])
    setHealthScore(data.health_score || null)
    // Trigger entrance animations
    setTimeout(() => setVisible(true), 80)
  }, [navigate])

  if (!predictions.length) return (
    <div className="min-h-screen flex flex-col" style={{background:"#06111f"}}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🏥</p>
          <p style={{color:"rgba(255,255,255,0.5)"}}>Loading your Digital Twin...</p>
        </div>
      </div>
    </div>
  )

  const score = healthScore?.total ?? healthScore ?? 0
  const scoreColor = score>=75?"#10b981":score>=50?"#f59e0b":"#ef4444"
  const leftCards  = predictions.filter(p => ["stress","hypertension","heart"].includes(p.condition))
  const rightCards = predictions.filter(p => ["diabetes","obesity"].includes(p.condition))

  // Find highest-risk condition for SHAP panel
  const topRisk = [...predictions].sort((a,b)=>b.risk_probability-a.risk_probability)[0]
  const shapFeatures = topRisk?.top_shap_features || []

  // Insight string
  const highRisks = predictions.filter(p => p.risk_probability >= 0.7)
  let insightText
  if (highRisks.length === 0) {
    insightText = t("results_insight_low")
  } else {
    const top = [...highRisks].sort((a,b)=>b.risk_probability-a.risk_probability)[0]
    const feat = top.top_shap_features?.[0]?.feature || "lifestyle inputs"
    const condLabel = t(CONDITIONS_LABEL[top.condition]) || top.condition
    insightText = t("results_insight_high")
      .replace("{condition}", condLabel)
      .replace("{feature}", feat)
  }

  // Card renderer
  const RiskCard = ({ p, delay }) => (
    <div style={{
      background:"rgba(6,17,31,0.88)",
      border:"0.5px solid rgba(255,255,255,0.1)",
      borderRadius:"12px", padding:"10px 12px",
      backdropFilter:"blur(8px)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-30px)",
      transition:`opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`
    }}>
      <div style={{fontSize:"10px", color:"rgba(255,255,255,0.4)", marginBottom:"3px"}}>
        {t(CONDITIONS_LABEL[p.condition])}
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
        {t(RISK_LABEL_KEY(p.risk_probability*100))}
      </div>
    </div>
  )

  const downloadReport = async () => {
    try {
      const token = sessionStorage.getItem("healthtwin_token")
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/api/export-pdf`,
        { headers: { Authorization: "Bearer " + token } }
      )
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "healthtwin_report.pdf"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert("PDF export failed. Please run an assessment first.")
    }
  }

  return (
    <div className="min-h-screen pb-16" style={{background:"linear-gradient(160deg,#0d2035 0%,#06111f 100%)"}}>
      <Navbar />

      {/* Header */}
      <div style={{
        background:"linear-gradient(180deg,#0d2035,#06111f)",
        padding:"12px 20px", borderBottom:"0.5px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
          <div style={{
            width:"8px", height:"8px", borderRadius:"50%",
            background:"#4ade80", boxShadow:"0 0 8px #4ade80",
            animation:"blink 2s infinite"
          }}/>
          <span style={{fontSize:"13px", fontWeight:"600", color:"white"}}>
            {t("results_twin_live")}
          </span>
        </div>
        <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
          {!isDemoMode && (
            <button onClick={downloadReport} style={{
              background:"rgba(16,185,129,0.12)", border:"0.5px solid rgba(16,185,129,0.3)",
              color:"#10b981", fontSize:"11px", padding:"4px 12px",
              borderRadius:"999px", cursor:"pointer"
            }}>
              📄 {t("dash_pdf")}
            </button>
          )}
          <button onClick={() => navigate("/twin")} style={{
            background:"rgba(99,179,237,0.12)", border:"0.5px solid rgba(99,179,237,0.3)",
            color:"#63b3ed", fontSize:"11px", padding:"4px 12px",
            borderRadius:"999px", cursor:"pointer"
          }}>
            {t("results_view_twin")}
          </button>
          <button onClick={() => navigate("/dashboard")} style={{
            background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)",
            color:"rgba(255,255,255,0.6)", fontSize:"11px", padding:"4px 12px",
            borderRadius:"999px", cursor:"pointer"
          }}>
            {t("results_dashboard")}
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        textAlign:"center", padding:"10px 0 4px",
        fontSize:"11px", color:"rgba(255,255,255,0.35)",
        letterSpacing:".06em", textTransform:"uppercase"
      }}>
        {t("results_subtitle")}
      </div>

      {/* Main 3-col grid: left cards | body | right cards */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr auto 1fr",
        gap:"8px", padding:"8px 12px", alignItems:"center",
        maxWidth:"700px", margin:"0 auto"
      }}>
        {/* Left cards */}
        <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
          {leftCards.map((p, i) => <RiskCard key={p.condition} p={p} delay={200 + i*100}/>)}
        </div>

        {/* Center: Glowing Body */}
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.88)",
          transition:"opacity 0.6s ease 80ms, transform 0.6s ease 80ms"
        }}>
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
          {rightCards.map((p, i) => (
            <div key={p.condition} style={{
              background:"rgba(6,17,31,0.88)",
              border:"0.5px solid rgba(255,255,255,0.1)",
              borderRadius:"12px", padding:"10px 12px",
              backdropFilter:"blur(8px)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(30px)",
              transition:`opacity 0.5s ease ${300+i*100}ms, transform 0.5s ease ${300+i*100}ms`
            }}>
              <div style={{fontSize:"10px", color:"rgba(255,255,255,0.4)", marginBottom:"3px"}}>
                {t(CONDITIONS_LABEL[p.condition])}
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
                {t(RISK_LABEL_KEY(p.risk_probability*100))}
              </div>
            </div>
          ))}

          {/* Health Score mini card */}
          <div style={{
            background:"rgba(99,179,237,0.06)",
            border:"0.5px solid rgba(99,179,237,0.2)",
            borderRadius:"12px", padding:"10px 12px",
            opacity: visible ? 1 : 0,
            transition:"opacity 0.5s ease 600ms"
          }}>
            <div style={{fontSize:"10px", color:"rgba(255,255,255,0.4)", marginBottom:"3px"}}>
              {t("health_score")}
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
              {score>=75?t("good"):score>=50?t("fair"):t("poor")}
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Panel */}
      {shapFeatures.length > 0 && (
        <div style={{
          maxWidth:"700px", margin:"0 auto", padding:"0 12px 12px",
          opacity: visible ? 1 : 0,
          transition:"opacity 0.6s ease 700ms"
        }}>
          <div style={{
            background:"rgba(6,17,31,0.7)",
            border:"0.5px solid rgba(255,255,255,0.1)",
            borderRadius:"12px", padding:"14px 16px",
            backdropFilter:"blur(8px)"
          }}>
            <div style={{
              fontSize:"10px", color:"rgba(255,255,255,0.4)",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:"10px"
            }}>
              {t("results_top_drivers")} — {t(CONDITIONS_LABEL[topRisk.condition])}
            </div>
            {shapFeatures.slice(0, 3).map((f, i) => {
              const impact = f.importance ?? f.shap_value ?? 0
              const isPositive = impact > 0
              const w = Math.min(Math.abs(impact) * 200, 100)
              return (
                <div key={i} style={{marginBottom:"8px"}}>
                  <div style={{
                    fontSize:"11px", color:"rgba(255,255,255,0.65)",
                    marginBottom:"3px", textTransform:"capitalize"
                  }}>
                    {f.feature.replace(/_/g, " ")}
                  </div>
                  <div style={{
                    height:"6px", borderRadius:"3px",
                    background:"rgba(255,255,255,0.08)", overflow:"hidden"
                  }}>
                    <div style={{
                      height:"100%", borderRadius:"3px",
                      width:`${Math.max(w, 8)}%`,
                      background: isPositive ? "#ef4444" : "#10b981",
                      boxShadow: isPositive ? "0 0 6px #ef444466" : "0 0 6px #10b98166",
                      transition:`width 0.8s ease ${700+i*150}ms`
                    }}/>
                  </div>
                  <div style={{fontSize:"9px", color: isPositive?"#fca5a5":"#6ee7b7", marginTop:"2px"}}>
                    {isPositive?"↑ increases risk":"↓ decreases risk"}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Insight bar */}
      <div style={{maxWidth:"700px", margin:"0 auto", padding:"0 12px 20px",
        opacity: visible ? 1 : 0, transition:"opacity 0.6s ease 900ms"}}>
        <div style={{
          background:"rgba(99,179,237,0.07)",
          border:"0.5px solid rgba(99,179,237,0.2)",
          borderRadius:"10px", padding:"10px 14px",
          fontSize:"12px", color:"rgba(255,255,255,0.65)", lineHeight:"1.5"
        }}>
          <span style={{color:"#63b3ed", fontWeight:"600"}}>{t("results_insight_prefix")}</span>
          {insightText}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  )
}
