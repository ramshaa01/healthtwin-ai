from fastapi import APIRouter
from backend.schemas import HealthInput, PredictResponse
from backend.models_loader import LOADED_MODELS, run_prediction

router = APIRouter(prefix="/api", tags=["Prediction"])

CONDITIONS = ['diabetes', 'hypertension', 'heart', 'obesity', 'stress']

def compute_health_score(predictions: list, bmi: float,
                          sleep_hours: float, stress_level: float) -> float:
    """Simple 0-100 health score across 4 pillars of 25 points each."""
    risks = {p['condition']: p['risk_probability'] for p in predictions}

    # Physical (25): BMI in normal range + low diabetes/heart risk
    bmi_score = 25 if 18.5 <= bmi <= 24.9 else max(0, 25 - abs(bmi - 22) * 1.5)
    physical = bmi_score * 0.5 + (1 - risks.get('diabetes', 0.5)) * 12.5

    # Mental (25): low stress risk + low stress self-report
    mental = (1 - risks.get('stress', 0.5)) * 15 + max(0, (10 - stress_level) / 10 * 10)

    # Nutrition (25): low obesity risk
    nutrition = (1 - risks.get('obesity', 0.5)) * 25

    # Sleep (25): optimal sleep hours 7-9
    if 7 <= sleep_hours <= 9:
        sleep = 25
    elif 6 <= sleep_hours <= 10:
        sleep = 18
    else:
        sleep = max(0, 10 - abs(sleep_hours - 8) * 2)

    total = round(physical + mental + nutrition + sleep, 1)
    return min(100.0, max(0.0, total))


@router.post("/predict", response_model=PredictResponse)
def predict(input_data: HealthInput):
    height_m = input_data.height_cm / 100
    bmi = round(input_data.weight_kg / (height_m ** 2), 2)

    raw = input_data.model_dump()

    predictions = []
    for condition in CONDITIONS:
        result = run_prediction(condition, bmi, raw)
        predictions.append(result)

    health_score = compute_health_score(
        predictions, bmi,
        input_data.sleep_hours,
        input_data.stress_level
    )

    return PredictResponse(
        bmi=bmi,
        predictions=predictions,
        health_score=health_score
    )
