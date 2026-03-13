from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FacultyProfile, BurnoutAssessment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class FacultyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = '__all__'

class BurnoutAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BurnoutAssessment
        fields = '__all__'
