import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

def generate_dummy_model():
    # Features: Age, Exp, Workload, Stress, Sleep, WLB, Satisfaction, Support
    # Label: Risk (0=Low, 1=Medium, 2=High)
    
    # Create some dummy data
    np.random.seed(42)
    data = []
    for _ in range(100):
        age = np.random.randint(25, 65)
        exp = np.random.randint(1, 40)
        workload = np.random.uniform(1, 5)
        stress = np.random.uniform(1, 5)
        sleep = np.random.uniform(1, 5)
        wlb = np.random.uniform(1, 5)
        satisfaction = np.random.uniform(1, 5)
        support = np.random.uniform(1, 5)
        
        # Simple heuristic for risk
        score = (stress * 0.3 + workload * 0.25 + (6-sleep) * 0.2 + (6-wlb) * 0.15 + (6-satisfaction) * 0.1)
        if score > 3.5:
            risk = 2 # High
        elif score > 2.5:
            risk = 1 # Medium
        else:
            risk = 0 # Low
        
        data.append([age, exp, workload, stress, sleep, wlb, satisfaction, support, risk])
        
    df = pd.DataFrame(data, columns=['age', 'experience', 'workload', 'stress', 'sleep', 'wlb', 'satisfaction', 'support', 'risk'])
    
    X = df.drop('risk', axis=1)
    y = df['risk']
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save model
    os.makedirs('ml_models', exist_ok=True)
    with open('ml_models/burnout_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Dummy model generated successfully at ml_models/burnout_model.pkl")

if __name__ == "__main__":
    generate_dummy_model()
