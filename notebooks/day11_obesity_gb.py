import joblib
import numpy as np
import pandas as pd
import shap
# import matplotlib
# matplotlib.use('Agg')
# import matplotlib.pyplot as plt
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import os

os.makedirs('reports/shap', exist_ok=True)
RANDOM_STATE = 42
CV = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

X_train, X_test, y_train, y_test = joblib.load('data/processed/obesity_splits.pkl')
feature_cols = joblib.load('models/obesity_feature_cols.pkl')

print("="*60)
print("DAY 11 — Gradient Boosting Obesity Tuning")
print("="*60)
print(f"Train size: {X_train.shape}, Test size: {X_test.shape}")
print(f"Features ({len(feature_cols)}): {feature_cols}")
print("Note: BMI, Height, Weight removed on Day 7 to fix data leakage")

# ============================================================
# STEP 1: Hyperparameter search
# ============================================================
param_dist = {
    'n_estimators':   [100, 200, 300, 500],
    'max_depth':      [2, 3, 4, 5],
    'learning_rate':  [0.01, 0.05, 0.1, 0.2],
    'subsample':      [0.7, 0.8, 0.9, 1.0],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf':  [1, 2, 4],
    'max_features':   ['sqrt', 'log2', None]
}

search = RandomizedSearchCV(
    GradientBoostingClassifier(random_state=RANDOM_STATE),
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
print("\nVS BASELINE (post leakage-fix):")
print(f"  Expected honest accuracy range: 75-90%")
print(f"  Achieved: {test_acc:.4f} accuracy, {test_auc:.4f} AUC")

# ============================================================
# STEP 3: SHAP for obesity model
# ============================================================
print("\n" + "="*60)
print("SHAP EXPLAINABILITY")
print("="*60)

explainer = shap.TreeExplainer(best_model)

if hasattr(X_test, 'values'):
    X_test_arr = X_test.values
else:
    X_test_arr = X_test

X_test_df = pd.DataFrame(X_test_arr, columns=feature_cols)
shap_values = explainer.shap_values(X_test_df)

mean_shap = pd.Series(
    np.abs(shap_values).mean(axis=0),
    index=feature_cols
).sort_values(ascending=False)

print("\nGlobal feature importance (mean |SHAP|) for obesity:")
print(mean_shap)

# Show top 10 only in chart for readability
top10 = mean_shap.head(10)
# plt.figure(figsize=(10, 6))
# top10.plot(kind='barh', color='steelblue')
# plt.xlabel('Mean |SHAP value|')
# plt.title('Obesity Model — Top 10 Feature Importance (SHAP)')
# plt.gca().invert_yaxis()
# plt.tight_layout()
# plt.savefig('reports/shap/obesity_shap_global.png')
# plt.close()
# print("Saved: reports/shap/obesity_shap_global.png")

single_shap = pd.Series(shap_values[0], index=feature_cols).sort_values()
# plt.figure(figsize=(10, 6))
# colors = ['red' if v > 0 else 'green' for v in single_shap]
# single_shap.plot(kind='barh', color=colors)
# plt.axvline(0, color='black', linewidth=0.8)
# plt.xlabel('SHAP value (impact on predicted obesity risk)')
# plt.title('Obesity — Single Prediction Explanation (Test Row 0)')
# plt.tight_layout()
# plt.savefig('reports/shap/obesity_shap_single_prediction.png')
# plt.close()
# print("Saved: reports/shap/obesity_shap_single_prediction.png")

joblib.dump(best_model, 'models/tuned_obesity_gb.pkl')
joblib.dump(explainer, 'models/explainer_obesity.pkl')
print("Saved: models/tuned_obesity_gb.pkl")
print("Saved: models/explainer_obesity.pkl")

print("\n=== DAY 11 COMPLETE ===")
print("Honest obesity model trained without leakage features")
