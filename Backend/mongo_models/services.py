from utils.mongo_client import MongoDBClient
from .user import MongoDBUserModel
from .device import MongoDBDeviceModel
from .health_services import MongoDBHealthServicesModel
import logging
from bson import ObjectId
from datetime import datetime

logger = logging.getLogger(__name__)

class MongoDBService:
    """
    Service class for MongoDB operations
    """
    def __init__(self):
        self.client = MongoDBClient()
        self.db = self.client.get_database()
    
    def get_collection(self, collection_name):
        """
        Get a MongoDB collection
        """
        return self.db[collection_name]
    
    def create_user(self, user_data):
        """
        Create a new user document in MongoDB
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            
            # Check if user already exists
            existing_user = users_collection.find_one({'email': user_data.get('email')})
            if existing_user:
                # Update existing user
                return self.update_user(existing_user['_id'], user_data)
            
            # Create user document
            user_document = MongoDBUserModel.create_user_document(user_data)
            result = users_collection.insert_one(user_document)
            
            if result.inserted_id:
                logger.info(f"User created in MongoDB with ID: {result.inserted_id}")
                return str(result.inserted_id)
            return None
        except Exception as e:
            logger.error(f"Error creating user in MongoDB: {str(e)}")
            return None
    
    def get_user_by_id(self, user_id):
        """
        Get a user document by ID
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            return MongoDBUserModel.to_json(user)
        except Exception as e:
            logger.error(f"Error getting user from MongoDB: {str(e)}")
            return None
    
    def get_user_by_django_id(self, django_user_id):
        """
        Get a user document by Django user ID
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            user = users_collection.find_one({'user_id': str(django_user_id)})
            return MongoDBUserModel.to_json(user)
        except Exception as e:
            logger.error(f"Error getting user from MongoDB: {str(e)}")
            return None
    
    def get_user_by_email(self, email):
        """
        Get a user document by email
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            user = users_collection.find_one({'email': email})
            return MongoDBUserModel.to_json(user)
        except Exception as e:
            logger.error(f"Error getting user from MongoDB: {str(e)}")
            return None
    
    def get_all_users(self):
        """
        Get all user documents
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            users = list(users_collection.find())
            return [MongoDBUserModel.to_json(user) for user in users]
        except Exception as e:
            logger.error(f"Error getting all users from MongoDB: {str(e)}")
            return []
    
    def update_user(self, user_id, user_data):
        """
        Update a user document
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            
            # Create updated document
            user_document = MongoDBUserModel.create_user_document(user_data)
            user_document['updated_at'] = user_data.get('updated_at', user_document['updated_at'])
            
            # Convert string ID to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            result = users_collection.update_one(
                {'_id': user_id},
                {'$set': user_document}
            )
            
            if result.modified_count > 0 or result.matched_count > 0:
                logger.info(f"User updated in MongoDB with ID: {user_id}")
                return str(user_id)
            return None
        except Exception as e:
            logger.error(f"Error updating user in MongoDB: {str(e)}")
            return None
    
    def delete_user(self, user_id):
        """
        Delete a user document
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            
            # Convert string ID to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            result = users_collection.delete_one({'_id': user_id})
            
            if result.deleted_count > 0:
                logger.info(f"User deleted from MongoDB with ID: {user_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting user from MongoDB: {str(e)}")
            return False
    
    def delete_user_by_django_id(self, django_user_id):
        """
        Delete a user document by Django user ID
        """
        try:
            users_collection = self.get_collection(MongoDBUserModel.collection_name)
            result = users_collection.delete_one({'user_id': str(django_user_id)})
            
            if result.deleted_count > 0:
                logger.info(f"User deleted from MongoDB with Django ID: {django_user_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting user from MongoDB: {str(e)}")
            return False
    
    # Device-related methods
    def save_user_device(self, user_id, device_data):
        """
        Save or update user device information
        """
        try:
            devices_collection = self.get_collection(MongoDBDeviceModel.collection_name)
            
            # Make sure user_id is a string
            str_user_id = str(user_id)
            logger.info(f"Saving device for user ID: {str_user_id}")
            
            # Check for minimal required fields
            if not device_data.get('userAgent') and not device_data.get('ip_address'):
                logger.warning(f"Missing required device data fields for user {str_user_id}")
                return None
            
            # Check if the device already exists for this user based on user agent and IP
            existing_device = None
            
            # Try to find by IP address
            if device_data.get('ip'):
                existing_device = devices_collection.find_one({
                    'user_id': str_user_id,
                    'ip_address': device_data.get('ip')
                })
                
                if existing_device:
                    logger.info(f"Found existing device by IP: {device_data.get('ip')} for user {str_user_id}")
            
            # If not found by IP, try user agent
            if not existing_device and device_data.get('userAgent'):
                existing_device = devices_collection.find_one({
                    'user_id': str_user_id,
                    'user_agent': device_data.get('userAgent')
                })
                
                if existing_device:
                    logger.info(f"Found existing device by user agent for user {str_user_id}")
            
            if existing_device:
                # Update last_seen timestamp and any changed properties
                update_data = {
                    'last_seen': datetime.now()
                }
                
                # Update other properties if they've changed
                for key, value in device_data.items():
                    db_key = key
                    
                    # Map frontend properties to database properties
                    if key == 'device':
                        db_key = 'device_type'
                    elif key == 'ip':
                        db_key = 'ip_address'
                    elif key == 'screenResolution':
                        db_key = 'screen_resolution'
                    elif key == 'colorDepth':
                        db_key = 'color_depth'
                    elif key == 'cookiesEnabled':
                        db_key = 'cookies_enabled'
                    elif key == 'userAgent':
                        db_key = 'user_agent'
                        
                    # Skip userId which is just for reference
                    if key == 'userId':
                        continue
                        
                    if value and (db_key not in existing_device or existing_device[db_key] != value):
                        update_data[db_key] = value
                
                # Only update if there are changes
                if len(update_data) > 1:  # > 1 because last_seen is always updated
                    result = devices_collection.update_one(
                        {'_id': existing_device['_id']},
                        {'$set': update_data}
                    )
                    
                    if result.modified_count > 0 or result.matched_count > 0:
                        logger.info(f"Device updated for user ID: {str_user_id}")
                        return str(existing_device['_id'])
                else:
                    # No changes needed
                    logger.info(f"No changes needed for device {existing_device['_id']} for user {str_user_id}")
                    return str(existing_device['_id'])
            
            # Create new device document if no existing device is found
            device_document = MongoDBDeviceModel.create_device_document(str_user_id, device_data)
            result = devices_collection.insert_one(device_document)
            
            if result.inserted_id:
                logger.info(f"New device saved for user ID: {str_user_id} with device ID: {result.inserted_id}")
                return str(result.inserted_id)
            
            logger.warning(f"Failed to insert new device for user {str_user_id}")
            return None
            
        except Exception as e:
            logger.error(f"Error saving device information: {str(e)}", exc_info=True)
            return None

    def get_user_devices(self, user_id):
        """
        Get all devices for a user
        """
        try:
            devices_collection = self.get_collection(MongoDBDeviceModel.collection_name)
            # Ensure user_id is a string
            str_user_id = str(user_id)
            devices = list(devices_collection.find({'user_id': str_user_id}))
            return [MongoDBDeviceModel.to_json(device) for device in devices]
        except Exception as e:
            logger.error(f"Error getting user devices: {str(e)}")
            return []
    
    def get_device_by_id(self, device_id):
        """
        Get a device document by ID
        """
        try:
            devices_collection = self.get_collection(MongoDBDeviceModel.collection_name)
            device = devices_collection.find_one({'_id': ObjectId(device_id)})
            return MongoDBDeviceModel.to_json(device)
        except Exception as e:
            logger.error(f"Error getting device: {str(e)}")
            return None
    
    def delete_user_device(self, device_id):
        """
        Delete a device document
        """
        try:
            devices_collection = self.get_collection(MongoDBDeviceModel.collection_name)
            
            # Convert string ID to ObjectId if needed
            if isinstance(device_id, str):
                device_id = ObjectId(device_id)
            
            result = devices_collection.delete_one({'_id': device_id})
            
            if result.deleted_count > 0:
                logger.info(f"Device deleted with ID: {device_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting device: {str(e)}")
            return False
            
    def get_all_user_devices(self):
        """
        Get all user devices (for admin use)
        """
        try:
            devices_collection = self.get_collection(MongoDBDeviceModel.collection_name)
            devices = list(devices_collection.find())
            return [MongoDBDeviceModel.to_json(device) for device in devices]
        except Exception as e:
            logger.error(f"Error getting all devices: {str(e)}")
            return []
    
    # Health Services methods
    def save_heart_rate(self, user_id, data):
        """
        Save heart rate data
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create heart rate document
            heart_rate_doc = MongoDBHealthServicesModel.create_heart_rate_document(user_id, data)
            result = health_collection.insert_one(heart_rate_doc)
            
            if result.inserted_id:
                logger.info(f"Heart rate record saved for user ID: {user_id}")
                return str(result.inserted_id)
            
            logger.warning(f"Failed to save heart rate for user {user_id}")
            return None
            
        except Exception as e:
            logger.error(f"Error saving heart rate data: {str(e)}")
            return None
    
    def get_heart_rate_history(self, user_id, limit=50):
        """
        Get heart rate history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for heart rate records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'heart_rate'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting heart rate history: {str(e)}")
            return []
            
    def save_blood_pressure(self, user_id, data):
        """
        Save blood pressure data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create blood pressure document
            document = MongoDBHealthServicesModel.create_blood_pressure_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Blood pressure data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving blood pressure data: {str(e)}")
            return None
    
    def get_blood_pressure_history(self, user_id, limit=50):
        """
        Get blood pressure history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for blood pressure records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'blood_pressure'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting blood pressure history: {str(e)}")
            return []
            
    def save_spo2(self, user_id, data):
        """
        Save SpO2 (oxygen saturation) data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create SpO2 document
            document = MongoDBHealthServicesModel.create_spo2_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"SpO2 data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving SpO2 data: {str(e)}")
            return None
    
    def get_spo2_history(self, user_id, limit=50):
        """
        Get SpO2 (oxygen saturation) history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for SpO2 records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'spo2'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting SpO2 history: {str(e)}")
            return []
            
    def save_respiratory_rate(self, user_id, data):
        """
        Save respiratory rate data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create respiratory rate document
            document = MongoDBHealthServicesModel.create_respiratory_rate_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Respiratory rate data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving respiratory rate data: {str(e)}")
            return None
    
    def get_respiratory_rate_history(self, user_id, limit=50):
        """
        Get respiratory rate history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for respiratory rate records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'respiratory_rate'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting respiratory rate history: {str(e)}")
            return []
    
    def save_temperature(self, user_id, data):
        """
        Save body temperature data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create temperature document
            document = MongoDBHealthServicesModel.create_temperature_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Temperature data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving temperature data: {str(e)}")
            return None
    
    def get_temperature_history(self, user_id, limit=50):
        """
        Get body temperature history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for temperature records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'temperature'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting temperature history: {str(e)}")
            return []

    def save_weight(self, user_id, data):
        """
        Save weight and BMI data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create weight document
            document = MongoDBHealthServicesModel.create_weight_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Weight data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving weight data: {str(e)}")
            return None
    
    def get_weight_history(self, user_id, limit=50):
        """
        Get weight history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for weight records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'weight'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting weight history: {str(e)}")
            return []

    # Mental Health Services
    def save_mood(self, user_id, data):
        """
        Save mood tracking data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create mood document
            document = MongoDBHealthServicesModel.create_mood_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Mood data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving mood data: {str(e)}")
            return None
            
    def get_mood_history(self, user_id, limit=50):
        """
        Get mood tracking history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for mood records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'mood'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting mood history: {str(e)}")
            return []
            
    def save_anxiety_assessment(self, user_id, data):
        """
        Save anxiety assessment (GAD-7) data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create anxiety assessment document
            document = MongoDBHealthServicesModel.create_anxiety_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Anxiety assessment data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving anxiety assessment data: {str(e)}")
            return None
            
    def get_anxiety_history(self, user_id, limit=50):
        """
        Get anxiety assessment history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for anxiety assessment records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'anxiety'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting anxiety assessment history: {str(e)}")
            return []
            
    def save_depression_assessment(self, user_id, data):
        """
        Save depression assessment (PHQ-9) data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create depression assessment document
            document = MongoDBHealthServicesModel.create_depression_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Depression assessment data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving depression assessment data: {str(e)}")
            return None
            
    def get_depression_history(self, user_id, limit=50):
        """
        Get depression assessment history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for depression assessment records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'depression'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting depression assessment history: {str(e)}")
            return []
            
    # Sleep Quality methods
    def save_sleep_quality(self, user_id, data):
        """
        Save sleep quality data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create sleep quality document
            document = MongoDBHealthServicesModel.create_sleep_quality_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Sleep quality data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving sleep quality data: {str(e)}")
            return None
            
    def get_sleep_quality_history(self, user_id, limit=50):
        """
        Get sleep quality history for a user
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Query for sleep quality records
            records = list(health_collection.find({
                'user_id': str(user_id),
                'service_type': 'sleep'
            }).sort('recorded_at', -1).limit(limit))
            
            # Convert to JSON format
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error getting sleep quality history: {str(e)}")
            return []
            
    # Mental Fatigue methods
    def save_mental_fatigue(self, user_id, data):
        """
        Save mental fatigue data to MongoDB
        """
        try:
            health_collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Create mental fatigue document
            document = MongoDBHealthServicesModel.create_mental_fatigue_document(user_id, data)
            
            # Insert document
            result = health_collection.insert_one(document)
            
            if result.inserted_id:
                logger.info(f"Mental fatigue data saved for user {user_id}")
                return str(result.inserted_id)
            return None
            
        except Exception as e:
            logger.error(f"Error saving mental fatigue data: {str(e)}")
            return None
            
    def get_mental_fatigue_history(self, user_id, limit=50):
        """
        Get mental fatigue history for a user
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            records = list(collection.find(
                {'user_id': str(user_id), 'service_type': 'mental_fatigue'}
            ).sort('recorded_at', -1).limit(limit))
            
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
        except Exception as e:
            logger.error(f"Error getting mental fatigue history: {str(e)}")
            return None
    
    # Women's Health Tools - Category 5
    
    def save_menstrual_cycle(self, user_id, data):
        """
        Save menstrual cycle tracking data
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            document = MongoDBHealthServicesModel.create_menstrual_cycle_document(user_id, data)
            
            result = collection.insert_one(document)
            if result.inserted_id:
                logger.info(f"Menstrual cycle data saved for user {user_id}")
                return str(result.inserted_id)
            return None
        except Exception as e:
            logger.error(f"Error saving menstrual cycle data: {str(e)}")
            return None
    
    def get_menstrual_cycle_history(self, user_id, limit=50):
        """
        Get menstrual cycle history for a user
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            records = list(collection.find(
                {'user_id': str(user_id), 'service_type': 'menstrual_cycle'}
            ).sort('recorded_at', -1).limit(limit))
            
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
        except Exception as e:
            logger.error(f"Error getting menstrual cycle history: {str(e)}")
            return None
    
    def save_fertility_tracker(self, user_id, data):
        """
        Save fertility tracking data
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            document = MongoDBHealthServicesModel.create_fertility_tracker_document(user_id, data)
            
            result = collection.insert_one(document)
            if result.inserted_id:
                logger.info(f"Fertility tracking data saved for user {user_id}")
                return str(result.inserted_id)
            return None
        except Exception as e:
            logger.error(f"Error saving fertility tracking data: {str(e)}")
            return None
    
    def get_fertility_tracker_history(self, user_id, limit=50):
        """
        Get fertility tracking history for a user
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            records = list(collection.find(
                {'user_id': str(user_id), 'service_type': 'fertility_tracker'}
            ).sort('recorded_at', -1).limit(limit))
            
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
        except Exception as e:
            logger.error(f"Error getting fertility tracking history: {str(e)}")
            return None
    
    def save_pms_symptom(self, user_id, data):
        """
        Save PMS symptom data
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            document = MongoDBHealthServicesModel.create_pms_symptom_document(user_id, data)
            
            result = collection.insert_one(document)
            if result.inserted_id:
                logger.info(f"PMS symptom data saved for user {user_id}")
                return str(result.inserted_id)
            return None
        except Exception as e:
            logger.error(f"Error saving PMS symptom data: {str(e)}")
            return None
    
    def get_pms_symptom_history(self, user_id, limit=50):
        """
        Get PMS symptom history for a user
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            records = list(collection.find(
                {'user_id': str(user_id), 'service_type': 'pms_symptom'}
            ).sort('recorded_at', -1).limit(limit))
            
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
        except Exception as e:
            logger.error(f"Error getting PMS symptom history: {str(e)}")
            return None
    
    def save_pregnancy_guide(self, user_id, data):
        """
        Save pregnancy guide data
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            
            # Check if a record already exists for this user
            existing_record = collection.find_one({
                'user_id': str(user_id), 
                'service_type': 'pregnancy_guide'
            })
            
            document = MongoDBHealthServicesModel.create_pregnancy_guide_document(user_id, data)
            
            if existing_record:
                # Update existing record
                result = collection.update_one(
                    {'_id': existing_record['_id']},
                    {'$set': document}
                )
                if result.modified_count > 0:
                    logger.info(f"Pregnancy guide data updated for user {user_id}")
                    return str(existing_record['_id'])
            else:
                # Insert new record
                result = collection.insert_one(document)
                if result.inserted_id:
                    logger.info(f"Pregnancy guide data saved for user {user_id}")
                    return str(result.inserted_id)
            return None
        except Exception as e:
            logger.error(f"Error saving pregnancy guide data: {str(e)}")
            return None
    
    def get_pregnancy_guide(self, user_id):
        """
        Get pregnancy guide data for a user
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            record = collection.find_one({
                'user_id': str(user_id), 
                'service_type': 'pregnancy_guide'
            })
            
            return MongoDBHealthServicesModel.to_json(record)
        except Exception as e:
            logger.error(f"Error getting pregnancy guide data: {str(e)}")
            return None
    
    def save_pcos_checker(self, user_id, data):
        """
        Save PCOS checker data
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            document = MongoDBHealthServicesModel.create_pcos_checker_document(user_id, data)
            
            result = collection.insert_one(document)
            if result.inserted_id:
                logger.info(f"PCOS checker data saved for user {user_id}")
                return str(result.inserted_id)
            return None
        except Exception as e:
            logger.error(f"Error saving PCOS checker data: {str(e)}")
            return None
    
    def get_pcos_checker_history(self, user_id, limit=50):
        """
        Get PCOS checker history for a user
        """
        try:
            collection = self.get_collection(MongoDBHealthServicesModel.collection_name)
            records = list(collection.find(
                {'user_id': str(user_id), 'service_type': 'pcos_checker'}
            ).sort('recorded_at', -1).limit(limit))
            
            return [MongoDBHealthServicesModel.to_json(record) for record in records]
        except Exception as e:
            logger.error(f"Error getting PCOS checker history: {str(e)}")
            return None