import React, { useEffect, useState } from 'react';
import { AcademicMatch, IndustryChallenge, IndustryNavView } from '../../types';
import {
  Sparkles,
  School,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  Send,
  MapPin,
  Users,
  Layers,
  ChevronDown,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react';
import { matchingApi } from '../../services/api';

interface EvaluatedMatch {
  id: string;
  collegeName: string;
  location: string;
  skill_score: number | null;
  capability_score: number | null;
  overall_score: number | null;
  reasoning: string;
  facultyCount: number;
  pastCollaborations: number;
  keyFacilities: string[];
}

interface AIAcademicMatchingProps {
  challenge?: IndustryChallenge | null;
  matches?: AcademicMatch[];
  onSelectCollege: (id: string) => void;
  onOpenCollaborationRequest: (collegeId: string, collegeName: string, matchScore?: number | null) => void;
  onNavigate: (view: IndustryNavView) => void;
}

export const AIAcademicMatching: React.FC<AIAcademicMatchingProps> = ({
  challenge,
  onSelectCollege,
  onOpenCollaborationRequest,
  onNavigate,
}) => {
  const [sortBy, setSortBy] = useState<'overall' | 'skill' | 'capability' | 'location'>('overall');
  const [realMatches, setRealMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBackendMatches = async () => {
    if (!challenge?.id) {
      setRealMatches([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Trigger deterministic matching engine execution
      await matchingApi.runChallengeMatching(challenge.id).catch(() => null);
      // 2. Retrieve persisted ranked matches
      const res = await matchingApi.getChallengeMatches(challenge.id).catch(() => null);
      if (res && Array.isArray(res.matches)) {
        setRealMatches(res.matches);
      } else {
        setRealMatches([]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to evaluate academic matches for this challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendMatches();
  }, [challenge?.id]);

  // Map ONLY real backend matches without fabricated fallbacks
  const displayMatches: EvaluatedMatch[] = realMatches.map((m: any) => ({
    id: m.college_id || m.id || 'unknown-id',
    collegeName: m.college_name || m.college?.name || 'Academic Institution',
    location: m.college_location || m.college?.location || 'Location Not Specified',
    skill_score: typeof m.skill_score === 'number' ? m.skill_score : null,
    capability_score: typeof m.capability_score === 'number' ? m.capability_score : null,
    overall_score: typeof m.overall_score === 'number' ? m.overall_score : null,
    reasoning: m.reasoning || 'Evaluated through deterministic capability matching.',
    facultyCount: typeof m.faculty_count === 'number' ? m.faculty_count : 0,
    pastCollaborations: typeof m.past_collaborations === 'number' ? m.past_collaborations : 0,
    keyFacilities: Array.isArray(m.facilities) ? m.facilities : [],
  }));

  const topMatch = displayMatches.length > 0 ? displayMatches[0] : null;
  const otherMatches = displayMatches.slice(1);

  const sortedOther = [...otherMatches].sort((a, b) => {
    if (sortBy === 'overall') return (b.overall_score ?? -1) - (a.overall_score ?? -1);
    if (sortBy === 'skill') return (b.skill_score ?? -1) - (a.skill_score ?? -1);
    if (sortBy === 'capability') return (b.capability_score ?? -1) - (a.capability_score ?? -1);
    if (sortBy === 'location') return (a.location || '').localeCompare(b.location || '');
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* GLOBAL BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('overview')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Industry Dashboard</span>
        </button>

        {challenge?.id && (
          <button
            onClick={fetchBackendMatches}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Rerun Matching Engine</span>
          </button>
        )}
      </div>

      {/* 1. HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
          <Sparkles className="w-4 h-4" />
          <span>Deterministic Academic Matching</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Academic Partner Matching
        </h1>
        <p className="text-sm text-slate-500">
          Ranked institutions evaluated strictly through deterministic proficiency fit and verified capability records.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Matching evaluation message</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Active Challenge Indicator */}
      {challenge?.title ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Evaluating Challenge: </span>
            <span className="font-bold text-slate-900">{challenge.title}</span>
          </div>
          <span className="text-blue-700 font-semibold font-mono">
            {displayMatches.length} Matches Ranked
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Active Challenge Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Please post or select an industry challenge to evaluate matching academic institutions.
          </p>
          <button
            onClick={() => onNavigate('post-challenge')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post a Challenge</span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs">Calculating deterministic match affinity against registered college capabilities...</p>
        </div>
      )}

      {!isLoading && challenge?.title && displayMatches.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
          <School className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Academic Matches Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No registered colleges currently match the extracted skill requirements for this challenge. As institutions add matching faculty capabilities, scores will compute automatically.
          </p>
          <button
            onClick={fetchBackendMatches}
            className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rerun Evaluation</span>
          </button>
        </div>
      )}

      {!isLoading && topMatch && (
        <>
          {/* 2. TOP MATCH (HIGHEST AFFINITY INSTITUTION) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Rank #1 Match</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Deterministic Top Fit</span>
            </div>

            <div className="bg-white rounded-xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {topMatch.collegeName}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{topMatch.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Why this match score */}
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Affinity Evaluation: </span>
                    <span>{topMatch.reasoning}</span>
                  </div>

                  {/* Score Breakdown (Skill vs Capability) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <div className="text-[11px] font-semibold text-emerald-900">Overall Affinity</div>
                      <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                        {topMatch.overall_score !== null ? `${topMatch.overall_score}%` : 'N/A'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                      <div className="text-[11px] font-semibold text-blue-900">Skill Fit (70%)</div>
                      <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">
                        {topMatch.skill_score !== null ? `${topMatch.skill_score}%` : 'N/A'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                      <div className="text-[11px] font-semibold text-slate-700">Capability Fit (30%)</div>
                      <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">
                        {topMatch.capability_score !== null ? `${topMatch.capability_score}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match CTA Action */}
                <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() =>
                      onOpenCollaborationRequest(
                        topMatch.id,
                        topMatch.collegeName,
                        topMatch.overall_score
                      )
                    }
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Collaboration</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectCollege(topMatch.id);
                      onNavigate('college-profile');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span>View Institution Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. OTHER RANKED MATCHES */}
          {sortedOther.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Other Evaluated Institutions ({sortedOther.length})
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="overall">Overall Score</option>
                    <option value="skill">Skill Score</option>
                    <option value="capability">Capability Score</option>
                    <option value="location">Location</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {sortedOther.map((match, idx) => (
                  <div
                    key={match.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">#{idx + 2}</span>
                        <h4 className="text-base font-bold text-slate-900">{match.collegeName}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{match.location}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{match.reasoning}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-[#173B63]">
                          {match.overall_score !== null ? `${match.overall_score}%` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">Match Affinity</div>
                      </div>

                      <button
                        onClick={() =>
                          onOpenCollaborationRequest(
                            match.id,
                            match.collegeName,
                            match.overall_score
                          )
                        }
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
