from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FacultyProfile, BurnoutAssessment
from .serializers import FacultyProfileSerializer, BurnoutAssessmentSerializer
from .ml_utils import predict_burnout

class BurnoutPredictionView(APIView):
    def post(self, request):
        data = request.data
        try:
            # Extract features from request
            # Expected format: { "age": X, "experience": Y, "responses": [v1, v2, ... v18] }
            age = data.get('age', 35)
            exp = data.get('experience', 10)
            responses = data.get('responses', [])
            
            if len(responses) != 18:
                return Response({"error": "Exactly 18 responses required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Group responses into 6 features
            features = []
            for i in range(0, 18, 3):
                avg = sum(responses[i:i+3]) / 3
                features.append(avg)
            
            # Combine all features for model: [age, exp, workload, stress, sleep, wlb, satisfaction, support]
            full_features = [age, exp] + features
            
            burnout_index, risk_level = predict_burnout(full_features)
            
            # Save assessment if user is authenticated
            if request.user.is_authenticated:
                BurnoutAssessment.objects.create(
                    user=request.user,
                    workload_score=features[0],
                    stress_score=features[1],
                    sleep_score=features[2],
                    work_life_balance_score=features[3],
                    job_satisfaction_score=features[4],
                    institutional_support_score=features[5],
                    burnout_index=burnout_index,
                    risk_level=risk_level
                )
            
            return Response({
                "burnout_index": burnout_index,
                "risk_level": risk_level,
                "factors": {
                    "workload": features[0],
                    "stress": features[1],
                    "sleep": features[2],
                    "work_life_balance": features[3],
                    "job_satisfaction": features[4],
                    "institutional_support": features[5]
                }
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        profile, created = FacultyProfile.objects.get_or_create(user=request.user)
        serializer = FacultyProfileSerializer(profile)
        return Response(serializer.data)
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        profile, created = FacultyProfile.objects.get_or_create(user=request.user)
        serializer = FacultyProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
