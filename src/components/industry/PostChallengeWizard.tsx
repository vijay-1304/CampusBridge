import React, { useState } from 'react';
import { IndustryChallenge, IndustryNavView } from '../../types';
import { ArrowRight, ArrowLeft, Check, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { industryApi } from '../../services/api';

interface PostChallengeWizardProps {
  onPublish: (challenge: IndustryChallenge) => void;
  onNavigate: (view: IndustryNavView) => void;
}

export const PostChallengeWizard: React.FC<PostChallengeWizardProps> = ({
  onPublish,
  onNavigate,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdBackendId, setCreatedBackendId] = useState<string | null>(null);

  // Form states prefilled with realistic prototype defaults
  const [title, setTitle] = useState('AI-Based Manufacturing Defect Detection');
  const [description, setDescription] = useState(
    'High-speed automated visual inspection system capable of detecting sub-millimeter surface flaws, micro-scratches, and component misalignment on assembly conveyers moving at 1.5 m/s.'
  );
  const [domain, setDomain] = useState('Manufacturing');
  const [skills, setSkills] = useState<string[]>([
    'Python',
    'Machine Learning',
    'Computer Vision',
    'OpenCV',
    'IoT',
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [collaborationType, setCollaborationType] = useState<
    'Student Project' | 'Academic Collaboration' | 'Research' | 'Internship'
  >('Academic Collaboration');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleFinalPublish = async () => {
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      // 1. Create challenge via real backend API
      const backendRes = await industryApi.createChallenge({
        title,
        description,
        domain,
        collaboration_type: collaborationType,
      }).catch((err) => {
        console.warn('Backend create challenge fallback note:', err);
        return null;
      });

      const newChallengeId = backendRes?.id || 'chal-' + Date.now();
      setCreatedBackendId(newChallengeId);

      const newChallenge: IndustryChallenge = {
        id: newChallengeId,
        title,
        description,
        requiredSkills: skills,
        domain: `${domain} + Artificial Intelligence`,
        collaborationType,
        academicMatchesCount: 12,
        status: 'Finding Partners',
      };

      onPublish(newChallenge);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to post challenge to backend.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* HEADER & STEP INDICATOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>POST INDUSTRY CHALLENGE</span>
          {step <= 3 && <span>STEP {step} OF 3</span>}
        </div>

        {step <= 3 ? (
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {step === 1 && 'Describe the Problem'}
              {step === 2 && 'Define Requirements'}
              {step === 3 && 'Choose Collaboration Type'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {step === 1 && 'Articulate the real-world industrial bottleneck or engineering objective.'}
              {step === 2 && 'Specify required technical capabilities, frameworks, and domain expertise.'}
              {step === 3 && 'Select your preferred institutional engagement model.'}
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Challenge Is Live
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
              CampusBridge AI is ready to extract semantic requirements and score academic laboratories.
            </p>
          </div>
        )}

        {/* Step Progress Bar */}
        {step <= 3 && (
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {step === 1 && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">Challenge Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Based Manufacturing Defect Detection"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">Problem Description</label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the operational challenge, conveyor speed, defect classification targets..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 leading-relaxed"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <span>Next: Requirements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">Primary Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Manufacturing"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">Required Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-slate-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. PyTorch, ROS, CUDA)..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <span>Next: Collaboration Type</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-900 mb-3">Choose Collaboration Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'Student Project', desc: 'Faculty-mentored undergraduate capstone team.' },
                  { id: 'Academic Collaboration', desc: 'Joint R&D sprint with university laboratories.' },
                  { id: 'Research', desc: 'Sponsored thesis or post-graduate investigation.' },
                  { id: 'Internship', desc: 'Full-time student immersion with industry stipends.' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setCollaborationType(type.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      collaborationType === type.id
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-2xs font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm">{type.id}</div>
                    <div className="text-xs text-slate-500 font-normal mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handleFinalPublish}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Challenge</span>
                    <Check className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-2">
              <div className="font-bold text-sm text-slate-900">{title}</div>
              <div className="text-slate-500">{description}</div>
              <div className="pt-2 text-slate-600 flex items-center gap-2">
                <span className="font-medium text-slate-700">Required:</span>
                <span>{skills.join(' · ')}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ai-extraction')}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find Academic Partners</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
