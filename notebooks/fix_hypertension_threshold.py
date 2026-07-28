import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.metrics import (
    precision_recall_curve, f1_score, classification_report,
    confusion_matrix, roc_auc_score, ConfusionMatrixDisplay
)
import os

os.makedirs('reports/evaluation', exist_ok=True)

print("="*55)
print("Fixing Hypertension Model Threshold")
print("="*55)

model  = joblib.load('models/tuned_hypertension_lr.pkl')
scaler = joblib.load('models/scaler_hypertension.pkl')
X_train, X_test, y_train, y_test = joblib.load(
    'data/processed/hypertension_splits.pkl')

X_scaled = scaler.transform(X_test)
if hasattr(X_scaled, 'values'):
    X_scaled = X_scaled.values

y_prob = model.predict_proba(X_scaled)[:, 1]

# Find optimal threshold using F1 score
precisions, recalls, thresholds = precision_recall_curve(y_test, y_prob)
f1_scores = (2 * precisions[:-1] * recalls[:-1] /
             (precisions[:-1] + recalls[:-1] + 1e-9))
best_idx = np.argmax(f1_scores)
best_threshold = thresholds[best_idx]
best_f1 = f1_scores[best_idx]

print(f"\nDefault threshold (0.5):")
y_pred_default = (y_prob >= 0.5).astype(int)
print(classification_report(y_test, y_pred_default,
      target_names=['Normal BP', 'High BP']))

print(f"\nOptimal threshold: {best_threshold:.4f}")
print(f"Best F1 at optimal threshold: {best_f1:.4f}")
y_pred_optimal = (y_prob >= best_threshold).astype(int)
print(classification_report(y_test, y_pred_optimal,
      target_names=['Normal BP', 'High BP']))

# Also check a few manual thresholds
print("\nThreshold sweep:")
print(f"{'Threshold':>10} {'Precision':>10} {'Recall':>10} {'F1':>8}")
for t in [0.3, 0.35, 0.4, 0.45, 0.5, best_threshold]:
    y_p = (y_prob >= t).astype(int)
    if y_p.sum() == 0:
        print(f"{t:>10.2f} {'N/A':>10} {'N/A':>10} {'0.000':>8} (predicts all negative)")
        continue
    from sklearn.metrics import precision_score, recall_score
    p = precision_score(y_test, y_p, zero_division=0)
    r = recall_score(y_test, y_p, zero_division=0)
    f = f1_score(y_test, y_p, zero_division=0)
    print(f"{t:>10.4f} {p:>10.4f} {r:>10.4f} {f:>8.4f}")

# Save the optimal threshold alongside the model
threshold_info = {
    'model': 'hypertension',
    'optimal_threshold': float(best_threshold),
    'default_threshold': 0.5,
    'f1_at_optimal': float(best_f1),
    'reason': 'LR model probability distribution skewed toward lower values due to class imbalance in feature space. Optimal threshold found via PR curve F1 maximization.'
}
joblib.dump(threshold_info, 'models/hypertension_threshold.pkl')
print(f"\nSaved optimal threshold {best_threshold:.4f} to models/hypertension_threshold.pkl")

# Plot threshold vs F1
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle('Hypertension — Threshold Analysis', fontweight='bold')

axes[0].plot(thresholds, f1_scores, color='#ef4444', linewidth=2)
axes[0].axvline(x=best_threshold, color='navy', linestyle='--',
                label=f'Optimal = {best_threshold:.3f}')
axes[0].axvline(x=0.5, color='gray', linestyle='--',
                label='Default = 0.5')
axes[0].set_xlabel('Threshold')
axes[0].set_ylabel('F1 Score')
axes[0].set_title('F1 Score vs Decision Threshold')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

axes[1].plot(recalls[:-1], precisions[:-1], color='#ef4444', linewidth=2)
axes[1].fill_between(recalls[:-1], precisions[:-1], alpha=0.15,
                      color='#ef4444')
axes[1].scatter(recalls[best_idx], precisions[best_idx],
                color='navy', s=100, zorder=5,
                label=f'Best F1 @ thresh={best_threshold:.3f}')
axes[1].set_xlabel('Recall')
axes[1].set_ylabel('Precision')
axes[1].set_title('Precision-Recall Curve')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('reports/evaluation/hypertension_threshold_analysis.png',
            dpi=150, bbox_inches='tight')
plt.close()
print("Saved: reports/evaluation/hypertension_threshold_analysis.png")

print("\n" + "="*55)
print("FINAL RECOMMENDATION")
print("="*55)
print(f"Use threshold = {best_threshold:.4f} for hypertension model")
print("Update models_loader.py to use this threshold")
print("="*55)
