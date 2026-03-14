from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string

def generate_join_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    admin = models.ForeignKey('User', on_delete=models.CASCADE, related_name='administered_workspace')
    join_code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [
        ("teacher", "Teacher"),
        ("admin", "Admin")
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="teacher"
    )
    workspace = models.ForeignKey(
        Workspace,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='members'
    )
    
    # Profile fields moved from UserProfile
    age = models.IntegerField(null=True, blank=True)
    experience = models.IntegerField(null=True, blank=True)
    department = models.ForeignKey('assessment.Department', on_delete=models.SET_NULL, null=True, blank=True)
    institution = models.ForeignKey('assessment.Institution', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
