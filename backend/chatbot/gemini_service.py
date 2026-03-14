from google import genai
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in environment.")
        return None
    return genai.Client(api_key=api_key)

def ask_gemini(message, context):
    """
    Constructs a prompt with user context and sends it to Gemini.
    Uses retries to handle transient errors.
    """
    client = get_client()
    if not client:
        return None
    
    prompt = f"""
You are FacultyMind AI, a supportive wellness assistant designed for engineering faculty.

Your role is to help teachers understand burnout scores, reduce stress, and improve work-life balance.

User Context:
{context}

User Message:
{message}

Provide a helpful and natural response.
Do not give medical diagnosis.
Give practical advice when relevant.
Professional, supportive, and concise tone.
"""

    # We use gemini-1.5-flash-8b as a very stable fallback for free tier
    # But let's try gemini-1.5-flash first as requested (or as standard)
    model_name = "gemini-1.5-flash"
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            
            if response and response.text:
                print(f"DEBUG: User message: {message}")
                print(f"DEBUG: Gemini response (Model: {model_name}): {response.text[:100]}...")
                return response.text
            else:
                print(f"DEBUG: Empty response from Gemini (Model: {model_name})")
                return None
                
        except Exception as e:
            err_str = str(e)
            print(f"DEBUG: Attempt {attempt+1} failed for {model_name}: {err_str}")
            
            if "429" in err_str or "quota" in err_str.lower():
                if attempt < max_retries - 1:
                    wait_time = 2 ** (attempt + 1)
                    print(f"DEBUG: Quota hit, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue
            
            # If 404, maybe the model name is wrong for this key
            if "404" in err_str and model_name == "gemini-1.5-flash":
                print("DEBUG: gemini-1.5-flash not found, trying gemini-1.5-flash-8b...")
                model_name = "gemini-1.5-flash-8b"
                continue
                
            break
            
    return None
