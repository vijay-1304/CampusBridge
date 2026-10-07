import React from 'react';
import { CollegeDetail, CollegeNavView } from '../../types';
import { School, Building2, Users, Cpu, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

interface CollegeOverviewProps {
  college: CollegeDetail;
  pendingRequestsCount: number;
  onNavigate: (view: CollegeNavView) => void;
}

export const CollegeOverview: React.FC<CollegeOverviewProps> = ({
  college,
  pendingRequestsCount,
  onNavigate,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 1. INSTITUTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
        <div>
          <span className="text-sm font-semibold text-amber-700">Institutional Administration</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {college.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{college.tagline}</p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => onNavigate('requests')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>View Collaboration Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-full text-[10px]">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

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
            Edit Profile →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {college.capabilities.faculty}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Faculty Mentors</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {college.capabilities.students}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Active Students</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {college.capabilities.specializedLabs}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Specialized Labs</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {college.industryCollaborationsCompleted}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Completed Collabs</div>
          </div>
        </div>
      </div>

      {/* 3. PENDING COLLABORATION REQUESTS PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Incoming Industry Request
          </h2>
          <span className="text-xs text-amber-700 font-semibold">Requires Review</span>
        </div>

        <div className="bg-amber-50/40 rounded-xl border border-amber-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-800">ABC Technologies</span>
                <span aria-hidden="true">·</span>
                <span>Industrial Automation Division</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                AI-Based Manufacturing Defect Detection
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Targeting 10-week joint research sprint with Computer Vision Lab and student capstone team.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Matched Facilities:</span>
                <span>CV Lab · AI High-Compute GPU Cluster</span>
              </div>
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
      </div>

      {/* 4. ACTIVE COLLABORATIONS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Active Collaborations
        </h2>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-emerald-700 font-semibold">In Progress · Sprint 4/6</div>
            <h3 className="text-base font-bold text-slate-900">
              AI Manufacturing Defect Detection (with ABC Technologies)
            </h3>
            <div className="text-xs text-slate-500">
              Student Lead: Vijay Bhosale · Mentor: Prof. Anjali Mehta
            </div>
          </div>

          <button
            onClick={() => onNavigate('workspace')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            Open Active Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
