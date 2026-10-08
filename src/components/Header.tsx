import React, { useState } from 'react';
import { CampusBridgeLogo } from './CampusBridgeLogo';
import { UserRole, StudentNavView, IndustryNavView, CollegeNavView, AdminNavView } from '../types';
import {
  Bell,
  ChevronDown,
  Compass,
  GraduationCap,
  Building2,
  School,
  Shield,
  ExternalLink,
  Plus,
  Menu,
  X,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  studentView: StudentNavView;
  onStudentNavigate: (view: StudentNavView) => void;
  industryView: IndustryNavView;
  onIndustryNavigate: (view: IndustryNavView) => void;
  collegeView: CollegeNavView;
  onCollegeNavigate: (view: CollegeNavView) => void;
  adminView?: AdminNavView;
  onAdminNavigate?: (view: AdminNavView) => void;
  onOpenDemoTour: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  studentView,
  onStudentNavigate,
  industryView,
  onIndustryNavigate,
  collegeView,
  onCollegeNavigate,
  adminView = 'overview',
  onAdminNavigate,
  onOpenDemoTour,
  onOpenAuth,
}) => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Match Calculated', text: 'ABC Technologies matched 91% with your profile.', time: '10m ago' },
    { id: 2, title: 'Milestone Update', text: 'Dr. Nair approved Milestone 3 dataset deliverables.', time: '2h ago' },
  ];

  const handleMobileNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand element */}
          <button
            onClick={() => {
              if (currentRole === 'public') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                onSelectRole('public');
              }
            }}
            className="flex items-center text-left focus:outline-none shrink-0"
          >
            <CampusBridgeLogo />
          </button>

          {/* Zone 2: Navigation Links based on role (Desktop & Laptop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {currentRole === 'public' && (
              <>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3 py-2 text-xs xl:text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Home
                </button>
                <a
                  href="#how-it-works"
                  className="px-3 py-2 text-xs xl:text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#for-students"
                  className="px-3 py-2 text-xs xl:text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  For Students
                </a>
                <a
                  href="#for-colleges"
                  className="px-3 py-2 text-xs xl:text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  For Colleges
                </a>
                <a
                  href="#for-industry"
                  className="px-3 py-2 text-xs xl:text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  For Industry
                </a>
              </>
            )}

            {currentRole === 'student' && (
              <>
                <button
                  onClick={() => onStudentNavigate('home')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    studentView === 'home' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onStudentNavigate('profile')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    studentView === 'profile' || studentView === 'edit-profile'
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => onStudentNavigate('skills')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    studentView === 'skills' || studentView === 'skill-analysis'
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Skills
                </button>
                <button
                  onClick={() => onStudentNavigate('skill-gap')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    studentView === 'skill-gap' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Skill Gap
                </button>
                <button
                  onClick={() => onStudentNavigate('opportunities')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    studentView === 'opportunities' || studentView === 'opportunity-detail'
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Opportunities
                </button>
                <button
                  onClick={() => onStudentNavigate('applications')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    studentView === 'applications' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Applications
                </button>
                <button
                  onClick={() => onStudentNavigate('ai-assistant')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    studentView === 'ai-assistant' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => onStudentNavigate('settings')}
                  className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1 ${
                    studentView === 'settings' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </>
            )}

            {currentRole === 'industry' && (
              <>
                <button
                  onClick={() => onIndustryNavigate('overview')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    industryView === 'overview' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => onIndustryNavigate('post-challenge')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    industryView === 'post-challenge' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Challenges
                </button>
                <button
                  onClick={() => onIndustryNavigate('ai-matching')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    industryView === 'ai-matching' || industryView === 'ai-extraction' || industryView === 'college-profile'
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Find Partners
                </button>
                <button
                  onClick={() => onIndustryNavigate('workspace')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    industryView === 'workspace' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Collaborations
                </button>
                <button
                  onClick={() => onIndustryNavigate('settings')}
                  className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1 ${
                    industryView === 'settings' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </>
            )}

            {currentRole === 'college' && (
              <>
                <button
                  onClick={() => onCollegeNavigate('overview')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    collegeView === 'overview' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => onCollegeNavigate('profile')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    collegeView === 'profile' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Institution Profile
                </button>
                <button
                  onClick={() => onCollegeNavigate('opportunities')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    collegeView === 'opportunities' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Opportunities
                </button>
                <button
                  onClick={() => onCollegeNavigate('requests')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    collegeView === 'requests' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Collaboration Requests
                </button>
                <button
                  onClick={() => onCollegeNavigate('workspace')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    collegeView === 'workspace' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active Collaborations
                </button>
                <button
                  onClick={() => onCollegeNavigate('outcome')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    collegeView === 'outcome' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Project Outcome
                </button>
                <button
                  onClick={() => onCollegeNavigate('settings')}
                  className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1 ${
                    collegeView === 'settings' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => onAdminNavigate?.('overview')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    adminView === 'overview' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => onAdminNavigate?.('users')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    adminView === 'users' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Users &amp; Roles
                </button>
                <button
                  onClick={() => onAdminNavigate?.('organizations')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    adminView === 'organizations' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Organizations
                </button>
                <button
                  onClick={() => onAdminNavigate?.('challenges')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    adminView === 'challenges' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Challenges
                </button>
                <button
                  onClick={() => onAdminNavigate?.('collaborations')}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    adminView === 'collaborations' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Collaborations
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Actions, Persona Switcher & Mobile Menu Trigger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Walkthrough Guide Button */}
            <button
              onClick={onOpenDemoTour}
              title="View full Hackathon demo flow guide"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Demo Guide</span>
            </button>

            {/* If Industry role, show direct "+ Post Challenge" button */}
            {currentRole === 'industry' && (
              <button
                onClick={() => onIndustryNavigate('post-challenge')}
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#173B63] rounded-lg hover:bg-[#122e4e] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Challenge</span>
              </button>
            )}

            {/* Persona Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              >
                {currentRole === 'student' && <GraduationCap className="w-3.5 h-3.5 text-blue-600" />}
                {currentRole === 'industry' && <Building2 className="w-3.5 h-3.5 text-emerald-600" />}
                {currentRole === 'college' && <School className="w-3.5 h-3.5 text-amber-600" />}
                {currentRole === 'admin' && <Shield className="w-3.5 h-3.5 text-slate-600" />}
                {currentRole === 'public' && <ExternalLink className="w-3.5 h-3.5 text-slate-500" />}
                
                <span className="capitalize hidden sm:inline">
                  {currentRole === 'student'
                    ? 'Student (Vijay)'
                    : currentRole === 'industry'
                    ? 'Industry (ABC Tech)'
                    : currentRole === 'college'
                    ? 'College (ABC College)'
                    : currentRole === 'admin'
                    ? 'Admin Portal'
                    : 'Public Portal'}
                </span>
                <span className="capitalize sm:hidden">
                  {currentRole === 'student'
                    ? 'Vijay'
                    : currentRole === 'industry'
                    ? 'ABC Tech'
                    : currentRole === 'college'
                    ? 'College'
                    : currentRole === 'admin'
                    ? 'Admin'
                    : 'Public'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Persona
                  </div>
                  <button
                    onClick={() => onSelectRole('student')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-50 ${
                      currentRole === 'student' ? 'text-blue-700 bg-blue-50/60 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Student Experience</div>
                      <div className="text-[11px] text-slate-400">Vijay Bhosale (B.Tech CS)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => onSelectRole('industry')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-50 ${
                      currentRole === 'industry' ? 'text-blue-700 bg-blue-50/60 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium">Industry Experience</div>
                      <div className="text-[11px] text-slate-400">ABC Technologies</div>
                    </div>
                  </button>
                  <button
                    onClick={() => onSelectRole('college')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-50 ${
                      currentRole === 'college' ? 'text-blue-700 bg-blue-50/60 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <School className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-medium">College Experience</div>
                      <div className="text-[11px] text-slate-400">ABC Engineering College</div>
                    </div>
                  </button>
                  <button
                    onClick={() => onSelectRole('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-50 ${
                      currentRole === 'admin' ? 'text-blue-700 bg-blue-50/60 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-medium">Admin Experience</div>
                      <div className="text-[11px] text-slate-400">Moderation &amp; System Health</div>
                    </div>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => onSelectRole('public')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-50 ${
                      currentRole === 'public' ? 'text-blue-700 bg-blue-50/60 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-medium">Public Landing Page</div>
                      <div className="text-[11px] text-slate-400">Marketing &amp; How It Works</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification bell */}
            {currentRole !== 'public' && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">Notifications</span>
                      <span className="text-[10px] text-blue-600 cursor-pointer">Mark all read</span>
                    </div>
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-none">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons / Sign Out */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="max-w-[100px] truncate">{profile?.full_name || user?.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : currentRole === 'public' ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  Get Started
                </button>
              </div>
            ) : null}

            {/* Mobile Hamburger Toggle (Visible on screens < lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 shadow-lg animate-in fade-in duration-150">
          <div className="space-y-1 pt-1">
            {currentRole === 'public' && (
              <>
                <button
                  onClick={() => handleMobileNav(() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  Home
                </button>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  How It Works
                </a>
                <a
                  href="#for-students"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  For Students
                </a>
                <a
                  href="#for-colleges"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  For Colleges
                </a>
                <a
                  href="#for-industry"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  For Industry
                </a>
              </>
            )}

            {currentRole === 'student' && (
              <>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('home'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'home' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('profile'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'profile' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('skills'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'skills' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  My Skills
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('skill-passport'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'skill-passport' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  AI Skill Passport
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('skill-gap'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'skill-gap' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Skill Gap
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('opportunities'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'opportunities' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Opportunities
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('applications'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'applications' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Applications
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('ai-assistant'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'ai-assistant' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => handleMobileNav(() => onStudentNavigate('settings'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${studentView === 'settings' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Settings
                </button>
              </>
            )}

            {currentRole === 'industry' && (
              <>
                <button
                  onClick={() => handleMobileNav(() => onIndustryNavigate('overview'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${industryView === 'overview' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleMobileNav(() => onIndustryNavigate('post-challenge'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${industryView === 'post-challenge' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Post / Manage Challenges
                </button>
                <button
                  onClick={() => handleMobileNav(() => onIndustryNavigate('ai-matching'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${industryView === 'ai-matching' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Find Academic Partners
                </button>
                <button
                  onClick={() => handleMobileNav(() => onIndustryNavigate('workspace'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${industryView === 'workspace' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Active Collaborations
                </button>
                <button
                  onClick={() => handleMobileNav(() => onIndustryNavigate('settings'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${industryView === 'settings' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Settings
                </button>
              </>
            )}

            {currentRole === 'college' && (
              <>
                <button
                  onClick={() => handleMobileNav(() => onCollegeNavigate('overview'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${collegeView === 'overview' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleMobileNav(() => onCollegeNavigate('profile'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${collegeView === 'profile' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Institution Profile
                </button>
                <button
                  onClick={() => handleMobileNav(() => onCollegeNavigate('opportunities'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${collegeView === 'opportunities' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Opportunities &amp; Drives
                </button>
                <button
                  onClick={() => handleMobileNav(() => onCollegeNavigate('requests'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${collegeView === 'requests' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Collaboration Requests
                </button>
                <button
                  onClick={() => handleMobileNav(() => onCollegeNavigate('workspace'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${collegeView === 'workspace' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Active Collaborations
                </button>
                <button
                  onClick={() => handleMobileNav(() => onCollegeNavigate('outcome'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${collegeView === 'outcome' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Project Outcome
                </button>
                <button
                  onClick={() => handleMobileNav(() => onCollegeNavigate('settings'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${collegeView === 'settings' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Settings
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => handleMobileNav(() => onAdminNavigate?.('overview'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${adminView === 'overview' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleMobileNav(() => onAdminNavigate?.('users'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${adminView === 'users' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Users &amp; Roles
                </button>
                <button
                  onClick={() => handleMobileNav(() => onAdminNavigate?.('organizations'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${adminView === 'organizations' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Organizations
                </button>
                <button
                  onClick={() => handleMobileNav(() => onAdminNavigate?.('challenges'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${adminView === 'challenges' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Challenges
                </button>
                <button
                  onClick={() => handleMobileNav(() => onAdminNavigate?.('collaborations'))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg ${adminView === 'collaborations' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'}`}
                >
                  Collaborations
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
