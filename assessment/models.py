from django.db import models
from django.conf import settings

class Institution(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Department(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.institution.name})"

class AssessmentResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_results', null=True, blank=True)
    workload_score = models.FloatField()
    stress_score = models.FloatField()
    sleep_score = models.FloatField()
    balance_score = models.FloatField()
    satisfaction_score = models.FloatField()
    support_score = models.FloatField()
    burnout_index = models.FloatField()
    risk_level = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Guest'} - {self.risk_level} ({self.created_at.strftime('%Y-%m-%d')})"


class ChatSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_sessions', null=True, blank=True)
    user_email = models.EmailField()
    user_name = models.CharField(max_length=255, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session: {self.user_email} ({self.created_at.strftime('%Y-%m-%d')})"


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('bot', 'Bot'),
    ]
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"


class Reminder(models.Model):
    REMINDER_TYPES = [
        ('assessment', 'Assessment Retake'),
        ('break', 'Break Reminder'),
        ('sleep', 'Sleep Reminder'),
        ('stress', 'Stress Check'),
        ('custom', 'Custom'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    user_email = models.EmailField()
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES, default='custom')
    message = models.TextField()
    scheduled_for = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.reminder_type}] {self.user_email} — {self.message[:50]}"


class AdminMessage(models.Model):
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='sent') # sent, read

    def __str__(self):
        return f"From {self.admin.username} to {self.teacher.username} at {self.timestamp}"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    type = models.CharField(max_length=50, default='info') # info, message, alert
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}"
