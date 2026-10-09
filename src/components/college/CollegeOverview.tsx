import React, { useEffect, useState } from 'react';
import { CollegeDetail, CollegeNavView } from '../../types';
import { School, Building2, Users, Cpu, ArrowRight, Clock, CheckCircle2, RefreshCw, AlertCircle, MessageSquare } from 'lucide-react';
import { collegeApi, collaborationApi } from '../../services/api';

interface CollegeOverviewProps {
  college?: CollegeDetail;
  pendingRequestsCount?: number;
  onNavigate: (view: CollegeNavView) => void;
}

export const CollegeOverview: React.FC<CollegeOverviewProps> = ({
  college,
  onNavigate,
}) => {
  const [collegeName, setCollegeName] = useState('Academic Institution');
  const [tagline, setTagline] = useState('Institutional Portal');
  const [facultyCount, setFacultyCount] = useState(0);
  const [capCount, setCapCount] = useState(0);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [collaborationsList, setCollaborationsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch Profile
      const prof = await collegeApi.getProfile().catch(() => null);
      if (prof) {
        if (prof.college_name || prof.full_name) setCollegeName(prof.college_name || prof.full_name);
        if (prof.location) setTagline(`Academic Campus · ${prof.location}`);
      }

      // 2. Fetch Capabilities
      const caps = await collegeApi.getCapabilities().catch(() => null);
      if (caps && Array.isArray(caps)) {
        setCapCount(caps.length);
        const totalFac = caps.reduce((sum: number, c: any) => sum + (c.faculty_count || 0), 0);
        setFacultyCount(totalFac);
      } else {
        setCapCount(0);
        setFacultyCount(0);
      }

      // 3. Fetch Incoming Requests
      const reqRes = await collaborationApi.getRequests().catch(() => null);
      if (reqRes && Array.isArray(reqRes.requests)) {
        setIncomingRequests(reqRes.requests);
      } else {
        setIncomingRequests([]);
      }

      // 4. Fetch Active Collaborations
      const collabRes = await collaborationApi.getCollaborations().catch(() => null);
      if (collabRes && Array.isArray(collabRes.collaborations)) {
        setCollaborationsList(collabRes.collaborations);
      } else {
        setCollaborationsList([]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load college administration data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const pendingRequests = incomingRequests.filter((r) => r.status === 'pending');
  const activeCollab = collaborationsList.length > 0 ? collaborationsList[0] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 1. INSTITUTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
        <div>
          <span className="text-sm font-semibold text-amber-700">Institutional Administration</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {collegeName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{tagline}</p>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchOverviewData}
            title="Refresh from backend"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('requests')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
          >
            <span>View Collaboration Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-full text-[10px]">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load institution data</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={fetchOverviewData} className="text-xs font-semibold text-rose-800 underline">
            Retry
          </button>
        </div>
      )}

      {/* 2. CAPABILITY SUMMARY CARDS (4 Stats) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Institutional Capability Summary
          </h2>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs font-medium text-blue-700 hover:text-blue-900"
          >
            Manage Capabilities →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {facultyCount}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Faculty Mentors</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {capCount}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Capabilities Mapped</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {pendingRequests.length}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Pending Requests</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {collaborationsList.length}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Active Collabs</div>
          </div>
        </div>
      </div>

      {/* 3. PENDING COLLABORATION REQUESTS PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Incoming Industry Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length > 0 && (
            <span className="text-xs text-amber-700 font-semibold">Requires Action</span>
          )}
        </div>

        {pendingRequests.length > 0 ? (
          <div className="bg-amber-50/40 rounded-xl border border-amber-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-800">
                    {pendingRequests[0].company_name || 'Industry Partner'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Formal Collaboration Proposal</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {pendingRequests[0].challenge_title || 'Industry Project Challenge'}
                </h3>
                {pendingRequests[0].message && (
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">
                    "{pendingRequests[0].message}"
                  </p>
                )}
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => onNavigate('requests')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Review Proposal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-xs shadow-xs">
            <p className="text-slate-700 font-medium">No pending collaboration requests at this time.</p>
            <p className="text-slate-400 mt-1">
              When industry partners match your institutional capabilities, formal collaboration proposals will appear here.
            </p>
          </div>
        )}
      </div>

      {/* 4. ACTIVE COLLABORATIONS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Active Collaborations ({collaborationsList.length})
        </h2>

        {activeCollab ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-emerald-700 font-semibold">Status: {activeCollab.status}</div>
              <h3 className="text-base font-bold text-slate-900">
                {activeCollab.title || activeCollab.challenge_title || 'Joint Collaboration'}
              </h3>
              <div className="text-xs text-slate-500">
                Partner: {activeCollab.industry_name || 'Industry Sponsor'} · Milestones: {activeCollab.milestones_count || 0}
              </div>
            </div>

            <button
              onClick={() => onNavigate('workspace')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Open Active Workspace
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-xs shadow-xs">
            <p className="text-slate-700 font-medium">No active collaboration workspaces currently in progress.</p>
            <p className="text-slate-400 mt-1">
              Accept incoming requests to initialize joint project milestones and deliverables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
