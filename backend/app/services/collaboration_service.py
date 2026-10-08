from datetime import date, datetime, timezone
import logging
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status

from app.schemas.collaboration import (
    CollaborationDetailResponse,
    CollaborationListResponse,
    CollaborationRequestCreate,
    CollaborationRequestListResponse,
    CollaborationRequestResponse,
    CollaborationRequestStatus,
    CollaborationResponse,
    CollaborationStatus,
    CollaborationUpdate,
    MilestoneCreate,
    MilestoneResponse,
    MilestoneStatus,
    MilestoneUpdate,
    OutcomeStatus,
    ProjectOutcomeCreate,
    ProjectOutcomeResponse,
    ProjectOutcomeUpdate,
    ProjectUpdateCreate,
    ProjectUpdateResponse,
)
from app.services.supabase_service import (
    get_supabase_admin_client,
    get_supabase_client,
    has_supabase_admin_key,
)

logger = logging.getLogger(__name__)


class CollaborationService:
    """
    Service managing Academic-Industry Collaborations, Requests, Milestones,
    Project Updates, and Verified Outcomes.
    """

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

    # --------------------------------------------------------------------------
    # Helper: Resolve College Record from Profile ID
    # --------------------------------------------------------------------------
    @classmethod
    def resolve_college_id(cls, profile_id: str) -> Optional[str]:
        """Resolve the primary key UUID of the colleges table for a college profile ID."""
        client = cls.get_client()
        res = client.table("colleges").select("id").eq("profile_id", profile_id).execute()
        if res.data and len(res.data) > 0:
            return str(res.data[0]["id"])
        return None

    # --------------------------------------------------------------------------
    # Helper: Verify Participant Access to Collaboration Workspace
    # --------------------------------------------------------------------------
    @classmethod
    def verify_collaboration_participant(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
    ) -> Dict[str, Any]:
        """
        Enforce strict workspace security: only the owning Industry partner
        or participating College (or Admin) can access the collaboration workspace.
        """
        client = cls.get_client()
        res = client.table("collaborations").select("*").eq("id", collaboration_id.strip()).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration not found.",
            )

        collab = res.data[0]
        if user_role == "admin":
            return collab

        if user_role == "industry":
            if str(collab["industry_id"]) != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You are not the industry owner of this collaboration.",
                )
            return collab

        if user_role == "college":
            college_id = cls.resolve_college_id(user_id)
            if not college_id or str(collab["college_id"]) != college_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You are not the academic partner for this collaboration.",
                )
            return collab

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not authorized to access this collaboration workspace.",
        )

    # ==========================================================================
    # 1. COLLABORATION REQUESTS
    # ==========================================================================

    @classmethod
    def create_collaboration_request(
        cls,
        user_id: str,
        payload: CollaborationRequestCreate,
    ) -> CollaborationRequestResponse:
        """
        Industry sends a formal collaboration request to a matched college.
        Validates challenge ownership, published status, college existence,
        deterministic match existence, and prevents duplicate active requests.
        """
        client = cls.get_client()
        challenge_id = payload.challenge_id.strip()
        college_id = payload.college_id.strip()

        # 1. Verify Challenge existence & ownership
        c_res = client.table("challenges").select("id, industry_id, title, status, description").eq("id", challenge_id).execute()
        if not c_res.data or len(c_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found.",
            )
        challenge = c_res.data[0]
        if str(challenge["industry_id"]) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not own this challenge.",
            )

        # 2. Verify Challenge is published (or valid collaboration state)
        if challenge.get("status") not in ("published", "matched", "collaborating"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge must be published before requesting collaboration.",
            )

        # 3. Verify target college exists
        col_res = client.table("colleges").select("id, college_name").eq("id", college_id).execute()
        if not col_res.data or len(col_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target college institution not found.",
            )
        college_name = col_res.data[0].get("college_name")

        # 4. Verify a deterministic match exists for this challenge + college
        m_res = client.table("matches").select("id, overall_score").eq("challenge_id", challenge_id).eq("college_id", college_id).execute()
        if not m_res.data or len(m_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid deterministic match must exist between this challenge and the target college before sending a collaboration request.",
            )
        match_record = m_res.data[0]
        match_id = str(match_record["id"])
        match_score = float(match_record.get("overall_score") or 0.0)

        # 5. Prevent duplicate pending/active requests
        existing_req = client.table("collaboration_requests").select("id, status").eq("challenge_id", challenge_id).eq("college_id", college_id).execute()
        if existing_req.data:
            for req in existing_req.data:
                if req.get("status") in ("pending", "accepted"):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"An active collaboration request already exists for this challenge and college (status: {req.get('status')}).",
                    )

        # 6. Check if an active collaboration already exists
        existing_collab = client.table("collaborations").select("id").eq("challenge_id", challenge_id).eq("college_id", college_id).eq("status", "active").execute()
        if existing_collab.data and len(existing_collab.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An active collaboration already exists between your company and this college for this challenge.",
            )

        # 7. Insert collaboration request
        insert_data = {
            "challenge_id": challenge_id,
            "industry_id": user_id,
            "college_id": college_id,
            "match_id": match_id,
            "message": payload.message.strip() if payload.message else None,
            "status": CollaborationRequestStatus.pending.value,
        }

        insert_res = client.table("collaboration_requests").insert(insert_data).execute()
        if not insert_res.data or len(insert_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create collaboration request record.",
            )
        created_row = insert_res.data[0]

        # Fetch industry company name
        ind_res = client.table("industry_profiles").select("company_name").eq("id", user_id).execute()
        company_name = ind_res.data[0].get("company_name") if ind_res.data else None

        return CollaborationRequestResponse(
            id=str(created_row["id"]),
            challenge_id=challenge_id,
            industry_id=user_id,
            college_id=college_id,
            match_id=match_id,
            message=created_row.get("message"),
            status=created_row.get("status", CollaborationRequestStatus.pending.value),
            created_at=str(created_row.get("created_at")),
            responded_at=str(created_row.get("responded_at")) if created_row.get("responded_at") else None,
            challenge_title=challenge.get("title"),
            company_name=company_name,
            college_name=college_name,
            match_score=match_score,
        )

    @classmethod
    def list_collaboration_requests(
        cls,
        user_id: str,
        user_role: Optional[str],
        status_filter: Optional[str] = None,
        challenge_id: Optional[str] = None,
    ) -> CollaborationRequestListResponse:
        """
        List incoming or outgoing collaboration requests based on the user's role.
        - Industry: sees requests initiated by their company.
        - College: sees requests received by their institution.
        """
        client = cls.get_client()
        query = client.table("collaboration_requests").select("*")

        if user_role == "industry":
            query = query.eq("industry_id", user_id)
        elif user_role == "college":
            college_id = cls.resolve_college_id(user_id)
            if not college_id:
                return CollaborationRequestListResponse(total=0, requests=[])
            query = query.eq("college_id", college_id)
        elif user_role == "admin":
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Unauthorized role for collaboration requests.",
            )

        if status_filter:
            query = query.eq("status", status_filter.strip())
        if challenge_id:
            query = query.eq("challenge_id", challenge_id.strip())

        query = query.order("created_at", desc=True)
        res = query.execute()
        rows = res.data or []

        if not rows:
            return CollaborationRequestListResponse(total=0, requests=[])

        # Batch enrich details
        challenge_ids = list({r["challenge_id"] for r in rows if r.get("challenge_id")})
        industry_ids = list({r["industry_id"] for r in rows if r.get("industry_id")})
        college_ids = list({r["college_id"] for r in rows if r.get("college_id")})
        match_ids = list({r["match_id"] for r in rows if r.get("match_id")})

        challenges_map = {}
        if challenge_ids:
            c_res = client.table("challenges").select("id, title").in_("id", challenge_ids).execute()
            challenges_map = {c["id"]: c.get("title") for c in (c_res.data or [])}

        industry_map = {}
        if industry_ids:
            i_res = client.table("industry_profiles").select("id, company_name").in_("id", industry_ids).execute()
            industry_map = {i["id"]: i.get("company_name") for i in (i_res.data or [])}

        colleges_map = {}
        if college_ids:
            col_res = client.table("colleges").select("id, college_name").in_("id", college_ids).execute()
            colleges_map = {col["id"]: col.get("college_name") for col in (col_res.data or [])}

        matches_map = {}
        if match_ids:
            m_res = client.table("matches").select("id, overall_score").in_("id", match_ids).execute()
            matches_map = {m["id"]: float(m.get("overall_score") or 0.0) for m in (m_res.data or [])}

        requests_list = []
        for r in rows:
            req_id = str(r["id"])
            c_id = r.get("challenge_id")
            ind_id = r.get("industry_id")
            col_id = r.get("college_id")
            m_id = r.get("match_id")

            requests_list.append(
                CollaborationRequestResponse(
                    id=req_id,
                    challenge_id=c_id,
                    industry_id=ind_id,
                    college_id=col_id,
                    match_id=m_id,
                    message=r.get("message"),
                    status=r.get("status", CollaborationRequestStatus.pending.value),
                    created_at=str(r.get("created_at")),
                    responded_at=str(r.get("responded_at")) if r.get("responded_at") else None,
                    challenge_title=challenges_map.get(c_id),
                    company_name=industry_map.get(ind_id),
                    college_name=colleges_map.get(col_id),
                    match_score=matches_map.get(m_id),
                )
            )

        return CollaborationRequestListResponse(total=len(requests_list), requests=requests_list)

    @classmethod
    def get_collaboration_request(
        cls,
        request_id: str,
        user_id: str,
        user_role: Optional[str],
    ) -> CollaborationRequestResponse:
        """Fetch a single collaboration request with strict authorization."""
        client = cls.get_client()
        res = client.table("collaboration_requests").select("*").eq("id", request_id.strip()).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration request not found.",
            )

        r = res.data[0]
        # Check permissions
        if user_role == "industry":
            if str(r["industry_id"]) != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You do not own this collaboration request.",
                )
        elif user_role == "college":
            college_id = cls.resolve_college_id(user_id)
            if not college_id or str(r["college_id"]) != college_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: This request was not addressed to your institution.",
                )
        elif user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

        # Enrich
        c_res = client.table("challenges").select("title").eq("id", r["challenge_id"]).execute()
        challenge_title = c_res.data[0].get("title") if c_res.data else None

        ind_res = client.table("industry_profiles").select("company_name").eq("id", r["industry_id"]).execute()
        company_name = ind_res.data[0].get("company_name") if ind_res.data else None

        col_res = client.table("colleges").select("college_name").eq("id", r["college_id"]).execute()
        college_name = col_res.data[0].get("college_name") if col_res.data else None

        match_score = None
        if r.get("match_id"):
            m_res = client.table("matches").select("overall_score").eq("id", r["match_id"]).execute()
            if m_res.data:
                match_score = float(m_res.data[0].get("overall_score") or 0.0)

        return CollaborationRequestResponse(
            id=str(r["id"]),
            challenge_id=r["challenge_id"],
            industry_id=r["industry_id"],
            college_id=r["college_id"],
            match_id=r.get("match_id"),
            message=r.get("message"),
            status=r.get("status", CollaborationRequestStatus.pending.value),
            created_at=str(r.get("created_at")),
            responded_at=str(r.get("responded_at")) if r.get("responded_at") else None,
            challenge_title=challenge_title,
            company_name=company_name,
            college_name=college_name,
            match_score=match_score,
        )

    @classmethod
    def accept_collaboration_request(
        cls,
        request_id: str,
        user_id: str,
    ) -> CollaborationResponse:
        """
        College accepts a pending collaboration request.
        Creates a real collaboration record and sets challenge & match statuses.
        """
        client = cls.get_client()
        college_id = cls.resolve_college_id(user_id)
        if not college_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="College institution profile not found.",
            )

        # 1. Fetch request
        req_res = client.table("collaboration_requests").select("*").eq("id", request_id.strip()).execute()
        if not req_res.data or len(req_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration request not found.",
            )

        req = req_res.data[0]
        if str(req["college_id"]) != college_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not authorized to accept this request.",
            )

        if req.get("status") != CollaborationRequestStatus.pending.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot accept request with status '{req.get('status')}'. Only pending requests can be accepted.",
            )

        # 2. Check if collaboration record already exists for this request
        existing_collab = client.table("collaborations").select("*").eq("request_id", request_id.strip()).execute()
        if existing_collab.data and len(existing_collab.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A collaboration has already been established for this request.",
            )

        # 3. Retrieve challenge details for collaboration title & description
        c_res = client.table("challenges").select("title, description").eq("id", req["challenge_id"]).execute()
        challenge_title = c_res.data[0].get("title", "Industry-Academic Collaboration") if c_res.data else "Industry-Academic Collaboration"
        challenge_desc = c_res.data[0].get("description") if c_res.data else None

        # 4. Update request status to accepted
        now_ts = datetime.now(timezone.utc).isoformat()
        client.table("collaboration_requests").update({
            "status": CollaborationRequestStatus.accepted.value,
            "responded_at": now_ts,
        }).eq("id", request_id.strip()).execute()

        # 5. Insert new collaboration record
        collab_insert = {
            "challenge_id": req["challenge_id"],
            "industry_id": req["industry_id"],
            "college_id": req["college_id"],
            "request_id": req["id"],
            "title": challenge_title,
            "description": challenge_desc,
            "status": CollaborationStatus.active.value,
            "start_date": str(date.today()),
        }
        collab_res = client.table("collaborations").insert(collab_insert).execute()
        if not collab_res.data or len(collab_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create collaboration workspace record.",
            )
        collab_row = collab_res.data[0]

        # 6. Update challenge status to collaborating
        try:
            client.table("challenges").update({"status": "collaborating"}).eq("id", req["challenge_id"]).execute()
        except Exception as e:
            logger.warning("Could not update challenge status: %s", e)

        # 7. Update match status to accepted if match_id is present
        if req.get("match_id"):
            try:
                client.table("matches").update({"status": "accepted"}).eq("id", req["match_id"]).execute()
            except Exception as e:
                logger.warning("Could not update match status: %s", e)

        # Enrich response
        ind_res = client.table("industry_profiles").select("company_name").eq("id", req["industry_id"]).execute()
        company_name = ind_res.data[0].get("company_name") if ind_res.data else None

        col_res = client.table("colleges").select("college_name").eq("id", req["college_id"]).execute()
        college_name = col_res.data[0].get("college_name") if col_res.data else None

        return CollaborationResponse(
            id=str(collab_row["id"]),
            challenge_id=req["challenge_id"],
            industry_id=req["industry_id"],
            college_id=req["college_id"],
            request_id=req["id"],
            title=collab_row.get("title", challenge_title),
            description=collab_row.get("description"),
            status=collab_row.get("status", CollaborationStatus.active.value),
            start_date=str(collab_row.get("start_date")) if collab_row.get("start_date") else None,
            end_date=str(collab_row.get("end_date")) if collab_row.get("end_date") else None,
            created_at=str(collab_row.get("created_at")),
            updated_at=str(collab_row.get("updated_at")),
            challenge_title=challenge_title,
            company_name=company_name,
            college_name=college_name,
        )

    @classmethod
    def reject_collaboration_request(
        cls,
        request_id: str,
        user_id: str,
    ) -> CollaborationRequestResponse:
        """College rejects a pending collaboration request."""
        client = cls.get_client()
        college_id = cls.resolve_college_id(user_id)
        if not college_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="College institution profile not found.",
            )

        req_res = client.table("collaboration_requests").select("*").eq("id", request_id.strip()).execute()
        if not req_res.data or len(req_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration request not found.",
            )

        req = req_res.data[0]
        if str(req["college_id"]) != college_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not authorized to reject this request.",
            )

        if req.get("status") != CollaborationRequestStatus.pending.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot reject request with status '{req.get('status')}'. Only pending requests can be rejected.",
            )

        now_ts = datetime.now(timezone.utc).isoformat()
        update_res = client.table("collaboration_requests").update({
            "status": CollaborationRequestStatus.rejected.value,
            "responded_at": now_ts,
        }).eq("id", request_id.strip()).execute()

        # Update match status to rejected if match exists
        if req.get("match_id"):
            try:
                client.table("matches").update({"status": "rejected"}).eq("id", req["match_id"]).execute()
            except Exception as e:
                logger.warning("Could not update match status: %s", e)

        return cls.get_collaboration_request(request_id, user_id, "college")

    # ==========================================================================
    # 2. COLLABORATIONS WORKSPACE
    # ==========================================================================

    @classmethod
    def list_collaborations(
        cls,
        user_id: str,
        user_role: Optional[str],
        status_filter: Optional[str] = None,
    ) -> CollaborationListResponse:
        """List all active or completed collaborations for authenticated participant."""
        client = cls.get_client()
        query = client.table("collaborations").select("*")

        if user_role == "industry":
            query = query.eq("industry_id", user_id)
        elif user_role == "college":
            college_id = cls.resolve_college_id(user_id)
            if not college_id:
                return CollaborationListResponse(total=0, collaborations=[])
            query = query.eq("college_id", college_id)
        elif user_role == "admin":
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Unauthorized role for collaborations.",
            )

        if status_filter:
            query = query.eq("status", status_filter.strip())

        query = query.order("created_at", desc=True)
        res = query.execute()
        rows = res.data or []

        if not rows:
            return CollaborationListResponse(total=0, collaborations=[])

        # Batch enrich
        challenge_ids = list({r["challenge_id"] for r in rows if r.get("challenge_id")})
        industry_ids = list({r["industry_id"] for r in rows if r.get("industry_id")})
        college_ids = list({r["college_id"] for r in rows if r.get("college_id")})

        challenges_map = {}
        if challenge_ids:
            c_res = client.table("challenges").select("id, title").in_("id", challenge_ids).execute()
            challenges_map = {c["id"]: c.get("title") for c in (c_res.data or [])}

        industry_map = {}
        if industry_ids:
            i_res = client.table("industry_profiles").select("id, company_name").in_("id", industry_ids).execute()
            industry_map = {i["id"]: i.get("company_name") for i in (i_res.data or [])}

        colleges_map = {}
        if college_ids:
            col_res = client.table("colleges").select("id, college_name").in_("id", college_ids).execute()
            colleges_map = {col["id"]: col.get("college_name") for col in (col_res.data or [])}

        collabs_list = []
        for r in rows:
            c_id = r.get("challenge_id")
            ind_id = r.get("industry_id")
            col_id = r.get("college_id")

            collabs_list.append(
                CollaborationResponse(
                    id=str(r["id"]),
                    challenge_id=c_id,
                    industry_id=ind_id,
                    college_id=col_id,
                    request_id=r["request_id"],
                    title=r.get("title", "Collaboration Project"),
                    description=r.get("description"),
                    status=r.get("status", CollaborationStatus.active.value),
                    start_date=str(r.get("start_date")) if r.get("start_date") else None,
                    end_date=str(r.get("end_date")) if r.get("end_date") else None,
                    created_at=str(r.get("created_at")),
                    updated_at=str(r.get("updated_at")),
                    challenge_title=challenges_map.get(c_id),
                    company_name=industry_map.get(ind_id),
                    college_name=colleges_map.get(col_id),
                )
            )

        return CollaborationListResponse(total=len(collabs_list), collaborations=collabs_list)

    @classmethod
    def _fetch_milestones(cls, collaboration_id: str) -> List[MilestoneResponse]:
        """Internal fetcher for collaboration milestones."""
        client = cls.get_client()
        res = client.table("milestones").select("*").eq("collaboration_id", collaboration_id.strip()).order("created_at", desc=False).execute()
        rows = res.data or []

        assigned_ids = list({r["assigned_to"] for r in rows if r.get("assigned_to")})
        profiles_map = {}
        if assigned_ids:
            p_res = client.table("profiles").select("id, full_name").in_("id", assigned_ids).execute()
            profiles_map = {p["id"]: p.get("full_name") for p in (p_res.data or [])}

        milestones_list = []
        for r in rows:
            a_id = r.get("assigned_to")
            milestones_list.append(
                MilestoneResponse(
                    id=str(r["id"]),
                    collaboration_id=str(r["collaboration_id"]),
                    title=r["title"],
                    description=r.get("description"),
                    assigned_to=a_id,
                    assigned_to_name=profiles_map.get(a_id),
                    due_date=str(r.get("due_date")) if r.get("due_date") else None,
                    status=r.get("status", MilestoneStatus.pending.value),
                    progress=int(r.get("progress") or 0),
                    created_at=str(r.get("created_at")),
                    completed_at=str(r.get("completed_at")) if r.get("completed_at") else None,
                )
            )
        return milestones_list

    @classmethod
    def _fetch_project_updates(cls, collaboration_id: str) -> List[ProjectUpdateResponse]:
        """Internal fetcher for collaboration project updates."""
        client = cls.get_client()
        res = client.table("project_updates").select("*").eq("collaboration_id", collaboration_id.strip()).order("created_at", desc=True).execute()
        rows = res.data or []

        author_ids = list({r["author_id"] for r in rows if r.get("author_id")})
        profiles_map = {}
        if author_ids:
            p_res = client.table("profiles").select("id, full_name, role").in_("id", author_ids).execute()
            profiles_map = {p["id"]: (p.get("full_name"), p.get("role")) for p in (p_res.data or [])}

        updates_list = []
        for r in rows:
            auth_id = r.get("author_id")
            name_and_role = profiles_map.get(auth_id, (None, None))
            updates_list.append(
                ProjectUpdateResponse(
                    id=str(r["id"]),
                    collaboration_id=str(r["collaboration_id"]),
                    milestone_id=r.get("milestone_id"),
                    author_id=auth_id,
                    author_name=name_and_role[0],
                    author_role=name_and_role[1],
                    content=r["content"],
                    progress=r.get("progress"),
                    created_at=str(r.get("created_at")),
                )
            )
        return updates_list

    @classmethod
    def _fetch_project_outcome(cls, collaboration_id: str) -> Optional[ProjectOutcomeResponse]:
        """Internal fetcher for collaboration outcome."""
        client = cls.get_client()
        res = client.table("project_outcomes").select("*").eq("collaboration_id", collaboration_id.strip()).execute()
        if not res.data or len(res.data) == 0:
            return None

        row = res.data[0]
        return ProjectOutcomeResponse(
            id=str(row["id"]),
            collaboration_id=str(row["collaboration_id"]),
            title=row["title"],
            summary=row.get("summary"),
            repository_url=row.get("repository_url"),
            demo_url=row.get("demo_url"),
            documentation_url=row.get("documentation_url"),
            technologies=row.get("technologies"),
            outcome_status=row.get("outcome_status", OutcomeStatus.draft.value),
            completed_at=str(row.get("completed_at")) if row.get("completed_at") else None,
        )

    @classmethod
    def get_collaboration_workspace(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
    ) -> CollaborationDetailResponse:
        """
        Fetch full collaboration workspace details with milestones, project updates, and outcomes.
        Guaranteed security against unauthorized IDOR access.
        """
        collab = cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        client = cls.get_client()

        # 1. Fetch Milestones
        milestones_res = cls._fetch_milestones(collaboration_id)

        # 2. Fetch Project Updates
        updates_res = cls._fetch_project_updates(collaboration_id)

        # 3. Fetch Project Outcome
        outcome_res = cls._fetch_project_outcome(collaboration_id)

        # 4. Context enrichments
        c_res = client.table("challenges").select("title").eq("id", collab["challenge_id"]).execute()
        challenge_title = c_res.data[0].get("title") if c_res.data else None

        ind_res = client.table("industry_profiles").select("company_name").eq("id", collab["industry_id"]).execute()
        company_name = ind_res.data[0].get("company_name") if ind_res.data else None

        col_res = client.table("colleges").select("college_name").eq("id", collab["college_id"]).execute()
        college_name = col_res.data[0].get("college_name") if col_res.data else None

        return CollaborationDetailResponse(
            id=str(collab["id"]),
            challenge_id=collab["challenge_id"],
            industry_id=collab["industry_id"],
            college_id=collab["college_id"],
            request_id=collab["request_id"],
            title=collab.get("title", "Collaboration Project"),
            description=collab.get("description"),
            status=collab.get("status", CollaborationStatus.active.value),
            start_date=str(collab.get("start_date")) if collab.get("start_date") else None,
            end_date=str(collab.get("end_date")) if collab.get("end_date") else None,
            created_at=str(collab.get("created_at")),
            updated_at=str(collab.get("updated_at")),
            challenge_title=challenge_title,
            company_name=company_name,
            college_name=college_name,
            milestones=milestones_res,
            updates=updates_res,
            outcome=outcome_res,
        )

    @classmethod
    def update_collaboration(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
        payload: CollaborationUpdate,
    ) -> CollaborationResponse:
        """Update collaboration metadata or status."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        client = cls.get_client()

        update_fields: Dict[str, Any] = {}
        if payload.title is not None:
            update_fields["title"] = payload.title.strip()
        if payload.description is not None:
            update_fields["description"] = payload.description.strip()
        if payload.status is not None:
            update_fields["status"] = payload.status.value
        if payload.end_date is not None:
            update_fields["end_date"] = str(payload.end_date)

        if not update_fields:
            return cls.get_collaboration_workspace(collaboration_id, user_id, user_role)

        res = client.table("collaborations").update(update_fields).eq("id", collaboration_id.strip()).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update collaboration record.",
            )

        return cls.get_collaboration_workspace(collaboration_id, user_id, user_role)

    # ==========================================================================
    # 3. MILESTONES
    # ==========================================================================

    @classmethod
    def get_milestones(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
    ) -> List[MilestoneResponse]:
        """Fetch all milestones for an active collaboration."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        return cls._fetch_milestones(collaboration_id)

    @classmethod
    def create_milestone(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
        payload: MilestoneCreate,
    ) -> MilestoneResponse:
        """Create a new milestone deliverable in a collaboration workspace."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        client = cls.get_client()

        completed_at = None
        if payload.status == MilestoneStatus.completed or payload.progress == 100:
            completed_at = datetime.now(timezone.utc).isoformat()

        insert_data = {
            "collaboration_id": collaboration_id.strip(),
            "title": payload.title.strip(),
            "description": payload.description.strip() if payload.description else None,
            "assigned_to": payload.assigned_to.strip() if payload.assigned_to else None,
            "due_date": str(payload.due_date) if payload.due_date else None,
            "status": payload.status.value,
            "progress": payload.progress,
            "completed_at": completed_at,
        }

        res = client.table("milestones").insert(insert_data).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create milestone record.",
            )
        row = res.data[0]

        assigned_name = None
        if row.get("assigned_to"):
            p_res = client.table("profiles").select("full_name").eq("id", row["assigned_to"]).execute()
            if p_res.data:
                assigned_name = p_res.data[0].get("full_name")

        return MilestoneResponse(
            id=str(row["id"]),
            collaboration_id=str(row["collaboration_id"]),
            title=row["title"],
            description=row.get("description"),
            assigned_to=row.get("assigned_to"),
            assigned_to_name=assigned_name,
            due_date=str(row.get("due_date")) if row.get("due_date") else None,
            status=row.get("status", MilestoneStatus.pending.value),
            progress=int(row.get("progress") or 0),
            created_at=str(row.get("created_at")),
            completed_at=str(row.get("completed_at")) if row.get("completed_at") else None,
        )

    @classmethod
    def update_milestone(
        cls,
        collaboration_id: str,
        milestone_id: str,
        user_id: str,
        user_role: Optional[str],
        payload: MilestoneUpdate,
    ) -> MilestoneResponse:
        """Update an existing milestone deliverable."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        client = cls.get_client()

        m_res = client.table("milestones").select("*").eq("id", milestone_id.strip()).eq("collaboration_id", collaboration_id.strip()).execute()
        if not m_res.data or len(m_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Milestone not found in this collaboration.",
            )
        current = m_res.data[0]

        update_fields: Dict[str, Any] = {}
        if payload.title is not None:
            update_fields["title"] = payload.title.strip()
        if payload.description is not None:
            update_fields["description"] = payload.description.strip()
        if payload.assigned_to is not None:
            update_fields["assigned_to"] = payload.assigned_to.strip() if payload.assigned_to else None
        if payload.due_date is not None:
            update_fields["due_date"] = str(payload.due_date)
        if payload.progress is not None:
            update_fields["progress"] = payload.progress
        if payload.status is not None:
            update_fields["status"] = payload.status.value

        # Calculate completed_at timestamp transitions
        new_status = update_fields.get("status", current.get("status"))
        new_progress = update_fields.get("progress", current.get("progress", 0))

        if (new_status == MilestoneStatus.completed.value or new_progress == 100) and not current.get("completed_at"):
            update_fields["completed_at"] = datetime.now(timezone.utc).isoformat()
        elif new_status != MilestoneStatus.completed.value and new_progress < 100 and current.get("completed_at"):
            update_fields["completed_at"] = None

        if update_fields:
            client.table("milestones").update(update_fields).eq("id", milestone_id.strip()).execute()

        # Fetch fresh record
        fresh = client.table("milestones").select("*").eq("id", milestone_id.strip()).execute()
        row = fresh.data[0]

        assigned_name = None
        if row.get("assigned_to"):
            p_res = client.table("profiles").select("full_name").eq("id", row["assigned_to"]).execute()
            if p_res.data:
                assigned_name = p_res.data[0].get("full_name")

        return MilestoneResponse(
            id=str(row["id"]),
            collaboration_id=str(row["collaboration_id"]),
            title=row["title"],
            description=row.get("description"),
            assigned_to=row.get("assigned_to"),
            assigned_to_name=assigned_name,
            due_date=str(row.get("due_date")) if row.get("due_date") else None,
            status=row.get("status", MilestoneStatus.pending.value),
            progress=int(row.get("progress") or 0),
            created_at=str(row.get("created_at")),
            completed_at=str(row.get("completed_at")) if row.get("completed_at") else None,
        )

    @classmethod
    def delete_milestone(
        cls,
        collaboration_id: str,
        milestone_id: str,
        user_id: str,
        user_role: Optional[str],
    ) -> Dict[str, Any]:
        """Delete a milestone deliverable."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        client = cls.get_client()

        m_res = client.table("milestones").select("id").eq("id", milestone_id.strip()).eq("collaboration_id", collaboration_id.strip()).execute()
        if not m_res.data or len(m_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Milestone not found.",
            )

        client.table("milestones").delete().eq("id", milestone_id.strip()).execute()
        return {"status": "success", "message": "Milestone deleted successfully."}

    # ==========================================================================
    # 4. PROJECT UPDATES
    # ==========================================================================

    @classmethod
    def get_project_updates(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
    ) -> List[ProjectUpdateResponse]:
        """Fetch chronological progress logs in a collaboration workspace."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        return cls._fetch_project_updates(collaboration_id)

    @classmethod
    def create_project_update(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
        payload: ProjectUpdateCreate,
    ) -> ProjectUpdateResponse:
        """Post a chronological progress check-in or milestone update."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        client = cls.get_client()

        # If milestone_id provided, verify it belongs to this collaboration
        if payload.milestone_id:
            m_res = client.table("milestones").select("id").eq("id", payload.milestone_id.strip()).eq("collaboration_id", collaboration_id.strip()).execute()
            if not m_res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Specified milestone does not exist in this collaboration.",
                )

        insert_data = {
            "collaboration_id": collaboration_id.strip(),
            "milestone_id": payload.milestone_id.strip() if payload.milestone_id else None,
            "author_id": user_id,
            "content": payload.content.strip(),
            "progress": payload.progress,
        }

        res = client.table("project_updates").insert(insert_data).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create project update record.",
            )
        row = res.data[0]

        # Author info
        p_res = client.table("profiles").select("full_name, role").eq("id", user_id).execute()
        author_name = p_res.data[0].get("full_name") if p_res.data else None
        author_role = p_res.data[0].get("role") if p_res.data else user_role

        # If progress was provided and tied to a milestone, sync milestone progress
        if payload.milestone_id and payload.progress is not None:
            try:
                cls.update_milestone(
                    collaboration_id=collaboration_id,
                    milestone_id=payload.milestone_id,
                    user_id=user_id,
                    user_role=user_role,
                    payload=MilestoneUpdate(progress=payload.progress),
                )
            except Exception as e:
                logger.warning("Could not sync milestone progress: %s", e)

        return ProjectUpdateResponse(
            id=str(row["id"]),
            collaboration_id=str(row["collaboration_id"]),
            milestone_id=row.get("milestone_id"),
            author_id=user_id,
            author_name=author_name,
            author_role=author_role,
            content=row["content"],
            progress=row.get("progress"),
            created_at=str(row.get("created_at")),
        )

    # ==========================================================================
    # 5. PROJECT OUTCOMES
    # ==========================================================================

    @classmethod
    def get_project_outcome(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
    ) -> Optional[ProjectOutcomeResponse]:
        """Fetch final verified deliverables & demonstrator outcomes."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        return cls._fetch_project_outcome(collaboration_id)

    @classmethod
    def save_project_outcome(
        cls,
        collaboration_id: str,
        user_id: str,
        user_role: Optional[str],
        payload: ProjectOutcomeCreate,
    ) -> ProjectOutcomeResponse:
        """Create or update final verified project outcome records."""
        cls.verify_collaboration_participant(collaboration_id, user_id, user_role)
        client = cls.get_client()

        existing = client.table("project_outcomes").select("id, completed_at").eq("collaboration_id", collaboration_id.strip()).execute()

        completed_at = None
        if payload.outcome_status in (OutcomeStatus.completed, OutcomeStatus.approved):
            completed_at = datetime.now(timezone.utc).isoformat()

        if existing.data and len(existing.data) > 0:
            # Update existing outcome
            outcome_id = existing.data[0]["id"]
            update_data: Dict[str, Any] = {
                "title": payload.title.strip(),
                "summary": payload.summary.strip() if payload.summary else None,
                "repository_url": payload.repository_url.strip() if payload.repository_url else None,
                "demo_url": payload.demo_url.strip() if payload.demo_url else None,
                "documentation_url": payload.documentation_url.strip() if payload.documentation_url else None,
                "technologies": payload.technologies,
                "outcome_status": payload.outcome_status.value,
            }
            if completed_at or not existing.data[0].get("completed_at"):
                update_data["completed_at"] = completed_at

            res = client.table("project_outcomes").update(update_data).eq("id", outcome_id).execute()
            row = res.data[0]
        else:
            # Insert new outcome
            insert_data = {
                "collaboration_id": collaboration_id.strip(),
                "title": payload.title.strip(),
                "summary": payload.summary.strip() if payload.summary else None,
                "repository_url": payload.repository_url.strip() if payload.repository_url else None,
                "demo_url": payload.demo_url.strip() if payload.demo_url else None,
                "documentation_url": payload.documentation_url.strip() if payload.documentation_url else None,
                "technologies": payload.technologies,
                "outcome_status": payload.outcome_status.value,
                "completed_at": completed_at,
            }
            res = client.table("project_outcomes").insert(insert_data).execute()
            if not res.data or len(res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save project outcome record.",
                )
            row = res.data[0]

        # If outcome is marked completed, update collaboration status to completed
        if payload.outcome_status == OutcomeStatus.completed:
            try:
                client.table("collaborations").update({
                    "status": CollaborationStatus.completed.value,
                    "end_date": str(date.today()),
                }).eq("id", collaboration_id.strip()).execute()
            except Exception as e:
                logger.warning("Could not mark collaboration as completed: %s", e)

        return ProjectOutcomeResponse(
            id=str(row["id"]),
            collaboration_id=str(row["collaboration_id"]),
            title=row["title"],
            summary=row.get("summary"),
            repository_url=row.get("repository_url"),
            demo_url=row.get("demo_url"),
            documentation_url=row.get("documentation_url"),
            technologies=row.get("technologies"),
            outcome_status=row.get("outcome_status", OutcomeStatus.draft.value),
            completed_at=str(row.get("completed_at")) if row.get("completed_at") else None,
        )
