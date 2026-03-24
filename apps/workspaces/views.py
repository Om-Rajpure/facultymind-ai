from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Workspace, generate_join_code
from .serializers import WorkspaceSerializer
import random
import string

class WorkspaceCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkspaceSerializer

    def perform_create(self, serializer):
        join_code = generate_join_code()
        workspace = serializer.save(admin=self.request.user, join_code=join_code)
        
        # Automatically assign admin to this workspace
        user = self.request.user
        user.role = 'admin'
        user.workspace = workspace
        user.save()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_workspace_view(request):
    if request.user.role != 'admin':
        return Response({"error": "Only admins can create workspaces."}, status=status.HTTP_403_FORBIDDEN)
    
    name = request.data.get('name')
    if not name:
        return Response({"error": "Workspace name is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate unique join code with FAC prefix
        join_code = 'FAC' + ''.join(random.choices(string.digits, k=5))
        
        # Ensure uniqueness
        while Workspace.objects.filter(join_code=join_code).exists():
            join_code = 'FAC' + ''.join(random.choices(string.digits, k=5))

        # Ensure join_code is normalized at creation
        join_code = join_code.strip().upper()

        workspace = Workspace.objects.create(
            name=name,
            admin=request.user,
            join_code=join_code
        )
        
        user = request.user
        user.workspace = workspace
        user.save()
        
        return Response({
            "workspace_id": str(workspace.id),
            "join_code": workspace.join_code,
            "name": workspace.name
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Workspace creation error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_workspace_view(request):
    try:
        raw_code = request.data.get('join_code', '')
        # Normalize input
        join_code = raw_code.strip().upper()

        # Efficient case-insensitive query
        workspace = Workspace.objects.filter(join_code__iexact=join_code).first()

        if not workspace:
            return Response(
                {"error": "Invalid workspace code"},
                status=400
            )

        user = request.user
        # Assign workspace + role
        user.workspace = workspace
        user.role = "teacher"
        user.save()

        return Response({
            "message": "Joined successfully",
            "workspace": workspace.name
        }, status=200)

    except Exception as e:
        print("JOIN ERROR:", str(e))
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_workspace_view(request):
    if request.user.role != 'admin':
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
    
    workspace = request.user.workspace
    if not workspace:
        return Response({"error": "No workspace found for this admin."}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        "workspace_name": workspace.name,
        "join_code": workspace.join_code
    }, status=status.HTTP_200_OK)
