from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class MongoModelsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mongo_models'
    
    def ready(self):
        """
        Initialize MongoDB connection when the app is ready
        """
        from django.conf import settings
        from utils.mongo_client import MongoDBClient
        
        try:
            logger.info("Initializing MongoDB connection...")
            mongo_client = MongoDBClient()
            success = mongo_client.initialize(settings.MONGODB_URI, settings.MONGODB_NAME)
            
            if success:
                # Test the connection with a ping command
                try:
                    mongo_client.get_database().command('ping')
                    logger.info(f"MongoDB connection initialized successfully to database: {settings.MONGODB_NAME}")
                except Exception as e:
                    logger.error(f"MongoDB connection test failed: {str(e)}")
                    logger.warning("Application will use offline mode with localStorage for data persistence")
            else:
                logger.error("Failed to initialize MongoDB connection. Check your connection string and credentials.")
                logger.warning("Application will use offline mode with localStorage for data persistence")
        except Exception as e:
            logger.error(f"Error initializing MongoDB connection: {str(e)}")
            logger.warning("Application will use offline mode with localStorage for data persistence")