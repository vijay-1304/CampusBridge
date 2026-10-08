"""
Phase 7 Matching Engine Test Suite
CampusBridge — AI-Powered Academic-Industry Collaboration Platform

Verifies:
1. Pure calculation unit tests (Cases A - E, I)
2. Reasoning generation validation
3. API authentication & role security (Cases 4, 5, 6, 7)
4. Empty requirements handling (Case F)
5. Empty capabilities handling / Zero fake data (Case G)
6. Upsert deduplication behavior (Case H)
7. Sorting by overall_score descending (Case J)
8. Regression checks for existing health, student, and industry routes
"""

import sys
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.matching_service import (
    calculate_capability_score,
    calculate_overall_score,
    calculate_proficiency_fit,
    calculate_skill_score,
    generate_match_reasoning,
    MatchingService,
)


class TestPureMatchingAlgorithm(unittest.TestCase):
    """Unit tests for deterministic mathematical formulas and edge cases."""

    def test_case_a_proficiency_fit_equal(self):
        """Case A: College level equal to requirement -> fit = 1.0"""
        fit = calculate_proficiency_fit(required_level=4, college_level=4)
        self.assertEqual(fit, 1.0)

    def test_case_b_proficiency_fit_below(self):
        """Case B: College level below requirement -> fit = 0.5"""
        fit = calculate_proficiency_fit(required_level=4, college_level=2)
        self.assertEqual(fit, 0.5)

    def test_case_c_proficiency_fit_exceed(self):
        """Case C: College level exceeds requirement -> fit = 1.0 (capped)"""
        fit = calculate_proficiency_fit(required_level=4, college_level=5)
        self.assertEqual(fit, 1.0)

    def test_case_d_proficiency_fit_missing(self):
        """Case D: Missing college skill -> fit = 0.0"""
        fit_none = calculate_proficiency_fit(required_level=4, college_level=None)
        self.assertEqual(fit_none, 0.0)
        fit_zero = calculate_proficiency_fit(required_level=4, college_level=0)
        self.assertEqual(fit_zero, 0.0)

    def test_case_e_importance_weighting(self):
        """Case E: Importance weights correctly skew results."""
        # Requirement 1: weight 0.8, fit 1.0
        # Requirement 2: weight 0.2, fit 0.0
        evals = [
            {"proficiency_fit": 1.0, "importance_weight": 0.8, "has_skill": True},
            {"proficiency_fit": 0.0, "importance_weight": 0.2, "has_skill": False},
        ]
        skill_score = calculate_skill_score(evals)
        # Expected: (1.0 * 0.8 + 0.0 * 0.2) / 1.0 * 100 = 80.0
        self.assertEqual(skill_score, 80.0)

        cap_score = calculate_capability_score(evals)
        # Expected: (1.0 * 0.8 + 0.0 * 0.2) / 1.0 * 100 = 80.0
        self.assertEqual(cap_score, 80.0)

        overall = calculate_overall_score(skill_score, cap_score)
        # (80 * 0.70) + (80 * 0.30) = 80.0
        self.assertEqual(overall, 80.0)

        # Inverted weights: Requirement 1 weight 0.2, Requirement 2 weight 0.8
        evals_inverted = [
            {"proficiency_fit": 1.0, "importance_weight": 0.2, "has_skill": True},
            {"proficiency_fit": 0.0, "importance_weight": 0.8, "has_skill": False},
        ]
        skill_score_inv = calculate_skill_score(evals_inverted)
        # Expected: (1.0 * 0.2 + 0.0 * 0.8) / 1.0 * 100 = 20.0
        self.assertEqual(skill_score_inv, 20.0)

    def test_case_i_scores_remain_bounded_0_to_100(self):
        """Case I: Ensure scores strictly stay within [0, 100] across boundary cases."""
        # Extreme upper values
        upper_evals = [
            {"proficiency_fit": 2.0, "importance_weight": 1.0, "has_skill": True},
            {"proficiency_fit": 1.5, "importance_weight": 1.0, "has_skill": True},
        ]
        self.assertLessEqual(calculate_skill_score(upper_evals), 100.0)
        self.assertLessEqual(calculate_capability_score(upper_evals), 100.0)
        self.assertLessEqual(calculate_overall_score(150.0, 120.0), 100.0)

        # Extreme lower / empty values
        lower_evals = [
            {"proficiency_fit": 0.0, "importance_weight": 1.0, "has_skill": False},
        ]
        self.assertGreaterEqual(calculate_skill_score(lower_evals), 0.0)
        self.assertGreaterEqual(calculate_capability_score(lower_evals), 0.0)
        self.assertGreaterEqual(calculate_overall_score(-10.0, -5.0), 0.0)

        # Empty evaluations
        self.assertEqual(calculate_skill_score([]), 0.0)
        self.assertEqual(calculate_capability_score([]), 0.0)

    def test_reasoning_generation_scenarios(self):
        """Verify explainable reasoning generation on real data profiles."""
        # All meet/exceed
        all_covered = [
            {"skill_name": "Python", "required_level": 4, "college_level": 5, "has_skill": True, "proficiency_fit": 1.0},
            {"skill_name": "React", "required_level": 3, "college_level": 3, "has_skill": True, "proficiency_fit": 1.0},
        ]
        r1 = generate_match_reasoning(all_covered)
        self.assertIn("Strong match", r1)
        self.assertIn("Python", r1)
        self.assertIn("React", r1)

        # Partial with missing skill
        partial_missing = [
            {"skill_name": "Python", "required_level": 4, "college_level": 4, "has_skill": True, "proficiency_fit": 1.0},
            {"skill_name": "Machine Learning", "required_level": 4, "college_level": None, "has_skill": False, "proficiency_fit": 0.0},
        ]
        r2 = generate_match_reasoning(partial_missing)
        self.assertIn("Partial match", r2)
        self.assertIn("Machine Learning", r2)

        # None covered
        none_covered = [
            {"skill_name": "Cybersecurity", "required_level": 4, "college_level": None, "has_skill": False, "proficiency_fit": 0.0},
        ]
        r3 = generate_match_reasoning(none_covered)
        self.assertIn("Low match", r3)
        self.assertIn("Cybersecurity", r3)


class TestMatchingAPIEndpoints(unittest.TestCase):
    """Integration & security tests for FastAPI matching routes."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check_remains_functional(self):
        """Regression check: GET /health responds 200 with service status."""
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertIn("supabase", data)

    def test_unauthenticated_matching_rejected_401(self):
        """Check: Unauthenticated requests to matching endpoints receive 401."""
        resp_run = self.client.post("/api/v1/matching/challenges/some-uuid/run")
        self.assertEqual(resp_run.status_code, 401)

        resp_get = self.client.get("/api/v1/matching/challenges/some-uuid")
        self.assertEqual(resp_get.status_code, 401)

    def test_non_industry_role_rejected_403(self):
        """Check: Non-industry role (student, college) is denied with 403."""
        from app.dependencies import get_current_user
        mock_student_user = {
            "user": {"id": "student-123", "email": "student@example.com"},
            "profile": {"id": "student-123", "role": "student"},
            "role": "student",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_student_user
        try:
            resp = self.client.post(
                "/api/v1/matching/challenges/some-uuid/run",
                headers={"Authorization": "Bearer fake-token"},
            )
            self.assertEqual(resp.status_code, 403)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_unknown_challenge_returns_404(self):
        """Check: Matching for non-existent challenge returns 404."""
        from app.dependencies import get_current_user
        mock_industry_user = {
            "user": {"id": "ind-1", "email": "ind@example.com"},
            "profile": {"id": "ind-1", "role": "industry"},
            "role": "industry",
        }
        mock_sb_client = MagicMock()
        mock_sb_client.table().select().eq().execute.return_value.data = []

        app.dependency_overrides[get_current_user] = lambda: mock_industry_user
        try:
            with patch.object(MatchingService, "get_client", return_value=mock_sb_client):
                resp = self.client.post(
                    "/api/v1/matching/challenges/non-existent-id/run",
                    headers={"Authorization": "Bearer fake-token"},
                )
                self.assertEqual(resp.status_code, 404)
                self.assertIn("Challenge not found", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_another_industry_challenge_rejected_403(self):
        """Check: Attempting to run matching for a challenge owned by another industry returns 403."""
        from app.dependencies import get_current_user
        mock_industry_user = {
            "user": {"id": "attacker-ind-id", "email": "attacker@example.com"},
            "profile": {"id": "attacker-ind-id", "role": "industry"},
            "role": "industry",
        }
        mock_sb_client = MagicMock()
        mock_sb_client.table().select().eq().execute.return_value.data = [
            {"id": "chal-1", "industry_id": "legit-owner-id", "title": "Secret Project"}
        ]

        app.dependency_overrides[get_current_user] = lambda: mock_industry_user
        try:
            with patch.object(MatchingService, "get_client", return_value=mock_sb_client):
                resp = self.client.post(
                    "/api/v1/matching/challenges/chal-1/run",
                    headers={"Authorization": "Bearer fake-token"},
                )
                self.assertEqual(resp.status_code, 403)
                self.assertIn("do not own", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_case_f_challenge_without_requirements_returns_400(self):
        """Case F: Challenge with no requirements returns clean HTTP 400."""
        from app.dependencies import get_current_user
        mock_industry_user = {
            "user": {"id": "ind-1", "email": "ind@example.com"},
            "profile": {"id": "ind-1", "role": "industry"},
            "role": "industry",
        }
        mock_sb_client = MagicMock()
        mock_sb_client.table().select().eq().execute.side_effect = [
            MagicMock(data=[{"id": "chal-empty", "industry_id": "ind-1", "title": "Empty Requirements Challenge"}]),
            MagicMock(data=[]),  # challenge_requirements query
        ]

        app.dependency_overrides[get_current_user] = lambda: mock_industry_user
        try:
            with patch.object(MatchingService, "get_client", return_value=mock_sb_client):
                resp = self.client.post(
                    "/api/v1/matching/challenges/chal-empty/run",
                    headers={"Authorization": "Bearer fake-token"},
                )
                self.assertEqual(resp.status_code, 400)
                self.assertIn("no defined requirements", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_case_g_no_college_capabilities_returns_empty_results_no_fake_data(self):
        """Case G: If no college capabilities exist, returns empty matches list without fake data."""
        from app.dependencies import get_current_user
        mock_industry_user = {
            "user": {"id": "ind-1", "email": "ind@example.com"},
            "profile": {"id": "ind-1", "role": "industry"},
            "role": "industry",
        }
        mock_sb_client = MagicMock()
        mock_sb_client.table().select().eq().execute.side_effect = [
            MagicMock(data=[{"id": "chal-1", "industry_id": "ind-1", "title": "AI Analytics"}]),
            MagicMock(data=[{
                "skill_id": "skill-py",
                "required_level": 4,
                "importance_weight": 1.0,
                "skills": {"name": "Python", "category": "Programming"},
            }]),
        ]
        mock_sb_client.table().select().in_().execute.return_value = MagicMock(data=[])

        app.dependency_overrides[get_current_user] = lambda: mock_industry_user
        try:
            with patch.object(MatchingService, "get_client", return_value=mock_sb_client):
                resp = self.client.post(
                    "/api/v1/matching/challenges/chal-1/run",
                    headers={"Authorization": "Bearer fake-token"},
                )
                self.assertEqual(resp.status_code, 200)
                body = resp.json()
                self.assertEqual(body["challenge_id"], "chal-1")
                self.assertEqual(body["total_colleges_evaluated"], 0)
                self.assertEqual(body["matches"], [])
                self.assertIn("No colleges with matching capability data found", body["message"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_case_h_and_j_matching_run_upserts_and_sorts_descending(self):
        """
        Case H & Case J:
        - Upserts match records (updating existing without duplicates)
        - Sorts results descending by overall_score
        """
        from app.dependencies import get_current_user
        mock_industry_user = {
            "user": {"id": "ind-1", "email": "ind@example.com"},
            "profile": {"id": "ind-1", "role": "industry"},
            "role": "industry",
        }

        mock_sb_client = MagicMock()

        challenge_data = [{"id": "chal-1", "industry_id": "ind-1", "title": "Web Platform"}]

        reqs_data = [
            {"skill_id": "s-py", "required_level": 4, "importance_weight": 0.5, "skills": {"name": "Python"}},
            {"skill_id": "s-react", "required_level": 4, "importance_weight": 0.5, "skills": {"name": "React"}},
        ]

        cap_data = [
            {"id": "cap-1", "college_id": "col-A", "skill_id": "s-py", "proficiency_level": 4},
            {"id": "cap-2", "college_id": "col-A", "skill_id": "s-react", "proficiency_level": 4},
            {"id": "cap-3", "college_id": "col-B", "skill_id": "s-py", "proficiency_level": 2},
        ]

        colleges_data = [
            {"id": "col-A", "college_name": "Stanford Tech", "location": "CA"},
            {"id": "col-B", "college_name": "MIT Institute", "location": "MA"},
        ]

        existing_matches_data = [
            {"id": "existing-match-A", "college_id": "col-A", "status": "suggested", "created_at": "2026-10-01T00:00:00Z"}
        ]

        def table_mock_handler(table_name):
            t = MagicMock()
            if table_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(data=challenge_data)
            elif table_name == "challenge_requirements":
                t.select().eq().execute.return_value = MagicMock(data=reqs_data)
            elif table_name == "college_capabilities":
                t.select().in_().execute.return_value = MagicMock(data=cap_data)
            elif table_name == "colleges":
                t.select().in_().execute.return_value = MagicMock(data=colleges_data)
            elif table_name == "matches":
                t.select().eq().execute.return_value = MagicMock(data=existing_matches_data)
                t.insert().execute.return_value = MagicMock(data=[{"id": "new-match-B", "created_at": "2026-10-08T00:00:00Z"}])
                t.update().eq().execute.return_value = MagicMock(data=[{"id": "existing-match-A"}])
            return t

        mock_sb_client.table.side_effect = table_mock_handler

        app.dependency_overrides[get_current_user] = lambda: mock_industry_user
        try:
            with patch.object(MatchingService, "get_client", return_value=mock_sb_client):
                resp = self.client.post(
                    "/api/v1/matching/challenges/chal-1/run",
                    headers={"Authorization": "Bearer fake-token"},
                )
                self.assertEqual(resp.status_code, 200)
                data = resp.json()

                self.assertEqual(data["total_colleges_evaluated"], 2)
                matches = data["matches"]
                self.assertEqual(len(matches), 2)

                # Case J: Verify descending sort by overall_score
                self.assertGreater(matches[0]["overall_score"], matches[1]["overall_score"])

                # College A (Top rank)
                top = matches[0]
                self.assertEqual(top["college_id"], "col-A")
                self.assertEqual(top["match_id"], "existing-match-A")
                self.assertEqual(top["skill_score"], 100.0)
                self.assertEqual(top["capability_score"], 100.0)
                self.assertEqual(top["overall_score"], 100.0)
                self.assertIn("Strong match", top["reasoning"])

                # College B (Second rank)
                second = matches[1]
                self.assertEqual(second["college_id"], "col-B")
                self.assertEqual(second["match_id"], "new-match-B")
                self.assertEqual(second["skill_score"], 25.0)
                self.assertEqual(second["capability_score"], 50.0)
                self.assertEqual(second["overall_score"], 32.5)
                self.assertIn("Partial match", second["reasoning"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_challenge_matches_success(self):
        """Check: GET /api/v1/matching/challenges/{challenge_id} retrieves ranked matches."""
        from app.dependencies import get_current_user
        mock_industry_user = {
            "user": {"id": "ind-1", "email": "ind@example.com"},
            "profile": {"id": "ind-1", "role": "industry"},
            "role": "industry",
        }
        mock_sb_client = MagicMock()
        challenge_data = [{"id": "chal-1", "industry_id": "ind-1"}]
        matches_db_data = [
            {
                "id": "match-1",
                "challenge_id": "chal-1",
                "college_id": "col-1",
                "skill_score": 90.0,
                "infrastructure_score": 80.0,
                "overall_score": 87.0,
                "reasoning": "Strong match on Python and React.",
                "status": "suggested",
                "created_at": "2026-10-08T12:00:00Z",
                "colleges": {"id": "col-1", "college_name": "Tech University", "location": "NYC"},
            }
        ]

        def table_mock_handler(table_name):
            t = MagicMock()
            if table_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(data=challenge_data)
            elif table_name == "matches":
                t.select().eq().order().execute.return_value = MagicMock(data=matches_db_data)
            return t

        mock_sb_client.table.side_effect = table_mock_handler

        app.dependency_overrides[get_current_user] = lambda: mock_industry_user
        try:
            with patch.object(MatchingService, "get_client", return_value=mock_sb_client):
                resp = self.client.get(
                    "/api/v1/matching/challenges/chal-1",
                    headers={"Authorization": "Bearer fake-token"},
                )
                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertEqual(data["challenge_id"], "chal-1")
                self.assertEqual(data["total_matches"], 1)
                m = data["matches"][0]
                self.assertEqual(m["college_name"], "Tech University")
                self.assertEqual(m["overall_score"], 87.0)
                self.assertEqual(m["skill_score"], 90.0)
                self.assertEqual(m["capability_score"], 80.0)
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestRegressionEndpoints(unittest.TestCase):
    """Ensure completed phases are not broken or compromised."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_student_endpoints_require_auth(self):
        """Student endpoint /api/v1/students/me still requires authentication."""
        resp = self.client.get("/api/v1/students/me")
        self.assertEqual(resp.status_code, 401)

    def test_student_skills_catalog_requires_auth(self):
        """Student skills catalog still requires authentication."""
        resp = self.client.get("/api/v1/students/skills/catalog")
        self.assertEqual(resp.status_code, 401)

    def test_industry_challenges_require_auth(self):
        """Industry challenges endpoint still requires authentication."""
        resp = self.client.get("/api/v1/industry/challenges")
        self.assertEqual(resp.status_code, 401)


if __name__ == "__main__":
    unittest.main()
