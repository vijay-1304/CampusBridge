import React from 'react';
import { StudentProfile, Opportunity, StudentNavView } from '../../types';
import { Sparkles, ArrowRight, BookOpen, Target, Briefcase, CheckCircle2 } from 'lucide-react';

interface StudentHomeProps {
  profile: StudentProfile;
  recommendedOpportunity: Opportunity;
  onNavigate: (view: StudentNavView) => void;
  onSelectOpportunity: (oppId: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  profile,
  recommendedOpportunity,
  onNavigate,
  onSelectOpportunity,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 1. GREETING & PROFILE COMPLETION */}
      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-slate-500">Good morning, Vijay 👋</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Build your skills. Find opportunities. Grow your career.
          </h1>
        </div>

        {/* Profile Completion Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span>Profile Completion</span>
              <span className="text-slate-400 font-normal">· Target: {profile.targetRole}</span>
            </span>
            <span className="font-mono text-blue-700">{profile.profileCompletion}%</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${profile.profileCompletion}%` }}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500">
              Add your recent projects and certifications to reach 100% and unlock higher matching scores.
            </p>
            <button
              onClick={() => onNavigate('edit-profile')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Complete My Profile
            </button>
          </div>
        </div>
      </div>

      {/* 2. AI CAREER INSIGHT */}
      <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Your AI Career Insight</h2>
              <span className="text-[11px] font-mono text-blue-700">Updated today</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              You have a strong foundation in software development. Improving{' '}
              <span className="font-semibold text-blue-900">Computer Vision</span> and{' '}
              <span className="font-semibold text-blue-900">FastAPI</span> could open more AI/ML opportunities for you.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-md border border-amber-200">
              <span className="font-semibold">Skill-Gap Reminder:</span>
              <span>6 live industry roles currently require Computer Vision for your target career.</span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => onNavigate('skill-gap')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <span>View My Skill Gap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECOMMENDED OPPORTUNITY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recommended Opportunity</h2>
          <button
            onClick={() => onNavigate('opportunities')}
            className="text-xs font-medium text-blue-700 hover:text-blue-900"
          >
            Explore all
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>{recommendedOpportunity.company}</span>
                <span aria-hidden="true">·</span>
                <span>{recommendedOpportunity.duration}</span>
                <span aria-hidden="true">·</span>
                <span>{recommendedOpportunity.location}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{recommendedOpportunity.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 max-w-xl">
                {recommendedOpportunity.description}
              </p>

              {/* Skills required - unboxed metadata */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Key Skills:</span>
                <span>Python · Machine Learning · OpenCV · Computer Vision</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="sm:text-right">
                <div className="text-2xl font-bold text-emerald-700 font-mono">
                  {recommendedOpportunity.matchScore}%
                </div>
                <div className="text-[10px] text-slate-500">Illustrative Match</div>
              </div>

              <button
                onClick={() => {
                  onSelectOpportunity(recommendedOpportunity.id);
                  onNavigate('opportunity-detail');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
              >
                View Opportunity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('skills')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">My Skills</div>
            <div className="text-xs text-slate-500 mt-1">Review {profile.skills.length} mapped technical abilities</div>
          </button>

          <button
            onClick={() => onNavigate('skill-passport')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Skill Passport</div>
            <div className="text-xs text-slate-500 mt-1">Evidence matrix &amp; closed-loop journey</div>
          </button>

          <button
            onClick={() => onNavigate('skill-gap')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Skill Gap</div>
            <div className="text-xs text-slate-500 mt-1">Diagnose gaps for {profile.targetRole}</div>
          </button>

          <button
            onClick={() => onNavigate('opportunities')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Opportunities</div>
            <div className="text-xs text-slate-500 mt-1">Browse live internships and projects</div>
          </button>
        </div>
      </div>
    </div>
  );
};
