import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
 
def plot_correlation_heatmap(df, save_path, title):
    corr = df.corr(numeric_only=True)
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr, annot=False, cmap='coolwarm', center=0)
    plt.title(title)
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    return corr
 
def print_top_correlations(corr, target_col, n=10):
    top = corr[target_col].abs().sort_values(ascending=False)
    top = top[top.index != target_col].head(n)
    print(f"\nTop {n} features correlated with {target_col}:")
    print(top)
    return top
 
def plot_histograms(df, cols, save_path, title_prefix):
    n = len(cols)
    ncols = 3
    nrows = (n + ncols - 1) // ncols
    fig, axes = plt.subplots(nrows=nrows, ncols=ncols, figsize=(15, 4 * nrows))
    axes = axes.flatten()
    for i, col in enumerate(cols):
        df[col].hist(ax=axes[i], bins=20, edgecolor='black')
        axes[i].set_title(f"{title_prefix}: {col}")
    for j in range(i + 1, len(axes)):
        fig.delaxes(axes[j])
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
 
# ============================================================
# 1. DIABETES / HYPERTENSION
# ============================================================
print("=" * 60)
print("DIABETES / HYPERTENSION")
print("=" * 60)
diabetes_df = pd.read_csv('data/diabetes/cleaned_diabetes_brfss.csv')
print(diabetes_df.describe())
 
hist_cols = ['BMI', 'MentHlth', 'PhysHlth', 'GenHlth', 'Age', 'Education', 'Income']
plot_histograms(diabetes_df, hist_cols, 'reports/eda/diabetes/histograms.png', 'Diabetes')
 
corr = plot_correlation_heatmap(diabetes_df, 'reports/eda/diabetes/correlation_heatmap.png',
                                  'Diabetes/Hypertension Feature Correlations')
top_diabetes = print_top_correlations(corr, 'Diabetes_binary')
top_bp = print_top_correlations(corr, 'HighBP')
corr.to_csv('reports/eda/diabetes/correlation_matrix.csv')
 
# ============================================================
# 2. HEART DISEASE (using the restricted self-reportable feature set)
# ============================================================
print("\n" + "=" * 60)
print("HEART DISEASE (restricted feature set)")
print("=" * 60)
heart_df = pd.read_csv('data/heart/cleaned_heart_restricted.csv')
print(heart_df.describe())
 
hist_cols = ['age', 'trestbps', 'chol']
plot_histograms(heart_df, hist_cols, 'reports/eda/heart/histograms.png', 'Heart')
 
corr = plot_correlation_heatmap(heart_df, 'reports/eda/heart/correlation_heatmap.png',
                                  'Heart Disease Feature Correlations (Restricted Set)')
top_heart = print_top_correlations(corr, 'heart_disease_binary')
corr.to_csv('reports/eda/heart/correlation_matrix.csv')
 
# ============================================================
# 3. OBESITY
# ============================================================
print("\n" + "=" * 60)
print("OBESITY")
print("=" * 60)
obesity_df = pd.read_csv('data/obesity/cleaned_obesity.csv')
print(obesity_df.describe())
 
# Quick binary encoding for correlation purposes only (not the final training encoding)
obesity_corr_df = obesity_df.copy()
yes_no_cols = ['family_history_with_overweight', 'FAVC', 'SMOKE', 'SCC']
for col in yes_no_cols:
    obesity_corr_df[col] = obesity_corr_df[col].map({'yes': 1, 'no': 0})
obesity_corr_df['Gender'] = obesity_corr_df['Gender'].map({'Male': 1, 'Female': 0})
 
hist_cols = ['Age', 'BMI', 'FCVC', 'NCP', 'CH2O', 'FAF', 'TUE']
plot_histograms(obesity_df, hist_cols, 'reports/eda/obesity/histograms.png', 'Obesity')
 
corr = plot_correlation_heatmap(obesity_corr_df, 'reports/eda/obesity/correlation_heatmap.png',
                                  'Obesity Feature Correlations')
top_obesity = print_top_correlations(corr, 'obesity_risk')
corr.to_csv('reports/eda/obesity/correlation_matrix.csv')
 
# ============================================================
# 4. STRESS
# ============================================================
print("\n" + "=" * 60)
print("STRESS")
print("=" * 60)
stress_df = pd.read_csv('data/stress/cleaned_stress.csv')
print(stress_df.describe())
 
stress_corr_df = stress_df.copy()
stress_corr_df['Gender'] = stress_corr_df['Gender'].map({'Male': 1, 'Female': 0})
 
hist_cols = ['Age', 'Sleep Duration', 'Quality of Sleep', 'Physical Activity Level', 'systolic_bp']
plot_histograms(stress_df, hist_cols, 'reports/eda/stress/histograms.png', 'Stress')
 
corr = plot_correlation_heatmap(stress_corr_df, 'reports/eda/stress/correlation_heatmap.png',
                                  'Stress Feature Correlations')
top_stress = print_top_correlations(corr, 'high_stress')
corr.to_csv('reports/eda/stress/correlation_matrix.csv')
 
print("\n=== DAY 4 EDA COMPLETE ===")
print("All heatmaps, histograms, and correlation CSVs saved under reports/eda/")
