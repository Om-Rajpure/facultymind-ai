from django.urls import path
from .views import (
    predict_burnout_view, create_profile_view,
    start_chat_session, send_chat_message, chat_history,
    create_reminder, list_reminders,
    chat_unified, get_user_context, list_assessments_view,
    admin_overview_view, admin_department_analytics_view,
    admin_high_risk_view, admin_faculty_list_view,
    admin_faculty_history_view, admin_send_message_view, admin_ai_context_view,
    list_user_notifications_view, mark_notification_read_view,
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
    # Assessment list endpoint
    path('assessments/', list_assessments_view, name='list-assessments'),
    # Admin endpoints
    path('admin/overview/', admin_overview_view, name='admin-overview'),
    path('admin/department-analytics/', admin_department_analytics_view, name='admin-dept-analytics'),
    path('admin/high-risk/', admin_high_risk_view, name='admin-high-risk'),
    path('admin/faculty/', admin_faculty_list_view, name='admin-faculty-list'),
    path('admin/faculty/<int:faculty_id>/history/', admin_faculty_history_view, name='admin-faculty-history'),
    path('admin/send-message/', admin_send_message_view, name='admin-send-message'),
    path('admin/ai-context/', admin_ai_context_view, name='admin-ai-context'),
    # Notification endpoints
    path('notifications/', list_user_notifications_view, name='list-notifications'),
    path('notifications/<int:notification_id>/read/', mark_notification_read_view, name='mark-notification-read'),
]
