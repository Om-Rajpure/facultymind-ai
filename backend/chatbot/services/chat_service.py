from .gemini_service import generate_ai_response
from .context_service import build_user_context
from .memory_service import get_session_memory, save_message
from assessment.models import ChatSession, Reminder
from django.utils import timezone

def process_chat_message(email, message, session_id=None):
    """
    Orchestrates the chat logic: context -> memory -> AI prompt -> Gemini -> Save.
    """
    # 1. Resolve or Create Session
    if not session_id:
        session, _ = ChatSession.objects.get_or_create(user_email=email)
        session_id = session.id
    
    # 2. Build Context
    context = build_user_context(email)
    
    # 3. Retrieve Memory
    memory = get_session_memory(session_id)
    
    # 4. Construct Final AI Prompt
    prompt = f"""
You are FacultyMind AI, an intelligent wellness assistant designed to help engineering faculty understand burnout and manage stress.

Use the user's burnout assessment data and conversation history to generate helpful advice.

User Context:
{context}

Conversation History:
{memory}

User Question:
{message}

Respond naturally and provide helpful suggestions.
Do not give medical diagnosis.
Keep it supportive, concise, and professional.
"""

    # 5. Get AI Response
    ai_reply = generate_ai_response(prompt)
    
    if not ai_reply:
        return "The AI assistant is temporarily unavailable. Please try again.", session_id

    # 5b. Simple NLP for Reminders
    if "remind me" in message.lower():
        # Basic extraction: "remind me to [task]"
        # For a real app, we'd use Gemini to extract date/time, 
        # but here we'll just create a placeholder reminder.
        reminder_msg = message
        if ":" in message:
            reminder_msg = message.split(":", 1)[1].strip()
        
        created = create_user_reminder(email, f"Reminder set: {reminder_msg}")
        if created:
            ai_reply += "\n\n✅ **Reminder set!** I'll help you keep track of that."

    # 6. Save messages to history
    save_message(session_id, 'user', message)
    save_message(session_id, 'bot', ai_reply)
    
    return ai_reply, session_id

def create_user_reminder(email, message, reminder_time=None):
    """
    Logic to create reminders for the user.
    """
    try:
        Reminder.objects.create(
            user_email=email,
            message=message,
            scheduled_for=reminder_time or timezone.now()
        )
        return True
    except Exception as e:
        print(f"Reminder Error: {str(e)}")
        return False
