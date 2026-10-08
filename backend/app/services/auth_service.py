import logging
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from supabase_auth.errors import (
    AuthApiError,
    AuthInvalidCredentialsError,
    AuthWeakPasswordError,
)

from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutResponse,
    ProfileResponse,
    SessionData,
    SignupRequest,
    UserResponse,
    UserRole,
)
from app.services.supabase_service import (
    get_supabase_admin_client,
    get_supabase_client,
    has_supabase_admin_key,
)

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication and identity lifecycle management with Supabase Auth."""

    @staticmethod
    def get_client():
        """Ensure active Supabase client is available."""
        client = get_supabase_client()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase authentication service is currently unavailable.",
            )
        return client

    @classmethod
    def get_profile(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch application profile from the database by user ID.
        Uses admin client when available to respect RLS policies safely.
        """
        try:
            if has_supabase_admin_key():
                client = get_supabase_admin_client()
            else:
                client = cls.get_client()
            res = client.table("profiles").select("*").eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error("Error retrieving profile for user %s: %s", user_id, type(e).__name__)
            return None

    @classmethod
    def create_profile(
        cls,
        user_id: str,
        full_name: str,
        email: str,
        role: str,
        phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create the application profile row in PostgreSQL.
        Profiles.id must strictly equal auth.users.id.
        """
        if not has_supabase_admin_key():
            logger.warning(
                "SUPABASE_SERVICE_ROLE_KEY is not configured. "
                "Profile creation may be subject to RLS restrictions."
            )

        client = get_supabase_admin_client() if has_supabase_admin_key() else cls.get_client()

        # Check if profile already exists (e.g. from trigger or previous attempt)
        existing = cls.get_profile(user_id)
        if existing:
            return existing

        profile_payload = {
            "id": user_id,
            "full_name": full_name,
            "email": email,
            "role": role,
            "phone": phone,
        }

        try:
            res = client.table("profiles").insert(profile_payload).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return profile_payload
        except Exception as e:
            err_str = str(e)
            logger.error("Database profile creation failed for user %s: %s", user_id, type(e).__name__)
            if "duplicate key" in err_str or "unique constraint" in err_str.lower():
                existing_retry = cls.get_profile(user_id)
                if existing_retry:
                    return existing_retry
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A profile with this identity already exists.",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account registered with auth provider, but profile creation failed. Please contact support.",
            )

    @classmethod
    def signup(cls, request: SignupRequest) -> AuthResponse:
        """
        Register a new user through Supabase Auth and initialize application profile.
        Public registration for admin accounts is strictly forbidden.
        """
        # Strict role validation: Admin cannot be registered publicly
        if request.role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrative accounts cannot be created via public registration.",
            )

        client = cls.get_client()

        # Execute Supabase Auth signup
        try:
            auth_res = client.auth.sign_up(
                {
                    "email": request.email,
                    "password": request.password,
                    "options": {
                        "data": {
                            "full_name": request.full_name,
                            "role": request.role.value,
                        }
                    },
                }
            )
        except AuthApiError as e:
            logger.warning("Supabase AuthApiError during signup: status=%s, code=%s", e.status, e.code)
            # 1. Email rate limiting
            if e.status == 429 or e.code in (
                "over_email_send_rate_limit",
                "over_request_rate_limit",
                "over_sms_send_rate_limit",
            ) or "rate limit" in str(e.message).lower():
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Signup is temporarily rate limited by the authentication provider. Please try again later.",
                )
            # 2. Already registered / duplicate email
            if e.status == 409 or e.code in (
                "user_already_exists",
                "email_exists",
                "identity_already_exists",
                "conflict",
            ) or "already registered" in str(e.message).lower() or "already exists" in str(e.message).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email address already exists.",
                )
            # 3. Invalid email address
            if e.code in ("email_address_invalid", "validation_failed") or "valid email" in str(e.message).lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide a valid email address.",
                )
            # 4. Weak password / security failure
            if e.code in ("weak_password", "same_password") or isinstance(e, AuthWeakPasswordError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password does not meet the required security requirements.",
                )
            # Generic AuthApiError fallback
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST if e.status < 500 else status.HTTP_502_BAD_GATEWAY,
                detail=e.message if e.status < 500 else "Authentication provider encountered an error.",
            )
        except Exception as e:
            err_msg = str(e).lower()
            logger.warning("Unhandled exception during signup: %s", type(e).__name__)
            if "rate limit" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Signup is temporarily rate limited by the authentication provider. Please try again later.",
                )
            if "already registered" in err_msg or "already exists" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email address already exists.",
                )
            if "password" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password does not meet the required security requirements.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to process registration request with authentication provider.",
            )

        if not auth_res or not auth_res.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration could not be completed with the authentication provider.",
            )

        user_id = str(auth_res.user.id)

        # Create corresponding application profile (profiles.id == auth.users.id)
        try:
            profile_data = cls.create_profile(
                user_id=user_id,
                full_name=request.full_name,
                email=request.email,
                role=request.role.value,
                phone=request.phone,
            )
        except Exception as profile_err:
            logger.error("Profile creation failed after auth signup for user %s: %s", user_id, profile_err)
            # Attempt rollback of orphaned auth user if admin access is configured
            if has_supabase_admin_key():
                try:
                    admin_client = get_supabase_admin_client()
                    admin_client.auth.admin.delete_user(user_id)
                    logger.info("Rolled back orphaned auth user %s after profile creation failure.", user_id)
                except Exception as rollback_err:
                    logger.error("Failed to rollback orphaned auth user %s: %s", user_id, rollback_err)
            raise profile_err

        # Determine if email confirmation is required by Supabase
        session_data: Optional[SessionData] = None
        email_confirmation_required = False

        if auth_res.session:
            session_data = SessionData(
                access_token=auth_res.session.access_token,
                token_type=auth_res.session.token_type or "bearer",
                expires_in=auth_res.session.expires_in,
                refresh_token=auth_res.session.refresh_token,
            )
            msg = "Registration successful."
        else:
            email_confirmation_required = True
            msg = "Registration successful. Please verify your email before logging in."

        return AuthResponse(
            user=UserResponse(
                id=user_id,
                email=auth_res.user.email,
                created_at=str(auth_res.user.created_at) if auth_res.user.created_at else None,
            ),
            profile=ProfileResponse(
                id=profile_data["id"],
                full_name=profile_data.get("full_name", request.full_name),
                email=profile_data.get("email", request.email),
                role=profile_data.get("role", request.role.value),
                avatar_url=profile_data.get("avatar_url"),
                phone=profile_data.get("phone", request.phone),
                created_at=str(profile_data.get("created_at")) if profile_data.get("created_at") else None,
                updated_at=str(profile_data.get("updated_at")) if profile_data.get("updated_at") else None,
            ),
            session=session_data,
            email_confirmation_required=email_confirmation_required,
            message=msg,
        )

    @classmethod
    def login(cls, request: LoginRequest) -> AuthResponse:
        """Authenticate user credentials against Supabase Auth and retrieve profile."""
        client = cls.get_client()

        try:
            auth_res = client.auth.sign_in_with_password(
                {
                    "email": request.email,
                    "password": request.password,
                }
            )
        except AuthApiError as e:
            logger.warning("Supabase AuthApiError during login: %s", e.code)
            if e.code == "email_not_confirmed":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email has not been verified. Please verify your email address.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if e.status == 429 or "rate limit" in str(e.message).lower():
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Login is temporarily rate limited. Please try again later.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            logger.warning("Supabase login rejected: %s", type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not auth_res or not auth_res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not auth_res.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed or email has not been verified.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = str(auth_res.user.id)
        profile_data = cls.get_profile(user_id)

        session_data = SessionData(
            access_token=auth_res.session.access_token,
            token_type=auth_res.session.token_type or "bearer",
            expires_in=auth_res.session.expires_in,
            refresh_token=auth_res.session.refresh_token,
        )

        profile_resp = None
        if profile_data:
            profile_resp = ProfileResponse(
                id=profile_data["id"],
                full_name=profile_data.get("full_name", ""),
                email=profile_data.get("email", auth_res.user.email),
                role=profile_data.get("role", "student"),
                avatar_url=profile_data.get("avatar_url"),
                phone=profile_data.get("phone"),
                created_at=str(profile_data.get("created_at")) if profile_data.get("created_at") else None,
                updated_at=str(profile_data.get("updated_at")) if profile_data.get("updated_at") else None,
            )

        return AuthResponse(
            user=UserResponse(
                id=user_id,
                email=auth_res.user.email,
                created_at=str(auth_res.user.created_at) if auth_res.user.created_at else None,
            ),
            profile=profile_resp,
            session=session_data,
            email_confirmation_required=False,
            message="Login successful.",
        )

    @classmethod
    def logout(cls, token: Optional[str] = None) -> LogoutResponse:
        """
        Handle user logout. In stateless JWT architecture, the client discards the token.
        Calls Supabase Auth sign_out if available.
        """
        try:
            client = cls.get_client()
            client.auth.sign_out()
        except Exception:
            pass  # Stateless logout always succeeds for caller

        return LogoutResponse(
            success=True,
            message="Logged out successfully. Remove bearer token from client storage.",
        )


# Convenience module-level exports
signup = AuthService.signup
login = AuthService.login
logout = AuthService.logout
get_profile = AuthService.get_profile
create_profile = AuthService.create_profile
