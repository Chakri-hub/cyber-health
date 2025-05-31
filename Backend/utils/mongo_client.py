from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)

class MongoDBClient:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
        return cls._instance
    
    def initialize(self, connection_string, db_name):
        """
        Initialize the MongoDB client with the connection string and database name
        """
        try:
            self._client = MongoClient(connection_string)
            self._db = self._client[db_name]
            logger.info(f"MongoDB connection established to database: {db_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            return False
    
    def get_database(self):
        """
        Get the MongoDB database instance
        """
        if self._db is None:
            raise Exception("MongoDB client not initialized. Call initialize() first.")
        return self._db
    
    def get_collection(self, collection_name):
        """
        Get a collection from the MongoDB database
        """
        if self._db is None:
            raise Exception("MongoDB client not initialized. Call initialize() first.")
        return self._db[collection_name]
    
    def close(self):
        """
        Close the MongoDB connection
        """
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed")
            self._client = None
            self._db = None