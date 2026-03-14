from rest_framework import serializers
from .models import User, Workspace

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'join_code', 'created_at']
        read_only_fields = ['join_code']

class UserSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'workspace', 'workspace_name']
        read_only_fields = ['id', 'username', 'email']
