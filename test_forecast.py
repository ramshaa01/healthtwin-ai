import threading
import time
import requests
import uvicorn
import json
import sys

from backend.main import app
import mongomock

def run_server():
    uvicorn.run(app, host='127.0.0.1', port=8000, log_level='error')

t = threading.Thread(target=run_server, daemon=True)
t.start()
print('Waiting for server startup...')
time.sleep(15)

BASE_URL = 'http://127.0.0.1:8000/api'

print('\n--- A) POST /api/auth/login ---')
res = requests.post(f'{BASE_URL}/auth/login', json={'username': 'testuser', 'password': 'test123'})
print(res.status_code)
token = res.json().get('access_token')
if not token:
    print("Could not login:", res.text)
    sys.exit(1)

print('\n--- B) POST /api/predict (sets base profile) ---')
headers = {'Authorization': f'Bearer {token}'}
payload = {'age': 35, 'sex': 1, 'height_cm': 175, 'weight_kg': 80, 'systolic_bp': 125, 'cholesterol': 200, 'physical_activity': 3, 'sleep_hours': 7, 'dietary_quality': 6, 'stress_level': 5, 'smoking': 0, 'alcohol': 0, 'high_cholesterol': 0, 'family_history_diabetes': 0, 'family_history_heart': 0}
res = requests.post(f'{BASE_URL}/predict', headers=headers, json=payload)
print(res.status_code)

print('\n--- C) POST /api/forecast ---')
res = requests.post(f'{BASE_URL}/forecast', headers=headers)
print(res.status_code, json.dumps(res.json(), indent=2))

print('\n--- D) POST /api/recommendations ---')
res = requests.post(f'{BASE_URL}/recommendations', headers=headers)
print(res.status_code, json.dumps(res.json(), indent=2))
