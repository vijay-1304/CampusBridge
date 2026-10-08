import React, { useState } from 'react';
import { Opportunity, CollegeNavView } from '../../types';
import { Building2, Search, ArrowRight, ArrowLeft, CheckCircle2, Users, Send } from 'lucide-react';

interface CollegeOpportunitiesViewProps {
  opportunities: Opportunity[];
  onNavigate: (view: CollegeNavView) => void;
}

export const CollegeOpportunitiesView: React.FC<CollegeOpportunitiesViewProps> = ({
  opportunities,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Internship' | 'Project' | 'Research'>('All');
  const [nominatedMap, setNominatedMap] = useState<Record<string, boolean>>({});

  const filtered = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company.toLowerCase().includes(search.toLowerCase()) ||
      o.requiredSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'All' || o.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleNominate = (id: string) => {
    setNominatedMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* GLOBAL BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('overview')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to College Overview</span>
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Industry Opportunities &amp; Placements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse active industry hiring drives and research projects seeking academic nominations.
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, challenge, or required technology..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['All', 'Internship', 'Project', 'Research'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3.5 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                filter === t
                  ? 'bg-[#173B63] text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {t === 'All' ? 'All Industry Calls' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* OPPORTUNITY CARDS FOR COLLEGE */}
      <div className="space-y-4">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{opp.company}</span>
                <span aria-hidden="true">·</span>
                <span>{opp.type}</span>
                <span aria-hidden="true">·</span>
                <span>{opp.duration}</span>
                <span aria-hidden="true">·</span>
                <span>{opp.stipend}</span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">{opp.title}</h2>
              <p className="text-xs text-slate-600 line-clamp-2 max-w-xl">{opp.description}</p>

              <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Target Skills:</span>
                <span>{opp.requiredSkills.join(' · ')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="sm:text-right">
                <span className="text-xs font-semibold text-blue-700 font-mono">
                  12 eligible students
                </span>
                <div className="text-[10px] text-slate-400">e.g. Vijay Bhosale (91% match)</div>
              </div>

              {nominatedMap[opp.id] ? (
                <div className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student Batch Nominated</span>
                </div>
              ) : (
                <button
                  onClick={() => handleNominate(opp.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors whitespace-nowrap shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Nominate Department Students</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
