from rest_framework import serializers
from .models import User
from apps.workspaces.models import Workspace

class UserSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'workspace', 'workspace_name', 'age', 'experience', 'department', 'institution']
        read_only_fields = ['id', 'username', 'email']
