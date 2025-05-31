import json
import logging
import os
import random
import secrets
import string
import time
import uuid
import requests
from datetime import datetime, timedelta

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.cache import cache
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string, get_template
from django.utils.html import strip_tags

from .models import OTP, UserProfile

# Set up logger
logger = logging.getLogger(__name__)

# reCAPTCHA verification
def verify_recaptcha(token):
    """
    Verify reCAPTCHA token with Google's reCAPTCHA API
    """
    try:
        # In development mode, always return True
        # REMOVE THIS IN PRODUCTION!
        logger.info("DEVELOPMENT MODE: CAPTCHA verification bypassed")
        return True
        
        # The code below will be executed in production
        if not token:
            logger.error("CAPTCHA token is missing")
            return False

        recaptcha_secret = getattr(settings, 'RECAPTCHA_SECRET_KEY', '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe')  # Use test key if not defined
        verification_url = 'https://www.google.com/recaptcha/api/siteverify'
        data = {
            'secret': recaptcha_secret,
            'response': token
        }
        
        logger.info(f"Verifying CAPTCHA token: {token[:20]}...")
        response = requests.post(verification_url, data=data)
        result = response.json()
        
        logger.info(f"CAPTCHA verification result: {result}")
        
        # If using test keys, always return True for development
        if recaptcha_secret == '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe':
            logger.info("Using test reCAPTCHA keys - bypassing verification")
            return True
            
        return result.get('success', False)
    except Exception as e:
        logger.error(f"reCAPTCHA verification error: {str(e)}")
        return False

# Token validation function
def token_validate(token):
    """
    Validate authentication token and return user ID
    This is a simplified implementation - in production,
    you would use a more secure token validation system
    """
    try:
        # For now, we'll assume the token is just a base64 encoded email:random_string
        # In production, use JWT or another secure token system
        decoded_token = token
        
        # Check if token exists in cache
        cache_key = f'token_{decoded_token}'
        user_id = cache.get(cache_key)
        
        if user_id:
            # Reset expiry on successful validation (45 minutes)
            cache.touch(cache_key, 45 * 60)
            logger.info(f"Extended token expiry for user_id: {user_id}")
            return user_id
        
        # If not in cache, check if a user with this email exists
        parts = decoded_token.split(':')
        if len(parts) != 2:
            raise ValueError("Invalid token format")
            
        email = parts[0]
        
        try:
            user = User.objects.get(email=email)
            
            # Store in cache for future lookups with 45 minutes expiry
            cache.set(cache_key, user.id, 45 * 60)
            logger.info(f"New token cached for user_id: {user.id}")
            
            return user.id
        except User.DoesNotExist:
            raise ValueError("User not found")
            
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise ValueError("Invalid token")

# Rate limiting helper function
def check_rate_limit(key, limit=5, period=300, increment=1):
    """
    Check if the rate limit has been exceeded, with progressive rate limiting
    
    :param key: The rate limiting key
    :param limit: Number of allowed requests
    :param period: Time period in seconds
    :param increment: Value to increment counter by (defaults to 1)
    :return: Tuple (bool, current_count) - True if rate limit exceeded, False otherwise, along with current count
    """
    current = cache.get(key, 0)
    if current >= limit:
        # Apply exponential backoff to persistent offenders
        # The more times they hit the limit, the longer they need to wait
        attempts_over_limit = cache.get(f"{key}_over_limit", 0)
        if attempts_over_limit > 0:
            # Create longer ban time for persistent rate limit violators
            # Each time they hit the limit again while already limited, extend time
            extended_period = period * (2 ** min(attempts_over_limit, 5))  # Cap at 32x to avoid overflow
            cache.set(f"{key}_over_limit", attempts_over_limit + 1, extended_period)
            return True, current
        else:
            # First time hitting the limit
            cache.set(f"{key}_over_limit", 1, period * 2)  # Initial extended period
        return True, current
    
    # Increment the counter by the specified amount
    cache.set(key, current + increment, period)
    return False, current + increment

def generate_random_password():
    """Generate a secure random password"""
    chars = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(chars) for _ in range(16))

def send_otp_email(email, otp, purpose="registration"):
    subject = f'Your OTP for {purpose.capitalize()}'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    # For production environment, we don't want to print OTP in console
    # Just log that an OTP was generated (without the actual OTP value)
    logger.info(f"OTP generated for {email} ({purpose})")
    
    # Send actual email using direct SMTP
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        # Define a context for the email template
        context = {
            'otp': otp,
            'purpose': purpose,
            'expiry_time': settings.OTP_EXPIRY_TIME
        }
        
        # Try to render the email template with context
        try:
            # Render the email template with context
            html_message = render_to_string('email_templates/otp_email.html', context)
            # Plain text alternative
            plain_message = strip_tags(html_message)
        except Exception as template_error:
            logger.error(f"Template rendering error: {str(template_error)}")
            # Fallback to simple message if template fails
            html_message = f"""
            <html>
            <body>
                <h2>Your OTP for {purpose}</h2>
                <p>Your One-Time Password is: <strong>{otp}</strong></p>
                <p>This OTP will expire in {settings.OTP_EXPIRY_TIME} minutes.</p>
            </body>
            </html>
            """
            plain_message = f"Your OTP for {purpose} is: {otp}. This will expire in {settings.OTP_EXPIRY_TIME} minutes."
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = email
        
        part1 = MIMEText(plain_message, 'plain')
        part2 = MIMEText(html_message, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Connect to SMTP server
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        
        # Only enable debug level in development mode
        if settings.DEBUG:
            server.set_debuglevel(1)
        
        # Identify ourselves to the server
        server.ehlo()
        
        # If using TLS, start TLS
        if settings.EMAIL_USE_TLS:
            server.starttls()
            server.ehlo()  # Need to re-identify after TLS
        
        # Login
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        
        # Send email
        server.sendmail(from_email, [email], msg.as_string())
        
        # Close connection
        server.quit()
        
        logger.info(f"Email sent successfully to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        # Only print detailed error info in debug mode
        if settings.DEBUG:
            import traceback
            traceback.print_exc()
        return False

@csrf_exempt
def register(request):
    """Handle user registration request"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        captcha_token = data.get('captchaToken')

        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)

        # Verify CAPTCHA token
        if not verify_recaptcha(captcha_token):
            return JsonResponse({'error': 'CAPTCHA verification failed'}, status=400)

        # Check rate limit
        # rate_limit_key = f'register_attempt_{email}'
        # if check_rate_limit(rate_limit_key, limit=10, period=180):
        #     return JsonResponse({'error': 'Too many registration attempts. Please try again later.'}, status=429)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
            
        # Generate and save OTP
        otp_value = OTP.generate_otp()
        otp = OTP.objects.create(email=email, otp=otp_value)
        
        # Send OTP via email
        send_otp_email(email, otp_value, purpose="registration")
        
        # Return success response without including the OTP value
        return JsonResponse({
            'message': 'OTP sent successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in register view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def verify_otp(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
            
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp_value = data.get('otp')
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        gender = data.get('gender', '')
        phone = data.get('phone', '')
        
        # Check rate limit - DISABLED to fix OTP verification issues
        # rate_limit_key = f'verify_otp_attempt_{email}'
        # if check_rate_limit(rate_limit_key, limit=3, period=180):
        #     return JsonResponse({'error': 'Too many verification attempts. Please try again later.'}, status=429)
        
        otp = OTP.objects.filter(email=email, is_verified=False).order_by('-created_at').first()
        
        if not otp:
            return JsonResponse({'error': 'No OTP found'}, status=400)
        
        if otp.is_expired():
            return JsonResponse({'error': 'OTP has expired'}, status=400)
        
        if otp.otp != otp_value:
            return JsonResponse({'error': 'Invalid OTP'}, status=400)
        
        # Generate a random secure password for the user
        random_password = generate_random_password()
        
        # Create user with random password
        username = email.split('@')[0] + str(uuid.uuid4())[:8]  # Generate unique username
        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=random_password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Update user profile instead of creating a new one (signals already created it)
        # Get the profile that was automatically created by the signal
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update the profile with the additional information
        user_profile.phone_number = phone
        user_profile.gender = gender
        user_profile.is_email_verified = True
        user_profile.save()
        
        # Mark OTP as verified
        otp.is_verified = True
        otp.save()
        
        return JsonResponse({'message': 'Registration successful'})
        
    except Exception as e:
        logger.error(f"Error in verify_otp view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def login_request_otp(request):
    """Handle login OTP request"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        phone = data.get('phone')
        captcha_token = data.get('captchaToken')

        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)

        # Verify CAPTCHA token
        if not verify_recaptcha(captcha_token):
            return JsonResponse({'error': 'CAPTCHA verification failed'}, status=400)

        # Check for user existence first to see if account is locked
        try:
            user = User.objects.get(email=email)
            user_profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Check if account is locked out
            if user_profile.is_locked_out():
                # Calculate remaining lockout time in minutes
                remaining_time = None
                if user_profile.lockout_until:
                    time_diff = user_profile.lockout_until - timezone.now()
                    remaining_time = max(0, int(time_diff.total_seconds() / 60))
                
                if remaining_time and remaining_time > 0:
                    return JsonResponse({
                        'error': f'Account temporarily locked due to too many failed attempts. Try again in {remaining_time} minutes.'
                    }, status=403)
                
        except User.DoesNotExist:
            # Don't reveal if user exists for security, proceed with rate limiting
            pass

        # Check rate limit
        rate_limit_key = f'login_attempt_{email}'
        is_limited, current_attempts = check_rate_limit(rate_limit_key, limit=5, period=300)
        if is_limited:
            return JsonResponse({
                'error': 'Too many login attempts. Please try again later.',
                'attempts': current_attempts
            }, status=429)

        # Check if user exists (again if we didn't already)
        if 'user' not in locals() or not user:
            if not User.objects.filter(email=email).exists():
                # Apply a higher increment to rate limit for non-existent users
                # to prevent user enumeration attacks
                check_rate_limit(rate_limit_key, limit=5, period=300, increment=2)
                return JsonResponse({'error': 'User does not exist'}, status=400)
            
        # Generate and save OTP
        otp_value = OTP.generate_otp()
        otp = OTP.objects.create(email=email, otp=otp_value)
        
        # Send OTP via email
        send_otp_email(email, otp_value, purpose="login")
        
        # Return success response without including the OTP value
        return JsonResponse({
            'message': 'Login OTP sent successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in login_request_otp view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def login_verify_otp(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
            
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp_value = data.get('otp')
        
        # Get client information for security logging
        ip_address = request.META.get('REMOTE_ADDR', 'Unknown')
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
        
        logger.info(f"OTP verification attempt for {email} from IP: {ip_address}")
        
        # Find the user by email first to check if account is locked
        try:
            user = User.objects.get(email=email)
            user_profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Check if account is locked out
            if user_profile.is_locked_out():
                # Calculate remaining lockout time in minutes
                remaining_time = None
                if user_profile.lockout_until:
                    time_diff = user_profile.lockout_until - timezone.now()
                    remaining_time = max(0, int(time_diff.total_seconds() / 60))
                
                if remaining_time and remaining_time > 0:
                    logger.warning(f"Account {email} is locked out for {remaining_time} more minutes")
                    return JsonResponse({
                        'error': f'Account temporarily locked due to too many failed attempts. Try again in {remaining_time} minutes.'
                    }, status=403)
                
        except User.DoesNotExist:
            # Don't reveal if user exists for security, just continue with rate limiting
            logger.info(f"User {email} not found during OTP verification")
            pass
        
        # Check rate limit with increased penalty for OTP verification
        rate_limit_key = f'login_verify_attempt_{email}'
        is_limited, current_attempts = check_rate_limit(rate_limit_key, limit=3, period=180)
        if is_limited:
            logger.warning(f"Rate limit exceeded for {email}: {current_attempts} attempts")
            return JsonResponse({
                'error': 'Too many verification attempts. Please try again later.',
                'attempts': current_attempts
            }, status=429)
        
        # Verify OTP
        otp = OTP.objects.filter(email=email, is_verified=False).order_by('-created_at').first()
        
        if not otp:
            logger.warning(f"No OTP found for {email}")
            return JsonResponse({'error': 'No OTP found'}, status=400)
        
        if otp.is_expired():
            logger.warning(f"Expired OTP for {email}")
            return JsonResponse({'error': 'OTP has expired'}, status=400)
        
        if otp.otp != otp_value:
            logger.warning(f"Invalid OTP provided for {email}")
            
            # Handle failed OTP verification - increment failed login attempts
            if 'user' in locals() and user and user_profile:
                security_result = user_profile.increment_failed_attempts()
                logger.info(f"Security result for {email}: {security_result}")
                
                # Check if we should send a security alert
                if security_result['should_send_alert']:
                    logger.warning(f"Security alert triggered for {email} - brute force: {security_result['is_brute_force']}")
                    
                    # Prepare alert details
                    if security_result['is_brute_force']:
                        alert_type = 'brute_force'
                        details = f"Possible brute force attack detected. Rapid successive failed login attempts. Failed attempts: {user_profile.failed_login_attempts}"
                    else:
                        alert_type = 'multiple_failed_attempts'
                        details = f"Multiple failed login attempts detected. Failed attempts: {user_profile.failed_login_attempts}"
                    
                    logger.warning(f"Sending security alert email for {email} - type: {alert_type}")
                    
                    # Send security alert emails
                    alert_sent = send_security_alert_email(
                        email=email,
                        alert_type=alert_type,
                        details=details,
                        ip_address=ip_address,
                        user_agent=user_agent
                    )
                    
                    if alert_sent:
                        logger.info(f"Security alert email sent successfully to {email}")
                    else:
                        logger.error(f"Failed to send security alert email to {email}")
                
                if security_result['is_locked']:
                    remaining_time = int((user_profile.lockout_until - timezone.now()).total_seconds() / 60)
                    logger.warning(f"Account {email} has been locked due to too many failed attempts")
                    return JsonResponse({
                        'error': f'Account temporarily locked due to too many failed attempts. Try again in {remaining_time} minutes.'
                    }, status=403)
            
            # Apply a higher increment to the rate limit for failed OTP
            check_rate_limit(rate_limit_key, limit=3, period=180, increment=2)
            
            return JsonResponse({'error': 'Invalid OTP'}, status=400)
        
        # Mark OTP as verified
        otp.is_verified = True
        otp.save()
        
        # Find the user by email (again, if we didn't already)
        if 'user' not in locals() or not user:
            try:
                user = User.objects.get(email=email)
                user_profile, created = UserProfile.objects.get_or_create(user=user)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=400)
        
        # Reset failed login attempts as login was successful
        user_profile.reset_failed_attempts()
        
        # Login user
        login(request, user)
        
        # Generate an authentication token
        # In a production environment, use a proper token generation library like JWT
        random_part = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        token = f"{email}:{random_part}"
        
        # Store token in cache - Set session expiry to 45 minutes for idle timeout
        cache.set(f'token_{token}', user.id, 45 * 60)
        
        # Get complete user profile details
        try:
            user_profile = UserProfile.objects.get(user=user)
            
            # Update last login time
            user.last_login = timezone.now()
            user.save()
            
            # Format dates for JSON response
            dob_formatted = user_profile.dob.strftime('%Y-%m-%d') if user_profile.dob else None
            last_login_formatted = user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else None
            date_joined_formatted = user.date_joined.strftime('%Y-%m-%d %H:%M:%S') if user.date_joined else None
            
            # Get profile picture URL if it exists
            profile_picture_url = None
            if user_profile.profile_picture:
                request_base = request.build_absolute_uri('/').rstrip('/')
                profile_picture_url = f"{request_base}{user_profile.profile_picture.url}"
            
            return JsonResponse({
                'message': 'Login successful',
                'token': token,  # Include token in response
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'phoneNumber': user_profile.phone_number or '',
                    'gender': user_profile.gender or '',
                    'dob': dob_formatted,
                    'bloodGroup': user_profile.blood_group or '',
                    'height': float(user_profile.height) if user_profile.height else None,
                    'weight': float(user_profile.weight) if user_profile.weight else None,
                    'emergencyContact': user_profile.emergency_contact or '',
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_email_verified': user_profile.is_email_verified,
                    'lastLogin': last_login_formatted,
                    'lastLogout': user_profile.last_logout.strftime('%Y-%m-%d %H:%M:%S') if user_profile.last_logout else None,
                    'dateJoined': date_joined_formatted,
                    'role': 'super-admin' if user.is_superuser else ('admin' if user.is_staff else 'user'),
                    'profilePictureUrl': profile_picture_url
                }
            })
        except UserProfile.DoesNotExist:
            # Create an empty profile for the user if it doesn't exist
            user_profile, created = UserProfile.objects.get_or_create(user=user)
            
            return JsonResponse({
                'message': 'Login successful',
                'token': token,  # Include token in response
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'phoneNumber': '',
                    'gender': '',
                    'dob': None,
                    'bloodGroup': '',
                    'height': None,
                    'weight': None,
                    'emergencyContact': '',
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_email_verified': False,
                    'lastLogin': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else None,
                    'lastLogout': None,
                    'dateJoined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S') if user.date_joined else None,
                    'role': 'super-admin' if user.is_superuser else ('admin' if user.is_staff else 'user'),
                    'profilePictureUrl': None
                }
            })
        
    except Exception as e:
        logger.error(f"Error in login_verify_otp view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def get_all_users(request):
    """Get all registered users"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=405)
    
    try:
        # Check if user is authenticated and is admin
        # In a real app, you would check if the user is authenticated and has admin privileges
        # For now, we'll skip this check for development purposes
        
        # Get all users
        users = User.objects.all()
        
        # Prepare user data
        user_data = []
        for user in users:
            try:
                profile = UserProfile.objects.get(user=user)
                is_email_verified = profile.is_email_verified
                phone_number = profile.phone_number
                created_at = profile.created_at.strftime('%Y-%m-%d')
            except UserProfile.DoesNotExist:
                is_email_verified = False
                phone_number = ''
                created_at = ''
                
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.strftime('%Y-%m-%d'),
                'last_login': user.last_login.strftime('%Y-%m-%d') if user.last_login else '',
                'is_email_verified': is_email_verified,
                'phone_number': phone_number,
                'gender': profile.gender if hasattr(profile, 'gender') else '',
                'created_at': created_at
            })
            
        return JsonResponse({'users': user_data})
        
    except Exception as e:
        logger.error(f"Error in get_all_users view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_user(request, user_id):
    """Delete a user"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=405)
    
    try:
        # Check if user is authenticated and is admin
        # In a real app, you would check if the user is authenticated and has admin privileges
        # For now, we'll skip this check for development purposes
        
        # Prevent deleting super admin
        try:
            user = User.objects.get(id=user_id)
            if user.email == 'pchakradhar91@gmail.com':
                return JsonResponse({'error': 'Cannot delete super admin account'}, status=403)
                
            # Delete the user
            user.delete()
            return JsonResponse({'message': 'User deleted successfully'})
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
    except Exception as e:
        logger.error(f"Error in delete_user view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def change_user_role(request, user_id):
    """Change a user's role (admin status)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        # Check if user is authenticated and is admin
        # In a real app, you would check if the user is authenticated and has admin privileges
        # For now, we'll skip this check for development purposes
        
        try:
            user = User.objects.get(id=user_id)
            
            # Get the new role from request body
            data = json.loads(request.body)
            is_admin = data.get('is_admin', False)
            
            # Prevent changing super admin role
            if user.email == 'pchakradhar91@gmail.com' and not is_admin:
                return JsonResponse({'error': 'Cannot remove admin privileges from super admin account'}, status=403)
            
            # Update user's admin status
            user.is_staff = is_admin
            user.save()
            
            return JsonResponse({
                'message': 'User role updated successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'is_admin': user.is_staff
                }
            })
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
    except Exception as e:
        logger.error(f"Error in change_user_role view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_user_info(request, user_id):
    """
    Update user profile information
    """
    try:
        # Load request data
        data = json.loads(request.body)
        
        # Get user object
        user = get_object_or_404(User, pk=user_id)
        
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update user fields if provided
        if 'first_name' in data:
            user.first_name = data['first_name']
        
        if 'last_name' in data:
            user.last_name = data['last_name']
            
        # Save user model
        user.save()
        
        # Update profile fields if provided
        fields_to_update = [
            'phone_number', 'gender', 'dob', 'blood_group',
            'emergency_contact', 'height', 'weight'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(profile, field, data[field])
        
        # Save profile
        profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'User information updated successfully',
            'user_id': user_id
        })
    
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    
    except Exception as e:
        logger.error(f"Error updating user information: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Failed to update user information: {str(e)}'
        }, status=500)

@csrf_exempt
def user_logout(request):
    """
    Log out the user by clearing the session
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        # Get the user ID from the request body
        data = json.loads(request.body)
        user_id = data.get('user_id')
        
        if not user_id:
            return JsonResponse({'error': 'User ID is required'}, status=400)
        
        # Find the user and update their profile's last_logout time
        try:
            user = User.objects.get(id=user_id)
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Update last logout time
            profile.last_logout = timezone.now()
            profile.save()
            
            # Django logout (clear session)
            logout(request)
            
            return JsonResponse({
                'success': True,
                'message': 'Logout successful'
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
    except Exception as e:
        logger.error(f"Error in user_logout view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def get_user_details(request, user_id):
    """Get detailed information about a user including system information"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=405)
    
    try:
        # Get the user
        user = get_object_or_404(User, pk=user_id)
        print(f"Fetching details for user: {user.id} - {user.email}")
        
        # Get user profile
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            profile = None
        
        # Collect system information (IP, last login device, etc.)
        system_info = {
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
            'login_ip': request.META.get('REMOTE_ADDR', 'Unknown'),
            'os_info': 'Not available (would be parsed from user agent)',
            'browser_info': 'Not available (would be parsed from user agent)',
            'last_login_time': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Never',
            'account_created': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
        
        # Collect personal information
        personal_info = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_email_verified': profile.is_email_verified if profile else False,
            'phone_number': profile.phone_number if profile else '',
            'gender': profile.gender if profile else '',
            'dob': profile.dob.strftime('%Y-%m-%d') if profile and profile.dob else '',
            'blood_group': profile.blood_group if profile else '',
            'height': str(profile.height) if profile and profile.height else '',
            'weight': str(profile.weight) if profile and profile.weight else '',
            'emergency_contact': profile.emergency_contact if profile else '',
        }
        
        # Add profile picture URL if it exists
        if profile and profile.profile_picture:
            request_base = request.build_absolute_uri('/').rstrip('/')
            personal_info['profile_picture_url'] = f"{request_base}{profile.profile_picture.url}"
        else:
            personal_info['profile_picture_url'] = None
        
        # Get user device information from MongoDB
        from mongo_models.services import MongoDBService
        mongodb_service = MongoDBService()
        devices = mongodb_service.get_user_devices(user_id)
        print(f"Found {len(devices)} devices for user {user_id}")
        
        # If no devices found, add some dummy data for testing
        if not devices:
            print(f"No devices found for user {user_id}, adding dummy data")
            current_time = datetime.now().isoformat()
            devices = [
                {
                    '_id': f'dummy_device_1_{user_id}',
                    'user_id': str(user_id),
                    'device_type': 'Desktop',
                    'os': 'Windows 10',
                    'browser': 'Chrome',
                    'screen_resolution': '1920x1080',
                    'color_depth': '24-bit',
                    'language': 'en-US',
                    'timezone': 'Asia/Kolkata',
                    'cookies_enabled': 'Enabled',
                    'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
                    'ip_address': request.META.get('REMOTE_ADDR', '127.0.0.1'),
                    'location': 'Hyderabad, Telangana, India',
                    'created_at': current_time,
                    'last_seen': current_time
                }
            ]
        
        response_data = {
            'personal_info': personal_info,
            'system_info': system_info,
            'devices': devices
        }
        
        print(f"Returning device data: {devices}")
        return JsonResponse(response_data)
        
    except Exception as e:
        logger.error(f"Error in get_user_details view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def upload_profile_picture(request, user_id):
    """
    Handle profile picture upload for a user
    Accepts a multipart form data with an image file
    Saves the image to the user's profile and returns the URL
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        # Get the user
        user = get_object_or_404(User, pk=user_id)
        
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Check if request has a file
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file provided'}, status=400)
        
        # Get the image file from the request
        image_file = request.FILES['image']
        
        # Validate file type
        if not image_file.name.lower().endswith(('.png', '.jpg', '.jpeg')):
            return JsonResponse({'error': 'Only PNG, JPG, and JPEG files are allowed'}, status=400)
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if image_file.size > max_size:
            return JsonResponse({'error': 'File size exceeds 5MB limit'}, status=400)
        
        # Delete old profile picture if it exists
        if profile.profile_picture:
            try:
                if os.path.isfile(profile.profile_picture.path):
                    os.remove(profile.profile_picture.path)
            except Exception as e:
                logger.error(f"Error removing old profile picture: {str(e)}")
        
        # Save the new profile picture
        profile.profile_picture = image_file
        profile.save()
        
        # Construct the URL
        request_base = request.build_absolute_uri('/').rstrip('/')
        if profile.profile_picture:
            profile_pic_url = f"{request_base}{profile.profile_picture.url}"
        else:
            profile_pic_url = None
        
        return JsonResponse({
            'success': True,
            'message': 'Profile picture updated successfully',
            'profile_picture_url': profile_pic_url
        })
    
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    except Exception as e:
        logger.error(f"Error uploading profile picture: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Failed to upload profile picture: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def remove_profile_picture(request, user_id):
    """
    Remove the profile picture for a user
    """
    try:
        # Get the user
        user = get_object_or_404(User, pk=user_id)
        
        # Get user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Delete the profile picture if it exists
        if profile.profile_picture:
            try:
                if os.path.isfile(profile.profile_picture.path):
                    os.remove(profile.profile_picture.path)
            except Exception as e:
                logger.error(f"Error removing profile picture file: {str(e)}")
            
            # Clear the profile picture field
            profile.profile_picture = None
            profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile picture removed successfully'
        })
    
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    except Exception as e:
        logger.error(f"Error removing profile picture: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Failed to remove profile picture: {str(e)}'
        }, status=500)

@csrf_exempt
def save_device_info(request):
    """Save user device information"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        # Parse device data from request body
        data = json.loads(request.body)
        device_data = data.get('device_info', {})
        
        print(f"Received device data: {device_data}")
        
        # Check if we have the minimum required data
        if not device_data:
            return JsonResponse({
                'success': False,
                'error': 'No device information provided'
            }, status=400)
        
        # Verify authentication
        user_id = None
        if not request.user.is_authenticated:
            # Get the token from the request header
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                # Validate token and get user
                try:
                    user_id = token_validate(token)
                    user = User.objects.get(id=user_id)
                    print(f"User authenticated with token: {user.id} - {user.email}")
                except Exception as e:
                    print(f"Token validation error: {str(e)}")
                    # Try to get user ID from device data
                    user_id = device_data.get('userId')
                    if user_id:
                        try:
                            user = User.objects.get(id=user_id)
                            print(f"User found from device data: {user.id} - {user.email}")
                        except User.DoesNotExist:
                            user_id = None
                            print(f"User with ID {user_id} not found in database")
            else:
                # Try to get user ID from device data
                user_id = device_data.get('userId')
                if user_id:
                    try:
                        user = User.objects.get(id=user_id)
                        print(f"User found from device data: {user.id} - {user.email}")
                    except User.DoesNotExist:
                        user_id = None
                        print(f"User with ID {user_id} not found in database")
        else:
            user = request.user
            user_id = user.id
            print(f"User authenticated with session: {user.id} - {user.email}")
        
        if not user_id:
            return JsonResponse({
                'success': False,
                'error': 'User authentication required'
            }, status=401)
        
        # Save device info to MongoDB
        from mongo_models.services import MongoDBService
        mongodb_service = MongoDBService()
        
        # Ensure we have the basic device info fields populated
        required_fields = {
            'device': device_data.get('device') or 'Unknown',
            'browser': device_data.get('browser') or 'Unknown',
            'os': device_data.get('os') or 'Unknown',
            'ip': device_data.get('ip') or request.META.get('REMOTE_ADDR', 'Unknown'),
            'userAgent': device_data.get('userAgent') or request.META.get('HTTP_USER_AGENT', 'Unknown')
        }
        
        # Merge required fields back into device data
        device_data.update(required_fields)
        
        # Add current timestamp if not present
        if 'timestamp' not in device_data:
            device_data['timestamp'] = datetime.now().isoformat()
        
        # Save to MongoDB
        device_id = mongodb_service.save_user_device(user_id, device_data)
        
        if device_id:
            print(f"Device saved with ID: {device_id}")
            return JsonResponse({
                'success': True,
                'message': 'Device information saved successfully',
                'device_id': device_id
            })
        else:
            print("Failed to save device")
            return JsonResponse({
                'success': False,
                'error': 'Failed to save device information'
            }, status=500)
    
    except json.JSONDecodeError:
        print("Invalid JSON data received")
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        print(f"Error saving device: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error saving device information: {str(e)}'
        }, status=500)

@csrf_exempt
def get_user_devices(request, user_id):
    """Get all devices for a user"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=405)
    
    # Only admins or the user themselves should be able to access this
    if not request.user.is_authenticated:
        # Get the token from the request header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        token = auth_header.split(' ')[1]
        # Validate token and get user
        try:
            token_user_id = token_validate(token)
            user = User.objects.get(id=token_user_id)
        except:
            return JsonResponse({'error': 'Invalid authentication token'}, status=401)
    else:
        user = request.user
    
    # Check permissions
    if user.id != user_id and not user.is_staff:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        # Get user devices from MongoDB
        from mongo_models.services import MongoDBService
        mongodb_service = MongoDBService()
        devices = mongodb_service.get_user_devices(user_id)
        
        return JsonResponse({
            'success': True,
            'devices': devices
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error retrieving user devices: {str(e)}'
        }, status=500)

@csrf_exempt
def get_all_devices(request):
    """Get all user devices (admin only)"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=405)
    
    # Only admins should be able to access this
    if not request.user.is_authenticated:
        # Get the token from the request header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        token = auth_header.split(' ')[1]
        # Validate token and get user
        try:
            user_id = token_validate(token)
            user = User.objects.get(id=user_id)
        except:
            return JsonResponse({'error': 'Invalid authentication token'}, status=401)
    else:
        user = request.user
    
    # Check if user is admin
    if not user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        # Get all devices from MongoDB
        from mongo_models.services import MongoDBService
        mongodb_service = MongoDBService()
        devices = mongodb_service.get_all_user_devices()
        
        # Enhance device data with user information
        for device in devices:
            try:
                device_user = User.objects.get(id=int(device['user_id']))
                device['user_email'] = device_user.email
                device['user_name'] = f"{device_user.first_name} {device_user.last_name}".strip() or device_user.username
            except User.DoesNotExist:
                device['user_email'] = 'Unknown'
                device['user_name'] = 'Unknown User'
        
        return JsonResponse({
            'success': True,
            'devices': devices
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error retrieving all devices: {str(e)}'
        }, status=500)

@csrf_exempt
def delete_device(request, device_id):
    """Delete a device record"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=405)
    
    # Only admins should be able to delete devices
    if not request.user.is_authenticated:
        # Get the token from the request header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        token = auth_header.split(' ')[1]
        # Validate token and get user
        try:
            user_id = token_validate(token)
            user = User.objects.get(id=user_id)
        except:
            return JsonResponse({'error': 'Invalid authentication token'}, status=401)
    else:
        user = request.user
    
    # Check if user is admin
    if not user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        # Delete device from MongoDB
        from mongo_models.services import MongoDBService
        mongodb_service = MongoDBService()
        success = mongodb_service.delete_user_device(device_id)
        
        if success:
            return JsonResponse({
                'success': True,
                'message': 'Device deleted successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to delete device'
            }, status=500)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error deleting device: {str(e)}'
        }, status=500)

@csrf_exempt
def validate_token(request):
    """
    Validate user token
    Used for session validation on page load
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=405)
    
    try:
        # Get the token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
        else:
            return JsonResponse({'error': 'Invalid Authorization header'}, status=401)
        
        if not token:
            return JsonResponse({'error': 'No token provided'}, status=401)
        
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
                    return JsonResponse({'error': 'Invalid token format'}, status=401)
                    
                email = parts[0]
                
                try:
                    user = User.objects.get(email=email)
                    # Reset token expiry on successful validation (45 minutes from now)
                    cache.set(cache_key, user.id, 45 * 60)  # 45 minutes expiry
                    logger.info(f"New token cached for user: {user.id}")
                    user_id = user.id
                except User.DoesNotExist:
                    logger.error(f"User not found for email: {email}")
                    return JsonResponse({'error': 'User not found'}, status=401)
            else:
                # Reset token expiry on successful validation (45 minutes from now)
                # This is crucial for maintaining the session
                cache.touch(cache_key, 45 * 60)  # 45 minutes expiry
                logger.info(f"Extended token expiry for user: {user_id}")
            
            # Get user from user_id
            user = User.objects.get(pk=user_id)
            
            # Get user profile
            try:
                profile = UserProfile.objects.get(user=user)
            except UserProfile.DoesNotExist:
                profile = None
            
            # Build response with minimal user data needed for frontend
            user_data = {
                'id': user.id,
                'email': user.email,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'role': 'super-admin' if user.is_superuser else ('admin' if user.is_staff else 'user'),
            }
            
            # Add profile data if it exists
            if profile:
                user_data.update({
                    'profilePictureUrl': profile.profile_picture.url if profile.profile_picture else None,
                    'is_email_verified': profile.is_email_verified,
                })
            
            return JsonResponse({
                'valid': True,
                'user': user_data
            })
            
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return JsonResponse({'error': str(e), 'valid': False}, status=401)
            
    except Exception as e:
        logger.error(f"Error in validate_token view: {str(e)}")
        return JsonResponse({'error': str(e), 'valid': False}, status=400)

def test_smtp_connection(recipient_email=None):
    """
    Test the SMTP connection directly.
    Run this function from the Django shell:
    python manage.py shell
    from users.views import test_smtp_connection
    test_smtp_connection('your-email@example.com')
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from django.conf import settings
    
    # Use provided recipient or default to sender for testing
    sender = settings.EMAIL_HOST_USER
    recipient = recipient_email or sender
    
    print("\n")
    print("=" * 60)
    print(f"SMTP TEST CONFIGURATION:")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"SENDER: {sender}")
    print(f"RECIPIENT: {recipient}")
    print("=" * 60)
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'SMTP Test for OTP System'
    msg['From'] = sender
    msg['To'] = recipient
    
    # Plain text and HTML parts
    text = "This is a test email to verify SMTP connection for OTP delivery"
    html = """
    <html>
    <head></head>
    <body>
        <h2 style="color: #4169e1;">SMTP Test Successful!</h2>
        <p>This is a test email to verify that the SMTP connection is working properly for OTP delivery.</p>
        <p>If you received this email, your email configuration is correct.</p>
        <hr>
        <p><em>Cyber Health System</em></p>
    </body>
    </html>
    """
    
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    try:
        # Connect to SMTP server
        print("\nAttempting to connect to SMTP server...")
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.set_debuglevel(1)  # Show SMTP communication for debugging
        
        # Identify ourselves to the server
        print("\nSending EHLO...")
        server.ehlo()
        
        # If using TLS, start TLS
        if settings.EMAIL_USE_TLS:
            print("\nStarting TLS...")
            server.starttls()
            server.ehlo()  # Need to re-identify after TLS
        
        # Login
        print("\nAttempting to login with provided credentials...")
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        
        # Send email
        print("\nSending email...")
        server.sendmail(sender, [recipient], msg.as_string())
        
        # Close connection
        server.quit()
        print("\nEmail sent successfully!")
        print("=" * 60)
        return True
    except Exception as e:
        print(f"\nSMTP Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("=" * 60)
        return False

@csrf_exempt
def test_email_endpoint(request):
    """
    Test endpoint for email sending.
    This is useful for diagnosing email issues directly from the web interface.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        recipient_email = data.get('email')
        
        if not recipient_email:
            return JsonResponse({'error': 'Email address is required'}, status=400)
            
        # Run the SMTP test and get the result
        success = test_smtp_connection(recipient_email)
        
        if success:
            return JsonResponse({
                'success': True,
                'message': 'Test email sent successfully! Please check your inbox.'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to send test email. Check server logs for details.'
            }, status=500)
            
    except Exception as e:
        logger.error(f"Error in test_email_endpoint: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
def resend_registration_otp(request):
    """Handle request to resend registration OTP"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        captcha_token = data.get('captchaToken')  # Optional - you may require CAPTCHA for resends too

        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)

        # Verify CAPTCHA token if provided
        if captcha_token and not verify_recaptcha(captcha_token):
            return JsonResponse({'error': 'CAPTCHA verification failed'}, status=400)

        # Check rate limit - use a stricter limit for resends to prevent abuse
        rate_limit_key = f'resend_reg_otp_{email}'
        if check_rate_limit(rate_limit_key, limit=3, period=300):  # 3 attempts within 5 minutes
            return JsonResponse({'error': 'Too many resend attempts. Please try again later.'}, status=429)

        # Check if user exists already
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered. Please log in instead.'}, status=400)
            
        # Mark any previous OTPs as expired
        OTP.objects.filter(email=email, is_verified=False).update(is_verified=True)
        
        # Generate and save new OTP
        otp_value = OTP.generate_otp()
        otp = OTP.objects.create(email=email, otp=otp_value)
        
        # Send new OTP via email
        sent = send_otp_email(email, otp_value, purpose="registration")
        
        if not sent:
            return JsonResponse({'error': 'Failed to send OTP email. Please try again later.'}, status=500)
        
        return JsonResponse({
            'message': 'New OTP sent successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in resend_registration_otp view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def resend_login_otp(request):
    """Handle request to resend login OTP"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        captcha_token = data.get('captchaToken')  # Optional - you may require CAPTCHA for resends too

        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)

        # Verify CAPTCHA token if provided
        if captcha_token and not verify_recaptcha(captcha_token):
            return JsonResponse({'error': 'CAPTCHA verification failed'}, status=400)

        # Check rate limit - use a stricter limit for resends to prevent abuse
        rate_limit_key = f'resend_login_otp_{email}'
        if check_rate_limit(rate_limit_key, limit=3, period=300):  # 3 attempts within 5 minutes
            return JsonResponse({'error': 'Too many resend attempts. Please try again later.'}, status=429)

        # Check if user exists
        if not User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'User does not exist'}, status=400)
            
        # Mark any previous OTPs as expired
        OTP.objects.filter(email=email, is_verified=False).update(is_verified=True)
        
        # Generate and save new OTP
        otp_value = OTP.generate_otp()
        otp = OTP.objects.create(email=email, otp=otp_value)
        
        # Send new OTP via email
        sent = send_otp_email(email, otp_value, purpose="login")
        
        if not sent:
            return JsonResponse({'error': 'Failed to send OTP email. Please try again later.'}, status=500)
        
        return JsonResponse({
            'message': 'New login OTP sent successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in resend_login_otp view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

def send_security_alert_email(email, alert_type, details=None, ip_address=None, user_agent=None):
    """
    Send security alert email to user and admin about suspicious activity
    
    :param email: User's email address
    :param alert_type: Type of security alert (e.g., 'brute_force', 'multiple_failed_attempts')
    :param details: Additional details about the alert
    :param ip_address: IP address from which the suspicious activity originated
    :param user_agent: User agent of the suspicious request
    :return: Boolean indicating if emails were sent successfully
    """
    # Add detailed logging for debugging
    logger.info(f"Security alert triggered: type={alert_type}, email={email}, details={details}")
    
    # Admin email is the first superuser or the default email
    try:
        admin_email = User.objects.filter(is_superuser=True).first().email
    except (AttributeError, User.DoesNotExist):
        admin_email = settings.EMAIL_HOST_USER
    
    logger.info(f"Security alert will be sent to user ({email}) and admin ({admin_email})")
    
    # Get current time for the alert
    current_time = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Set up email details based on alert type
    if alert_type == 'brute_force':
        subject = '🚨 SECURITY ALERT: Brute Force Attack Detected'
        template = 'email_templates/security_alert_brute_force.html'
    elif alert_type == 'multiple_failed_attempts':
        subject = '⚠️ Security Alert: Multiple Failed Login Attempts'
        template = 'email_templates/security_alert_failed_attempts.html'
    else:
        subject = '⚠️ Security Alert: Suspicious Activity'
        template = 'email_templates/security_alert_generic.html'
    
    logger.info(f"Using template: {template} for alert type: {alert_type}")
    
    # Prepare context for email template
    context = {
        'email': email,
        'time': current_time,
        'ip_address': ip_address or 'Unknown',
        'user_agent': user_agent or 'Unknown',
        'details': details or '',
        'alert_type': alert_type,
    }
    
    try:
        # Check if the template file exists
        try:
            template_obj = get_template(template)
            logger.info(f"Template '{template}' found and loaded successfully")
        except Exception as template_error:
            logger.error(f"Template loading error: {str(template_error)}")
            # Fallback to generic template
            template = 'email_templates/security_alert_generic.html'
            try:
                template_obj = get_template(template)
                logger.info(f"Fallback template '{template}' loaded successfully")
            except Exception as fallback_error:
                logger.error(f"Fallback template loading error: {str(fallback_error)}")
                # Create a simple HTML email content as last resort
                html_message = f"""
                <html>
                <body>
                    <h2>Security Alert: {alert_type}</h2>
                    <p>We've detected suspicious activity on your account.</p>
                    <p>Time: {current_time}</p>
                    <p>IP Address: {ip_address or 'Unknown'}</p>
                    <p>Device: {user_agent or 'Unknown'}</p>
                    <p>Details: {details or ''}</p>
                </body>
                </html>
                """
                plain_message = f"Security Alert: {alert_type}\nTime: {current_time}\nIP: {ip_address or 'Unknown'}\nDetails: {details or ''}"
                logger.info("Using emergency fallback HTML content")
                
                # Skip template rendering
                template_obj = None
        
        # Render template if available
        if template_obj is not None:
            logger.info("Rendering email template with context")
            # Send email to user
            html_message = render_to_string(template, context)
            plain_message = strip_tags(html_message)
            logger.info(f"Template rendered successfully, HTML length: {len(html_message)}")
        
        # Use direct SMTP
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        logger.info(f"Setting up SMTP connection to {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        
        # Create message for user
        user_msg = MIMEMultipart('alternative')
        user_msg['Subject'] = subject
        user_msg['From'] = settings.EMAIL_HOST_USER
        user_msg['To'] = email
        
        user_part1 = MIMEText(plain_message, 'plain')
        user_part2 = MIMEText(html_message, 'html')
        
        user_msg.attach(user_part1)
        user_msg.attach(user_part2)
        
        # Customize context for admin email
        admin_context = context.copy()
        admin_context['is_admin'] = True
        
        # Create admin message
        if template_obj is not None:
            admin_html_message = render_to_string(template, admin_context)
            admin_plain_message = strip_tags(admin_html_message)
        else:
            # Use the emergency fallback with admin note
            admin_html_message = html_message.replace("<h2>", "<h2>[ADMIN] ")
            admin_plain_message = f"[ADMIN] {plain_message}"
        
        admin_msg = MIMEMultipart('alternative')
        admin_msg['Subject'] = f"[ADMIN] {subject} - User: {email}"
        admin_msg['From'] = settings.EMAIL_HOST_USER
        admin_msg['To'] = admin_email
        
        admin_part1 = MIMEText(admin_plain_message, 'plain')
        admin_part2 = MIMEText(admin_html_message, 'html')
        
        admin_msg.attach(admin_part1)
        admin_msg.attach(admin_part2)
        
        # Connect to SMTP server
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        
        # Only enable debug level in development mode
        if settings.DEBUG:
            server.set_debuglevel(1)  # Enable for debugging
            logger.info("SMTP debug mode enabled")
        
        # Identify ourselves to the server
        server.ehlo()
        logger.info("SMTP EHLO sent")
        
        # If using TLS, start TLS
        if settings.EMAIL_USE_TLS:
            logger.info("Starting TLS")
            server.starttls()
            server.ehlo()  # Need to re-identify after TLS
        
        # Login
        logger.info(f"Logging in with user: {settings.EMAIL_HOST_USER}")
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        logger.info("SMTP login successful")
        
        # Send emails
        logger.info(f"Sending security alert email to user: {email}")
        server.sendmail(settings.EMAIL_HOST_USER, [email], user_msg.as_string())
        logger.info(f"User email sent successfully")
        
        logger.info(f"Sending security alert email to admin: {admin_email}")
        server.sendmail(settings.EMAIL_HOST_USER, [admin_email], admin_msg.as_string())
        logger.info(f"Admin email sent successfully")
        
        # Close connection
        server.quit()
        logger.info("SMTP connection closed")
        
        logger.info(f"Security alert emails sent to user ({email}) and admin ({admin_email})")
        return True
    except Exception as e:
        logger.error(f"Failed to send security alert emails: {str(e)}")
        # Only print detailed error info in debug mode
        if settings.DEBUG:
            import traceback
            trace_str = traceback.format_exc()
            logger.error(f"Security alert email error details:\n{trace_str}")
        return False

@csrf_exempt
def test_security_alert_email(request):
    """
    Test endpoint for security alert email.
    This is useful for diagnosing security alert email issues directly from the web interface.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        recipient_email = data.get('email')
        alert_type = data.get('alert_type', 'multiple_failed_attempts')  # Default to multiple_failed_attempts
        
        if not recipient_email:
            return JsonResponse({'error': 'Email address is required'}, status=400)
            
        # Get client information for security logging
        ip_address = request.META.get('REMOTE_ADDR', 'Unknown')
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
        
        # Details for the alert
        details = f"This is a test security alert email of type '{alert_type}'. Generated at {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}."
        
        # Send the test security alert email
        logger.info(f"Sending test security alert email to {recipient_email} with type {alert_type}")
        
        # Call the security alert email function
        success = send_security_alert_email(
            email=recipient_email,
            alert_type=alert_type,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if success:
            return JsonResponse({
                'success': True,
                'message': 'Test security alert email sent successfully! Please check your inbox.'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to send test security alert email. Check server logs for details.'
            }, status=500)
            
    except Exception as e:
        logger.error(f"Error in test_security_alert_email endpoint: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
def reset_rate_limit(request):
    """Reset rate limit for a specific email (admin use only)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        admin_key = data.get('admin_key')
        
        # Validate admin key to ensure this endpoint is secured
        if not admin_key or admin_key != getattr(settings, 'ADMIN_RESET_KEY', 'cyber_health_admin'):
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)
            
        # Clear all rate limit keys for this email
        rate_limit_keys = [
            f'register_attempt_{email}',
            f'register_attempt_{email}_over_limit',
            f'verify_otp_attempt_{email}',
            f'verify_otp_attempt_{email}_over_limit',
            f'login_attempt_{email}',
            f'login_attempt_{email}_over_limit'
        ]
        
        for key in rate_limit_keys:
            cache.delete(key)
            
        return JsonResponse({'message': f'Rate limit reset for {email}'})
        
    except Exception as e:
        logger.error(f"Error in reset_rate_limit view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)
