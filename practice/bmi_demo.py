from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="HealthTwin AI - BMI Practice Demo")

# Pydantic model: defines exactly what shape of JSON input is valid.
# This is the same pattern the real 15-feature Digital Twin schema
# will use on Day 16 — just much smaller here.
class BMIRequest(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age in years")
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")

class BMIResponse(BaseModel):
    bmi: float
    category: str
    message: str

@app.get("/")
def root():
    return {"message": "HealthTwin AI BMI practice API is running"}

@app.post("/calculate-bmi", response_model=BMIResponse)
def calculate_bmi(request: BMIRequest):
    height_m = request.height_cm / 100
    bmi = round(request.weight_kg / (height_m ** 2), 2)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"

    message = f"At age {request.age}, a BMI of {bmi} falls in the '{category}' range."

    return BMIResponse(bmi=bmi, category=category, message=message)
