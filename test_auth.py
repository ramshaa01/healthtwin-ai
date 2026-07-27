import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("Waiting for server to start...")
time.sleep(20)

print("\n--- A) POST /api/auth/signup ---")
try:
    res = requests.post(f"{BASE_URL}/auth/signup", json={"username": "testuser", "password": "test123", "full_name": "Test User"})
    print(res.status_code, res.text)
except Exception as e:
    print(f"Signup error: {e}")

print("\n--- B) POST /api/auth/login ---")
token = None
try:
    res = requests.post(f"{BASE_URL}/auth/login", json={"username": "testuser", "password": "test123"})
    print(res.status_code, res.text)
    if res.status_code == 200:
        token = res.json().get("access_token")
except Exception as e:
    print(f"Login error: {e}")

if token:
    print("\n--- C) POST /api/predict (with token) ---")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "age": 35,
        "sex": 1,
        "height_cm": 175,
        "weight_kg": 80,
        "systolic_bp": 125,
        "cholesterol": 200,
        "physical_activity": 3,
        "sleep_hours": 7,
        "dietary_quality": 6,
        "stress_level": 5,
        "smoking": 0,
        "alcohol": 0,
        "high_cholesterol": 0,
        "family_history_diabetes": 0,
        "family_history_heart": 0
    }
    res = requests.post(f"{BASE_URL}/predict", headers=headers, json=payload)
    print(res.status_code, json.dumps(res.json(), indent=2))

    print("\n--- D) GET /api/history (with token) ---")
    res = requests.get(f"{BASE_URL}/history", headers=headers)
    print(res.status_code, json.dumps(res.json(), indent=2))
else:
    print("Login failed, skipping predict and history")
