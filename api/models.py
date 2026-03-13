from django.db import models
from django.contrib.auth.models import User

class FacultyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    college_name = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.department}"

class BurnoutAssessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Feature Scores (Calculated from averages of 3 questions each)
    workload_score = models.FloatField()
    stress_score = models.FloatField()
    sleep_score = models.FloatField()
    work_life_balance_score = models.FloatField()
    job_satisfaction_score = models.FloatField()
    institutional_support_score = models.FloatField()
    
    # Prediction Results
    burnout_index = models.FloatField()
    risk_level = models.CharField(max_length=20) # Low, Medium, High
    
    def __str__(self):
        return f"{self.user.username} - {self.risk_level} ({self.created_at.date()})"
