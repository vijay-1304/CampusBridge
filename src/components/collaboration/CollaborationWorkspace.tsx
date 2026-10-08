import React, { useEffect, useState } from 'react';
import {
  Building2,
  School,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
  ExternalLink,
  Github,
  Globe,
  FileText,
  Activity,
  Layers,
  Check,
  X,
  XCircle,
} from 'lucide-react';
import {
  collaborationApi,
  MilestonePayload,
  ProjectUpdatePayload,
  ProjectOutcomePayload,
} from '../../services/api';

interface CollaborationWorkspaceProps {
  initialCollaborationId?: string | null;
  onBack: () => void;
  userRole?: 'industry' | 'college' | 'student' | 'admin' | string;
}

export const CollaborationWorkspace: React.FC<CollaborationWorkspaceProps> = ({
  initialCollaborationId,
  onBack,
  userRole = 'industry',
}) => {
  const [collaborationsList, setCollaborationsList] = useState<any[]>([]);
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(initialCollaborationId || null);
  const [collaboration, setCollaboration] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<'milestones' | 'updates' | 'outcome'>('milestones');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal / Form States
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState<MilestonePayload>({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    progress: 0,
  });

  const [updateContent, setUpdateContent] = useState('');
  const [updateMilestoneId, setUpdateMilestoneId] = useState<string>('');
  const [updateProgress, setUpdateProgress] = useState<number | undefined>(undefined);
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);

  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeFormData, setOutcomeFormData] = useState<ProjectOutcomePayload>({
    title: '',
    summary: '',
    repository_url: '',
    demo_url: '',
    documentation_url: '',
    technologies: '',
    outcome_status: 'draft',
  });
  const [isSavingOutcome, setIsSavingOutcome] = useState(false);

  // 1. Fetch Collaborations List
  const fetchCollaborations = async () => {
    setIsLoadingList(true);
    try {
      const res = await collaborationApi.getCollaborations();
      const list = res.collaborations || [];
      setCollaborationsList(list);

      if (!selectedCollabId && list.length > 0) {
        setSelectedCollabId(list[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load collaborations list.');
    } finally {
      setIsLoadingList(false);
    }
  };

  // 2. Fetch Single Collaboration Workspace Data
  const fetchWorkspace = async (collabId: string) => {
    setIsLoadingWorkspace(true);
    setErrorMessage(null);
    try {
      const data = await collaborationApi.getCollaboration(collabId);
      setCollaboration(data);
    } catch (err: any) {
      if (err?.status === 403) {
        setErrorMessage('Access denied: You are not a verified participant in this collaboration workspace.');
      } else if (err?.status === 404) {
        setErrorMessage('Collaboration workspace not found.');
      } else {
        setErrorMessage(err?.message || 'Failed to load collaboration workspace.');
      }
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  useEffect(() => {
    if (selectedCollabId) {
      fetchWorkspace(selectedCollabId);
    }
  }, [selectedCollabId]);

  // Milestone Actions
  const handleCreateOrUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !milestoneFormData.title.trim()) return;

    setErrorMessage(null);
    try {
      if (editingMilestone) {
        await collaborationApi.updateMilestone(selectedCollabId, editingMilestone.id, {
          title: milestoneFormData.title.trim(),
          description: milestoneFormData.description?.trim() || undefined,
          due_date: milestoneFormData.due_date || undefined,
          status: milestoneFormData.status,
          progress: Number(milestoneFormData.progress) || 0,
        });
        setSuccessMessage('Milestone updated successfully.');
      } else {
        await collaborationApi.createMilestone(selectedCollabId, {
          title: milestoneFormData.title.trim(),
          description: milestoneFormData.description?.trim() || undefined,
          due_date: milestoneFormData.due_date || undefined,
          status: milestoneFormData.status || 'pending',
          progress: Number(milestoneFormData.progress) || 0,
        });
        setSuccessMessage('Milestone created successfully.');
      }

      setShowAddMilestoneModal(false);
      setEditingMilestone(null);
      setMilestoneFormData({ title: '', description: '', due_date: '', status: 'pending', progress: 0 });
      await fetchWorkspace(selectedCollabId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save milestone.');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!selectedCollabId || !window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await collaborationApi.deleteMilestone(selectedCollabId, milestoneId);
      setSuccessMessage('Milestone deleted.');
      await fetchWorkspace(selectedCollabId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete milestone.');
    }
  };

  const handleCycleMilestoneStatus = async (m: any) => {
    if (!selectedCollabId) return;
    const nextStatus =
      m.status === 'pending'
        ? 'in_progress'
        : m.status === 'in_progress'
        ? 'completed'
        : 'pending';
    const nextProgress = nextStatus === 'completed' ? 100 : nextStatus === 'in_progress' ? Math.max(m.progress || 50, 10) : 0;

    try {
      await collaborationApi.updateMilestone(selectedCollabId, m.id, {
        status: nextStatus,
        progress: nextProgress,
      });
      await fetchWorkspace(selectedCollabId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update milestone status.');
    }
  };

  // Post Progress Update
  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !updateContent.trim()) return;

    setIsPostingUpdate(true);
    setErrorMessage(null);
    try {
      await collaborationApi.createUpdate(selectedCollabId, {
        content: updateContent.trim(),
        milestone_id: updateMilestoneId || undefined,
        progress: updateProgress !== undefined ? Number(updateProgress) : undefined,
      });
      setUpdateContent('');
      setUpdateMilestoneId('');
      setUpdateProgress(undefined);
      setSuccessMessage('Project update logged.');
      await fetchWorkspace(selectedCollabId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to post project update.');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  // Outcome Actions
  const handleOpenOutcomeModal = () => {
    if (collaboration?.outcome) {
      const out = collaboration.outcome;
      setOutcomeFormData({
        title: out.title || '',
        summary: out.summary || '',
        repository_url: out.repository_url || '',
        demo_url: out.demo_url || '',
        documentation_url: out.documentation_url || '',
        technologies: Array.isArray(out.technologies) ? out.technologies.join(', ') : out.technologies || '',
        outcome_status: out.outcome_status || 'draft',
      });
    } else {
      setOutcomeFormData({
        title: collaboration?.title || 'Collaboration Final Deliverables',
        summary: '',
        repository_url: '',
        demo_url: '',
        documentation_url: '',
        technologies: '',
        outcome_status: 'draft',
      });
    }
    setShowOutcomeModal(true);
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !outcomeFormData.title.trim()) return;

    setIsSavingOutcome(true);
    setErrorMessage(null);
    try {
      const techList =
        typeof outcomeFormData.technologies === 'string'
          ? outcomeFormData.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
          : outcomeFormData.technologies;

      await collaborationApi.saveOutcome(selectedCollabId, {
        title: outcomeFormData.title.trim(),
        summary: outcomeFormData.summary?.trim() || undefined,
        repository_url: outcomeFormData.repository_url?.trim() || undefined,
        demo_url: outcomeFormData.demo_url?.trim() || undefined,
        documentation_url: outcomeFormData.documentation_url?.trim() || undefined,
        technologies: techList,
        outcome_status: outcomeFormData.outcome_status || 'draft',
      });

      setSuccessMessage('Project outcome saved successfully.');
      setShowOutcomeModal(false);
      await fetchWorkspace(selectedCollabId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save project outcome.');
    } finally {
      setIsSavingOutcome(false);
    }
  };

  // Computed Progress
  const milestonesList = collaboration?.milestones || [];
  const completedCount = milestonesList.filter((m: any) => m.status === 'completed' || m.progress === 100).length;
  const inProgressCount = milestonesList.filter((m: any) => m.status === 'in_progress').length;
  const overallProgressPercent =
    milestonesList.length > 0
      ? Math.round(
          milestonesList.reduce((acc: number, m: any) => acc + (m.progress || 0), 0) / milestonesList.length
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* 1. TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        {collaborationsList.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Switch Collaboration:</span>
            <select
              value={selectedCollabId || ''}
              onChange={(e) => setSelectedCollabId(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {collaborationsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.challenge_title || 'Collaboration Project'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. ALERTS */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      {isLoadingList || isLoadingWorkspace ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">Loading collaboration workspace...</div>
        </div>
      ) : collaboration ? (
        <div className="space-y-8">
          {/* HEADER CARD */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <Activity className="w-4 h-4" />
                  <span>Academic–Industry Collaboration Workspace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {collaboration.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  {collaboration.description || 'Verified joint R&D initiative executed between enterprise and academia.'}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Status: {collaboration.status}</span>
                </span>
                {collaboration.start_date && (
                  <span className="text-[11px] text-slate-400">
                    Started on {new Date(collaboration.start_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* PARTNERS METADATA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Industry Partner</div>
                  <div className="text-sm font-bold text-slate-900">{collaboration.company_name || 'Enterprise Sponsor'}</div>
                  <div className="text-[11px] text-slate-500">Project Stakeholder</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Academic Institution</div>
                  <div className="text-sm font-bold text-slate-900">{collaboration.college_name || 'Academic Partner'}</div>
                  <div className="text-[11px] text-slate-500">Faculty &amp; Student Research Unit</div>
                </div>
              </div>
            </div>

            {/* OVERALL PROGRESS BAR */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">Overall Collaboration Completion</span>
                <span className="text-blue-700 font-mono">{overallProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, overallProgressPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>{completedCount} of {milestonesList.length} Milestones Completed</span>
                <span>{inProgressCount} in Progress</span>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex items-center border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'milestones'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Milestones &amp; Deliverables ({milestonesList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('updates')}
              className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'updates'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Project Updates ({collaboration.updates?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('outcome')}
              className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'outcome'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Outcome</span>
            </button>
          </div>

          {/* TAB 1: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Project Stage Gates &amp; Deliverables</h2>
                  <p className="text-xs text-slate-500">
                    Track technical milestones executed jointly across the sprint.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingMilestone(null);
                    setMilestoneFormData({ title: '', description: '', due_date: '', status: 'pending', progress: 0 });
                    setShowAddMilestoneModal(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              {milestonesList.length > 0 ? (
                <div className="space-y-3">
                  {milestonesList.map((m: any, idx: number) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleCycleMilestoneStatus(m)}
                            title="Click to toggle status"
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                              m.status === 'completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : m.status === 'in_progress'
                                ? 'bg-amber-100 border-amber-300 text-amber-800'
                                : 'bg-slate-100 border-slate-300 text-slate-400'
                            }`}
                          >
                            {m.status === 'completed' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </button>

                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <span>{m.title}</span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                  m.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : m.status === 'in_progress'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {m.status?.replace('_', ' ')}
                              </span>
                            </h3>
                            {m.description && <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          {m.due_date && (
                            <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(m.due_date).toLocaleDateString()}</span>
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setEditingMilestone(m);
                              setMilestoneFormData({
                                title: m.title,
                                description: m.description || '',
                                due_date: m.due_date || '',
                                status: m.status || 'pending',
                                progress: m.progress || 0,
                              });
                              setShowAddMilestoneModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                            title="Edit Milestone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteMilestone(m.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* PROGRESS BAR */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Deliverable Progress</span>
                          <span className="font-mono font-bold">{m.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              m.status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, m.progress || 0))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* HONEST EMPTY STATE */
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">This collaboration has no milestones yet.</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Define deliverables, sprint gates, and target dates to track progress together.
                  </p>
                  <button
                    onClick={() => {
                      setEditingMilestone(null);
                      setMilestoneFormData({ title: '', description: '', due_date: '', status: 'pending', progress: 0 });
                      setShowAddMilestoneModal(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Milestone</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROJECT UPDATES */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Chronological Activity &amp; Progress Logs</h2>
                <p className="text-xs text-slate-500">
                  Check-in records posted by industry stakeholders and academic project leads.
                </p>
              </div>

              {/* POST UPDATE FORM */}
              <form onSubmit={handlePostUpdate} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-slate-900">Post a Progress Log</h3>
                <textarea
                  rows={3}
                  required
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  placeholder="Describe recent milestones reached, code deployed, or test results..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {milestonesList.length > 0 && (
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Related Milestone (Optional)</label>
                      <select
                        value={updateMilestoneId}
                        onChange={(e) => setUpdateMilestoneId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                      >
                        <option value="">None (General Update)</option>
                        {milestonesList.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Progress % (Optional)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={updateProgress !== undefined ? updateProgress : ''}
                      onChange={(e) => setUpdateProgress(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g. 75"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isPostingUpdate || !updateContent.trim()}
                    className="px-5 py-2 font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                  >
                    {isPostingUpdate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Post Update</span>
                  </button>
                </div>
              </form>

              {/* UPDATES LIST */}
              {collaboration.updates && collaboration.updates.length > 0 ? (
                <div className="space-y-4">
                  {collaboration.updates.map((up: any) => (
                    <div key={up.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{up.author_name || 'Project Participant'}</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-semibold text-slate-600">
                            {up.author_role || 'Contributor'}
                          </span>
                        </div>
                        <span className="text-[11px]">
                          {up.created_at ? new Date(up.created_at).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">{up.content}</p>
                      {up.progress !== null && up.progress !== undefined && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <span>Milestone progress set to {up.progress}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* HONEST EMPTY STATE */
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No project updates yet.</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Use the form above to log progress check-ins, sprint summaries, and code deployments.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECT OUTCOME */}
          {activeTab === 'outcome' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Verified Project Outcome &amp; Demonstrators</h2>
                  <p className="text-xs text-slate-500">
                    Final deliverables, Git repositories, and documentation powering verifiable Skill Passports.
                  </p>
                </div>

                <button
                  onClick={handleOpenOutcomeModal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{collaboration.outcome ? 'Update Outcome Record' : 'Record Project Outcome'}</span>
                </button>
              </div>

              {collaboration.outcome ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Deliverable</span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">{collaboration.outcome.title}</h3>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold uppercase">
                      Status: {collaboration.outcome.outcome_status}
                    </span>
                  </div>

                  {collaboration.outcome.summary && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executive Summary</h4>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {collaboration.outcome.summary}
                      </p>
                    </div>
                  )}

                  {/* ARTIFACT LINKS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                    {collaboration.outcome.repository_url && (
                      <a
                        href={collaboration.outcome.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors"
                      >
                        <span className="flex items-center gap-2 font-semibold text-slate-800">
                          <Github className="w-4 h-4" />
                          <span>Code Repository</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}

                    {collaboration.outcome.demo_url && (
                      <a
                        href={collaboration.outcome.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors"
                      >
                        <span className="flex items-center gap-2 font-semibold text-slate-800">
                          <Globe className="w-4 h-4" />
                          <span>Live Demo</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}

                    {collaboration.outcome.documentation_url && (
                      <a
                        href={collaboration.outcome.documentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors"
                      >
                        <span className="flex items-center gap-2 font-semibold text-slate-800">
                          <FileText className="w-4 h-4" />
                          <span>Tech Report</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}
                  </div>

                  {collaboration.outcome.technologies && (
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technologies Utilized</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(collaboration.outcome.technologies)
                          ? collaboration.outcome.technologies
                          : [collaboration.outcome.technologies]
                        ).map((t: any, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* HONEST EMPTY STATE */
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No project outcome recorded yet.</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Record your final demonstrator links, code repository, and executive summary upon project completion.
                  </p>
                  <button
                    onClick={handleOpenOutcomeModal}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Deliverable Outcome</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* NO COLLABORATION SELECTED / EMPTY WORKSPACES */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No active collaborations found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When industry collaboration requests are accepted by an academic institution, the live project workspace will be established here.
          </p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Return to Dashboard</span>
          </button>
        </div>
      )}

      {/* MODAL: ADD / EDIT MILESTONE */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 relative">
            <button
              onClick={() => setShowAddMilestoneModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingMilestone ? 'Edit Milestone' : 'Add Project Milestone'}
            </h2>

            <form onSubmit={handleCreateOrUpdateMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                  placeholder="e.g. Model Architecture & Data Pipeline"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; Deliverables</label>
                <textarea
                  rows={3}
                  value={milestoneFormData.description || ''}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                  placeholder="Scope of work, key deliverables, and acceptance criteria..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={milestoneFormData.due_date || ''}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={milestoneFormData.status || 'pending'}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Progress ({milestoneFormData.progress || 0}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={milestoneFormData.progress || 0}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, progress: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-2xs"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT / EDIT PROJECT OUTCOME */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOutcomeModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Verified Project Outcome</h2>
            <p className="text-xs text-slate-500 mb-5">
              Submit final deliverables, repository links, and demonstrator artifacts.
            </p>

            <form onSubmit={handleSaveOutcome} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={outcomeFormData.title}
                  onChange={(e) => setOutcomeFormData({ ...outcomeFormData, title: e.target.value })}
                  placeholder="e.g. Edge AI Inference Pipeline"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Executive Summary &amp; Results</label>
                <textarea
                  rows={3}
                  value={outcomeFormData.summary || ''}
                  onChange={(e) => setOutcomeFormData({ ...outcomeFormData, summary: e.target.value })}
                  placeholder="Describe the achieved benchmarks, system architecture, and project conclusion..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code Repository URL</label>
                <input
                  type="url"
                  value={outcomeFormData.repository_url || ''}
                  onChange={(e) => setOutcomeFormData({ ...outcomeFormData, repository_url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Live Demo / Deployment URL</label>
                <input
                  type="url"
                  value={outcomeFormData.demo_url || ''}
                  onChange={(e) => setOutcomeFormData({ ...outcomeFormData, demo_url: e.target.value })}
                  placeholder="https://demo.app.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Documentation URL</label>
                <input
                  type="url"
                  value={outcomeFormData.documentation_url || ''}
                  onChange={(e) => setOutcomeFormData({ ...outcomeFormData, documentation_url: e.target.value })}
                  placeholder="https://docs.app.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technologies Used (comma separated)</label>
                <input
                  type="text"
                  value={outcomeFormData.technologies || ''}
                  onChange={(e) => setOutcomeFormData({ ...outcomeFormData, technologies: e.target.value })}
                  placeholder="PyTorch, FastAPI, TensorRT, React"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outcome Status</label>
                <select
                  value={outcomeFormData.outcome_status || 'draft'}
                  onChange={(e) => setOutcomeFormData({ ...outcomeFormData, outcome_status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted for Approval</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed &amp; Verified</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  disabled={isSavingOutcome}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingOutcome}
                  className="px-5 py-2 font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
                >
                  {isSavingOutcome && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Outcome</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
