import React from 'react';
import { UserRole } from '../../types';
import { GraduationCap, School, Building2, ArrowRight, X } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto mb-8">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-1.5">
            Select Your Role
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            How will you use CampusBridge?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Choose your persona to explore the personalized academic-industry collaboration workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Student */}
          <button
            onClick={() => {
              onSelectRole('student');
              onClose();
            }}
            className="group p-5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/20 transition-all text-left flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                STUDENT
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Build your skills and discover opportunities.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-blue-700 group-hover:translate-x-0.5 transition-transform">
              <span>Continue as Vijay</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </button>

          {/* Option 2: College */}
          <button
            onClick={() => {
              onSelectRole('college');
              onClose();
            }}
            className="group p-5 rounded-xl border border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/20 transition-all text-left flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <School className="w-5 h-5" />
              </div>
              <div className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                COLLEGE
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Showcase capabilities and connect with industry.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-amber-700 group-hover:translate-x-0.5 transition-transform">
              <span>Continue as College</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </button>

          {/* Option 3: Industry */}
          <button
            onClick={() => {
              onSelectRole('industry');
              onClose();
            }}
            className="group p-5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 transition-all text-left flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                INDUSTRY
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Find academic partners for real-world challenges.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span>Continue as ABC Tech</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Need platform administration?</span>
          <button
            onClick={() => {
              onSelectRole('admin');
              onClose();
            }}
            className="text-slate-700 hover:text-slate-900 underline font-medium"
          >
            Open Admin View
          </button>
        </div>
      </div>
    </div>
  );
};
