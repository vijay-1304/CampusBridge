from typing import List
from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user, require_role
from app.schemas.student import (
    SkillCatalogItem,
    StudentPassportResponse,
    StudentProfileResponse,
    StudentProfileUpdate,
    StudentSkillCreate,
    StudentSkillResponse,
    StudentSkillUpdate,
)
from app.services.student_service import (
    add_student_skill,
    delete_student_skill,
    get_student_passport,
    get_student_profile,
    get_student_skills,
    list_skills_catalog,
    update_student_profile,
    update_student_skill,
)

router = APIRouter()


# ------------------------------------------------------------------------------
# 5A — Student Profile Endpoints
# ------------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=StudentProfileResponse,
    summary="Get authenticated student profile",
)
async def get_my_profile(
    current_user=Depends(require_role("student")),
) -> StudentProfileResponse:
    """
    Retrieve the authenticated student's full profile including core identity,
    academic institution, branch, graduation year, target role, and links.
    """
    student_id = current_user["user"]["id"]
    return get_student_profile(student_id)


@router.put(
    "/me",
    response_model=StudentProfileResponse,
    summary="Update authenticated student profile",
)
@router.patch(
    "/me",
    response_model=StudentProfileResponse,
    summary="Update authenticated student profile",
)
async def update_my_profile(
    payload: StudentProfileUpdate,
    current_user=Depends(require_role("student")),
) -> StudentProfileResponse:
    """
    Update or initialize the authenticated student's academic and profile details.
    Identity is strictly derived from the caller's JWT token.
    """
    student_id = current_user["user"]["id"]
    return update_student_profile(student_id, payload)


# ------------------------------------------------------------------------------
# 5B — Student Skills Endpoints
# ------------------------------------------------------------------------------

@router.get(
    "/skills/catalog",
    response_model=List[SkillCatalogItem],
    summary="List master catalog skills",
)
async def get_skills_catalog(
    _current_user=Depends(get_current_user),
) -> List[SkillCatalogItem]:
    """
    Retrieve canonical skill items from the master catalog for selection in UI dropdowns.
    """
    return list_skills_catalog()


@router.get(
    "/me/skills",
    response_model=List[StudentSkillResponse],
    summary="Get authenticated student's skills",
)
async def get_my_skills(
    current_user=Depends(require_role("student")),
) -> List[StudentSkillResponse]:
    """
    Retrieve all skills associated with the authenticated student profile with
    proficiency levels, provenance, and verification state.
    """
    student_id = current_user["user"]["id"]
    return get_student_skills(student_id)


@router.post(
    "/me/skills",
    response_model=StudentSkillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a skill to authenticated student profile",
)
async def add_my_skill(
    payload: StudentSkillCreate,
    current_user=Depends(require_role("student")),
) -> StudentSkillResponse:
    """
    Add a skill to the student profile.
    Security rule: Claimed skills default to is_verified = false.
    """
    student_id = current_user["user"]["id"]
    return add_student_skill(student_id, payload)


@router.patch(
    "/me/skills/{skill_id}",
    response_model=StudentSkillResponse,
    summary="Update proficiency or evidence for a student skill",
)
async def update_my_skill(
    skill_id: str,
    payload: StudentSkillUpdate,
    current_user=Depends(require_role("student")),
) -> StudentSkillResponse:
    """
    Update proficiency rating, source, or evidence URL for a student's existing skill claim.
    """
    student_id = current_user["user"]["id"]
    return update_student_skill(student_id, skill_id, payload)


@router.delete(
    "/me/skills/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a skill from authenticated student profile",
)
async def delete_my_skill(
    skill_id: str,
    current_user=Depends(require_role("student")),
) -> None:
    """
    Remove a skill claim from the authenticated student's profile.
    """
    student_id = current_user["user"]["id"]
    delete_student_skill(student_id, skill_id)


# ------------------------------------------------------------------------------
# 5C — Student Skill Passport Endpoint
# ------------------------------------------------------------------------------

@router.get(
    "/me/passport",
    response_model=StudentPassportResponse,
    summary="Get authenticated student Skill Passport",
)
async def get_my_passport(
    current_user=Depends(require_role("student")),
) -> StudentPassportResponse:
    """
    Generate the real-data Skill Passport aggregating authenticated profile,
    verified competencies, proficiency distribution, and portfolio evidence.
    """
    student_id = current_user["user"]["id"]
    return get_student_passport(student_id)
