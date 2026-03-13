import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# Generate synthetic data for training
def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    
    # Features
    workload = np.random.uniform(1, 5, num_samples)
    stress = np.random.uniform(1, 5, num_samples)
    sleep = np.random.uniform(1, 5, num_samples)
    balance = np.random.uniform(1, 5, num_samples)
    satisfaction = np.random.uniform(1, 5, num_samples)
    support = np.random.uniform(1, 5, num_samples)
    age = np.random.randint(22, 65, num_samples)
    experience = np.random.randint(0, 40, num_samples)
    
    # Logic for burnout_risk (Low, Medium, High)
    # burnout_index formula
    burnout_index = (
        (stress * 0.30) +
        (workload * 0.25) +
        (sleep * 0.20) +
        (balance * 0.15) +
        (satisfaction * 0.10)
    )
    
    # Map to risk level
    # 1-2.5 -> Low (roughly 0-37% scaled)
    # 2.5-3.8 -> Medium (roughly 37-70% scaled)
    # 3.8-5 -> High (roughly 70-100% scaled)
    risk_levels = []
    for val in burnout_index:
        if val < 2.5:
            risk_levels.append('Low')
        elif val < 3.8:
            risk_levels.append('Medium')
        else:
            risk_levels.append('High')
            
    data = pd.DataFrame({
        'workload_score': workload,
        'stress_score': stress,
        'sleep_score': sleep,
        'balance_score': balance,
        'satisfaction_score': satisfaction,
        'support_score': support,
        'age': age,
        'experience': experience,
        'burnout_risk': risk_levels
    })
    
    return data

def train():
    print("Generating training data...")
    df = generate_synthetic_data(2000)
    
    X = df.drop('burnout_risk', axis=1)
    y = df['burnout_risk']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained with accuracy: {accuracy * 100:.2f}%")
    
    # Save the model
    model_path = os.path.join('ml_model', 'burnout_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train()
