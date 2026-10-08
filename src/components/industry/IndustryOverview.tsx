import React, { useEffect, useState } from 'react';
import { IndustryChallenge, IndustryNavView } from '../../types';
import { Plus, ArrowRight, Building2, CheckCircle2, Clock, Users, Cpu, Loader2, RefreshCw } from 'lucide-react';
import { industryApi } from '../../services/api';

interface IndustryOverviewProps {
  challenge: IndustryChallenge;
  onNavigate: (view: IndustryNavView) => void;
  onSelectChallenge?: (challenge: IndustryChallenge) => void;
}

export const IndustryOverview: React.FC<IndustryOverviewProps> = ({
  challenge,
  onNavigate,
  onSelectChallenge,
}) => {
  const [industryName, setIndustryName] = useState<string>('ABC Technologies');
  const [challengesList, setChallengesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchIndustryData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch profile
      const profRes = await industryApi.getProfile().catch(() => null);
      if (profRes && profRes.company_name) {
        setIndustryName(profRes.company_name);
      }

      // 2. Fetch challenges
      const chalRes = await industryApi.getChallenges().catch(() => null);
      if (chalRes && Array.isArray(chalRes)) {
        setChallengesList(chalRes);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustryData();
  }, []);

  const activeChallengeItem = challengesList.length > 0 ? challengesList[0] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 1. HEADER & PRIMARY CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
        <div>
          <span className="text-sm font-semibold text-emerald-700">Enterprise Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome, {industryName}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Find the right academic partner for your real-world challenges.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchIndustryData}
            title="Refresh challenges from backend"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('post-challenge')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Challenge</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE CHALLENGE CARD / EMPTY STATE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Active Challenges ({challengesList.length > 0 ? challengesList.length : '1 Demo'})
          </h2>
          <span className="text-xs text-blue-700 font-mono">
            Status: {activeChallengeItem?.status || challenge.status}
          </span>
        </div>

        {activeChallengeItem ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Domain: {activeChallengeItem.domain || 'Industrial Engineering'}</span>
                  <span aria-hidden="true">·</span>
                  <span>Type: {activeChallengeItem.collaboration_type || 'Academic Collaboration'}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{activeChallengeItem.title}</h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {activeChallengeItem.description}
                </p>

                {activeChallengeItem.requirements && activeChallengeItem.requirements.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Required Skills:</span>
                    {activeChallengeItem.requirements.map((r: any, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 text-[11px] font-medium">
                        {r.skill?.name || r.extracted_skill_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="sm:text-right">
                  <div className="text-2xl font-bold text-[#173B63] font-mono">
                    {activeChallengeItem.id ? 'Live' : challenge.academicMatchesCount}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {activeChallengeItem.is_analyzed ? 'AI Analyzed' : 'Ready for Matching'}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('ai-matching')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <span>View Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Domain: {challenge.domain}</span>
                  <span aria-hidden="true">·</span>
                  <span>Type: {challenge.collaborationType}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{challenge.title}</h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {challenge.description}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Required Skills:</span>
                  <span>{challenge.requiredSkills.join(' · ')}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="sm:text-right">
                  <div className="text-2xl font-bold text-[#173B63] font-mono">
                    {challenge.academicMatchesCount}
                  </div>
                  <div className="text-[10px] text-slate-500">Academic Matches</div>
                </div>

                <button
                  onClick={() => onNavigate('ai-matching')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <span>View Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACTIVE COLLABORATION */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Active Academic Collaboration
        </h2>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-xs font-semibold text-emerald-700">Sprint Milestone 4 of 6</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  ABC Engineering College
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Project: AI Manufacturing Defect Detection
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Project Progress</span>
                  <span className="font-mono text-blue-700">70%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[70%]" />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Faculty Mentor: Prof. Anjali Mehta</span>
                <span aria-hidden="true">·</span>
                <span>Student Team: 3 Engineers (inc. Vijay Bhosale)</span>
              </div>
            </div>

            <div className="shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => onNavigate('workspace')}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                Open Workspace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY TIMELINE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
            <Clock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">
                Validation accuracy reached 97.2% on scratch dataset
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Updated by Vijay Bhosale (Lead Student Engineer) · 2 hours ago
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">
                Milestone 3 Deliverable (Annotated Defect Dataset) Signed Off
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Verified by Dr. Rajesh Nair (Industry Lead) · 2 days ago
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">
                Deterministic matching engine initialized for industry challenges
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Automated matching pipeline · Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
