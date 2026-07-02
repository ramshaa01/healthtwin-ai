import joblib
import numpy as np
import pandas as pd
import shap
import os

# All paths relative to project root (where uvicorn is launched from)
MODELS_CONFIG = {
    'diabetes': {
        'model_path':    'models/tuned_diabetes_xgboost.pkl',
        'explainer_path':'models/explainer_diabetes.pkl',
        'feature_cols':  ['BMI', 'Age', 'GenHlth', 'MentHlth', 'PhysHlth',
                          'HighChol', 'CholCheck', 'PhysActivity', 'Fruits',
                          'Veggies', 'HvyAlcoholConsump', 'Smoker', 'Sex',
                          'DiffWalk', 'HighBP'],
        'model_type': 'tree'
    },
    'hypertension': {
        'model_path':    'models/tuned_hypertension_lr.pkl',
        'explainer_path':'models/explainer_hypertension.pkl',
        'scaler_path':   'models/scaler_hypertension.pkl',
        'feature_cols':  ['Age', 'BMI', 'GenHlth', 'HighChol', 'Smoker',
                          'HvyAlcoholConsump', 'PhysActivity', 'DiffWalk',
                          'MentHlth', 'PhysHlth', 'Sex'],
        'model_type': 'linear'
    },
    'heart': {
        'model_path':    'models/tuned_heart_rf.pkl',
        'explainer_path':'models/explainer_heart.pkl',
        'feature_cols':  ['age', 'sex', 'trestbps', 'chol', 'fbs'],
        'model_type': 'tree'
    },
    'obesity': {
        'model_path':    'models/tuned_obesity_gb.pkl',
        'explainer_path':'models/explainer_obesity.pkl',
        'feature_cols':  None,
        'model_type': 'tree'
    },
    'stress': {
        'model_path':    'models/tuned_stress_dt.pkl',
        'explainer_path':'models/explainer_stress.pkl',
        'feature_cols':  ['Gender', 'Age', 'Sleep Duration',
                          'Quality of Sleep',
                          'Physical Activity Level', 'systolic_bp'],
        'model_type': 'tree'
    }
}

# Global registry — loaded once at startup, reused on every request
LOADED_MODELS = {}

def load_all_models():
    """Load all 5 models and explainers into memory.
    Called once at FastAPI startup — never again per request."""
    print("Loading HealthTwin AI models...")

    # Load obesity feature cols from pkl
    MODELS_CONFIG['obesity']['feature_cols'] = joblib.load(
        'models/obesity_feature_cols.pkl'
    )

    for condition, config in MODELS_CONFIG.items():
        print(f"  Loading {condition}...")
        LOADED_MODELS[condition] = {
            'model':      joblib.load(config['model_path']),
            'explainer':  joblib.load(config['explainer_path']),
            'features':   config['feature_cols'],
            'model_type': config['model_type']
        }
        if 'scaler_path' in config:
            LOADED_MODELS[condition]['scaler'] = joblib.load(
                config['scaler_path']
            )

    print("All 5 models loaded successfully.")
    return LOADED_MODELS


def build_feature_vector(condition: str, bmi: float, raw_input: dict) -> pd.DataFrame:
    """Map the unified 15-feature HealthInput to the specific feature
    vector each model was trained on."""
    features = LOADED_MODELS[condition]['features']

    mapping = {
        # Diabetes / Hypertension (BRFSS column names)
        'BMI':              bmi,
        'Age':              raw_input['age'],
        'GenHlth':          raw_input['dietary_quality'],
        'MentHlth':         raw_input['stress_level'],
        'PhysHlth':         raw_input['stress_level'],
        'HighChol':         raw_input['high_cholesterol'],
        'CholCheck':        1,
        'PhysActivity':     int(raw_input['physical_activity'] > 0),
        'Fruits':           int(raw_input['dietary_quality'] >= 6),
        'Veggies':          int(raw_input['dietary_quality'] >= 6),
        'HvyAlcoholConsump':raw_input['alcohol'],
        'Smoker':           raw_input['smoking'],
        'Sex':              raw_input['sex'],
        'DiffWalk':         0,
        'HighBP':           int(raw_input['systolic_bp'] >= 130),
        # Heart (Cleveland column names)
        'age':              raw_input['age'],
        'sex':              raw_input['sex'],
        'trestbps':         raw_input['systolic_bp'],
        'chol':             raw_input['cholesterol'],
        'fbs':              int(raw_input['dietary_quality'] <= 4),
        # Stress (Sleep Health column names)
        'Gender':           raw_input['sex'],
        'Sleep Duration':   raw_input['sleep_hours'],
        'Quality of Sleep': raw_input['dietary_quality'],
        'Physical Activity Level': raw_input['physical_activity'],
        'systolic_bp':      raw_input['systolic_bp'],
    }

    row = {f: mapping.get(f, 0) for f in features}
    return pd.DataFrame([row], columns=features)


def run_prediction(condition: str, bmi: float, raw_input: dict) -> dict:
    """Run one model and its SHAP explainer. Return risk prob + top features."""
    entry = LOADED_MODELS[condition]
    model = entry['model']
    explainer = entry['explainer']
    features = entry['features']

    X = build_feature_vector(condition, bmi, raw_input)

    if 'scaler' in entry:
        X_scaled = entry['scaler'].transform(X)
        X_input = pd.DataFrame(X_scaled, columns=features)
    else:
        X_input = X

    prob = float(model.predict_proba(X_input)[0][1])

    if prob >= 0.7:
        risk_level = "High"
    elif prob >= 0.4:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # SHAP for this single prediction
    shap_vals = explainer.shap_values(X_input)
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[1]
    shap_row = shap_vals[0] if len(np.array(shap_vals).shape) > 1 else shap_vals

    shap_series = pd.Series(shap_row, index=features)
    top_features = (
        shap_series.abs()
        .sort_values(ascending=False)
        .head(5)
        .reset_index()
        .rename(columns={'index': 'feature', 0: 'shap_value'})
    )
    top_features['shap_value'] = shap_series[top_features['feature']].values
    top_list = top_features.to_dict(orient='records')

    return {
        'condition':        condition,
        'risk_probability': round(prob, 4),
        'risk_level':       risk_level,
        'top_shap_features': top_list
    }
