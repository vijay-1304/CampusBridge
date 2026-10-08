import React from 'react';
import { StudentProfile, StudentNavView } from '../../types';
import {
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  GraduationCap,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface SkillPassportProps {
  profile: StudentProfile;
  onNavigate: (view: StudentNavView) => void;
}

export const SkillPassport: React.FC<SkillPassportProps> = ({ profile, onNavigate }) => {
  // Evidence map providing honest, verifiable attribution for student competencies
  const skillEvidenceList = [
    {
      name: 'Python',
      level: 'Advanced',
      levelColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      evidenceType: 'Project & Coursework Evidence',
      evidenceDetail: 'Core development in CampusBridge & data structures coursework',
      badge: 'Academic Capstone',
    },
    {
      name: 'JavaScript',
      level: 'Advanced',
      levelColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      evidenceType: 'Project Evidence',
      evidenceDetail: 'Front-end state architecture & responsive client interfaces',
      badge: 'Prototype Build',
    },
    {
      name: 'React',
      level: 'Advanced',
      levelColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      evidenceType: 'Project Evidence',
      evidenceDetail: 'CampusBridge collaboration platform implementation',
      badge: 'Hackathon MVP',
    },
    {
      name: 'SQL',
      level: 'Advanced',
      levelColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      evidenceType: 'Coursework Evidence',
      evidenceDetail: 'Relational database schema normalization & index optimization',
      badge: 'University Lab',
    },
    {
      name: 'Machine Learning',
      level: 'Intermediate',
      levelColor: 'bg-blue-100 text-blue-800 border-blue-200',
      evidenceType: 'Project / Coursework Evidence',
      evidenceDetail: 'PyTorch deep learning specialization & supervised model training',
      badge: 'DeepLearning.AI',
    },
    {
      name: 'Computer Vision',
      level: profile.skills.some((s) => s.name === 'Computer Vision' && s.proficiency === 'Advanced')
        ? 'Advanced'
        : 'Developing',
      levelColor: profile.skills.some((s) => s.name === 'Computer Vision' && s.proficiency === 'Advanced')
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      evidenceType: profile.skills.some((s) => s.name === 'Computer Vision' && s.proficiency === 'Advanced')
        ? 'Collaboration Project Evidence'
        : 'Skill Gap Analysis & Coursework',
      evidenceDetail: profile.skills.some((s) => s.name === 'Computer Vision' && s.proficiency === 'Advanced')
        ? 'Completed ABC Technologies edge defect detection capstone sprint'
        : 'Target skill mapped against active industry defect inspection challenges',
      badge: profile.skills.some((s) => s.name === 'Computer Vision' && s.proficiency === 'Advanced')
        ? 'ABC Technologies Sprint'
        : 'Target Competency',
    },
    {
      name: 'OpenCV',
      level: profile.skills.some((s) => s.name === 'OpenCV' && s.proficiency === 'Advanced')
        ? 'Advanced'
        : 'Developing',
      levelColor: profile.skills.some((s) => s.name === 'OpenCV' && s.proficiency === 'Advanced')
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      evidenceType: profile.skills.some((s) => s.name === 'OpenCV' && s.proficiency === 'Advanced')
        ? 'Collaboration Project Evidence'
        : 'Recommended Project Practice',
      evidenceDetail: profile.skills.some((s) => s.name === 'OpenCV' && s.proficiency === 'Advanced')
        ? 'Edge inferencing & image augmentation on factory assembly camera feeds'
        : 'Hands-on module in skill roadmap for industrial defect detection',
      badge: profile.skills.some((s) => s.name === 'OpenCV' && s.proficiency === 'Advanced')
        ? 'Industry Sprint'
        : 'Learning Path',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 1. BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('skills')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Skills</span>
        </button>
      </div>

      {/* 2. PASSPORT HEADER BADGE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#173B63] text-white flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              VB
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3" />
                <span>AI Skill Passport · Candidate Evidence Record</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="font-medium text-slate-700">{profile.degree}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.institution}</span>
                <span aria-hidden="true">·</span>
                <span className="text-blue-700 font-semibold">Target: {profile.targetRole}</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-slate-500 font-medium">Passport Completion</div>
            <div className="text-2xl font-extrabold text-[#173B63] font-mono mt-0.5">
              {profile.profileCompletion}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Prototype Evidence Profile</div>
          </div>
        </div>

        {/* Closed-Loop Notice */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Authentic Competency Attribution: </span>
            Skill levels below are grounded in demonstrable project repositories, university coursework, and industry capstone collaboration sprints.
          </div>
        </div>
      </div>

      {/* 3. CLOSED-LOOP SKILL JOURNEY VISUALIZER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            The CampusBridge Closed-Loop Journey
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            How academic coursework converts into verifiable industry collaboration outcomes:
          </p>
        </div>

        {/* Visual Workflow Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {[
            { step: '01', title: 'LEARN', desc: 'Core Curriculum' },
            { step: '02', title: 'BUILD', desc: 'Lab Projects' },
            { step: '03', title: 'MAP GAP', desc: 'AI Diagnostic' },
            { step: '04', title: 'MATCH', desc: 'Industry Needs' },
            { step: '05', title: 'COLLABORATE', desc: 'Sprint Workspace' },
            { step: '06', title: 'DELIVER', desc: 'Edge Prototype' },
            { step: '07', title: 'EVIDENCE', desc: 'Faculty Review' },
            { step: '08', title: 'UPDATE', desc: 'Skill Passport' },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-center flex flex-col justify-between"
            >
              <div className="text-[10px] font-mono font-bold text-blue-600">{item.step}</div>
              <div className="text-xs font-bold text-slate-900 mt-1">{item.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SKILL & EVIDENCE MATRIX */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Competency Evidence Inventory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual skill competencies mapped with specific project artifacts and evidence sources.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {skillEvidenceList.length} Competencies Cataloged
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {skillEvidenceList.map((skill) => (
            <div key={skill.name} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-900">{skill.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${skill.levelColor}`}
                  >
                    {skill.level}
                  </span>
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {skill.badge}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Evidence: </span>
                  <span>{skill.evidenceType}</span>
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  {skill.evidenceDetail}
                </div>
              </div>

              <div className="self-start sm:self-center shrink-0">
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                >
                  <span>Matching Opportunities</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PRACTICAL ACTIONS */}
      <div className="bg-gradient-to-br from-[#173B63] to-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Career Step</span>
          </div>
          <h3 className="text-xl font-bold">Close High-Impact Skill Gaps</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Apply to active industry challenges or complete structured learning paths to earn project evidence for Computer Vision and OpenCV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('skill-gap')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all"
          >
            Review Skill Gap
          </button>
          <button
            onClick={() => onNavigate('opportunities')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
          >
            <span>Browse Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
