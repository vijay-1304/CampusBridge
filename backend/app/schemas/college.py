from typing import List, Optional
from pydantic import BaseModel, Field


# ------------------------------------------------------------------------------
# College Institution Profile Schemas
# ------------------------------------------------------------------------------

class CollegeProfileResponse(BaseModel):
    """Aggregated academic institution profile representation."""
    id: str = Field(..., description="Unique UUID identifier of the college institution")
    profile_id: str = Field(..., description="User identity UUID linked to auth.users and profiles")
    college_name: str = Field(..., description="Official name of the academic institution")
    description: Optional[str] = Field(None, description="Institutional overview, departments, or research focus")
    location: Optional[str] = Field(None, description="Campus location, city, or state")
    website: Optional[str] = Field(None, description="Institutional website URL")
    email: Optional[str] = Field(None, description="Primary administrative / account email")
    full_name: Optional[str] = Field(None, description="Representative contact full name")
    phone: Optional[str] = Field(None, description="Contact phone number")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class CollegeProfileUpdate(BaseModel):
    """Payload to update an academic institution profile."""
    college_name: Optional[str] = Field(None, min_length=2, max_length=255, description="Official college name")
    description: Optional[str] = Field(None, max_length=2000, description="Overview and research description")
    location: Optional[str] = Field(None, max_length=200, description="Campus location")
    website: Optional[str] = Field(None, max_length=500, description="Official website URL")
    full_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Institutional contact name")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")


# ------------------------------------------------------------------------------
# College Capability Schemas
# ------------------------------------------------------------------------------

class CollegeCapabilityCreate(BaseModel):
    """Payload to add a verifiable faculty/infrastructure capability."""
    skill_id: str = Field(..., description="UUID of canonical skill from skills catalog")
    proficiency_level: int = Field(..., ge=1, le=5, description="Institutional proficiency level (1-5)")
    faculty_count: int = Field(default=0, ge=0, description="Number of faculty members specializing in this skill")
    infrastructure_details: Optional[str] = Field(
        None, max_length=2000, description="Specialized labs, compute clusters, equipment, or research centers"
    )


class CollegeCapabilityUpdate(BaseModel):
    """Payload to update an existing capability record."""
    proficiency_level: Optional[int] = Field(None, ge=1, le=5, description="Institutional proficiency level (1-5)")
    faculty_count: Optional[int] = Field(None, ge=0, description="Number of faculty members specializing in this skill")
    infrastructure_details: Optional[str] = Field(
        None, max_length=2000, description="Specialized labs, compute clusters, equipment, or research centers"
    )


class CollegeCapabilityResponse(BaseModel):
    """Institutional academic capability joined with canonical skill metadata."""
    id: str
    college_id: str
    skill_id: str
    skill_name: str
    category: Optional[str] = None
    description: Optional[str] = None
    proficiency_level: int
    faculty_count: int
    infrastructure_details: Optional[str] = None
    created_at: Optional[str] = None


# ------------------------------------------------------------------------------
# Skill Catalog Schema
# ------------------------------------------------------------------------------

class CollegeSkillCatalogItem(BaseModel):
    """Canonical verifiable skill catalog entry."""
    id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


# ------------------------------------------------------------------------------
# College Matches View Schemas
# ------------------------------------------------------------------------------

class CollegeMatchItem(BaseModel):
    """Affinity match between the authenticated college and an industry challenge."""
    match_id: str
    challenge_id: str
    challenge_title: str
    domain: Optional[str] = None
    collaboration_type: Optional[str] = None
    company_name: Optional[str] = None
    overall_score: float = Field(..., ge=0.0, le=100.0)
    skill_score: float = Field(..., ge=0.0, le=100.0)
    capability_score: float = Field(..., ge=0.0, le=100.0)
    reasoning: str
    status: str
    created_at: Optional[str] = None


class CollegeMatchesResponse(BaseModel):
    """Collection of matches evaluated for the authenticated college."""
    college_id: str
    total_matches: int
    matches: List[CollegeMatchItem] = []
