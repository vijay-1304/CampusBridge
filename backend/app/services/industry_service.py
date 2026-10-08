import logging
import re
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

from app.schemas.industry import (
    ChallengeAnalysisResult,
    ChallengeCreate,
    ChallengeRequirementResponse,
    ChallengeResponse,
    ChallengeUpdate,
    IndustryProfileResponse,
    IndustryProfileUpdate,
)
from app.services.gemini_service import GeminiService
from app.services.supabase_service import (
    get_supabase_admin_client,
    get_supabase_client,
    has_supabase_admin_key,
)

logger = logging.getLogger(__name__)


def _normalize_string(text: str) -> str:
    """Normalize skill strings for robust catalog matching."""
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", "", text.lower())
    return " ".join(cleaned.split())


class IndustryService:
    """Service managing Industry Profiles, Challenge lifecycle, and AI requirements extraction."""

    @staticmethod
    def get_client():
        """Obtain active Supabase client."""
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
    def _ensure_industry_record(
        cls,
        industry_id: str,
        default_company_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Ensure an enterprise row exists in industry_profiles for this profile ID."""
        client = cls.get_client()
        res = client.table("industry_profiles").select("*").eq("id", industry_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]

        # Initialize industry profile row
        name = default_company_name or "Enterprise Partner"
        try:
            insert_res = client.table("industry_profiles").insert({
                "id": industry_id,
                "company_name": name,
            }).execute()
            if insert_res.data and len(insert_res.data) > 0:
                return insert_res.data[0]
            return {"id": industry_id, "company_name": name}
        except Exception as e:
            logger.warning("Error initializing industry_profiles record for %s: %s", industry_id, type(e).__name__)
            retry = client.table("industry_profiles").select("*").eq("id", industry_id).execute()
            if retry.data and len(retry.data) > 0:
                return retry.data[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize enterprise profile record.",
            )

    @classmethod
    def get_industry_profile(cls, industry_id: str) -> IndustryProfileResponse:
        """Retrieve full aggregated profile for authenticated industry organization."""
        client = cls.get_client()

        # 1. Fetch base profile
        p_res = client.table("profiles").select("*").eq("id", industry_id).execute()
        if not p_res.data or len(p_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found.",
            )
        profile_data = p_res.data[0]

        # 2. Fetch industry details
        industry_data = cls._ensure_industry_record(industry_id, profile_data.get("full_name"))

        return IndustryProfileResponse(
            id=str(profile_data["id"]),
            full_name=profile_data["full_name"],
            email=profile_data.get("email"),
            avatar_url=profile_data.get("avatar_url"),
            phone=profile_data.get("phone"),
            role=profile_data.get("role", "industry"),
            company_name=industry_data.get("company_name") or profile_data["full_name"],
            industry_domain=industry_data.get("industry_domain"),
            website=industry_data.get("website"),
            description=industry_data.get("description"),
            location=industry_data.get("location"),
            company_size=industry_data.get("company_size"),
            created_at=str(industry_data.get("created_at") or profile_data.get("created_at")),
            updated_at=str(industry_data.get("updated_at") or profile_data.get("updated_at")),
        )

    @classmethod
    def update_industry_profile(
        cls,
        industry_id: str,
        payload: IndustryProfileUpdate,
    ) -> IndustryProfileResponse:
        """Update enterprise details and base profile information."""
        client = cls.get_client()
        cls._ensure_industry_record(industry_id)

        # 1. Update profiles table
        profile_updates: Dict[str, Any] = {}
        if payload.full_name is not None:
            profile_updates["full_name"] = payload.full_name
        if payload.phone is not None:
            profile_updates["phone"] = payload.phone
        if payload.avatar_url is not None:
            profile_updates["avatar_url"] = payload.avatar_url

        if profile_updates:
            try:
                client.table("profiles").update(profile_updates).eq("id", industry_id).execute()
            except Exception as e:
                logger.error("Failed to update profile for industry %s: %s", industry_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update core identity details.",
                )

        # 2. Update industry_profiles table
        industry_updates: Dict[str, Any] = {}
        if payload.company_name is not None:
            industry_updates["company_name"] = payload.company_name
        if payload.industry_domain is not None:
            industry_updates["industry_domain"] = payload.industry_domain
        if payload.website is not None:
            industry_updates["website"] = payload.website
        if payload.description is not None:
            industry_updates["description"] = payload.description
        if payload.location is not None:
            industry_updates["location"] = payload.location
        if payload.company_size is not None:
            industry_updates["company_size"] = payload.company_size

        if industry_updates:
            try:
                client.table("industry_profiles").update(industry_updates).eq("id", industry_id).execute()
            except Exception as e:
                logger.error("Failed to update industry_profiles for %s: %s", industry_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update enterprise profile details.",
                )

        return cls.get_industry_profile(industry_id)

    @classmethod
    def create_challenge(
        cls,
        industry_id: str,
        payload: ChallengeCreate,
    ) -> ChallengeResponse:
        """Create a new problem statement challenge owned by the authenticated industry."""
        client = cls.get_client()
        industry_record = cls._ensure_industry_record(industry_id)

        insert_payload = {
            "industry_id": industry_id,
            "title": payload.title.strip(),
            "description": payload.description.strip(),
            "domain": payload.domain.strip() if payload.domain else None,
            "collaboration_type": payload.collaboration_type.strip() if payload.collaboration_type else None,
            "location": payload.location.strip() if payload.location else None,
            "deadline": payload.deadline.isoformat() if payload.deadline else None,
            "status": "draft",
        }

        try:
            res = client.table("challenges").insert(insert_payload).execute()
            if not res.data or len(res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create challenge record.",
                )
            created_row = res.data[0]
            return ChallengeResponse(
                id=str(created_row["id"]),
                industry_id=str(created_row["industry_id"]),
                company_name=industry_record.get("company_name"),
                title=created_row["title"],
                description=created_row["description"],
                domain=created_row.get("domain"),
                collaboration_type=created_row.get("collaboration_type"),
                status=created_row["status"],
                location=created_row.get("location"),
                deadline=str(created_row.get("deadline")) if created_row.get("deadline") else None,
                ai_summary=created_row.get("ai_summary"),
                ai_requirements=created_row.get("ai_requirements"),
                requirements=[],
                requirements_count=0,
                created_at=str(created_row.get("created_at")),
                updated_at=str(created_row.get("updated_at")),
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to insert challenge: %s", type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while saving challenge.",
            )

    @classmethod
    def _fetch_requirements_for_challenge(cls, challenge_id: str) -> List[ChallengeRequirementResponse]:
        """Fetch all structured requirements for a challenge joined with skills."""
        client = cls.get_client()
        try:
            res = client.table("challenge_requirements").select("*, skills(*)").eq("challenge_id", challenge_id).order("importance_weight", desc=True).execute()
            reqs: List[ChallengeRequirementResponse] = []
            for r in (res.data or []):
                skill_obj = r.get("skills") or {}
                reqs.append(
                    ChallengeRequirementResponse(
                        id=str(r["id"]),
                        challenge_id=str(r["challenge_id"]),
                        skill_id=str(r["skill_id"]),
                        skill_name=skill_obj.get("name", "Unknown Skill"),
                        category=skill_obj.get("category"),
                        required_level=r["required_level"],
                        importance_weight=float(r["importance_weight"]),
                        is_ai_extracted=bool(r.get("is_ai_extracted", False)),
                        created_at=str(r.get("created_at")),
                    )
                )
            return reqs
        except Exception as e:
            logger.warning("Error fetching requirements for challenge %s: %s", challenge_id, type(e).__name__)
            return []

    @classmethod
    def get_industry_challenges(cls, industry_id: str) -> List[ChallengeResponse]:
        """Retrieve all challenges owned by the authenticated industry."""
        client = cls.get_client()
        try:
            res = client.table("challenges").select("*, industry_profiles(company_name)").eq("industry_id", industry_id).order("created_at", desc=True).execute()
            challenge_list: List[ChallengeResponse] = []
            for row in (res.data or []):
                c_id = str(row["id"])
                reqs = cls._fetch_requirements_for_challenge(c_id)
                comp_name = (row.get("industry_profiles") or {}).get("company_name")
                challenge_list.append(
                    ChallengeResponse(
                        id=c_id,
                        industry_id=str(row["industry_id"]),
                        company_name=comp_name,
                        title=row["title"],
                        description=row["description"],
                        domain=row.get("domain"),
                        collaboration_type=row.get("collaboration_type"),
                        status=row["status"],
                        location=row.get("location"),
                        deadline=str(row.get("deadline")) if row.get("deadline") else None,
                        ai_summary=row.get("ai_summary"),
                        ai_requirements=row.get("ai_requirements"),
                        requirements=reqs,
                        requirements_count=len(reqs),
                        created_at=str(row.get("created_at")),
                        updated_at=str(row.get("updated_at")),
                    )
                )
            return challenge_list
        except Exception as e:
            logger.error("Error fetching industry challenges: %s", type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve challenges.",
            )

    @classmethod
    def get_challenge_by_id(cls, industry_id: str, challenge_id: str) -> ChallengeResponse:
        """
        Retrieve a single challenge by ID with strict ownership validation.
        Prevents IDOR across industry entities.
        """
        client = cls.get_client()
        res = client.table("challenges").select("*, industry_profiles(company_name)").eq("id", challenge_id.strip()).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found.",
            )

        row = res.data[0]
        # Strict IDOR check
        if str(row["industry_id"]) != industry_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found.",
            )

        reqs = cls._fetch_requirements_for_challenge(str(row["id"]))
        comp_name = (row.get("industry_profiles") or {}).get("company_name")

        return ChallengeResponse(
            id=str(row["id"]),
            industry_id=str(row["industry_id"]),
            company_name=comp_name,
            title=row["title"],
            description=row["description"],
            domain=row.get("domain"),
            collaboration_type=row.get("collaboration_type"),
            status=row["status"],
            location=row.get("location"),
            deadline=str(row.get("deadline")) if row.get("deadline") else None,
            ai_summary=row.get("ai_summary"),
            ai_requirements=row.get("ai_requirements"),
            requirements=reqs,
            requirements_count=len(reqs),
            created_at=str(row.get("created_at")),
            updated_at=str(row.get("updated_at")),
        )

    @classmethod
    def update_challenge(
        cls,
        industry_id: str,
        challenge_id: str,
        payload: ChallengeUpdate,
    ) -> ChallengeResponse:
        """Update editable challenge fields for an owned challenge."""
        client = cls.get_client()
        # Verify ownership first
        cls.get_challenge_by_id(industry_id, challenge_id)

        update_payload: Dict[str, Any] = {}
        if payload.title is not None:
            update_payload["title"] = payload.title.strip()
        if payload.description is not None:
            update_payload["description"] = payload.description.strip()
        if payload.domain is not None:
            update_payload["domain"] = payload.domain.strip() if payload.domain else None
        if payload.collaboration_type is not None:
            update_payload["collaboration_type"] = payload.collaboration_type.strip() if payload.collaboration_type else None
        if payload.location is not None:
            update_payload["location"] = payload.location.strip() if payload.location else None
        if payload.deadline is not None:
            update_payload["deadline"] = payload.deadline.isoformat()

        if update_payload:
            try:
                client.table("challenges").update(update_payload).eq("id", challenge_id.strip()).execute()
            except Exception as e:
                logger.error("Failed to update challenge %s: %s", challenge_id, type(e).__name__)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update challenge details.",
                )

        return cls.get_challenge_by_id(industry_id, challenge_id)

    @classmethod
    def update_challenge_status(
        cls,
        industry_id: str,
        challenge_id: str,
        new_status: str,
    ) -> ChallengeResponse:
        """
        Transition challenge lifecycle status.
        Enforces publishing readiness: challenge should possess structured requirements before publishing.
        """
        client = cls.get_client()
        challenge = cls.get_challenge_by_id(industry_id, challenge_id)

        # Publishing safety check
        if new_status == "published":
            if challenge.requirements_count == 0 and not challenge.ai_summary:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Challenge must undergo AI requirement analysis or contain structured skills before publishing.",
                )

        try:
            client.table("challenges").update({"status": new_status}).eq("id", challenge_id.strip()).execute()
        except Exception as e:
            logger.error("Failed to update status for challenge %s: %s", challenge_id, type(e).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update challenge status.",
            )

        return cls.get_challenge_by_id(industry_id, challenge_id)

    @classmethod
    def delete_challenge(cls, industry_id: str, challenge_id: str) -> bool:
        """
        Safely delete or close a challenge.
        If dependent collaboration records exist, transitions status to 'closed'.
        """
        client = cls.get_client()
        cls.get_challenge_by_id(industry_id, challenge_id)

        try:
            client.table("challenges").delete().eq("id", challenge_id.strip()).execute()
            return True
        except Exception as e:
            err_str = str(e).lower()
            logger.warning("Direct challenge deletion failed (foreign key constraints), closing instead: %s", err_str)
            client.table("challenges").update({"status": "closed"}).eq("id", challenge_id.strip()).execute()
            return True

    @classmethod
    def analyze_challenge(
        cls,
        industry_id: str,
        challenge_id: str,
    ) -> ChallengeAnalysisResult:
        """
        Execute Gemini AI analysis on the challenge, resolve canonical skills,
        and persist structured requirements into challenge_requirements.
        """
        client = cls.get_client()
        challenge = cls.get_challenge_by_id(industry_id, challenge_id)

        # 1. Execute Gemini AI extraction
        ai_result = GeminiService.extract_challenge_requirements(
            title=challenge.title,
            description=challenge.description,
            domain=challenge.domain,
            collaboration_type=challenge.collaboration_type,
        )

        # 2. Fetch canonical skills catalog
        s_res = client.table("skills").select("id, name, category").execute()
        canonical_skills = s_res.data or []

        # Build normalized index of canonical skills for robust matching
        skill_index = {}
        for s in canonical_skills:
            norm_name = _normalize_string(s["name"])
            skill_index[norm_name] = s
            # Also index common aliases
            if norm_name == "react":
                skill_index["reactjs"] = s
                skill_index["react js"] = s
            elif norm_name == "javascript":
                skill_index["js"] = s
            elif norm_name == "python":
                skill_index["python 3"] = s
                skill_index["py"] = s

        mapped_requirements: List[ChallengeRequirementResponse] = []
        unresolved_skills: List[str] = []

        # 3. Match and upsert requirements
        for item in ai_result.requirements:
            raw_name = item.skill_name.strip()
            norm_query = _normalize_string(raw_name)

            matched_skill = skill_index.get(norm_query)

            # Substring fallback for compound names (e.g. 'Advanced Python' -> 'Python')
            if not matched_skill:
                for norm_key, s_obj in skill_index.items():
                    if norm_key in norm_query or norm_query in norm_key:
                        matched_skill = s_obj
                        break

            if matched_skill:
                skill_id = str(matched_skill["id"])
                req_payload = {
                    "challenge_id": challenge_id,
                    "skill_id": skill_id,
                    "required_level": item.required_level,
                    "importance_weight": round(item.importance_weight, 2),
                    "is_ai_extracted": True,
                }

                # Check if requirement already exists
                existing_req = client.table("challenge_requirements").select("id").eq("challenge_id", challenge_id).eq("skill_id", skill_id).execute()
                if existing_req.data and len(existing_req.data) > 0:
                    r_id = existing_req.data[0]["id"]
                    client.table("challenge_requirements").update(req_payload).eq("id", r_id).execute()
                else:
                    client.table("challenge_requirements").insert(req_payload).execute()
            else:
                unresolved_skills.append(raw_name)

        # 4. Update challenge with AI summary and raw AI requirements JSONB
        ai_requirements_json = [r.model_dump() for r in ai_result.requirements]
        try:
            client.table("challenges").update({
                "ai_summary": ai_result.summary,
                "ai_requirements": ai_requirements_json,
            }).eq("id", challenge_id).execute()
        except Exception as e:
            logger.error("Failed to update challenge AI fields: %s", type(e).__name__)

        # 5. Fetch all current mapped requirements
        updated_reqs = cls._fetch_requirements_for_challenge(challenge_id)

        return ChallengeAnalysisResult(
            challenge_id=challenge_id,
            ai_summary=ai_result.summary,
            mapped_requirements=updated_reqs,
            unresolved_skills=unresolved_skills,
            ready_for_matching=len(updated_reqs) > 0,
        )


# Convenience module-level exports
get_industry_profile = IndustryService.get_industry_profile
update_industry_profile = IndustryService.update_industry_profile
create_challenge = IndustryService.create_challenge
get_industry_challenges = IndustryService.get_industry_challenges
get_challenge_by_id = IndustryService.get_challenge_by_id
update_challenge = IndustryService.update_challenge
update_challenge_status = IndustryService.update_challenge_status
delete_challenge = IndustryService.delete_challenge
analyze_challenge = IndustryService.analyze_challenge
