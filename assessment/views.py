from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import status
from .models import UserProfile, AssessmentResult, ChatSession, ChatMessage, Reminder
from .serializers import AssessmentResultSerializer, ChatMessageSerializer, ChatSessionSerializer, ReminderSerializer
from ml_model.predict import predict_burnout

@api_view(['POST'])
@permission_classes([AllowAny])
def predict_burnout_view(request):
    data = request.data
    try:
        features = [
            float(data.get('workload', 3.0)),
            float(data.get('stress', 3.0)),
            float(data.get('sleep', 3.0)),
            float(data.get('balance', 3.0)),
            float(data.get('satisfaction', 3.0)),
            float(data.get('support', 3.0)),
            int(data.get('age', 35)),
            int(data.get('experience', 10))
        ]
        prediction_result = predict_burnout(features)
        
        email = data.get('email')
        user_profile = None
        if email:
            user_profile = UserProfile.objects.filter(email=email).first()

        if user_profile:
            AssessmentResult.objects.create(
                user=user_profile,
                workload_score=features[0],
                stress_score=features[1],
                sleep_score=features[2],
                balance_score=features[3],
                satisfaction_score=features[4],
                support_score=features[5],
                burnout_index=prediction_result['burnout_index'],
                risk_level=prediction_result['risk_level']
            )
        return Response(prediction_result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_profile_view(request):
    try:
        data = request.data
        profile, created = UserProfile.objects.update_or_create(
            email=data.get('email'),
            defaults={
                'name': data.get('name'),
                'role': data.get('role', 'teacher'),
                'age': data.get('age', 30),
                'experience': data.get('experience', 5),
            }
        )
        return Response({"message": "Profile saved", "email": profile.email}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ── Chatbot Views ──────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def start_chat_session(request):
    """Create or retrieve an active chat session for the user."""
    from .chatbot_engine import get_bot_response
    email = request.data.get('email', '')
    name = request.data.get('name', 'Professor')

    if not email:
        return Response({"error": "email is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Get most recent session or create a new one
    session, created = ChatSession.objects.get_or_create(
        user_email=email,
        defaults={'user_name': name}
    )
    if not created:
        session.user_name = name
        session.save()

    if created:
        # Generate a personalized welcome message
        greeting_response = get_bot_response("hello", session)
        welcome_msg = greeting_response['message']
        ChatMessage.objects.create(session=session, role='bot', content=welcome_msg)

    messages = session.messages.order_by('-timestamp')[:20]
    messages_data = ChatMessageSerializer(reversed(list(messages)), many=True).data

    return Response({
        "session_id": session.id,
        "user_email": session.user_email,
        "user_name": session.user_name,
        "messages": messages_data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_chat_message(request):
    """Process a user message and return bot response."""
    from .chatbot_engine import get_bot_response
    session_id = request.data.get('session_id')
    user_message = request.data.get('message', '').strip()

    if not session_id or not user_message:
        return Response({"error": "session_id and message are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = ChatSession.objects.get(id=session_id)
    except ChatSession.DoesNotExist:
        return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

    # Save user message
    ChatMessage.objects.create(session=session, role='user', content=user_message)

    # Generate bot response
    bot_response = get_bot_response(user_message, session)
    bot_message = bot_response.get('message', "I'm here to help! Please tell me more.")
    
    # Save bot message
    bot_msg_obj = ChatMessage.objects.create(session=session, role='bot', content=bot_message)

    # Handle reminder creation if detected
    reminder_data = bot_response.get('reminder_detected')
    if reminder_data and reminder_data.get('user_email'):
        from datetime import datetime
        scheduled = reminder_data.get('scheduled_for')
        scheduled_dt = None
        if scheduled:
            try:
                scheduled_dt = datetime.fromisoformat(scheduled)
            except Exception:
                pass

        Reminder.objects.create(
            user_email=reminder_data['user_email'],
            reminder_type=reminder_data.get('reminder_type', 'custom'),
            message=reminder_data.get('message', user_message),
            scheduled_for=scheduled_dt
        )

    return Response({
        "bot_message": {
            "id": bot_msg_obj.id,
            "role": "bot",
            "content": bot_message,
            "timestamp": bot_msg_obj.timestamp,
        },
        "suggested_chips": bot_response.get('suggested_chips', []),
        "reminder_created": reminder_data is not None,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def chat_history(request, session_id):
    """Fetch paginated chat history for a session."""
    try:
        session = ChatSession.objects.get(id=session_id)
    except ChatSession.DoesNotExist:
        return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

    messages = session.messages.order_by('timestamp')
    data = ChatMessageSerializer(messages, many=True).data
    return Response({"session_id": session_id, "messages": data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_reminder(request):
    """Create a reminder directly."""
    try:
        from datetime import datetime
        data = request.data
        scheduled_raw = data.get('scheduled_for')
        scheduled_dt = None
        if scheduled_raw:
            try:
                scheduled_dt = datetime.fromisoformat(scheduled_raw)
            except Exception:
                pass

        reminder = Reminder.objects.create(
            user_email=data.get('user_email', ''),
            reminder_type=data.get('reminder_type', 'custom'),
            message=data.get('message', ''),
            scheduled_for=scheduled_dt,
        )
        return Response(ReminderSerializer(reminder).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_reminders(request):
    """List active reminders for a user email."""
    email = request.query_params.get('email', '')
    if not email:
        return Response({"error": "email query param required"}, status=status.HTTP_400_BAD_REQUEST)
    reminders = Reminder.objects.filter(user_email=email, is_active=True).order_by('-created_at')
    return Response(ReminderSerializer(reminders, many=True).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_unified(request):
    """
    Unified Gemini-powered chat endpoint with debug logging.
    POST /api/chat/
    Body: { "user_id": 1, "message": "..." } OR { "email": "...", "message": "..." }
    """
    from .chatbot_engine import _build_context
    from backend.chatbot.gemini_service import ask_gemini
    
    data = request.data
    user_id = data.get('user_id')
    email = data.get('email', '').strip()
    user_message = data.get('message', '').strip()

    print(f"DEBUG: Received message: '{user_message}' for user_id: {user_id} or email: {email}")

    if not user_id and not email:
        return Response({"reply": "user_id or email is required"}, status=status.HTTP_400_BAD_REQUEST)
    if not user_message:
        return Response({"reply": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Resolve user
    user_profile = UserProfile.objects.filter(Q(id=user_id) | Q(email=email)).first()
    
    if user_profile:
        email = user_profile.email
        name = user_profile.name
    else:
        name = "Professor"
        email = email or "guest@facultymind.ai"

    # Get or create session
    session, created = ChatSession.objects.get_or_create(
        user_email=email,
        defaults={'user_name': name}
    )

    # Save user message
    ChatMessage.objects.create(session=session, role='user', content=user_message)

    # Fetch context from database
    ctx_data = _build_context(email, session)
    
    # Construct context string for Gemini
    context_str = f"""
Name: {name}
Department: {ctx_data.get('department', 'Engineering')}
Burnout Index: {ctx_data.get('burnout_index', 'Not assessed')}
Risk Level: {ctx_data.get('risk_level', 'Unknown')}
Stress Score: {ctx_data.get('scores', {}).get('stress_score', 'N/A')}
Workload Score: {ctx_data.get('scores', {}).get('workload_score', 'N/A')}
Sleep Score: {ctx_data.get('scores', {}).get('sleep_score', 'N/A')}
"""

    try:
        # Using the new ask_gemini with message and context
        bot_text = ask_gemini(user_message, context_str)
    except Exception as e:
        print(f"DEBUG: Gemini call failed with error: {str(e)}")
        bot_text = None

    if not bot_text:
        bot_text = "Sorry, the AI assistant is temporarily unavailable."

    # Suggested actions/chips
    from .chatbot_engine import _handle_fallback
    chips = _handle_fallback(ctx_data).get('suggested_chips', [])

    # Save bot message
    bot_msg = ChatMessage.objects.create(session=session, role='bot', content=bot_text)

    return Response({
        "reply": bot_text,
        "suggestions": chips,
        "session_id": session.id,
        "timestamp": bot_msg.timestamp,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_context(request):
    """
    GET /api/chat/context/?email=...
    Returns the full context object used by the chatbot engine
    (for frontend to display: burnout index, risk, top factors, etc.)
    """
    from .chatbot_engine import _build_context
    email = request.query_params.get('email', '')
    if not email:
        return Response({"error": "email query param required"}, status=status.HTTP_400_BAD_REQUEST)

    # Create a dummy session-like obj to satisfy the function signature
    class _FakeSession:
        user_email = email

    ctx = _build_context(email, _FakeSession())
    # Return only safe, serializable fields
    return Response({
        "name":            ctx.get('name', 'Professor'),
        "has_assessment":  ctx.get('has_assessment', False),
        "burnout_index":   ctx.get('burnout_index'),
        "risk_level":      ctx.get('risk_level'),
        "top_factors":     [(name, round(score, 2)) for name, score in ctx.get('top_factors_list', [])],
        "department":      ctx.get('department', ''),
        "experience":      ctx.get('experience'),
        "age":             ctx.get('age'),
        "assessment_date": ctx.get('assessment_date'),
    }, status=status.HTTP_200_OK)
