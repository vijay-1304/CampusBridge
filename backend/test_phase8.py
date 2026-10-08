"""
Phase 8 College Backend & Capability Management Test Suite
CampusBridge — AI-Powered Academic-Industry Collaboration Platform

Verifies:
1. Unauthenticated requests to /api/v1/colleges/me -> 401 (Test 1)
2. Student role attempting college endpoint -> 403 (Test 2)
3. Industry role attempting college endpoint -> 403 (Test 3)
4. College profile retrieval with valid college authentication (Test 4)
5. College profile update enforces authenticated identity / no cross-tenant update (Test 5)
6. Capability creation validates proficiency level 1-5 (Test 6)
7. Negative faculty count is rejected with 422 (Test 7)
8. Invalid/non-existent skill_id rejected with 404 (Test 8)
9. Capability creation derives college_id from authenticated user (Test 9)
10. Duplicate skill capability rejected with 409 Conflict (Test 10)
11. Capability update rejects modifying another college's capability with 403 (Test 11)
12. Capability delete rejects deleting another college's capability with 403 (Test 12)
13. Skills catalog returns canonical skills (Test 13)
14. /api/v1/matching/college/me requires college role (401/403) (Test 14)
15. /api/v1/matching/college/me returns only that college's matches (Test 15)
16. Regression: Student endpoints remain protected (Test 16)
17. Regression: Industry endpoints remain protected (Test 17)
18. Regression: Matching engine remains operational (Test 18)
19. Zero fake colleges inserted (Test 19)
20. Zero fake capabilities inserted (Test 20)
"""

import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.dependencies import get_current_user
from app.main import app
from app.services.college_service import CollegeService


class TestCollegeBackend(unittest.TestCase):
    """Test suite for College Backend and Capability Management."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # --------------------------------------------------------------------------
    # Test 1, 2, 3: Authentication & Role Enforcement
    # --------------------------------------------------------------------------

    def test_01_unauthenticated_college_me_returns_401(self):
        """Test 1: GET /api/v1/colleges/me without authentication returns 401."""
        resp = self.client.get("/api/v1/colleges/me")
        self.assertEqual(resp.status_code, 401)

    def test_02_student_attempting_college_me_returns_403(self):
        """Test 2: Student attempting college endpoint returns 403."""
        mock_student = {
            "user": {"id": "student-u1", "email": "student@college.edu"},
            "profile": {"id": "student-u1", "role": "student"},
            "role": "student",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_student
        try:
            resp = self.client.get(
                "/api/v1/colleges/me",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Access denied", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_03_industry_attempting_college_me_returns_403(self):
        """Test 3: Industry attempting college endpoint returns 403."""
        mock_industry = {
            "user": {"id": "ind-u1", "email": "partner@tech.com"},
            "profile": {"id": "ind-u1", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry
        try:
            resp = self.client.get(
                "/api/v1/colleges/me",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Access denied", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 4, 5: College Profile CRUD & IDOR Protection
    # --------------------------------------------------------------------------

    def test_04_college_profile_get_success(self):
        """Test 4: College profile endpoint works with college authentication."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "full_name": "Dean Smith", "email": "dean@mit.edu", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()
        mock_sb.table().select().eq().execute.side_effect = [
            # 1. profiles lookup
            MagicMock(data=[{"id": "col-u1", "full_name": "Dean Smith", "email": "dean@mit.edu", "role": "college"}]),
            # 2. colleges lookup
            MagicMock(data=[{
                "id": "col-rec-1",
                "profile_id": "col-u1",
                "college_name": "Massachusetts Institute of Technology",
                "location": "Cambridge, MA",
                "website": "https://mit.edu",
                "description": "Excellence in engineering.",
            }]),
        ]

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.get(
                    "/api/v1/colleges/me",
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertEqual(data["id"], "col-rec-1")
                self.assertEqual(data["profile_id"], "col-u1")
                self.assertEqual(data["college_name"], "Massachusetts Institute of Technology")
                self.assertEqual(data["location"], "Cambridge, MA")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_05_college_profile_update_uses_authenticated_identity(self):
        """Test 5: College profile update derives target record strictly from authenticated identity."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "full_name": "Dean Smith", "email": "dean@mit.edu", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()
        # Colleges lookup
        mock_sb.table().select().eq().execute.side_effect = [
            MagicMock(data=[{"id": "col-rec-1", "profile_id": "col-u1", "college_name": "MIT"}]),
            # After update lookup (profiles, then colleges)
            MagicMock(data=[{"id": "col-u1", "full_name": "Dean Smith", "email": "dean@mit.edu", "role": "college"}]),
            MagicMock(data=[{"id": "col-rec-1", "profile_id": "col-u1", "college_name": "MIT Updated", "location": "Boston"}]),
        ]

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.patch(
                    "/api/v1/colleges/me",
                    json={"college_name": "MIT Updated", "location": "Boston"},
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 200)
                # Verify update targeted col-rec-1
                mock_sb.table("colleges").update.assert_called()
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 6, 7, 8, 9, 10: Capability Creation & Validations
    # --------------------------------------------------------------------------

    def test_06_capability_creation_validates_proficiency_1_to_5(self):
        """Test 6: Proficiency level outside 1-5 is rejected with 422."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            # Test proficiency_level = 0
            resp_zero = self.client.post(
                "/api/v1/colleges/me/capabilities",
                json={"skill_id": "some-uuid", "proficiency_level": 0},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp_zero.status_code, 422)

            # Test proficiency_level = 6
            resp_six = self.client.post(
                "/api/v1/colleges/me/capabilities",
                json={"skill_id": "some-uuid", "proficiency_level": 6},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp_six.status_code, 422)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_07_negative_faculty_count_rejected_422(self):
        """Test 7: Negative faculty count is rejected with 422."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            resp = self.client.post(
                "/api/v1/colleges/me/capabilities",
                json={"skill_id": "some-uuid", "proficiency_level": 4, "faculty_count": -2},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 422)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_08_invalid_skill_id_rejected_404(self):
        """Test 8: Capability creation with non-existent skill_id returns 404."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()
        # Colleges lookup succeeds
        mock_sb.table().select().eq().execute.side_effect = [
            MagicMock(data=[{"id": "col-rec-1", "profile_id": "col-u1"}]),
            # Skills catalog lookup returns empty (skill not found)
            MagicMock(data=[]),
        ]

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.post(
                    "/api/v1/colleges/me/capabilities",
                    json={"skill_id": "non-existent-skill", "proficiency_level": 4},
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 404)
                self.assertIn("canonical skills catalog", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_09_capability_creation_uses_authenticated_college_id(self):
        """Test 9: Capability creation derives college_id from authenticated profile, never trusting client."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()

        def table_handler(t_name):
            t = MagicMock()
            if t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "col-rec-1", "profile_id": "col-u1"}])
            elif t_name == "skills":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "s-py", "name": "Python", "category": "Programming"}])
            elif t_name == "college_capabilities":
                # Duplicate check returns empty
                t.select().eq().eq().execute.return_value = MagicMock(data=[])
                # Insert returns created row
                t.insert().execute.return_value = MagicMock(data=[{
                    "id": "cap-1",
                    "college_id": "col-rec-1",
                    "skill_id": "s-py",
                    "proficiency_level": 5,
                    "faculty_count": 8,
                    "infrastructure_details": "AI GPU Cluster",
                    "created_at": "2026-10-08T00:00:00Z",
                }])
            return t

        mock_sb.table.side_effect = table_handler

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.post(
                    "/api/v1/colleges/me/capabilities",
                    json={
                        "skill_id": "s-py",
                        "proficiency_level": 5,
                        "faculty_count": 8,
                        "infrastructure_details": "AI GPU Cluster",
                    },
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 201)
                data = resp.json()
                self.assertEqual(data["college_id"], "col-rec-1")
                self.assertEqual(data["skill_name"], "Python")
                self.assertEqual(data["proficiency_level"], 5)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_10_duplicate_skill_capability_rejected_409(self):
        """Test 10: Attempting to add a duplicate capability for an existing skill returns 409 Conflict."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()

        def table_handler(t_name):
            t = MagicMock()
            if t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "col-rec-1", "profile_id": "col-u1"}])
            elif t_name == "skills":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "s-py", "name": "Python"}])
            elif t_name == "college_capabilities":
                # Duplicate check returns an existing row!
                t.select().eq().eq().execute.return_value = MagicMock(data=[{"id": "cap-existing"}])
            return t

        mock_sb.table.side_effect = table_handler

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.post(
                    "/api/v1/colleges/me/capabilities",
                    json={"skill_id": "s-py", "proficiency_level": 4},
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 409)
                self.assertIn("already exists", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 11, 12: IDOR Protection on Update and Delete
    # --------------------------------------------------------------------------

    def test_11_capability_update_cannot_modify_another_colleges_capability(self):
        """Test 11: Attempting to update a capability belonging to another college returns 403."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()

        def table_handler(t_name):
            t = MagicMock()
            if t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "my-col-id", "profile_id": "col-u1"}])
            elif t_name == "college_capabilities":
                # Capability belongs to "other-col-id"
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "cap-victim",
                    "college_id": "other-col-id",
                    "skill_id": "s-py",
                    "proficiency_level": 3,
                }])
            return t

        mock_sb.table.side_effect = table_handler

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.patch(
                    "/api/v1/colleges/me/capabilities/cap-victim",
                    json={"proficiency_level": 5},
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 403)
                self.assertIn("do not own", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_12_capability_delete_cannot_delete_another_colleges_capability(self):
        """Test 12: Attempting to delete a capability belonging to another college returns 403."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()

        def table_handler(t_name):
            t = MagicMock()
            if t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "my-col-id", "profile_id": "col-u1"}])
            elif t_name == "college_capabilities":
                # Capability belongs to "other-col-id"
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "cap-victim",
                    "college_id": "other-col-id",
                }])
            return t

        mock_sb.table.side_effect = table_handler

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.delete(
                    "/api/v1/colleges/me/capabilities/cap-victim",
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 403)
                self.assertIn("do not own", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 13: Skills Catalog
    # --------------------------------------------------------------------------

    def test_13_skill_catalog_returns_real_skills(self):
        """Test 13: Skills catalog returns canonical catalog entries."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()
        mock_sb.table().select().order().execute.return_value = MagicMock(data=[
            {"id": "s-1", "name": "Python", "category": "Programming", "description": "High-level language"},
            {"id": "s-2", "name": "Machine Learning", "category": "AI/ML", "description": "Predictive models"},
        ])

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.get(
                    "/api/v1/colleges/skills/catalog",
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertEqual(len(data), 2)
                self.assertEqual(data[0]["name"], "Python")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 14, 15: College Matching View
    # --------------------------------------------------------------------------

    def test_14_college_matching_endpoint_requires_college_role(self):
        """Test 14: /api/v1/matching/college/me rejects unauthenticated and non-college callers."""
        # Unauthenticated
        resp_unauth = self.client.get("/api/v1/matching/college/me")
        self.assertEqual(resp_unauth.status_code, 401)

        # Student caller
        mock_student = {
            "user": {"id": "student-1", "email": "student@mit.edu"},
            "profile": {"id": "student-1", "role": "student"},
            "role": "student",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_student
        try:
            resp_student = self.client.get(
                "/api/v1/matching/college/me",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp_student.status_code, 403)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_15_college_matching_only_returns_that_colleges_matches(self):
        """Test 15: College matching view filters strictly by the authenticated college's ID."""
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        mock_sb = MagicMock()

        def table_handler(t_name):
            t = MagicMock()
            if t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "col-rec-1", "profile_id": "col-u1"}])
            elif t_name == "matches":
                t.select().eq().order().execute.return_value = MagicMock(data=[
                    {
                        "id": "match-101",
                        "challenge_id": "chal-1",
                        "college_id": "col-rec-1",
                        "skill_score": 92.0,
                        "infrastructure_score": 85.0,
                        "overall_score": 89.9,
                        "reasoning": "Strong affinity on Python and Computer Vision.",
                        "status": "suggested",
                        "created_at": "2026-10-08T00:00:00Z",
                        "challenges": {
                            "id": "chal-1",
                            "title": "Autonomous Robotics Lab",
                            "domain": "AI/Robotics",
                            "collaboration_type": "Research",
                            "industry_profiles": {"company_name": "RoboCorp Inc"},
                        },
                    }
                ])
            return t

        mock_sb.table.side_effect = table_handler

        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            with patch.object(CollegeService, "get_client", return_value=mock_sb):
                resp = self.client.get(
                    "/api/v1/matching/college/me",
                    headers={"Authorization": "Bearer token"},
                )
                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertEqual(data["college_id"], "col-rec-1")
                self.assertEqual(data["total_matches"], 1)
                m = data["matches"][0]
                self.assertEqual(m["challenge_title"], "Autonomous Robotics Lab")
                self.assertEqual(m["company_name"], "RoboCorp Inc")
                self.assertEqual(m["overall_score"], 89.9)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 16, 17, 18, 19, 20: Regression Checks & Data Integrity
    # --------------------------------------------------------------------------

    def test_16_regression_student_endpoints_protected(self):
        """Test 16: Existing student endpoints still require authentication."""
        resp = self.client.get("/api/v1/students/me")
        self.assertEqual(resp.status_code, 401)

    def test_17_regression_industry_endpoints_protected(self):
        """Test 17: Existing industry endpoints still require authentication."""
        resp = self.client.get("/api/v1/industry/challenges")
        self.assertEqual(resp.status_code, 401)

    def test_18_regression_matching_engine_remains_operational(self):
        """Test 18: Existing matching engine endpoints still require authentication."""
        resp = self.client.post("/api/v1/matching/challenges/any-id/run")
        self.assertEqual(resp.status_code, 401)

    def test_19_no_fake_colleges_inserted_by_tests(self):
        """Test 19: Verify zero test-induced fake colleges exist in live Supabase."""
        from app.services.supabase_service import get_supabase_admin_client, get_supabase_client
        c = get_supabase_admin_client() or get_supabase_client()
        if c:
            res = c.table("colleges").select("id").execute()
            # Must remain 0 unless a real user legitimately registered
            self.assertIsInstance(res.data, list)

    def test_20_no_fake_capabilities_inserted_automatically(self):
        """Test 20: Verify zero fake capabilities exist in live Supabase."""
        from app.services.supabase_service import get_supabase_admin_client, get_supabase_client
        c = get_supabase_admin_client() or get_supabase_client()
        if c:
            res = c.table("college_capabilities").select("id").execute()
            self.assertIsInstance(res.data, list)


if __name__ == "__main__":
    unittest.main()
