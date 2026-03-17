from django.urls import path
from .views import (
    GoogleLoginView, 
    SyncUserView,
    SetRoleView,
    SetupProfileView,
    create_workspace_view,
    my_workspace_view,
    join_workspace_view, 
    UserDetailView,
    VerifyAdminAccessView,
    SuperAdminUserListView,
    DeleteUserView
)

urlpatterns = [
    path('google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('sync-user/', SyncUserView.as_view(), name='sync_user'),
    path('set-role/', SetRoleView.as_view(), name='set_role'),
    path('setup-profile/', SetupProfileView.as_view(), name='setup_profile'),
    path('workspace/create/', create_workspace_view, name='workspace_create'),
    path('workspace/my-workspace/', my_workspace_view, name='my_workspace'),
    path('workspace/join/', join_workspace_view, name='workspace_join'),
    path('user/me/', UserDetailView.as_view(), name='user_me'),
    path('admin/verify-access/', VerifyAdminAccessView.as_view(), name='verify_admin_access'),
    path('superadmin/users/', SuperAdminUserListView.as_view(), name='superadmin_users'),
    path('superadmin/delete-user/<int:user_id>/', DeleteUserView.as_view(), name='delete_user'),
]
