# HealthTwin AI — Viva/SIH Interview Preparation Guide

This document is generated directly from the codebase and evaluation artifacts. It provides honest, specific, and traceable answers to potential panel questions. **Do not memorize blindly — understand the code mapping.**

═══════════════════════════════════════════
## 1. Project Overview (30-second pitch)
═══════════════════════════════════════════

**Pitch:**
"HealthTwin AI is an explainable predictive healthcare platform that builds a 'Digital Twin' of a patient. Instead of just returning a generic risk score, it uses 5 targeted ML models and SHAP explainability to show *exactly* which lifestyle factors are driving a patient's risk for diseases like Diabetes and Hypertension. It allows users to actively simulate lifestyle changes in real-time, and includes a specialized, high-contrast 'ASHA Mode' so rural health workers can screen patients in the field with a simplified 6-field form."

**Target Users:**
The platform serves two distinct users: urban/health-conscious users who want an interactive, data-driven "Digital Twin" to track their lifestyle (via the main dashboard), and rural ASHA workers who need a rapid, stateless, Hindi-first screening tool to triage patients for doctor referrals (via `/asha` route).

═══════════════════════════════════════════
## 2. ML / Data Science Questions
═══════════════════════════════════════════

**Q: Why 5 separate models instead of one multi-label model?**
**A:** "A single multi-label model would struggle with the vastly different feature spaces and datasets we used (e.g., BRFSS for Diabetes/Hypertension vs UCI for Heart Disease). Training separate models (like XGBoost for Diabetes and Logistic Regression for Hypertension) allowed us to pick the optimal algorithm and SHAP explainer for each dataset's specific distribution. (Reference: `backend/models_loader.py` dict of models)."

**Q: Walk through the obesity data leakage bug — what was it and how did you fix it?**
**A:** "Initially, our Obesity Gradient Boosting model hit 100% accuracy. We found this was due to 'data leakage': the dataset included Weight, Height, and BMI as training features. Since Obesity is mathematically defined by BMI, the model was just learning to divide weight by height rather than finding predictive lifestyle patterns. We fixed this by dropping those columns entirely, forcing the model to learn from diet and genetics (Gender, Age, FAVC, etc.), which brought the honest accuracy down to a realistic 92.9% (AUC 0.9690)."

**Q: Why use SMOTE, and why apply it AFTER the train/test split?**
**A:** "We used SMOTE to handle the massive class imbalance in datasets like the BRFSS Diabetes data. It's applied *after* the train/test split so that synthetic data never bleeds into the test set. If we oversampled before splitting, the model would be evaluated on synthetic data variations it had already seen during training, artificially inflating our precision and recall."

**Q: What is SHAP, and why TreeExplainer vs LinearExplainer?**
**A:** "SHAP (SHapley Additive exPlanations) breaks down exactly how much each feature contributed to a specific prediction. We use `TreeExplainer` for our ensemble models (XGBoost, Random Forest, GBM) because it can exactly and quickly compute SHAP values for trees. For Hypertension, which uses Logistic Regression, we use `LinearExplainer`. This guarantees accurate, model-specific feature impacts."

**Q: What are the actual performance metrics of your models?**
**A:** (Drawn directly from `ml/evaluation_report/SUMMARY.md`):
- **Diabetes:** AUC 0.7985, F1 0.418 (n=50,736)
- **Hypertension:** AUC 0.7538, F1 0.668 (n=50,736)
- **Obesity:** AUC 0.9690, F1 0.952 (n=423)
- **Heart:** AUC 0.7121, F1 0.655 (n=61)
- **Stress:** AUC 0.9954, F1 0.989 (n=75)

**Q: Why does the Stress model have 0.99+ AUC, and why is that a red flag?**
**A:** "The 0.9954 AUC is a classic symptom of overfitting on a tiny dataset. The Sleep Health & Lifestyle dataset only has 374 total rows, with just 75 in our test split. The Decision Tree simply memorized the data. I've flagged this in our evaluation report; it serves as a functional placeholder for the platform's UI, but it would need much more data and regularization before clinical deployment."

**Q: Why is the Heart Disease model's 303-row dataset a limitation?**
**A:** "The UCI Cleveland dataset is a standard benchmark, but 303 rows leaves only about 60 patients in the test split. This creates extreme variance—a single misclassified patient shifts the F1 score by 1-2%. With more data, we could tighten the confidence intervals and ensure it generalizes beyond a small cohort."

**Q: What is Monte Carlo forecasting here, and what is its actual limitation?**
**A:** "Our Monte Carlo engine (`backend/monte_carlo.py`) generates 100 noisy variations of a user's habits (using defined standard deviations, e.g., ±1.5 sleep hours) to project best/expected/worst case trajectories. The limitation is that it assumes independent week-to-week Gaussian noise and ignores temporal autocorrelation (e.g., if you have high stress this week, you likely will next week too). It doesn't model long-term compounding effects, just stationary noise."

**Q: No baseline model was compared — how do you know your model beats a simple rule?**
**A:** "Honestly, we didn't rigorously test against a hardcoded clinical rule (like 'if BMI > 30 then High Risk'). Our focus was on integrating explainable ML (SHAP) into a full-stack application pipeline. For a production medical app, proving superiority over standard clinical heuristics would be the required next step."

═══════════════════════════════════════════
## 3. System Design / Architecture Questions
═══════════════════════════════════════════

**Q: Walk through the request flow for an assessment.**
**A:** "The user submits the 15-field form in `AssessmentPage.jsx`. React hits `healthAPI.predict`, mapped to the FastAPI `/api/predict` route (`backend/routers/predict.py`). The route passes the payload to `run_prediction()` in `backend/models_loader.py`, which transforms the 15 fields into model-specific vectors, runs the `.predict_proba()` and `.shap_values()`, and returns the exact probabilities and top 5 impacting features back to the frontend."

**Q: Why three-tier (React/FastAPI/MongoDB) — what are the actual tradeoffs?**
**A:** "React provides the interactive SPA (needed for fluid sliders). FastAPI is perfect because ML models load seamlessly in Python and it handles concurrent requests natively via ASGI. MongoDB gives us a flexible schema for rapidly iterating the user profile shape. The tradeoff is complexity: we have to manage state synchronization across the frontend, backend, and DB, rather than using a monolith."

**Q: How does the Digital Twin 'diff-only simulation' work technically?**
**A:** "Instead of saving every slider tweak to the database, `/api/simulate` (`backend/routers/simulate.py`) accepts only the fields that changed. The `twin_engine` (`backend/digital_twin.py`) merges this diff with the user's cached base profile in-memory, runs the models, and returns updated SHAP impacts in under 200ms without touching MongoDB. This enables 60FPS fluid UI updates."

**Q: Why MongoDB over SQL, and what's the schema?**
**A:** "We chose MongoDB because our prediction payload is highly nested (arrays of SHAP features per disease). In a relational DB, this would require complex joins across 3+ tables. In Mongo, we just store one document per assessment in the `predictions` collection containing the inputs, the timestamps, and the nested model outputs."

**Q: How does JWT auth work here?**
**A:** "When a user logs in (`backend/routers/auth.py`), we hash the incoming password with bcrypt (`passlib`) and compare it to the DB. On success, we issue a JWT signed with `HS256` that expires in 24 hours. The frontend intercepts Axios requests (`frontend/src/api/client.js`) to append `Bearer {token}`. If it expires, the backend throws a 401, and our protected routes redirect the user back to the login page."

**Q: What would break first at scale (1000 concurrent users)?**
**A:** "Our ML inference is synchronous and CPU-bound. If 1,000 users hit `/predict` simultaneously, the FastAPI event loop would block because `model.predict()` isn't natively async, leading to massive latency on the Render free-tier container (0.1 CPU). To fix this, we would need to push inference to a Celery worker queue or use a dedicated model-serving layer like Triton."

═══════════════════════════════════════════
## 4. Engineering Practices Questions
═══════════════════════════════════════════

**Q: How many tests exist, and what do they cover?**
**A:** "We have local Python integration scripts (`test_auth.py`, `test_forecast.py`, `test_local.py`). They successfully cover end-to-end endpoint logic and model loading. However, we do *not* have an automated CI pipeline with `pytest` for unit testing React components or mocking the database. Testing is currently manual and integration-focused."

**Q: What's not containerized/versioned, and why?**
**A:** "We didn't use Docker or MLflow. The models are versioned simply by committing the `.pkl` files to Git. The tradeoff is reproducibility: while it's easy to deploy on Render (which uses native Python buildpacks), spinning up the exact ML environment locally relies entirely on `requirements.txt` rather than an isolated container image."

**Q: Walk through the bcrypt/passlib production bug you hit.**
**A:** "In production, valid signups suddenly returned a 500 Internal Server Error. I injected a temporary try/catch and found a `ValueError: password cannot be longer than 72 bytes`. This is a known bug: `passlib` hasn't updated since 2020, and the latest `bcrypt 4.0+` broke its internal wrap-bug detection. We fixed it by explicitly pinning `bcrypt==3.2.2` in `requirements.txt`."

**Q: What CI/CD exists?**
**A:** "We rely on Vercel (Frontend) and Render (Backend) auto-deploy hooks tied to our GitHub `main` branch. A push to `main` triggers a live zero-downtime rebuild. We do not have automated testing blocking the deployment pipeline."

═══════════════════════════════════════════
## 5. Product / Impact Questions
═══════════════════════════════════════════

**Q: Who is ASHA Mode actually for, and why the stateless design?**
**A:** "ASHA Mode (`/asha`) is for rural Accredited Social Health Activists. It requires no login, uses high contrast, and maps just 6 simple physical inputs to our 15-feature model for a quick traffic-light triage. It's stateless because rural connectivity is patchy—if an ASHA worker loses signal, they shouldn't have to navigate auth sessions. They just fill the form, hit predict, and get the result."

**Q: Why is Demo Mode important beyond convenience?**
**A:** "Demo Mode (`/login` -> 'Try Demo') mocks the entire API layer directly in React session storage. Beyond UX, it eliminates the specific technical risk of the Render Free Tier 'cold start' (which takes up to 60 seconds to wake up). A judge can explore the entire app with zero network latency, regardless of backend status."

**Q: What's the actual real-world validation status?**
**A:** "Currently, zero. The models are trained on public datasets (BRFSS, UCI). We have not undergone clinical trials, FDA/CDSCO software-as-a-medical-device (SaMD) clearance, or validated the models against live local hospital data. It is currently a prototype demonstrating the *architecture* of explainable health AI."

═══════════════════════════════════════════
## 6. "Gotcha" / Weakness Questions (Be Brutally Honest)
═══════════════════════════════════════════

**Q: Is this a research contribution?**
**A:** "No. We did not invent a new ML algorithm. This is an applied engineering project. The innovation is in the system integration: combining predictive ML, SHAP explainability, and a responsive React architecture into a usable Digital Twin product."

**Q: What's the weakest part of this project?**
**A:** "There are three genuine weaknesses: 
1. **Dataset Size/Overfitting**: The Stress and Heart Disease models were trained on tiny datasets (< 400 rows), making them statistically unstable.
2. **Feature Mapping Proxies**: We unified 5 datasets to a single 15-field form. This required heavy approximation (e.g., mapping a 1-10 slider for 'dietary quality' to a binary 'eats veggies' feature). It introduces noise.
3. **No Temporal Modeling**: Our Monte Carlo forecast assumes health variables fluctuate independently from week to week, completely ignoring how habits compound over time."

**Q: If you had one more month, what would you fix first?**
**A:** "I would replace the small Heart and Stress datasets with larger, robust cohorts (like the UK Biobank) to fix the overfitting. Then, I would implement Celery for background asynchronous inference, preventing the FastAPI server from locking up under concurrent load."

═══════════════════════════════════════════
## 7. Live Demo Script (5 Minutes)
═══════════════════════════════════════════

1. **Login Page:** "Welcome to HealthTwin AI. We've built an explainable Digital Twin platform. Instead of logging in, I'll use the one-click Demo Mode so we don't have to fill out the 15-field form." *(Click Try Demo)*
2. **Results Reveal:** "Right after submission, the engine calculates risk across 5 major conditions and highlights the most critical insight—in this case, High Blood Pressure driven by physical activity." *(Click View Full Digital Twin)*
3. **Digital Twin Dashboard:** "Here is the Digital Twin. On the right, notice the SHAP impact bars. The AI isn't a black box; it explicitly tells the user that their low physical activity and high BMI are pushing their hypertension risk up." *(Navigate to Simulate)*
4. **Simulation Slider:** "This is the core feature. If I slide 'Physical Activity' up, watch the risk gauge. It recalculates the SHAP values in under 200 milliseconds via an in-memory diff engine, showing the user the exact ROI of exercising more." *(Move slider)*
5. **ASHA Mode:** "Finally, for rural healthcare access, we built ASHA Mode." *(Navigate to /asha)* "It strips away the complex UI, translates to Hindi, and reduces the form to 6 basic metrics an ASHA worker can collect in the field, instantly triaging the patient with a traffic-light system."
