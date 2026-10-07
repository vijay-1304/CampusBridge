import React from 'react';
import { StudentProfile, StudentNavView } from '../../types';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';

interface AISkillAnalysisProps {
  profile: StudentProfile;
  onNavigate: (view: StudentNavView) => void;
}

export const AISkillAnalysis: React.FC<AISkillAnalysisProps> = ({ profile, onNavigate }) => {
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
          <span>AI Prototype Analysis · Simulated AI Insight</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your AI Skill Analysis
        </h1>
        <p className="text-sm text-slate-600">
          Simulated evaluation based on your student profile, academic coursework, and project track record.
        </p>
      </div>

      {/* 3 CORE PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STRENGTHS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 mb-4 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Validated Strengths
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs">
              <span className="font-semibold text-slate-800">Python</span>
              <span className="font-mono text-emerald-700 font-medium">Strong · High Competency</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs">
              <span className="font-semibold text-slate-800">JavaScript</span>
              <span className="font-mono text-emerald-700 font-medium">Strong · Full Stack</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs">
              <span className="font-semibold text-slate-800">React</span>
              <span className="font-mono text-emerald-700 font-medium">Good · Production Projects</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs">
              <span className="font-semibold text-slate-800">SQL</span>
              <span className="font-mono text-emerald-700 font-medium">Strong · Relational Schemas</span>
            </div>
          </div>
        </div>

        {/* DEVELOPING */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 mb-4 pb-2 border-b border-slate-100">
            <TrendingUp className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Developing Competencies
            </h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Machine Learning</span>
                <span className="font-mono text-amber-700 font-medium">Intermediate</span>
              </div>
              <p className="mt-1 text-slate-600 text-[11px]">
                Strong conceptual foundations; ready for high-scale pipeline deployment and edge inference.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Computer Vision</span>
                <span className="font-mono text-amber-700 font-medium">Beginner</span>
              </div>
              <p className="mt-1 text-slate-600 text-[11px]">
                Initial coursework completed; requires hands-on OpenCV project experience with camera calibration.
              </p>
            </div>
          </div>
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
          <span className="text-xs text-slate-400">Target Role: AI / ML Engineer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.recommendedSkills.map((rec) => (
            <div
              key={rec.name}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 text-sm">{rec.name}</span>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {rec.demandCount} opportunities
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rec.reason}</p>
            </div>
          ))}
        </div>

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
