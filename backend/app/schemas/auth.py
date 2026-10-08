from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """Supported roles in CampusBridge."""
    STUDENT = "student"
    INDUSTRY = "industry"
    COLLEGE = "college"
    ADMIN = "admin"


class SignupRequest(BaseModel):
    """Public user registration request payload."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="User password (minimum 6 characters)")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full legal or professional name")
    role: UserRole = Field(..., description="Target role: student, industry, or college")
    phone: Optional[str] = Field(None, max_length=50, description="Optional contact phone number")


class LoginRequest(BaseModel):
    """User authentication login payload."""
    email: EmailStr
    password: str = Field(..., min_length=1, description="Account password")


class UserResponse(BaseModel):
    """Sanitized Supabase Auth identity representation."""
    id: str
    email: Optional[str] = None
    created_at: Optional[str] = None


class ProfileResponse(BaseModel):
    """Application profile representation from database."""
    id: str
    full_name: str
    email: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SessionData(BaseModel):
    """Session credentials returned upon authentication."""
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None


class AuthResponse(BaseModel):
    """Standardized authentication operation response."""
    user: UserResponse
    profile: Optional[ProfileResponse] = None
    session: Optional[SessionData] = None
    email_confirmation_required: bool = False
    message: str


class CurrentUserResponse(BaseModel):
    """Verified identity and profile for authenticated session."""
    user: UserResponse
    profile: Optional[ProfileResponse] = None
    role: Optional[str] = None


class LogoutResponse(BaseModel):
    """Response returned upon session termination."""
    success: bool = True
    message: str = "Logged out successfully. Remove bearer token from client storage."
