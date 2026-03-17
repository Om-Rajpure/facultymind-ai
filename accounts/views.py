from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Workspace, generate_join_code
from assessment.models import Institution, Department
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

class SyncUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        clerk_id = request.data.get('clerk_id')
        email = request.data.get('email')
        name = request.data.get('name', '')
        
        if not clerk_id or not email:
            return Response({"error": "clerk_id and email are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user, created = User.objects.get_or_create(
            clerk_user_id=clerk_id,
            defaults={
                'email': email,
                'username': email.split('@')[0],
                'first_name': name.split(' ')[0] if ' ' in name else name,
                'last_name': name.split(' ')[1] if ' ' in name else ''
            }
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': user.role,
                'workspace': user.workspace.id if user.workspace else None,
                'age': user.age,
                'department': user.department.name if user.department else None,
                'experience': user.experience,
                'institution': user.institution.name if user.institution else None
            }
        })

class SetRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        if role not in ['teacher', 'admin']:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.role = role
        user.save()
        return Response({"role": user.role}, status=status.HTTP_200_OK)

class SetupProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        user = request.user
        
        try:
            # Handle profile fields
            user.first_name = data.get('name', '').split(' ')[0] if ' ' in data.get('name', '') else data.get('name', '')
            user.last_name = data.get('name', '').split(' ')[1] if ' ' in data.get('name', '') else ''
            user.age = data.get('age')
            user.experience = data.get('experience')
            
            # Handle Institution and Department
            inst_name = data.get('institution')
            dept_name = data.get('department')
            
            if inst_name:
                institution, _ = Institution.objects.get_or_create(name=inst_name)
                user.institution = institution
                
                if dept_name:
                    department, _ = Department.objects.get_or_create(institution=institution, name=dept_name)
                    user.department = department
            
            user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
