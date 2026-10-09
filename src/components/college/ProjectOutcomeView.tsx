import React, { useState } from 'react';
import {
  CheckCircle2,
  Award,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Cpu,
  Building2,
  School,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface ProjectOutcomeViewProps {
  onUpdateStudentProfile: () => void;
  onBack?: () => void;
}

export const ProjectOutcomeView: React.FC<ProjectOutcomeViewProps> = ({
  onUpdateStudentProfile,
  onBack,
}) => {
  const [profileUpdated, setProfileUpdated] = useState(false);

  const handleUpdate = () => {
    setProfileUpdated(true);
    setTimeout(() => {
      onUpdateStudentProfile();
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* GLOBAL BACK BUTTON */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Active Workspace</span>
          </button>
        </div>
      )}

      {/* 1. COMPLETION BANNER */}
      <div className="bg-emerald-900 text-white rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Collaboration Successfully Completed · Prototype Outcome</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Project Outcome: AI Defect Detection Prototype
        </h1>
        <p className="text-sm text-emerald-100 mt-2 max-w-2xl leading-relaxed">
          Joint capstone collaboration between ABC Technologies &amp; ABC Engineering College completed with evaluated model deliverables.
        </p>

        <div className="mt-6 pt-5 border-t border-emerald-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-emerald-300">Deliverable: </span>
            <span className="font-semibold text-white">YOLOv8 Edge Vision Pipeline</span>
          </div>
          <div>
            <span className="text-emerald-300">Illustrative Benchmark: </span>
            <span className="font-semibold text-white font-mono">97.6% mAP (Simulated Test Set)</span>
          </div>
          <div>
            <span className="text-emerald-300">Proposed Target Hardware: </span>
            <span className="font-semibold text-white">Embedded Edge Accelerator</span>
          </div>
        </div>
      </div>

      {/* 2. RESULTS SUMMARY (4 Cards) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Measurable Results (Demonstration Milestone)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Prototype Developed</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Edge pipeline container built for factory line conveyor simulation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Student Team Experience</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              3 student engineers gained hands-on applied computer vision project experience.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Industry Evaluated</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ABC Technologies reviewed prototype inference code against accuracy milestones.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <School className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Academic Project Done</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Accredited as departmental B.Tech capstone collaboration distinction.
            </p>
          </div>
        </div>
      </div>

      {/* 3. SKILLS DEVELOPED */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Skills Developed &amp; Project Evidence</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These competencies will be credited directly to participating student Skill Passports.
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold">4 Competency Evidence Items</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { name: 'Computer Vision', level: 'Advanced · Project Evidence' },
            { name: 'OpenCV', level: 'Image Augmentation & Contours' },
            { name: 'Machine Learning', level: 'Inference Pipeline Optimization' },
            { name: 'Model Deployment', level: 'Containerized Edge Execution' },
          ].map((sk) => (
            <div key={sk.name} className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200/80">
              <div className="font-bold text-slate-900">{sk.name}</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">{sk.level}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MULTI-STAKEHOLDER FEEDBACK */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Illustrative Stakeholder Feedback (Demo Data)
        </h2>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Industry Feedback */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span className="flex items-center gap-1.5 text-blue-900">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Dr. Rajesh Nair (Industry Mentor, ABC Technologies)</span>
              </span>
              <span className="text-emerald-700 text-xs">Simulated Feedback</span>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "The collaboration model on CampusBridge allowed our engineering team to review student work against genuine factory dataset challenges. Vijay Bhosale and the team adapted computer vision techniques to edge constraints rapidly."
            </p>
          </div>

          {/* Academic Feedback */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span className="flex items-center gap-1.5 text-amber-900">
                <School className="w-3.5 h-3.5 text-amber-600" />
                <span>Prof. Anjali Mehta (Faculty Mentor, ABC Engineering College)</span>
              </span>
              <span className="text-emerald-700 text-xs">Faculty Endorsement</span>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "Working against actual manufacturing problems provided our students deep insights into applied ML engineering. The structured workspace maintained faculty and student accountability."
            </p>
          </div>

          {/* Student Feedback */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span className="flex items-center gap-1.5 text-emerald-900">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student ML Team Lead</span>
              </span>
              <span className="text-emerald-700 text-xs">Skill Gap Closed</span>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "Before this collaboration, edge computing was an identified gap in our profile. Building and running pipelines in the collaborative workspace transformed our practical capability."
            </p>
          </div>
        </div>
      </div>

      {/* 5. CLOSING THE LOOP: PRIMARY ACTION */}
      <div className="bg-[#173B63] text-white rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete the Academic–Industry Loop</span>
          </div>
          <h3 className="text-xl font-bold">Update Student Skill Passport</h3>
          <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
            Record verified project deliverables directly onto participating student profiles, elevating their verified competencies.
          </p>
        </div>

        <button
          onClick={handleUpdate}
          className="px-6 py-3.5 text-xs font-semibold text-[#173B63] bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all whitespace-nowrap self-start sm:self-auto inline-flex items-center gap-2"
        >
          {profileUpdated ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Skill Passport Updated!</span>
            </>
          ) : (
            <>
              <span>Update Student Skill Profile</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
