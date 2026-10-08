from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user, require_role
from app.schemas.collaboration import (
    CollaborationDetailResponse,
    CollaborationListResponse,
    CollaborationRequestCreate,
    CollaborationRequestListResponse,
    CollaborationRequestResponse,
    CollaborationResponse,
    CollaborationUpdate,
    MilestoneCreate,
    MilestoneResponse,
    MilestoneUpdate,
    ProjectOutcomeCreate,
    ProjectOutcomeResponse,
    ProjectUpdateCreate,
    ProjectUpdateResponse,
)
from app.services.collaboration_service import CollaborationService

router = APIRouter()


# ==============================================================================
# 1. COLLABORATION REQUESTS ENDPOINTS
# ==============================================================================

@router.post(
    "/requests",
    response_model=CollaborationRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send collaboration request to a matched college (Industry)",
)
async def create_collaboration_request(
    payload: CollaborationRequestCreate,
    current_user: Dict[str, Any] = Depends(require_role("industry")),
) -> CollaborationRequestResponse:
    """
    Industry partner initiates a formal collaboration request to a college.
    Enforces that:
    - Caller owns the published challenge.
    - Deterministic match exists for this challenge + college.
    - Duplicate active/pending requests are blocked.
    """
    user_id = current_user["profile"]["id"]
    return CollaborationService.create_collaboration_request(user_id=user_id, payload=payload)


@router.get(
    "/requests",
    response_model=CollaborationRequestListResponse,
    summary="List incoming or outgoing collaboration requests",
)
async def list_collaboration_requests(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by request status (pending, accepted, rejected)"),
    challenge_id: Optional[str] = Query(None, description="Filter by challenge UUID"),
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> CollaborationRequestListResponse:
    """
    Retrieve collaboration requests relevant to the authenticated participant:
    - Industry: sees requests sent from their enterprise.
    - College: sees requests received by their institution.
    """
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.list_collaboration_requests(
        user_id=user_id,
        user_role=user_role,
        status_filter=status_filter,
        challenge_id=challenge_id,
    )


@router.get(
    "/requests/{request_id}",
    response_model=CollaborationRequestResponse,
    summary="Get single collaboration request by ID",
)
async def get_collaboration_request(
    request_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> CollaborationRequestResponse:
    """Retrieve details of a single collaboration request with strict authorization."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.get_collaboration_request(
        request_id=request_id,
        user_id=user_id,
        user_role=user_role,
    )


@router.patch(
    "/requests/{request_id}/accept",
    response_model=CollaborationResponse,
    summary="Accept collaboration request & initialize workspace (College)",
)
async def accept_collaboration_request(
    request_id: str,
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> CollaborationResponse:
    """
    Academic partner accepts an incoming pending collaboration request.
    Creates a new Collaboration Workspace record and updates challenge & match statuses.
    """
    user_id = current_user["profile"]["id"]
    return CollaborationService.accept_collaboration_request(request_id=request_id, user_id=user_id)


@router.patch(
    "/requests/{request_id}/reject",
    response_model=CollaborationRequestResponse,
    summary="Reject collaboration request (College)",
)
async def reject_collaboration_request(
    request_id: str,
    current_user: Dict[str, Any] = Depends(require_role("college")),
) -> CollaborationRequestResponse:
    """Academic partner rejects an incoming pending collaboration request."""
    user_id = current_user["profile"]["id"]
    return CollaborationService.reject_collaboration_request(request_id=request_id, user_id=user_id)


# ==============================================================================
# 2. COLLABORATIONS WORKSPACE ENDPOINTS
# ==============================================================================

@router.get(
    "",
    response_model=CollaborationListResponse,
    summary="List active/completed collaborations for authenticated user",
)
async def list_collaborations(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (active, completed, paused)"),
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> CollaborationListResponse:
    """List collaborations where the authenticated user is an active participant."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.list_collaborations(
        user_id=user_id,
        user_role=user_role,
        status_filter=status_filter,
    )


@router.get(
    "/{collaboration_id}",
    response_model=CollaborationDetailResponse,
    summary="Get full collaboration workspace details",
)
async def get_collaboration_workspace(
    collaboration_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> CollaborationDetailResponse:
    """
    Access the collaboration workspace including milestones, updates feed, and outcomes.
    Enforces that the caller is a verified participant.
    """
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.get_collaboration_workspace(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
    )


@router.patch(
    "/{collaboration_id}",
    response_model=CollaborationResponse,
    summary="Update collaboration status or metadata",
)
async def update_collaboration(
    collaboration_id: str,
    payload: CollaborationUpdate,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> CollaborationResponse:
    """Update collaboration project details or lifecycle state."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.update_collaboration(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
        payload=payload,
    )


# ==============================================================================
# 3. MILESTONES ENDPOINTS
# ==============================================================================

@router.get(
    "/{collaboration_id}/milestones",
    response_model=List[MilestoneResponse],
    summary="List all milestones for a collaboration",
)
async def get_milestones(
    collaboration_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> List[MilestoneResponse]:
    """Retrieve all deliverables and stage gates in a collaboration workspace."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.get_milestones(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
    )


@router.post(
    "/{collaboration_id}/milestones",
    response_model=MilestoneResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new milestone to collaboration",
)
async def create_milestone(
    collaboration_id: str,
    payload: MilestoneCreate,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> MilestoneResponse:
    """Create a new project milestone in the collaboration workspace."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.create_milestone(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
        payload=payload,
    )


@router.patch(
    "/{collaboration_id}/milestones/{milestone_id}",
    response_model=MilestoneResponse,
    summary="Update a milestone in collaboration",
)
async def update_milestone(
    collaboration_id: str,
    milestone_id: str,
    payload: MilestoneUpdate,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> MilestoneResponse:
    """Update milestone progress, status, or details."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.update_milestone(
        collaboration_id=collaboration_id,
        milestone_id=milestone_id,
        user_id=user_id,
        user_role=user_role,
        payload=payload,
    )


@router.delete(
    "/{collaboration_id}/milestones/{milestone_id}",
    summary="Delete a milestone from collaboration",
)
async def delete_milestone(
    collaboration_id: str,
    milestone_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> Dict[str, Any]:
    """Delete a milestone deliverable."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.delete_milestone(
        collaboration_id=collaboration_id,
        milestone_id=milestone_id,
        user_id=user_id,
        user_role=user_role,
    )


# ==============================================================================
# 4. PROJECT UPDATES ENDPOINTS
# ==============================================================================

@router.get(
    "/{collaboration_id}/updates",
    response_model=List[ProjectUpdateResponse],
    summary="List chronological progress updates for a collaboration",
)
async def get_project_updates(
    collaboration_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> List[ProjectUpdateResponse]:
    """Retrieve chronological activity log and progress check-ins."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.get_project_updates(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
    )


@router.post(
    "/{collaboration_id}/updates",
    response_model=ProjectUpdateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post a progress update to collaboration",
)
async def create_project_update(
    collaboration_id: str,
    payload: ProjectUpdateCreate,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> ProjectUpdateResponse:
    """Log a narrative progress update or milestone check-in."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.create_project_update(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
        payload=payload,
    )


# ==============================================================================
# 5. PROJECT OUTCOMES ENDPOINTS
# ==============================================================================

@router.get(
    "/{collaboration_id}/outcome",
    response_model=Optional[ProjectOutcomeResponse],
    summary="Get verified project outcome for collaboration",
)
async def get_project_outcome(
    collaboration_id: str,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> Optional[ProjectOutcomeResponse]:
    """Retrieve final verified deliverable artifacts & repository links."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.get_project_outcome(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
    )


@router.post(
    "/{collaboration_id}/outcome",
    response_model=ProjectOutcomeResponse,
    summary="Submit or update verified project outcome",
)
async def save_project_outcome(
    collaboration_id: str,
    payload: ProjectOutcomeCreate,
    current_user: Dict[str, Any] = Depends(require_role("industry", "college", "admin")),
) -> ProjectOutcomeResponse:
    """Submit final verified deliverables and demonstrator outcomes."""
    user_id = current_user["profile"]["id"]
    user_role = current_user.get("role")
    return CollaborationService.save_project_outcome(
        collaboration_id=collaboration_id,
        user_id=user_id,
        user_role=user_role,
        payload=payload,
    )
