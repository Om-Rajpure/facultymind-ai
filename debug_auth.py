"""
Debug script to identify exactly which authentication class Django is using
and why 401 is being returned.

Run with: python debug_auth.py
"""
import os
import sys
import io

# Force UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

print("\n" + "=" * 70)
print("[DEBUG] AUTHENTICATION DEBUG REPORT")
print("=" * 70)

# 1. Print active authentication classes from settings
from django.conf import settings

rest_settings = getattr(settings, 'REST_FRAMEWORK', {})
print("\n[1] REST_FRAMEWORK SETTINGS:")
print(f"   DEFAULT_AUTHENTICATION_CLASSES: {rest_settings.get('DEFAULT_AUTHENTICATION_CLASSES')}")
print(f"   DEFAULT_PERMISSION_CLASSES: {rest_settings.get('DEFAULT_PERMISSION_CLASSES')}")

# 2. Print middleware
print(f"\n[2] MIDDLEWARE:")
for i, m in enumerate(settings.MIDDLEWARE):
    print(f"   {i}. {m}")

# 3. Print installed apps
print(f"\n[3] INSTALLED_APPS:")
for i, app in enumerate(settings.INSTALLED_APPS):
    print(f"   {i}. {app}")

# 4. Check if ClerkAuthentication can be imported and instantiated
print("\n[4] ClerkAuthentication CLASS CHECK:")
try:
    from apps.accounts.authentication import ClerkAuthentication
    auth = ClerkAuthentication()
    print(f"   OK - ClerkAuthentication imported and instantiated successfully")
    print(f"   Class: {ClerkAuthentication}")
    print(f"   Module: {ClerkAuthentication.__module__}")
except Exception as e:
    print(f"   FAILED: {e}")

# 5. Check SyncUserView's authentication_classes
print("\n[5] SyncUserView AUTH CLASS CHECK:")
try:
    from apps.accounts.views import SyncUserView
    print(f"   authentication_classes: {SyncUserView.authentication_classes}")
    print(f"   permission_classes: {SyncUserView.permission_classes}")
except Exception as e:
    print(f"   FAILED: {e}")

# 6. Check other views (which likely return 401)
print("\n[6] OTHER VIEW AUTH CLASS CHECKS:")
try:
    from apps.accounts.views import SetRoleView, SetupProfileView, UserDetailView
    print(f"   SetRoleView.authentication_classes: {getattr(SetRoleView, 'authentication_classes', 'NOT SET (uses default)')}")
    print(f"   SetRoleView.permission_classes: {SetRoleView.permission_classes}")
    print(f"   SetupProfileView.authentication_classes: {getattr(SetupProfileView, 'authentication_classes', 'NOT SET (uses default)')}")
    print(f"   UserDetailView.authentication_classes: {getattr(UserDetailView, 'authentication_classes', 'NOT SET (uses default)')}")
except Exception as e:
    print(f"   FAILED: {e}")

# 7. Simulate a request to sync-user using Django's test client
print("\n[7] SIMULATED REQUEST TO /api/accounts/sync-user/:")
print("-" * 50)
from django.test import RequestFactory
from apps.accounts.views import SyncUserView

factory = RequestFactory()

# Test WITHOUT token
print("\n   Test A: POST without Authorization header")
request = factory.post('/api/accounts/sync-user/', 
                       data='{"email":"test@test.com","name":"Test User"}',
                       content_type='application/json')
view = SyncUserView.as_view()
try:
    response = view(request)
    print(f"   Response status: {response.status_code}")
    print(f"   Response data: {response.data}")
except Exception as e:
    print(f"   Exception: {type(e).__name__}: {e}")

# Test WITH fake token
print("\n   Test B: POST with fake Bearer token")
request = factory.post('/api/accounts/sync-user/',
                       data='{"email":"test@test.com","name":"Test User"}',
                       content_type='application/json',
                       HTTP_AUTHORIZATION='Bearer fake_token_12345')
try:
    response = view(request)
    print(f"   Response status: {response.status_code}")
    print(f"   Response data: {response.data}")
except Exception as e:
    print(f"   Exception: {type(e).__name__}: {e}")

# 8. Check JWKS connectivity
print("\n[8] CLERK JWKS CONNECTIVITY:")
try:
    from apps.accounts.authentication import CLERK_JWKS_URL, _get_jwks
    import apps.accounts.authentication as auth_module
    print(f"   CLERK_JWKS_URL: {CLERK_JWKS_URL}")
    # Reset cache
    auth_module._cached_jwks = None
    jwks = _get_jwks()
    keys = jwks.get("keys", [])
    print(f"   OK - JWKS fetched - {len(keys)} key(s) found")
    for k in keys:
        print(f"      kid={k.get('kid')}, kty={k.get('kty')}, alg={k.get('alg')}")
except Exception as e:
    print(f"   JWKS FETCH FAILED: {e}")

# 9. Check the User model
print("\n[9] USER MODEL CHECK:")
from django.contrib.auth import get_user_model
User = get_user_model()
print(f"   AUTH_USER_MODEL: {settings.AUTH_USER_MODEL}")
print(f"   Resolved model: {User}")
print(f"   Has clerk_id field: {hasattr(User, 'clerk_id')}")
user_count = User.objects.count()
print(f"   Total users in DB: {user_count}")
if user_count > 0:
    for u in User.objects.all()[:5]:
        print(f"      - {u.username} | clerk_id={u.clerk_id} | email={u.email}")

print("\n" + "=" * 70)
print("[DEBUG] REPORT COMPLETE")
print("=" * 70)
