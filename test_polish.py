import threading
import time
import requests
import uvicorn
import json
import sys

from backend.main import app

def run_server():
    uvicorn.run(app, host='127.0.0.1', port=8000, log_level='error')

t = threading.Thread(target=run_server, daemon=True)
t.start()
print('Waiting for server startup...')
time.sleep(15)

BASE_URL = 'http://127.0.0.1:8000/api'

# Need a user to get token for B and C
requests.post(f'{BASE_URL}/auth/signup', json={'username': 'testuser', 'password': 'test123', 'full_name': 'Test User'})
res = requests.post(f'{BASE_URL}/auth/login', json={'username': 'testuser', 'password': 'test123'})
token = res.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

print('\n--- A) GET /api/health-check ---')
res = requests.get(f'{BASE_URL}/health-check')
print(res.status_code, json.dumps(res.json(), indent=2))

print('\n--- B) POST /api/predict (valid) ---')
payload = {'age': 35, 'sex': 1, 'height_cm': 175, 'weight_kg': 80, 'systolic_bp': 125, 'cholesterol': 200, 'physical_activity': 3, 'sleep_hours': 7, 'dietary_quality': 6, 'stress_level': 5, 'smoking': 0, 'alcohol': 0, 'high_cholesterol': 0, 'family_history_diabetes': 0, 'family_history_heart': 0}
res = requests.post(f'{BASE_URL}/predict', headers=headers, json=payload)
data = res.json()
print(res.status_code, json.dumps(data.get('health_score'), indent=2))

print('\n--- C) GET /api/auth/profile ---')
res = requests.get(f'{BASE_URL}/auth/profile', headers=headers)
print(res.status_code, json.dumps(res.json(), indent=2))

print('\n--- D) POST /api/predict (invalid sleep_hours: 30) ---')
invalid_payload = payload.copy()
invalid_payload['sleep_hours'] = 30
res = requests.post(f'{BASE_URL}/predict', headers=headers, json=invalid_payload)
print(res.status_code, json.dumps(res.json(), indent=2))
