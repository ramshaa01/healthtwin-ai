from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from backend.auth import hash_password, verify_password, create_access_token
from backend.database import users_collection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    username: str
    password: str
    full_name: str = ""

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    full_name: str

@router.post("/signup", status_code=201)
def signup(request: SignupRequest):
    if users_collection.find_one({"username": request.username}):
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )
    users_collection.insert_one({
        "username":  request.username,
        "password":  hash_password(request.password),
        "full_name": request.full_name
    })
    return {"message": f"User '{request.username}' created successfully"}

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    user = users_collection.find_one({"username": request.username})
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    token = create_access_token({"sub": user["username"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        full_name=user.get("full_name", "")
    )
