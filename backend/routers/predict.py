from fastapi import APIRouter, Depends
from backend.schemas import HealthInput, PredictResponse
from backend.models_loader import LOADED_MODELS, run_prediction
from backend.digital_twin import twin_engine
from backend.auth import get_current_user
from backend.database import predictions_collection
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Prediction"])

CONDITIONS = ['diabetes', 'hypertension', 'heart', 'obesity', 'stress']

def compute_health_score(predictions: list, bmi: float,
                          sleep_hours: float, stress_level: float,
                          physical_activity: float,
                          dietary_quality: float) -> dict:
    risks = {p['condition']: p['risk_probability'] for p in predictions}

    # Physical (0-25): BMI + diabetes/heart risk + activity
    if 18.5 <= bmi <= 24.9:
        bmi_score = 25
    elif 17 <= bmi <= 29.9:
        bmi_score = 15
    else:
        bmi_score = 8
    activity_score = min(physical_activity / 7 * 10, 10)
    disease_score = (1 - risks.get('diabetes', 0.5)) * 5 + \
                    (1 - risks.get('heart', 0.5)) * 5
    physical = round(bmi_score * 0.5 + activity_score * 0.3 +
                     disease_score * 0.2, 2)

    # Mental (0-25): stress self-report + stress model risk
    stress_self = max(0, (10 - stress_level) / 10 * 15)
    stress_model = (1 - risks.get('stress', 0.5)) * 10
    mental = round(stress_self + stress_model, 2)

    # Nutrition (0-25): dietary quality + obesity risk
    diet_score = dietary_quality / 10 * 15
    obesity_score = (1 - risks.get('obesity', 0.5)) * 10
    nutrition = round(diet_score + obesity_score, 2)

    # Sleep (0-25): hours + hypertension risk (hypertension disrupts sleep)
    if 7 <= sleep_hours <= 9:
        sleep_score = 25
    elif 6 <= sleep_hours <= 10:
        sleep_score = 18
    elif 5 <= sleep_hours <= 11:
        sleep_score = 12
    else:
        sleep_score = 5
    sleep = round(sleep_score * 0.7 +
                  (1 - risks.get('hypertension', 0.5)) * 7.5, 2)

    total = round(min(100.0, physical + mental + nutrition + sleep), 1)

    return {
        'total': total,
        'breakdown': {
            'physical':  round(min(25.0, physical), 1),
            'mental':    round(min(25.0, mental), 1),
            'nutrition': round(min(25.0, nutrition), 1),
            'sleep':     round(min(25.0, sleep), 1)
        }
    }

@router.post("/predict", response_model=PredictResponse)
def predict(input_data: HealthInput,
            current_user: dict = Depends(get_current_user)):
    height_m = input_data.height_cm / 100
    bmi = round(input_data.weight_kg / (height_m ** 2), 2)
    raw = input_data.model_dump()

    twin_engine.set_base(raw)

    predictions = []
    for condition in CONDITIONS:
        result = run_prediction(condition, bmi, raw)
        predictions.append(result)

    health_score = compute_health_score(
        predictions, bmi,
        input_data.sleep_hours,
        input_data.stress_level,
        input_data.physical_activity,
        input_data.dietary_quality
    )

    # Save to MongoDB
    predictions_collection.insert_one({
        "username":     current_user["username"],
        "timestamp":    datetime.utcnow(),
        "input":        raw,
        "bmi":          bmi,
        "predictions":  predictions,
        "health_score": health_score
    })

    return PredictResponse(
        bmi=bmi,
        predictions=predictions,
        health_score=health_score
    )

@router.get("/history")
def get_history(current_user: dict = Depends(get_current_user)):
    """Return last 10 predictions for the logged-in user."""
    records = list(
        predictions_collection
        .find({"username": current_user["username"]},
              {"_id": 0})
        .sort("timestamp", -1)
        .limit(10)
    )
    return {"history": records}
