from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== Models =====

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageResponse(BaseModel):
    message: str

# ===== Purchase Models =====

class PurchaseCreate(BaseModel):
    program_id: str
    program_name: str
    price: float

class PurchaseResponse(BaseModel):
    id: str
    user_id: str
    program_id: str
    program_name: str
    price: float
    status: str
    purchased_at: str

class ProgressUpdate(BaseModel):
    completed: bool

class ProgressResponse(BaseModel):
    program_id: str
    day_id: str
    completed: bool
    completed_at: Optional[str] = None

# ===== Helper Functions =====

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# ===== Auth Endpoints =====

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password": hash_password(user_data.password),
        "google_id": None,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token({"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email.lower(),
            created_at=now
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_data.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    access_token = create_access_token({"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

# ===== Purchase Endpoints =====

@api_router.post("/purchases", response_model=PurchaseResponse)
async def create_purchase(purchase_data: PurchaseCreate, current_user: dict = Depends(get_current_user)):
    # Check if user already has this program
    existing = await db.purchases.find_one({
        "user_id": current_user["id"],
        "program_id": purchase_data.program_id
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already own this program"
        )
    
    purchase_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    purchase_doc = {
        "id": purchase_id,
        "user_id": current_user["id"],
        "program_id": purchase_data.program_id,
        "program_name": purchase_data.program_name,
        "price": purchase_data.price,
        "status": "active",
        "purchased_at": now
    }
    
    await db.purchases.insert_one(purchase_doc)
    
    return PurchaseResponse(**purchase_doc)

@api_router.get("/purchases", response_model=List[PurchaseResponse])
async def get_purchases(current_user: dict = Depends(get_current_user)):
    purchases = await db.purchases.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(100)
    return [PurchaseResponse(**p) for p in purchases]

@api_router.get("/purchases/{program_id}")
async def get_purchase(program_id: str, current_user: dict = Depends(get_current_user)):
    purchase = await db.purchases.find_one(
        {"user_id": current_user["id"], "program_id": program_id},
        {"_id": 0}
    )
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return PurchaseResponse(**purchase)

# ===== Progress Endpoints =====

@api_router.post("/progress/{program_id}/day/{day_id}")
async def mark_day_complete(program_id: str, day_id: str, current_user: dict = Depends(get_current_user)):
    # Verify user owns this program
    purchase = await db.purchases.find_one({
        "user_id": current_user["id"],
        "program_id": program_id
    })
    if not purchase:
        raise HTTPException(status_code=403, detail="You don't own this program")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Upsert progress
    await db.progress.update_one(
        {"user_id": current_user["id"], "program_id": program_id, "day_id": day_id},
        {"$set": {
            "user_id": current_user["id"],
            "program_id": program_id,
            "day_id": day_id,
            "completed": True,
            "completed_at": now
        }},
        upsert=True
    )
    
    return {"message": "Day marked complete", "day_id": day_id, "completed_at": now}

@api_router.get("/progress/{program_id}")
async def get_program_progress(program_id: str, current_user: dict = Depends(get_current_user)):
    progress = await db.progress.find(
        {"user_id": current_user["id"], "program_id": program_id},
        {"_id": 0}
    ).to_list(100)
    return progress

# ===== Root Endpoint =====

@api_router.get("/")
async def root():
    return {"message": "FitStart API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
