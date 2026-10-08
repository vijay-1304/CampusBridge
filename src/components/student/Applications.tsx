import React, { useState } from 'react';
import { ApplicationItem, StudentNavView } from '../../types';
import { Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

interface ApplicationsProps {
  applications: ApplicationItem[];
  onNavigate: (view: StudentNavView) => void;
}

export const Applications: React.FC<ApplicationsProps> = ({ applications, onNavigate }) => {
  const [filter, setFilter] = useState<'All' | 'Applied' | 'Under Review' | 'Accepted' | 'Rejected'>('All');

  const filtered = applications.filter((app) => {
    if (filter === 'All') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Under Review
          </span>
        );
      case 'Applied':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Applied
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* GLOBAL BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('opportunities')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track the progress of your submitted internship and collaboration proposals.
          </p>
        </div>

        <button
          onClick={() => onNavigate('opportunities')}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Find more opportunities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* FILTER TABS (Functional buttons, single-line) */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {(['All', 'Applied', 'Under Review', 'Accepted', 'Rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
              filter === tab
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* APPLICATIONS LIST */}
      <div className="space-y-4">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{app.company}</span>
                <span aria-hidden="true">·</span>
                <span>{app.type}</span>
                <span aria-hidden="true">·</span>
                <span>Applied {app.appliedDate}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{app.opportunityTitle}</h2>
              {app.feedback && (
                <p className="text-xs text-slate-600 pt-1 italic">{app.feedback}</p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">{getStatusBadge(app.status)}</div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 text-slate-500 text-sm">
            No applications currently in this status category.
          </div>
        )}
      </div>
    </div>
  );
};
