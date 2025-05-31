from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import User
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Session timeout in seconds (45 minutes)
SESSION_TIMEOUT = 45 * 60

class CustomTokenAuthentication(authentication.BaseAuthentication):
    """
    Custom token authentication for Django REST Framework.
    This class validates tokens in the format 'email:random_string'
    """
    
    def authenticate(self, request):
        # Get the token from various possible headers
        token = None
        
        # Check Authorization header (Bearer token)
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
        # Check for Token format
        elif auth_header.startswith('Token '):
            token = auth_header[6:]
        # Check for Basic auth format (decode and extract token part)
        elif auth_header.startswith('Basic '):
            try:
                import base64
                decoded = base64.b64decode(auth_header[6:]).decode('utf-8')
                if ':' in decoded:
                    username, password = decoded.split(':', 1)
                    # Use password as token
                    token = password
            except Exception as e:
                logger.error(f"Error decoding Basic auth: {str(e)}")
                pass
        
        # Check custom X-Token header
        if not token:
            token = request.META.get('HTTP_X_TOKEN')
        
        if not token:
            return None
        
        # Validate token
        try:
            # Check if token exists in cache
            cache_key = f'token_{token}'
            user_id = cache.get(cache_key)
            
            if not user_id:
                # If not in cache, check if a user with this email exists
                parts = token.split(':')
                if len(parts) != 2:
                    logger.error(f"Invalid token format: {token}")
                    return None
                    
                email = parts[0]
                
                try:
                    user = User.objects.get(email=email)
                    # Store in cache for future lookups with proper timeout
                    cache.set(cache_key, user.id, SESSION_TIMEOUT)
                    logger.info(f"Token validated and cached for user {user.id}")
                    user_id = user.id
                except User.DoesNotExist:
                    logger.error(f"User not found for email: {email}")
                    return None
            else:
                # Reset token expiry on successful validation
                # This is crucial for extending the session on activity
                cache.touch(cache_key, SESSION_TIMEOUT)
                logger.info(f"Token expiry extended for user {user_id}")
            
            # Get user from user_id
            user = User.objects.get(pk=user_id)
            return (user, token)
            
        except Exception as e:
            logger.error(f"Token authentication error: {str(e)}")
            return None
    
    def authenticate_header(self, request):
        return 'Bearer'