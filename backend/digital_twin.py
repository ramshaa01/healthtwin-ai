import numpy as np
from typing import Optional
from backend.models_loader import run_prediction

class DigitalTwinEngine:
    """Holds one user's current health input vector in memory.
    Exposes simulate(diff) which applies a partial override and
    re-runs all 5 models without touching the database.
    This is the core of the What-If simulation feature."""

    CONDITIONS = ['diabetes', 'hypertension', 'heart', 'obesity', 'stress']

    def __init__(self):
        self._base_vector: Optional[dict] = None

    def set_base(self, health_input: dict):
        """Store the user's current full health profile."""
        self._base_vector = health_input.copy()

    def get_base(self) -> Optional[dict]:
        return self._base_vector.copy() if self._base_vector else None

    def simulate(self, diff: dict) -> dict:
        """Apply a partial override to the stored vector and re-run
        all 5 models. Does NOT write to database or modify _base_vector.
        
        diff: dict of only the changed fields e.g.
              {"sleep_hours": 8.0, "physical_activity": 5}
        """
        if self._base_vector is None:
            raise ValueError("No base health profile stored. "
                             "Call /predict first to set the base vector.")

        # Merge: start from base, apply only the changed fields
        simulated = self._base_vector.copy()
        simulated.update(diff)

        height_m = simulated['height_cm'] / 100
        bmi = round(simulated['weight_kg'] / (height_m ** 2), 2)

        predictions = []
        for condition in self.CONDITIONS:
            result = run_prediction(condition, bmi, simulated)
            predictions.append(result)

        return {
            'simulated_input': simulated,
            'bmi': bmi,
            'predictions': predictions
        }


# One global instance per server process
# This is intentionally simple — in a multi-user production system
# you would store per-user twins in a session store or database.
# For this offline single-user app, one global instance is correct.
twin_engine = DigitalTwinEngine()
