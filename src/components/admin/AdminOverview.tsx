import React, { useState } from 'react';
import { AdminNavView } from '../../types';
import {
  mockAdminUsers,
  mockAdminOrganizations,
  mockAdminCollaborations,
  AdminUser,
  AdminOrg,
  AdminCollaborationItem,
} from '../../data/mockData';
import {
  Shield,
  Users,
  Building2,
  School,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Activity,
  Layers,
} from 'lucide-react';

interface AdminOverviewProps {
  activeView?: AdminNavView;
  onNavigate?: (view: AdminNavView) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  activeView = 'overview',
  onNavigate,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminNavView>(activeView);
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [orgs, setOrgs] = useState<AdminOrg[]>(mockAdminOrganizations);
  const [collabs, setCollabs] = useState<AdminCollaborationItem[]>(mockAdminCollaborations);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');

  // Keep in sync if parent passed activeView
  React.useEffect(() => {
    if (activeView) {
      setCurrentTab(activeView);
    }
  }, [activeView]);

  const handleTabChange = (tab: AdminNavView) => {
    setCurrentTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleToggleUserVerification = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u))
    );
  };

  const handleToggleOrgAccreditation = (id: string) => {
    setOrgs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, accredited: !o.accredited } : o))
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.organization.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* 1. HEADER & SYSTEM STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Platform Operations &amp; Moderation Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CampusBridge Administration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Multilateral network governance for students, accredited colleges, and enterprise sponsors.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Platform Healthy (v1.4)</span>
          </span>
        </div>
      </div>

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'Users & Roles', icon: Users },
          { id: 'organizations', label: 'Organizations', icon: School },
          { id: 'challenges', label: 'Challenges', icon: Sparkles },
          { id: 'collaborations', label: 'Active Collaborations', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as AdminNavView)}
              className={`px-3.5 py-2 font-medium rounded-lg whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#173B63] text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* METRIC OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium">Registered Students</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">1,480</div>
              <div className="text-[11px] text-emerald-600 mt-1">↑ 18% this month</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium">Partner Colleges</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">42</div>
              <div className="text-[11px] text-slate-500 mt-1">Accredited state campuses</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium">Industry Sponsors</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">68</div>
              <div className="text-[11px] text-slate-500 mt-1">Enterprises &amp; Startups</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium">Active Collabs</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">29</div>
              <div className="text-[11px] text-blue-600 mt-1">94% milestone on-time</div>
            </div>
          </div>

          {/* ACTIVE COLLABORATIONS PREVIEW */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Active Collaborations Moderation
              </h2>
              <button
                onClick={() => handleTabChange('collaborations')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                View all active collabs →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {collabs.map((collab) => (
                <div
                  key={collab.id}
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">{collab.title}</div>
                    <div className="text-slate-500 mt-0.5">
                      {collab.industry} × {collab.college} · Student Lead: {collab.studentLead}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded border border-emerald-200 font-mono">
                      {collab.status} ({collab.progress}%)
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px]">
                      {collab.health}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM VERIFICATION QUEUE */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Pending Accreditation &amp; Moderation Queue
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">Dr. Ramesh Kulkarni</span>
                    <span className="text-slate-500"> — Faculty Mentor profile verification (XYZ Engineering College)</span>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('users')}
                  className="px-3 py-1 bg-white border border-amber-300 rounded text-slate-800 font-medium hover:bg-amber-100/50"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & ROLES */}
      {currentTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Users &amp; Role Assignments</h2>
              <p className="text-xs text-slate-500">
                Oversee verified credentials across students, institutional faculty, and industry leaders.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Total {users.length} verified accounts
            </div>
          </div>

          {/* Search & Role Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, or institution..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">Role:</span>
              {(['All', 'Student', 'Faculty Mentor', 'Industry Sponsor'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                    userRoleFilter === r
                      ? 'bg-[#173B63] text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Organization</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{u.organization}</td>
                    <td className="px-4 py-3">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleUserVerification(u.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          u.verified
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {u.verified ? 'Revoke Seal' : 'Approve & Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATIONS */}
      {currentTab === 'organizations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Partner Colleges &amp; Enterprise Sponsors</h2>
              <p className="text-xs text-slate-500">
                Institutional accreditation, MoUs, and enterprise sponsorship governance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      {org.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{org.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{org.location}</div>
                  </div>
                  {org.accredited ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
                      Accredited
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded">
                      Under Audit
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800 font-mono">
                      {org.activeCollaborations}
                    </span>{' '}
                    Active Collabs
                  </div>
                  <div className="text-slate-500">Contact: {org.contactPerson}</div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => handleToggleOrgAccreditation(org.id)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                  >
                    {org.accredited ? 'Update Compliance Details' : 'Verify Institutional Accreditation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CHALLENGES */}
      {currentTab === 'challenges' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Industry Challenge Moderation</h2>
            <p className="text-xs text-slate-500">
              Audit submitted problem statements before matching algorithms distribute them to colleges.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-sm text-slate-900">
                  AI-Based Manufacturing Defect Detection
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px]">
                  Approved &amp; Matching Active (12 Matches)
                </span>
              </div>
              <p className="text-slate-600">
                Sponsor: ABC Technologies · Domain: Manufacturing + AI · Required: Python, OpenCV, Computer Vision, IoT
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-sm text-slate-900">
                  Semiconductor Wafer Anomaly Vision Pipeline
                </div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[11px]">
                  Sprint Active (8 Matches)
                </span>
              </div>
              <p className="text-slate-600">
                Sponsor: DeepVision Systems · Domain: Semiconductor Fabrication · Required: PyTorch, Docker, Vision Transformers
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-sm text-slate-900">
                  Edge IoT High-Speed Vibration Sensing
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-[11px]">
                  Scoping Phase (9 Matches)
                </span>
              </div>
              <p className="text-slate-600">
                Sponsor: Bharat Forge Digital · Domain: Heavy Industry · Required: C++, Python, MQTT, Microcontrollers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COLLABORATIONS */}
      {currentTab === 'collaborations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Active Academic–Industry Workspaces</h2>
            <p className="text-xs text-slate-500">
              Live telemetry monitoring across ongoing joint R&amp;D sprints and student capstones.
            </p>
          </div>

          <div className="space-y-4">
            {collabs.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/30 hover:bg-white hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {c.industry} × {c.college}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-slate-800">Student Lead:</span> {c.studentLead}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded border border-emerald-200 font-mono">
                      {c.progress}% Milestone Progress
                    </span>
                    <div className="text-[11px] text-emerald-600 mt-1 font-medium">Health: {c.health}</div>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
