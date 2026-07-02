from pydantic import BaseModel, Field
from typing import Optional

class HealthInput(BaseModel):
    # Demographics
    age: int = Field(..., ge=1, le=120, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="Sex: 0=Female, 1=Male")

    # Physical measurements
    height_cm: float = Field(..., gt=0, description="Height in cm")
    weight_kg: float = Field(..., gt=0, description="Weight in kg")
    systolic_bp: float = Field(..., gt=0, description="Systolic blood pressure")
    cholesterol: float = Field(..., gt=0, description="Cholesterol level (mg/dL)")

    # Lifestyle inputs
    physical_activity: float = Field(..., ge=0,
        description="Physical activity sessions per week")
    sleep_hours: float = Field(..., ge=0, le=24,
        description="Sleep hours per night")
    dietary_quality: float = Field(..., ge=1, le=10,
        description="Dietary quality self-score 1-10")
    stress_level: float = Field(..., ge=1, le=10,
        description="Stress level self-score 1-10")
    smoking: int = Field(..., ge=0, le=1,
        description="Smoking status: 0=No, 1=Yes")
    alcohol: int = Field(..., ge=0, le=1,
        description="Heavy alcohol consumption: 0=No, 1=Yes")

    # Health history
    high_cholesterol: int = Field(..., ge=0, le=1,
        description="High cholesterol diagnosed: 0=No, 1=Yes")
    family_history_diabetes: int = Field(..., ge=0, le=1,
        description="Family history of diabetes: 0=No, 1=Yes")
    family_history_heart: int = Field(..., ge=0, le=1,
        description="Family history of heart disease: 0=No, 1=Yes")

class PredictionResult(BaseModel):
    condition: str
    risk_probability: float
    risk_level: str
    top_shap_features: list

class PredictResponse(BaseModel):
    bmi: float
    predictions: list[PredictionResult]
    health_score: float
