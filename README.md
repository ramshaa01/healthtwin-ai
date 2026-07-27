# HealthTwin AI
### Personalised Predictive Health System using Digital Twin

A B.Tech Final Year Major Project — an explainable, multi-disease
health risk prediction system with Digital Twin simulation, AI chatbot,
and health trend tracking. Deployable as a Progressive Web App (PWA).

Live Demo: https://healthtwin-ai-eight.vercel.app
Backend API Docs: https://healthtwin-ai-backend.onrender.com/docs

## Core Features
- Multi-disease prediction: Type 2 Diabetes, Heart Disease,
  Hypertension, Obesity, Mental Stress (all from one 15-field form)
- SHAP explainability: every prediction explained feature-by-feature
- Digital Twin What-If simulation: real-time slider-based risk preview
- Monte Carlo 12-month forecast: best/expected/worst trajectories
- Health trends tracking: score and risk trends across assessments
- AI health chatbot: personalized, context-aware health guidance
- PDF report export: shareable with healthcare providers
- PWA: installable on Android as a native-like app
- JWT authentication with bcrypt encryption

## Tech Stack
- ML: Python, scikit-learn, XGBoost, SHAP, imbalanced-learn
- Backend: FastAPI, MongoDB Atlas, PyJWT, passlib, ReportLab
- Frontend: React (Vite), Tailwind CSS, recharts, react-router-dom
- Deployment: Render (backend) + Vercel (frontend) + MongoDB Atlas

## Model Results
| Condition | Model | Test ROC-AUC |
|---|---|---|
| Type 2 Diabetes | XGBoost | 0.7985 |
| Hypertension | Logistic Regression | 0.7933 |
| Heart Disease | Random Forest | 0.7121 |
| Obesity | Gradient Boosting | 0.9690 |
| Mental Stress | Decision Tree | 0.9954 |

## API Endpoints (11 total)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/health-check | No | System status |
| POST | /api/auth/signup | No | Register user |
| POST | /api/auth/login | No | Login + JWT token |
| GET | /api/auth/profile | Yes | User profile |
| POST | /api/predict | Yes | Run all 5 models |
| POST | /api/simulate | Yes | What-If simulation |
| POST | /api/forecast | Yes | Monte Carlo forecast |
| POST | /api/recommendations | Yes | Lifestyle advice |
| POST | /api/chat | Yes | Health chatbot |
| GET | /api/history | Yes | Past assessments |
| GET | /api/export-pdf | Yes | PDF report |

## Running Locally
1. Clone the repository
2. Install MongoDB Community and start the service
3. Backend setup:
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn backend.main:app --reload --port 8000
4. Frontend setup:
   cd frontend
   npm install
   npm run dev
5. Open http://localhost:5173

## Key Design Decisions
- Models loaded once at startup (not per-request) for low latency
- Digital Twin uses in-memory diff-only simulation without DB writes
- SMOTE applied only on training data to prevent data leakage
- Heart disease restricted to 5 self-reportable features by design
- Obesity BMI/Height/Weight removed after detecting data leakage
