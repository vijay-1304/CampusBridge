import React, { useState } from 'react';
import { X, Send, CheckCircle2, Building2, School } from 'lucide-react';

interface CollaborationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeName: string;
  onConfirmSent: () => void;
}

export const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  isOpen,
  onClose,
  collegeName,
  onConfirmSent,
}) => {
  const [message, setMessage] = useState(
    'We are impressed by your Computer Vision laboratory facilities and student track record. We would like to initiate a 10-week industry-mentored sprint for our high-speed manufacturing defect detection project.'
  );
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    onConfirmSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSent ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Start Collaboration?</h2>
            <p className="text-xs text-slate-500 mt-1">
              Send a formal R&amp;D partnership proposal to the academic institution's research dean.
            </p>

            <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Industry Sponsor:</span>
                <span className="font-bold text-slate-900">ABC Technologies</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Academic Partner:</span>
                <span className="font-bold text-slate-900">{collegeName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target Challenge:</span>
                <span className="font-bold text-slate-900">AI-Based Manufacturing Defect Detection</span>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Partnership Message / Scope Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
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
                Your partnership proposal has been dispatched to {collegeName}.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-semibold">
              <span>Status: Pending Approval</span>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full px-6 py-2.5 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
              >
                Close &amp; Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
