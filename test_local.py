import asyncio
import json
from backend.models_loader import load_all_models, run_prediction
from backend.schemas import HealthInput
from backend.routers.predict import predict

def test():
    load_all_models()
    with open('test_payload.json') as f:
        data = json.load(f)
    input_data = HealthInput(**data)
    try:
        res = predict(input_data)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test()
