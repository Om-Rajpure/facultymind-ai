from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
import os
from .models import User
from apps.workspaces.models import Workspace
from apps.assessments.models import Institution, Department, AssessmentResult
from .serializers import UserSerializer
from .permissions import IsAdminRole, IsSuperAdmin
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

class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class VerifyAdminAccessView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        password = request.data.get('password')
        admin_pass = os.getenv('ADMIN_TRAPDOOR_PASSWORD', 'om@123')
        if password == admin_pass:
            return Response({"success": True}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)

class SuperAdminUserListView(APIView):
    permission_classes = [IsAuthenticated]  # Require standard auth first

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
    permission_classes = [IsSuperAdmin] # Only superusers can delete

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
