import React, { useState } from 'react';
import { StudentProfile, StudentNavView, SkillItem } from '../../types';
import { Sparkles, CheckCircle2, Plus, Shield } from 'lucide-react';

interface MySkillsProps {
  profile: StudentProfile;
  onNavigate: (view: StudentNavView) => void;
  onAddSkill?: (skill: SkillItem) => void;
}

export const MySkills: React.FC<MySkillsProps> = ({ profile, onNavigate, onAddSkill }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] =
    useState<SkillItem['category']>('AI / Machine Learning');
  const [newSkillProficiency, setNewSkillProficiency] =
    useState<SkillItem['proficiency']>('Intermediate');

  const categories = [
    'Programming',
    'Web Development',
    'AI / Machine Learning',
    'Database',
    'Cloud',
  ] as const;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    if (onAddSkill) {
      onAddSkill({
        id: 'sk-' + Date.now(),
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
        verified: false,
      });
    }

    setNewSkillName('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Technical Skills
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured skill inventory mapped across academic coursework and practical projects.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('skill-passport')}
            className="px-3.5 py-2.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
            title="View AI Skill Passport & Evidence Records"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Skill Passport</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>

          <button
            onClick={() => onNavigate('skill-analysis')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Skills with AI</span>
          </button>
        </div>
      </div>

      {/* ADD SKILL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl p-6 relative">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Technical Skill</h2>
            <p className="text-xs text-slate-500 mb-4">
              Add a new capability to your verified student competency portfolio.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. PyTorch, Docker, TensorRT, ROS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173B63] hover:bg-[#122e4e] text-white rounded-lg font-semibold"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKILL CATEGORIES */}
      <div className="space-y-6">
        {categories.map((category) => {
          const catSkills = profile.skills.filter((s) => s.category === category);
          if (catSkills.length === 0) return null;

          return (
            <div key={category} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {category}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {catSkills.length} skills recorded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {catSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{skill.name}</span>
                        {skill.verified && (
                          <span
                            className="text-[10px] text-emerald-700 font-medium"
                            title="Coursework / Project Verified"
                          >
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{skill.proficiency}</div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            skill.proficiency === 'Advanced'
                              ? 'bg-blue-600 w-full'
                              : skill.proficiency === 'Intermediate'
                              ? 'bg-blue-400 w-2/3'
                              : 'bg-slate-400 w-1/3'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER CALLOUT */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-800">Want to discover high-value market skills?</span>{' '}
          Run our automated AI role benchmarking to identify missing competencies.
        </div>
        <button
          onClick={() => onNavigate('skill-gap')}
          className="font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap self-start sm:self-auto"
        >
          Check Skill Gap →
        </button>
      </div>
    </div>
  );
};
