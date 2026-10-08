from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ------------------------------------------------------------------------------
# Enums
# ------------------------------------------------------------------------------

class CollaborationRequestStatus(str, Enum):
    """Lifecycle status of a collaboration request."""
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"


class CollaborationStatus(str, Enum):
    """Lifecycle status of an active or historical collaboration project."""
    active = "active"
    paused = "paused"
    completed = "completed"
    cancelled = "cancelled"


class MilestoneStatus(str, Enum):
    """Execution status of a project milestone."""
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"


class OutcomeStatus(str, Enum):
    """Lifecycle status of a collaboration outcome deliverable."""
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    completed = "completed"


# ------------------------------------------------------------------------------
# Collaboration Request Schemas
# ------------------------------------------------------------------------------

class CollaborationRequestCreate(BaseModel):
    """Payload sent by Industry partner to request collaboration with a matched college."""
    challenge_id: str = Field(..., description="UUID of the published industry challenge")
    college_id: str = Field(..., description="UUID of the matched academic institution")
    message: Optional[str] = Field(None, max_length=2000, description="Proposal / introductory message to the college")


class CollaborationRequestResponse(BaseModel):
    """Formal collaboration outreach proposal between industry and academia."""
    id: str = Field(..., description="UUID of the collaboration request")
    challenge_id: str = Field(..., description="UUID of the challenge")
    industry_id: str = Field(..., description="UUID of the industry profile who created the request")
    college_id: str = Field(..., description="UUID of the target academic institution")
    match_id: Optional[str] = Field(None, description="UUID of the deterministic match record")
    message: Optional[str] = None
    status: str = Field(default=CollaborationRequestStatus.pending.value)
    created_at: Optional[str] = None
    responded_at: Optional[str] = None

    # Enriched context fields for display
    challenge_title: Optional[str] = None
    company_name: Optional[str] = None
    college_name: Optional[str] = None
    match_score: Optional[float] = None


class CollaborationRequestListResponse(BaseModel):
    """List of collaboration requests relevant to the authenticated user."""
    total: int
    requests: List[CollaborationRequestResponse] = []


# ------------------------------------------------------------------------------
# Milestone Schemas
# ------------------------------------------------------------------------------

class MilestoneCreate(BaseModel):
    """Payload to add a deliverable milestone to an active collaboration."""
    title: str = Field(..., min_length=2, max_length=255, description="Title of the milestone")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed deliverables and acceptance criteria")
    assigned_to: Optional[str] = Field(None, description="UUID of profile assigned to lead this milestone")
    due_date: Optional[date] = Field(None, description="Target completion date (YYYY-MM-DD)")
    status: MilestoneStatus = Field(default=MilestoneStatus.pending, description="Initial milestone status")
    progress: int = Field(default=0, ge=0, le=100, description="Completion percentage (0-100)")


class MilestoneUpdate(BaseModel):
    """Payload to update an existing milestone."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[MilestoneStatus] = None
    progress: Optional[int] = Field(None, ge=0, le=100)


class MilestoneResponse(BaseModel):
    """Discrete deliverable and stage gate within an active collaboration."""
    id: str
    collaboration_id: str
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_to_name: Optional[str] = None
    due_date: Optional[str] = None
    status: str
    progress: int = 0
    created_at: Optional[str] = None
    completed_at: Optional[str] = None


# ------------------------------------------------------------------------------
# Project Update Schemas
# ------------------------------------------------------------------------------

class ProjectUpdateCreate(BaseModel):
    """Payload to log a chronological progress update in a collaboration workspace."""
    content: str = Field(..., min_length=3, description="Narrative progress update or milestone log")
    milestone_id: Optional[str] = Field(None, description="Optional UUID of the related milestone")
    progress: Optional[int] = Field(None, ge=0, le=100, description="Optional milestone progress update (0-100)")


class ProjectUpdateResponse(BaseModel):
    """Chronological progress report / check-in item in a collaboration."""
    id: str
    collaboration_id: str
    milestone_id: Optional[str] = None
    author_id: str
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    content: str
    progress: Optional[int] = None
    created_at: Optional[str] = None


# ------------------------------------------------------------------------------
# Project Outcome Schemas
# ------------------------------------------------------------------------------

class ProjectOutcomeCreate(BaseModel):
    """Payload to record verifiable outcomes and demonstrator artifacts."""
    title: str = Field(..., min_length=2, max_length=255, description="Outcome title / project name")
    summary: Optional[str] = Field(None, max_length=3000, description="Comprehensive executive summary of deliverables")
    repository_url: Optional[str] = Field(None, max_length=500, description="Git code repository link")
    demo_url: Optional[str] = Field(None, max_length=500, description="Live deployment / demo URL")
    documentation_url: Optional[str] = Field(None, max_length=500, description="Technical report / documentation URL")
    technologies: Optional[Any] = Field(None, description="List of technologies / frameworks utilized")
    outcome_status: OutcomeStatus = Field(default=OutcomeStatus.draft, description="Outcome review status")


class ProjectOutcomeUpdate(BaseModel):
    """Payload to update an outcome record."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    summary: Optional[str] = Field(None, max_length=3000)
    repository_url: Optional[str] = Field(None, max_length=500)
    demo_url: Optional[str] = Field(None, max_length=500)
    documentation_url: Optional[str] = Field(None, max_length=500)
    technologies: Optional[Any] = None
    outcome_status: Optional[OutcomeStatus] = None


class ProjectOutcomeResponse(BaseModel):
    """Final verified outcome record for an executed collaboration."""
    id: str
    collaboration_id: str
    title: str
    summary: Optional[str] = None
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    technologies: Optional[Any] = None
    outcome_status: str
    completed_at: Optional[str] = None


# ------------------------------------------------------------------------------
# Collaboration Workspace Schemas
# ------------------------------------------------------------------------------

class CollaborationResponse(BaseModel):
    """Active or historical academic-industry collaboration project."""
    id: str
    challenge_id: str
    industry_id: str
    college_id: str
    request_id: str
    title: str
    description: Optional[str] = None
    status: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    # Enriched context fields
    challenge_title: Optional[str] = None
    company_name: Optional[str] = None
    college_name: Optional[str] = None


class CollaborationDetailResponse(CollaborationResponse):
    """Full collaboration workspace payload with milestones, activity logs, and outcomes."""
    milestones: List[MilestoneResponse] = []
    updates: List[ProjectUpdateResponse] = []
    outcome: Optional[ProjectOutcomeResponse] = None


class CollaborationListResponse(BaseModel):
    """List of collaborations for an authenticated institution or enterprise."""
    total: int
    collaborations: List[CollaborationResponse] = []


class CollaborationUpdate(BaseModel):
    """Payload to update collaboration details or lifecycle status."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    status: Optional[CollaborationStatus] = None
    end_date: Optional[date] = None
