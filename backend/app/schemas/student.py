from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class StudentSkillSource(str, Enum):
    """Provenance/source of the student skill claim."""
    self_reported = "self_reported"
    assessment = "assessment"
    project = "project"
    certificate = "certificate"
    collaboration = "collaboration"


class CollegeBasic(BaseModel):
    """Basic institution details for student profile rendering."""
    id: str
    college_name: str
    location: Optional[str] = None
    website: Optional[str] = None


class SkillCatalogItem(BaseModel):
    """Canonical skill definition from the master skill catalog."""
    id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


class StudentProfileResponse(BaseModel):
    """Aggregated student profile representation."""
    id: str
    full_name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    role: str = "student"
    college_id: Optional[str] = None
    college: Optional[CollegeBasic] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class StudentProfileUpdate(BaseModel):
    """Payload for creating or updating student profile information."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    avatar_url: Optional[str] = None
    college_id: Optional[str] = Field(None, description="UUID of associated college")
    course: Optional[str] = Field(None, max_length=100, description="e.g. B.Tech, MCA, B.Sc")
    branch: Optional[str] = Field(None, max_length=100, description="e.g. Computer Science, AI/DS")
    year: Optional[int] = Field(None, ge=1, le=6, description="Current academic year (1-6)")
    graduation_year: Optional[int] = Field(None, ge=1990, le=2100, description="Expected or actual graduation year")
    target_role: Optional[str] = Field(None, max_length=100, description="e.g. Full-Stack Developer, ML Engineer")
    bio: Optional[str] = Field(None, max_length=2000, description="Personal bio and career interests")
    github_url: Optional[str] = Field(None, max_length=500)
    linkedin_url: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)


class StudentSkillCreate(BaseModel):
    """Payload to add a skill to a student's profile."""
    skill_id: str = Field(..., description="UUID of canonical skill from skills catalog")
    proficiency_level: int = Field(..., ge=1, le=5, description="Proficiency rating from 1 to 5")
    source: StudentSkillSource = Field(default=StudentSkillSource.self_reported, description="Provenance of skill claim")
    evidence_url: Optional[str] = Field(None, max_length=1000, description="Link to project, repository, or certificate")


class StudentSkillUpdate(BaseModel):
    """Payload to update an existing skill on a student's profile."""
    proficiency_level: Optional[int] = Field(None, ge=1, le=5, description="Proficiency rating from 1 to 5")
    source: Optional[StudentSkillSource] = Field(None, description="Updated provenance")
    evidence_url: Optional[str] = Field(None, max_length=1000, description="Updated evidence link")


class StudentSkillResponse(BaseModel):
    """Student skill record joined with canonical skill metadata."""
    id: str
    student_id: str
    skill_id: str
    skill_name: str
    category: Optional[str] = None
    proficiency_level: Optional[int] = None
    proficiency_label: Optional[str] = None
    source: Optional[str] = None
    evidence_url: Optional[str] = None
    is_verified: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class StudentPassportResponse(BaseModel):
    """Aggregated Skill Passport dataset for verifiable student competencies."""
    student: StudentProfileResponse
    skills_count: int
    verified_skills_count: int
    skills: List[StudentSkillResponse]
    generated_at: str
