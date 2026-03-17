from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Workspace, generate_join_code
from assessment.models import Institution, Department
from .serializers import UserSerializer, WorkspaceSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from assessment.models import AssessmentResult

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_workspace_view(request):
    print("User:", request.user)
    print("Role:", request.user.role)
    
    if request.user.role != 'admin':
        return Response({"error": "Only admins can create workspaces."}, status=status.HTTP_403_FORBIDDEN)
    
    name = request.data.get('name')
    if not name:
        return Response({"error": "Workspace name is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate unique join code with FAC prefix
        import random, string
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
        print("RAW CODE:", repr(raw_code))

        # Normalize input
        join_code = raw_code.strip().upper()
        print("NORMALIZED CODE:", repr(join_code))

        from accounts.models import Workspace

        # Efficient case-insensitive query
        workspace = Workspace.objects.filter(join_code__iexact=join_code).first()
        print("WORKSPACE FOUND:", workspace)

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
    print("DEBUG: Fetching workspace for user:", request.user.email)
    print("DEBUG: User Role:", request.user.role)
    
    if request.user.role != 'admin':
        print("DEBUG: Access denied - Not an admin")
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
    
    workspace = request.user.workspace
    if not workspace:
        print("DEBUG: No workspace linked to this user")
        return Response({"error": "No workspace found for this admin."}, status=status.HTTP_404_NOT_FOUND)
    
    print("DEBUG: Found workspace:", workspace.name, "Join Code:", workspace.join_code)
    return Response({
        "workspace_name": workspace.name,
        "join_code": workspace.join_code
    }, status=status.HTTP_200_OK)

class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class VerifyAdminAccessView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        password = request.data.get('password')
        if password == "om@123":
            return Response({"success": True}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)

class SuperAdminUserListView(APIView):
    permission_classes = [AllowAny]  # In a real app, this would be more restricted

    def get(self, request):
        print("Fetching all users for super admin")
        users = User.objects.all()
        data = []
        for user in users:
            # Get latest assessment
            latest_assessment = AssessmentResult.objects.filter(user=user).order_by('-created_at').first()
            risk_level = "N/A"
            if latest_assessment:
                risk_level = latest_assessment.risk_level

            data.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "role": user.role,
                "workspace": user.workspace.name if user.workspace else "N/A",
                "workspace_code": user.workspace.join_code if user.workspace else None,
                "department": user.department.name if user.department else "N/A",
                "risk_level": risk_level
            })
        return Response(data, status=status.HTTP_200_OK)

class DeleteUserView(APIView):
    permission_classes = [AllowAny] # Protecting later with token

    def delete(self, request, user_id):
        print(f"Deleting user: {user_id}")
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
