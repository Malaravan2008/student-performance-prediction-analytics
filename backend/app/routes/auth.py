import os
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import LoginRequest, LoginResponse
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEFAULT_EMAIL = os.getenv("DEMO_TEACHER_EMAIL", "teacher@example.com").lower()
DEFAULT_PASSWORD = os.getenv("DEMO_TEACHER_PASSWORD", "teacher123")

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authentication endpoint supporting configured credentials or database user.
    """
    configured_email = os.getenv("DEMO_TEACHER_EMAIL", DEFAULT_EMAIL).lower()
    configured_password = os.getenv("DEMO_TEACHER_PASSWORD", DEFAULT_PASSWORD)

    user = db.query(User).filter(User.email == req.email.lower()).first()
    
    is_valid = (
        (req.email.lower() == configured_email and req.password == configured_password) or
        (user and user.hashed_password == req.password)
    )

    if is_valid:
        user_info = {
            "id": user.id if user else 1,
            "email": req.email,
            "full_name": user.full_name if user else "Dr. Eleanor Vance",
            "role": user.role if user else "Senior Faculty & Counselor"
        }
        return LoginResponse(
            access_token="demo-jwt-token-faculty-session-xyz123",
            token_type="bearer",
            user=user_info
        )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password. Please check your credentials."
    )
