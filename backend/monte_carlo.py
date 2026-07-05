import numpy as np
from backend.models_loader import run_prediction

CONDITIONS = ['diabetes', 'hypertension', 'heart', 'obesity', 'stress']

# Realistic week-to-week variability per feature (standard deviation)
FEATURE_NOISE = {
    'sleep_hours':       1.5,
    'physical_activity': 2.0,
    'dietary_quality':   1.0,
    'stress_level':      1.5,
    'weight_kg':         1.0,
    'systolic_bp':       5.0,
    'cholesterol':       10.0,
}

def run_monte_carlo(base_input: dict, n_simulations: int = 100) -> dict:
    """Generate 100 noisy variations of the user's input vector,
    score all of them, and return 10th/50th/90th percentile
    risk trajectories for each condition over 12 months."""

    height_m = base_input['height_cm'] / 100

    all_probs = {c: [] for c in CONDITIONS}

    for _ in range(n_simulations):
        # Apply Gaussian noise to variable features only
        noisy = base_input.copy()
        for feature, std in FEATURE_NOISE.items():
            if feature in noisy:
                noise = np.random.normal(0, std)
                noisy[feature] = max(0, noisy[feature] + noise)

        # Clamp values to valid ranges
        noisy['sleep_hours']       = min(max(noisy['sleep_hours'], 3), 12)
        noisy['physical_activity'] = min(max(noisy['physical_activity'], 0), 14)
        noisy['dietary_quality']   = min(max(noisy['dietary_quality'], 1), 10)
        noisy['stress_level']      = min(max(noisy['stress_level'], 1), 10)

        bmi = noisy['weight_kg'] / (height_m ** 2)

        for condition in CONDITIONS:
            prob = run_prediction(condition, bmi, noisy)['risk_probability']
            all_probs[condition].append(prob)

    # Reduce to 3 percentile curves
    trajectories = {}
    for condition in CONDITIONS:
        probs = np.array(all_probs[condition])
        trajectories[condition] = {
            'best_case':     round(float(np.percentile(probs, 10)), 4),
            'expected':      round(float(np.percentile(probs, 50)), 4),
            'worst_case':    round(float(np.percentile(probs, 90)), 4),
            'current':       round(float(np.mean(probs[:1])), 4)
        }

    return {
        'n_simulations': n_simulations,
        'trajectories':  trajectories,
        'interpretation': (
            "best_case = 10th percentile (if habits improve slightly), "
            "expected = 50th percentile (most likely outcome), "
            "worst_case = 90th percentile (if habits worsen slightly)"
        )
    }
