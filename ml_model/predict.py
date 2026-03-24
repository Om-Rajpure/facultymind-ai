import joblib
import numpy as np
import os

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'burnout_model.pkl')
model = joblib.load(MODEL_PATH)

def predict_burnout(features):
    """
    features: list or array [workload, stress, sleep, balance, satisfaction, support, age, experience]
    """
    # Convert to numpy array for model
    features_array = np.array(features).reshape(1, -1)
    
    # Predict risk level
    risk_level = model.predict(features_array)[0]
    
    # Calculate weighted Burnout Index
    # workload, stress, sleep, balance, satisfaction, support, age, experience
    # index 0: workload, 1: stress, 2: sleep, 3: balance, 4: satisfaction, 5: support
    workload = features[0]
    stress = features[1]
    sleep = features[2]
    balance = features[3]
    satisfaction = features[4]
    
    # weighted formula: (stress * 0.30) + (workload * 0.25) + (sleep * 0.20) + (balance * 0.15) + (satisfaction * 0.10)
    # Note: Features are already 1-5 from frontend logic usually, but let's assume they are scores.
    # The user asked for a weighted formula and scale to 0-100.
    
    raw_index = (
        (stress * 0.30) +
        (workload * 0.25) +
        (sleep * 0.20) +
        (balance * 0.15) +
        (satisfaction * 0.10)
    )
    
    # Scale from 1-4 to 0-100
    # (raw_index - 1) / 3 * 100
    burnout_index = round(((raw_index - 1) / 3) * 100)
    
    # Identify important factors (those with highest scores)
    factor_names = ["workload", "stress", "sleep", "balance", "satisfaction", "support"]
    scores = features[:6]
    factors_dict = {name: score for name, score in zip(factor_names, scores)}
    
    # Sort and pick top 3 for "important_factors"
    important_factors = dict(sorted(factors_dict.items(), key=lambda item: item[1], reverse=True)[:3])
    
    return {
        "burnout_index": burnout_index,
        "risk_level": risk_level,
        "factors": important_factors
    }
