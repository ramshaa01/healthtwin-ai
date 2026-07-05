from typing import List

CONDITIONS = ['diabetes', 'hypertension', 'heart', 'obesity', 'stress']

# Rule tree: maps condition + top SHAP feature -> recommendation
RECOMMENDATIONS = {
    'diabetes': {
        'GenHlth':       "Prioritise regular health checkups — your overall health perception is the strongest diabetes signal.",
        'BMI':           "Aim for a BMI between 18.5-24.9. Even a 5% weight reduction significantly lowers diabetes risk.",
        'Age':           "Age is a fixed risk factor — compensate with consistent lifestyle habits.",
        'HighBP':        "Manage your blood pressure actively — hypertension and diabetes are closely linked.",
        'PhysActivity':  "Add at least 150 minutes of moderate exercise per week to reduce diabetes risk.",
        'MentHlth':      "Poor mental health days correlate with diabetes risk — consider stress management techniques.",
        'default':       "Maintain a balanced diet and regular physical activity to reduce diabetes risk."
    },
    'hypertension': {
        'Age':           "Age is your strongest hypertension risk factor. Focus on sodium reduction and regular BP monitoring.",
        'BMI':           "Every 1 kg/m² reduction in BMI lowers systolic BP by approximately 1 mmHg.",
        'GenHlth':       "Your general health score is driving hypertension risk — consider a full health review.",
        'HighChol':      "High cholesterol and hypertension often co-occur — address both together.",
        'Smoker':        "Smoking raises blood pressure immediately. Quitting is the single highest-impact change.",
        'PhysActivity':  "30 minutes of moderate cardio 5 days a week can reduce systolic BP by 4-9 mmHg.",
        'default':       "Reduce sodium intake, exercise regularly, and monitor blood pressure weekly."
    },
    'heart': {
        'age':           "Cardiovascular risk rises with age — regular cardiac screening is advisable.",
        'sex':           "Biological sex affects heart disease pattern — discuss gender-specific risk factors with a doctor.",
        'chol':          "Elevated cholesterol is a modifiable heart disease risk — consider dietary fat reduction.",
        'trestbps':      "High resting blood pressure strains the heart — aim for below 120/80 mmHg.",
        'fbs':           "Elevated fasting blood sugar is an early warning sign — review your carbohydrate intake.",
        'default':       "Maintain a heart-healthy diet, exercise regularly, and avoid smoking."
    },
    'obesity': {
        'family_history_with_overweight': "Genetic predisposition to obesity is real — focus on sustainable habit change rather than crash diets.",
        'Age':           "Metabolism slows with age — adjust calorie intake and exercise intensity accordingly.",
        'CAEC':          "Eating between meals frequently is a strong obesity predictor — try structured meal timing.",
        'NCP':           "Review your number of main meals — irregular meal patterns drive weight gain.",
        'FAF':           "Increase physical activity frequency — even 3 sessions per week significantly reduces obesity risk.",
        'CH2O':          "Adequate hydration (2-3L daily) supports metabolism and reduces overeating.",
        'default':       "Focus on whole foods, regular meals, and consistent physical activity."
    },
    'stress': {
        'Quality of Sleep': "Sleep quality is your #1 stress driver — establish a consistent sleep schedule and limit screens before bed.",
        'Gender':           "Stress patterns differ by gender — explore targeted stress management strategies.",
        'systolic_bp':      "Elevated blood pressure and stress form a feedback loop — try breathwork or meditation.",
        'Physical Activity Level': "Even a 20-minute walk significantly reduces cortisol levels.",
        'Sleep Duration':   "Aim for 7-9 hours of sleep — both under and over-sleeping increase stress markers.",
        'default':          "Practice daily mindfulness, maintain social connections, and protect sleep quality."
    }
}

def generate_recommendations(predictions: list) -> list:
    """Generate 5-10 ranked, non-redundant recommendations based on
    risk probabilities and top SHAP features."""

    all_recs = []

    for pred in predictions:
        condition  = pred['condition']
        risk_prob  = pred['risk_probability']
        shap_feats = pred.get('top_shap_features', [])

        # Tier 1: risk > 70% — urgent
        # Tier 2: risk 40-70% — moderate
        # Tier 3: risk < 40% — maintenance
        if risk_prob >= 0.7:
            tier, prefix = 1, "⚠️ High Priority"
        elif risk_prob >= 0.4:
            tier, prefix = 2, "📋 Moderate Priority"
        else:
            tier, prefix = 3, "✅ Maintenance"

        condition_rules = RECOMMENDATIONS.get(condition, {})

        # Find the top SHAP feature that has a specific recommendation
        matched = False
        for feat_entry in shap_feats:
            feat = feat_entry['feature']
            if feat in condition_rules:
                rec_text = condition_rules[feat]
                all_recs.append({
                    'tier':      tier,
                    'priority':  prefix,
                    'condition': condition,
                    'feature':   feat,
                    'recommendation': rec_text
                })
                matched = True
                break

        if not matched:
            all_recs.append({
                'tier':      tier,
                'priority':  prefix,
                'condition': condition,
                'feature':   'general',
                'recommendation': condition_rules.get('default', '')
            })

    # Sort by tier (urgent first), deduplicate by recommendation text
    all_recs.sort(key=lambda x: x['tier'])
    seen = set()
    unique_recs = []
    for r in all_recs:
        if r['recommendation'] not in seen:
            seen.add(r['recommendation'])
            unique_recs.append(r)

    return unique_recs[:10]
