import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_verify_password(password):
    url = f"{BASE_URL}/api/admin/verify-password/"
    payload = {"password": password}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"Testing password: {password}")
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        print("-" * 20)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test correct password
    test_verify_password("0m@123")
    
    # Test incorrect password
    test_verify_password("wrong_password")
