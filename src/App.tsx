/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  StudentNavView,
  IndustryNavView,
  CollegeNavView,
  AdminNavView,
  StudentProfile,
  Opportunity,
  ApplicationItem,
  IndustryChallenge,
  AcademicMatch,
  CollegeDetail,
  SkillItem,
} from './types';

// Services
import {
  studentApi,
  industryApi,
  collegeApi,
  matchingApi,
  collaborationApi,
} from './services/api';

// Shared Components
import { Header } from './components/Header';
import { LandingPage } from './components/public/LandingPage';
import { RoleSelectionModal } from './components/public/RoleSelectionModal';
import { AuthModal } from './components/public/AuthModal';
import { DemoTourModal } from './components/DemoTourModal';
import { SettingsView } from './components/SettingsView';

// Student Components
import { StudentHome } from './components/student/StudentHome';
import { StudentProfile as StudentProfileView } from './components/student/StudentProfile';
import { EditProfileModal } from './components/student/EditProfileModal';
import { MySkills } from './components/student/MySkills';
import { AISkillAnalysis } from './components/student/AISkillAnalysis';
import { SkillGap } from './components/student/SkillGap';
import { Opportunities } from './components/student/Opportunities';
import { OpportunityDetail } from './components/student/OpportunityDetail';
import { Applications } from './components/student/Applications';
import { AIAssistant } from './components/student/AIAssistant';
import { SkillPassport } from './components/student/SkillPassport';

// Industry Components
import { IndustryOverview } from './components/industry/IndustryOverview';
import { PostChallengeWizard } from './components/industry/PostChallengeWizard';
import { AIExtractionProcessing } from './components/industry/AIExtractionProcessing';
import { AIAcademicMatching } from './components/industry/AIAcademicMatching';
import { CollegeProfileView } from './components/industry/CollegeProfileView';
import { CollaborationRequestModal } from './components/industry/CollaborationRequestModal';
import { IndustryCollaborationRequests } from './components/industry/IndustryCollaborationRequests';

// College Components
import { CollegeOverview } from './components/college/CollegeOverview';
import { CollegeProfileManagement } from './components/college/CollegeProfileManagement';
import { CollegeCollaborationRequests } from './components/college/CollegeCollaborationRequests';
import { CollegeOpportunitiesView } from './components/college/CollegeOpportunitiesView';
import { ProjectOutcomeView } from './components/college/ProjectOutcomeView';

// Collaboration Workspace Component
import { CollaborationWorkspace as FullCollaborationWorkspace } from './components/collaboration/CollaborationWorkspace';

// Admin Components
import { AdminOverview } from './components/admin/AdminOverview';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

const emptyStudentProfile: StudentProfile = {
  name: '',
  title: 'Student',
  institution: '',
  degree: '',
  branch: '',
  location: '',
  about: '',
  profileCompletion: 0,
  targetRole: '',
  skills: [],
  strengths: [],
  developing: [],
  recommendedSkills: [],
  projects: [],
  certifications: [],
  achievements: [],
};

const emptyCollegeDetail: CollegeDetail = {
  id: '',
  name: '',
  tagline: '',
  location: '',
  website: '',
  about: '',
  capabilities: {
    faculty: 0,
    students: 0,
    specializedLabs: 0,
    relevantProjects: 0,
  },
  areasOfExpertise: [],
  facilities: [],
  industryCollaborationsCompleted: 0,
};

function AppContent() {
  const { role: authRole, profile: authProfile, isAuthenticated, setRoleOverride } = useAuth();

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [studentView, setStudentView] = useState<StudentNavView>('home');
  const [industryView, setIndustryView] = useState<IndustryNavView>('overview');
  const [collegeView, setCollegeView] = useState<CollegeNavView>('overview');
  const [adminView, setAdminView] = useState<AdminNavView>('overview');

  // Loading & Error States
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({ isOpen: false, mode: 'login' });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCollabRequestModal, setShowCollabRequestModal] = useState(false);
  const [showDemoTour, setShowDemoTour] = useState(false);

  // Authenticated Data States
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(emptyStudentProfile);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [industryChallenge, setIndustryChallenge] = useState<IndustryChallenge>({
    id: '',
    title: '',
    company: '',
    department: '',
    domain: '',
    collaborationType: '',
    description: '',
    status: 'Draft',
    requiredSkills: [],
    academicMatchesCount: 0,
  });
  const [academicMatches, setAcademicMatches] = useState<AcademicMatch[]>([]);
  const [collegeDetail, setCollegeDetail] = useState<CollegeDetail>(emptyCollegeDetail);

  // Active item selections
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [targetCollegeName, setTargetCollegeName] = useState<string>('Academic Institution');
  const [selectedMatchScore, setSelectedMatchScore] = useState<number | null>(null);
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);

  // Closed-loop Celebration Toast
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  // Fetch real data for student from FastAPI backend
  const fetchStudentData = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const [profileRes, skillsRes] = await Promise.all([
        studentApi.getProfile().catch(() => null),
        studentApi.getSkills().catch(() => []),
      ]);

      const mappedSkills: SkillItem[] = (skillsRes || []).map((s: any) => ({
        id: s.id || s.skill_id,
        name: s.skill_name || s.skill?.name || 'Skill',
        category: s.category || s.skill?.category || 'Technical',
        proficiency:
          s.proficiency_level >= 4
            ? 'Advanced'
            : s.proficiency_level === 3
            ? 'Intermediate'
            : 'Beginner',
        verified: !!s.is_verified,
      }));

      const strengths = mappedSkills
        .filter((s) => s.proficiency === 'Advanced')
        .map((s) => s.name);

      const developing = mappedSkills
        .filter((s) => s.proficiency === 'Beginner' || s.proficiency === 'Intermediate')
        .map((s) => s.name);

      // Compute profile completion score
      let completionScore = 30;
      if (profileRes?.course || profileRes?.degree) completionScore += 15;
      if (profileRes?.target_role) completionScore += 15;
      if (profileRes?.bio || profileRes?.about) completionScore += 15;
      if (mappedSkills.length > 0) {
        completionScore += Math.min(25, mappedSkills.length * 5);
      }

      setStudentProfile({
        name: profileRes?.full_name || authProfile?.full_name || 'Student',
        title: profileRes?.target_role || profileRes?.course || 'Student',
        institution: profileRes?.college_name || 'Academic Institution',
        degree: profileRes?.course || '',
        branch: profileRes?.branch || '',
        location: profileRes?.location || '',
        about: profileRes?.bio || '',
        profileCompletion: Math.min(100, completionScore),
        targetRole: profileRes?.target_role || '',
        skills: mappedSkills,
        strengths,
        developing,
        recommendedSkills: [],
        projects: [],
        certifications: [],
        achievements: [],
      });
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to retrieve authenticated student record.');
    } finally {
      setIsLoadingData(false);
    }
  }, [authProfile]);

  // Fetch real data for industry from FastAPI backend
  const fetchIndustryData = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const [profRes, challengesRes] = await Promise.all([
        industryApi.getProfile().catch(() => null),
        industryApi.getChallenges().catch(() => []),
      ]);

      if (challengesRes && challengesRes.length > 0) {
        const firstChal = challengesRes[0];
        const reqSkills = (firstChal.requirements || []).map(
          (r: any) => r.skill?.name || r.extracted_skill_name
        );

        setIndustryChallenge({
          id: firstChal.id,
          title: firstChal.title,
          company: profRes?.company_name || profRes?.full_name || 'Enterprise Partner',
          department: firstChal.domain || 'Engineering',
          domain: firstChal.domain || 'Engineering',
          collaborationType: firstChal.collaboration_type || 'Academic Collaboration',
          description: firstChal.description,
          status: firstChal.status || 'Active',
          requiredSkills: reqSkills,
          academicMatchesCount: firstChal.is_analyzed ? 1 : 0,
        });
      } else {
        setIndustryChallenge({
          id: '',
          title: '',
          company: profRes?.company_name || profRes?.full_name || 'Enterprise Partner',
          department: '',
          domain: '',
          collaborationType: '',
          description: '',
          status: 'Draft',
          requiredSkills: [],
          academicMatchesCount: 0,
        });
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to retrieve industry profile and challenges.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Fetch real data for college from FastAPI backend
  const fetchCollegeData = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const [profRes, capsRes] = await Promise.all([
        collegeApi.getProfile().catch(() => null),
        collegeApi.getCapabilities().catch(() => []),
      ]);

      const totalFaculty = (capsRes || []).reduce(
        (sum: number, c: any) => sum + (c.faculty_count || 0),
        0
      );

      setCollegeDetail({
        id: profRes?.id || '',
        name: profRes?.college_name || profRes?.full_name || 'Academic Institution',
        tagline: profRes?.location ? `Autonomous Campus · ${profRes.location}` : '',
        location: profRes?.location || '',
        website: profRes?.website || '',
        about: profRes?.description || '',
        capabilities: {
          faculty: totalFaculty,
          students: 0,
          specializedLabs: (capsRes || []).length,
          relevantProjects: 0,
        },
        areasOfExpertise: (capsRes || []).map((c: any) => c.skill?.name || c.skill_name || 'Capability'),
        facilities: [],
        industryCollaborationsCompleted: 0,
      });
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to retrieve college profile and capabilities.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Sync role and load appropriate backend data when authenticated
  useEffect(() => {
    if (isAuthenticated && authRole) {
      setCurrentRole(authRole);
      if (authRole === 'student') {
        fetchStudentData();
      } else if (authRole === 'industry') {
        fetchIndustryData();
      } else if (authRole === 'college') {
        fetchCollegeData();
      }
    }
  }, [authRole, isAuthenticated, fetchStudentData, fetchIndustryData, fetchCollegeData]);

  // Navigation handlers
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setRoleOverride(role);
    if (role === 'student') {
      setStudentView('home');
      if (isAuthenticated) fetchStudentData();
    }
    if (role === 'industry') {
      setIndustryView('overview');
      if (isAuthenticated) fetchIndustryData();
    }
    if (role === 'college') {
      setCollegeView('overview');
      if (isAuthenticated) fetchCollegeData();
    }
    if (role === 'admin') {
      setAdminView('overview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyOpportunity = (opp: Opportunity) => {
    const exists = applications.some((a) => a.opportunityId === opp.id);
    if (!exists) {
      const newApp: ApplicationItem = {
        id: 'app-' + Date.now(),
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        company: opp.company,
        type: opp.type,
        appliedDate: 'Just now',
        status: 'Applied',
        feedback: 'Application submitted successfully. Reviewing candidate credentials.',
      };
      setApplications([newApp, ...applications]);
      setCelebrationToast(`🎉 Applied to "${opp.title}" at ${opp.company}!`);
      setTimeout(() => setCelebrationToast(null), 4000);
    }
  };

  const handleAddSkill = async (newSkill: SkillItem) => {
    await fetchStudentData();
    setCelebrationToast(`✨ Added "${newSkill.name}" to your verified skills!`);
    setTimeout(() => setCelebrationToast(null), 4000);
  };

  const handleResetDemoData = () => {
    if (isAuthenticated) {
      if (currentRole === 'student') fetchStudentData();
      if (currentRole === 'industry') fetchIndustryData();
      if (currentRole === 'college') fetchCollegeData();
    }
    setCelebrationToast('🔄 Workspace refreshed with real database state.');
    setTimeout(() => setCelebrationToast(null), 4000);
  };

  const handleCompleteTheLoop = () => {
    if (currentRole === 'student') {
      fetchStudentData();
    }
    setCurrentRole('student');
    setStudentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCelebrationToast('🎉 Collaboration milestone completed! Skill Passport updated.');
    setTimeout(() => setCelebrationToast(null), 6000);
  };

  const currentOpportunity =
    opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0] || null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* GLOBAL TOAST NOTIFICATION */}
      {celebrationToast && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-emerald-900 text-white p-4 rounded-xl shadow-xl border border-emerald-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
          <div className="text-xs font-medium leading-relaxed">{celebrationToast}</div>
        </div>
      )}

      {/* TOP HEADER */}
      <Header
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        studentView={studentView}
        onStudentNavigate={(view) => {
          if (view === 'edit-profile') {
            setShowEditProfileModal(true);
            setStudentView('profile');
          } else {
            setStudentView(view);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        industryView={industryView}
        onIndustryNavigate={(view) => {
          setIndustryView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        collegeView={collegeView}
        onCollegeNavigate={(view) => {
          setCollegeView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        adminView={adminView}
        onAdminNavigate={(view) => {
          setAdminView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDemoTour={() => setShowDemoTour(true)}
        onOpenAuth={(mode) => setAuthModalConfig({ isOpen: true, mode })}
      />

      {/* ERROR BANNER IF FETCH FAILED */}
      {fetchError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={() => {
                if (currentRole === 'student') fetchStudentData();
                if (currentRole === 'industry') fetchIndustryData();
                if (currentRole === 'college') fetchCollegeData();
              }}
              className="px-2.5 py-1 bg-white border border-rose-300 text-rose-900 rounded font-semibold hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1">
        {/* PUBLIC EXPERIENCE */}
        {currentRole === 'public' && (
          <LandingPage
            onGetStarted={() => setShowRoleModal(true)}
            onSelectRole={handleSelectRole}
          />
        )}

        {/* STUDENT EXPERIENCE */}
        {currentRole === 'student' && (
          <>
            {studentView === 'home' && (
              <StudentHome
                profile={studentProfile}
                recommendedOpportunity={opportunities.length > 0 ? opportunities[0] : null}
                onNavigate={(view) => {
                  if (view === 'edit-profile') {
                    setShowEditProfileModal(true);
                    setStudentView('profile');
                  } else {
                    setStudentView(view);
                  }
                }}
                onSelectOpportunity={(id) => setSelectedOpportunityId(id)}
              />
            )}

            {studentView === 'profile' && (
              <StudentProfileView
                profile={studentProfile}
                onNavigate={setStudentView}
                onEditProfile={() => setShowEditProfileModal(true)}
              />
            )}

            {studentView === 'edit-profile' && (
              <StudentProfileView
                profile={studentProfile}
                onNavigate={setStudentView}
                onEditProfile={() => setShowEditProfileModal(true)}
              />
            )}

            {studentView === 'skills' && (
              <MySkills
                onNavigate={setStudentView}
                onSkillChanged={fetchStudentData}
              />
            )}

            {studentView === 'skill-passport' && (
              <SkillPassport onNavigate={setStudentView} />
            )}

            {studentView === 'skill-analysis' && (
              <AISkillAnalysis profile={studentProfile} onNavigate={setStudentView} />
            )}

            {studentView === 'skill-gap' && (
              <SkillGap profile={studentProfile} onNavigate={setStudentView} />
            )}

            {studentView === 'opportunities' && (
              <Opportunities
                opportunities={opportunities}
                onSelectOpportunity={(id) => setSelectedOpportunityId(id)}
                onNavigate={setStudentView}
              />
            )}

            {studentView === 'opportunity-detail' && currentOpportunity && (
              <OpportunityDetail
                opportunity={currentOpportunity}
                onBack={() => setStudentView('opportunities')}
                onApply={handleApplyOpportunity}
                isApplied={applications.some((a) => a.opportunityId === currentOpportunity.id)}
                onNavigate={setStudentView}
              />
            )}

            {studentView === 'applications' && (
              <Applications applications={applications} onNavigate={setStudentView} />
            )}

            {studentView === 'ai-assistant' && (
              <AIAssistant profile={studentProfile} onNavigate={setStudentView} />
            )}

            {studentView === 'settings' && (
              <SettingsView
                currentRole={currentRole}
                onResetDemoData={handleResetDemoData}
                onTriggerSkillUpdate={handleCompleteTheLoop}
                onBack={() => setStudentView('home')}
              />
            )}
          </>
        )}

        {/* INDUSTRY EXPERIENCE */}
        {currentRole === 'industry' && (
          <>
            {industryView === 'overview' && (
              <IndustryOverview
                challenge={industryChallenge.id ? industryChallenge : undefined}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'post-challenge' && (
              <PostChallengeWizard
                onPublish={(newChal) => {
                  setIndustryChallenge(newChal);
                  fetchIndustryData();
                }}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'ai-extraction' && (
              <AIExtractionProcessing
                onComplete={() => fetchIndustryData()}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'ai-matching' && (
              <AIAcademicMatching
                challenge={industryChallenge.id ? industryChallenge : null}
                matches={academicMatches}
                onSelectCollege={(id) => {
                  setSelectedCollegeId(id);
                  setTargetCollegeName('Academic Institution');
                }}
                onOpenCollaborationRequest={(collegeId, collegeName, matchScore) => {
                  setSelectedCollegeId(collegeId);
                  setTargetCollegeName(collegeName);
                  setSelectedMatchScore(matchScore ?? null);
                  setShowCollabRequestModal(true);
                }}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'college-profile' && (
              <CollegeProfileView
                college={collegeDetail}
                onBack={() => setIndustryView('ai-matching')}
                onOpenCollaborationRequest={(name) => {
                  setTargetCollegeName(name);
                  setShowCollabRequestModal(true);
                }}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'collaboration-requests' && (
              <IndustryCollaborationRequests
                onNavigate={setIndustryView}
                onOpenWorkspace={(id) => {
                  if (id) setSelectedCollabId(id);
                  setIndustryView('workspace');
                }}
              />
            )}

            {industryView === 'workspace' && (
              <FullCollaborationWorkspace
                initialCollaborationId={selectedCollabId}
                onBack={() => setIndustryView('overview')}
                userRole="industry"
              />
            )}

            {industryView === 'settings' && (
              <SettingsView
                currentRole={currentRole}
                onResetDemoData={handleResetDemoData}
                onTriggerSkillUpdate={handleCompleteTheLoop}
                onBack={() => setIndustryView('overview')}
              />
            )}
          </>
        )}

        {/* COLLEGE EXPERIENCE */}
        {currentRole === 'college' && (
          <>
            {collegeView === 'overview' && (
              <CollegeOverview
                college={collegeDetail}
                onNavigate={setCollegeView}
              />
            )}

            {collegeView === 'profile' && (
              <CollegeProfileManagement
                college={collegeDetail}
                onNavigate={setCollegeView}
              />
            )}

            {collegeView === 'opportunities' && (
              <CollegeOpportunitiesView
                opportunities={opportunities}
                onNavigate={setCollegeView}
              />
            )}

            {collegeView === 'requests' && (
              <CollegeCollaborationRequests
                onAcceptRequest={(collabId) => {
                  if (collabId) setSelectedCollabId(collabId);
                  setCollegeView('workspace');
                }}
                onNavigate={setCollegeView}
                onOpenWorkspace={(id) => {
                  if (id) setSelectedCollabId(id);
                  setCollegeView('workspace');
                }}
              />
            )}

            {collegeView === 'workspace' && (
              <FullCollaborationWorkspace
                initialCollaborationId={selectedCollabId}
                onBack={() => setCollegeView('overview')}
                userRole="college"
              />
            )}

            {collegeView === 'outcome' && (
              <ProjectOutcomeView
                onUpdateStudentProfile={handleCompleteTheLoop}
                onBack={() => setCollegeView('workspace')}
              />
            )}

            {collegeView === 'settings' && (
              <SettingsView
                currentRole={currentRole}
                onResetDemoData={handleResetDemoData}
                onTriggerSkillUpdate={handleCompleteTheLoop}
                onBack={() => setCollegeView('overview')}
              />
            )}
          </>
        )}

        {/* ADMIN EXPERIENCE */}
        {currentRole === 'admin' && (
          <AdminOverview activeView={adminView} onNavigate={setAdminView} />
        )}
      </main>

      {/* MODALS */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelectRole={handleSelectRole}
      />

      <AuthModal
        isOpen={authModalConfig.isOpen}
        initialMode={authModalConfig.mode}
        onClose={() => setAuthModalConfig({ isOpen: false, mode: 'login' })}
        onSuccess={(role) => handleSelectRole(role)}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        profile={studentProfile}
        onClose={() => setShowEditProfileModal(false)}
        onSave={(updated) => {
          setStudentProfile(updated);
          fetchStudentData();
        }}
      />

      <CollaborationRequestModal
        isOpen={showCollabRequestModal}
        challengeId={industryChallenge.id}
        challengeTitle={industryChallenge.title}
        collegeId={selectedCollegeId}
        collegeName={targetCollegeName}
        matchScore={selectedMatchScore}
        onClose={() => setShowCollabRequestModal(false)}
        onSuccess={() => {
          setIndustryChallenge((prev) => ({
            ...prev,
            status: 'Collaboration Active',
          }));
          fetchIndustryData();
        }}
        onViewRequests={() => {
          setShowCollabRequestModal(false);
          setIndustryView('collaboration-requests');
        }}
      />

      <DemoTourModal
        isOpen={showDemoTour}
        onClose={() => setShowDemoTour(false)}
        onJumpToStep={(role, sView, iView, cView) => {
          handleSelectRole(role);
          if (sView) setStudentView(sView);
          if (iView) setIndustryView(iView);
          if (cView) setCollegeView(cView);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
