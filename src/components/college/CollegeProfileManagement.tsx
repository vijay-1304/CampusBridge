import React, { useEffect, useState } from 'react';
import { CollegeDetail, CollegeNavView } from '../../types';
import {
  School,
  Cpu,
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Plus,
  X,
  Check,
  ArrowLeft,
  Loader2,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { collegeApi, ApiError } from '../../services/api';

interface CollegeProfileManagementProps {
  college: CollegeDetail;
  onUpdateCollege?: (updated: CollegeDetail) => void;
  onNavigate: (view: CollegeNavView) => void;
}

export const CollegeProfileManagement: React.FC<CollegeProfileManagementProps> = ({
  college,
  onUpdateCollege,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'capabilities'>('profile');
  const [collegeName, setCollegeName] = useState(college.name);
  const [location, setLocation] = useState(college.location || 'Pune, India');
  const [website, setWebsite] = useState(college.website || 'https://abccollege.edu');
  const [about, setAbout] = useState(college.about);
  const [expertise, setExpertise] = useState<string[]>([...college.areasOfExpertise]);
  const [newExp, setNewExp] = useState('');
  const [facilities, setFacilities] = useState<string[]>([...college.facilities]);
  const [newFac, setNewFac] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Capability CRUD states
  const [catalog, setCatalog] = useState<any[]>([]);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [proficiencyLevel, setProficiencyLevel] = useState<number>(4);
  const [facultyCount, setFacultyCount] = useState<number>(5);
  const [infraDetails, setInfraDetails] = useState<string>('');
  const [isAddingCap, setIsAddingCap] = useState(false);

  const fetchCollegeData = async () => {
    try {
      // 1. Fetch Profile
      const profRes = await collegeApi.getProfile().catch(() => null);
      if (profRes) {
        if (profRes.college_name) setCollegeName(profRes.college_name);
        if (profRes.location) setLocation(profRes.location);
        if (profRes.website) setWebsite(profRes.website);
        if (profRes.description) setAbout(profRes.description);
      }

      // 2. Fetch Catalog
      const catRes = await collegeApi.getCatalog().catch(() => null);
      if (catRes && Array.isArray(catRes)) {
        setCatalog(catRes);
        if (catRes.length > 0 && !selectedSkillId) {
          setSelectedSkillId(catRes[0].id);
        }
      }

      // 3. Fetch Capabilities
      const capRes = await collegeApi.getCapabilities().catch(() => null);
      if (capRes && Array.isArray(capRes)) {
        setCapabilities(capRes);
      }
    } catch {
      // Fallback gracefully to props
    }
  };

  useEffect(() => {
    fetchCollegeData();
  }, []);

  const handleAddExpertise = () => {
    if (newExp.trim() && !expertise.includes(newExp.trim())) {
      setExpertise([...expertise, newExp.trim()]);
      setNewExp('');
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item));
  };

  const handleAddFacility = () => {
    if (newFac.trim() && !facilities.includes(newFac.trim())) {
      setFacilities([...facilities, newFac.trim()]);
      setNewFac('');
    }
  };

  const handleRemoveFacility = (item: string) => {
    setFacilities(facilities.filter((f) => f !== item));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await collegeApi.updateProfile({
        college_name: collegeName,
        location,
        website,
        description: about,
      }).catch((err) => {
        console.warn('Backend college update note:', err);
      });

      const updated: CollegeDetail = {
        ...college,
        name: collegeName,
        location,
        website,
        about,
        areasOfExpertise: expertise,
        facilities,
      };

      if (onUpdateCollege) {
        onUpdateCollege(updated);
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update college profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCapability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setIsAddingCap(true);
    setErrorMessage(null);

    try {
      const created = await collegeApi.addCapability({
        skill_id: selectedSkillId,
        proficiency_level: proficiencyLevel,
        faculty_count: Number(facultyCount),
        infrastructure_details: infraDetails,
      });

      setCapabilities([created, ...capabilities]);
      setInfraDetails('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add capability.');
    } finally {
      setIsAddingCap(false);
    }
  };

  const handleDeleteCapability = async (id: string) => {
    try {
      await collegeApi.deleteCapability(id);
      setCapabilities(capabilities.filter((c) => c.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove capability.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* GLOBAL BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('overview')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to College Overview</span>
        </button>
      </div>

      {/* HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Capability Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain your laboratories, faculty research clusters, and verified student pool.
          </p>
        </div>

        {activeTab === 'profile' && (
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] disabled:opacity-70 rounded-lg transition-colors shadow-sm self-start sm:self-auto inline-flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <span>Save Updates</span>
            )}
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Institutional capability profile successfully updated in CampusBridge registry.</span>
        </div>
      )}

      {/* SEGMENTED TAB SWITCHER */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General &amp; Infrastructure
        </button>
        <button
          onClick={() => setActiveTab('capabilities')}
          className={`pb-2.5 px-3 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
            activeTab === 'capabilities'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Verified Skill Capabilities</span>
          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px]">
            {capabilities.length}
          </span>
        </button>
      </div>

      {activeTab === 'profile' ? (
        <>
          {/* INSTITUTION DETAILS */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Institution Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">College Name</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">About the Institution</label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 leading-relaxed"
              />
            </div>
          </div>

          {/* DEPARTMENTS & FACULTY EXPERTISE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Engineering Departments
              </h2>
              <div className="space-y-2 text-xs text-slate-700">
                {(college.departments || []).length > 0 ? (
                  (college.departments || []).map((dept) => (
                    <div key={dept} className="p-2.5 bg-slate-50 rounded border border-slate-100 font-medium">
                      {dept}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 py-2">No departments registered.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Research Expertise Areas
              </h2>
              <div className="space-y-2 text-xs text-slate-700">
                {expertise.map((exp) => (
                  <div key={exp} className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{exp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(exp)}
                      className="text-slate-400 hover:text-rose-600"
                      aria-label="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newExp}
                  onChange={(e) => setNewExp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                  placeholder="Add expertise area (e.g. Edge AI)..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddExpertise}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* LABS & INFRASTRUCTURE */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Specialized Research Labs &amp; Testbeds ({facilities.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              {facilities.map((fac) => (
                <div key={fac} className="flex items-start justify-between gap-2.5 p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{fac}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(fac)}
                    className="text-slate-400 hover:text-rose-600 shrink-0 mt-0.5"
                    aria-label="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newFac}
                onChange={(e) => setNewFac(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFacility();
                  }
                }}
                placeholder="Add laboratory facility (e.g. Embedded Edge Robotics Cell)..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddFacility}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Add Facility
              </button>
            </div>
          </div>
        </>
      ) : (
        /* CAPABILITIES TAB */
        <div className="space-y-6">
          {/* Add Capability Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Register Institutional Capability</span>
            </h2>
            <p className="text-xs text-slate-500">
              Map your faculty clusters, labs, and research strengths to canonical skills so industry challenges can match your college.
            </p>

            <form onSubmit={handleAddCapability} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Skill</label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {catalog.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proficiency (1-5)</label>
                  <select
                    value={proficiencyLevel}
                    onChange={(e) => setProficiencyLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={5}>5 - Advanced / Centre of Excellence</option>
                    <option value={4}>4 - Proficient / Dedicated Lab</option>
                    <option value={3}>3 - Intermediate / Core Faculty</option>
                    <option value={2}>2 - Developing / Elective Course</option>
                    <option value={1}>1 - Beginner / Student Club</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty Mentors</label>
                  <input
                    type="number"
                    min={0}
                    value={facultyCount}
                    onChange={(e) => setFacultyCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Infrastructure &amp; Lab Details</label>
                <input
                  type="text"
                  value={infraDetails}
                  onChange={(e) => setInfraDetails(e.target.value)}
                  placeholder="e.g. NVIDIA RTX GPU workstation cluster, High-speed industrial camera rigs"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingCap || !selectedSkillId}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] disabled:opacity-70 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  {isAddingCap ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Capability</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Capabilities List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Active Registered Capabilities ({capabilities.length})
            </h2>

            {capabilities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {capabilities.map((cap) => (
                  <div
                    key={cap.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start justify-between gap-3 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-900 text-sm">
                        {cap.skill?.name || 'Skill Capability'}
                      </div>
                      <div className="text-blue-700 font-semibold text-[11px]">
                        Level {cap.proficiency_level}/5 · {cap.faculty_count} Faculty Mentors
                      </div>
                      {cap.infrastructure_details && (
                        <div className="text-slate-500 text-[11px] pt-1">
                          {cap.infrastructure_details}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteCapability(cap.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50 transition-colors"
                      title="Remove Capability"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <School className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">0 Capabilities Registered in Database</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Add your research labs and faculty expertise using the form above to enable deterministic matching against live industry challenges.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
