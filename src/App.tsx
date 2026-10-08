/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  CollaborationWorkspace,
  SkillItem,
} from './types';
import {
  initialStudentProfile,
  sampleOpportunities,
  initialApplications,
  initialIndustryChallenge,
  academicMatchesData,
  sampleCollegeDetail,
  sampleCollegesMap,
  sampleWorkspace,
} from './data/mockData';

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
import { CollaborationWorkspaceView } from './components/college/CollaborationWorkspaceView';
import { ProjectOutcomeView } from './components/college/ProjectOutcomeView';

// Collaboration Workspace Component (Phase 10 & 11)
import { CollaborationWorkspace as FullCollaborationWorkspace } from './components/collaboration/CollaborationWorkspace';

// Admin Components
import { AdminOverview } from './components/admin/AdminOverview';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { role: authRole, profile: authProfile, isAuthenticated, setRoleOverride } = useAuth();

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [studentView, setStudentView] = useState<StudentNavView>('home');
  const [industryView, setIndustryView] = useState<IndustryNavView>('overview');
  const [collegeView, setCollegeView] = useState<CollegeNavView>('overview');
  const [adminView, setAdminView] = useState<AdminNavView>('overview');

  // Sync role with auth session
  useEffect(() => {
    if (isAuthenticated && authRole) {
      setCurrentRole(authRole);
    }
  }, [authRole, isAuthenticated]);

  // Modals State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({ isOpen: false, mode: 'login' });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCollabRequestModal, setShowCollabRequestModal] = useState(false);
  const [showDemoTour, setShowDemoTour] = useState(false);

  // Data States
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(initialStudentProfile);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(sampleOpportunities);
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [industryChallenge, setIndustryChallenge] = useState<IndustryChallenge>(initialIndustryChallenge);
  const [academicMatches, setAcademicMatches] = useState<AcademicMatch[]>(academicMatchesData);
  const [collegeDetail] = useState<CollegeDetail>(sampleCollegeDetail);
  const [workspace, setWorkspace] = useState<CollaborationWorkspace>(sampleWorkspace);

  // Active item selections
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('opp-1');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('col-1');
  const [targetCollegeName, setTargetCollegeName] = useState<string>('Academic Institution');
  const [selectedMatchScore, setSelectedMatchScore] = useState<number | null>(null);
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);

  // Closed-loop Celebration Toast
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  // Navigation handlers
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setRoleOverride(role);
    if (role === 'student') setStudentView('home');
    if (role === 'industry') setIndustryView('overview');
    if (role === 'college') setCollegeView('overview');
    if (role === 'admin') setAdminView('overview');
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
        status: 'Under Review',
        feedback: 'Profile matched 91% illustrative score. Reviewing technical project artifacts.',
      };
      setApplications([newApp, ...applications]);
    }
  };

  const handleAddSkill = (newSkill: SkillItem) => {
    setStudentProfile((prev) => {
      const exists = prev.skills.some((s) => s.name.toLowerCase() === newSkill.name.toLowerCase());
      if (exists) return prev;
      return {
        ...prev,
        skills: [newSkill, ...prev.skills],
        profileCompletion: Math.min(100, prev.profileCompletion + 3),
        strengths:
          newSkill.proficiency === 'Advanced'
            ? [...prev.strengths, newSkill.name]
            : prev.strengths,
      };
    });
    setCelebrationToast(`✨ Added "${newSkill.name}" to your technical skill inventory!`);
    setTimeout(() => setCelebrationToast(null), 4000);
  };

  const handleResetDemoData = () => {
    setStudentProfile(initialStudentProfile);
    setOpportunities(sampleOpportunities);
    setApplications(initialApplications);
    setIndustryChallenge(initialIndustryChallenge);
    setWorkspace(sampleWorkspace);
    setSelectedCollegeId('col-1');
    setCelebrationToast('🔄 Demo environment successfully reset to initial baseline values.');
    setTimeout(() => setCelebrationToast(null), 4000);
  };

  // Complete the Loop Handler: updates Vijay's profile with verified CV skills from project outcome
  const handleCompleteTheLoop = () => {
    setStudentProfile((prev) => {
      const updatedSkills = [...prev.skills];
      const cvIdx = updatedSkills.findIndex((s) => s.name === 'Computer Vision');
      if (cvIdx >= 0) {
        updatedSkills[cvIdx] = {
          ...updatedSkills[cvIdx],
          proficiency: 'Advanced',
          verified: true,
        };
      } else {
        updatedSkills.push({
          id: 'cv-new',
          name: 'Computer Vision',
          category: 'AI / Machine Learning',
          proficiency: 'Advanced',
          verified: true,
        });
      }

      if (!updatedSkills.some((s) => s.name === 'OpenCV')) {
        updatedSkills.push({
          id: 'cv-opencv',
          name: 'OpenCV',
          category: 'AI / Machine Learning',
          proficiency: 'Advanced',
          verified: true,
        });
      }

      return {
        ...prev,
        skills: updatedSkills,
        profileCompletion: 96,
        strengths: ['Python', 'JavaScript', 'React', 'SQL', 'Computer Vision', 'OpenCV'],
        developing: ['Machine Learning', 'FastAPI'],
        achievements: [
          'Certified Lead ML Engineer on ABC Technologies Defect Inspection Deployment',
          ...prev.achievements,
        ],
      };
    });

    // Switch persona to Student Profile to show the verified impact
    setCurrentRole('student');
    setStudentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setCelebrationToast(
      '🎉 Closed Loop Complete: Computer Vision & OpenCV verified on Vijay Bhosale’s profile from completed ABC Technologies collaboration!'
    );
    setTimeout(() => {
      setCelebrationToast(null);
    }, 7000);
  };

  const currentOpportunity =
    opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];

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
                recommendedOpportunity={opportunities[0]}
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
                profile={studentProfile}
                onNavigate={setStudentView}
                onAddSkill={handleAddSkill}
              />
            )}

            {studentView === 'skill-passport' && (
              <SkillPassport profile={studentProfile} onNavigate={setStudentView} />
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

            {studentView === 'opportunity-detail' && (
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
                challenge={industryChallenge}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'post-challenge' && (
              <PostChallengeWizard
                onPublish={(newChal) => setIndustryChallenge(newChal)}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'ai-extraction' && (
              <AIExtractionProcessing
                onComplete={() => {}}
                onNavigate={setIndustryView}
              />
            )}

            {industryView === 'ai-matching' && (
              <AIAcademicMatching
                challenge={industryChallenge}
                matches={academicMatches}
                onSelectCollege={(id) => {
                  setSelectedCollegeId(id);
                  const matched = sampleCollegesMap[id] || sampleCollegeDetail;
                  setTargetCollegeName(matched.name);
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
                college={sampleCollegesMap[selectedCollegeId] || collegeDetail}
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
                pendingRequestsCount={1}
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
        onSave={(updated) => setStudentProfile(updated)}
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
          setCurrentRole(role);
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

