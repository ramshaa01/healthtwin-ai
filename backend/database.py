from pymongo import MongoClient
from pymongo.database import Database
from pymongo.server_api import ServerApi
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "healthtwin_ai"

# Use ServerApi v1 for MongoDB Atlas compatibility
# serverSelectionTimeoutMS=10000 to fail fast if connection is wrong
client = MongoClient(
    MONGO_URL,
    server_api=ServerApi("1"),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=10000,
)
db: Database = client[DB_NAME]

# Collections
users_collection = db["users"]
predictions_collection = db["predictions"]

def get_db():
    return db
