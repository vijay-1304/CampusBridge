import logging
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

from app.schemas.college import (
    CollegeCapabilityCreate,
    CollegeCapabilityResponse,
    CollegeCapabilityUpdate,
    CollegeMatchesResponse,
    CollegeMatchItem,
    CollegeProfileResponse,
    CollegeProfileUpdate,
    CollegeSkillCatalogItem,
)
from app.services.supabase_service import (
    get_supabase_admin_client,
    get_supabase_client,
    has_supabase_admin_key,
)

logger = logging.getLogger(__name__)


class CollegeService:
    """Service managing College Institution Profiles, Capabilities, and Matches."""

    @staticmethod
    def get_client():
        """Obtain active Supabase client with appropriate credentials."""
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
    def _ensure_college_record(
        cls,
        profile_id: str,
        default_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Ensure an institution row exists in the colleges table for this profile ID.
        colleges.profile_id references profiles.id.
        """
        client = cls.get_client()
        res = client.table("colleges").select("*").eq("profile_id", profile_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]

        # Initialize colleges record
        name = default_name or "Academic Partner"
        try:
            insert_res = client.table("colleges").insert({
                "profile_id": profile_id,
                "college_name": name,
            }).execute()
            if insert_res.data and len(insert_res.data) > 0:
                return insert_res.data[0]
            return {"profile_id": profile_id, "college_name": name}
        except Exception as e:
            logger.warning("Error initializing colleges record for %s: %s", profile_id, type(e).__name__)
            retry = client.table("colleges").select("*").eq("profile_id", profile_id).execute()
            if retry.data and len(retry.data) > 0:
                return retry.data[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize academic institution profile record.",
            )

    @classmethod
    def get_college_profile(cls, profile_id: str) -> CollegeProfileResponse:
        """Retrieve aggregated institution profile for the authenticated college."""
        client = cls.get_client()

        # 1. Fetch base profile
        p_res = client.table("profiles").select("*").eq("id", profile_id).execute()
        if not p_res.data or len(p_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found.",
            )
        profile_data = p_res.data[0]

        # 2. Fetch or ensure college details
        college_data = cls._ensure_college_record(profile_id, profile_data.get("full_name"))

        return CollegeProfileResponse(
            id=str(college_data["id"]),
            profile_id=str(profile_data["id"]),
            college_name=college_data.get("college_name") or profile_data.get("full_name", "Academic Partner"),
            description=college_data.get("description"),
            location=college_data.get("location"),
            website=college_data.get("website"),
            email=profile_data.get("email"),
            full_name=profile_data.get("full_name"),
            phone=profile_data.get("phone"),
            created_at=str(college_data.get("created_at") or profile_data.get("created_at")),
            updated_at=str(college_data.get("updated_at") or profile_data.get("updated_at")),
        )

    @classmethod
    def update_college_profile(
        cls,
        profile_id: str,
        payload: CollegeProfileUpdate,
    ) -> CollegeProfileResponse:
        """Update institution details and base contact information."""
        client = cls.get_client()
        college_record = cls._ensure_college_record(profile_id)
        college_id = str(college_record["id"])

        # 1. Update profiles table if full_name or phone is provided
        profile_updates: Dict[str, Any] = {}
        if payload.full_name is not None:
            profile_updates["full_name"] = payload.full_name.strip()
        if payload.phone is not None:
            profile_updates["phone"] = payload.phone.strip()

        if profile_updates:
            try:
                client.table("profiles").update(profile_updates).eq("id", profile_id).execute()
            except Exception as e:
                logger.error("Failed to update profile for college %s: %s", profile_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update contact identity details.",
                )

        # 2. Update colleges table
        college_updates: Dict[str, Any] = {}
        if payload.college_name is not None:
            college_updates["college_name"] = payload.college_name.strip()
        if payload.description is not None:
            college_updates["description"] = payload.description.strip()
        if payload.location is not None:
            college_updates["location"] = payload.location.strip()
        if payload.website is not None:
            college_updates["website"] = payload.website.strip()

        if college_updates:
            try:
                client.table("colleges").update(college_updates).eq("id", college_id).execute()
            except Exception as e:
                logger.error("Failed to update colleges for %s: %s", college_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update institution profile details.",
                )

        return cls.get_college_profile(profile_id)

    @classmethod
    def get_capabilities(cls, profile_id: str) -> List[CollegeCapabilityResponse]:
        """Retrieve all capability records owned by the authenticated college."""
        client = cls.get_client()
        college = cls._ensure_college_record(profile_id)
        college_id = str(college["id"])

        try:
            res = (
                client.table("college_capabilities")
                .select("*, skills(*)")
                .eq("college_id", college_id)
                .order("created_at", desc=True)
                .execute()
            )
            rows = res.data or []
            capabilities: List[CollegeCapabilityResponse] = []
            for r in rows:
                skill_obj = r.get("skills") or {}
                capabilities.append(
                    CollegeCapabilityResponse(
                        id=str(r["id"]),
                        college_id=str(r["college_id"]),
                        skill_id=str(r["skill_id"]),
                        skill_name=skill_obj.get("name", "Unknown Skill"),
                        category=skill_obj.get("category"),
                        description=skill_obj.get("description"),
                        proficiency_level=int(r["proficiency_level"]),
                        faculty_count=int(r.get("faculty_count", 0)),
                        infrastructure_details=r.get("infrastructure_details"),
                        created_at=str(r.get("created_at")),
                    )
                )
            return capabilities
        except Exception as e:
            logger.error("Error retrieving capabilities for college %s: %s", college_id, type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve institutional capabilities.",
            )

    @classmethod
    def add_capability(
        cls,
        profile_id: str,
        payload: CollegeCapabilityCreate,
    ) -> CollegeCapabilityResponse:
        """
        Add a verifiable institutional capability.
        Enforces canonical skill validation and rejects duplicate capabilities with 409 Conflict.
        """
        client = cls.get_client()
        college = cls._ensure_college_record(profile_id)
        college_id = str(college["id"])

        # 1. Verify skill_id exists in canonical skills catalog
        skill_res = client.table("skills").select("*").eq("id", payload.skill_id.strip()).execute()
        if not skill_res.data or len(skill_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found in canonical skills catalog.",
            )
        skill_row = skill_res.data[0]

        # 2. Check for duplicate capability on (college_id, skill_id)
        dup_res = (
            client.table("college_capabilities")
            .select("id")
            .eq("college_id", college_id)
            .eq("skill_id", payload.skill_id.strip())
            .execute()
        )
        if dup_res.data and len(dup_res.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A capability record for '{skill_row['name']}' already exists. Use PATCH to update proficiency or faculty details.",
            )

        # 3. Insert capability
        insert_payload = {
            "college_id": college_id,
            "skill_id": str(payload.skill_id.strip()),
            "proficiency_level": payload.proficiency_level,
            "faculty_count": payload.faculty_count,
            "infrastructure_details": payload.infrastructure_details.strip() if payload.infrastructure_details else None,
        }

        try:
            ins_res = client.table("college_capabilities").insert(insert_payload).execute()
            if not ins_res.data or len(ins_res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save capability record.",
                )
            created_row = ins_res.data[0]
            return CollegeCapabilityResponse(
                id=str(created_row["id"]),
                college_id=college_id,
                skill_id=str(payload.skill_id.strip()),
                skill_name=skill_row["name"],
                category=skill_row.get("category"),
                description=skill_row.get("description"),
                proficiency_level=int(created_row["proficiency_level"]),
                faculty_count=int(created_row.get("faculty_count", 0)),
                infrastructure_details=created_row.get("infrastructure_details"),
                created_at=str(created_row.get("created_at")),
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Database error adding capability: %s", type(e).__name__)
            err_str = str(e).lower()
            if "unique" in err_str or "duplicate" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A capability record for '{skill_row['name']}' already exists.",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while creating capability record.",
            )

    @classmethod
    def update_capability(
        cls,
        profile_id: str,
        capability_id: str,
        payload: CollegeCapabilityUpdate,
    ) -> CollegeCapabilityResponse:
        """
        Update an existing capability record with strict ownership enforcement.
        Prevents IDOR across academic institutions.
        """
        client = cls.get_client()
        college = cls._ensure_college_record(profile_id)
        college_id = str(college["id"])

        # 1. Fetch capability
        cap_res = (
            client.table("college_capabilities")
            .select("*, skills(*)")
            .eq("id", capability_id.strip())
            .execute()
        )
        if not cap_res.data or len(cap_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capability record not found.",
            )

        row = cap_res.data[0]

        # 2. Ownership verification (Strict IDOR check)
        if str(row["college_id"]) != college_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you do not own this capability record.",
            )

        # 3. Apply updates
        updates: Dict[str, Any] = {}
        if payload.proficiency_level is not None:
            updates["proficiency_level"] = payload.proficiency_level
        if payload.faculty_count is not None:
            updates["faculty_count"] = payload.faculty_count
        if payload.infrastructure_details is not None:
            updates["infrastructure_details"] = payload.infrastructure_details.strip()

        if updates:
            try:
                up_res = client.table("college_capabilities").update(updates).eq("id", capability_id.strip()).execute()
                if up_res.data and len(up_res.data) > 0:
                    row = {**row, **up_res.data[0]}
            except Exception as e:
                logger.error("Database error updating capability %s: %s", capability_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database error while updating capability.",
                )

        skill_obj = row.get("skills") or {}
        return CollegeCapabilityResponse(
            id=str(row["id"]),
            college_id=college_id,
            skill_id=str(row["skill_id"]),
            skill_name=skill_obj.get("name", "Unknown Skill"),
            category=skill_obj.get("category"),
            description=skill_obj.get("description"),
            proficiency_level=int(row["proficiency_level"]),
            faculty_count=int(row.get("faculty_count", 0)),
            infrastructure_details=row.get("infrastructure_details"),
            created_at=str(row.get("created_at")),
        )

    @classmethod
    def delete_capability(
        cls,
        profile_id: str,
        capability_id: str,
    ) -> Dict[str, Any]:
        """
        Delete a capability record with strict ownership enforcement.
        """
        client = cls.get_client()
        college = cls._ensure_college_record(profile_id)
        college_id = str(college["id"])

        # 1. Fetch capability
        cap_res = client.table("college_capabilities").select("id, college_id").eq("id", capability_id.strip()).execute()
        if not cap_res.data or len(cap_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capability record not found.",
            )

        row = cap_res.data[0]

        # 2. Ownership verification (Strict IDOR check)
        if str(row["college_id"]) != college_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you do not own this capability record.",
            )

        # 3. Delete record
        try:
            client.table("college_capabilities").delete().eq("id", capability_id.strip()).execute()
            return {"message": "Capability deleted successfully.", "capability_id": capability_id}
        except Exception as e:
            logger.error("Database error deleting capability %s: %s", capability_id, type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while deleting capability.",
            )

    @classmethod
    def get_skill_catalog(cls) -> List[CollegeSkillCatalogItem]:
        """Retrieve canonical verifiable skill catalog entries."""
        client = cls.get_client()
        try:
            res = client.table("skills").select("id, name, category, description").order("name").execute()
            skills_data = res.data or []
            return [
                CollegeSkillCatalogItem(
                    id=str(s["id"]),
                    name=s["name"],
                    category=s.get("category"),
                    description=s.get("description"),
                )
                for s in skills_data
            ]
        except Exception as e:
            logger.error("Error retrieving skills catalog: %s", type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve skills catalog.",
            )

    @classmethod
    def get_college_matches(cls, profile_id: str) -> CollegeMatchesResponse:
        """
        Retrieve matches associated with the authenticated college.
        Sorted by overall_score DESC.
        """
        client = cls.get_client()
        college = cls._ensure_college_record(profile_id)
        college_id = str(college["id"])

        try:
            res = (
                client.table("matches")
                .select("*, challenges(id, title, domain, collaboration_type, industry_profiles(company_name))")
                .eq("college_id", college_id)
                .order("overall_score", desc=True)
                .execute()
            )
            rows = res.data or []
            matches: List[CollegeMatchItem] = []

            for r in rows:
                c_info = r.get("challenges") or {}
                ind_info = (c_info.get("industry_profiles") or {})

                s_score = float(r.get("skill_score") or 0.0)
                o_score = float(r.get("overall_score") or 0.0)
                if r.get("infrastructure_score") is not None:
                    c_score = float(r["infrastructure_score"])
                else:
                    c_score = round(max(0.0, min(100.0, (o_score - s_score * 0.70) / 0.30)), 2)

                matches.append(
                    CollegeMatchItem(
                        match_id=str(r["id"]),
                        challenge_id=str(r["challenge_id"]),
                        challenge_title=c_info.get("title", "Industry Challenge"),
                        domain=c_info.get("domain"),
                        collaboration_type=c_info.get("collaboration_type"),
                        company_name=ind_info.get("company_name"),
                        overall_score=o_score,
                        skill_score=s_score,
                        capability_score=c_score,
                        reasoning=r.get("reasoning") or "Evaluated collaboration match.",
                        status=r.get("status", "suggested"),
                        created_at=str(r.get("created_at")) if r.get("created_at") else None,
                    )
                )

            # Ensure sorted descending
            matches.sort(key=lambda m: (m.overall_score, m.skill_score), reverse=True)

            return CollegeMatchesResponse(
                college_id=college_id,
                total_matches=len(matches),
                matches=matches,
            )
        except Exception as e:
            logger.error("Error retrieving matches for college %s: %s", college_id, type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve institutional matches.",
            )
