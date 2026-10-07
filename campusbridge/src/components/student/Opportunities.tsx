import React, { useState } from 'react';
import { Opportunity, StudentNavView } from '../../types';
import { Search, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OpportunitiesProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (id: string) => void;
  onNavigate: (view: StudentNavView) => void;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({
  opportunities,
  onSelectOpportunity,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Internship' | 'Project' | 'Job' | 'Research' | 'Workshop'>('All');

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = activeFilter === 'All' || opp.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Opportunities for You
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Industry challenges, internships, and research collaborations ranked by your profile compatibility.
        </p>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, company name, or technology (e.g. OpenCV, Python)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
          />
        </div>

        {/* Filter Tabs (Functional buttons, single line) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['All', 'Internship', 'Project', 'Job', 'Research', 'Workshop'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-[#173B63] text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {filter === 'All'
                ? 'All Opportunities'
                : filter === 'Research'
                ? 'Research'
                : `${filter}s`}
            </button>
          ))}
        </div>
      </div>

      {/* OPPORTUNITY CARDS */}
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
                <span>{opp.location}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">{opp.title}</h2>

              <p className="text-xs text-slate-600 line-clamp-2 max-w-xl">{opp.description}</p>

              {/* Skills required - unboxed list */}
              <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Required Skills:</span>
                <span>{opp.requiredSkills.join(' · ')}</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="sm:text-right">
                <div className="text-2xl font-bold text-emerald-700 font-mono">
                  {opp.matchScore}%
                </div>
                <div className="text-[10px] text-slate-500">Illustrative Match</div>
              </div>

              <button
                onClick={() => {
                  onSelectOpportunity(opp.id);
                  onNavigate('opportunity-detail');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 text-slate-500 text-sm">
            No opportunities match your current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
