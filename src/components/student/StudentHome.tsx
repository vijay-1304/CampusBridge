import React from 'react';
import { StudentProfile, Opportunity, StudentNavView } from '../../types';
import { Sparkles, ArrowRight, BookOpen, Target, Briefcase, Plus, CheckCircle2 } from 'lucide-react';

interface StudentHomeProps {
  profile: StudentProfile;
  recommendedOpportunity?: Opportunity | null;
  onNavigate: (view: StudentNavView) => void;
  onSelectOpportunity: (oppId: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  profile,
  recommendedOpportunity,
  onNavigate,
  onSelectOpportunity,
}) => {
  const firstName = profile.name ? profile.name.split(' ')[0] : 'Student';
  const hasSkills = profile.skills && profile.skills.length > 0;
  const topStrengths = profile.strengths && profile.strengths.length > 0
    ? profile.strengths
    : profile.skills.filter((s) => s.proficiency === 'Advanced' || s.proficiency === 'Intermediate').map((s) => s.name);
  const developingSkills = profile.developing && profile.developing.length > 0
    ? profile.developing
    : profile.skills.filter((s) => s.proficiency === 'Beginner').map((s) => s.name);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 1. GREETING & PROFILE COMPLETION */}
      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-slate-500">Good day, {firstName} 👋</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Build your skills. Find opportunities. Grow your career.
          </h1>
        </div>

        {/* Profile Completion Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span>Profile Completion</span>
              <span className="text-slate-400 font-normal">· Target: {profile.targetRole || 'Not specified'}</span>
            </span>
            <span className="font-mono text-blue-700">{profile.profileCompletion || 0}%</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, profile.profileCompletion || 0))}%` }}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500">
              Add your verified skills, projects, and coursework to unlock higher matching scores.
            </p>
            <button
              onClick={() => onNavigate('edit-profile')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Update Profile
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
              <span className="text-[11px] font-mono text-blue-700">Real-Time Evaluation</span>
            </div>

            {hasSkills ? (
              <>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {topStrengths.length > 0 ? (
                    <>
                      You have verified foundations in <span className="font-semibold text-blue-900">{topStrengths.slice(0, 3).join(', ')}</span>.
                    </>
                  ) : (
                    <>You have {profile.skills.length} technical skills recorded.</>
                  )}
                  {developingSkills.length > 0 && (
                    <>
                      {' '}Advancing your competency in{' '}
                      <span className="font-semibold text-blue-900">{developingSkills.slice(0, 2).join(' and ')}</span> will enhance your match score for{' '}
                      <span className="font-semibold text-slate-800">{profile.targetRole || 'industry roles'}</span>.
                    </>
                  )}
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => onNavigate('skill-gap')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span>View My Skill Gap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  No technical skills registered yet. Register skills from the canonical catalog to generate your tailored AI career insights and gap diagnosis.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => onNavigate('skills')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Technical Skills</span>
                  </button>
                </div>
              </>
            )}
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

        {recommendedOpportunity ? (
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

                {recommendedOpportunity.requiredSkills && recommendedOpportunity.requiredSkills.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Key Skills:</span>
                    <span>{recommendedOpportunity.requiredSkills.join(' · ')}</span>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {typeof recommendedOpportunity.matchScore === 'number' && (
                  <div className="sm:text-right">
                    <div className="text-2xl font-bold text-emerald-700 font-mono">
                      {recommendedOpportunity.matchScore}%
                    </div>
                    <div className="text-[10px] text-slate-500">Compatibility Score</div>
                  </div>
                )}

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
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-xs">
            <p className="text-slate-600 font-medium">No live opportunities available at this time.</p>
            <p className="mt-1 text-slate-400">Industry partners regularly post new challenges and project collaborations.</p>
          </div>
        )}
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
            <div className="text-xs text-slate-500 mt-1">Review {profile.skills?.length || 0} registered abilities</div>
          </button>

          <button
            onClick={() => onNavigate('skill-passport')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Skill Passport</div>
            <div className="text-xs text-slate-500 mt-1">Verifiable competency portfolio</div>
          </button>

          <button
            onClick={() => onNavigate('skill-gap')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Skill Gap</div>
            <div className="text-xs text-slate-500 mt-1">Diagnose gaps for {profile.targetRole || 'Target Role'}</div>
          </button>

          <button
            onClick={() => onNavigate('opportunities')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Opportunities</div>
            <div className="text-xs text-slate-500 mt-1">Browse live internships &amp; projects</div>
          </button>
        </div>
      </div>
    </div>
  );
};
