import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

from app.schemas.student import (
    CollegeBasic,
    SkillCatalogItem,
    StudentPassportResponse,
    StudentProfileResponse,
    StudentProfileUpdate,
    StudentSkillCreate,
    StudentSkillResponse,
    StudentSkillUpdate,
)
from app.services.supabase_service import (
    get_supabase_admin_client,
    get_supabase_client,
    has_supabase_admin_key,
)

logger = logging.getLogger(__name__)

PROFICIENCY_LABELS = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Proficient",
    5: "Advanced",
}


class StudentService:
    """Service handling Student Profiles, Skill claims, and Skill Passport aggregations."""

    @staticmethod
    def get_client():
        """Obtain the appropriate database client."""
        if has_supabase_admin_key():
            return get_supabase_admin_client()
        client = get_supabase_client()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service is currently unavailable.",
            )
        return client

    @classmethod
    def _ensure_student_record(cls, student_id: str) -> Dict[str, Any]:
        """Ensure a row exists in the students table for this profile ID."""
        client = cls.get_client()
        res = client.table("students").select("*").eq("id", student_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]

        # Initialize student-specific row if not already present
        try:
            insert_res = client.table("students").insert({"id": student_id}).execute()
            if insert_res.data and len(insert_res.data) > 0:
                return insert_res.data[0]
            return {"id": student_id}
        except Exception as e:
            logger.warning("Error initializing students record for %s: %s", student_id, type(e).__name__)
            # Re-check in case of race condition
            retry = client.table("students").select("*").eq("id", student_id).execute()
            if retry.data and len(retry.data) > 0:
                return retry.data[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize student profile record.",
            )

    @classmethod
    def get_student_profile(cls, student_id: str) -> StudentProfileResponse:
        """Fetch and aggregate the full student profile."""
        client = cls.get_client()

        # 1. Fetch base profile
        p_res = client.table("profiles").select("*").eq("id", student_id).execute()
        if not p_res.data or len(p_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found.",
            )
        profile_data = p_res.data[0]

        # 2. Fetch student-specific details (ensure row exists)
        student_data = cls._ensure_student_record(student_id)

        # 3. Fetch college details if linked
        college_basic: Optional[CollegeBasic] = None
        college_id = student_data.get("college_id")
        if college_id:
            try:
                c_res = client.table("colleges").select("id, college_name, location, website").eq("id", college_id).execute()
                if c_res.data and len(c_res.data) > 0:
                    c_row = c_res.data[0]
                    college_basic = CollegeBasic(
                        id=str(c_row["id"]),
                        college_name=c_row["college_name"],
                        location=c_row.get("location"),
                        website=c_row.get("website"),
                    )
            except Exception as e:
                logger.warning("Failed to fetch college %s: %s", college_id, type(e).__name__)

        return StudentProfileResponse(
            id=str(profile_data["id"]),
            full_name=profile_data["full_name"],
            email=profile_data.get("email"),
            avatar_url=profile_data.get("avatar_url"),
            phone=profile_data.get("phone"),
            role=profile_data.get("role", "student"),
            college_id=str(college_id) if college_id else None,
            college=college_basic,
            course=student_data.get("course"),
            branch=student_data.get("branch"),
            year=student_data.get("year"),
            graduation_year=student_data.get("graduation_year"),
            target_role=student_data.get("target_role"),
            bio=student_data.get("bio"),
            github_url=student_data.get("github_url"),
            linkedin_url=student_data.get("linkedin_url"),
            portfolio_url=student_data.get("portfolio_url"),
            created_at=str(student_data.get("created_at") or profile_data.get("created_at")),
            updated_at=str(student_data.get("updated_at") or profile_data.get("updated_at")),
        )

    @classmethod
    def update_student_profile(
        cls,
        student_id: str,
        payload: StudentProfileUpdate,
    ) -> StudentProfileResponse:
        """Update base profile and student-specific academic information."""
        client = cls.get_client()
        cls._ensure_student_record(student_id)

        # 1. Update profiles table if profile fields provided
        profile_updates: Dict[str, Any] = {}
        if payload.full_name is not None:
            profile_updates["full_name"] = payload.full_name
        if payload.phone is not None:
            profile_updates["phone"] = payload.phone
        if payload.avatar_url is not None:
            profile_updates["avatar_url"] = payload.avatar_url

        if profile_updates:
            try:
                client.table("profiles").update(profile_updates).eq("id", student_id).execute()
            except Exception as e:
                logger.error("Failed to update profile for student %s: %s", student_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update core profile information.",
                )

        # 2. Update students table
        student_updates: Dict[str, Any] = {}
        if payload.college_id is not None:
            # Verify college exists if not empty
            if payload.college_id.strip():
                c_check = client.table("colleges").select("id").eq("id", payload.college_id.strip()).execute()
                if not c_check.data or len(c_check.data) == 0:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Selected college institution was not found.",
                    )
                student_updates["college_id"] = payload.college_id.strip()
            else:
                student_updates["college_id"] = None

        if payload.course is not None:
            student_updates["course"] = payload.course
        if payload.branch is not None:
            student_updates["branch"] = payload.branch
        if payload.year is not None:
            student_updates["year"] = payload.year
        if payload.graduation_year is not None:
            student_updates["graduation_year"] = payload.graduation_year
        if payload.target_role is not None:
            student_updates["target_role"] = payload.target_role
        if payload.bio is not None:
            student_updates["bio"] = payload.bio
        if payload.github_url is not None:
            student_updates["github_url"] = payload.github_url
        if payload.linkedin_url is not None:
            student_updates["linkedin_url"] = payload.linkedin_url
        if payload.portfolio_url is not None:
            student_updates["portfolio_url"] = payload.portfolio_url

        if student_updates:
            try:
                client.table("students").update(student_updates).eq("id", student_id).execute()
            except Exception as e:
                logger.error("Failed to update students table for %s: %s", student_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update student academic details.",
                )

        return cls.get_student_profile(student_id)

    @classmethod
    def list_skills_catalog(cls) -> List[SkillCatalogItem]:
        """Fetch canonical skill items from the master catalog."""
        client = cls.get_client()
        try:
            res = client.table("skills").select("*").order("name").execute()
            return [
                SkillCatalogItem(
                    id=str(row["id"]),
                    name=row["name"],
                    category=row.get("category"),
                    description=row.get("description"),
                )
                for row in (res.data or [])
            ]
        except Exception as e:
            logger.error("Error fetching skills catalog: %s", type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve skills catalog.",
            )

    @classmethod
    def get_student_skills(cls, student_id: str) -> List[StudentSkillResponse]:
        """Fetch all skills associated with the authenticated student."""
        client = cls.get_client()
        cls._ensure_student_record(student_id)

        try:
            res = client.table("student_skills").select("*, skills(*)").eq("student_id", student_id).order("created_at").execute()
            skill_list: List[StudentSkillResponse] = []
            for row in (res.data or []):
                skill_obj = row.get("skills") or {}
                level = row.get("proficiency_level")
                skill_list.append(
                    StudentSkillResponse(
                        id=str(row["id"]),
                        student_id=str(row["student_id"]),
                        skill_id=str(row["skill_id"]),
                        skill_name=skill_obj.get("name", "Unknown Skill"),
                        category=skill_obj.get("category"),
                        proficiency_level=level,
                        proficiency_label=PROFICIENCY_LABELS.get(level) if level else None,
                        source=row.get("source"),
                        evidence_url=row.get("evidence_url"),
                        is_verified=bool(row.get("is_verified", False)),
                        created_at=str(row.get("created_at")) if row.get("created_at") else None,
                        updated_at=str(row.get("updated_at")) if row.get("updated_at") else None,
                    )
                )
            return skill_list
        except Exception as e:
            logger.error("Error fetching student skills for %s: %s", student_id, type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve student skills.",
            )

    @classmethod
    def add_student_skill(
        cls,
        student_id: str,
        payload: StudentSkillCreate,
    ) -> StudentSkillResponse:
        """
        Add a skill to the student's profile.
        Security Rule: is_verified is strictly false by default and cannot be self-asserted.
        """
        client = cls.get_client()
        cls._ensure_student_record(student_id)

        # 1. Verify skill exists in catalog
        s_res = client.table("skills").select("*").eq("id", payload.skill_id.strip()).execute()
        if not s_res.data or len(s_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected skill does not exist in the master catalog.",
            )
        skill_catalog = s_res.data[0]

        # 2. Check for duplicate skill association
        dup_res = client.table("student_skills").select("id").eq("student_id", student_id).eq("skill_id", payload.skill_id.strip()).execute()
        if dup_res.data and len(dup_res.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"The skill '{skill_catalog['name']}' is already in your profile.",
            )

        # 3. Insert student skill claim
        insert_payload = {
            "student_id": student_id,
            "skill_id": payload.skill_id.strip(),
            "proficiency_level": payload.proficiency_level,
            "source": payload.source.value,
            "evidence_url": payload.evidence_url,
            "is_verified": False,  # Security rule: Never auto-verify student claims
        }

        try:
            ins_res = client.table("student_skills").insert(insert_payload).execute()
            if not ins_res.data or len(ins_res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to insert student skill.",
                )
            created_row = ins_res.data[0]
            level = created_row.get("proficiency_level")
            return StudentSkillResponse(
                id=str(created_row["id"]),
                student_id=str(created_row["student_id"]),
                skill_id=str(created_row["skill_id"]),
                skill_name=skill_catalog["name"],
                category=skill_catalog.get("category"),
                proficiency_level=level,
                proficiency_label=PROFICIENCY_LABELS.get(level) if level else None,
                source=created_row.get("source"),
                evidence_url=created_row.get("evidence_url"),
                is_verified=False,
                created_at=str(created_row.get("created_at")) if created_row.get("created_at") else None,
                updated_at=str(created_row.get("updated_at")) if created_row.get("updated_at") else None,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to add student skill: %s", type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record student skill.",
            )

    @classmethod
    def update_student_skill(
        cls,
        student_id: str,
        skill_identifier: str,
        payload: StudentSkillUpdate,
    ) -> StudentSkillResponse:
        """
        Update proficiency level, source, or evidence for an existing student skill.
        Can match by skill_id (canonical UUID) or student_skills.id.
        """
        client = cls.get_client()

        # Find existing record (match either by skill_id or student_skills id)
        res = client.table("student_skills").select("*, skills(*)").eq("student_id", student_id).eq("skill_id", skill_identifier.strip()).execute()
        if not res.data or len(res.data) == 0:
            res = client.table("student_skills").select("*, skills(*)").eq("student_id", student_id).eq("id", skill_identifier.strip()).execute()

        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill claim not found on student profile.",
            )

        existing_row = res.data[0]
        record_id = existing_row["id"]
        skill_obj = existing_row.get("skills") or {}

        # Prepare update dict
        update_fields: Dict[str, Any] = {}
        if payload.proficiency_level is not None:
            update_fields["proficiency_level"] = payload.proficiency_level
        if payload.source is not None:
            update_fields["source"] = payload.source.value
        if payload.evidence_url is not None:
            update_fields["evidence_url"] = payload.evidence_url

        if not update_fields:
            level = existing_row.get("proficiency_level")
            return StudentSkillResponse(
                id=str(existing_row["id"]),
                student_id=str(existing_row["student_id"]),
                skill_id=str(existing_row["skill_id"]),
                skill_name=skill_obj.get("name", "Unknown Skill"),
                category=skill_obj.get("category"),
                proficiency_level=level,
                proficiency_label=PROFICIENCY_LABELS.get(level) if level else None,
                source=existing_row.get("source"),
                evidence_url=existing_row.get("evidence_url"),
                is_verified=bool(existing_row.get("is_verified", False)),
                created_at=str(existing_row.get("created_at")),
                updated_at=str(existing_row.get("updated_at")),
            )

        try:
            upd_res = client.table("student_skills").update(update_fields).eq("id", record_id).execute()
            if not upd_res.data or len(upd_res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update student skill record.",
                )
            updated_row = upd_res.data[0]
            level = updated_row.get("proficiency_level")
            return StudentSkillResponse(
                id=str(updated_row["id"]),
                student_id=str(updated_row["student_id"]),
                skill_id=str(updated_row["skill_id"]),
                skill_name=skill_obj.get("name", "Unknown Skill"),
                category=skill_obj.get("category"),
                proficiency_level=level,
                proficiency_label=PROFICIENCY_LABELS.get(level) if level else None,
                source=updated_row.get("source"),
                evidence_url=updated_row.get("evidence_url"),
                is_verified=bool(updated_row.get("is_verified", False)),
                created_at=str(updated_row.get("created_at")),
                updated_at=str(updated_row.get("updated_at")),
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to update student skill: %s", type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update student skill.",
            )

    @classmethod
    def delete_student_skill(cls, student_id: str, skill_identifier: str) -> None:
        """Remove a skill claim from the student's profile."""
        client = cls.get_client()

        # Find existing record
        res = client.table("student_skills").select("id").eq("student_id", student_id).eq("skill_id", skill_identifier.strip()).execute()
        if not res.data or len(res.data) == 0:
            res = client.table("student_skills").select("id").eq("student_id", student_id).eq("id", skill_identifier.strip()).execute()

        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill claim not found on student profile.",
            )

        record_id = res.data[0]["id"]
        try:
            client.table("student_skills").delete().eq("id", record_id).execute()
        except Exception as e:
            logger.error("Failed to delete student skill %s: %s", record_id, type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove student skill.",
            )

    @classmethod
    def get_student_passport(cls, student_id: str) -> StudentPassportResponse:
        """
        Aggregate authentic, verifiable student competencies for the Skill Passport.
        Does not invent metrics, badges, or verification without database evidence.
        """
        student_profile = cls.get_student_profile(student_id)
        skills = cls.get_student_skills(student_id)
        verified_count = sum(1 for s in skills if s.is_verified)

        return StudentPassportResponse(
            student=student_profile,
            skills_count=len(skills),
            verified_skills_count=verified_count,
            skills=skills,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )


# Convenience module-level accessors
get_student_profile = StudentService.get_student_profile
update_student_profile = StudentService.update_student_profile
list_skills_catalog = StudentService.list_skills_catalog
get_student_skills = StudentService.get_student_skills
add_student_skill = StudentService.add_student_skill
update_student_skill = StudentService.update_student_skill
delete_student_skill = StudentService.delete_student_skill
get_student_passport = StudentService.get_student_passport
