from datetime import datetime
from bson import ObjectId
import logging
import json

logger = logging.getLogger(__name__)

class MongoDBDeviceModel:
    """
    MongoDB model for user device data
    """
    collection_name = 'user_devices'
    
    @staticmethod
    def create_device_document(user_id, device_data):
        """
        Create a device document from device data
        """
        # Ensure user_id is a string
        str_user_id = str(user_id)
        
        logger.info(f"Creating device document for user_id: {str_user_id}")
        logger.info(f"Device data: {json.dumps(device_data, default=str)}")
        
        # Create the document with proper defaults and map frontend fields to database fields
        document = {
            'user_id': str_user_id,
            'device_type': device_data.get('device', 'Unknown'),
            'os': device_data.get('os', 'Unknown'),
            'browser': device_data.get('browser', 'Unknown'),
            'screen_resolution': device_data.get('screenResolution', 'Unknown'),
            'color_depth': device_data.get('colorDepth', 'Unknown'),
            'language': device_data.get('language', 'Unknown'),
            'timezone': device_data.get('timezone', 'Unknown'),
            'cookies_enabled': device_data.get('cookiesEnabled', 'Unknown'),
            'user_agent': device_data.get('userAgent', 'Unknown'),
            'ip_address': device_data.get('ip', 'Unknown'),
            'location': device_data.get('location', 'Unknown'),
            'created_at': datetime.now(),
            'last_seen': datetime.now()
        }
        
        # Add any additional fields that might be in device_data but not in our standard mapping
        for key, value in device_data.items():
            if key not in ['device', 'os', 'browser', 'screenResolution', 'colorDepth', 
                          'language', 'timezone', 'cookiesEnabled', 'userAgent', 
                          'ip', 'location', 'userId'] and key not in document:
                document[key] = value
        
        logger.info(f"Created device document: {json.dumps(document, default=str)}")
        return document
    
    @staticmethod
    def to_json(device_document):
        """
        Convert MongoDB document to JSON-serializable format
        """
        if not device_document:
            return None
            
        # Create a copy to avoid modifying the original document
        result = dict(device_document)
        
        # Convert ObjectId to string
        if '_id' in result:
            result['_id'] = str(result['_id'])
        
        # Convert datetime objects to ISO format strings
        for field in ['created_at', 'last_seen']:
            if field in result and result[field]:
                if isinstance(result[field], datetime):
                    result[field] = result[field].isoformat()
        
        # Log the conversion for debugging
        logger.debug(f"Converted device document: {json.dumps(result, default=str)}")
        
        return result 