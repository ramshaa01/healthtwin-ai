import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { healthAPI } from "../api/client"
import Navbar from "../components/Navbar"

const STEPS = [
  {
    title: "Personal Information",
    fields: [
      { key: "age",    label: "Age (years)",    type: "number",
        min: 1,  max: 120, step: 1,  placeholder: "e.g. 35" },
      { key: "sex",    label: "Biological Sex", type: "select",
        options: [{ value: 1, label: "Male" },
                  { value: 0, label: "Female" }] },
      { key: "height_cm", label: "Height (cm)", type: "number",
        min: 50, max: 250, step: 0.1, placeholder: "e.g. 170" },
      { key: "weight_kg", label: "Weight (kg)", type: "number",
        min: 20, max: 300, step: 0.1, placeholder: "e.g. 70" },
    ]
  },
  {
    title: "Clinical Readings",
    subtitle: "Use your last known readings, or estimates if unavailable",
    fields: [
      { key: "systolic_bp",  label: "Systolic Blood Pressure (mmHg)",
        type: "number", min: 60, max: 250, step: 1,
        placeholder: "e.g. 120" },
      { key: "cholesterol",  label: "Cholesterol (mg/dL)",
        type: "number", min: 50, max: 600, step: 1,
        placeholder: "e.g. 200" },
      { key: "high_cholesterol", label: "Diagnosed with High Cholesterol?",
        type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
    ]
  },
  {
    title: "Lifestyle & Habits",
    fields: [
      { key: "physical_activity", label: "Exercise sessions per week",
        type: "number", min: 0, max: 21, step: 0.5,
        placeholder: "e.g. 3" },
      { key: "sleep_hours",  label: "Average sleep hours per night",
        type: "number", min: 0, max: 24, step: 0.5,
        placeholder: "e.g. 7" },
      { key: "dietary_quality", label: "Dietary quality (1=poor, 10=excellent)",
        type: "number", min: 1, max: 10, step: 1,
        placeholder: "e.g. 6" },
      { key: "stress_level", label: "Stress level (1=low, 10=very high)",
        type: "number", min: 1, max: 10, step: 1,
        placeholder: "e.g. 5" },
      { key: "smoking", label: "Do you smoke?",
        type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
      { key: "alcohol", label: "Heavy alcohol consumption?",
        type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
    ]
  },
  {
    title: "Family History",
    subtitle: "Has any immediate family member been diagnosed with:",
    fields: [
      { key: "family_history_diabetes",
        label: "Family history of Type 2 Diabetes?",
        type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
      { key: "family_history_heart",
        label: "Family history of Heart Disease?",
        type: "select",
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
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

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
    setError("")
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v)])
      )
      const res = await healthAPI.predict(payload)
      // Store result in sessionStorage for dashboard to read
      sessionStorage.setItem("healthtwin_input", JSON.stringify(payload))
      sessionStorage.setItem("healthtwin_result", JSON.stringify(res.data))
      navigate("/dashboard")
    } catch (e) {
      setError(e.response?.data?.detail ||
               JSON.stringify(e.response?.data) ||
               "Prediction failed. Please check all values.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%", padding: "0.75rem",
    borderRadius: "8px", border: "1px solid #d1d5db",
    fontSize: "1rem", boxSizing: "border-box", marginTop: "0.25rem"
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "2rem auto",
                    padding: "0 1rem" }}>

        {/* Progress bar */}
        <div style={{ background: "#e5e7eb", borderRadius: "999px",
                      height: "8px", marginBottom: "2rem" }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: "#1e40af", borderRadius: "999px",
            transition: "width 0.3s ease"
          }} />
        </div>

        <div style={{ background: "white", borderRadius: "16px",
                      padding: "2rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h2 style={{ color: "#1e40af", marginBottom: "0.5rem" }}>
            Step {step + 1} of {STEPS.length}: {currentStep.title}
          </h2>
          {currentStep.subtitle && (
            <p style={{ color: "#6b7280", fontSize: "0.9rem",
                        marginBottom: "1.5rem" }}>
              {currentStep.subtitle}
            </p>
          )}

          {error && (
            <div style={{ background: "#fef2f2",
                          border: "1px solid #fca5a5",
                          padding: "0.75rem", borderRadius: "8px",
                          color: "#dc2626", marginBottom: "1rem",
                          fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          {currentStep.fields.map(field => (
            <div key={field.key} style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontWeight: "500", color: "#374151",
                              display: "block" }}>
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  value={form[field.key]}
                  onChange={e => updateField(field.key, e.target.value)}
                  style={inputStyle}>
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => updateField(field.key, e.target.value)}
                  style={inputStyle}
                />
              )}
            </div>
          ))}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{ flex: 1, padding: "0.85rem",
                         background: "white", color: "#1e40af",
                         border: "2px solid #1e40af",
                         borderRadius: "8px", fontSize: "1rem",
                         fontWeight: "bold", cursor: "pointer" }}>
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? handleSubmit : handleNext}
              disabled={loading}
              style={{ flex: 1, padding: "0.85rem",
                       background: loading ? "#93c5fd" : "#1e40af",
                       color: "white", border: "none",
                       borderRadius: "8px", fontSize: "1rem",
                       fontWeight: "bold", cursor: "pointer" }}>
              {loading ? "Analysing..." :
               isLast ? "Get My Health Report →" : "Next →"}
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", justifyContent: "center",
                      gap: "0.5rem", marginTop: "1.5rem" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: i <= step ? "#1e40af" : "#d1d5db"
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
