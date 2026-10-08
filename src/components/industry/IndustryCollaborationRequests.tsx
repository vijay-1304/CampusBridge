import React, { useEffect, useState } from 'react';
import { IndustryNavView } from '../../types';
import {
  Building2,
  School,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { collaborationApi } from '../../services/api';

interface IndustryCollaborationRequestsProps {
  onNavigate: (view: IndustryNavView) => void;
  onOpenWorkspace: (collaborationId?: string) => void;
}

export const IndustryCollaborationRequests: React.FC<IndustryCollaborationRequestsProps> = ({
  onNavigate,
  onOpenWorkspace,
}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await collaborationApi.getRequests();
      setRequests(res.requests || []);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load collaboration requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Declined</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Academic Review</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* GLOBAL BACK BUTTON & REFRESH */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('overview')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Industry Dashboard</span>
        </button>

        <button
          onClick={fetchRequests}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Outgoing Collaboration Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track real-world collaboration proposals dispatched to evaluated academic institutions.
        </p>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* CONTENT */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">Loading collaboration proposals...</div>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-blue-600" />
                      {req.college_name || 'Academic Institution'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {req.challenge_title || 'Industry Challenge Project'}
                  </h3>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                  {req.match_score !== undefined && req.match_score !== null && (
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-blue-700 font-mono">
                        {Math.round(req.match_score)}%
                      </div>
                      <div className="text-[10px] text-slate-400">Match Fit</div>
                    </div>
                  )}
                  {getStatusBadge(req.status)}
                </div>
              </div>

              {/* MESSAGE / PROPOSAL DETAILS */}
              {req.message && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-2 leading-relaxed">{req.message}</p>
                </div>
              )}

              {/* STATUS SPECIFIC ACTION */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">
                  {req.responded_at
                    ? `Responded on ${new Date(req.responded_at).toLocaleDateString()}`
                    : 'Awaiting institution response'}
                </span>

                {req.status === 'accepted' ? (
                  <button
                    onClick={() => onOpenWorkspace()}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-slate-400 font-medium">Request Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* HONEST EMPTY STATE */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No collaboration requests yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              You haven't initiated any collaboration requests yet. Find academic partners evaluated for your challenges and send partnership proposals.
            </p>
          </div>
          <button
            onClick={() => onNavigate('post-challenge')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <span>View Challenges &amp; Find Partners</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
