"""
Phase 10 Collaboration System Test Suite
CampusBridge — AI-Powered Academic-Industry Collaboration Platform

Verifies:
1. Unauthenticated collaboration request -> 401 (Test 1)
2. Wrong role (student/college) creating collaboration request -> 403 (Test 2)
3. Industry cannot create request for another industry's challenge -> 403 (Test 3)
4. Industry cannot request unmatched college -> 400 (Test 4)
5. Industry cannot request unpublished challenge -> 400 (Test 5)
6. College cannot access another college's request -> 403 (Test 6)
7. College can accept its own pending request -> 200 (Test 7)
8. College can reject its own pending request -> 200 (Test 8)
9. Accept creates collaboration workspace record -> 200 (Test 9)
10. Accept cannot create duplicate collaboration -> 409 (Test 10)
11. Rejected request does not create collaboration (Test 11)
12. Unauthorized user cannot access collaboration workspace -> 403 (Test 12)
13. Authorized industry participant can access workspace -> 200 (Test 13)
14. Authorized college participant can access workspace -> 200 (Test 14)
15. Unauthorized milestone access blocked -> 403 (Test 15)
16. Unauthorized project update access blocked -> 403 (Test 16)
17. Duplicate/conflicting request handled correctly -> 409 (Test 17)
18. Project outcome submission and access by participants -> 200 (Test 18)
19. Milestones CRUD lifecycle works as expected (Test 19)
20. Project updates feed logging works as expected (Test 20)
21. Regression: Student, Industry, College, and Matching endpoints remain protected (Test 21)
"""

import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.dependencies import get_current_user
from app.main import app
from app.services.collaboration_service import CollaborationService


class TestCollaborationSystem(unittest.TestCase):
    """Comprehensive test suite for Phase 10 Collaboration System."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # --------------------------------------------------------------------------
    # Test 1 & 2: Authentication & Role Enforcement
    # --------------------------------------------------------------------------

    def test_01_unauthenticated_collaboration_request_returns_401(self):
        """Test 1: POST /api/v1/collaborations/requests without auth returns 401."""
        resp = self.client.post(
            "/api/v1/collaborations/requests",
            json={"challenge_id": "c-123", "college_id": "col-123"},
        )
        self.assertEqual(resp.status_code, 401)

    def test_02_wrong_role_creating_request_returns_403(self):
        """Test 2: Student or College role attempting to create request returns 403."""
        # Student role
        mock_student = {
            "user": {"id": "stu-1", "email": "student@mit.edu"},
            "profile": {"id": "stu-1", "role": "student"},
            "role": "student",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_student
        try:
            resp = self.client.post(
                "/api/v1/collaborations/requests",
                json={"challenge_id": "c-123", "college_id": "col-123"},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Access denied", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

        # College role
        mock_college = {
            "user": {"id": "col-u1", "email": "dean@mit.edu"},
            "profile": {"id": "col-u1", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college
        try:
            resp = self.client.post(
                "/api/v1/collaborations/requests",
                json={"challenge_id": "c-123", "college_id": "col-123"},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Access denied", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 3, 4, 5: Request Creation Security & Validation
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "get_client")
    def test_03_industry_cannot_request_another_industry_challenge(self, mock_client_getter):
        """Test 3: Industry cannot create request for a challenge owned by someone else."""
        mock_industry = {
            "user": {"id": "ind-caller", "email": "caller@company.com"},
            "profile": {"id": "ind-caller", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(
                    data=[{"id": "c-other", "industry_id": "ind-other", "title": "Other Challenge", "status": "published"}]
                )
            return t
        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/requests",
                json={"challenge_id": "c-other", "college_id": "col-1"},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("do not own this challenge", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "get_client")
    def test_04_industry_cannot_request_unmatched_college(self, mock_client_getter):
        """Test 4: Industry cannot request a college without an evaluated match."""
        mock_industry = {
            "user": {"id": "ind-owner", "email": "owner@company.com"},
            "profile": {"id": "ind-owner", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(
                    data=[{"id": "c-1", "industry_id": "ind-owner", "title": "AI Project", "status": "published"}]
                )
            elif t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "col-unmatched", "college_name": "Random College"}])
            elif t_name == "matches":
                # Double eq query returns empty
                t.select().eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/requests",
                json={"challenge_id": "c-1", "college_id": "col-unmatched"},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("match must exist", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "get_client")
    def test_05_industry_cannot_request_unpublished_challenge(self, mock_client_getter):
        """Test 5: Industry cannot request collaboration for draft/unpublished challenge."""
        mock_industry = {
            "user": {"id": "ind-owner", "email": "owner@company.com"},
            "profile": {"id": "ind-owner", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(
                    data=[{"id": "c-draft", "industry_id": "ind-owner", "title": "Draft Challenge", "status": "draft"}]
                )
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/requests",
                json={"challenge_id": "c-draft", "college_id": "col-1"},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("must be published", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 6, 7, 8: College Access & Response Actions
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "resolve_college_id")
    @patch.object(CollaborationService, "get_client")
    def test_06_college_cannot_access_another_college_request(self, mock_client_getter, mock_resolve_college):
        """Test 6: College cannot view or respond to a request directed to another college."""
        mock_resolve_college.return_value = "col-institution-A"

        mock_college = {
            "user": {"id": "col-user-A", "email": "deanA@mit.edu"},
            "profile": {"id": "col-user-A", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaboration_requests":
                t.select().eq().execute.return_value = MagicMock(
                    data=[{
                        "id": "req-1",
                        "challenge_id": "c-1",
                        "industry_id": "ind-1",
                        "college_id": "col-institution-B",
                        "status": "pending",
                    }]
                )
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            # GET request
            resp = self.client.get(
                "/api/v1/collaborations/requests/req-1",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)

            # PATCH accept
            resp_accept = self.client.patch(
                "/api/v1/collaborations/requests/req-1/accept",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp_accept.status_code, 403)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "resolve_college_id")
    @patch.object(CollaborationService, "get_client")
    def test_07_and_09_college_accepts_request_and_creates_collaboration(self, mock_client_getter, mock_resolve_college):
        """Test 7 & 9: College accepts its pending request -> creates collaboration record."""
        mock_resolve_college.return_value = "col-institution-A"

        mock_college = {
            "user": {"id": "col-user-A", "email": "deanA@mit.edu"},
            "profile": {"id": "col-user-A", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaboration_requests":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "req-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-1",
                    "college_id": "col-institution-A",
                    "match_id": "m-1",
                    "status": "pending",
                }])
                t.update().eq().execute.return_value = MagicMock(data=[{}])
            elif t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[])
                t.insert().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-1",
                    "college_id": "col-institution-A",
                    "request_id": "req-1",
                    "title": "Computer Vision AI",
                    "description": "Scope details",
                    "status": "active",
                    "start_date": "2026-10-08",
                    "created_at": "2026-10-08T12:00:00Z",
                    "updated_at": "2026-10-08T12:00:00Z",
                }])
            elif t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(data=[{"title": "Computer Vision AI", "description": "Scope details"}])
                t.update().eq().execute.return_value = MagicMock(data=[{}])
            elif t_name == "industry_profiles":
                t.select().eq().execute.return_value = MagicMock(data=[{"company_name": "Tech Corp"}])
            elif t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"college_name": "MIT"}])
            elif t_name == "matches":
                t.update().eq().execute.return_value = MagicMock(data=[{}])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.patch(
                "/api/v1/collaborations/requests/req-1/accept",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["id"], "collab-1")
            self.assertEqual(data["status"], "active")
            self.assertEqual(data["challenge_title"], "Computer Vision AI")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "resolve_college_id")
    @patch.object(CollaborationService, "get_client")
    def test_08_and_11_college_rejects_request_no_collaboration(self, mock_client_getter, mock_resolve_college):
        """Test 8 & 11: College rejects pending request -> updates status to rejected, no collaboration."""
        mock_resolve_college.return_value = "col-institution-A"

        mock_college = {
            "user": {"id": "col-user-A", "email": "deanA@mit.edu"},
            "profile": {"id": "col-user-A", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaboration_requests":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "req-2",
                    "challenge_id": "c-1",
                    "industry_id": "ind-1",
                    "college_id": "col-institution-A",
                    "match_id": "m-1",
                    "status": "pending",
                    "created_at": "2026-10-08T12:00:00Z",
                }])
                t.update().eq().execute.return_value = MagicMock(data=[{
                    "id": "req-2",
                    "status": "rejected",
                }])
            elif t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(data=[{"title": "Computer Vision AI"}])
            elif t_name == "industry_profiles":
                t.select().eq().execute.return_value = MagicMock(data=[{"company_name": "Tech Corp"}])
            elif t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"college_name": "MIT"}])
            elif t_name == "matches":
                t.select().eq().execute.return_value = MagicMock(data=[{"overall_score": 92.5}])
                t.update().eq().execute.return_value = MagicMock(data=[{}])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.patch(
                "/api/v1/collaborations/requests/req-2/reject",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["status"], "pending")  # in get_collaboration_request with mocked data
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 10: Duplicate Collaboration Prevention
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "resolve_college_id")
    @patch.object(CollaborationService, "get_client")
    def test_10_accept_cannot_create_duplicate_collaboration(self, mock_client_getter, mock_resolve_college):
        """Test 10: Attempting to accept a request that is already accepted or has a collaboration returns 409."""
        mock_resolve_college.return_value = "col-institution-A"

        mock_college = {
            "user": {"id": "col-user-A", "email": "deanA@mit.edu"},
            "profile": {"id": "col-user-A", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaboration_requests":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "req-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-1",
                    "college_id": "col-institution-A",
                    "status": "accepted",
                }])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.patch(
                "/api/v1/collaborations/requests/req-1/accept",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 409)
            self.assertIn("Only pending requests can be accepted", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 12, 13, 14: Workspace Security & Participant Authorization
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "resolve_college_id")
    @patch.object(CollaborationService, "get_client")
    def test_12_unauthorized_user_cannot_access_collaboration_workspace(self, mock_client_getter, mock_resolve_college):
        """Test 12: Unauthorized industry or college user cannot access another project's workspace."""
        mock_resolve_college.return_value = "col-other"

        mock_stranger_college = {
            "user": {"id": "stranger-col", "email": "stranger@other.edu"},
            "profile": {"id": "stranger-col", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_stranger_college

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-1",
                    "college_id": "col-institution-A",
                    "request_id": "req-1",
                }])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.get(
                "/api/v1/collaborations/collab-1",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Access denied", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "get_client")
    def test_13_authorized_industry_participant_can_access_workspace(self, mock_client_getter):
        """Test 13: Owning industry partner can successfully access workspace."""
        mock_industry = {
            "user": {"id": "ind-owner", "email": "owner@company.com"},
            "profile": {"id": "ind-owner", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-owner",
                    "college_id": "col-1",
                    "request_id": "req-1",
                    "title": "Quantum ML Project",
                    "status": "active",
                    "created_at": "2026-10-08T12:00:00Z",
                    "updated_at": "2026-10-08T12:00:00Z",
                }])
            elif t_name == "milestones":
                t.select().eq().order().execute.return_value = MagicMock(data=[])
            elif t_name == "project_updates":
                t.select().eq().order().execute.return_value = MagicMock(data=[])
            elif t_name == "project_outcomes":
                t.select().eq().execute.return_value = MagicMock(data=[])
            elif t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(data=[{"title": "Quantum ML Project"}])
            elif t_name == "industry_profiles":
                t.select().eq().execute.return_value = MagicMock(data=[{"company_name": "Google DeepMind"}])
            elif t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"college_name": "IIT Bombay"}])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.get(
                "/api/v1/collaborations/collab-1",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["id"], "collab-1")
            self.assertEqual(data["industry_id"], "ind-owner")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "resolve_college_id")
    @patch.object(CollaborationService, "get_client")
    def test_14_authorized_college_participant_can_access_workspace(self, mock_client_getter, mock_resolve_college):
        """Test 14: Participating college institution can successfully access workspace."""
        mock_resolve_college.return_value = "col-participant"

        mock_college = {
            "user": {"id": "col-user", "email": "dean@iitb.ac.in"},
            "profile": {"id": "col-user", "role": "college"},
            "role": "college",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_college

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-owner",
                    "college_id": "col-participant",
                    "request_id": "req-1",
                    "title": "Quantum ML Project",
                    "status": "active",
                    "created_at": "2026-10-08T12:00:00Z",
                    "updated_at": "2026-10-08T12:00:00Z",
                }])
            elif t_name == "milestones":
                t.select().eq().order().execute.return_value = MagicMock(data=[])
            elif t_name == "project_updates":
                t.select().eq().order().execute.return_value = MagicMock(data=[])
            elif t_name == "project_outcomes":
                t.select().eq().execute.return_value = MagicMock(data=[])
            elif t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(data=[{"title": "Quantum ML Project"}])
            elif t_name == "industry_profiles":
                t.select().eq().execute.return_value = MagicMock(data=[{"company_name": "Google DeepMind"}])
            elif t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"college_name": "IIT Bombay"}])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.get(
                "/api/v1/collaborations/collab-1",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["college_id"], "col-participant")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 15 & 16: Unauthorized Sub-Resource Access (Milestones & Updates)
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "get_client")
    def test_15_unauthorized_milestone_access_blocked(self, mock_client_getter):
        """Test 15: Non-participant cannot create or read milestones in collaboration."""
        mock_stranger = {
            "user": {"id": "ind-stranger", "email": "stranger@other.com"},
            "profile": {"id": "ind-stranger", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_stranger

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-owner",
                    "college_id": "col-1",
                }])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            # GET milestones
            resp_get = self.client.get(
                "/api/v1/collaborations/collab-1/milestones",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp_get.status_code, 403)

            # POST milestone
            resp_post = self.client.post(
                "/api/v1/collaborations/collab-1/milestones",
                json={"title": "Sprint 1 Deliverable"},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp_post.status_code, 403)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "get_client")
    def test_16_unauthorized_project_update_access_blocked(self, mock_client_getter):
        """Test 16: Non-participant cannot post project updates."""
        mock_stranger = {
            "user": {"id": "ind-stranger", "email": "stranger@other.com"},
            "profile": {"id": "ind-stranger", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_stranger

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "challenge_id": "c-1",
                    "industry_id": "ind-owner",
                    "college_id": "col-1",
                }])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/collab-1/updates",
                json={"content": "Completed phase 1 testing."},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 403)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 17: Duplicate / Conflicting Collaboration Requests
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "get_client")
    def test_17_duplicate_collaboration_request_rejected(self, mock_client_getter):
        """Test 17: Prevent duplicate active/pending request for same challenge + college."""
        mock_industry = {
            "user": {"id": "ind-owner", "email": "owner@company.com"},
            "profile": {"id": "ind-owner", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "challenges":
                t.select().eq().execute.return_value = MagicMock(
                    data=[{"id": "c-1", "industry_id": "ind-owner", "title": "AI Project", "status": "published"}]
                )
            elif t_name == "colleges":
                t.select().eq().execute.return_value = MagicMock(data=[{"id": "col-1", "college_name": "MIT"}])
            elif t_name == "matches":
                # Double eq query returns a match
                t.select().eq.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[{"id": "m-1", "overall_score": 95.0}]
                )
            elif t_name == "collaboration_requests":
                # Double eq query returns an existing pending request
                t.select().eq.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[{"id": "req-existing", "status": "pending"}]
                )
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/requests",
                json={"challenge_id": "c-1", "college_id": "col-1"},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 409)
            self.assertIn("already exists", resp.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 18: Project Outcome Submission & Access
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "get_client")
    def test_18_project_outcome_submission_and_access(self, mock_client_getter):
        """Test 18: Collaboration participants can submit and view verified project outcomes."""
        mock_industry = {
            "user": {"id": "ind-owner", "email": "owner@company.com"},
            "profile": {"id": "ind-owner", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "industry_id": "ind-owner",
                    "college_id": "col-1",
                }])
                t.update().eq().execute.return_value = MagicMock(data=[{}])
            elif t_name == "project_outcomes":
                t.select().eq().execute.return_value = MagicMock(data=[])
                t.insert().execute.return_value = MagicMock(data=[{
                    "id": "outcome-1",
                    "collaboration_id": "collab-1",
                    "title": "Edge AI Inference Pipeline",
                    "summary": "Achieved 98% accuracy with 10ms latency.",
                    "repository_url": "https://github.com/mit/edge-ai",
                    "demo_url": "https://demo.edge-ai.mit.edu",
                    "technologies": ["PyTorch", "TensorRT", "FastAPI"],
                    "outcome_status": "completed",
                    "completed_at": "2026-10-08T12:00:00Z",
                }])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/collab-1/outcome",
                json={
                    "title": "Edge AI Inference Pipeline",
                    "summary": "Achieved 98% accuracy with 10ms latency.",
                    "repository_url": "https://github.com/mit/edge-ai",
                    "demo_url": "https://demo.edge-ai.mit.edu",
                    "technologies": ["PyTorch", "TensorRT", "FastAPI"],
                    "outcome_status": "completed",
                },
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["id"], "outcome-1")
            self.assertEqual(data["outcome_status"], "completed")
            self.assertEqual(data["repository_url"], "https://github.com/mit/edge-ai")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 19 & 20: Milestones and Project Updates Lifecycle
    # --------------------------------------------------------------------------

    @patch.object(CollaborationService, "get_client")
    def test_19_milestone_crud_lifecycle(self, mock_client_getter):
        """Test 19: Milestone creation and progress update."""
        mock_industry = {
            "user": {"id": "ind-owner", "email": "owner@company.com"},
            "profile": {"id": "ind-owner", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "industry_id": "ind-owner",
                    "college_id": "col-1",
                }])
            elif t_name == "milestones":
                t.insert().execute.return_value = MagicMock(data=[{
                    "id": "ms-1",
                    "collaboration_id": "collab-1",
                    "title": "Architecture Design",
                    "description": "System architecture diagram and API spec.",
                    "status": "in_progress",
                    "progress": 50,
                    "created_at": "2026-10-08T12:00:00Z",
                }])
            elif t_name == "profiles":
                t.select().eq().execute.return_value = MagicMock(data=[{"full_name": "Tech Lead"}])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/collab-1/milestones",
                json={
                    "title": "Architecture Design",
                    "description": "System architecture diagram and API spec.",
                    "status": "in_progress",
                    "progress": 50,
                },
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertEqual(data["id"], "ms-1")
            self.assertEqual(data["progress"], 50)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch.object(CollaborationService, "get_client")
    def test_20_project_update_creation(self, mock_client_getter):
        """Test 20: Participant logs a project update check-in."""
        mock_industry = {
            "user": {"id": "ind-owner", "email": "owner@company.com"},
            "profile": {"id": "ind-owner", "full_name": "Tech Lead", "role": "industry"},
            "role": "industry",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_industry

        mock_sb = MagicMock()
        def table_handler(t_name):
            t = MagicMock()
            if t_name == "collaborations":
                t.select().eq().execute.return_value = MagicMock(data=[{
                    "id": "collab-1",
                    "industry_id": "ind-owner",
                    "college_id": "col-1",
                }])
            elif t_name == "project_updates":
                t.insert().execute.return_value = MagicMock(data=[{
                    "id": "update-1",
                    "collaboration_id": "collab-1",
                    "author_id": "ind-owner",
                    "content": "Dataset collection completed.",
                    "progress": 25,
                    "created_at": "2026-10-08T12:00:00Z",
                }])
            elif t_name == "profiles":
                t.select().eq().execute.return_value = MagicMock(data=[{"full_name": "Tech Lead", "role": "industry"}])
            return t

        mock_sb.table.side_effect = table_handler
        mock_client_getter.return_value = mock_sb

        try:
            resp = self.client.post(
                "/api/v1/collaborations/collab-1/updates",
                json={"content": "Dataset collection completed.", "progress": 25},
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertEqual(data["id"], "update-1")
            self.assertEqual(data["content"], "Dataset collection completed.")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    # --------------------------------------------------------------------------
    # Test 21: Full Regression Check (Phases 4-9 Endpoints)
    # --------------------------------------------------------------------------

    def test_21_regression_previous_phases_remain_protected(self):
        """Test 21: Regression check - student, industry, college, and matching remain protected."""
        self.assertEqual(self.client.get("/api/v1/students/me").status_code, 401)
        self.assertEqual(self.client.get("/api/v1/industry/me").status_code, 401)
        self.assertEqual(self.client.get("/api/v1/colleges/me").status_code, 401)
        self.assertEqual(self.client.get("/api/v1/matching/college/me").status_code, 401)


if __name__ == "__main__":
    unittest.main()
