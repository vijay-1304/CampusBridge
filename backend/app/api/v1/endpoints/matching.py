import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, status

from app.dependencies import require_role
from app.schemas.matching import ChallengeMatchesResponse, MatchingRunResponse
from app.services.matching_service import MatchingService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/challenges/{challenge_id}/run",
    response_model=MatchingRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute deterministic matching for an industry challenge",
    description=(
        "Calculates deterministic, explainable affinity scores between an industry challenge "
        "and eligible colleges based strictly on real database capability records. "
        "Requires authenticated industry user who owns the challenge."
    ),
)
async def run_challenge_matching(
    challenge_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry")),
) -> MatchingRunResponse:
    """
    Run the matching engine for a specific challenge.
    Ownership is strictly derived from the caller's authenticated token.
    """
    industry_id = current_user["user"]["id"]
    return MatchingService.run_matching_for_challenge(
        challenge_id=challenge_id,
        industry_id=industry_id,
    )


@router.get(
    "/challenges/{challenge_id}",
    response_model=ChallengeMatchesResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve ranked matches for an industry challenge",
    description=(
        "Retrieves previously evaluated matches for an industry challenge. "
        "Results are ordered by overall_score DESC. "
        "Requires authenticated industry user who owns the challenge."
    ),
)
async def get_challenge_matches(
    challenge_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry")),
) -> ChallengeMatchesResponse:
    """
    Get ranked matches for an industry challenge.
    Ownership is strictly validated against the caller's authenticated token.
    """
    industry_id = current_user["user"]["id"]
    return MatchingService.get_matches_for_challenge(
        challenge_id=challenge_id,
        industry_id=industry_id,
    )
