from django.urls import path
from .views import (
    predict_burnout_view, create_profile_view,
    start_chat_session, send_chat_message, chat_history,
    create_reminder, list_reminders,
    chat_unified, get_user_context,
)

urlpatterns = [
    path('predict-burnout/', predict_burnout_view, name='predict-burnout'),
    path('setup-profile/', create_profile_view, name='setup-profile'),
    # Unified chat endpoint (shorthand)
    path('chat/', chat_unified, name='chat-unified'),
    path('chat/context/', get_user_context, name='chat-context'),
    # Full session-based chat endpoints
    path('chat/start/', start_chat_session, name='chat-start'),
    path('chat/message/', send_chat_message, name='chat-message'),
    path('chat/history/<int:session_id>/', chat_history, name='chat-history'),
    # Reminder endpoints
    path('reminders/create/', create_reminder, name='reminder-create'),
    path('reminders/list/', list_reminders, name='reminder-list'),
]
