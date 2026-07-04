import mongomock
from pymongo import MongoClient
from pymongo.database import Database
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "healthtwin_ai"

client = mongomock.MongoClient(MONGO_URL)
db: Database = client[DB_NAME]

# Collections
users_collection = db["users"]
predictions_collection = db["predictions"]

def get_db():
    return db
