from apps.assessments.models import ChatSession, ChatMessage

def get_session_memory(session_id, limit=5):
    """
    Retrieves the last N messages from a chat session.
    """
    try:
        messages = ChatMessage.objects.filter(session_id=session_id).order_by('-timestamp')[:limit]
        # Reverse to get chronological order
        memory_list = list(messages)[::-1]
        
        memory_str = ""
        for msg in memory_list:
            memory_str += f"{msg.role.capitalize()}: {msg.content}\n"
        
        return memory_str
    except Exception as e:
        print(f"Memory Error: {str(e)}")
        return ""

def save_message(session_id, role, content):
    """
    Saves a message to the database.
    """
    try:
        ChatMessage.objects.create(session_id=session_id, role=role, content=content)
    except Exception as e:
        print(f"Save Message Error: {str(e)}")
