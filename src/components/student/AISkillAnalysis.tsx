import React from 'react';
import { StudentProfile, StudentNavView } from '../../types';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, Lightbulb, Plus } from 'lucide-react';

interface AISkillAnalysisProps {
  profile: StudentProfile;
  onNavigate: (view: StudentNavView) => void;
}

export const AISkillAnalysis: React.FC<AISkillAnalysisProps> = ({ profile, onNavigate }) => {
  // Derive strengths from profile.strengths or skills with Advanced/Intermediate level
  const strengths = profile.strengths && profile.strengths.length > 0
    ? profile.strengths
    : (profile.skills || [])
        .filter((s) => s.proficiency === 'Advanced')
        .map((s) => s.name);

  // Derive developing from profile.developing or skills with Beginner level
  const developing = profile.developing && profile.developing.length > 0
    ? profile.developing
    : (profile.skills || [])
        .filter((s) => s.proficiency === 'Beginner' || s.proficiency === 'Intermediate')
        .map((s) => s.name);

  const recommendedSkills = profile.recommendedSkills || [];
  const targetRole = profile.targetRole || 'Software / AI Engineer';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* GLOBAL BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('skills')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Skills</span>
        </button>
      </div>

      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
          <Sparkles className="w-4 h-4" />
          <span>AI Skill Analysis · Role Alignment Diagnostics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your AI Skill Analysis
        </h1>
        <p className="text-sm text-slate-600">
          Evaluation derived from your registered skills, coursework, and technical inventory.
        </p>
      </div>

      {/* 3 CORE PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STRENGTHS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 mb-4 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Validated Strengths ({strengths.length})
            </h2>
          </div>
          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((skillName) => (
                <div key={skillName} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs">
                  <span className="font-semibold text-slate-800">{skillName}</span>
                  <span className="font-mono text-emerald-700 font-medium">Verified / Advanced</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              <p>No high-proficiency strengths recorded yet.</p>
              <button
                onClick={() => onNavigate('skills')}
                className="mt-2 text-xs text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register your strongest skills</span>
              </button>
            </div>
          )}
        </div>

        {/* DEVELOPING */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 mb-4 pb-2 border-b border-slate-100">
            <TrendingUp className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Developing Competencies ({developing.length})
            </h2>
          </div>
          {developing.length > 0 ? (
            <div className="space-y-3">
              {developing.map((skillName) => (
                <div key={skillName} className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{skillName}</span>
                    <span className="font-mono text-amber-700 font-medium">In Progress</span>
                  </div>
                  <p className="mt-1 text-slate-600 text-[11px]">
                    Foundational competency registered. Recommended for capstone project application.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              <p>No beginner or in-progress competencies logged.</p>
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDED NEXT SKILLS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-700">
            <Lightbulb className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Recommended Next Skills
            </h2>
          </div>
          <span className="text-xs text-slate-400">Target Role: {targetRole}</span>
        </div>

        {recommendedSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedSkills.map((rec) => (
              <div
                key={rec.name}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 text-sm">{rec.name}</span>
                  {typeof rec.demandCount === 'number' && (
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {rec.demandCount} opportunities
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rec.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            <p>Recommendations are generated as you map skills and explore live industry challenges.</p>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={() => onNavigate('skill-gap')}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Explore Learning Path</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
