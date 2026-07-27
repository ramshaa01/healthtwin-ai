# HealthTwin AI - System Architecture

## Three-Tier Architecture

User Browser / Android PWA
    | HTTPS
Vercel (React + Vite + Tailwind CSS)
    | REST API with JWT
Render (FastAPI + Python 3.10)
    |- ML Models: 5 pkl files loaded at startup
    |- SHAP Explainers: 5 instances (Tree + Linear)
    |- Digital Twin Engine: stateful in-memory class
    |- Monte Carlo Module: 100 Gaussian noise simulations
    |- Recommendation Engine: 3-tier rule tree
    |- Health Chatbot: keyword + intent matching
    |- PDF Generator: ReportLab
    | PyMongo
MongoDB Atlas
    |- users collection
    |- predictions collection

## ML Pipeline
Raw Dataset
    | Clean (median/mode imputation)
    | SMOTE (training data only)
    | Train (5-fold cross-validation)
    | Tune (RandomizedSearchCV)
    | SHAP (TreeExplainer / LinearExplainer)
    | Save (.pkl files)
FastAPI loads at startup

## Datasets Used
- Diabetes + Hypertension: CDC BRFSS 2015 (253,680 rows, UCI id=891)
- Heart Disease: UCI Cleveland (303 rows, id=45)
- Obesity: UCI Obesity Levels (2,111 rows, id=544)
- Stress: Sleep Health and Lifestyle (374 rows, Kaggle)

## Key Design Decisions
1. Single input form feeds 5 different models via a feature
   mapping function — unified 15-feature Digital Twin schema
2. Models loaded once at startup into a global LOADED_MODELS
   dict — not reloaded per request (latency reduction)
3. Digital Twin stores last input in memory; simulate() applies
   a JSON diff without database writes
4. SMOTE applied after train/test split to prevent leakage
5. Heart disease uses only self-reportable features by design
6. Obesity model excludes BMI/Height/Weight (data leakage fix)

## Security
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire after 24 hours
- Pydantic validates all inputs before reaching any model
- CORS restricted to Vercel frontend origin
