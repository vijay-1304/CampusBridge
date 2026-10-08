import React, { useState } from 'react';
import { CollegeNavView } from '../../types';
import { Building2, Check, X, ArrowRight, ArrowLeft, Eye, Sparkles } from 'lucide-react';

interface CollegeCollaborationRequestsProps {
  onAcceptRequest: () => void;
  onNavigate: (view: CollegeNavView) => void;
}

export const CollegeCollaborationRequests: React.FC<CollegeCollaborationRequestsProps> = ({
  onAcceptRequest,
  onNavigate,
}) => {
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      industryPartner: 'ABC Technologies',
      division: 'Robotics & Automation Business Unit',
      challengeTitle: 'AI-Based Manufacturing Defect Detection',
      requiredSkills: ['AI / ML', 'Computer Vision', 'IoT', 'OpenCV'],
      proposedDuration: '10 Weeks Sprint',
      stipendSponsorship: '₹1,50,000 Project Hardware & Stipend Grant',
      receivedDate: 'Yesterday',
      detailsExpanded: false,
    },
  ]);

  const [rejectedIds, setRejectedIds] = useState<string[]>([]);

  const handleAccept = (id: string) => {
    onAcceptRequest();
    onNavigate('workspace');
  };

  const handleReject = (id: string) => {
    setRejectedIds([...rejectedIds, id]);
  };

  const toggleDetails = (id: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, detailsExpanded: !r.detailsExpanded } : r))
    );
  };

  const activeRequests = requests.filter((r) => !rejectedIds.includes(r.id));

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Incoming Industry Collaboration Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review formal enterprise R&amp;D partnership proposals matched to your faculty and laboratory facilities.
        </p>
      </div>

      {/* REQUESTS LIST */}
      <div className="space-y-4">
        {activeRequests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-800">{req.industryPartner}</span>
                  <span aria-hidden="true">·</span>
                  <span>{req.division}</span>
                  <span aria-hidden="true">·</span>
                  <span>Received {req.receivedDate}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{req.challengeTitle}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Required Skills:</span>
                  <span>{req.requiredSkills.join(' · ')}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-800">Sponsorship:</span>
                  <span>{req.stipendSponsorship}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => toggleDetails(req.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{req.detailsExpanded ? 'Hide Scope' : 'View Details'}</span>
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAccept(req.id)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Request</span>
                </button>
              </div>
            </div>

            {req.detailsExpanded && (
              <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-lg space-y-3 text-xs text-slate-700 animate-in fade-in duration-150">
                <div className="font-semibold text-slate-900">Project Scope &amp; Target Deliverables:</div>
                <p className="leading-relaxed">
                  ABC Technologies will supply high-resolution industrial conveyor camera streams and edge Jetson hardware modules. The academic partner will provide Computer Vision laboratory workspace, mentor oversight by Prof. Anjali Mehta, and a student implementation team (Lead: Vijay Bhosale).
                </p>
                <div className="flex items-center gap-4 text-emerald-800 font-medium">
                  <span>✓ Standard Academic MoU Applied</span>
                  <span>✓ Student Capstone Accreditation</span>
                  <span>✓ Co-Authored Technical Paper Option</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {activeRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 text-slate-500 text-sm">
            All pending collaboration proposals have been processed.
          </div>
        )}
      </div>
    </div>
  );
};
