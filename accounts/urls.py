from django.urls import path
from .views import (
    GoogleLoginView, 
    SyncUserView,
    SetRoleView,
    SetupProfileView,
    WorkspaceCreateView, 
    WorkspaceJoinView, 
    UserDetailView
)

urlpatterns = [
    path('google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('sync-user/', SyncUserView.as_view(), name='sync_user'),
    path('set-role/', SetRoleView.as_view(), name='set_role'),
    path('setup-profile/', SetupProfileView.as_view(), name='setup_profile'),
    path('workspace/create/', WorkspaceCreateView.as_view(), name='workspace_create'),
    path('workspace/join/', WorkspaceJoinView.as_view(), name='workspace_join'),
    path('user/me/', UserDetailView.as_view(), name='user_me'),
]
