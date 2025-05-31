from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import UserProfile
from utils.sync_utils import sync_user_to_mongodb, delete_user_from_mongodb
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        
        # Sync new user to MongoDB
        try:
            sync_user_to_mongodb(instance)
            logger.info(f"New user {instance.email} created and synced to MongoDB")
        except Exception as e:
            logger.error(f"Error syncing new user to MongoDB: {str(e)}")

@receiver(post_save, sender=UserProfile)
def save_user_profile(sender, instance, **kwargs):
    # Sync updated user profile to MongoDB
    try:
        sync_user_to_mongodb(instance.user, instance)
        logger.info(f"User profile for {instance.user.email} updated and synced to MongoDB")
    except Exception as e:
        logger.error(f"Error syncing updated user profile to MongoDB: {str(e)}")

@receiver(post_delete, sender=User)
def delete_user_mongodb(sender, instance, **kwargs):
    # Delete user from MongoDB when deleted from Django
    try:
        delete_user_from_mongodb(instance.id)
        logger.info(f"User {instance.email} deleted from MongoDB")
    except Exception as e:
        logger.error(f"Error deleting user from MongoDB: {str(e)}")