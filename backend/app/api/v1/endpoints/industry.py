from typing import List
from fastapi import APIRouter, Depends, status

from app.dependencies import require_role
from app.schemas.industry import (
    ChallengeAnalysisResult,
    ChallengeCreate,
    ChallengeResponse,
    ChallengeStatusUpdate,
    ChallengeUpdate,
    IndustryProfileResponse,
    IndustryProfileUpdate,
)
from app.services.industry_service import (
    analyze_challenge,
    create_challenge,
    delete_challenge,
    get_challenge_by_id,
    get_industry_challenges,
    get_industry_profile,
    update_challenge,
    update_challenge_status,
    update_industry_profile,
)

router = APIRouter()


# ------------------------------------------------------------------------------
# 6A — Industry Profile Endpoints
# ------------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=IndustryProfileResponse,
    summary="Get authenticated industry profile",
)
async def get_my_industry_profile(
    current_user=Depends(require_role("industry")),
) -> IndustryProfileResponse:
    """
    Retrieve the authenticated industry partner's full profile including
    company metadata, industry domain, website, description, and location.
    """
    industry_id = current_user["user"]["id"]
    return get_industry_profile(industry_id)


@router.put(
    "/me",
    response_model=IndustryProfileResponse,
    summary="Update authenticated industry profile",
)
@router.patch(
    "/me",
    response_model=IndustryProfileResponse,
    summary="Update authenticated industry profile",
)
async def update_my_industry_profile(
    payload: IndustryProfileUpdate,
    current_user=Depends(require_role("industry")),
) -> IndustryProfileResponse:
    """
    Update or initialize the authenticated enterprise partner's organization details.
    Identity is strictly derived from the caller's JWT token.
    """
    industry_id = current_user["user"]["id"]
    return update_industry_profile(industry_id, payload)


# ------------------------------------------------------------------------------
# 6B & 6C — Industry Challenge CRUD Endpoints
# ------------------------------------------------------------------------------

@router.post(
    "/challenges",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new industry challenge",
)
async def create_new_challenge(
    payload: ChallengeCreate,
    current_user=Depends(require_role("industry")),
) -> ChallengeResponse:
    """
    Publish a new problem statement challenge. Ownership is securely attached
    to the authenticated industry user.
    """
    industry_id = current_user["user"]["id"]
    return create_challenge(industry_id, payload)


@router.get(
    "/challenges",
    response_model=List[ChallengeResponse],
    summary="List all challenges owned by authenticated industry",
)
async def list_my_challenges(
    current_user=Depends(require_role("industry")),
) -> List[ChallengeResponse]:
    """
    Retrieve all problem statement challenges owned by the authenticated industry entity.
    """
    industry_id = current_user["user"]["id"]
    return get_industry_challenges(industry_id)


@router.get(
    "/challenges/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Get challenge details by ID",
)
async def get_single_challenge(
    challenge_id: str,
    current_user=Depends(require_role("industry")),
) -> ChallengeResponse:
    """
    Retrieve one challenge by ID. Enforces ownership check against IDOR.
    """
    industry_id = current_user["user"]["id"]
    return get_challenge_by_id(industry_id, challenge_id)


@router.patch(
    "/challenges/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Update challenge details",
)
async def update_single_challenge(
    challenge_id: str,
    payload: ChallengeUpdate,
    current_user=Depends(require_role("industry")),
) -> ChallengeResponse:
    """
    Update title, description, domain, or deadline on an owned challenge.
    """
    industry_id = current_user["user"]["id"]
    return update_challenge(industry_id, challenge_id, payload)


@router.patch(
    "/challenges/{challenge_id}/status",
    response_model=ChallengeResponse,
    summary="Update challenge lifecycle status",
)
async def update_single_challenge_status(
    challenge_id: str,
    payload: ChallengeStatusUpdate,
    current_user=Depends(require_role("industry")),
) -> ChallengeResponse:
    """
    Transition challenge status (e.g. draft -> published -> closed).
    Enforces that requirements exist before publishing.
    """
    industry_id = current_user["user"]["id"]
    return update_challenge_status(industry_id, challenge_id, payload.status.value)


@router.delete(
    "/challenges/{challenge_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete or close a challenge",
)
async def delete_single_challenge(
    challenge_id: str,
    current_user=Depends(require_role("industry")),
) -> None:
    """
    Safely remove or close an industry challenge.
    """
    industry_id = current_user["user"]["id"]
    delete_challenge(industry_id, challenge_id)


# ------------------------------------------------------------------------------
# 6I — Gemini AI Analysis & Requirement Extraction Endpoint
# ------------------------------------------------------------------------------

@router.post(
    "/challenges/{challenge_id}/analyze",
    response_model=ChallengeAnalysisResult,
    summary="Analyze challenge with Gemini AI and map canonical skills",
)
async def analyze_challenge_with_ai(
    challenge_id: str,
    current_user=Depends(require_role("industry")),
) -> ChallengeAnalysisResult:
    """
    Execute Gemini AI analysis on the challenge description, extract structured technical
    skill criteria, map to canonical skills, and persist to challenge_requirements.
    """
    industry_id = current_user["user"]["id"]
    return analyze_challenge(industry_id, challenge_id)
