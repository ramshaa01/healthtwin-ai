# HealthTwin AI
### Personalized Predictive Health System using Digital Twin

An offline, explainable, multi-disease health risk prediction system
built as a B.Tech final year project. Predicts risk for 5 conditions
— Type 2 Diabetes, Heart Disease, Hypertension, Obesity, and Stress —
from self-reported lifestyle inputs, with SHAP-based explanations and
a Digital Twin simulation layer.

## Tech Stack
- ML: Python, scikit-learn, XGBoost, SHAP, imbalanced-learn
- Backend: FastAPI, MongoDB, PyJWT, passlib
- Frontend: React (Vite), recharts, axios

## Project Status
- [x] Week 1: Data pipeline (sourcing, cleaning, preprocessing)
- [x] Week 2: ML models + SHAP explainability (all 5 conditions)
- [ ] Week 3: FastAPI backend + Digital Twin engine (Days 15-21)
- [ ] Week 4: React frontend + integration (Days 22-28)
- [ ] Days 29-30: Testing, report, demo prep

## Running the project (Week 3+ only)
Instructions will be added as the backend and frontend are built.

## Model Results Summary
| Condition | Model | Test ROC-AUC |
|---|---|---|
| Diabetes | XGBoost | 0.7985 |
| Hypertension | Logistic Regression | 0.7933 |
| Heart Disease | Random Forest | 0.7121 |
| Obesity | Gradient Boosting | 0.9690 |
| Stress | Decision Tree | 0.9954 |
