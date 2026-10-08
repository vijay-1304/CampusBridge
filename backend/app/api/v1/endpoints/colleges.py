import logging
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, status

from app.dependencies import require_role
from app.schemas.college import (
    CollegeCapabilityCreate,
    CollegeCapabilityResponse,
    CollegeCapabilityUpdate,
    CollegeProfileResponse,
    CollegeProfileUpdate,
    CollegeSkillCatalogItem,
)
from app.services.college_service import CollegeService

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------------------
# 1. College Institution Profile Endpoints
# ------------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=CollegeProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve authenticated college institution profile",
    description="Returns the aggregated academic institution profile for the calling authenticated college.",
)
async def get_my_college_profile(
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> CollegeProfileResponse:
    """Derives college profile strictly from authenticated identity token."""
    profile_id = current_user["user"]["id"]
    return CollegeService.get_college_profile(profile_id)


@router.put(
    "/me",
    response_model=CollegeProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update authenticated college institution profile",
    description="Updates institution details, research summary, location, and representative contact information.",
)
async def update_my_college_profile_put(
    payload: CollegeProfileUpdate,
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> CollegeProfileResponse:
    """Updates college profile strictly from authenticated identity token."""
    profile_id = current_user["user"]["id"]
    return CollegeService.update_college_profile(profile_id, payload)


@router.patch(
    "/me",
    response_model=CollegeProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially update authenticated college institution profile",
    description="Partially updates institution details, research summary, location, and representative contact information.",
)
async def update_my_college_profile_patch(
    payload: CollegeProfileUpdate,
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> CollegeProfileResponse:
    """Partially updates college profile strictly from authenticated identity token."""
    profile_id = current_user["user"]["id"]
    return CollegeService.update_college_profile(profile_id, payload)


# ------------------------------------------------------------------------------
# 2. Canonical Skill Catalog Endpoint
# ------------------------------------------------------------------------------

@router.get(
    "/skills/catalog",
    response_model=List[CollegeSkillCatalogItem],
    status_code=status.HTTP_200_OK,
    summary="Retrieve canonical skills catalog for capabilities",
    description="Returns distinct canonical skills available for institutional capability registration.",
)
async def get_college_skills_catalog(
    _: Dict[str, Any] = Depends(require_role("college")),
) -> List[CollegeSkillCatalogItem]:
    """Exposes master skills catalog for capability referencing."""
    return CollegeService.get_skill_catalog()


# ------------------------------------------------------------------------------
# 3. College Capabilities Endpoints
# ------------------------------------------------------------------------------

@router.get(
    "/me/capabilities",
    response_model=List[CollegeCapabilityResponse],
    status_code=status.HTTP_200_OK,
    summary="List authenticated college capabilities",
    description="Returns all faculty and infrastructure capabilities registered for the calling college.",
)
async def get_my_capabilities(
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> List[CollegeCapabilityResponse]:
    """Retrieves all capability records owned by the calling college."""
    profile_id = current_user["user"]["id"]
    return CollegeService.get_capabilities(profile_id)


@router.post(
    "/me/capabilities",
    response_model=CollegeCapabilityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add an institutional capability",
    description=(
        "Registers a verified academic faculty and lab capability. "
        "Validates skill against canonical catalog and prevents duplicates with 409 Conflict."
    ),
)
async def add_my_capability(
    payload: CollegeCapabilityCreate,
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> CollegeCapabilityResponse:
    """Adds a new institutional capability record owned by the authenticated college."""
    profile_id = current_user["user"]["id"]
    return CollegeService.add_capability(profile_id, payload)


@router.patch(
    "/me/capabilities/{capability_id}",
    response_model=CollegeCapabilityResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing capability record",
    description="Updates proficiency, faculty count, or infrastructure details with strict institutional ownership check.",
)
async def update_my_capability(
    capability_id: str,
    payload: CollegeCapabilityUpdate,
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> CollegeCapabilityResponse:
    """Updates capability record with strict IDOR ownership enforcement."""
    profile_id = current_user["user"]["id"]
    return CollegeService.update_capability(profile_id, capability_id, payload)


@router.delete(
    "/me/capabilities/{capability_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a capability record",
    description="Removes an institutional capability with strict ownership validation.",
)
async def delete_my_capability(
    capability_id: str,
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> Dict[str, Any]:
    """Deletes capability record with strict IDOR ownership enforcement."""
    profile_id = current_user["user"]["id"]
    return CollegeService.delete_capability(profile_id, capability_id)
