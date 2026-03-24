import sys
import os

sys.path.append(r'c:\Users\omraj\OneDrive\Desktop\AI Teacher Burnout Prediction System')

from ml_model.predict import predict_burnout

test_cases = [
    [1, 1, 1, 1, 1, 1, 35, 10], # Low
    [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 35, 10], # Medium
    [4, 4, 4, 4, 4, 4, 35, 10] # High
]

for f in test_cases:
    res = predict_burnout(f)
    print(f"Features: {f[:6]} -> Index: {res['burnout_index']}, Risk: {res['risk_level']}")
