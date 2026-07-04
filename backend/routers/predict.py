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
                          sleep_hours: float, stress_level: float) -> float:
    risks = {p['condition']: p['risk_probability'] for p in predictions}
    bmi_score = 25 if 18.5 <= bmi <= 24.9 else max(0, 25 - abs(bmi - 22) * 1.5)
    physical = bmi_score * 0.5 + (1 - risks.get('diabetes', 0.5)) * 12.5
    mental = (1 - risks.get('stress', 0.5)) * 15 + max(0, (10 - stress_level) / 10 * 10)
    nutrition = (1 - risks.get('obesity', 0.5)) * 25
    if 7 <= sleep_hours <= 9:
        sleep = 25
    elif 6 <= sleep_hours <= 10:
        sleep = 18
    else:
        sleep = max(0, 10 - abs(sleep_hours - 8) * 2)
    total = round(physical + mental + nutrition + sleep, 1)
    return min(100.0, max(0.0, total))

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
        input_data.stress_level
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
