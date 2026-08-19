import { useEffect, useRef } from "react"

const ORGAN_INFO = {
  brain:  { label: "Brain", desc: "Stress & mental health risk zone", color: "#a855f7" },
  heart:  { label: "Heart", desc: "Cardiac & blood pressure risk zone", color: "#ef4444" },
  liver:  { label: "Liver", desc: "Metabolic & diabetes risk zone", color: "#f59e0b" },
  lungs:  { label: "Lungs", desc: "Respiratory & hypertension zone", color: "#3b82f6" },
  gut:    { label: "Gut",   desc: "Obesity & metabolic health zone", color: "#10b981" },
}

const CONDITION_ORGAN_MAP = {
  stress:       "brain",
  hypertension: "heart",
  heart:        "heart",
  diabetes:     "liver",
  obesity:      "gut",
}

export default function DigitalTwinBody({
  predictions = [],
  onOrganHover = () => {},
  animated = true,
  size = "md"
}) {
  const tickRef = useRef(0)
  const rafRef  = useRef(null)

  const organRisk = { brain: 0, heart: 0, liver: 0, lungs: 0, gut: 0 }
  predictions.forEach(p => {
    const organ = CONDITION_ORGAN_MAP[p.condition]
    if (organ && p.risk_probability !== undefined) {
      organRisk[organ] = Math.max(organRisk[organ], p.risk_probability * 100)
    }
  })
  const hypPred = predictions.find(p => p.condition === "hypertension")
  if (hypPred) organRisk.lungs = (hypPred.risk_probability || 0) * 60

  const getGlowColor = (organ, risk) => {
    if (risk >= 70) return ORGAN_INFO[organ]?.color || "#ef4444"
    if (risk >= 40) return "#f59e0b"
    return "#10b981"
  }

  const getGlowOpacity = (risk) => {
    return (0.15 + (risk / 100) * 0.7).toFixed(2)
  }

  useEffect(() => {
    if (!animated) return
    const animate = () => {
      tickRef.current += 1
      const tick = tickRef.current

      Object.entries(organRisk).forEach(([organ, risk]) => {
        if (risk < 70) return
        const el = document.getElementById(`dt-org-${organ}`)
        if (!el) return
        const freq = organ === "heart" ? 0.09 : organ === "brain" ? 0.06 : 0.04
        const pulse = 1 + 0.18 * Math.sin(tick * freq)
        if (organ === "heart") {
          el.setAttribute("transform",
            `translate(${74 * (1 - pulse)},${108 * (1 - pulse)}) scale(${pulse.toFixed(3)})`)
        } else {
          const baseRx = organ === "brain" ? 10 : organ === "liver" ? 11 : organ === "gut" ? 12 : 8
          const baseRy = organ === "brain" ? 9  : organ === "liver" ? 9  : organ === "gut" ? 10 : 8
          el.setAttribute("rx", (baseRx * pulse).toFixed(1))
          el.setAttribute("ry", (baseRy * pulse).toFixed(1))
        }
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [predictions, animated])

  const w = size === "sm" ? 140 : size === "lg" ? 220 : 175
  const h = size === "sm" ? 360 : size === "lg" ? 550 : 440

  return (
    <svg
      width={w} height={h}
      viewBox="0 0 170 440"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="gf-twin">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gs-twin">
          <feGaussianBlur stdDeviation="9" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gxs-twin">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="skin-twin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a4a5a"/>
          <stop offset="40%"  stopColor="#0e3040"/>
          <stop offset="100%" stopColor="#071a28"/>
        </linearGradient>
        <linearGradient id="limb-twin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a2535"/>
          <stop offset="50%"  stopColor="#112e42"/>
          <stop offset="100%" stopColor="#0a2535"/>
        </linearGradient>
      </defs>

      {/* HEAD */}
      <ellipse cx="85" cy="38" rx="26" ry="32" fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.8"/>
      <ellipse cx="85" cy="32" rx="18" ry="20" fill="none" stroke="#1e8a7a" strokeWidth="0.4" opacity="0.4"/>
      <ellipse cx="76" cy="33" rx="5" ry="6" fill="#0a2535" stroke="#1e8a7a" strokeWidth="0.5" opacity="0.8"/>
      <ellipse cx="94" cy="33" rx="5" ry="6" fill="#0a2535" stroke="#1e8a7a" strokeWidth="0.5" opacity="0.8"/>
      <ellipse cx="76" cy="33" rx="3" ry="3.5" fill="#0d3d4a" opacity="0.9"/>
      <ellipse cx="94" cy="33" rx="3" ry="3.5" fill="#0d3d4a" opacity="0.9"/>
      <path d="M82 40 Q85 46 88 40" fill="none" stroke="#1e8a7a" strokeWidth="0.6" opacity="0.5"/>
      <path d="M79 50 Q85 54 91 50" fill="none" stroke="#1e8a7a" strokeWidth="0.7" opacity="0.4"/>
      <ellipse cx="59" cy="38" rx="5" ry="8" fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <ellipse cx="111" cy="38" rx="5" ry="8" fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <rect x="79" y="68" width="12" height="16" rx="4" fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>

      {/* TORSO */}
      <path d="M54 86 Q50 104 51 130 Q52 155 55 175 Q58 182 85 184 Q112 182 115 175 Q118 155 119 130 Q120 104 116 86 Q103 78 85 78 Q67 78 54 86Z"
        fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.8"/>
      {[92,102,112,122,132,142,152,162].map((y,i) => (
        <path key={y} d={`M${56+i} ${y} Q85 ${y-5} ${114-i} ${y}`}
          fill="none" stroke="#1e8a7a" strokeWidth="0.35" opacity={0.28-i*0.02}/>
      ))}
      <line x1="85" y1="82" x2="85" y2="175" stroke="#1e8a7a" strokeWidth="0.5" opacity="0.25"/>
      <path d="M63 82 Q75 79 85 80 Q95 79 107 82" fill="none" stroke="#1e8a7a" strokeWidth="0.7" opacity="0.5"/>
      <ellipse cx="47" cy="90" rx="10" ry="8" fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>
      <ellipse cx="123" cy="90" rx="10" ry="8" fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>

      {/* LEFT ARM */}
      <path d="M38 96 Q32 108 30 130 Q29 148 32 165 Q34 170 39 170 Q44 170 46 165 Q49 148 48 130 Q46 108 40 96Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>
      <ellipse cx="39" cy="168" rx="7" ry="6" fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.5"/>
      <path d="M33 172 Q29 190 30 210 Q31 222 34 226 Q37 229 40 228 Q43 229 46 226 Q49 222 49 210 Q50 190 46 172Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <ellipse cx="40" cy="234" rx="8" ry="10" fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      {[34,37,40,43,46].map((x,i) => (
        <line key={x} x1={x} y1="232" x2={x-(i<2?2:i===2?0:-2)} y2="244"
          stroke="#1e8a7a" strokeWidth="0.5" opacity="0.6"/>
      ))}

      {/* RIGHT ARM */}
      <path d="M132 96 Q138 108 140 130 Q141 148 138 165 Q136 170 131 170 Q126 170 124 165 Q121 148 122 130 Q124 108 130 96Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>
      <ellipse cx="131" cy="168" rx="7" ry="6" fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.5"/>
      <path d="M137 172 Q141 190 140 210 Q139 222 136 226 Q133 229 130 228 Q127 229 124 226 Q121 222 121 210 Q120 190 124 172Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <ellipse cx="130" cy="234" rx="8" ry="10" fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      {[136,133,130,127,124].map((x,i) => (
        <line key={x} x1={x} y1="232" x2={x+(i<2?2:i===2?0:-2)} y2="244"
          stroke="#1e8a7a" strokeWidth="0.5" opacity="0.6"/>
      ))}

      {/* ABDOMEN */}
      <path d="M57 176 Q55 195 57 215 Q59 228 85 230 Q111 228 113 215 Q115 195 113 176 Q100 172 85 172 Q70 172 57 176Z"
        fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>
      <path d="M60 242 Q56 260 55 290 Q54 315 56 338 Q57 346 66 348 Q75 350 78 342 Q82 330 82 305 Q83 280 82 258 Q80 244 72 240Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>
      <ellipse cx="67" cy="348" rx="10" ry="8" fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <path d="M58 354 Q55 372 56 394 Q57 408 60 414 Q63 418 67 418 Q71 418 74 414 Q77 408 78 394 Q79 372 76 354Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <path d="M56 416 Q52 420 50 426 Q50 430 67 430 Q76 430 80 426 Q80 420 78 416Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <path d="M110 242 Q114 260 115 290 Q116 315 114 338 Q113 346 104 348 Q95 350 92 342 Q88 330 88 305 Q87 280 88 258 Q90 244 98 240Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>
      <ellipse cx="103" cy="348" rx="10" ry="8" fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <path d="M94 354 Q91 372 92 394 Q93 408 96 414 Q99 418 103 418 Q107 418 110 414 Q113 408 114 394 Q115 372 112 354Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>
      <path d="M94 416 Q90 420 90 426 Q90 430 103 430 Q118 430 120 426 Q120 420 114 416Z"
        fill="url(#limb-twin)" stroke="#1e8a7a" strokeWidth="0.6"/>

      {/* HIP */}
      <path d="M58 222 Q68 218 85 220 Q102 218 112 222 Q114 232 112 238 Q100 244 85 244 Q70 244 58 238 Q56 232 58 222Z"
        fill="url(#skin-twin)" stroke="#1e8a7a" strokeWidth="0.7"/>

      {/* ORGAN GLOW ZONES */}
      {Object.entries(organRisk).map(([organ, risk]) => {
        const color = getGlowColor(organ, risk)
        const op    = getGlowOpacity(risk)
        const pos   = {
          brain: [85, 34, 24, 28],
          heart: [75, 108, 22, 22],
          liver: [100, 114, 18, 15],
          lungs: null,
          gut:   [85, 200, 24, 22],
        }[organ]
        if (!pos && organ !== "lungs") return null
        if (organ === "lungs") return (
          <g key="lungs">
            <ellipse cx="67" cy="104" rx="14" ry="20" id="dt-zone-lungs-l" fill={color} opacity={op} filter="url(#gxs-twin)" style={{transition:"opacity 0.5s"}}/>
            <ellipse cx="103" cy="104" rx="14" ry="20" id="dt-zone-lungs-r" fill={color} opacity={op} filter="url(#gxs-twin)" style={{transition:"opacity 0.5s"}}/>
          </g>
        )
        return (
          <ellipse key={organ}
            id={`dt-zone-${organ}`}
            cx={pos[0]} cy={pos[1]} rx={pos[2]} ry={pos[3]}
            fill={color} opacity={op}
            filter="url(#gf-twin)"
            style={{transition:"opacity 0.5s"}}/>
        )
      })}

      {/* ORGANS */}
      {/* Brain */}
      <ellipse id="dt-org-brain" cx="85" cy="34" rx="10" ry="9"
        fill={getGlowColor("brain", organRisk.brain)}
        filter="url(#gs-twin)" style={{transition:"all 0.4s"}}/>
      <path d="M79 34 Q82 28 85 31 Q88 28 91 34 Q91 40 85 40 Q79 40 79 34Z"
        fill="#c084fc" opacity="0.85" pointerEvents="none"/>

      {/* Heart */}
      <path id="dt-org-heart"
        d="M74 103 Q70 99 68 102 Q65 105 68 110 Q70 114 74 118 Q78 114 80 110 Q83 105 80 102 Q78 99 74 103Z"
        fill={getGlowColor("heart", organRisk.heart)}
        filter="url(#gs-twin)" style={{transition:"all 0.4s"}}/>

      {/* Lungs */}
      <ellipse id="dt-org-lungs-l" cx="67" cy="104" rx="8" ry="14"
        fill="#3b82f6" opacity={0.5 + organRisk.lungs/200}
        filter="url(#gxs-twin)" style={{transition:"all 0.4s"}}/>
      <ellipse id="dt-org-lungs-r" cx="103" cy="104" rx="8" ry="14"
        fill="#3b82f6" opacity={0.5 + organRisk.lungs/200}
        filter="url(#gxs-twin)" style={{transition:"all 0.4s"}}/>

      {/* Liver */}
      <ellipse id="dt-org-liver" cx="100" cy="114" rx="11" ry="9"
        fill={getGlowColor("liver", organRisk.liver)}
        filter="url(#gxs-twin)" style={{transition:"all 0.4s"}}/>

      {/* Kidneys */}
      <ellipse cx="72" cy="160" rx="6" ry="9" fill="#7c3aed" opacity="0.6" filter="url(#gxs-twin)"/>
      <ellipse cx="98" cy="160" rx="6" ry="9" fill="#7c3aed" opacity="0.6" filter="url(#gxs-twin)"/>

      {/* Gut */}
      <path id="dt-org-gut"
        d="M72 186 Q65 192 66 202 Q67 212 74 216 Q82 220 90 218 Q98 220 104 216 Q110 212 110 202 Q110 192 104 186 Q96 182 85 182 Q76 182 72 186Z"
        fill={getGlowColor("gut", organRisk.gut)}
        opacity="0.9" filter="url(#gxs-twin)" style={{transition:"all 0.4s"}}/>

      {/* Labels */}
      <text x="85" y="37" textAnchor="middle" fontSize="6" fill="white" fontWeight="700" opacity="0.95">BRAIN</text>
      <text x="74" y="111" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="700" opacity="0.95">HEART</text>
      <text x="100" y="117" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="700" opacity="0.9">LIVER</text>
      <text x="85" y="202" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="700" opacity="0.9">GUT</text>
    </svg>
  )
}
