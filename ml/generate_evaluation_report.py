"""
HealthTwin AI — Model Evaluation Report Generator
==================================================
Standalone script (NOT part of the live FastAPI backend).
Run manually from project root: python ml/generate_evaluation_report.py

Loads each trained model + its pre-split test set, computes:
  - Confusion matrix
  - Precision / Recall / F1 per class
  - ROC-AUC score
  - ROC curve

Outputs to ml/evaluation_report/:
  - confusion_<model>.png  (one per model)
  - roc_curves_combined.png (all 5 on one figure)
  - summary_table.png
  - SUMMARY.md
"""

import os, sys, warnings
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")           # headless — no GUI needed
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from sklearn.metrics import (
    confusion_matrix, classification_report,
    roc_auc_score, roc_curve,
    precision_score, recall_score, f1_score
)

warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "ml", "evaluation_report")
os.makedirs(OUT, exist_ok=True)

SPLITS_DIR = os.path.join(ROOT, "data", "processed")
MODELS_DIR = os.path.join(ROOT, "models")

# ── Model definitions (mirrors models_loader.py) ─────────────────────────────
MODELS = {
    "diabetes":     "tuned_diabetes_xgboost.pkl",
    "hypertension": "tuned_hypertension_lr.pkl",
    "heart":        "tuned_heart_rf.pkl",
    "obesity":      "tuned_obesity_gb.pkl",
    "stress":       "tuned_stress_dt.pkl",
}

SPLITS = {
    "diabetes":     "diabetes_splits.pkl",
    "hypertension": "hypertension_splits.pkl",
    "heart":        "heart_splits.pkl",
    "obesity":      "obesity_splits.pkl",
    "stress":       "stress_splits.pkl",
}

# ── Known caveats for SUMMARY.md ─────────────────────────────────────────────
CAVEATS = {
    "diabetes": (
        "BRFSS dataset, large and balanced via SMOTE. "
        "Generalizes well to the Indian population only if adjusted for BMI/dietary thresholds. "
        "No major overfitting concerns given dataset size (~253,680 rows after resampling)."
    ),
    "hypertension": (
        "Logistic Regression on BRFSS data (~253,680 rows). "
        "A custom optimal threshold is applied at inference to compensate for class imbalance. "
        "Model is stable but slightly under-powered compared to tree-based alternatives."
    ),
    "heart": (
        "⚠️  SMALL DATASET WARNING: UCI Cleveland Heart Disease dataset, only 303 rows total "
        "(≈60 rows in test split). Results carry high variance — a single mis-classified patient "
        "shifts F1 by 1–2 percentage points. AUC is directionally correct but confidence intervals "
        "are wide. Treat these numbers as indicative, not precise."
    ),
    "obesity": (
        "Multi-label Obesity dataset (~20,758 rows after cleaning). Gradient Boosting model "
        "performs well. Binary label derived from OB_TYPE ∈ {Obesity_I, Obesity_II, Obesity_III}. "
        "No major overfitting concerns."
    ),
    "stress": (
        "⚠️  LIKELY OVERFITTING WARNING: Sleep Health & Lifestyle dataset — only 374 rows total "
        "(≈74 rows in test split). Decision Tree at max_depth=4 reports AUC ≈ 0.99 on this tiny "
        "test set. This is almost certainly overfitted and will not generalize well to unseen "
        "populations. The model should be treated as a demonstrative placeholder. "
        "Recommended fix before production: collect more data, apply cross-validation, and switch "
        "to a regularized model (GBM, LR)."
    ),
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def load_split(condition):
    path = os.path.join(SPLITS_DIR, SPLITS[condition])
    splits = joblib.load(path)
    # All splits files store a tuple: (X_train, X_test, y_train, y_test)
    X_test = splits[1]
    y_test  = splits[3]
    return X_test, y_test

def load_model(condition):
    path = os.path.join(MODELS_DIR, MODELS[condition])
    model = joblib.load(path)
    # For hypertension, also load scaler
    if condition == "hypertension":
        scaler = joblib.load(os.path.join(MODELS_DIR, "scaler_hypertension.pkl"))
        return model, scaler
    return model, None

def evaluate(condition):
    print(f"\n  [{condition.upper()}]")
    X_test, y_test = load_split(condition)
    model, scaler  = load_model(condition)

    # Coerce y_test to binary int
    y_test = np.array(y_test).astype(int).ravel()

    # Ensure X_test is a numpy array or DataFrame (consistent)
    if scaler is not None:
        X_test = scaler.transform(X_test)

    y_prob = model.predict_proba(X_test)[:, 1]

    # For hypertension: use optimal threshold if available
    if condition == "hypertension":
        try:
            thresh_info = joblib.load(os.path.join(MODELS_DIR, "hypertension_threshold.pkl"))
            thresh = thresh_info["optimal_threshold"]
        except Exception:
            thresh = 0.5
    else:
        thresh = 0.5

    y_pred = (y_prob >= thresh).astype(int)

    auc      = roc_auc_score(y_test, y_prob)
    prec     = precision_score(y_test, y_pred, zero_division=0)
    rec      = recall_score(y_test, y_pred, zero_division=0)
    f1       = f1_score(y_test, y_pred, zero_division=0)
    cm       = confusion_matrix(y_test, y_pred)
    fpr, tpr, _ = roc_curve(y_test, y_prob)

    n_test   = len(y_test)
    n_pos    = int(y_test.sum())

    print(f"    n_test={n_test}  positives={n_pos}  AUC={auc:.4f}  P={prec:.3f}  R={rec:.3f}  F1={f1:.3f}")

    return {
        "condition": condition, "n_test": n_test, "n_pos": n_pos,
        "auc": auc, "precision": prec, "recall": rec, "f1": f1,
        "cm": cm, "fpr": fpr, "tpr": tpr,
    }

# ── Confusion matrix plots ────────────────────────────────────────────────────
def plot_confusion(result):
    cm = result["cm"]
    fig, ax = plt.subplots(figsize=(4, 3.5))
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    plt.colorbar(im, ax=ax)
    classes = ["Negative", "Positive"]
    ax.set(xticks=[0,1], yticks=[0,1],
           xticklabels=classes, yticklabels=classes,
           xlabel="Predicted", ylabel="True",
           title=f"{result['condition'].title()} — Confusion Matrix\n"
                 f"(n_test={result['n_test']}, AUC={result['auc']:.3f})")
    thresh_cm = cm.max() / 2
    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center",
                    color="white" if cm[i,j] > thresh_cm else "black", fontsize=14, fontweight="bold")
    plt.tight_layout()
    path = os.path.join(OUT, f"confusion_{result['condition']}.png")
    plt.savefig(path, dpi=120)
    plt.close()
    print(f"    -> saved: {path}")

# ── Combined ROC curve ────────────────────────────────────────────────────────
COLORS = {"diabetes":"#3b82f6","hypertension":"#ef4444","heart":"#f59e0b","obesity":"#10b981","stress":"#8b5cf6"}

def plot_roc_combined(results):
    fig, ax = plt.subplots(figsize=(7, 6))
    for r in results:
        ax.plot(r["fpr"], r["tpr"], lw=2,
                color=COLORS[r["condition"]],
                label=f"{r['condition'].title()} (AUC={r['auc']:.3f})")
    ax.plot([0,1],[0,1],"k--", lw=1, alpha=0.4)
    ax.set(xlabel="False Positive Rate", ylabel="True Positive Rate",
           title="ROC Curves — All 5 Models",
           xlim=[-0.02, 1.02], ylim=[-0.02, 1.05])
    ax.legend(loc="lower right", fontsize=9)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    path = os.path.join(OUT, "roc_curves_combined.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  -> saved: {path}")

# ── Summary table image ───────────────────────────────────────────────────────
def plot_summary_table(results):
    rows = []
    for r in results:
        rows.append([
            r["condition"].title(),
            str(r["n_test"]),
            f"{r['precision']:.3f}",
            f"{r['recall']:.3f}",
            f"{r['f1']:.3f}",
            f"{r['auc']:.4f}",
        ])

    col_labels = ["Model", "Test n", "Precision", "Recall", "F1", "ROC-AUC"]
    fig, ax = plt.subplots(figsize=(9, 2.8))
    ax.axis("off")
    tbl = ax.table(cellText=rows, colLabels=col_labels,
                   cellLoc="center", loc="center",
                   bbox=[0, 0, 1, 1])
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(11)
    for (row, col), cell in tbl.get_celld().items():
        if row == 0:
            cell.set_facecolor("#1e40af")
            cell.set_text_props(color="white", fontweight="bold")
        elif row % 2 == 0:
            cell.set_facecolor("#f0f4ff")
    fig.suptitle("HealthTwin AI — Evaluation Summary", fontweight="bold", fontsize=13, y=1.02)
    plt.tight_layout()
    path = os.path.join(OUT, "summary_table.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  -> saved: {path}")

# ── SUMMARY.md ────────────────────────────────────────────────────────────────
def write_summary_md(results):
    lines = [
        "# HealthTwin AI — Model Evaluation Summary",
        "",
        "> Generated by `ml/generate_evaluation_report.py`  ",
        "> Do **not** edit manually — re-run the script to regenerate.",
        "",
        "## Metrics Table",
        "",
        "| Model | Test n | Precision | Recall | F1 | ROC-AUC |",
        "|-------|--------|-----------|--------|----|---------|",
    ]
    for r in results:
        lines.append(
            f"| {r['condition'].title()} | {r['n_test']} "
            f"| {r['precision']:.3f} | {r['recall']:.3f} "
            f"| {r['f1']:.3f} | {r['auc']:.4f} |"
        )

    lines += [
        "",
        "## Confusion Matrices",
        "",
        *[f"![{r['condition']} CM](confusion_{r['condition']}.png)" for r in results],
        "",
        "## ROC Curves",
        "",
        "![Combined ROC](roc_curves_combined.png)",
        "",
        "---",
        "",
        "## Per-Model Notes",
        "",
    ]
    for condition, note in CAVEATS.items():
        lines.append(f"### {condition.title()}")
        lines.append(note)
        lines.append("")

    path = os.path.join(OUT, "SUMMARY.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  -> saved: {path}")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("HealthTwin AI — Evaluation Report Generator")
    print("=" * 60)
    print(f"Output directory: {OUT}")

    results = []
    for condition in MODELS:
        try:
            results.append(evaluate(condition))
        except Exception as ex:
            print(f"  ERROR evaluating {condition}: {ex}")
            import traceback; traceback.print_exc()

    if not results:
        print("\nNo results generated — check errors above.")
        sys.exit(1)

    print("\nGenerating plots...")
    for r in results:
        plot_confusion(r)

    plot_roc_combined(results)
    plot_summary_table(results)
    write_summary_md(results)

    print("\n" + "=" * 60)
    print("SUCCESS: Evaluation report complete!")
    print(f"SUCCESS: Files in: {OUT}")
    print("=" * 60)
    print("\nFiles generated:")
    for f in sorted(os.listdir(OUT)):
        fpath = os.path.join(OUT, f)
        size  = os.path.getsize(fpath)
        print(f"  {f:<40} ({size:,} bytes)")
