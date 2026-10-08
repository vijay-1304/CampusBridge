import logging
from typing import Any, Dict, Optional
from supabase import Client, create_client
from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseService:
    """Reusable service for managing the Supabase client and connection state."""

    _client: Optional[Client] = None

    @classmethod
    def is_configured(cls) -> bool:
        """Check whether Supabase environment variables are provided and not placeholders."""
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
    def get_client(cls) -> Optional[Client]:
        """
        Get or initialize the reusable Supabase client instance.
        Returns None if Supabase configuration is not present or invalid.
        """
        if not cls.is_configured():
            return None

        if cls._client is None:
            try:
                cls._client = create_client(
                    supabase_url=settings.SUPABASE_URL,
                    supabase_key=settings.SUPABASE_KEY,
                )
                logger.info("Supabase client successfully initialized.")
            except Exception as e:
                logger.error("Failed to initialize Supabase client: %s", type(e).__name__)
                return None

        return cls._client

    @classmethod
    def check_connection(cls) -> Dict[str, Any]:
        """
        Safe connection check verifying configuration and client initialization
        without exposing any credentials.
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
            }

        return {
            "configured": True,
            "initialized": False,
            "status": "initialization_failed",
            "message": "Supabase configuration present but client initialization failed",
        }


# Convenience module-level exports
get_supabase_client = SupabaseService.get_client
check_supabase_connection = SupabaseService.check_connection
is_supabase_configured = SupabaseService.is_configured
