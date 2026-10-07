import React, { useState } from 'react';
import { Opportunity, StudentNavView } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
  Check,
  Bookmark,
  Share2,
} from 'lucide-react';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  onBack: () => void;
  onApply: (opp: Opportunity) => void;
  isApplied: boolean;
  onNavigate: (view: StudentNavView) => void;
}

export const OpportunityDetail: React.FC<OpportunityDetailProps> = ({
  opportunity,
  onBack,
  onApply,
  isApplied,
  onNavigate,
}) => {
  const [saved, setSaved] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const handleApplyClick = () => {
    onApply(opportunity);
    setJustApplied(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* BACK NAVIGATION */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </button>

      {/* HEADER CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-800">{opportunity.company}</span>
              <span aria-hidden="true">·</span>
              <span>{opportunity.type}</span>
              <span aria-hidden="true">·</span>
              <span>{opportunity.postedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {opportunity.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{opportunity.duration}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{opportunity.location}</span>
              </span>
              <span className="font-semibold text-slate-800">{opportunity.stipend}</span>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-lg border sm:border-none border-slate-100 flex sm:flex-col items-center sm:items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-emerald-700 font-mono">
                {opportunity.matchScore}%
              </div>
              <div className="text-[10px] text-slate-500">Illustrative Match</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {isApplied || justApplied ? (
            <div className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Application Submitted (Under Review)</span>
            </div>
          ) : (
            <button
              onClick={handleApplyClick}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors shadow-sm"
            >
              Apply Now
            </button>
          )}

          <button
            onClick={() => setSaved(!saved)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
              saved
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{saved ? 'Saved' : 'Save Opportunity'}</span>
          </button>

          {(isApplied || justApplied) && (
            <button
              onClick={() => onNavigate('applications')}
              className="text-xs font-medium text-blue-700 hover:underline ml-2"
            >
              View in Applications Tab →
            </button>
          )}
        </div>
      </div>

      {/* WHY YOU MATCH VS CAN IMPROVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 mb-3 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Why You Match
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            These skills on your verified profile align with ABC Technologies technical requirements:
          </p>
          <div className="space-y-2">
            {opportunity.matchingSkills.map((s) => (
              <div key={s} className="flex items-center gap-2 text-xs font-medium text-slate-800 p-2 bg-emerald-50/40 rounded border border-emerald-100">
                <span className="text-emerald-700">✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 mb-3 pb-2 border-b border-slate-100">
            <AlertCircle className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              You Can Improve
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Acquiring these competencies will boost your performance in this role:
          </p>
          <div className="space-y-2">
            {opportunity.gapSkills.map((g) => (
              <div key={g} className="flex items-center justify-between text-xs font-medium text-slate-800 p-2 bg-amber-50/40 rounded border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">⚠</span>
                  <span>{g}</span>
                </div>
                <button
                  onClick={() => onNavigate('skill-gap')}
                  className="text-[11px] text-blue-700 hover:underline"
                >
                  View Learning Path
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT DESCRIPTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About the Opportunity</h2>
        <p className="text-sm text-slate-700 leading-relaxed">{opportunity.description}</p>
      </div>

      {/* REQUIRED SKILLS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Required Skills</h2>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          {opportunity.requiredSkills.map((s) => (
            <span key={s} className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-md font-medium">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* WHAT YOU WILL DO */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">What You Will Do</h2>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          {opportunity.whatYouWillDo.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
