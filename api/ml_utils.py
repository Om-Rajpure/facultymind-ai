import pickle
import numpy as np
import os
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', 'burnout_model.pkl')

def load_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    return None

def predict_burnout(features):
    """
    features: [age, experience, workload, stress, sleep, wlb, satisfaction, support]
    Returns: (burnout_index, risk_level)
    """
    model = load_model()
    if not model:
        # Fallback to simple calculation if model not found
        score = (features[3] * 0.3 + features[2] * 0.25 + (6-features[4]) * 0.2 + (6-features[5]) * 0.15 + (6-features[6]) * 0.1)
        burnout_index = min(max(score * 20, 0), 100)
    else:
        # Predict using model
        # Note: model predicts 0, 1, 2
        risk_class = model.predict([features])[0]
        # Calculate index for more granularity (heuristic)
        score = (features[3] * 0.3 + features[2] * 0.25 + (6-features[4]) * 0.2 + (6-features[5]) * 0.15 + (6-features[6]) * 0.1)
        burnout_index = min(max(score * 20, 0), 100)
    
    if burnout_index > 60:
        risk_level = "High"
    elif burnout_index > 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    return round(burnout_index, 2), risk_level
