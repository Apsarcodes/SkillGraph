import os
import hashlib
import binascii
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.database.session import get_db
from backend.database.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Password hashing with PBKDF2-HMAC-SHA256 for deterministic reliability across all platforms
def hash_password(password: str) -> str:
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')

def verify_password(stored_password: str, provided_password: str) -> bool:
    if not stored_password or len(stored_password) < 64:
        return False
    salt = stored_password[:64]
    stored_hash = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512', provided_password.encode('utf-8'), salt.encode('ascii'), 100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_hash

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # If no token provided or demo token used, check for demo user
    if not token or token == "demo_jwt_token_99182":
        demo_user = db.query(User).filter(User.is_demo == True).first()
        if not demo_user:
            demo_user = User(
                id="usr_demo_4981",
                email="alex.chen@skillgraph.ai",
                hashed_password=hash_password("DemoPassword123!"),
                full_name="Alex Chen",
                target_role="Senior Full Stack & AI Systems Engineer",
                experience_level="Mid-Level (3+ years)",
                is_demo=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return demo_user

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
