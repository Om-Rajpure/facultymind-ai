from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Avg, Count, OuterRef, Subquery
from rest_framework import status
from .models import AssessmentResult, ChatSession, ChatMessage, Reminder, AdminMessage, Notification
from apps.accounts.models import User
from .serializers import AssessmentResultSerializer, ChatMessageSerializer, ChatSessionSerializer, ReminderSerializer
from ml_model.predict import predict_burnout

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
        
        user = request.user
        AssessmentResult.objects.create(
            user=user,
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
@permission_classes([IsAuthenticated])
def create_profile_view(request):
    try:
        data = request.data
        user = request.user
        user.first_name = data.get('name', '').split(' ')[0] if ' ' in data.get('name', '') else data.get('name', '')
        user.last_name = data.get('name', '').split(' ')[1] if ' ' in data.get('name', '') else ''
        user.age = data.get('age', user.age)
        user.experience = data.get('experience', user.experience)
        user.save()
        return Response({"message": "Profile updated"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ── Chatbot Views ──────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_chat_session(request):
    """Create or retrieve an active chat session for the user."""
    from .chatbot_engine import get_bot_response
    email = request.user.email
    name = request.user.get_full_name() or request.user.username

    # Get most recent session or create a new one
    session, created = ChatSession.objects.get_or_create(
        user=request.user,
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
@permission_classes([IsAuthenticated])
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
            user=request.user,
            user_email=request.user.email,
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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def create_reminder(request):
    """Create a reminder directly."""
    try:
        from datetime import datetime
        from apps.chatbot.services.chat_service import process_chat_message
        data = request.data
        scheduled_raw = data.get('scheduled_for')
        scheduled_dt = None
        if scheduled_raw:
            try:
                scheduled_dt = datetime.fromisoformat(scheduled_raw)
            except Exception:
                pass

        reminder = Reminder.objects.create(
            user=request.user,
            user_email=request.user.email,
            reminder_type=data.get('reminder_type', 'custom'),
            message=data.get('message', ''),
            scheduled_for=scheduled_dt,
        )
        return Response(ReminderSerializer(reminder).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_reminders(request):
    """List active reminders for the authenticated user."""
    reminders = Reminder.objects.filter(user=request.user, is_active=True).order_by('-created_at')
    return Response(ReminderSerializer(reminders, many=True).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_unified(request):
    """
    Unified chat endpoint mapping to the service layer.
    """
    data = request.data
    user_message = data.get('message', '').strip()
    user_id = data.get('user_id')
    email = data.get('email', '').strip()

    if not user_message:
        return Response({"reply": "Please provide a message."}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    email = user.email

    try:
        from apps.chatbot.services.chat_service import process_chat_message
        
        # Get existing session if possible
        session = ChatSession.objects.filter(user_email=email).order_by('-last_active').first()
        session_id = session.id if session else None
        
        reply, new_session_id = process_chat_message(email, user_message, session_id)
        
        return Response({
            "reply": reply,
            "session_id": new_session_id,
            "suggestions": [
                "Explain my burnout score",
                "What should I improve first?",
                "Give me stress tips",
                "Set a reminder"
            ]
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Chat API Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "reply": "The AI assistant is temporarily unavailable. Please try again."
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
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

    class _FakeSession:
        user_email = request.user.email

    ctx = _build_context(request.user.email, _FakeSession())
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_overview_view(request):
    """Get platform-wide burnout statistics for admin's workspace."""
    if request.user.role != 'admin' or not request.user.workspace:
        return Response({"error": "Admin access required with active workspace"}, status=status.HTTP_403_FORBIDDEN)
        
    total_teachers = User.objects.filter(workspace=request.user.workspace, role="teacher").count()
    total_assessments = AssessmentResult.objects.filter(user__workspace=request.user.workspace).count()
    average_score = AssessmentResult.objects.filter(user__workspace=request.user.workspace).aggregate(Avg("burnout_index"))["burnout_index__avg"] or 0
    high_risk_count = AssessmentResult.objects.filter(user__workspace=request.user.workspace, risk_level="High").count()
    
    return Response({
        "total_teachers": total_teachers,
        "total_assessments": total_assessments,
        "average_burnout_score": round(average_score, 1),
        "high_risk_count": high_risk_count
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_department_analytics_view(request):
    """Group burnout scores by department within admin's workspace."""
    if request.user.role != 'admin' or not request.user.workspace:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    analytics = AssessmentResult.objects.filter(user__workspace=request.user.workspace).values("user__department__name").annotate(
        avg_score=Avg("burnout_index"),
        assessment_count=Count("id")
    ).order_by('user__department__name')
    
    result = [
        {
            "department": entry["user__department__name"] or "Unknown",
            "avg_score": round(entry["avg_score"], 1) if entry["avg_score"] else 0,
            "assessment_count": entry["assessment_count"]
        } for entry in analytics
    ]
    
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_high_risk_view(request):
    """Return faculty whose latest burnout assessment is 'High' in admin's workspace."""
    if request.user.role != 'admin' or not request.user.workspace:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    latest_assessments = AssessmentResult.objects.filter(
        user=OuterRef('pk')
    ).order_by('-created_at')
    
    high_risk_faculty = User.objects.filter(workspace=request.user.workspace).annotate(
        latest_risk=Subquery(latest_assessments.values('risk_level')[:1]),
        latest_score=Subquery(latest_assessments.values('burnout_index')[:1]),
        latest_date=Subquery(latest_assessments.values('created_at')[:1])
    ).filter(latest_risk="High")
    
    result = [
        {
            "id": user.id,
            "name": user.get_full_name() or user.username,
            "department": user.department.name if user.department else "N/A",
            "burnout_score": round(user.latest_score, 1) if user.latest_score else 0,
            "risk_level": user.latest_risk,
            "assessment_date": user.latest_date.strftime('%Y-%m-%d') if user.latest_date else "N/A"
        } for user in high_risk_faculty
    ]
    
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_faculty_list_view(request):
    """Return teachers and their latest burnout result in admin's workspace."""
    if request.user.role != 'admin' or not request.user.workspace:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    latest_assessments = AssessmentResult.objects.filter(
        user=OuterRef('pk')
    ).order_by('-created_at')
    
    faculty = User.objects.filter(workspace=request.user.workspace, role="teacher").annotate(
        latest_risk=Subquery(latest_assessments.values('risk_level')[:1]),
        latest_score=Subquery(latest_assessments.values('burnout_index')[:1]),
        latest_date=Subquery(latest_assessments.values('created_at')[:1])
    )
    
    result = [
        {
            "id": user.id,
            "name": user.get_full_name() or user.username,
            "department": user.department.name if user.department else "N/A",
            "latest_burnout_score": round(user.latest_score, 1) if user.latest_score else 0,
            "risk_level": user.latest_risk or "N/A",
            "last_assessment_date": user.latest_date.strftime('%Y-%m-%d') if user.latest_date else "N/A"
        } for user in faculty
    ]
    
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_faculty_history_view(request, faculty_id):
    """Get all assessments for a specific faculty member."""
    assessments = AssessmentResult.objects.filter(user_id=faculty_id, user__workspace=request.user.workspace).order_by('-created_at')
    serializer = AssessmentResultSerializer(assessments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_send_message_view(request):
    """Admin sends a message to a teacher and creates a notification."""
    admin_id = request.data.get('admin_id')
    teacher_id = request.data.get('teacher_id')
    message_text = request.data.get('message')

    if not all([admin_id, teacher_id, message_text]):
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        admin = request.user
        if admin.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
            
        teacher = User.objects.get(id=teacher_id, workspace=admin.workspace)
        
        # Save message
        AdminMessage.objects.create(
            admin=admin,
            teacher=teacher,
            message=message_text
        )
        
        # Create notification for teacher
        Notification.objects.create(
            user=teacher,
            message=f"Message from Admin: {message_text[:50]}...",
            type='message'
        )
        
        return Response({"message": "Sent successfully"}, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({"error": "User not found in your workspace"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_ai_context_view(request):
    """Provide institutional context for Admin AI in admin's workspace."""
    if request.user.role != 'admin' or not request.user.workspace:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    total_teachers = User.objects.filter(workspace=request.user.workspace, role="teacher").count()
    total_assessments = AssessmentResult.objects.filter(user__workspace=request.user.workspace).count()
    high_risk_count = AssessmentResult.objects.filter(user__workspace=request.user.workspace, risk_level="High").count()
    
    dept_analytics = AssessmentResult.objects.filter(user__workspace=request.user.workspace).values("user__department__name").annotate(
        avg_score=Avg("burnout_index"),
        count=Count("id")
    )
    
    context_str = f"System Overview:\n"
    context_str += f"- Total Teachers: {total_teachers}\n"
    context_str += f"- Total Assessments: {total_assessments}\n"
    context_str += f"- High Risk Teachers: {high_risk_count}\n\n"
    context_str += "Department Breakdown:\n"
    for dept in dept_analytics:
        dept_name = dept['user__department__name'] or "General"
        context_str += f"- {dept_name}: Avg Burnout {round(dept['avg_score'] or 0, 1)}% ({dept['count']} assessments)\n"
    
    return Response({"context": context_str}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_notifications_view(request):
    """List notifications for the authenticated user."""
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:10]
    result = [
        {
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.strftime('%Y-%m-%d %H:%M')
        } for n in notifications
    ]
    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read_view(request, notification_id):
    """Mark a notification as read."""
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"status": "success"}, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_assessments_view(request):
    """List previous assessments for the authenticated user."""
    assessments = AssessmentResult.objects.filter(user=request.user).order_by('-created_at')
    serializer = AssessmentResultSerializer(assessments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
