import React from 'react';
import { CollegeDetail, IndustryNavView } from '../../types';
import {
  ArrowLeft,
  Building2,
  Users,
  Cpu,
  BookOpen,
  Award,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface CollegeProfileViewProps {
  college: CollegeDetail;
  onBack: () => void;
  onOpenCollaborationRequest: (name: string) => void;
  onNavigate: (view: IndustryNavView) => void;
}

export const CollegeProfileView: React.FC<CollegeProfileViewProps> = ({
  college,
  onBack,
  onOpenCollaborationRequest,
}) => {
  const areasOfExpertise = college.areasOfExpertise || [];
  const facilities = college.facilities || [];
  const capabilities = college.capabilities || { faculty: 0, students: 0, specializedLabs: 0, relevantProjects: 0 };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Academic Matches</span>
      </button>

      {/* INSTITUTION HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-1">
              Academic Partner Profile (Accredited Institution)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {college.name || 'Academic Institution'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{college.tagline || college.location || 'Higher Education Institution'}</p>
            {areasOfExpertise.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Specialization:</span>
                <span>{areasOfExpertise.join(' · ')}</span>
              </div>
            )}
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            <button
              onClick={() => onOpenCollaborationRequest(college.name)}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Collaboration Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">About</h2>
        {college.about ? (
          <p className="text-sm text-slate-700 leading-relaxed">{college.about}</p>
        ) : (
          <p className="text-xs text-slate-400 italic">No institution summary provided.</p>
        )}
      </div>

      {/* ACADEMIC CAPABILITIES */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Academic Capabilities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {capabilities.faculty || 0}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Faculty Mentors</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {capabilities.students || 0}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Student Cohort</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {capabilities.specializedLabs || 0}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Specialized Labs</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-2xl font-bold text-[#173B63] font-mono">
              {capabilities.relevantProjects || 0}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">Completed Projects</div>
          </div>
        </div>
      </div>

      {/* AREAS OF EXPERTISE & FACILITIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Areas of Expertise ({areasOfExpertise.length})
          </h2>
          {areasOfExpertise.length > 0 ? (
            <div className="space-y-2 text-xs text-slate-700">
              {areasOfExpertise.map((area) => (
                <div key={area} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold">{area}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-2">No areas of expertise listed yet.</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Specialized Facilities ({facilities.length})
          </h2>
          {facilities.length > 0 ? (
            <div className="space-y-2 text-xs text-slate-700">
              {facilities.map((fac) => (
                <div key={fac} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded border border-slate-100">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-2">No facilities listed yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
