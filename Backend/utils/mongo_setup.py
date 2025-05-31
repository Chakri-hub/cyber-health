import os
import logging
from .mongo_client import MongoDBClient
import time

logger = logging.getLogger(__name__)

def setup_mongodb(max_retries=1, retry_delay=5):
    """
    Set up the MongoDB connection using environment variables or settings
    with retry mechanism and graceful fallback
    """
    from django.conf import settings
    
    # Get MongoDB connection details from settings or environment variables
    mongo_uri = getattr(settings, 'MONGODB_URI', os.environ.get('MONGODB_URI'))
    mongo_db_name = getattr(settings, 'MONGODB_NAME', os.environ.get('MONGODB_NAME', 'cyber_health'))
    
    if not mongo_uri:
        logger.warning("MongoDB URI not configured. MongoDB features will be disabled.")
        return False
    
    # Try to connect with retries
    retry_count = 0
    while retry_count < max_retries:
        # Initialize MongoDB client
        client = MongoDBClient()
        success = client.initialize(mongo_uri, mongo_db_name)
        
        if success:
            logger.info(f"MongoDB setup completed successfully with database: {mongo_db_name}")
            # Test the connection by listing collections
            try:
                collections = client.get_database().list_collection_names()
                logger.info(f"MongoDB collections: {collections}")
                return True
            except Exception as e:
                logger.error(f"Error listing MongoDB collections: {str(e)}")
                # If we can initialize but not list collections, it's probably a permission issue
                # We'll consider this a successful connection anyway
                return True
        else:
            retry_count += 1
            if retry_count < max_retries:
                logger.warning(f"MongoDB connection failed. Retrying in {retry_delay} seconds... ({retry_count}/{max_retries})")
                time.sleep(retry_delay)
            else:
                logger.error("MongoDB setup failed after maximum retry attempts. Running in offline mode.")
    
    # If we reach here, all connection attempts failed
    logger.warning("Application will run without MongoDB support. Some features may be limited.")
    return False