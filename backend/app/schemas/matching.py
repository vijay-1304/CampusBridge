from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class MatchStatus(str, Enum):
    """Lifecycle status of a challenge-to-college match record."""
    suggested = "suggested"
    shortlisted = "shortlisted"
    accepted = "accepted"
    rejected = "rejected"


class MatchItem(BaseModel):
    """
    Representation of an evaluated match between an industry challenge and a college.
    Includes deterministic component scores and explainable reasoning.
    """
    match_id: str = Field(..., description="Unique UUID identifier of the match record")
    id: Optional[str] = Field(None, description="Alias matching database primary key")
    challenge_id: str = Field(..., description="UUID of the matched industry challenge")
    college_id: str = Field(..., description="UUID of the matched academic institution")
    college_name: str = Field(..., description="Official name of the academic institution")
    college_location: Optional[str] = Field(None, description="Physical location or campus of the college")
    skill_score: float = Field(..., ge=0.0, le=100.0, description="Weighted skill proficiency fit score (0-100)")
    capability_score: float = Field(..., ge=0.0, le=100.0, description="Weighted skill coverage score (0-100)")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Aggregated affinity score: 70% Skill + 30% Capability (0-100)")
    reasoning: str = Field(..., description="Deterministic explainable justification derived from real capability data")
    status: str = Field(default=MatchStatus.suggested.value, description="Current match lifecycle status")
    created_at: Optional[str] = Field(None, description="Timestamp when match was computed")

    def model_post_init(self, __context: object) -> None:
        if self.id is None:
            self.id = self.match_id


class MatchingRunResponse(BaseModel):
    """Result returned when executing the matching engine for a challenge."""
    challenge_id: str
    total_colleges_evaluated: int
    matches: List[MatchItem] = []
    message: Optional[str] = None


class ChallengeMatchesResponse(BaseModel):
    """List of persisted matches for an industry challenge."""
    challenge_id: str
    total_matches: int
    matches: List[MatchItem] = []
