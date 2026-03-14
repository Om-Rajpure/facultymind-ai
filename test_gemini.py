from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing with API Key: {api_key[:5]}...{api_key[-5:]}")

client = genai.Client(api_key=api_key)

models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"]

for model_name in models:
    print(f"\n--- Testing Model: {model_name} ---")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Say 'Hello, I am working!'"
        )
        print(f"SUCCESS: {response.text}")
    except Exception as e:
        print(f"FAILURE: {str(e)}")