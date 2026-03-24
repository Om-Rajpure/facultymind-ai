from django.db import models
from django.conf import settings
import uuid
import random
import string

def generate_join_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_workspaces')
    join_code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts_workspace'

    def save(self, *args, **kwargs):
        if self.join_code:
            self.join_code = self.join_code.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
