import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from sklearn.metrics import (
    confusion_matrix, classification_report,
    precision_recall_curve, average_precision_score,
    roc_curve, roc_auc_score, ConfusionMatrixDisplay
)
import os

os.makedirs('reports/evaluation', exist_ok=True)

MODELS = {
    'diabetes': {
        'model':  'models/tuned_diabetes_xgboost.pkl',
        'splits': 'data/processed/diabetes_splits.pkl',
        'label':  'Type 2 Diabetes',
        'algo':   'XGBoost',
        'color':  '#3b82f6',
        'classes': ['No Diabetes', 'Diabetes']
    },
    'hypertension': {
        'model':  'models/tuned_hypertension_lr.pkl',
        'splits': 'data/processed/hypertension_splits.pkl',
        'scaler': 'models/scaler_hypertension.pkl',
        'label':  'Hypertension',
        'algo':   'Logistic Regression',
        'color':  '#ef4444',
        'classes': ['Normal BP', 'High BP']
    },
    'heart': {
        'model':  'models/tuned_heart_rf.pkl',
        'splits': 'data/processed/heart_splits.pkl',
        'label':  'Heart Disease',
        'algo':   'Random Forest',
        'color':  '#f97316',
        'classes': ['No Disease', 'Disease']
    },
    'obesity': {
        'model':  'models/tuned_obesity_gb.pkl',
        'splits': 'data/processed/obesity_splits.pkl',
        'label':  'Obesity',
        'algo':   'Gradient Boosting',
        'color':  '#a855f7',
        'classes': ['Not At Risk', 'At Risk']
    },
    'stress': {
        'model':  'models/tuned_stress_dt.pkl',
        'splits': 'data/processed/stress_splits.pkl',
        'label':  'Mental Stress',
        'algo':   'Decision Tree',
        'color':  '#ec4899',
        'classes': ['Low Stress', 'High Stress']
    }
}

results_summary = []

for condition, cfg in MODELS.items():
    print(f"\nProcessing {cfg['label']}...")

    model = joblib.load(cfg['model'])
    X_train, X_test, y_train, y_test = joblib.load(cfg['splits'])

    # Apply scaler if needed (hypertension only)
    if 'scaler' in cfg:
        scaler = joblib.load(cfg['scaler'])
        X_input = scaler.transform(X_test)
    else:
        X_input = X_test

    # Convert to array if needed
    if hasattr(X_input, 'values'):
        X_input = X_input.values

    y_pred = model.predict(X_input)
    y_prob = model.predict_proba(X_input)[:, 1]

    # ── Metrics ──────────────────────────────────────────
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1        = (2 * precision * recall / (precision + recall)
                 if (precision + recall) > 0 else 0)
    auc       = roc_auc_score(y_test, y_prob)
    ap        = average_precision_score(y_test, y_prob)
    accuracy  = (tp + tn) / len(y_test)
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0

    print(f"  Accuracy:    {accuracy:.4f}")
    print(f"  Precision:   {precision:.4f}")
    print(f"  Recall:      {recall:.4f}")
    print(f"  F1 Score:    {f1:.4f}")
    print(f"  ROC-AUC:     {auc:.4f}")
    print(f"  Avg Precision: {ap:.4f}")
    print(f"  Specificity: {specificity:.4f}")
    print(classification_report(y_test, y_pred,
          target_names=cfg['classes']))

    results_summary.append({
        'Condition':  cfg['label'],
        'Algorithm':  cfg['algo'],
        'Accuracy':   round(accuracy,  4),
        'Precision':  round(precision, 4),
        'Recall':     round(recall,    4),
        'F1 Score':   round(f1,        4),
        'ROC-AUC':    round(auc,       4),
        'Avg Precision': round(ap,     4),
        'Specificity': round(specificity, 4),
        'TP': int(tp), 'TN': int(tn),
        'FP': int(fp), 'FN': int(fn)
    })

    # ── Figure: 3 plots side by side ─────────────────────
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    fig.suptitle(f'{cfg["label"]} ({cfg["algo"]})',
                 fontsize=14, fontweight='bold', y=1.02)

    # Plot 1 — Confusion Matrix
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=cfg['classes']
    )
    disp.plot(ax=axes[0], colorbar=False,
              cmap='Blues', values_format='d')
    axes[0].set_title('Confusion Matrix', fontweight='bold')
    axes[0].set_xlabel('Predicted Label')
    axes[0].set_ylabel('True Label')

    # Add percentage annotations
    total = cm.sum()
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            pct = cm[i,j] / total * 100
            axes[0].text(j, i + 0.35,
                         f'({pct:.1f}%)',
                         ha='center', va='center',
                         fontsize=9, color='gray')

    # Plot 2 — Precision-Recall Curve
    precisions, recalls, thresholds = precision_recall_curve(
        y_test, y_prob)
    axes[1].plot(recalls, precisions,
                 color=cfg['color'], linewidth=2.5,
                 label=f'AP = {ap:.3f}')
    axes[1].fill_between(recalls, precisions,
                          alpha=0.15, color=cfg['color'])
    axes[1].axhline(y=sum(y_test)/len(y_test),
                    color='gray', linestyle='--', linewidth=1,
                    label='Baseline (random)')
    axes[1].set_xlabel('Recall (Sensitivity)')
    axes[1].set_ylabel('Precision')
    axes[1].set_title('Precision-Recall Curve', fontweight='bold')
    axes[1].legend(loc='upper right', fontsize=9)
    axes[1].set_xlim([0, 1])
    axes[1].set_ylim([0, 1.05])
    axes[1].grid(True, alpha=0.3)

    # Annotate best F1 threshold
    f1_scores = (2 * precisions[:-1] * recalls[:-1] /
                 (precisions[:-1] + recalls[:-1] + 1e-9))
    best_idx = np.argmax(f1_scores)
    axes[1].annotate(
        f'Best F1={f1_scores[best_idx]:.3f}\n'
        f'@thresh={thresholds[best_idx]:.2f}',
        xy=(recalls[best_idx], precisions[best_idx]),
        xytext=(recalls[best_idx]+0.05, precisions[best_idx]-0.15),
        fontsize=8, color=cfg['color'],
        arrowprops=dict(arrowstyle='->', color=cfg['color'])
    )

    # Plot 3 — ROC Curve
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    axes[2].plot(fpr, tpr, color=cfg['color'],
                 linewidth=2.5, label=f'AUC = {auc:.3f}')
    axes[2].fill_between(fpr, tpr, alpha=0.15, color=cfg['color'])
    axes[2].plot([0, 1], [0, 1], 'k--',
                 linewidth=1, label='Random (AUC=0.5)')
    axes[2].set_xlabel('False Positive Rate (1-Specificity)')
    axes[2].set_ylabel('True Positive Rate (Sensitivity)')
    axes[2].set_title('ROC Curve', fontweight='bold')
    axes[2].legend(loc='lower right', fontsize=9)
    axes[2].set_xlim([0, 1])
    axes[2].set_ylim([0, 1.05])
    axes[2].grid(True, alpha=0.3)

    # Metrics text box
    metrics_text = (
        f"Accuracy:    {accuracy:.3f}\n"
        f"Precision:   {precision:.3f}\n"
        f"Recall:      {recall:.3f}\n"
        f"F1 Score:    {f1:.3f}\n"
        f"Specificity: {specificity:.3f}"
    )
    fig.text(0.5, -0.02, metrics_text,
             ha='center', fontsize=9,
             bbox=dict(boxstyle='round', facecolor='lightyellow',
                       alpha=0.8))

    plt.tight_layout()
    save_path = f'reports/evaluation/{condition}_evaluation.png'
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {save_path}")

# ── Combined summary figure ───────────────────────────────
print("\nGenerating combined comparison figure...")

fig, axes = plt.subplots(2, 3, figsize=(18, 11))
fig.suptitle('HealthTwin AI — All Models Evaluation Summary',
             fontsize=16, fontweight='bold')
axes_flat = axes.flatten()

for idx, (condition, cfg) in enumerate(MODELS.items()):
    ax = axes_flat[idx]
    model = joblib.load(cfg['model'])
    _, X_test, _, y_test = joblib.load(cfg['splits'])

    if 'scaler' in cfg:
        scaler = joblib.load(cfg['scaler'])
        X_input = scaler.transform(X_test)
    else:
        X_input = X_test
    if hasattr(X_input, 'values'):
        X_input = X_input.values

    y_prob = model.predict_proba(X_input)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    auc = roc_auc_score(y_test, y_prob)

    ax.plot(fpr, tpr, color=cfg['color'], linewidth=2.5,
            label=f'AUC = {auc:.3f}')
    ax.fill_between(fpr, tpr, alpha=0.15, color=cfg['color'])
    ax.plot([0,1],[0,1],'k--',linewidth=1,alpha=0.5)
    ax.set_title(f"{cfg['label']}\n({cfg['algo']})",
                 fontweight='bold', fontsize=11)
    ax.set_xlabel('FPR', fontsize=9)
    ax.set_ylabel('TPR', fontsize=9)
    ax.legend(fontsize=9)
    ax.grid(True, alpha=0.3)
    ax.set_xlim([0,1])
    ax.set_ylim([0,1.05])

# Hide 6th subplot
axes_flat[5].axis('off')

# Add summary table in 6th slot
results_df = pd.DataFrame(results_summary)
table_data = results_df[['Condition','Accuracy','F1 Score',
                          'ROC-AUC','Recall']].values
col_labels = ['Condition','Accuracy','F1','AUC','Recall']
table = axes_flat[5].table(
    cellText=table_data,
    colLabels=col_labels,
    loc='center', cellLoc='center'
)
table.auto_set_font_size(False)
table.set_fontsize(9)
table.scale(1.2, 1.8)
axes_flat[5].set_title('Performance Summary',
                        fontweight='bold', fontsize=11)
axes_flat[5].axis('off')

plt.tight_layout()
plt.savefig('reports/evaluation/all_models_roc_comparison.png',
            dpi=150, bbox_inches='tight')
plt.close()
print("Saved: reports/evaluation/all_models_roc_comparison.png")

# ── Save full metrics CSV ─────────────────────────────────
results_df = pd.DataFrame(results_summary)
results_df.to_csv('reports/evaluation/full_metrics.csv', index=False)
print("\nSaved: reports/evaluation/full_metrics.csv")

print("\n" + "="*55)
print("COMPLETE METRICS TABLE")
print("="*55)
print(results_df[['Condition','Accuracy','Precision',
                   'Recall','F1 Score','ROC-AUC',
                   'Avg Precision']].to_string(index=False))
print("="*55)
print(f"\nAll evaluation files saved in reports/evaluation/")
print("Files generated:")
print("  - diabetes_evaluation.png")
print("  - hypertension_evaluation.png")
print("  - heart_evaluation.png")
print("  - obesity_evaluation.png")
print("  - stress_evaluation.png")
print("  - all_models_roc_comparison.png")
print("  - full_metrics.csv")
