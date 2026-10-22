from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database.models import User
from backend.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    password: str
    targetRole: str = "Senior Full Stack & AI Systems Engineer"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.fullName,
        target_role=req.targetRole,
        experience_level="Mid-Level",
        is_demo=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "targetRole": user.target_role,
            "experienceLevel": user.experience_level,
            "isDemo": False
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(user.hashed_password, req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "targetRole": user.target_role,
            "experienceLevel": user.experience_level,
            "isDemo": user.is_demo
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "fullName": current_user.full_name,
        "targetRole": current_user.target_role,
        "experienceLevel": current_user.experience_level,
        "isDemo": current_user.is_demo
    }
