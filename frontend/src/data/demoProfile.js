export const demoInput = {
  age: 45,
  sex: 1, // Male
  height_cm: 175,
  weight_kg: 85,
  systolic_bp: 145, // High BP -> Hypertension risk
  cholesterol: 240, // High cholesterol -> Heart risk
  high_cholesterol: 1,
  physical_activity: 1.5, // Low activity -> Obesity / Heart risk
  sleep_hours: 5.5, // Low sleep -> Stress risk
  dietary_quality: 4, // Poor diet -> Obesity / Diabetes risk
  stress_level: 8, // High stress
  smoking: 1,
  alcohol: 1,
  family_history: 1,
  previous_conditions: 0
}

export const demoResult = {
  predictions: [
    {
      condition: "hypertension",
      risk_probability: 0.85,
      risk_level: "High",
      top_shap_features: [{ feature: "systolic_bp", importance: 0.35 }, { feature: "age", importance: 0.15 }]
    },
    {
      condition: "heart",
      risk_probability: 0.72,
      risk_level: "High",
      top_shap_features: [{ feature: "cholesterol", importance: 0.3 }, { feature: "smoking", importance: 0.2 }]
    },
    {
      condition: "stress",
      risk_probability: 0.65,
      risk_level: "Moderate",
      top_shap_features: [{ feature: "stress_level", importance: 0.4 }, { feature: "sleep_hours", importance: 0.25 }]
    },
    {
      condition: "obesity",
      risk_probability: 0.45,
      risk_level: "Moderate",
      top_shap_features: [{ feature: "physical_activity", importance: 0.25 }, { feature: "dietary_quality", importance: 0.2 }]
    },
    {
      condition: "diabetes",
      risk_probability: 0.35,
      risk_level: "Low",
      top_shap_features: [{ feature: "family_history", importance: 0.2 }, { feature: "dietary_quality", importance: 0.15 }]
    }
  ],
  health_score: {
    total: 42,
    breakdown: {
      physical: 8,
      mental: 9,
      nutrition: 10,
      sleep: 15
    }
  }
}
