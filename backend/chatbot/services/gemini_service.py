from google import genai
import os
from dotenv import load_dotenv
import time

# Load environment variables with override to catch updates
load_dotenv(override=True)

def generate_ai_response(prompt):
    """
    Sends a prompt to Gemini and returns the AI response.
    Includes retry logic for transient errors.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found.")
        return None

    client = genai.Client(api_key=api_key)
    models_to_try = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-lite-latest"]
    
    for model_name in models_to_try:
        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                
                if response and response.text:
                    return response.text
                else:
                    print(f"DEBUG: Empty response from {model_name}")
                    continue
                    
            except Exception as e:
                err_str = str(e)
                print(f"DEBUG: Attempt {attempt+1} failed for {model_name}: {err_str}")
                
                if "429" in err_str or "quota" in err_str.lower():
                    if attempt < max_retries - 1:
                        wait_time = 2 ** (attempt + 1)
                        time.sleep(wait_time)
                        continue
                
                # If it's a 429 and we've exhausted retries, try the next model
                break
            
    return None
