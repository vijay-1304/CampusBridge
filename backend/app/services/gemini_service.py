import json
import logging
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from google import genai
from google.genai import types

from app.config import settings
from app.schemas.industry import GeminiExtractionResponse

logger = logging.getLogger(__name__)


class GeminiService:
    """Service wrapping Google Gemini AI for structured challenge analysis."""

    _client: Optional[genai.Client] = None

    @classmethod
    def is_configured(cls) -> bool:
        """Check whether GEMINI_API_KEY is configured and non-empty."""
        key = settings.GEMINI_API_KEY
        return bool(key and key.strip() and "your-gemini" not in key)

    @classmethod
    def get_client(cls) -> genai.Client:
        """Initialize or retrieve the official Google Gen AI Client."""
        if not cls.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini AI service is not configured on the backend. Please configure GEMINI_API_KEY.",
            )

        if cls._client is None:
            try:
                cls._client = genai.Client(api_key=settings.GEMINI_API_KEY.strip())
                logger.info("Gemini GenAI client initialized.")
            except Exception as e:
                logger.error("Failed to initialize Gemini GenAI client: %s", type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to initialize Gemini AI client.",
                ) from e

        return cls._client

    @classmethod
    def extract_challenge_requirements(
        cls,
        title: str,
        description: str,
        domain: Optional[str] = None,
        collaboration_type: Optional[str] = None,
    ) -> GeminiExtractionResponse:
        """
        Analyze challenge details with Gemini and extract structured summary and skill requirements.
        Output is validated against Pydantic schema GeminiExtractionResponse.
        """
        client = cls.get_client()

        prompt = f"""You are an expert AI technical architect and academic-industry alignment specialist for CampusBridge.
Analyze the following industry challenge and extract an executive summary and a list of specific technical/domain skill requirements.

Challenge Title: {title}
Domain: {domain or 'General Technology'}
Collaboration Type: {collaboration_type or 'Project Collaboration'}
Description:
{description}

Instructions:
1. Provide a concise 2-3 sentence executive technical summary of the core objective and deliverables.
2. Extract required technical skills. Use standard, industry-recognized names (e.g., 'Python', 'React', 'SQL', 'Machine Learning', 'Computer Vision', 'Cloud Computing', 'Cybersecurity', 'IoT', 'Data Science', 'JavaScript').
3. For each skill:
   - "skill_name": standard canonical name (string)
   - "required_level": estimated proficiency integer from 1 (Beginner) to 5 (Advanced Expert)
   - "importance_weight": float between 0.1 and 1.0 indicating criticality

Return ONLY a valid JSON object matching this schema:
{{
  "summary": "Executive summary string",
  "requirements": [
    {{
      "skill_name": "Skill Name",
      "required_level": 3,
      "importance_weight": 0.9
    }}
  ]
}}
"""

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=config,
            )

            raw_text = response.text
            if not raw_text:
                raise ValueError("Empty response text received from Gemini AI.")

            parsed_json = json.loads(raw_text)
            return GeminiExtractionResponse.model_validate(parsed_json)

        except HTTPException:
            raise
        except json.JSONDecodeError as jde:
            logger.error("Failed to parse Gemini JSON output: %s", jde)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI provider returned malformed structured data.",
            ) from jde
        except Exception as e:
            err_msg = str(e).lower()
            logger.error("Gemini content generation failed: %s", type(e).__name__)
            if "rate limit" in err_msg or "resource_exhausted" in err_msg or "429" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="AI analysis is temporarily rate limited by the provider. Please try again shortly.",
                )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to complete AI requirement extraction.",
            ) from e


# Convenience module-level accessor
extract_challenge_requirements = GeminiService.extract_challenge_requirements
is_gemini_configured = GeminiService.is_configured
