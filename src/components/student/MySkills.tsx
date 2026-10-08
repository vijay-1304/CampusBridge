import React, { useEffect, useState } from 'react';
import { StudentNavView } from '../../types';
import { Sparkles, Plus, Shield, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { studentApi } from '../../services/api';

interface MySkillsProps {
  onNavigate: (view: StudentNavView) => void;
  onSkillChanged?: () => void;
}

interface RealSkillRecord {
  id: string;
  student_id: string;
  skill_id: string;
  skill_name: string;
  category?: string;
  proficiency_level: number;
  source: string;
  evidence_url?: string;
  is_verified: boolean;
  created_at?: string;
}

interface CatalogSkill {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export const MySkills: React.FC<MySkillsProps> = ({ onNavigate, onSkillChanged }) => {
  const [skills, setSkills] = useState<RealSkillRecord[]>([]);
  const [catalog, setCatalog] = useState<CatalogSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Skill Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState<number>(3);
  const [source, setSource] = useState<string>('self_reported');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [skillsData, catalogData] = await Promise.all([
        studentApi.getSkills(),
        studentApi.getCatalog(),
      ]);
      setSkills(skillsData || []);
      setCatalog(catalogData || []);
      if (catalogData && catalogData.length > 0) {
        setSelectedSkillId(catalogData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setSubmitting(true);
    setModalError(null);

    try {
      await studentApi.addSkill({
        skill_id: selectedSkillId,
        proficiency_level: proficiencyLevel,
        source,
        evidence_url: evidenceUrl.trim() || undefined,
      });

      setShowAddModal(false);
      setEvidenceUrl('');
      await fetchData();
      if (onSkillChanged) onSkillChanged();
    } catch (err: any) {
      setModalError(err.message || 'Failed to add skill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await studentApi.deleteSkill(skillId);
      await fetchData();
      if (onSkillChanged) onSkillChanged();
    } catch (err: any) {
      alert(err.message || 'Failed to delete skill.');
    }
  };

  const getProficiencyLabel = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Novice (Level 1/5)';
      case 2:
        return 'Beginner (Level 2/5)';
      case 3:
        return 'Intermediate (Level 3/5)';
      case 4:
        return 'Advanced (Level 4/5)';
      case 5:
        return 'Expert (Level 5/5)';
      default:
        return `Level ${lvl}/5`;
    }
  };

  // Group skills by category
  const categoriesMap: Record<string, RealSkillRecord[]> = {};
  skills.forEach((s) => {
    const cat = s.category || 'General';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(s);
  });

  const categoryNames = Object.keys(categoriesMap);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Technical Skills
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Verifiable competency portfolio backed by persistent PostgreSQL data.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('skill-passport')}
            className="px-3.5 py-2.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
            title="View AI Skill Passport"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Skill Passport</span>
          </button>

          <button
            onClick={() => {
              setModalError(null);
              setShowAddModal(true);
            }}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* ADD SKILL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl p-6 relative">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Canonical Skill</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an officially verifiable skill from the master catalog.
            </p>

            {modalError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Skill</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                  required
                >
                  {catalog.map((catItem) => (
                    <option key={catItem.id} value={catItem.id}>
                      {catItem.name} {catItem.category ? `(${catItem.category})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proficiency Level (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setProficiencyLevel(lvl)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        proficiencyLevel === lvl
                          ? 'bg-[#173B63] text-white border-[#173B63]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {getProficiencyLabel(proficiencyLevel)}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Claim Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                >
                  <option value="self_reported">Self Reported</option>
                  <option value="project">Coursework Project</option>
                  <option value="assessment">Technical Assessment</option>
                  <option value="certificate">Certification</option>
                  <option value="collaboration">Industry Collaboration</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evidence URL (Optional)
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#173B63] hover:bg-[#122e4e] text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Skill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs">Loading skills from database...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && skills.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No skills registered yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add your technical skills from the master catalog so AI matching algorithms can connect you with industry opportunities.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm"
          >
            Add Your First Skill
          </button>
        </div>
      )}

      {/* SKILLS LIST BY CATEGORY */}
      {!loading && skills.length > 0 && (
        <div className="space-y-6">
          {categoryNames.map((category) => {
            const catSkills = categoriesMap[category];
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">{skill.skill_name}</span>
                          <div className="flex items-center gap-1.5">
                            {skill.is_verified && (
                              <span
                                className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200"
                                title="Verified Credential"
                              >
                                ✓ Verified
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteSkill(skill.skill_id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                              title="Delete Skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {getProficiencyLabel(skill.proficiency_level)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 capitalize">
                          Source: {skill.source.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${(skill.proficiency_level / 5) * 100}%` }}
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
      )}
    </div>
  );
};
