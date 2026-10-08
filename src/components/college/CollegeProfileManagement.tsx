import React, { useState } from 'react';
import { CollegeDetail, CollegeNavView } from '../../types';
import { School, Cpu, Users, BookOpen, Award, CheckCircle2, Plus, X, Check, ArrowLeft } from 'lucide-react';

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
  const [about, setAbout] = useState(college.about);
  const [expertise, setExpertise] = useState<string[]>([...college.areasOfExpertise]);
  const [newExp, setNewExp] = useState('');
  const [facilities, setFacilities] = useState<string[]>([...college.facilities]);
  const [newFac, setNewFac] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSave = () => {
    const updated: CollegeDetail = {
      ...college,
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

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Capability Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain your laboratories, faculty research clusters, and verified student pool.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors shadow-sm self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <span>Save Updates</span>
          )}
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Institutional capability profile successfully updated in CampusBridge registry.</span>
        </div>
      )}

      {/* INSTITUTION DETAILS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Institution Details
        </h2>
        <div className="text-lg font-bold text-slate-900">{college.name}</div>
        <p className="text-xs text-slate-500">{college.tagline}</p>
        <div className="pt-2">
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
            {college.departments.map((dept) => (
              <div key={dept} className="p-2.5 bg-slate-50 rounded border border-slate-100 font-medium">
                {dept}
              </div>
            ))}
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

      {/* STUDENT SKILLS & INDUSTRY TRACK RECORD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Industry Collaboration Track Record
        </h2>
        <div className="text-sm font-semibold text-slate-800">
          {college.industryCollaborationsCompleted} successfully completed industrial projects.
        </div>
        <p className="text-xs text-slate-500">
          Standard institutional non-disclosure agreement (NDA) and Intellectual Property (IP) assignment agreements configured.
        </p>
      </div>
    </div>
  );
};
