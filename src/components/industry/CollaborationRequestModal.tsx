import React, { useState } from 'react';
import { X, Send, CheckCircle2, Building2, School, AlertCircle, Loader2 } from 'lucide-react';
import { collaborationApi } from '../../services/api';

interface CollaborationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  challengeTitle: string;
  collegeId: string;
  collegeName: string;
  matchScore?: number | null;
  onSuccess?: () => void;
  onViewRequests?: () => void;
}

export const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  isOpen,
  onClose,
  challengeId,
  challengeTitle,
  collegeId,
  collegeName,
  matchScore,
  onSuccess,
  onViewRequests,
}) => {
  const [message, setMessage] = useState(
    `We are interested in collaborating on "${challengeTitle}" based on your institutional capabilities. We would like to initiate an academic-industry collaboration project.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId || !collegeId) {
      setErrorMessage('Missing challenge or college reference.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await collaborationApi.createRequest({
        challenge_id: challengeId,
        college_id: collegeId,
        message: message.trim() || undefined,
      });
      setIsSent(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (err?.status === 409) {
        setErrorMessage(
          err.message || 'An active or pending collaboration request already exists for this challenge and college.'
        );
      } else if (err?.status === 400) {
        setErrorMessage(
          err.message || 'A deterministic match must exist between this challenge and college before requesting collaboration.'
        );
      } else {
        setErrorMessage(err?.message || 'Failed to send collaboration request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsSent(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
        <button
          onClick={handleModalClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Close"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
        </button>

        {!isSent ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request Collaboration</h2>
            <p className="text-xs text-slate-500 mt-1">
              Initiate a formal academic-industry collaboration proposal with the verified institution.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Target Challenge:</span>
                <span className="font-bold text-slate-900 truncate max-w-[240px]">{challengeTitle}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Academic Partner:</span>
                <span className="font-bold text-slate-900">{collegeName}</span>
              </div>
              {matchScore !== undefined && matchScore !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Deterministic Fit Score:</span>
                  <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {Math.round(matchScore)}%
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proposal Message / Project Scope Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed text-slate-800 disabled:bg-slate-50"
                  placeholder="Outline your project scope, target timeline, and collaboration expectations..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Collaboration Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Collaboration Request Sent</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your partnership proposal for <strong className="text-slate-900">{challengeTitle}</strong> has been delivered to <strong className="text-slate-900">{collegeName}</strong>.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-semibold">
              <span>Status: Pending Academic Review</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
              {onViewRequests && (
                <button
                  onClick={() => {
                    handleModalClose();
                    onViewRequests();
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  View My Requests
                </button>
              )}
              <button
                onClick={handleModalClose}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
