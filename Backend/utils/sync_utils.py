import logging
from mongo_models.services import MongoDBService

logger = logging.getLogger(__name__)

def sync_user_to_mongodb(user, user_profile=None):
    """
    Sync a Django user and user profile to MongoDB
    
    Args:
        user: Django User model instance
        user_profile: Django UserProfile model instance (optional)
    
    Returns:
        str: MongoDB document ID if successful, None otherwise
    """
    try:
        # Prepare user data for MongoDB
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'last_login': user.last_login,
            'date_joined': user.date_joined
        }
        
        # Add user profile data if available
        if user_profile:
            user_data.update({
                'phone_number': user_profile.phone_number,
                'gender': user_profile.gender,
                'dob': user_profile.dob,
                'blood_group': user_profile.blood_group,
                'height': user_profile.height,
                'weight': user_profile.weight,
                'emergency_contact': user_profile.emergency_contact,
                'last_logout': user_profile.last_logout,
                'is_email_verified': user_profile.is_email_verified,
                'created_at': user_profile.created_at,
                'updated_at': user_profile.updated_at
            })
        
        # Save to MongoDB
        mongo_service = MongoDBService()
        mongo_id = mongo_service.create_user(user_data)
        
        if mongo_id:
            logger.info(f"User {user.email} synced to MongoDB with ID: {mongo_id}")
        else:
            logger.warning(f"Failed to sync user {user.email} to MongoDB")
        
        return mongo_id
    except Exception as e:
        logger.error(f"Error syncing user to MongoDB: {str(e)}")
        return None


def delete_user_from_mongodb(user_id):
    """
    Delete a user from MongoDB by Django user ID
    
    Args:
        user_id: Django User model ID
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        mongo_service = MongoDBService()
        success = mongo_service.delete_user_by_django_id(user_id)
        
        if success:
            logger.info(f"User with ID {user_id} deleted from MongoDB")
        else:
            logger.warning(f"Failed to delete user with ID {user_id} from MongoDB")
        
        return success
    except Exception as e:
        logger.error(f"Error deleting user from MongoDB: {str(e)}")
        return False