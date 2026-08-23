import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { healthAPI } from "../api/client"
import Navbar from "../components/Navbar"

const STEPS = [
  {
    title: "Personal Information",
    icon: "👤",
    fields: [
      { key: "age",    label: "Age (years)", type: "number",
        min: 1, max: 120, step: 1, placeholder: "e.g. 25" },
      { key: "sex",    label: "Biological Sex", type: "select",
        options: [{ value: 1, label: "Male" },
                  { value: 0, label: "Female" }] },
      { key: "height_cm", label: "Height (cm)", type: "number",
        min: 50, max: 250, step: 0.1, placeholder: "e.g. 170" },
      { key: "weight_kg", label: "Weight (kg)", type: "number",
        min: 20, max: 300, step: 0.1, placeholder: "e.g. 65" },
    ]
  },
  {
    title: "Clinical Readings",
    icon: "🩺",
    subtitle: "Use your last known readings, or estimates if unavailable.",
    fields: [
      { key: "systolic_bp", label: "Systolic Blood Pressure (mmHg)",
        type: "number", min: 60, max: 250, step: 1,
        placeholder: "e.g. 120  (normal: below 120)" },
      { key: "cholesterol", label: "Cholesterol (mg/dL)",
        type: "number", min: 50, max: 600, step: 1,
        placeholder: "e.g. 180  (normal: below 200)" },
      { key: "high_cholesterol", label: "Diagnosed with High Cholesterol?",
        type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
    ]
  },
  {
    title: "Lifestyle & Habits",
    icon: "🏃",
    fields: [
      { key: "physical_activity", label: "Exercise sessions per week",
        type: "number", min: 0, max: 21, step: 0.5,
        placeholder: "e.g. 3  (target: 3-5)" },
      { key: "sleep_hours", label: "Average sleep hours per night",
        type: "number", min: 0, max: 24, step: 0.5,
        placeholder: "e.g. 7  (optimal: 7-9)" },
      { key: "dietary_quality", label: "Dietary quality score (1-10)",
        type: "number", min: 1, max: 10, step: 1,
        placeholder: "1 = junk food, 10 = very healthy" },
      { key: "stress_level", label: "Stress level (1-10)",
        type: "number", min: 1, max: 10, step: 1,
        placeholder: "1 = calm, 10 = very stressed" },
      { key: "smoking", label: "Do you smoke?", type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
      { key: "alcohol", label: "Heavy alcohol consumption?", type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
    ]
  },
  {
    title: "Family History",
    icon: "👨👩👧",
    subtitle: "Has any immediate family member been diagnosed with:",
    fields: [
      { key: "family_history_diabetes",
        label: "Type 2 Diabetes in family?", type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
      { key: "family_history_heart",
        label: "Heart Disease in family?", type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
    ]
  }
]

const DEFAULT_FORM = {
  age: "", sex: 1, height_cm: "", weight_kg: "",
  systolic_bp: "", cholesterol: "", high_cholesterol: 0,
  physical_activity: "", sleep_hours: "", dietary_quality: "",
  stress_level: "", smoking: 0, alcohol: 0,
  family_history_diabetes: 0, family_history_heart: 0
}

export default function AssessmentPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  const validateStep = () => {
    for (const field of currentStep.fields) {
      if (field.type !== "select" && form[field.key] === "") {
        setError(`Please fill in: ${field.label}`)
        return false
      }
    }
    setError("")
    return true
  }

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    setAnalysing(true)
    setError("")
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v)])
      )
      sessionStorage.setItem("healthtwin_input", JSON.stringify(payload))
      const res = await healthAPI.predict(payload)
      sessionStorage.setItem("healthtwin_result", JSON.stringify(res.data))
      navigate("/results")
      setAnalysing(false)
    } catch (e) {
      setError(e.response?.data?.detail ||
               JSON.stringify(e.response?.data) ||
               "Prediction failed. Please check all values and try again.")
      setAnalysing(false)
    } finally {
      setLoading(false)
    }
  }

  if (analysing) return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#06111f,#0d2035)",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:"24px"
    }}>
      <div style={{
        fontSize:"13px",fontWeight:"600",color:"rgba(255,255,255,0.7)",
        letterSpacing:".08em",textTransform:"uppercase"
      }}>
        Building Your Digital Twin
      </div>

      {/* Animated body placeholder */}
      <div style={{
        width:"80px",height:"160px",
        background:"linear-gradient(180deg,rgba(99,179,237,0.3),rgba(99,179,237,0.05))",
        borderRadius:"40px 40px 20px 20px",
        border:"1px solid rgba(99,179,237,0.3)",
        animation:"twinpulse 1.5s ease-in-out infinite",
        position:"relative"
      }}>
        <div style={{
          position:"absolute",top:"10px",left:"50%",transform:"translateX(-50%)",
          width:"32px",height:"32px",
          background:"rgba(99,179,237,0.4)",
          borderRadius:"50%",
          border:"1px solid rgba(99,179,237,0.5)"
        }}/>
        <div style={{
          position:"absolute",top:"48px",left:"50%",transform:"translateX(-50%)",
          width:"16px",height:"16px",
          background:"rgba(239,68,68,0.7)",
          borderRadius:"50%",
          animation:"heartbeat 0.8s ease-in-out infinite"
        }}/>
      </div>

      <div style={{
        display:"flex",flexDirection:"column",gap:"8px",alignItems:"center"
      }}>
        {["Running 5 AI models...","Computing SHAP values...","Mapping organ risks...","Generating insights..."].map((step,i) => (
          <div key={step} style={{
            fontSize:"12px",
            color:`rgba(255,255,255,${0.3+i*0.15})`,
            animation:`fadeIn 0.5s ease ${i*0.3}s both`
          }}>
            ✓ {step}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes twinpulse{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}
        @keyframes heartbeat{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.3)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Progress header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-500">
              Step {step + 1} of {STEPS.length}
            </p>
            <p className="text-sm font-medium text-primary-700">
              {Math.round(progress)}% complete
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                 style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {STEPS.map((s, i) => (
            <div key={i}
              className={`flex items-center justify-center w-10 h-10
                rounded-full text-lg transition-all duration-300
                ${i < step ? 'bg-primary-600 text-white shadow-md'
                : i === step ? 'bg-white border-2 border-primary-600 shadow-md'
                : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? '✓' : s.icon}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="card animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {currentStep.icon} {currentStep.title}
          </h2>
          {currentStep.subtitle && (
            <p className="text-gray-500 text-sm mb-5">
              {currentStep.subtitle}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl
                            p-3 mb-5 flex items-start gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5 mt-4">
            {currentStep.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1.5">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={form[field.key]}
                    onChange={e => setForm(
                      { ...form, [field.key]: e.target.value }
                    )}
                    className="input-field">
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={field.min} max={field.max} step={field.step}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(
                      { ...form, [field.key]: e.target.value }
                    )}
                    className="input-field"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="btn-secondary flex-1">
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? handleSubmit : handleNext}
              disabled={loading}
              className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"
                    fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analysing your health...
                </span>
              ) : isLast ? "Get My Health Report 🚀" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
