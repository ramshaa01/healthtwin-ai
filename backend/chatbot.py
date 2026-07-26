import re
from typing import Optional

KNOWLEDGE_BASE = {
    "diabetes": {
        "keywords": ["diabetes","blood sugar","glucose","insulin","diabetic","sugar","type 2","hba1c"],
        "causes": "Type 2 diabetes is caused by insulin resistance. Key risk factors include high BMI, physical inactivity, poor diet, family history, and age above 45.",
        "prevention": "Prevent diabetes by maintaining healthy weight (BMI 18.5-24.9), exercising 150+ minutes per week, eating low-sugar diet rich in vegetables and whole grains, and avoiding processed foods.",
        "symptoms": "Common symptoms include frequent urination, excessive thirst, blurred vision, slow-healing wounds, and fatigue. Many people have no symptoms for years.",
        "diet": "Eat foods with low glycemic index: whole grains, legumes, non-starchy vegetables, lean proteins. Avoid sugary drinks, white bread, processed snacks, and refined carbohydrates.",
        "exercise": "Aim for 30 minutes of moderate exercise 5 days a week. Both aerobic exercise (walking, cycling) and resistance training improve insulin sensitivity.",
    },
    "hypertension": {
        "keywords": ["blood pressure","hypertension","bp","systolic","diastolic","high bp","pressure"],
        "causes": "Hypertension is caused by age, excess weight, high sodium intake, physical inactivity, smoking, alcohol, stress, and genetic factors.",
        "prevention": "Reduce sodium intake to under 2300mg/day, exercise regularly, maintain healthy weight, limit alcohol, quit smoking, and manage stress.",
        "symptoms": "Hypertension is called the silent killer — most people have no symptoms. Severe cases may cause headaches, dizziness, or nosebleeds.",
        "diet": "Follow the DASH diet: fruits, vegetables, whole grains, low-fat dairy, lean protein. Reduce salt, processed foods, red meat, and alcohol.",
        "exercise": "Cardio exercise like walking, swimming, or cycling for 30 minutes most days can reduce systolic blood pressure by 4-9 mmHg.",
    },
    "heart": {
        "keywords": ["heart","cardiac","cardiovascular","cholesterol","heart disease","heart attack","coronary","chest pain"],
        "causes": "Heart disease risk factors include high blood pressure, high cholesterol, smoking, diabetes, obesity, physical inactivity, family history, and stress.",
        "prevention": "Quit smoking, control blood pressure and cholesterol, exercise regularly, maintain healthy weight, eat a heart-healthy diet, and manage stress.",
        "symptoms": "Warning signs include chest pain or pressure, shortness of breath, pain radiating to arm or jaw, irregular heartbeat, fatigue, and leg swelling.",
        "diet": "Eat omega-3 rich foods (fish, walnuts, flaxseed), fruits, vegetables, whole grains. Limit saturated fats, trans fats, sodium, and red meat.",
        "exercise": "Aim for 150 minutes of moderate aerobic activity weekly. Regular exercise strengthens the heart muscle and improves circulation.",
    },
    "obesity": {
        "keywords": ["obesity","overweight","weight","bmi","fat","body mass","lose weight","weight loss"],
        "causes": "Obesity is caused by consuming more calories than burned, sedentary lifestyle, poor diet, genetic predisposition, hormonal issues, and stress eating.",
        "prevention": "Maintain calorie balance, eat whole foods, reduce ultra-processed food intake, exercise regularly, get adequate sleep, and manage stress.",
        "symptoms": "Obesity is defined as BMI over 30. It increases risk of diabetes, heart disease, sleep apnea, joint problems, and certain cancers.",
        "diet": "Focus on portion control, eat slowly, choose high-fiber foods (vegetables, legumes, whole grains), avoid liquid calories, and plan meals ahead.",
        "exercise": "Combine cardio (burns calories) with strength training (builds metabolism). Start with 20-30 minutes daily and gradually increase.",
    },
    "stress": {
        "keywords": ["stress","anxiety","mental health","depression","sleep","insomnia","worry","tension","burnout","mood","mental"],
        "causes": "Chronic stress is caused by work pressure, relationship issues, financial worries, poor sleep, lack of exercise, and unhealthy coping mechanisms.",
        "prevention": "Practice mindfulness meditation, maintain regular sleep schedule, exercise daily, limit caffeine, build social support, and take regular breaks.",
        "symptoms": "Stress symptoms include difficulty sleeping, irritability, headaches, muscle tension, difficulty concentrating, fatigue, and appetite changes.",
        "diet": "Eat magnesium-rich foods (nuts, seeds, leafy greens), reduce caffeine and alcohol, stay hydrated, and avoid skipping meals.",
        "exercise": "Even a 20-minute walk significantly reduces cortisol levels. Yoga and swimming are especially effective for stress reduction.",
    },
    "general": {
        "keywords": ["health","healthy","lifestyle","wellness","improve","better","tips","advice"],
        "sleep": "Adults need 7-9 hours of quality sleep. Poor sleep increases risk of diabetes, obesity, heart disease, and mental health issues. Maintain a consistent sleep schedule.",
        "water": "Drink 8-10 glasses (2-2.5 litres) of water daily. Proper hydration supports metabolism, kidney function, and energy levels.",
        "exercise": "WHO recommends 150 minutes of moderate aerobic activity per week plus 2 sessions of strength training. Even short walks help.",
        "diet": "Follow a balanced diet: half your plate vegetables and fruits, quarter whole grains, quarter lean protein. Minimize processed foods, sugar, and excess salt.",
        "checkup": "Get annual health checkups including blood pressure, blood sugar, cholesterol, and BMI measurements — even if you feel healthy.",
    }
}

INTENTS = {
    "greeting":   r"\b(hi|hello|hey|namaste|hii|helo)\b",
    "thanks":     r"\b(thank|thanks|thankyou|thank you|shukriya)\b",
    "what_is":    r"\bwhat (is|are|causes?)\b",
    "how_to":     r"\bhow (to|can|do|should)\b",
    "symptoms":   r"\b(symptom|sign|feel|feeling|detect)\b",
    "diet":       r"\b(diet|eat|food|nutrition|meal)\b",
    "exercise":   r"\b(exercise|workout|physical|activity|gym|walk|run)\b",
    "prevention": r"\b(prevent|avoid|reduce|lower|decrease|improve)\b",
    "my_risk":    r"\b(my risk|my score|my result|my prediction|my health)\b",
    "why_high":   r"\b(why|reason|cause)\b.*\b(high|risk|score)\b",
    "help":       r"\b(help|what can|option|feature)\b",
}

def detect_condition(text: str) -> Optional[str]:
    text_lower = text.lower()
    for condition, data in KNOWLEDGE_BASE.items():
        if condition == "general":
            continue
        for keyword in data["keywords"]:
            if keyword in text_lower:
                return condition
    return None

def detect_intent(text: str) -> str:
    text_lower = text.lower()
    for intent, pattern in INTENTS.items():
        if re.search(pattern, text_lower):
            return intent
    return "general_question"

def generate_response(message: str,
                      user_predictions: Optional[list] = None) -> str:
    intent = detect_intent(message)
    condition = detect_condition(message)
    msg_lower = message.lower()

    if intent == "greeting":
        return ("Hello! I am your HealthTwin AI health assistant.\n\n"
                "I can answer questions about diabetes, heart disease, "
                "hypertension, obesity, and stress management.\n\n"
                "Try asking:\n"
                "- What causes diabetes?\n"
                "- How to reduce blood pressure?\n"
                "- What should I eat for heart health?\n"
                "- Why is my risk high?")

    if intent == "thanks":
        return ("You are welcome! Feel free to ask any other health "
                "questions. Small consistent lifestyle changes lead to "
                "big health improvements over time!")

    if intent == "help":
        return ("I can help you with:\n\n"
                "Disease Information - causes, symptoms, risk factors\n"
                "Diet Advice - what to eat for each condition\n"
                "Exercise Tips - best workouts for your health\n"
                "Prevention - how to reduce your risks\n"
                "Your Results - explain your prediction scores\n\n"
                "Just ask me anything about your health!")

    if intent == "why_high" and user_predictions:
        high_risks = [p for p in user_predictions
                      if p.get("risk_level") == "High"]
        if high_risks:
            responses = []
            for p in high_risks[:2]:
                cond = p["condition"]
                prob = round(p["risk_probability"] * 100, 1)
                top_feat = (p.get("top_shap_features", [{}])[0]
                            .get("feature", "your lifestyle inputs"))
                responses.append(
                    f"{cond.title()} ({prob}% risk): "
                    f"The strongest driver is '{top_feat}'. "
                    f"{KNOWLEDGE_BASE.get(cond, {}).get('prevention', '')}"
                )
            return ("Based on your latest assessment:\n\n" +
                    "\n\n".join(responses) +
                    "\n\nCheck the Recommendations tab on your dashboard "
                    "for a personalized action plan.")
        return ("Your current risk levels look manageable! "
                "Keep maintaining your healthy habits and retake "
                "the assessment monthly to track progress.")

    if intent == "my_risk" and user_predictions:
        lines = []
        for p in user_predictions:
            emoji = ("High" if p["risk_level"] == "High" else
                     "Moderate" if p["risk_level"] == "Moderate" else "Low")
            lines.append(
                f"{p['condition'].title()}: "
                f"{round(p['risk_probability']*100,1)}% - {emoji}"
            )
        return ("Your latest risk assessment:\n\n" +
                "\n".join(lines) +
                "\n\nUse the Simulate tab to see how lifestyle "
                "changes affect these numbers in real time!")

    if condition and condition in KNOWLEDGE_BASE:
        kb = KNOWLEDGE_BASE[condition]
        if intent == "diet":
            return f"Diet advice for {condition}:\n\n{kb.get('diet','Eat a balanced whole-food diet.')}"
        elif intent == "exercise":
            return f"Exercise guidance for {condition}:\n\n{kb.get('exercise','Regular physical activity helps.')}"
        elif intent == "symptoms":
            return f"{condition.title()} symptoms:\n\n{kb.get('symptoms','Consult a doctor for diagnosis.')}"
        elif intent == "prevention":
            return f"Preventing {condition}:\n\n{kb.get('prevention','A healthy lifestyle is key.')}"
        elif intent == "what_is":
            return (f"About {condition.title()}:\n\n"
                    f"Causes: {kb.get('causes','')}\n\n"
                    f"Prevention: {kb.get('prevention','')}")
        else:
            return (f"{condition.title()} - Key Information:\n\n"
                    f"Causes: {kb.get('causes','')}\n\n"
                    f"Diet: {kb.get('diet','')}\n\n"
                    f"Exercise: {kb.get('exercise','')}")

    if "sleep" in msg_lower:
        return "Sleep and Health:\n\n" + KNOWLEDGE_BASE["general"]["sleep"]
    if any(w in msg_lower for w in ["water","hydrat","drink"]):
        return "Hydration:\n\n" + KNOWLEDGE_BASE["general"]["water"]
    if "checkup" in msg_lower or "doctor" in msg_lower:
        return "Regular Checkups:\n\n" + KNOWLEDGE_BASE["general"]["checkup"]

    return ("I can help with questions about diabetes, heart disease, "
            "hypertension, obesity, and stress.\n\n"
            "Try asking:\n"
            "- What causes high blood pressure?\n"
            "- How to lose weight safely?\n"
            "- What should I eat for diabetes?\n"
            "- Why is my stress risk high?")
