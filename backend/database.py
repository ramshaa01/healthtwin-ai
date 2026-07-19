from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError
import os
import sys

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "healthtwin_ai"

print(f"[DB] Connecting to MongoDB... URL starts with: {MONGO_URL[:30]}***", flush=True)

try:
    client = MongoClient(
        MONGO_URL,
        serverSelectionTimeoutMS=15000,  # 15 sec to find server
        connectTimeoutMS=15000,          # 15 sec to establish connection
        socketTimeoutMS=30000,           # 30 sec for read/write ops
        retryWrites=True,
        w="majority",
    )
    # Force connection check
    client.admin.command("ping")
    print("[DB] MongoDB connected successfully!", flush=True)
except ServerSelectionTimeoutError as e:
    print(f"[DB] WARNING: MongoDB connection failed: {e}", flush=True)
    print("[DB] App will still start, but DB operations will fail.", flush=True)
    # Don't crash startup — let health-check still work

db: Database = client[DB_NAME]

# Collections
users_collection = db["users"]
predictions_collection = db["predictions"]

def get_db():
    return db
