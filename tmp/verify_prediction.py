import sys
import os

# Add the project root to sys.path
sys.path.append(r'c:\Users\omraj\OneDrive\Desktop\AI Teacher Burnout Prediction System')

from ml_model.predict import predict_burnout

def test_prediction():
    # Test cases with 1-4 scale
    # features: [workload, stress, sleep, balance, satisfaction, support, age, experience]
    
    test_cases = [
        {
            "name": "Low Stress case",
            "features": [1, 1, 1, 1, 1, 1, 35, 10], # All 1s (Low stress in this context)
            "expected_risk": "Low"
        },
        {
            "name": "High Stress case",
            "features": [4, 4, 4, 4, 4, 4, 35, 10], # All 4s (High stress)
            "expected_risk": "High"
        },
        {
            "name": "Medium Stress case",
            "features": [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 35, 10],
            "expected_risk": "Medium"
        }
    ]

    for case in test_cases:
        print(f"Testing: {case['name']}")
        result = predict_burnout(case['features'])
        print(f"Result: {result}")
        # burnout_index should be scaled 1-4 -> 0-100
        # For 1s: (1-1)/3 * 100 = 0
        # For 4s: (4-1)/3 * 100 = 100
        # For 2.5s: (2.5-1)/3 * 100 = 50
        print("-" * 20)

if __name__ == "__main__":
    test_prediction()
