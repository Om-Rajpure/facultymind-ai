from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string

def generate_join_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

import uuid

class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    admin = models.ForeignKey('User', on_delete=models.CASCADE, related_name='owned_workspaces')
    join_code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.join_code:
            self.join_code = self.join_code.strip().upper()
        super().save(*args, **kwargs)

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
        null=True,
        blank=True
    )
    workspace = models.ForeignKey(
        Workspace,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='members'
    )
    clerk_user_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True
    )
    
    # Profile fields moved from UserProfile
    age = models.IntegerField(null=True, blank=True)
    experience = models.IntegerField(null=True, blank=True)
    department = models.ForeignKey('assessment.Department', on_delete=models.SET_NULL, null=True, blank=True)
    institution = models.ForeignKey('assessment.Institution', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
