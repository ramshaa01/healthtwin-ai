import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { healthAPI } from "../api/client"

export default function AshaMode() {
  const [form, setForm] = useState({
    age: "",
    weight_kg: "",
    bp: "", // string like "120/80"
    family_history_diabetes: 0,
    sleep_hours: "",
    physical_activity: "" // "none" (0), "light" (1), "regular" (3)
  })
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleToggle = (key, val) => setForm(f => ({ ...f, [key]: val }))
  
  const handleSubmit = async () => {
    // Validate
    if (!form.age || !form.weight_kg || !form.bp || !form.sleep_hours || form.physical_activity === "") {
      setError("कृपया सभी फ़ील्ड भरें")
      return
    }
    
    // Parse BP
    const bpParts = form.bp.split("/")
    const sys = parseInt(bpParts[0]) || 120
    
    // Map to prediction API
    const payload = {
      age: parseInt(form.age),
      sex: 0, // safe default female
      height_cm: 155, // average height
      weight_kg: parseFloat(form.weight_kg),
      systolic_bp: sys,
      cholesterol: 180, // safe default
      high_cholesterol: 0,
      physical_activity: parseFloat(form.physical_activity),
      sleep_hours: parseFloat(form.sleep_hours),
      dietary_quality: 5, // average
      stress_level: 5, // average
      smoking: 0,
      alcohol: 0,
      family_history_diabetes: form.family_history_diabetes,
      family_history_heart: 0
    }
    
    setLoading(true)
    setError("")
    
    try {
      const res = await healthAPI.predict(payload)
      setResult(res.data.predictions)
    } catch (e) {
      setError("कृपया इंटरनेट कनेक्शन जांचें")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      age: "", weight_kg: "", bp: "", 
      family_history_diabetes: 0, sleep_hours: "", physical_activity: ""
    })
    setResult(null)
    setError("")
  }

  // Result screen
  if (result) {
    let highestRiskLevel = "Low"
    let triggerConditions = []
    
    result.forEach(p => {
      const pPercent = p.risk_probability * 100
      let lvl = "Low"
      if (pPercent >= 70) lvl = "High"
      else if (pPercent >= 40) lvl = "Moderate"
      
      if (lvl === "High") {
        highestRiskLevel = "High"
        triggerConditions.push(p.condition)
      } else if (lvl === "Moderate" && highestRiskLevel !== "High") {
        highestRiskLevel = "Moderate"
        triggerConditions.push(p.condition)
      }
    })
    
    const conditionNames = {
      diabetes: "मधुमेह का खतरा",
      hypertension: "उच्च रक्तचाप का खतरा",
      heart: "हृदय रोग का खतरा",
      obesity: "मोटापे का खतरा",
      stress: "तनाव का खतरा"
    }
    
    return (
      <div style={{minHeight:"100vh", background:"#fff", padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
        <div style={{textAlign:"center", width:"100%", maxWidth:"400px"}}>
          {highestRiskLevel === "High" && (
            <>
              <div style={{fontSize:"100px", lineHeight:1}}>🔴</div>
              <h1 style={{fontSize:"28px", color:"#dc2626", margin:"10px 0", fontWeight:"bold"}}>डॉक्टर के पास जाएं</h1>
            </>
          )}
          {highestRiskLevel === "Moderate" && (
            <>
              <div style={{fontSize:"100px", lineHeight:1}}>🟡</div>
              <h1 style={{fontSize:"28px", color:"#d97706", margin:"10px 0", fontWeight:"bold"}}>ध्यान रखें</h1>
            </>
          )}
          {highestRiskLevel === "Low" && (
            <>
              <div style={{fontSize:"100px", lineHeight:1}}>🟢</div>
              <h1 style={{fontSize:"28px", color:"#16a34a", margin:"10px 0", fontWeight:"bold"}}>ठीक है</h1>
            </>
          )}
          
          <div style={{fontSize:"18px", color:"#4b5563", marginTop:"20px", marginBottom:"40px"}}>
            {highestRiskLevel !== "Low" && triggerConditions.map(c => conditionNames[c]).join(", ")}
          </div>
          
          <button onClick={resetForm} style={{
            width:"100%", padding:"18px", fontSize:"20px", fontWeight:"bold",
            background:"#2563eb", color:"white", borderRadius:"12px", border:"none"
          }}>
            नया मूल्यांकन
          </button>
          
          <button onClick={() => navigate("/login")} style={{
            width:"100%", padding:"14px", fontSize:"16px", marginTop:"12px",
            background:"transparent", color:"#6b7280", border:"none"
          }}>
            मुख्य मेनू में जाएं
          </button>
        </div>
      </div>
    )
  }

  // Form screen
  return (
    <div style={{minHeight:"100vh", background:"#f9fafb", padding:"16px", color:"#111827"}}>
      <div style={{maxWidth:"400px", margin:"0 auto"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px"}}>
          <h1 style={{fontSize:"22px", fontWeight:"bold", margin:0}}>ASHA स्क्रीनिंग</h1>
          <button onClick={() => navigate("/login")} style={{
            padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:"8px",
            background:"white", color:"#4b5563"
          }}>रद्द करें</button>
        </div>
        
        {error && (
          <div style={{background:"#fef2f2", color:"#dc2626", padding:"12px", borderRadius:"8px", marginBottom:"16px", fontSize:"16px"}}>
            {error}
          </div>
        )}

        <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
          <div>
            <label style={{display:"block", fontSize:"20px", fontWeight:"600", marginBottom:"8px"}}>उम्र</label>
            <input type="number" value={form.age} onChange={e => handleToggle("age", e.target.value)}
              placeholder="उदा. 45"
              style={{width:"100%", padding:"16px", fontSize:"22px", borderRadius:"10px", border:"2px solid #d1d5db"}}/>
          </div>
          
          <div>
            <label style={{display:"block", fontSize:"20px", fontWeight:"600", marginBottom:"8px"}}>वज़न (kg)</label>
            <input type="number" value={form.weight_kg} onChange={e => handleToggle("weight_kg", e.target.value)}
              placeholder="उदा. 65"
              style={{width:"100%", padding:"16px", fontSize:"22px", borderRadius:"10px", border:"2px solid #d1d5db"}}/>
          </div>
          
          <div>
            <label style={{display:"block", fontSize:"20px", fontWeight:"600", marginBottom:"8px"}}>रक्तचाप (Blood Pressure)</label>
            <input type="text" value={form.bp} onChange={e => handleToggle("bp", e.target.value)}
              placeholder="120/80"
              style={{width:"100%", padding:"16px", fontSize:"22px", borderRadius:"10px", border:"2px solid #d1d5db"}}/>
          </div>
          
          <div>
            <label style={{display:"block", fontSize:"20px", fontWeight:"600", marginBottom:"12px"}}>क्या परिवार में डायबिटीज़ है?</label>
            <div style={{display:"flex", gap:"10px"}}>
              <button onClick={() => handleToggle("family_history_diabetes", 1)}
                style={{
                  flex:1, padding:"16px", fontSize:"20px", fontWeight:"bold", borderRadius:"10px",
                  background: form.family_history_diabetes === 1 ? "#2563eb" : "white",
                  color: form.family_history_diabetes === 1 ? "white" : "#4b5563",
                  border: `2px solid ${form.family_history_diabetes === 1 ? "#2563eb" : "#d1d5db"}`
                }}>हां</button>
              <button onClick={() => handleToggle("family_history_diabetes", 0)}
                style={{
                  flex:1, padding:"16px", fontSize:"20px", fontWeight:"bold", borderRadius:"10px",
                  background: form.family_history_diabetes === 0 ? "#2563eb" : "white",
                  color: form.family_history_diabetes === 0 ? "white" : "#4b5563",
                  border: `2px solid ${form.family_history_diabetes === 0 ? "#2563eb" : "#d1d5db"}`
                }}>नहीं</button>
            </div>
          </div>
          
          <div>
            <label style={{display:"block", fontSize:"20px", fontWeight:"600", marginBottom:"8px"}}>नींद के घंटे (प्रति रात)</label>
            <input type="number" value={form.sleep_hours} onChange={e => handleToggle("sleep_hours", e.target.value)}
              placeholder="उदा. 7"
              style={{width:"100%", padding:"16px", fontSize:"22px", borderRadius:"10px", border:"2px solid #d1d5db"}}/>
          </div>
          
          <div>
            <label style={{display:"block", fontSize:"20px", fontWeight:"600", marginBottom:"12px"}}>व्यायाम</label>
            <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
              <button onClick={() => handleToggle("physical_activity", 0)}
                style={{
                  padding:"16px", fontSize:"20px", fontWeight:"bold", borderRadius:"10px", textAlign:"left",
                  background: form.physical_activity === 0 ? "#2563eb" : "white",
                  color: form.physical_activity === 0 ? "white" : "#4b5563",
                  border: `2px solid ${form.physical_activity === 0 ? "#2563eb" : "#d1d5db"}`
                }}>बिल्कुल नहीं</button>
              <button onClick={() => handleToggle("physical_activity", 1)}
                style={{
                  padding:"16px", fontSize:"20px", fontWeight:"bold", borderRadius:"10px", textAlign:"left",
                  background: form.physical_activity === 1 ? "#2563eb" : "white",
                  color: form.physical_activity === 1 ? "white" : "#4b5563",
                  border: `2px solid ${form.physical_activity === 1 ? "#2563eb" : "#d1d5db"}`
                }}>थोड़ा बहुत</button>
              <button onClick={() => handleToggle("physical_activity", 3)}
                style={{
                  padding:"16px", fontSize:"20px", fontWeight:"bold", borderRadius:"10px", textAlign:"left",
                  background: form.physical_activity === 3 ? "#2563eb" : "white",
                  color: form.physical_activity === 3 ? "white" : "#4b5563",
                  border: `2px solid ${form.physical_activity === 3 ? "#2563eb" : "#d1d5db"}`
                }}>रोजाना</button>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{
          width:"100%", padding:"20px", fontSize:"22px", fontWeight:"bold",
          background:"#16a34a", color:"white", borderRadius:"12px", border:"none",
          marginTop:"32px", opacity: loading ? 0.7 : 1, display:"flex", justifyContent:"center"
        }}>
          {loading ? "जांच हो रही है..." : "परिणाम देखें"}
        </button>
      </div>
    </div>
  )
}
