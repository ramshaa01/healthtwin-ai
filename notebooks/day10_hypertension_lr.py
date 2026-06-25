import joblib
import numpy as np
import pandas as pd
import shap
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import os

os.makedirs('reports/shap', exist_ok=True)
RANDOM_STATE = 42
CV = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

X_train, X_test, y_train, y_test = joblib.load('data/processed/hypertension_splits.pkl')

feature_cols = ['Age', 'BMI', 'GenHlth', 'HighChol', 'Smoker',
                'HvyAlcoholConsump', 'PhysActivity', 'DiffWalk',
                'MentHlth', 'PhysHlth', 'Sex']

print("="*60)
print("DAY 10 — Logistic Regression Hypertension Tuning")
print("="*60)
print(f"Train size: {X_train.shape}, Test size: {X_test.shape}")

# ============================================================
# STEP 1: Hyperparameter search
# Key knobs for LR: C (inverse regularization strength),
# penalty type, and solver
# ============================================================
param_dist = {
    'C':        [0.001, 0.01, 0.1, 0.5, 1.0, 5.0, 10.0, 100.0],
    'penalty':  ['l1', 'l2'],
    'solver':   ['liblinear', 'saga'],
    'class_weight': [None, 'balanced'],
    'max_iter': [500, 1000, 2000]
}

search = RandomizedSearchCV(
    LogisticRegression(random_state=RANDOM_STATE),
    param_distributions=param_dist,
    n_iter=20,
    scoring='roc_auc',
    cv=CV,
    verbose=1,
    random_state=RANDOM_STATE,
    n_jobs=-1
)
search.fit(X_train, y_train)

print(f"\nBest parameters: {search.best_params_}")
print(f"Best CV ROC-AUC: {search.best_score_:.4f}")

# ============================================================
# STEP 2: Evaluate best model
# ============================================================
best_model = search.best_estimator_

y_pred = best_model.predict(X_test)
y_prob = best_model.predict_proba(X_test)[:, 1]

test_acc = accuracy_score(y_test, y_pred)
test_auc = roc_auc_score(y_test, y_prob)

print(f"\nFinal Test Accuracy: {test_acc:.4f}")
print(f"Final Test ROC-AUC:  {test_auc:.4f}")
print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
print("\nVS BASELINE:")
print(f"  Baseline Test Accuracy: 0.7227 | Tuned: {test_acc:.4f}")
print(f"  Baseline Test ROC-AUC:  0.7933 | Tuned: {test_auc:.4f}")

# Print model coefficients as a sanity check
coef_df = pd.Series(best_model.coef_[0], index=feature_cols).sort_values(ascending=False)
print("\nModel coefficients (positive = increases BP risk):")
print(coef_df)

# ============================================================
# STEP 3: SHAP for hypertension model
# Use LinearExplainer for Logistic Regression
# ============================================================
print("\n" + "="*60)
print("SHAP EXPLAINABILITY")
print("="*60)

explainer = shap.LinearExplainer(best_model, X_train,
                                  feature_perturbation="interventional")

X_test_df = pd.DataFrame(X_test, columns=feature_cols)
shap_values = explainer.shap_values(X_test_df)

mean_shap = pd.Series(
    np.abs(shap_values).mean(axis=0),
    index=feature_cols
).sort_values(ascending=False)

print("\nGlobal feature importance (mean |SHAP|) for hypertension:")
print(mean_shap)

plt.figure(figsize=(10, 6))
mean_shap.plot(kind='barh', color='steelblue')
plt.xlabel('Mean |SHAP value|')
plt.title('Hypertension Model — Global Feature Importance (SHAP)')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig('reports/shap/hypertension_shap_global.png')
plt.close()
print("Saved: reports/shap/hypertension_shap_global.png")

single_shap = pd.Series(shap_values[0], index=feature_cols).sort_values()
plt.figure(figsize=(10, 6))
colors = ['red' if v > 0 else 'green' for v in single_shap]
single_shap.plot(kind='barh', color=colors)
plt.axvline(0, color='black', linewidth=0.8)
plt.xlabel('SHAP value (impact on predicted hypertension risk)')
plt.title('Hypertension — Single Prediction Explanation (Test Row 0)')
plt.tight_layout()
plt.savefig('reports/shap/hypertension_shap_single_prediction.png')
plt.close()
print("Saved: reports/shap/hypertension_shap_single_prediction.png")

joblib.dump(best_model, 'models/tuned_hypertension_lr.pkl')
joblib.dump(explainer, 'models/explainer_hypertension.pkl')
print("Saved: models/tuned_hypertension_lr.pkl")
print("Saved: models/explainer_hypertension.pkl")

print("\n=== DAY 10 COMPLETE ===")
