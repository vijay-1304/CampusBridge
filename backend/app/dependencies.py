import logging
from typing import Any, Callable, Dict, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.auth_service import get_profile
from app.services.supabase_service import get_supabase_client

logger = logging.getLogger(__name__)

# Security scheme for Bearer token extraction
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """
    Validate the incoming Supabase access token and resolve the caller's database profile.
    Never trusts client-supplied roles or unverified tokens.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials.strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token cannot be empty.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    client = get_supabase_client()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is currently unavailable.",
        )

    # Cryptographically validate the token directly with Supabase Auth
    try:
        user_response = client.auth.get_user(jwt=token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        auth_user = user_response.user
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("Token validation failed: %s", type(e).__name__)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(auth_user.id)

    # Fetch corresponding application profile from database
    profile = get_profile(user_id)
    role = profile.get("role") if profile else None

    return {
        "user": {
            "id": user_id,
            "email": auth_user.email,
            "created_at": str(auth_user.created_at) if auth_user.created_at else None,
        },
        "profile": profile,
        "role": role,
    }


def require_role(*allowed_roles: str) -> Callable:
    """
    Reusable dependency factory to enforce database-verified role authorization.
    Never relies on client-provided assertions.
    """
    async def role_checker(
        current_user: Dict[str, Any] = Depends(get_current_user),
    ) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if not user_role or user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: operation requires one of roles {allowed_roles}.",
            )
        return current_user

    return role_checker
