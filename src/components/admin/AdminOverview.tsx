import React, { useEffect, useState } from 'react';
import { AdminNavView } from '../../types';
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
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { collaborationApi } from '../../services/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'industry' | 'college' | 'admin';
  organization: string;
  status: 'active' | 'pending' | 'suspended';
  verified: boolean;
  joinedDate: string;
}

export interface AdminOrg {
  id: string;
  name: string;
  type: 'college' | 'industry';
  location: string;
  accredited: boolean;
  activeProjects: number;
  contactEmail: string;
}

interface AdminOverviewProps {
  activeView?: AdminNavView;
  onNavigate?: (view: AdminNavView) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  activeView = 'overview',
  onNavigate,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminNavView>(activeView);
  const [collabs, setCollabs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep in sync if parent passed activeView
  useEffect(() => {
    if (activeView) {
      setCurrentTab(activeView);
    }
  }, [activeView]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await collaborationApi.getCollaborations().catch(() => null);
      if (res && Array.isArray(res.collaborations)) {
        setCollabs(res.collaborations);
      } else {
        setCollabs([]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load system collaborations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTabChange = (tab: AdminNavView) => {
    setCurrentTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

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
          <button
            onClick={fetchAdminData}
            title="Refresh"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Platform Operational</span>
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Administration alert</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'Users & Roles', icon: Users },
          { id: 'organizations', label: 'Organizations', icon: School },
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

      {/* TAB CONTENT */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Active Workspaces
                </span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">{collabs.length}</div>
              <div className="text-xs text-slate-500 mt-1">Live joint collaborations</div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Backend API Engine
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-2">FastAPI</div>
              <div className="text-xs text-slate-500 mt-1">Deterministic matching active</div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Security State
                </span>
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700 font-mono mt-2">JWT RBAC</div>
              <div className="text-xs text-slate-500 mt-1">Strict role-based authorization</div>
            </div>
          </div>

          {/* Collaborations overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Platform Collaborations</h2>
            {collabs.length > 0 ? (
              <div className="space-y-3">
                {collabs.map((c) => (
                  <div key={c.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{c.title || 'Collaboration Workspace'}</div>
                      <div className="text-slate-500 mt-0.5">Status: {c.status} · Progress: {c.progress || 0}%</div>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-semibold self-start sm:self-auto">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No active collaborations across the platform at this time.
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">User Identity &amp; Role Governance</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            User access is strictly enforced via JWT authentication tokens and PostgreSQL role-based authorization. Individual user records and sessions are managed securely through the authenticated backend.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <strong>Security Notice:</strong> Direct modification of user identity records is restricted to authenticated administrative endpoints.
          </div>
        </div>
      )}

      {currentTab === 'organizations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-700">
            <School className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">Institutional Accreditation &amp; Enterprise Governance</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Colleges register faculty capabilities and lab infrastructure, while industry partners publish technical problem statements. All institutional records maintain cryptographic audit trails.
          </p>
        </div>
      )}

      {currentTab === 'collaborations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Live Joint Collaborations ({collabs.length})</h2>
          {collabs.length > 0 ? (
            <div className="space-y-3">
              {collabs.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{c.title || 'Collaboration Workspace'}</div>
                    <div className="text-slate-500 mt-0.5">
                      College: {c.college_name || 'Academic Institution'} · Industry: {c.industry_name || 'Enterprise Partner'}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold self-start sm:self-auto">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No collaboration workspaces currently recorded.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
