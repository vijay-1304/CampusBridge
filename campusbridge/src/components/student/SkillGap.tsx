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
} from 'lucide-react';

interface SkillGapProps {
  profile: StudentProfile;
  onNavigate: (view: StudentNavView) => void;
}

export const SkillGap: React.FC<SkillGapProps> = ({ profile, onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState('AI / ML Engineer');
  const [learningStep, setLearningStep] = useState<number>(0);
  const [inProgress, setInProgress] = useState(false);

  const learningModules = [
    {
      step: '01',
      title: 'Computer Vision Fundamentals',
      duration: '12 Hours',
      deliverable: 'Matrix filters, convolutional kernels, color space transformations.',
      status: learningStep >= 1 ? 'completed' : learningStep === 0 && inProgress ? 'active' : 'pending',
    },
    {
      step: '02',
      title: 'OpenCV Practical Project',
      duration: '18 Hours',
      deliverable: 'Industrial conveyor anomaly detector with contour tracking and bounding boxes.',
      status: learningStep >= 2 ? 'completed' : learningStep === 1 && inProgress ? 'active' : 'pending',
    },
    {
      step: '03',
      title: 'Build an AI API with FastAPI',
      duration: '8 Hours',
      deliverable: 'Asynchronous REST endpoints streaming image predictions with sub-50ms latency.',
      status: learningStep >= 3 ? 'completed' : learningStep === 2 && inProgress ? 'active' : 'pending',
    },
    {
      step: '04',
      title: 'Deploy an AI Application',
      duration: '14 Hours',
      deliverable: 'Multi-stage Docker containerization and edge benchmarking on Jetson architecture.',
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
            <option value="AI / ML Engineer">AI / ML Engineer</option>
            <option value="Full Stack AI Developer">Full Stack AI Developer</option>
            <option value="Edge Robotics Engineer">Edge Robotics Engineer</option>
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
              You Already Have
            </h2>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Python', detail: 'Advanced language syntax, data structures, scripting' },
              { name: 'Machine Learning', detail: 'Scikit-learn, regression, decision trees, neural nets' },
              { name: 'JavaScript', detail: 'Modern ES6+, asynchronous promises, browser frontend APIs' },
            ].map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-lg bg-emerald-50/30 border border-emerald-100/80 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="text-emerald-700">✓</span>
                  <span>{item.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 ml-4">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills to Improve */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 mb-4 pb-2 border-b border-slate-100">
            <AlertCircle className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Skills to Improve
            </h2>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Computer Vision', detail: 'Spatial image processing, kernels, Hough transforms' },
              { name: 'OpenCV', detail: 'Video capture streams, contour extraction, bounding boxes' },
              { name: 'FastAPI', detail: 'Asynchronous microservices, pydantic schemas, routing' },
              { name: 'Cloud Deployment', detail: 'Containerization, reproducible cloud runtimes, Docker & edge modules' },
            ].map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-lg bg-amber-50/30 border border-amber-100/80 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="text-amber-600">⚠</span>
                  <span>{item.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 ml-4">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AI LEARNING PATH */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recommended AI Learning Path</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated milestone path designed to close your target role gap in approximately 52 hours.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span>Overall Progress:</span>
            <span className="font-bold text-blue-700">{learningStep * 25}%</span>
          </div>
        </div>

        {/* Learning Modules */}
        <div className="space-y-3">
          {learningModules.map((mod) => (
            <div
              key={mod.step}
              className={`p-4 rounded-xl border transition-all ${
                mod.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : mod.status === 'active'
                  ? 'border-blue-400 bg-blue-50/30 shadow-2xs'
                  : 'border-slate-200 bg-slate-50/40 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {mod.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{mod.deliverable}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto text-xs shrink-0 pt-1 sm:pt-0">
                  <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mod.duration}</span>
                  </span>
                  {mod.status === 'completed' ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Complete
                    </span>
                  ) : mod.status === 'active' ? (
                    <span className="font-semibold text-blue-700">In Progress</span>
                  ) : (
                    <span className="text-slate-400">Scheduled</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Completing these 4 milestones increases your internship match from 91% to 98%.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('opportunities')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleStartOrAdvance}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
            >
              {!inProgress ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Learning Path</span>
                </>
              ) : learningStep < 4 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Next Module Done ({learningStep + 1}/4)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Modules Completed!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
