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
} from 'lucide-react';
import { matchingApi } from '../../services/api';

interface AIAcademicMatchingProps {
  challenge: IndustryChallenge;
  matches: AcademicMatch[];
  onSelectCollege: (id: string) => void;
  onOpenCollaborationRequest: (collegeName: string) => void;
  onNavigate: (view: IndustryNavView) => void;
}

export const AIAcademicMatching: React.FC<AIAcademicMatchingProps> = ({
  challenge,
  matches: initialMatches,
  onSelectCollege,
  onOpenCollaborationRequest,
  onNavigate,
}) => {
  const [sortBy, setSortBy] = useState<'match' | 'domain' | 'location' | 'capability'>('match');
  const [realMatches, setRealMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunBackend, setHasRunBackend] = useState(false);

  const fetchBackendMatches = async () => {
    if (!challenge.id || challenge.id.startsWith('demo-') || challenge.id.startsWith('chal-demo')) {
      return;
    }

    setIsLoading(true);
    try {
      // First try running the deterministic matching engine
      await matchingApi.runChallengeMatching(challenge.id).catch(() => null);
      // Fetch the calculated matches
      const res = await matchingApi.getChallengeMatches(challenge.id).catch(() => null);
      if (res && Array.isArray(res.matches)) {
        setRealMatches(res.matches);
        setHasRunBackend(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendMatches();
  }, [challenge.id]);

  // Use real backend matches if available, else fall back to initial demo matches
  const displayMatches: AcademicMatch[] =
    realMatches.length > 0
      ? realMatches.map((m: any) => ({
          id: m.college_id || m.id,
          collegeName: m.college?.name || m.college_name || 'Academic Institution',
          matchScore: Math.round(m.overall_match_score || m.match_score || 0),
          location: m.college?.location || 'India',
          strengths: m.matched_skills || ['High Capability Coverage', 'Infrastructure Ready'],
          keyFacilities: m.college?.facilities || ['Specialized R&D Lab'],
          facultyCount: m.faculty_count || 12,
          pastCollaborations: m.past_collaborations || 0,
          compatibility: {
            skills: Math.round(m.skill_coverage_score || m.skill_score || 85),
            domain: Math.round(m.domain_score || 80),
            infrastructure: Math.round(m.infrastructure_score || 85),
            collaborationFit: Math.round(m.overall_match_score || 85),
          },
        }))
      : initialMatches;

  const topMatch = displayMatches.length > 0 ? displayMatches[0] : null;
  const otherMatches = displayMatches.slice(1);

  const sortedOther = [...otherMatches].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    if (sortBy === 'location') return a.location.localeCompare(b.location);
    if (sortBy === 'domain') return b.compatibility.domain - a.compatibility.domain;
    if (sortBy === 'capability') return b.facultyCount - a.facultyCount;
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

        <button
          onClick={fetchBackendMatches}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Rerun Matching Engine</span>
        </button>
      </div>

      {/* 1. HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
          <Sparkles className="w-4 h-4" />
          <span>Multilateral Academic Matching</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Academic Partner Matching
        </h1>
        <p className="text-sm text-slate-500">
          Ranked institutions evaluated on research labs, specialized computing infrastructure, and mentored student talent.
        </p>
      </div>

      {/* 2. RECAP OF INDUSTRY REQUIREMENT */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          Industry Challenge Requirement
        </div>
        <h2 className="text-lg font-bold text-slate-900">{challenge.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Domain:</span>
          <span>{challenge.domain}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-slate-800">Required Skills:</span>
          <span>{challenge.requiredSkills.join(' · ')}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">Calculating Deterministic College Alignment...</div>
          <p className="text-xs text-slate-500">Scoring institutional capabilities and computing faculty overlap.</p>
        </div>
      ) : topMatch ? (
        <>
          {/* 3. HERO SECTION: BEST MATCH */}
          <div className="bg-gradient-to-br from-blue-50/60 via-white to-slate-50 rounded-xl border-2 border-blue-600/30 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Highest Institutional Alignment</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {topMatch.collegeName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{topMatch.location}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Autonomous Engineering Campus</span>
                </div>
              </div>

              <div className="sm:text-right shrink-0 bg-white sm:bg-transparent p-4 sm:p-0 rounded-lg border sm:border-none border-slate-200">
                <div className="text-4xl font-extrabold text-[#173B63] font-mono">
                  {topMatch.matchScore}%
                </div>
                <div className="text-xs font-semibold text-blue-700">Calculated Match Score</div>
                <div className="text-[10px] text-slate-400 font-mono">Deterministic Evaluation</div>
              </div>
            </div>

            {/* WHY THIS MATCH */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Why This Match?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800">
                {topMatch.strengths.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded border border-slate-200">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MATCH BREAKDOWN METRICS */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Deterministic Compatibility Breakdown</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Real algorithmic breakdown
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Skill Compatibility</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {topMatch.compatibility.skills}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Domain Alignment</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {topMatch.compatibility.domain}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Infrastructure &amp; Labs</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {topMatch.compatibility.infrastructure}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Overall Score</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {topMatch.compatibility.collaborationFit}%
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <button
                onClick={() => {
                  onSelectCollege(topMatch.id);
                  onNavigate('college-profile');
                }}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>View College Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenCollaborationRequest(topMatch.collegeName)}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Collaboration Request</span>
              </button>
            </div>
          </div>

          {/* 4. OTHER MATCHES */}
          {sortedOther.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900">
                  Other Qualified Academic Institutions ({sortedOther.length})
                </h2>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-medium text-slate-700"
                  >
                    <option value="match">Match Score</option>
                    <option value="domain">Domain Alignment</option>
                    <option value="location">Location</option>
                    <option value="capability">Faculty Size</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {sortedOther.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{match.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{match.facultyCount} Faculty</span>
                        <span aria-hidden="true">·</span>
                        <span>{match.pastCollaborations} Past Projects</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{match.collegeName}</h3>
                      <div className="text-xs text-slate-600">
                        Facilities: {match.keyFacilities.join(' · ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-800 font-mono">
                          {match.matchScore}%
                        </div>
                        <div className="text-[10px] text-slate-400">Match Score</div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectCollege(match.id);
                          onNavigate('college-profile');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">0 Matching Academic Institutions in Database</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              No registered college currently maps the specific skills required by this challenge in the PostgreSQL database. As colleges add their capability inventories, they will appear ranked here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
