from typing import Optional
from fastapi import APIRouter, Depends, Header

from app.dependencies import get_current_user
from app.schemas.auth import (
    AuthResponse,
    CurrentUserResponse,
    LoginRequest,
    LogoutResponse,
    SignupRequest,
)
from app.services.auth_service import login, logout, signup

router = APIRouter()


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=201,
    summary="Register a new user account",
)
async def signup_endpoint(request: SignupRequest) -> AuthResponse:
    """
    Register a new CampusBridge student, industry, or college user using Supabase Auth.
    Administrative registration is blocked.
    """
    return signup(request)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate with email and password",
)
async def login_endpoint(request: LoginRequest) -> AuthResponse:
    """
    Authenticate an existing CampusBridge user and retrieve session token and profile.
    """
    return login(request)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Terminate session / log out",
)
async def logout_endpoint(
    authorization: Optional[str] = Header(None),
) -> LogoutResponse:
    """
    Stateless logout endpoint. Instructs client to discard the access token.
    """
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
    return logout(token)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Get current authenticated user identity and profile",
)
async def current_user_endpoint(
    current_user=Depends(get_current_user),
) -> CurrentUserResponse:
    """
    Return the caller's validated Supabase Auth identity and verified PostgreSQL profile.
    Requires Authorization: Bearer <token>.
    """
    return CurrentUserResponse(
        user={
            "id": current_user["user"]["id"],
            "email": current_user["user"]["email"],
            "created_at": current_user["user"]["created_at"],
        },
        profile=current_user.get("profile"),
        role=current_user.get("role"),
    )