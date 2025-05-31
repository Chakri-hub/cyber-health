from datetime import datetime
from bson import ObjectId

class MongoDBUserModel:
    """
    MongoDB model for user data
    """
    collection_name = 'users'
    
    @staticmethod
    def create_user_document(user_data):
        """
        Create a user document from Django user data
        """
        return {
            'user_id': str(user_data.get('id')),  # Django user ID as reference
            'email': user_data.get('email'),
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'phone_number': user_data.get('phone_number', ''),
            'gender': user_data.get('gender', ''),
            'dob': user_data.get('dob'),
            'blood_group': user_data.get('blood_group', ''),
            'height': float(user_data.get('height')) if user_data.get('height') else None,
            'weight': float(user_data.get('weight')) if user_data.get('weight') else None,
            'emergency_contact': user_data.get('emergency_contact', ''),
            'is_email_verified': user_data.get('is_email_verified', False),
            'is_active': user_data.get('is_active', True),
            'is_staff': user_data.get('is_staff', False),
            'is_superuser': user_data.get('is_superuser', False),
            'last_login': user_data.get('last_login'),
            'last_logout': user_data.get('last_logout'),
            'created_at': user_data.get('created_at', datetime.now()),
            'updated_at': user_data.get('updated_at', datetime.now())
        }
    
    @staticmethod
    def to_json(user_document):
        """
        Convert MongoDB document to JSON-serializable format
        """
        if not user_document:
            return None
            
        # Convert ObjectId to string and handle datetime objects
        if '_id' in user_document:
            user_document['_id'] = str(user_document['_id'])
        
        # Convert datetime objects to ISO format strings
        for field in ['created_at', 'updated_at', 'last_login', 'last_logout', 'dob']:
            if field in user_document and user_document[field]:
                if isinstance(user_document[field], datetime):
                    user_document[field] = user_document[field].isoformat()
        
        return user_document