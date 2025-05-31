from django.db import models
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ContactMessage(models.Model):
    """
    Model for storing contact messages from users
    """
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, default='')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    # Reply tracking
    has_reply = models.BooleanField(default=False)
    reply_text = models.TextField(blank=True, null=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    replied_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_replies'
    )
    
    # Link to user if message is from a registered user
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='contact_messages'
    )
    is_from_registered_user = models.BooleanField(default=False)
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
    
    def __str__(self):
        return f"Message from {self.name} ({self.email}) - {'Read' if self.is_read else 'Unread'}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read', 'updated_at'])
        
    def mark_as_unread(self):
        self.is_read = False
        self.save(update_fields=['is_read', 'updated_at'])