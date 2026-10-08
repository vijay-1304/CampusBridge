import logging
from typing import Any, Dict, Optional
from supabase import Client, create_client
from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseService:
    """Reusable service for managing Supabase standard and administrative clients."""

    _client: Optional[Client] = None
    _admin_client: Optional[Client] = None

    @classmethod
    def is_configured(cls) -> bool:
        """Check whether Supabase base environment variables are provided and not placeholders."""
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_KEY
        if not url or not key:
            return False

        url_str = url.strip()
        key_str = key.strip()
        if not url_str or not key_str:
            return False

        # Reject default placeholder values
        if "your-project-ref" in url_str or "your-anon-public-key" in key_str:
            return False

        return True

    @classmethod
    def has_admin_key(cls) -> bool:
        """Check if the backend secret/service-role key is configured."""
        key = settings.SUPABASE_SERVICE_ROLE_KEY
        if not key or not key.strip() or "your-service-role" in key:
            return False
        return True

    @classmethod
    def get_client(cls) -> Optional[Client]:
        """
        Get or initialize the reusable standard Supabase client instance (publishable/anon key).
        Returns None if Supabase configuration is not present or invalid.
        """
        if not cls.is_configured():
            return None

        if cls._client is None:
            try:
                cls._client = create_client(
                    supabase_url=settings.SUPABASE_URL.strip(),
                    supabase_key=settings.SUPABASE_KEY.strip(),
                )
                logger.info("Supabase standard client initialized.")
            except Exception as e:
                logger.error("Failed to initialize Supabase standard client: %s", type(e).__name__)
                return None

        return cls._client

    @classmethod
    def get_admin_client(cls) -> Client:
        """
        Get or initialize the privileged Supabase client instance (backend secret key).
        Never silently falls back to the publishable/anon key.
        Raises RuntimeError if the secret key is missing or invalid.
        """
        if not cls.is_configured():
            raise RuntimeError("Supabase base URL and key are not configured.")

        if not cls.has_admin_key():
            raise RuntimeError(
                "SUPABASE_SERVICE_ROLE_KEY is required for privileged backend operations but is not configured."
            )

        if cls._admin_client is None:
            try:
                cls._admin_client = create_client(
                    supabase_url=settings.SUPABASE_URL.strip(),
                    supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY.strip(),
                )
                logger.info("Supabase admin client initialized.")
            except Exception as e:
                logger.error("Failed to initialize Supabase admin client: %s", type(e).__name__)
                raise RuntimeError("Failed to initialize Supabase admin client.") from e

        return cls._admin_client

    @classmethod
    def check_connection(cls) -> Dict[str, Any]:
        """
        Safe connection check verifying configuration and client initialization
        without exposing any credentials or secrets.
        """
        if not cls.is_configured():
            return {
                "configured": False,
                "initialized": False,
                "status": "not_configured",
                "message": "Supabase environment configuration not provided",
            }

        client = cls.get_client()
        if client is not None:
            return {
                "configured": True,
                "initialized": True,
                "status": "ready",
                "message": "Supabase client initialized successfully",
                "has_admin_access": cls.has_admin_key(),
            }

        return {
            "configured": True,
            "initialized": False,
            "status": "initialization_failed",
            "message": "Supabase configuration present but client initialization failed",
        }


# Convenience module-level exports
get_supabase_client = SupabaseService.get_client
get_supabase_admin_client = SupabaseService.get_admin_client
check_supabase_connection = SupabaseService.check_connection
is_supabase_configured = SupabaseService.is_configured
has_supabase_admin_key = SupabaseService.has_admin_key
