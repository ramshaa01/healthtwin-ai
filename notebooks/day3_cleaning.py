import pandas as pd
import numpy as np
import os

# ============================================================
# 1. DIABETES / HYPERTENSION (BRFSS) — already clean, just verify
# ============================================================
diabetes_df = pd.read_csv('data/diabetes/diabetes_brfss.csv')
print("=== Diabetes/Hypertension ===")
print("Missing values:\n", diabetes_df.isnull().sum().sum(), "total")
print("Diabetes_binary distribution:\n", diabetes_df['Diabetes_binary'].value_counts())
print("HighBP distribution:\n", diabetes_df['HighBP'].value_counts())
diabetes_df.to_csv('data/diabetes/cleaned_diabetes_brfss.csv', index=False)
print("Saved cleaned_diabetes_brfss.csv\n")

# ============================================================
# 2. HEART DISEASE — fix '?' missing values, binarize target,
#    restrict to self-reportable features
# ============================================================
heart_df = pd.read_csv('data/heart/heart_uci.csv')
print("=== Heart Disease (before cleaning) ===")
print("Missing values per column:\n", heart_df.isnull().sum())

# 'ca' and 'thal' sometimes contain '?' instead of NaN — force numeric conversion
heart_df['ca'] = pd.to_numeric(heart_df['ca'], errors='coerce')
heart_df['thal'] = pd.to_numeric(heart_df['thal'], errors='coerce')

# Impute: ca (numeric) with median, thal (categorical-as-numeric) with mode
heart_df['ca'] = heart_df['ca'].fillna(heart_df['ca'].median())
heart_df['thal'] = heart_df['thal'].fillna(heart_df['thal'].mode()[0])

# Binarize target: 0 = no disease, 1-4 -> 1 = disease present
heart_df['heart_disease_binary'] = (heart_df['num'] > 0).astype(int)
print("Binarized target distribution:\n", heart_df['heart_disease_binary'].value_counts())

# Save FULL cleaned version (all features, for reference/future use)
heart_df.to_csv('data/heart/cleaned_heart_full.csv', index=False)

# Save RESTRICTED version: only self-reportable fields, used for actual training
self_reportable_cols = ['age', 'sex', 'trestbps', 'chol', 'fbs', 'heart_disease_binary']
heart_restricted_df = heart_df[self_reportable_cols].copy()
heart_restricted_df.to_csv('data/heart/cleaned_heart_restricted.csv', index=False)
print("Saved cleaned_heart_full.csv and cleaned_heart_restricted.csv")
print("Restricted columns used for training:", self_reportable_cols, "\n")

# ============================================================
# 3. OBESITY — compute real BMI, binarize target
# ============================================================
obesity_df = pd.read_csv('data/obesity/obesity_uci.csv')
print("=== Obesity ===")
print("Missing values:\n", obesity_df.isnull().sum().sum(), "total")

# Height is in meters, Weight in kg in this dataset
obesity_df['BMI'] = obesity_df['Weight'] / (obesity_df['Height'] ** 2)

# Binarize 7-class target into obesity risk
not_at_risk = ['Insufficient_Weight', 'Normal_Weight']
obesity_df['obesity_risk'] = obesity_df['NObeyesdad'].apply(
    lambda x: 0 if x in not_at_risk else 1
)
print("Obesity risk distribution:\n", obesity_df['obesity_risk'].value_counts())
print("Sample BMI values:\n", obesity_df['BMI'].describe())

obesity_df.to_csv('data/obesity/cleaned_obesity.csv', index=False)
print("Saved cleaned_obesity.csv\n")

# ============================================================
# 4. STRESS — parse blood pressure, binarize stress target
# ============================================================
stress_files = [f for f in os.listdir('data/stress/') if f.endswith('.csv') and not f.startswith('cleaned')]
stress_df = pd.read_csv(f'data/stress/{stress_files[0]}')
print("=== Stress ===")
print("Missing values per column:\n", stress_df.isnull().sum())

# Parse "120/80" style strings into numeric systolic BP
stress_df['systolic_bp'] = stress_df['Blood Pressure'].apply(
    lambda x: int(str(x).split('/')[0])
)

# Check distribution before deciding the binarization threshold
print("Stress Level distribution:\n", stress_df['Stress Level'].value_counts().sort_index())
median_threshold = stress_df['Stress Level'].median()
print("Using median threshold:", median_threshold)
stress_df['high_stress'] = (stress_df['Stress Level'] >= median_threshold).astype(int)
print("Binarized high_stress distribution:\n", stress_df['high_stress'].value_counts())

# Drop columns not relevant to our schema
drop_cols = ['Person ID', 'Occupation', 'Sleep Disorder', 'Heart Rate',
             'Daily Steps', 'BMI Category', 'Blood Pressure']
stress_clean_df = stress_df.drop(columns=drop_cols)

stress_clean_df.to_csv('data/stress/cleaned_stress.csv', index=False)
print("Saved cleaned_stress.csv")
print("Final stress columns:", stress_clean_df.columns.tolist())

print("\n=== DAY 3 CLEANING COMPLETE ===")
