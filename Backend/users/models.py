from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string
import logging

# Create your models here.

class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    @staticmethod
    def generate_otp():
        return ''.join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        from django.conf import settings
        expiry_time = self.created_at + timezone.timedelta(minutes=settings.OTP_EXPIRY_TIME)
        return timezone.now() > expiry_time

class UserProfile(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('', 'Prefer not to say')
    )
    
    BLOOD_GROUP_CHOICES = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('', 'Unknown')
    )
    
    GENDER_ICONS = {
        'M': 'gender_icons/male.png',
        'F': 'gender_icons/female.png',
        'O': 'gender_icons/other.png',
        '': 'gender_icons/unspecified.png'
    }
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, default='')
    gender_icon = models.ImageField(upload_to='gender_icons/', null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    
    # Additional health information
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True, default='')
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Height in cm
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Weight in kg
    emergency_contact = models.CharField(max_length=15, blank=True)
    last_logout = models.DateTimeField(null=True, blank=True)
    
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Account security fields
    failed_login_attempts = models.PositiveIntegerField(default=0)  # Track failed login attempts
    is_locked = models.BooleanField(default=False)  # Whether the account is locked
    lockout_until = models.DateTimeField(null=True, blank=True)  # When the lockout expires
    last_failed_attempt = models.DateTimeField(null=True, blank=True)  # When the last failed attempt occurred
    alert_sent = models.BooleanField(default=False)  # Whether a security alert has been sent
    last_alert_sent = models.DateTimeField(null=True, blank=True)  # When the last alert was sent
    alert_cooldown_until = models.DateTimeField(null=True, blank=True)  # Cooldown period for alert emails

    def save(self, *args, **kwargs):
        # Set default gender icon based on gender choice
        if self.gender and not self.gender_icon:
            self.gender_icon = self.GENDER_ICONS.get(self.gender)
        super().save(*args, **kwargs)
    
    def is_locked_out(self):
        """Check if the account is currently locked out"""
        if not self.is_locked:
            return False
        if self.lockout_until and timezone.now() >= self.lockout_until:
            # Automatically unlock if lockout period has expired
            self.is_locked = False
            self.lockout_until = None
            self.save(update_fields=['is_locked', 'lockout_until'])
            return False
        return True
    
    def increment_failed_attempts(self):
        """Increment failed login attempts and lock account if threshold is reached"""
        from django.conf import settings
        logger = logging.getLogger(__name__)
        
        threshold = getattr(settings, 'ACCOUNT_LOCKOUT_THRESHOLD', 5)
        lockout_duration = getattr(settings, 'ACCOUNT_LOCKOUT_DURATION', 30)  # minutes
        alert_threshold = getattr(settings, 'SECURITY_ALERT_THRESHOLD', 3)  # After 3 failures, send alert
        
        # Log the current state
        logger.info(f"Incrementing failed attempts for user {self.user.email} - current count: {self.failed_login_attempts}")
        
        # Check if this is rapid succession of failures (potential brute force)
        is_potential_brute_force = False
        if self.last_failed_attempt:
            time_since_last_failure = timezone.now() - self.last_failed_attempt
            seconds_since_last_failure = time_since_last_failure.total_seconds()
            # If less than 5 seconds between attempts, consider it potential brute force
            if seconds_since_last_failure < 5:
                is_potential_brute_force = True
                logger.warning(f"Potential brute force attack detected for {self.user.email} - {seconds_since_last_failure:.2f} seconds since last failure")
        
        # Update last failed attempt time
        self.last_failed_attempt = timezone.now()
        self.failed_login_attempts += 1
        
        # Check if we should send an alert (either for brute force or reaching the alert threshold)
        should_send_alert = is_potential_brute_force or self.failed_login_attempts >= alert_threshold
        
        # Track whether we actually want to send an alert this time (for return value)
        alert_should_be_sent = False
        
        # Only send alert if not in cooldown period and account isn't already locked
        if should_send_alert and not self.is_locked:
            logger.info(f"Security alert condition met for {self.user.email} - brute force: {is_potential_brute_force}, attempts: {self.failed_login_attempts}")
            
            alert_cooldown_active = False
            if self.alert_cooldown_until and timezone.now() <= self.alert_cooldown_until:
                alert_cooldown_active = True
                logger.info(f"Alert cooldown active for {self.user.email} until {self.alert_cooldown_until}")
            
            if not alert_cooldown_active:
                logger.info(f"Setting alert flags for {self.user.email} - alert should be sent")
                self.alert_sent = True
                self.last_alert_sent = timezone.now()
                # Set alert cooldown (1 hour)
                self.alert_cooldown_until = timezone.now() + timezone.timedelta(hours=1)
                alert_should_be_sent = True
        
        # Lock account if threshold is reached
        if self.failed_login_attempts >= threshold:
            logger.warning(f"Account locked for {self.user.email} - failed attempts: {self.failed_login_attempts}/{threshold}")
            self.is_locked = True
            self.lockout_until = timezone.now() + timezone.timedelta(minutes=lockout_duration)
            
        self.save(update_fields=['failed_login_attempts', 'is_locked', 'lockout_until', 
                               'last_failed_attempt', 'alert_sent', 'last_alert_sent', 
                               'alert_cooldown_until'])
        
        if alert_should_be_sent:
            logger.info(f"Security alert requested for {self.user.email} - brute force: {is_potential_brute_force}")
        
        return {
            'is_locked': self.is_locked,
            'should_send_alert': alert_should_be_sent,
            'is_brute_force': is_potential_brute_force,
        }
    
    def reset_failed_attempts(self):
        """Reset failed login attempts counter"""
        if self.failed_login_attempts > 0:
            self.failed_login_attempts = 0
            self.save(update_fields=['failed_login_attempts'])
        
    def __str__(self):
        return f"{self.user.username}'s profile"
