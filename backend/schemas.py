from pydantic import BaseModel, Field
from typing import Optional

class HealthInput(BaseModel):
    # Demographics
    age: int = Field(..., ge=1, le=120, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="0=Female, 1=Male")
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    systolic_bp: float = Field(..., ge=60, le=250, description="Systolic Blood Pressure")
    cholesterol: float = Field(..., ge=50, le=600, description="Total Cholesterol")
    physical_activity: float = Field(..., ge=0, le=21, description="Physical activity (days/week or hours)")
    sleep_hours: float = Field(..., ge=0, le=24, description="Average sleep hours per night")
    dietary_quality: float = Field(..., ge=1, le=10, description="Self-reported diet quality (1-10)")
    stress_level: float = Field(..., ge=1, le=10, description="Self-reported stress level (1-10)")
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
    top_shap_features: list = []

class HealthScoreBreakdown(BaseModel):
    total: float
    breakdown: dict

class PredictResponse(BaseModel):
    bmi: float
    predictions: list[PredictionResult]
    health_score: HealthScoreBreakdown
