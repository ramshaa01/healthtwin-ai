# HealthTwin AI - Project Scope Doc
### Day 1 Deliverable

## Goal
A fully offline, explainable, multi-disease health risk prediction system that
simulates how lifestyle changes affect future risk, using a Digital Twin
concept.

## Five Conditions & Models
| Condition | Model | Why this model |
|---|---|---|
| Type 2 Diabetes | XGBoost | Handles non-linear interactions between BMI, glucose, activity well |
| Heart Disease | Random Forest | Robust with correlated features (BP, cholesterol) |
| Hypertension | Logistic Regression | Lifestyle to BP risk relationship is closer to linear |
| Obesity | Gradient Boosting | Captures diet x exercise interaction effects |
| Stress | Decision Tree | Shallow tree stays directly human-readable |

## Proposed 15-Feature Digital Twin Schema
| # | Feature | Type | Used For |
|---|---|---|---|
| 1 | Age | numeric | all 5 |
| 2 | Gender | categorical | diabetes, heart disease |
| 3 | Height (cm) | numeric | BMI calculation |
| 4 | Weight (kg) | numeric | BMI calculation |
| 5 | Systolic Blood Pressure | numeric | heart disease, hypertension |
| 6 | Cholesterol level | numeric | heart disease |
| 7 | Fasting glucose (or self-reported proxy) | numeric | diabetes |
| 8 | Physical activity (sessions/week) | numeric | diabetes, hypertension, obesity, stress |
| 9 | Sleep hours/night | numeric | obesity, stress |
| 10 | Dietary quality score (1-10 self-assessment) | numeric | obesity |
| 11 | Stress level (1-10 self-reported) | numeric | stress |
| 12 | Smoking status | binary | heart disease, hypertension |
| 13 | Alcohol consumption | categorical | heart disease, hypertension |
| 14 | Family history of diabetes | binary | diabetes |
| 15 | Family history of heart disease | binary | heart disease |

**Derived (computed later, not raw inputs):**
- BMI = Weight / Height squared
- Sleep consistency metric, computed from variance across prior sessions
