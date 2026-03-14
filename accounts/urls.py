from django.urls import path
from .views import (
    GoogleLoginView, 
    WorkspaceCreateView, 
    WorkspaceJoinView, 
    UserDetailView
)

urlpatterns = [
    path('google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('workspace/create/', WorkspaceCreateView.as_view(), name='workspace_create'),
    path('workspace/join/', WorkspaceJoinView.as_view(), name='workspace_join'),
    path('user/me/', UserDetailView.as_view(), name='user_me'),
]
