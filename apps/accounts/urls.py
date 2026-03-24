from django.urls import path
from .views import (
    GoogleLoginView, 
    SyncUserView,
    SetRoleView,
    SetupProfileView,
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
    path('user/me/', UserDetailView.as_view(), name='user_me'),
    path('admin/verify-access/', VerifyAdminAccessView.as_view(), name='verify_admin_access'),
    path('superadmin/users/', SuperAdminUserListView.as_view(), name='superadmin_users'),
    path('superadmin/delete-user/<int:user_id>/', DeleteUserView.as_view(), name='delete_user'),
]
