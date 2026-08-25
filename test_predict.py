import urllib.request, json

# First login to get token
login_data = json.dumps({'username':'viva_test_user', 'password':'VivaTest@2026'}).encode('utf-8')
req = urllib.request.Request('https://healthtwin-ai-1-mee6.onrender.com/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
token = json.loads(res.read().decode('utf-8'))['access_token']
print('Token acquired:', token[:30]+'...')

# Now predict
predict_data = json.dumps({
    'age': 45, 'sex': 0, 'height_cm': 155, 'weight_kg': 72,
    'systolic_bp': 140, 'cholesterol': 180, 'high_cholesterol': 0,
    'physical_activity': 1, 'sleep_hours': 6, 'dietary_quality': 5,
    'stress_level': 5, 'smoking': 0, 'alcohol': 0,
    'family_history_diabetes': 1, 'family_history_heart': 0
}).encode('utf-8')
req2 = urllib.request.Request('https://healthtwin-ai-1-mee6.onrender.com/api/predict',
    data=predict_data,
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
try:
    res2 = urllib.request.urlopen(req2)
    resp = json.loads(res2.read().decode('utf-8'))
    preds = resp.get('predictions', [])
    print('PREDICTION SUCCESS:')
    for p in preds:
        pct = round(p['risk_probability']*100, 1)
        print(f"  {p['condition']}: {pct}%")
except Exception as e:
    print('PREDICT ERROR:', e.code, e.read().decode('utf-8'))
