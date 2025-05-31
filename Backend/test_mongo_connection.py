import pymongo
import os
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# Get MongoDB connection details
mongo_uri = os.environ.get('MONGODB_URI')
mongo_db_name = os.environ.get('MONGODB_NAME')

print(f"Attempting to connect to MongoDB with URI: {mongo_uri}")
print(f"Database name: {mongo_db_name}")

try:
    # Create a connection
    client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    
    # Force a connection to verify
    print("Server info:", client.server_info())
    
    # List databases
    print("Available databases:", client.list_database_names())
    
    # Get the database
    db = client[mongo_db_name]
    
    # List collections
    print("Collections in database:", db.list_collection_names())
    
    print("Connection successful!")
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
finally:
    # Close the connection
    if 'client' in locals():
        client.close()
        print("Connection closed") 