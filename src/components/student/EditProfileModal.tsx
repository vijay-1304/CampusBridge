import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import { X, Check } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: StudentProfile;
  onClose: () => void;
  onSave: (updatedProfile: StudentProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'about' | 'skills' | 'projects' | 'certifications'>('personal');
  const [formData, setFormData] = useState<StudentProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

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

        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">Edit Academic Profile</h2>
          <p className="text-xs text-slate-500">Update your verified portfolio, coursework, and technical capabilities.</p>
        </div>

        {/* Clean segmented tab selector (single line, functional buttons) */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 mb-6 text-xs shrink-0">
          {[
            { id: 'personal', label: 'Personal Information' },
            { id: 'education', label: 'Education' },
            { id: 'about', label: 'About' },
            { id: 'skills', label: 'Technical Skills' },
            { id: 'projects', label: 'Projects' },
            { id: 'certifications', label: 'Certifications' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 font-medium whitespace-nowrap rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-700 bg-blue-50 font-semibold border-b-2 border-blue-600 rounded-b-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'personal' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Career Role</label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Degree Program</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Professional &amp; Academic Bio</label>
                <textarea
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-500">Currently mapped skills on your profile ({formData.skills.length}):</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {formData.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800">{skill.name} ({skill.category})</span>
                    <span className="text-slate-500 font-mono text-[11px]">{skill.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-500">Verified portfolio repositories and academic capstones:</p>
              {formData.projects.map((proj) => (
                <div key={proj.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">{proj.title}</div>
                  <div className="text-slate-600 mt-1">{proj.description}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-500">Recognized credentials and verified completions:</p>
              {formData.certifications.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-slate-500 mt-0.5">{c.issuer} · {c.date}</div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
