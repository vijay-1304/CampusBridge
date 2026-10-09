import React, { useState } from 'react';
import { StudentProfile, StudentNavView } from '../../types';
import {
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Clock,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';

interface SkillGapProps {
  profile: StudentProfile;
  onNavigate: (view: StudentNavView) => void;
}

export const SkillGap: React.FC<SkillGapProps> = ({ profile, onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState(profile.targetRole || 'AI / ML Engineer');
  const [learningStep, setLearningStep] = useState<number>(0);
  const [inProgress, setInProgress] = useState(false);

  // Derive "You Already Have" from skills with Advanced/Intermediate proficiency
  const acquiredSkills = (profile.skills || []).filter(
    (s) => s.proficiency === 'Advanced' || s.proficiency === 'Intermediate'
  );

  // Derive "Skills to Improve" from Beginner skills and recommended skills
  const beginnerSkills = (profile.skills || []).filter((s) => s.proficiency === 'Beginner');
  const recommendedGaps = profile.recommendedSkills || [];

  const learningModules = [
    {
      step: '01',
      title: 'Foundations & Technical Fundamentals',
      duration: '12 Hours',
      deliverable: 'Core architectures, data processing pipelines, and foundational syntax.',
      status: learningStep >= 1 ? 'completed' : learningStep === 0 && inProgress ? 'active' : 'pending',
    },
    {
      step: '02',
      title: 'Hands-on Applied Project',
      duration: '18 Hours',
      deliverable: 'End-to-end practical project deliverable matching industry requirements.',
      status: learningStep >= 2 ? 'completed' : learningStep === 1 && inProgress ? 'active' : 'pending',
    },
    {
      step: '03',
      title: 'Service & API Integration',
      duration: '8 Hours',
      deliverable: 'Asynchronous REST APIs with real-time prediction and low latency.',
      status: learningStep >= 3 ? 'completed' : learningStep === 2 && inProgress ? 'active' : 'pending',
    },
    {
      step: '04',
      title: 'Production Deployment & Verification',
      duration: '14 Hours',
      deliverable: 'Containerized deployment and verified repository benchmark.',
      status: learningStep >= 4 ? 'completed' : learningStep === 3 && inProgress ? 'active' : 'pending',
    },
  ];

  const handleStartOrAdvance = () => {
    if (!inProgress) {
      setInProgress(true);
      setLearningStep(1);
    } else if (learningStep < 4) {
      setLearningStep((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* GLOBAL BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('skills')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Skills</span>
        </button>
      </div>

      {/* 1. HEADER & ROLE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gap Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Skill Gap Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover what competencies stand between your current profile and your desired role.
          </p>
        </div>

        {/* Target Role Dropdown */}
        <div className="self-start sm:self-auto">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Target Career Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
          >
            {profile.targetRole && <option value={profile.targetRole}>{profile.targetRole}</option>}
            <option value="AI / ML Engineer">AI / ML Engineer</option>
            <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
            <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
          </select>
        </div>
      </div>

      {/* 2. YOU ALREADY HAVE VS SKILLS TO IMPROVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* You Already Have */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 mb-4 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              You Already Have ({acquiredSkills.length})
            </h2>
          </div>
          {acquiredSkills.length > 0 ? (
            <div className="space-y-2.5">
              {acquiredSkills.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-emerald-50/30 border border-emerald-100/80 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-700">✓</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-mono font-normal">
                      {item.proficiency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 ml-4">
                    {item.category || 'Core Skill'} {item.verified ? '· Verified' : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              <p>No proficient skills registered yet.</p>
              <button
                onClick={() => onNavigate('skills')}
                className="mt-2 text-xs text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add technical skills</span>
              </button>
            </div>
          )}
        </div>

        {/* Skills to Improve */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 mb-4 pb-2 border-b border-slate-100">
            <AlertCircle className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Skills to Improve / Target Gaps
            </h2>
          </div>
          {beginnerSkills.length > 0 || recommendedGaps.length > 0 ? (
            <div className="space-y-2.5">
              {beginnerSkills.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-amber-50/30 border border-amber-100/80 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="text-amber-700">▲</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-mono font-normal">
                      Level: Beginner
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 ml-4">
                    Advance proficiency to Intermediate for target role fit
                  </div>
                </div>
              ))}

              {recommendedGaps.map((rec) => (
                <div
                  key={rec.name}
                  className="p-3 rounded-lg bg-blue-50/30 border border-blue-100/80 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="text-blue-700">★</span>
                      <span>{rec.name}</span>
                    </span>
                    {typeof rec.demandCount === 'number' && (
                      <span className="text-[11px] text-blue-700 font-mono font-normal">
                        {rec.demandCount} active roles
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 ml-4">{rec.reason}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              <p>No critical gaps diagnosed for this role.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. STEP-BY-STEP LEARNING ROADMAP */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Learning Path</h2>
            <p className="text-xs text-slate-500">
              Structured progressive modules to bridge gap competencies for {selectedRole}.
            </p>
          </div>

          <button
            onClick={handleStartOrAdvance}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2 self-start sm:self-auto"
          >
            {!inProgress ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Learning Path</span>
              </>
            ) : learningStep >= 4 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Path Completed</span>
              </>
            ) : (
              <>
                <span>Complete Step {learningStep} &amp; Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {learningModules.map((mod, idx) => (
            <div
              key={mod.step}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                mod.status === 'completed'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : mod.status === 'active'
                  ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200'
                  : 'bg-slate-50/40 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    mod.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : mod.status === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {mod.status === 'completed' ? <Check className="w-4 h-4" /> : mod.step}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{mod.deliverable}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{mod.duration}</span>
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    mod.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : mod.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {mod.status === 'completed'
                    ? 'Completed'
                    : mod.status === 'active'
                    ? 'In Progress'
                    : 'Upcoming'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
