import React, { useState } from 'react';
import { StudentProfile as StudentProfileType, StudentNavView } from '../../types';
import {
  Edit3,
  MapPin,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Plus,
} from 'lucide-react';

interface StudentProfileProps {
  profile: StudentProfileType;
  onNavigate: (view: StudentNavView) => void;
  onEditProfile: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  profile,
  onNavigate,
  onEditProfile,
}) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Compute initials dynamically from name
  const getInitials = (name: string) => {
    if (!name || !name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(profile.name);
  const strengths = profile.strengths || [];
  const developing = profile.developing || [];
  const recommendedSkills = profile.recommendedSkills || [];
  const skills = profile.skills || [];
  const projects = profile.projects || [];
  const certifications = profile.certifications || [];
  const achievements = profile.achievements || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 1. PROFILE HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Dynamic avatar initials */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#173B63] text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-inner shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile.name || 'Student Profile'}
              </h1>
              <p className="text-sm font-semibold text-blue-700 mt-0.5">{profile.degree || profile.title || 'Student'}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                {profile.institution && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.institution}</span>
                  </span>
                )}
                {profile.institution && profile.location && <span aria-hidden="true">·</span>}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={() => onNavigate('skill-passport')}
              className="px-3.5 py-2 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Skill Passport</span>
            </button>

            <button
              onClick={onEditProfile}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ABOUT */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">About</h2>
        {profile.about ? (
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {profile.about}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">No summary provided yet. Click 'Edit Profile' to add your academic background.</p>
        )}
      </div>

      {/* 3. AI SKILL ANALYSIS HIGHLIGHTED CARD */}
      <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 rounded-xl border border-blue-200 p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#173B63] text-white rounded-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Skill Analysis</h2>
              <p className="text-xs text-slate-500">Automated benchmark against target role: {profile.targetRole || 'Not specified'}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('skill-gap')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors inline-flex items-center gap-1 shrink-0"
          >
            <span>View Skill Gap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Strengths */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Strengths</span>
            </div>
            {strengths.length > 0 ? (
              <div className="space-y-1 text-xs text-slate-700">
                {strengths.map((s) => (
                  <div key={s} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                    <span className="font-medium">{s}</span>
                    <span className="text-[11px] text-emerald-600 font-mono">Strong</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-2">Add advanced skills to identify strengths.</div>
            )}
          </div>

          {/* Developing */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Developing</span>
            </div>
            {developing.length > 0 ? (
              <div className="space-y-1 text-xs text-slate-700">
                {developing.map((d) => (
                  <div key={d} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                    <span className="font-medium">{d}</span>
                    <span className="text-[11px] text-amber-600 font-mono">In Progress</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-2">No developing skills recorded yet.</div>
            )}
          </div>

          {/* Recommended */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Recommended</span>
            </div>
            {recommendedSkills.length > 0 ? (
              <div className="space-y-1 text-xs text-slate-700">
                {recommendedSkills.slice(0, 3).map((r) => (
                  <div key={r.name} className="py-1 border-b border-slate-50 last:border-none">
                    <div className="font-medium text-slate-800">{r.name}</div>
                    <div className="text-[10px] text-slate-500">{r.demandCount || 0} active opportunities</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-2">Recommendations update based on registered target role.</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. TECHNICAL SKILLS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Technical Skills ({skills.length})
          </h2>
          <button
            onClick={() => onNavigate('skills')}
            className="text-xs font-medium text-blue-700 hover:text-blue-900"
          >
            Manage Skills
          </button>
        </div>

        {skills.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {skills.slice(0, 9).map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>{skill.name}</span>
                  {skill.verified && (
                    <span className="text-[10px] text-emerald-600" title="Verified by Coursework / Deliverable">
                      ✓
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>{skill.proficiency}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {skill.proficiency === 'Advanced' ? '90%' : skill.proficiency === 'Intermediate' ? '65%' : '35%'}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      skill.proficiency === 'Advanced'
                        ? 'bg-blue-600 w-[90%]'
                        : skill.proficiency === 'Intermediate'
                        ? 'bg-blue-400 w-[65%]'
                        : 'bg-slate-400 w-[35%]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            <p>No technical skills mapped to your profile yet.</p>
            <button
              onClick={() => onNavigate('skills')}
              className="mt-2 text-xs text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add skills now</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. PROJECTS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Projects ({projects.length})
        </h2>

        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{proj.role}</div>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedProject(selectedProject === proj.id ? null : proj.id)
                    }
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 self-start sm:self-auto"
                  >
                    {selectedProject === proj.id ? 'Hide Details' : 'View Project'}
                  </button>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {proj.description}
                </p>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Technologies:</span>
                    <span>{proj.technologies.join(' · ')}</span>
                  </div>
                )}

                {selectedProject === proj.id && proj.outcomes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-emerald-800 bg-emerald-50/50 p-2.5 rounded">
                    <span className="font-semibold">Outcome: </span>
                    <span>{proj.outcomes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            <p>No project deliverables recorded yet.</p>
          </div>
        )}
      </div>

      {/* 6. EDUCATION & CERTIFICATIONS & ACHIEVEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Certifications ({certifications.length})
          </h2>
          {certifications.length > 0 ? (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div key={cert.id} className="border-b border-slate-100 pb-2.5 last:border-none">
                  <div className="text-xs font-bold text-slate-900">{cert.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {cert.issuer} · {cert.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-xs">No certifications recorded yet.</div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Achievements ({achievements.length})
          </h2>
          {achievements.length > 0 ? (
            <div className="space-y-3 text-xs text-slate-700">
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex items-start gap-2 border-b border-slate-100 pb-2.5 last:border-none">
                  <Award className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span>{ach}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-xs">No academic achievements logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
