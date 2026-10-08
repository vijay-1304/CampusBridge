import React, { useState } from 'react';
import { UserRole } from '../types';
import { Settings as SettingsIcon, Bell, Shield, Sliders, CheckCircle2, RotateCcw, Sparkles, ArrowLeft } from 'lucide-react';

interface SettingsViewProps {
  currentRole: UserRole;
  onResetDemoData: () => void;
  onTriggerSkillUpdate: () => void;
  onBack?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  onResetDemoData,
  onTriggerSkillUpdate,
  onBack,
}) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [matchingAlerts, setMatchingAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const roleTitle =
    currentRole === 'student'
      ? 'Student Account Settings (Vijay Bhosale)'
      : currentRole === 'industry'
      ? 'Industry Sponsor Settings (ABC Technologies)'
      : currentRole === 'college'
      ? 'Institutional Settings (ABC Engineering College)'
      : 'System Settings';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* GLOBAL BACK BUTTON */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-widest mb-1">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences &amp; Portal Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {roleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your notification frequencies, confidentiality controls, and simulated demo state.
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully in local session.</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Notification &amp; Match Alerts</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={matchingAlerts}
                onChange={(e) => setMatchingAlerts(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-slate-900">High-Match Opportunity Notifications</div>
                <div className="text-slate-500 text-[11px]">
                  Receive immediate alerts when AI matching score exceeds 85% for an industry challenge.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-slate-900">Collaboration Sprint Milestone Updates</div>
                <div className="text-slate-500 text-[11px]">
                  Get digests when deliverables or datasets are submitted in active workspaces.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* PRIVACY & PORTAL VISIBILITY */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Verification &amp; Privacy</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publicProfile}
                onChange={(e) => setPublicProfile(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-slate-900">CampusBridge Verified Accreditation</div>
                <div className="text-slate-500 text-[11px]">
                  Display verified course credentials and institutional seal to enterprise sponsors.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* DEMO PROTOTYPE CONTROLS (FOR JURY/EVALUATION) */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-blue-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-blue-100 pb-2">
            <Sliders className="w-4 h-4 text-blue-700" />
            <span>Hackathon Presentation Controls</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Quickly reset mock data or fast-forward the closed-loop state during live judging demonstrations.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={onResetDemoData}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo to Initial State</span>
            </button>

            <button
              type="button"
              onClick={onTriggerSkillUpdate}
              className="px-3.5 py-2 text-xs font-semibold text-blue-800 bg-blue-100/70 hover:bg-blue-200 border border-blue-300 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>Simulate Closed-Loop Skill Update</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
