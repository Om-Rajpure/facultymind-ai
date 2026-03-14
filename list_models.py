from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

try:
    print("Listing available models...")
    for model in client.models.list():
        print(f"Model: {model.name}, Supported Actions: {model.supported_actions}")
except Exception as e:
    print(f"Error listing models: {str(e)}")
