import jwt
import requests
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()

# Clerk's JWKS endpoint for your instance
# The publishable key pk_test_Y3VkZGx5LXRyZWVmcm9nLTI0LmNsZXJrLmFjY291bnRzLmRldiQ
# decodes to domain: cuddly-treefrog-24.clerk.accounts.dev
CLERK_JWKS_URL = "https://cuddly-treefrog-24.clerk.accounts.dev/.well-known/jwks.json"

# Cache the JWKS keys to avoid fetching on every request
_cached_jwks = None


def _get_jwks():
    """Fetch and cache JWKS from Clerk."""
    global _cached_jwks
    if _cached_jwks is None:
        try:
            response = requests.get(CLERK_JWKS_URL, timeout=5)
            response.raise_for_status()
            _cached_jwks = response.json()
            print("✅ ClerkAuthentication: JWKS fetched successfully")
        except Exception as e:
            print(f"❌ ClerkAuthentication: Failed to fetch JWKS: {e}")
            raise exceptions.AuthenticationFailed(f"Failed to fetch JWKS: {e}")
    return _cached_jwks


def _get_rsa_key(token):
    """Extract the matching RSA public key from JWKS for the given token."""
    jwks = _get_jwks()
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    # Key not found - maybe JWKS was rotated. Clear cache and retry once.
    global _cached_jwks
    _cached_jwks = None
    jwks = _get_jwks()
    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    return None


class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Custom DRF authentication class that verifies Clerk JWT tokens.
    
    On success, returns (User, payload) where User is a Django User instance
    looked up by clerk_id. If the user doesn't exist yet (e.g. during sync),
    returns (payload_dict, None) so AllowAny views can still access the data.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        print("✅ ClerkAuthentication CALLED")

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            raise exceptions.AuthenticationFailed("Invalid token format")

        try:
            # Get the RSA public key matching the token's kid
            public_key = _get_rsa_key(token)

            if not public_key:
                raise exceptions.AuthenticationFailed("No matching public key found in JWKS")

            # Verify and decode the JWT with RS256
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_aud": False},
            )

            print(f"✅ ClerkAuthentication: Token verified, sub={payload.get('sub')}")

            clerk_id = payload.get("sub")
            if not clerk_id:
                raise exceptions.AuthenticationFailed("Invalid token: no 'sub' claim")

            # Try to find the Django user by clerk_id
            try:
                user = User.objects.get(clerk_id=clerk_id)
                print(f"✅ ClerkAuthentication: Found user {user.username}")
                return (user, payload)
            except User.DoesNotExist:
                # User not synced yet - return payload as a dict so sync-user can create them
                # This allows AllowAny views to proceed
                print(f"⚠️ ClerkAuthentication: No user for clerk_id={clerk_id}, returning payload")
                return (payload, None)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token: {str(e)}")
        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            print(f"❌ ClerkAuthentication: Unexpected error: {e}")
            raise exceptions.AuthenticationFailed(f"Authentication failed: {str(e)}")

    def authenticate_header(self, request):
        return "Bearer"
