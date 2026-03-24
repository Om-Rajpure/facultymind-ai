from django.urls import path
from .views import (
    create_workspace_view,
    my_workspace_view,
    join_workspace_view
)

urlpatterns = [
    path('create/', create_workspace_view, name='workspace_create'),
    path('my-workspace/', my_workspace_view, name='my_workspace'),
    path('join/', join_workspace_view, name='workspace_join'),
]
