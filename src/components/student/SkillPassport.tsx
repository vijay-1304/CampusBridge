import React, { useEffect, useState } from 'react';
import { StudentNavView } from '../../types';
import {
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  GraduationCap,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { studentApi } from '../../services/api';

interface SkillPassportProps {
  onNavigate: (view: StudentNavView) => void;
}

interface PassportData {
  student_id: string;
  full_name: string;
  target_role?: string;
  total_skills: number;
  verified_skills_count: number;
  skills_by_category: Record<string, any[]>;
  skills: Array<{
    id: string;
    skill_id: string;
    skill_name: string;
    category?: string;
    proficiency_level: number;
    source: string;
    evidence_url?: string;
    is_verified: boolean;
  }>;
}

export const SkillPassport: React.FC<SkillPassportProps> = ({ onNavigate }) => {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await studentApi.getPassport();
        setPassport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load skill passport.');
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, []);

  const getProficiencyLabel = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Novice (1/5)';
      case 2:
        return 'Beginner (2/5)';
      case 3:
        return 'Intermediate (3/5)';
      case 4:
        return 'Advanced (4/5)';
      case 5:
        return 'Expert (5/5)';
      default:
        return `Level ${lvl}/5`;
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

      {/* 1. HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
          <Shield className="w-4 h-4" />
          <span>Verifiable Competency Record</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Skill Passport
        </h1>
        <p className="text-sm text-slate-500">
          Cryptographically grounded skill claims derived from coursework, real projects, and verified academic deliverables.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs">Generating Skill Passport from verified database records...</p>
        </div>
      )}

      {!loading && passport && (
        <>
          {/* PASSPORT SUMMARY CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-[#173B63] to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-700">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded-full text-[11px] font-medium mb-3">
                  <Sparkles className="w-3 h-3 text-blue-300" />
                  <span>CampusBridge Verified Talent ID</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{passport.full_name}</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Target Role: {passport.target_role || 'Software & AI Engineer'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{passport.total_skills}</div>
                  <div className="text-[11px] text-slate-300 font-medium mt-0.5">Total Skills</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {passport.verified_skills_count}
                  </div>
                  <div className="text-[11px] text-emerald-200 font-medium mt-0.5">Verified Badges</div>
                </div>
              </div>
            </div>
          </div>

          {/* EMPTY SKILLS STATE */}
          {passport.skills.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="text-slate-400 font-medium text-xs">
                No skill claims recorded yet. Add your technical skills in the My Skills section.
              </div>
              <button
                onClick={() => onNavigate('skills')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg"
              >
                Add Skills to Passport
              </button>
            </div>
          )}

          {/* VERIFIED SKILL CLAIMS TABLE */}
          {passport.skills.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Itemized Competency Inventory
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {passport.skills.length} competencies
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {passport.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-slate-900">{skill.skill_name}</span>
                        {skill.category && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                            {skill.category}
                          </span>
                        )}
                        {skill.is_verified ? (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                            ✓ Verified Claim
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                            Self-Reported
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>Proficiency: {getProficiencyLabel(skill.proficiency_level)}</span>
                        <span>·</span>
                        <span className="capitalize">Source: {skill.source.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {skill.evidence_url && (
                      <a
                        href={skill.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors self-start sm:self-auto"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Evidence Artifact</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
