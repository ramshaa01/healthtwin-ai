from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.digital_twin import twin_engine
from backend.schemas import HealthInput

router = APIRouter(prefix="/api", tags=["Digital Twin"])

class SimulateDiff(BaseModel):
    """Only include the fields you want to change.
    Everything else stays as it was in the last /predict call."""
    age:                  Optional[int]   = None
    sex:                  Optional[int]   = None
    height_cm:            Optional[float] = None
    weight_kg:            Optional[float] = None
    systolic_bp:          Optional[float] = None
    cholesterol:          Optional[float] = None
    physical_activity:    Optional[float] = None
    sleep_hours:          Optional[float] = None
    dietary_quality:      Optional[float] = None
    stress_level:         Optional[float] = None
    smoking:              Optional[int]   = None
    alcohol:              Optional[int]   = None
    high_cholesterol:     Optional[int]   = None
    family_history_diabetes: Optional[int] = None
    family_history_heart: Optional[int]   = None

@router.post("/simulate")
def simulate(diff: SimulateDiff):
    """What-If simulation endpoint.
    Send only the fields you want to change — e.g. just sleep_hours.
    Returns updated predictions for all 5 conditions instantly.
    Does NOT write to database or change the stored base profile."""
    try:
        # Only pass non-None fields as the diff
        diff_dict = {k: v for k, v in diff.model_dump().items()
                     if v is not None}

        if not diff_dict:
            raise HTTPException(
                status_code=400,
                detail="No fields provided in diff. "
                       "Send at least one field to simulate a change."
            )

        result = twin_engine.simulate(diff_dict)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
