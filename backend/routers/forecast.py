from fastapi import APIRouter, Depends, HTTPException
from backend.monte_carlo import run_monte_carlo
from backend.recommendation_engine import generate_recommendations
from backend.digital_twin import twin_engine
from backend.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Forecast & Recommendations"])

@router.post("/forecast")
def forecast():
    """Run Monte Carlo simulation on the stored base profile.
    Returns 10th/50th/90th percentile risk trajectories.
    Call /predict first to set the base profile."""
    base = twin_engine.get_base()
    if base is None:
        raise HTTPException(
            status_code=400,
            detail="No base profile found. Call /api/predict first."
        )
    return run_monte_carlo(base, n_simulations=100)

@router.post("/recommendations")
def recommendations():
    """Generate personalised recommendations based on the last
    /predict output stored in the Digital Twin."""
    base = twin_engine.get_base()
    if base is None:
        raise HTTPException(
            status_code=400,
            detail="No base profile found. Call /api/predict first."
        )
    from backend.models_loader import run_prediction
    CONDITIONS = ['diabetes', 'hypertension', 'heart', 'obesity', 'stress']
    height_m = base['height_cm'] / 100
    bmi = base['weight_kg'] / (height_m ** 2)
    predictions = [run_prediction(c, bmi, base) for c in CONDITIONS]
    recs = generate_recommendations(predictions)
    return {"recommendations": recs, "total": len(recs)}
