import React, { useState, useEffect } from 'react';
import { IndustryNavView } from '../../types';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Cpu } from 'lucide-react';

interface AIExtractionProcessingProps {
  onComplete: () => void;
  onNavigate: (view: IndustryNavView) => void;
}

export const AIExtractionProcessing: React.FC<AIExtractionProcessingProps> = ({
  onComplete,
  onNavigate,
}) => {
  const steps = [
    'Reading challenge specifications and constraints',
    'Extracting required technical skills & frameworks',
    'Identifying domain context (Manufacturing + AI)',
    'Analyzing academic faculty credentials & lab facilities',
    'Finding compatible engineering institutions',
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsDone(true);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 text-center space-y-8">
      {/* GLOBAL BACK BUTTON */}
      <div className="text-left">
        <button
          onClick={() => onNavigate('post-challenge')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Challenge Form</span>
        </button>
      </div>

      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
          <Cpu className="w-3.5 h-3.5" />
          <span>CampusBridge AI Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Understanding Your Requirement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Deconstructing technical specifications against institutional capability graphs.
        </p>
      </div>

      {/* ANIMATED STEPS CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs text-left space-y-4">
        {steps.map((text, idx) => {
          const isFinished = idx < activeStepIndex || (idx === activeStepIndex && isDone);
          const isCurrent = idx === activeStepIndex && !isDone;

          return (
            <div
              key={text}
              className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 ${
                isFinished
                  ? 'text-slate-900 font-medium'
                  : isCurrent
                  ? 'text-blue-700 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {isFinished ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : isCurrent ? (
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-200 shrink-0" />
              )}
              <span>{text}</span>
            </div>
          );
        })}
      </div>

      {/* COMPLETION STATE & EXTRACTED REQUIREMENTS */}
      {isDone && (
        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          <div className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>AI Requirement Extraction Complete (Simulated Process)</span>
          </div>

          {/* Extracted Requirements Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900">Extracted Domain Context</span>
              <span className="text-blue-700 font-mono">Manufacturing + AI</span>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-slate-700">Identified Competency Vectors:</div>
              <div className="text-slate-600">Python · Machine Learning · Computer Vision · OpenCV · Industrial IoT</div>
            </div>
            <div className="space-y-1 pt-1 border-t border-slate-200">
              <div className="font-semibold text-slate-700">Matched Institutional Requirements:</div>
              <div className="text-slate-600">
                Specialized CV optical rigs, GPU edge testing bench, and faculty research mentors.
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                onComplete();
                onNavigate('ai-matching');
              }}
              className="px-8 py-3 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
            >
              <span>View Academic Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
