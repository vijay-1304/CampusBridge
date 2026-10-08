from datetime import datetime
from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class ChallengeStatus(str, Enum):
    """Supported lifecycle statuses for industry challenges."""
    draft = "draft"
    published = "published"
    in_review = "in_review"
    matched = "matched"
    collaborating = "collaborating"
    completed = "completed"
    closed = "closed"


class IndustryProfileResponse(BaseModel):
    """Aggregated enterprise / industry partner profile representation."""
    id: str
    full_name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    role: str = "industry"
    company_name: str
    industry_domain: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class IndustryProfileUpdate(BaseModel):
    """Payload to update an industry profile."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    avatar_url: Optional[str] = None
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry_domain: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=2000)
    location: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)


class ChallengeRequirementCreate(BaseModel):
    """Payload to manually add a skill requirement to a challenge."""
    skill_id: str = Field(..., description="UUID of canonical skill from skills catalog")
    required_level: int = Field(..., ge=1, le=5, description="Required proficiency level (1-5)")
    importance_weight: float = Field(default=1.0, ge=0.0, le=1.0, description="Weighting factor (0.0 - 1.0)")


class ChallengeRequirementResponse(BaseModel):
    """Structured challenge requirement joined with canonical skill metadata."""
    id: str
    challenge_id: str
    skill_id: str
    skill_name: str
    category: Optional[str] = None
    required_level: int
    importance_weight: float
    is_ai_extracted: bool = False
    created_at: Optional[str] = None


class ChallengeCreate(BaseModel):
    """Payload to create a new industry challenge."""
    title: str = Field(..., min_length=3, max_length=255, description="Challenge title / problem headline")
    description: str = Field(..., min_length=10, description="Comprehensive problem statement and scope")
    domain: Optional[str] = Field(None, max_length=100, description="e.g. Healthcare, Fintech, EdTech")
    collaboration_type: Optional[str] = Field(None, max_length=100, description="e.g. Capstone, Research, Hackathon")
    location: Optional[str] = Field(None, max_length=100, description="Work location or Remote")
    deadline: Optional[datetime] = Field(None, description="Target proposal / completion deadline")


class ChallengeUpdate(BaseModel):
    """Payload to update an editable industry challenge."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    domain: Optional[str] = Field(None, max_length=100)
    collaboration_type: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    deadline: Optional[datetime] = None


class ChallengeStatusUpdate(BaseModel):
    """Payload to transition challenge lifecycle status."""
    status: ChallengeStatus = Field(..., description="Target status (e.g. published, closed)")


class ChallengeResponse(BaseModel):
    """Comprehensive representation of an industry challenge."""
    id: str
    industry_id: str
    company_name: Optional[str] = None
    title: str
    description: str
    domain: Optional[str] = None
    collaboration_type: Optional[str] = None
    status: str
    location: Optional[str] = None
    deadline: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_requirements: Optional[Any] = None
    requirements: List[ChallengeRequirementResponse] = []
    requirements_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ------------------------------------------------------------------------------
# AI Extraction Schemas
# ------------------------------------------------------------------------------

class ExtractedSkillItem(BaseModel):
    """Single skill requirement extracted by Gemini."""
    skill_name: str = Field(..., description="Extracted technical or domain skill keyword")
    required_level: int = Field(default=3, ge=1, le=5, description="Estimated proficiency (1-5)")
    importance_weight: float = Field(default=1.0, ge=0.0, le=1.0, description="Importance weighting (0.0-1.0)")


class GeminiExtractionResponse(BaseModel):
    """Structured output expected from Gemini analysis."""
    summary: str = Field(..., description="Executive summary of the problem and technical scope")
    requirements: List[ExtractedSkillItem] = Field(default_factory=list, description="Extracted skill requirements")


class ChallengeAnalysisResult(BaseModel):
    """Response returned upon completing AI analysis and canonical skill resolution."""
    challenge_id: str
    ai_summary: str
    mapped_requirements: List[ChallengeRequirementResponse]
    unresolved_skills: List[str] = []
    ready_for_matching: bool = False
