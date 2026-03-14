from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Workspace, generate_join_code
from .serializers import UserSerializer, WorkspaceSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # This is a placeholder for the actual Google OAuth token exchange
        # For now, we simulate a successful login if email is provided
        email = request.data.get('email')
        name = request.data.get('name', '')
        
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': name.split(' ')[0] if ' ' in name else name,
                'last_name': name.split(' ')[1] if ' ' in name else ''
            }
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

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

class WorkspaceJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        join_code = request.data.get('join_code')
        if not join_code:
            return Response({"error": "Join code is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            workspace = Workspace.objects.get(join_code=join_code)
            user = request.user
            user.workspace = workspace
            user.role = 'teacher'
            user.save()
            return Response(UserSerializer(user).data)
        except Workspace.DoesNotExist:
            return Response({"error": "Invalid join code"}, status=status.HTTP_404_NOT_FOUND)

class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
