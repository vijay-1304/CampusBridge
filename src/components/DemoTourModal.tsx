import React from 'react';
import { X, ArrowRight, Compass, CheckCircle2, Play } from 'lucide-react';
import { UserRole, StudentNavView, IndustryNavView, CollegeNavView } from '../types';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (
    role: UserRole,
    studentView?: StudentNavView,
    industryView?: IndustryNavView,
    collegeView?: CollegeNavView
  ) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep,
}) => {
  if (!isOpen) return null;

  const demoSteps = [
    {
      num: '01',
      title: 'Student Profile & Skill Inventory',
      desc: 'Explore Vijay Bhosale’s verified academic portfolio (Python, JavaScript, ML) and 82% profile completion.',
      role: 'student' as UserRole,
      studentView: 'profile' as StudentNavView,
    },
    {
      num: '02',
      title: 'AI Skill Gap Diagnostic',
      desc: 'See the AI analyze Vijay’s profile against target role "AI / ML Engineer", exposing the Computer Vision gap.',
      role: 'student' as UserRole,
      studentView: 'skill-gap' as StudentNavView,
    },
    {
      num: '03',
      title: 'Discover ABC Technologies Opportunity',
      desc: 'Browse matching industry roles and inspect ABC Technologies AI/ML Internship with 91% Illustrative Match.',
      role: 'student' as UserRole,
      studentView: 'opportunities' as StudentNavView,
    },
    {
      num: '04',
      title: 'Industry Posts Real-World Challenge',
      desc: 'Switch to ABC Technologies and post the "AI-Based Manufacturing Defect Detection" challenge with 3-step wizard.',
      role: 'industry' as UserRole,
      industryView: 'post-challenge' as IndustryNavView,
    },
    {
      num: '05',
      title: 'AI Requirement Extraction & Academic Match',
      desc: 'Watch AI match ABC Engineering College (92% Illustrative Match) based on its Computer Vision lab & faculty.',
      role: 'industry' as UserRole,
      industryView: 'ai-matching' as IndustryNavView,
    },
    {
      num: '06',
      title: 'College Accepts & Workspace Unlocks',
      desc: 'Experience ABC Engineering College reviewing the proposal and managing active Sprint milestones at 70%.',
      role: 'college' as UserRole,
      collegeView: 'workspace' as CollegeNavView,
    },
    {
      num: '07',
      title: 'Project Outcome & Complete the Loop',
      desc: 'Inspect completed defect detection model benchmarks and click "Update Student Skill Profile" to close the loop!',
      role: 'college' as UserRole,
      collegeView: 'outcome' as CollegeNavView,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-1.5">
          <Compass className="w-4 h-4" />
          <span>WCE-HACKATHON 2026 Presentation Guide</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          CampusBridge Closed-Loop Demo Journey
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select any milestone to jump directly into the live experience for jury evaluation.
        </p>

        {/* Steps List */}
        <div className="mt-5 space-y-2.5 overflow-y-auto flex-1 pr-1">
          {demoSteps.map((step) => (
            <div
              key={step.num}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded shrink-0">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onJumpToStep(step.role, step.studentView, step.industryView, step.collegeView);
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors shrink-0 inline-flex items-center gap-1"
              >
                <span>Jump</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Closed Loop: Assess → Gap → Learn → Match → Build → Measure → Update Skills</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
