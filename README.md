# HealthTwin AI
### Personalized Predictive Health System using Digital Twin

An offline, explainable, multi-disease health risk prediction system
built as a B.Tech final year project. Predicts risk for 5 conditions
from self-reported lifestyle inputs, with SHAP-based explanations,
Digital Twin simulation, and Monte Carlo forecasting.

## Features
- Multi-disease prediction: Type 2 Diabetes, Heart Disease,
  Hypertension, Obesity, Mental Health Stress
- SHAP explainability: feature-level explanation for every prediction
- Digital Twin What-If simulation: instant lifestyle scenario testing
- Monte Carlo 12-month forecast: best/expected/worst trajectories
- Personalised recommendations ranked by SHAP importance
- PDF report export for healthcare provider sharing
- Full offline operation: no internet required after setup
- JWT authentication with bcrypt password hashing

## Tech Stack
- ML: Python, scikit-learn, XGBoost, SHAP, imbalanced-learn
- Backend: FastAPI, MongoDB, PyJWT, passlib, ReportLab
- Frontend: React (Vite), recharts, react-router-dom, axios

## Model Results
| Condition | Model | Test ROC-AUC |
|---|---|---|
| Diabetes | XGBoost | 0.7985 |
| Hypertension | Logistic Regression | 0.7933 |
| Heart Disease | Random Forest | 0.7121 |
| Obesity | Gradient Boosting | 0.9690 |
| Stress | Decision Tree | 0.9954 |

## Running Locally
1. Clone the repository
2. Install MongoDB Community Edition and start the service
3. Create a Python venv and install dependencies:
   pip install -r requirements.txt
4. Start the backend:
   uvicorn backend.main:app --reload --port 8000
5. Start the frontend:
   cd frontend && npm install && npm run dev
6. Open http://localhost:5173

## Project Status: COMPLETE
