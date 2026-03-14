import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_admin_endpoints():
    endpoints = [
        "admin/overview/",
        "admin/department-analytics/",
        "admin/high-risk/",
        "admin/faculty/"
    ]
    
    for endpoint in endpoints:
        print(f"Testing GET {BASE_URL}/{endpoint} ...")
        try:
            response = requests.get(f"{BASE_URL}/{endpoint}")
            if response.status_code == 200:
                print(f"SUCCESS: {endpoint}")
                # print(json.dumps(response.json(), indent=2))
            else:
                print(f"FAILED: {endpoint} - Status: {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"ERROR: {endpoint} - {str(e)}")
        print("-" * 40)

if __name__ == "__main__":
    test_admin_endpoints()
