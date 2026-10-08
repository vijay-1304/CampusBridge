import logging
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status

from app.schemas.matching import (
    ChallengeMatchesResponse,
    MatchItem,
    MatchingRunResponse,
    MatchStatus,
)
from app.services.supabase_service import (
    get_supabase_admin_client,
    get_supabase_client,
    has_supabase_admin_key,
)

logger = logging.getLogger(__name__)


# ==============================================================================
# PURE DETERMINISTIC SCORING FUNCTIONS
# ==============================================================================

def calculate_proficiency_fit(required_level: int, college_level: Optional[int]) -> float:
    """
    Calculate proficiency fit ratio for a single requirement:
    - College has no capability: 0.0
    - College level equal or above required: 1.0
    - College level below required: college_level / required_level

    Example:
      Required 4, College 4 -> 1.0
      Required 4, College 2 -> 0.5
      Required 4, College 5 -> 1.0
      Required 4, College None -> 0.0
    """
    if college_level is None or college_level <= 0:
        return 0.0
    if required_level <= 0:
        required_level = 1
    return min(float(college_level) / float(required_level), 1.0)


def calculate_skill_score(evaluations: List[Dict[str, Any]]) -> float:
    """
    Calculate weighted skill score (0-100) across all requirements:
      weighted_sum = SUM(proficiency_fit * importance_weight)
      weight_total = SUM(importance_weight)
      skill_score = (weighted_sum / weight_total) * 100
    """
    if not evaluations:
        return 0.0

    weight_total = sum(e["importance_weight"] for e in evaluations)
    if weight_total <= 0:
        # Fallback to unweighted average if all weights are zero
        weight_total = float(len(evaluations))
        weighted_sum = sum(e["proficiency_fit"] for e in evaluations)
    else:
        weighted_sum = sum(e["proficiency_fit"] * e["importance_weight"] for e in evaluations)

    score = (weighted_sum / weight_total) * 100.0
    return round(max(0.0, min(100.0, score)), 2)


def calculate_capability_score(evaluations: List[Dict[str, Any]]) -> float:
    """
    Calculate capability coverage score (0-100) representing how many
    required skills the college actually possesses:
      coverage = 1.0 if college has the skill else 0.0
      capability_score = (SUM(coverage * importance_weight) / SUM(importance_weight)) * 100
    """
    if not evaluations:
        return 0.0

    weight_total = sum(e["importance_weight"] for e in evaluations)
    if weight_total <= 0:
        weight_total = float(len(evaluations))
        coverage_sum = sum(1.0 if e["has_skill"] else 0.0 for e in evaluations)
    else:
        coverage_sum = sum(
            (1.0 if e["has_skill"] else 0.0) * e["importance_weight"]
            for e in evaluations
        )

    score = (coverage_sum / weight_total) * 100.0
    return round(max(0.0, min(100.0, score)), 2)


def calculate_overall_score(skill_score: float, capability_score: float) -> float:
    """
    Deterministic Overall Match Affinity Formula:
      overall_score = (skill_score * 0.70) + (capability_score * 0.30)
    Rounded to 2 decimal places and bounded between 0 and 100.
    """
    score = (skill_score * 0.70) + (capability_score * 0.30)
    return round(max(0.0, min(100.0, score)), 2)


def generate_match_reasoning(evaluations: List[Dict[str, Any]]) -> str:
    """
    Generate an explainable, fact-based textual summary derived strictly from
    the evaluated capability data vs challenge requirements.
    Mentions:
    - matched skills meeting or exceeding levels
    - matched skills below requested levels
    - missing skills not listed in capability profile
    """
    if not evaluations:
        return "No requirements were specified to evaluate this match."

    exceeds: List[str] = []
    meets: List[str] = []
    below: List[str] = []
    missing: List[str] = []

    for e in evaluations:
        s_name = e["skill_name"]
        req_lvl = e["required_level"]
        c_lvl = e.get("college_level")

        if not e["has_skill"] or c_lvl is None or c_lvl <= 0:
            missing.append(s_name)
        elif c_lvl > req_lvl:
            exceeds.append(f"{s_name} (Level {c_lvl}/{req_lvl})")
        elif c_lvl == req_lvl:
            meets.append(f"{s_name} (Level {c_lvl}/{req_lvl})")
        else:
            below.append(f"{s_name} (Level {c_lvl}/{req_lvl})")

    total_reqs = len(evaluations)
    covered_count = len(exceeds) + len(meets) + len(below)

    # Case 1: College covers no required skills
    if covered_count == 0:
        missing_str = ", ".join(missing)
        return (
            f"Low match. The college capability profile currently does not cover "
            f"any of the required skills ({missing_str}) for this challenge."
        )

    # Case 2: College covers all skills and meets or exceeds every level
    if len(missing) == 0 and len(below) == 0:
        strong_items = exceeds + meets
        details_str = ", ".join(strong_items)
        if len(exceeds) > 0 and len(meets) == 0:
            return (
                f"Strong match. The college covers all {total_reqs} required skills "
                f"and exceeds the requested proficiency levels ({details_str})."
            )
        return (
            f"Strong match. The college covers all {total_reqs} required skills "
            f"and meets or exceeds the requested proficiency levels ({details_str})."
        )

    # Case 3: College covers all skills, but some are below requested proficiency
    if len(missing) == 0 and len(below) > 0:
        strong_items = exceeds + meets
        below_str = ", ".join(below)
        if strong_items:
            strong_str = ", ".join(strong_items)
            return (
                f"Strong match with minor proficiency gaps. The college has strong capability in "
                f"{strong_str}, while {below_str} is available but below the requested proficiency level."
            )
        return (
            f"Moderate match. The college possesses all required skills, but proficiency in "
            f"{below_str} is below the requested level."
        )

    # Case 4: Partial coverage (some missing skills exist)
    strong_items = exceeds + meets
    missing_str = ", ".join(missing)

    if strong_items and not below:
        strong_str = ", ".join(strong_items)
        return (
            f"Partial match. The college has strong capability in {strong_str}, but "
            f"{missing_str} is not currently listed in its capability profile."
        )

    if strong_items and below:
        strong_str = ", ".join(strong_items)
        below_str = ", ".join(below)
        return (
            f"Partial match. The college demonstrates capabilities in {strong_str} "
            f"(with {below_str} below requested level), but lacks {missing_str}."
        )

    # Only below and missing
    below_str = ", ".join(below)
    return (
        f"Partial match. The college partially covers {below_str} (below requested level), "
        f"but lacks {missing_str} in its capability profile."
    )


# ==============================================================================
# MATCHING SERVICE CLASS
# ==============================================================================

class MatchingService:
    """
    Deterministic Academic-Industry Collaboration Matching Service.
    Evaluates real institutional capabilities against challenge requirements
    without artificial or hallucinated scores.
    """

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
    def run_matching_for_challenge(
        cls,
        challenge_id: str,
        industry_id: str,
    ) -> MatchingRunResponse:
        """
        Execute deterministic matching for an industry challenge.
        - Verifies challenge exists and caller is owner
        - Retrieves real challenge requirements
        - Identifies eligible colleges with relevant capabilities
        - Computes Skill, Capability, and Overall affinity scores
        - Generates explainable reasoning
        - Upserts results into matches table
        - Returns ranked matches sorted by overall_score DESC
        """
        client = cls.get_client()

        # 1. Verify Challenge existence & ownership
        c_res = client.table("challenges").select("id, industry_id, title").eq("id", challenge_id.strip()).execute()
        if not c_res.data or len(c_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found.",
            )

        challenge_row = c_res.data[0]
        if str(challenge_row["industry_id"]) != industry_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you do not own this challenge.",
            )

        # 2. Retrieve challenge requirements joined with skills catalog
        req_res = (
            client.table("challenge_requirements")
            .select("*, skills(id, name, category)")
            .eq("challenge_id", challenge_id.strip())
            .execute()
        )
        requirements_data = req_res.data or []

        if len(requirements_data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge has no defined requirements. Please analyze the challenge or add skill requirements before running matching.",
            )

        # Normalizing requirements structure
        parsed_requirements: List[Dict[str, Any]] = []
        for r in requirements_data:
            skill_info = r.get("skills") or {}
            parsed_requirements.append({
                "skill_id": str(r["skill_id"]),
                "skill_name": skill_info.get("name", "Unknown Skill"),
                "required_level": int(r.get("required_level", 3)),
                "importance_weight": float(r.get("importance_weight", 1.0)),
            })

        required_skill_ids = [r["skill_id"] for r in parsed_requirements]

        # 3. Retrieve eligible colleges with relevant capabilities
        # Query college_capabilities for any of the required skills
        cap_res = (
            client.table("college_capabilities")
            .select("id, college_id, skill_id, proficiency_level, faculty_count, infrastructure_details")
            .in_("skill_id", required_skill_ids)
            .execute()
        )
        capabilities_rows = cap_res.data or []

        if not capabilities_rows:
            # Honest empty response: no colleges have capabilities for these skills
            return MatchingRunResponse(
                challenge_id=challenge_id,
                total_colleges_evaluated=0,
                matches=[],
                message="No colleges with matching capability data found for this challenge.",
            )

        # Group capabilities by college_id
        caps_by_college: Dict[str, List[Dict[str, Any]]] = {}
        for row in capabilities_rows:
            col_id = str(row["college_id"])
            caps_by_college.setdefault(col_id, []).append(row)

        eligible_college_ids = list(caps_by_college.keys())

        # Retrieve college metadata
        colleges_res = (
            client.table("colleges")
            .select("id, college_name, location")
            .in_("id", eligible_college_ids)
            .execute()
        )
        colleges_by_id: Dict[str, Dict[str, Any]] = {
            str(c["id"]): c for c in (colleges_res.data or [])
        }

        # 4. Evaluate each eligible college across ALL challenge requirements
        evaluated_results: List[Dict[str, Any]] = []

        for college_id, college_caps in caps_by_college.items():
            college_meta = colleges_by_id.get(college_id, {})
            college_name = college_meta.get("college_name", "Academic Partner")
            college_location = college_meta.get("location")

            # Map college capability by skill_id
            college_skill_map = {str(c["skill_id"]): c for c in college_caps}

            college_evaluations: List[Dict[str, Any]] = []
            for req in parsed_requirements:
                s_id = req["skill_id"]
                req_lvl = req["required_level"]
                weight = req["importance_weight"]
                s_name = req["skill_name"]

                cap = college_skill_map.get(s_id)
                if cap is not None and cap.get("proficiency_level") is not None:
                    c_lvl = int(cap["proficiency_level"])
                    fit = calculate_proficiency_fit(req_lvl, c_lvl)
                    has_skill = True
                else:
                    c_lvl = None
                    fit = 0.0
                    has_skill = False

                college_evaluations.append({
                    "skill_id": s_id,
                    "skill_name": s_name,
                    "required_level": req_lvl,
                    "college_level": c_lvl,
                    "importance_weight": weight,
                    "proficiency_fit": fit,
                    "has_skill": has_skill,
                })

            # Calculate deterministic scores
            skill_score = calculate_skill_score(college_evaluations)
            capability_score = calculate_capability_score(college_evaluations)
            overall_score = calculate_overall_score(skill_score, capability_score)
            reasoning = generate_match_reasoning(college_evaluations)

            evaluated_results.append({
                "college_id": college_id,
                "college_name": college_name,
                "college_location": college_location,
                "skill_score": skill_score,
                "capability_score": capability_score,
                "overall_score": overall_score,
                "reasoning": reasoning,
            })

        # 5. Upsert matches into database
        # Check existing matches for this challenge to prevent duplicate rows (Case H)
        existing_matches_res = (
            client.table("matches")
            .select("id, college_id, status, created_at")
            .eq("challenge_id", challenge_id)
            .execute()
        )
        existing_matches_map = {
            str(m["college_id"]): m for m in (existing_matches_res.data or [])
        }

        output_matches: List[MatchItem] = []

        for item in evaluated_results:
            col_id = item["college_id"]
            existing = existing_matches_map.get(col_id)

            if existing:
                match_id = str(existing["id"])
                match_status = existing.get("status") or MatchStatus.suggested.value
                created_at = existing.get("created_at")

                # Update existing match record
                update_payload = {
                    "skill_score": item["skill_score"],
                    "infrastructure_score": item["capability_score"],  # Persists capability score within schema constraints
                    "overall_score": item["overall_score"],
                    "reasoning": item["reasoning"],
                }
                client.table("matches").update(update_payload).eq("id", match_id).execute()
            else:
                match_status = MatchStatus.suggested.value
                insert_payload = {
                    "challenge_id": challenge_id,
                    "college_id": col_id,
                    "skill_score": item["skill_score"],
                    "infrastructure_score": item["capability_score"],  # Persists capability score within schema constraints
                    "overall_score": item["overall_score"],
                    "reasoning": item["reasoning"],
                    "status": match_status,
                }
                ins_res = client.table("matches").insert(insert_payload).execute()
                if ins_res.data and len(ins_res.data) > 0:
                    created_row = ins_res.data[0]
                    match_id = str(created_row["id"])
                    created_at = str(created_row.get("created_at"))
                else:
                    match_id = f"m_{col_id[:8]}"
                    created_at = None

            output_matches.append(
                MatchItem(
                    match_id=match_id,
                    challenge_id=challenge_id,
                    college_id=col_id,
                    college_name=item["college_name"],
                    college_location=item["college_location"],
                    skill_score=item["skill_score"],
                    capability_score=item["capability_score"],
                    overall_score=item["overall_score"],
                    reasoning=item["reasoning"],
                    status=match_status,
                    created_at=created_at,
                )
            )

        # 6. Sort results by overall_score DESC (then skill_score DESC)
        output_matches.sort(key=lambda m: (m.overall_score, m.skill_score), reverse=True)

        return MatchingRunResponse(
            challenge_id=challenge_id,
            total_colleges_evaluated=len(output_matches),
            matches=output_matches,
            message="Matching completed successfully.",
        )

    @classmethod
    def get_matches_for_challenge(
        cls,
        challenge_id: str,
        industry_id: str,
    ) -> ChallengeMatchesResponse:
        """
        Retrieve persisted matches for a challenge with ownership validation.
        Sorted by overall_score DESC.
        """
        client = cls.get_client()

        # 1. Verify Challenge existence & ownership
        c_res = client.table("challenges").select("id, industry_id").eq("id", challenge_id.strip()).execute()
        if not c_res.data or len(c_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found.",
            )

        challenge_row = c_res.data[0]
        if str(challenge_row["industry_id"]) != industry_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you do not own this challenge.",
            )

        # 2. Query matches joined with colleges
        res = (
            client.table("matches")
            .select("*, colleges(id, college_name, location)")
            .eq("challenge_id", challenge_id.strip())
            .order("overall_score", desc=True)
            .execute()
        )
        rows = res.data or []

        matches: List[MatchItem] = []
        for r in rows:
            col_info = r.get("colleges") or {}
            m_id = str(r["id"])

            s_score = float(r.get("skill_score") or 0.0)
            o_score = float(r.get("overall_score") or 0.0)

            # Retrieve persisted capability score from infrastructure_score or compute from formula
            if r.get("infrastructure_score") is not None:
                c_score = float(r["infrastructure_score"])
            else:
                # overall_score = skill_score * 0.70 + capability_score * 0.30
                # capability_score = (overall_score - skill_score * 0.70) / 0.30
                c_score = round(max(0.0, min(100.0, (o_score - s_score * 0.70) / 0.30)), 2)

            matches.append(
                MatchItem(
                    match_id=m_id,
                    challenge_id=str(r["challenge_id"]),
                    college_id=str(r["college_id"]),
                    college_name=col_info.get("college_name") or "Academic Partner",
                    college_location=col_info.get("location"),
                    skill_score=s_score,
                    capability_score=c_score,
                    overall_score=o_score,
                    reasoning=r.get("reasoning") or "Evaluated academic collaboration match.",
                    status=r.get("status") or MatchStatus.suggested.value,
                    created_at=str(r.get("created_at")) if r.get("created_at") else None,
                )
            )

        # Ensure sorted descending
        matches.sort(key=lambda m: (m.overall_score, m.skill_score), reverse=True)

        return ChallengeMatchesResponse(
            challenge_id=challenge_id,
            total_matches=len(matches),
            matches=matches,
        )
