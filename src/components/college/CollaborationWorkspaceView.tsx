import React, { useState } from 'react';
import { CollaborationWorkspace, CollegeNavView, WorkspaceMilestone } from '../../types';
import {
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Send,
  FileText,
  ListOrdered,
  Activity,
  X,
  ChevronDown,
  Info,
} from 'lucide-react';

interface CollaborationWorkspaceViewProps {
  workspace: CollaborationWorkspace;
  onNavigateToOutcome: () => void;
  onNavigate: (view: CollegeNavView) => void;
}

export const CollaborationWorkspaceView: React.FC<CollaborationWorkspaceViewProps> = ({
  workspace,
  onNavigateToOutcome,
  onNavigate,
}) => {
  const [activeAiModal, setActiveAiModal] = useState<
    'proposal' | 'milestones' | 'summary' | null
  >(null);

  const [milestones, setMilestones] = useState<WorkspaceMilestone[]>(workspace.milestones);
  const [projectStatus, setProjectStatus] = useState<'In Progress' | 'Under Review' | 'Completed'>(
    workspace.status as any
  );
  const [selectedTeamMember, setSelectedTeamMember] = useState<{
    name: string;
    role: string;
    organization: string;
  } | null>(null);

  const [newUpdateText, setNewUpdateText] = useState('');
  const [updates, setUpdates] = useState(workspace.updates);

  // Recalculate progress dynamically based on completed milestones
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const inProgressCount = milestones.filter((m) => m.status === 'in-progress').length;
  const progressPercentage = Math.round(
    ((completedCount + inProgressCount * 0.4) / milestones.length) * 100
  );

  const handleCycleMilestoneStatus = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextStatus =
          m.status === 'pending'
            ? 'in-progress'
            : m.status === 'in-progress'
            ? 'completed'
            : 'pending';
        return { ...m, status: nextStatus };
      })
    );
  };

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateText.trim()) return;
    const newEntry = {
      id: 'u-' + Date.now(),
      author: 'Vijay Bhosale',
      role: 'Lead Student ML Engineer',
      date: 'Just now',
      message: newUpdateText.trim(),
    };
    setUpdates([newEntry, ...updates]);
    setNewUpdateText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* GLOBAL BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('overview')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collaborations Overview</span>
        </button>
      </div>

      {/* 1. WORKSPACE HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1.5">
              <span>COLLABORATION WORKSPACE</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">Sprint Cycle 4 of 6</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {workspace.challengeTitle}
            </h1>
            <div className="mt-2 text-xs font-semibold text-slate-600 flex items-center gap-2">
              <span className="text-slate-900">{workspace.industryPartner}</span>
              <span className="text-slate-400 font-normal">×</span>
              <span className="text-slate-900">{workspace.academicPartner}</span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
            {/* Interactive Project Status Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Project Status:</span>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value as any)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              onClick={onNavigateToOutcome}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Skip to Completed Outcome</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DYNAMIC PROGRESS BAR */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
            <span>Overall Project Progress</span>
            <span className="font-mono text-blue-700 text-sm">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Click any milestone badge below to toggle progress between Scheduled, In Progress, and Completed.
          </p>
        </div>
      </div>

      {/* 2. AI PROJECT ASSISTANT (3 Working Interactive Generators) */}
      <div className="bg-gradient-to-r from-blue-50/60 to-slate-50 rounded-xl border border-blue-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Project Assistant</span>
            <span className="text-slate-400 font-normal font-mono text-[10px]">
              (AI Prototype Output)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveAiModal('proposal')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Generate Project Proposal</span>
          </button>

          <button
            onClick={() => setActiveAiModal('milestones')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
            <span>Generate Milestones</span>
          </button>

          <button
            onClick={() => setActiveAiModal('summary')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate Progress Summary</span>
          </button>
        </div>
      </div>

      {/* 3. INTERACTIVE PROJECT MILESTONES */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Project Milestones
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Click status tag to advance milestone state.</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {completedCount} of {milestones.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {milestones.map((ms) => (
            <div
              key={ms.id}
              className={`p-4 rounded-xl border text-xs transition-all ${
                ms.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : ms.status === 'in-progress'
                  ? 'border-blue-400 bg-blue-50/30 shadow-2xs'
                  : 'border-slate-200 bg-slate-50/40 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {ms.status === 'completed' && (
                      <span className="text-emerald-700 font-bold">✓</span>
                    )}
                    {ms.status === 'in-progress' && (
                      <span className="text-blue-600 font-bold">●</span>
                    )}
                    {ms.status === 'pending' && (
                      <span className="text-slate-400 font-bold">○</span>
                    )}
                    <span className="font-bold text-sm text-slate-900">{ms.title}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed ml-4">{ms.deliverable}</p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 font-mono text-[11px]">
                  <span className="text-slate-400">{ms.targetDate}</span>
                  <button
                    onClick={() => handleCycleMilestoneStatus(ms.id)}
                    title="Click to toggle status"
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      ms.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : ms.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {ms.status === 'completed'
                      ? '✓ Complete'
                      : ms.status === 'in-progress'
                      ? '● In Progress'
                      : '○ Scheduled'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MULTIDISCIPLINARY COLLABORATION TEAM */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Collaboration Team
          </h2>
          <span className="text-xs text-slate-400">Click member to view details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {workspace.team.map((member) => (
            <button
              key={member.name}
              onClick={() => setSelectedTeamMember(member)}
              className="p-3 bg-slate-50 hover:bg-blue-50/40 rounded-lg border border-slate-200 text-left transition-colors cursor-pointer group"
            >
              <div className="font-bold text-slate-900 group-hover:text-blue-700">
                {member.name}
              </div>
              <div className="text-blue-700 font-medium text-[11px] mt-0.5">{member.role}</div>
              <div className="text-slate-400 text-[10px] mt-0.5">{member.organization}</div>
            </button>
          ))}
        </div>

        {selectedTeamMember && (
          <div className="mt-3 p-3.5 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-slate-800 flex items-start justify-between gap-3">
            <div>
              <span className="font-bold text-blue-900">{selectedTeamMember.name}</span>
              <span className="text-slate-600"> — {selectedTeamMember.role} ({selectedTeamMember.organization})</span>
              <div className="text-slate-500 text-[11px] mt-1">
                Active sprint contributor. Responsible for dataset synchronization, peer review, and weekly milestone sign-offs.
              </div>
            </div>
            <button
              onClick={() => setSelectedTeamMember(null)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 5. PROJECT UPDATES FEED */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Project Updates Feed
          </h2>
          <span className="text-xs text-slate-400">Chronological activity</span>
        </div>

        {/* Post New Update form */}
        <form onSubmit={handlePostUpdate} className="flex gap-2">
          <input
            type="text"
            value={newUpdateText}
            onChange={(e) => setNewUpdateText(e.target.value)}
            placeholder="Post project update as Lead Student ML Engineer (Vijay)..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={!newUpdateText.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg disabled:opacity-40 transition-colors shrink-0"
          >
            Post Update
          </button>
        </form>

        <div className="space-y-4">
          {updates.map((up) => (
            <div key={up.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{up.author}</span>
                  <span className="text-[11px] text-blue-700 font-medium">({up.role})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{up.date}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{up.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. PRIMARY WORKSPACE ACTION -> TO OUTCOME */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Ready to Complete Project Sprint?
          </span>
          <h3 className="text-xl font-bold mt-1">Review Final Project Outcome</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            See the verified defect detection prototype results, collect institutional feedback, and update student skill credentials.
          </p>
        </div>

        <button
          onClick={onNavigateToOutcome}
          className="px-6 py-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto inline-flex items-center gap-2"
        >
          <span>Open Project Outcome</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI GENERATOR MODAL */}
      {activeAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActiveAiModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CampusBridge AI · AI Prototype Output</span>
            </div>

            <div className="overflow-y-auto flex-1 mt-3 space-y-4 text-xs sm:text-sm text-slate-700 pr-1">
              {activeAiModal === 'proposal' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    AI-Generated Project Proposal
                  </h2>
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-900 font-mono">
                    Project: AI-Based Manufacturing Defect Detection · Academic–Industry Agreement
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-900">1. PROJECT OBJECTIVE</div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      Develop an AI-based system for detecting manufacturing defects using computer vision and edge neural inference, achieving ≥97% mean average precision at 1.5 m/s conveyor line velocity.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-900">2. ACADEMIC CONTRIBUTION</div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      • Machine learning model architecture design (YOLOv8 nano &amp; MobileNetV3).<br />
                      • Dataset preparation, bounding-box annotation, and augmentation.<br />
                      • Academic high-compute GPU cluster allocation.<br />
                      • Rigorous model evaluation under faculty mentor oversight.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-900">3. INDUSTRY CONTRIBUTION</div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      • Real-world factory anomaly sample datasets.<br />
                      • Domain engineering expertise and production lighting specs.<br />
                      • Hardware edge deployment environment (Jetson test station).<br />
                      • Operational validation and student stipend grant.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-900">4. EXPECTED OUTCOME</div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      Working prototype with sub-35ms inference latency, verified student team competence, and industry deployment feasibility sign-off.
                    </p>
                  </div>
                </div>
              )}

              {activeAiModal === 'milestones' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    AI-Generated Milestone Schedule
                  </h2>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="font-bold text-slate-900">Sprint 1: Optical Calibration &amp; Dataset Schema</div>
                      <div className="text-xs text-slate-600 mt-1">Lighting specifications and camera framing standard. (Week 1–2)</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="font-bold text-slate-900">Sprint 2: Anomaly Annotation &amp; Data Augmentation</div>
                      <div className="text-xs text-slate-600 mt-1">12,400 annotated frames labeled across 6 defect classes. (Week 3–4)</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="font-bold text-slate-900">Sprint 3: Model Architecture Tuning &amp; Validation</div>
                      <div className="text-xs text-slate-600 mt-1">Lightweight backbone training achieving &gt;97% precision. (Week 5–7)</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="font-bold text-slate-900">Sprint 4: Edge Latency Optimization &amp; Sign-Off</div>
                      <div className="text-xs text-slate-600 mt-1">TensorRT / ONNX engine conversion for sub-35ms edge runtimes. (Week 8–10)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeAiModal === 'summary' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    AI-Generated Collaboration Progress Summary
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600">
                    The collaboration between ABC Technologies and ABC Engineering College is progressing at <strong>{progressPercentage}% overall completion</strong>, tracking 4 days ahead of scheduled milestones.
                  </p>
                  <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold">Key Technical Accomplishments:</div>
                    <div>• Validation accuracy on scratch defect dataset surpassed target threshold (97.2%).</div>
                    <div>• Multi-spectral lighting calibration eliminated 40% surface specular glare.</div>
                    <div>• Student ML Engineer Vijay Bhosale demonstrated production-grade model checkpointing.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveAiModal(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
