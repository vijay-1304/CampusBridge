import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { StudentProfile, StudentNavView } from '../../types';

interface AIAssistantProps {
  profile: StudentProfile;
  onNavigate: (view: StudentNavView) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionText?: string;
  actionView?: StudentNavView;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ profile, onNavigate }) => {
  const studentName = profile.name || 'Student';
  const targetRole = profile.targetRole || 'Engineering Professional';
  const userDegree = profile.degree || 'Degree Program';

  const strengthsList = profile.strengths && profile.strengths.length > 0
    ? profile.strengths.join(', ')
    : (profile.skills || []).filter(s => s.proficiency === 'Advanced').map(s => s.name).join(', ') || 'software development';

  const developingList = profile.developing && profile.developing.length > 0
    ? profile.developing.join(', ')
    : (profile.skills || []).filter(s => s.proficiency === 'Beginner').map(s => s.name).join(', ') || 'advanced domain skills';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${studentName}! I'm CampusBridge AI, your personalized academic and career advisor. Based on your profile (${userDegree}), I can help you evaluate skill gaps, match collaborations, and plan learning milestones for your target role as a ${targetRole}. What would you like to explore today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'What skills should I learn next?',
    'Which opportunities match my profile?',
    'How can I improve my technical readiness?',
    'How to optimize my Skill Passport?',
  ];

  const handleAsk = (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply: Message;
      const q = query.toLowerCase();

      if (q.includes('skills should i learn') || q.includes('next skills')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `For your target career as **${targetRole}**, you have established foundations in **${strengthsList}**. To maximize your market competitiveness, focus on advancing **${developingList}** and adding verifiable project evidence to your profile.`,
          actionText: 'View My Skill Gap Diagnostic',
          actionView: 'skill-gap',
        };
      } else if (q.includes('which opportunities match') || q.includes('opportunities')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Opportunities are ranked dynamically based on skill overlap with your verified profile. Browse active industry problem statements and internship tracks matching **${targetRole}**.`,
          actionText: 'Browse Opportunities',
          actionView: 'opportunities',
        };
      } else if (q.includes('improve') || q.includes('technical readiness')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `I recommend structuring a project-driven learning plan: 1. Core architecture & fundamentals → 2. Practical implementation deliverable → 3. API/microservice integration → 4. Verification & benchmark deployment in your Skill Passport.`,
          actionText: 'Open Guided Learning Path',
          actionView: 'skill-gap',
        };
      } else if (q.includes('passport') || q.includes('optimize')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Your Skill Passport displays verified skills backed by real deliverables. Complete project milestones in academic collaborations to earn cryptographically verifiable badges.`,
          actionText: 'Open Skill Passport',
          actionView: 'skill-passport',
        };
      } else {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `I analyzed your technical profile for **${targetRole}**. Keep your skills and project artifacts up to date to ensure high affinity scores when industry partners publish challenges.`,
          actionText: 'Manage My Skills',
          actionView: 'skills',
        };
      }

      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* GLOBAL BACK BUTTON */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* HEADER */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CampusBridge AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Academic and Career Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Ask questions about your skills, industry gap analysis, or recommended collaboration opportunities.
        </p>
      </div>

      {/* SUGGESTED PROMPTS */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleAsk(q)}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-slate-700 text-xs rounded-lg transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs min-h-[380px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-md bg-[#173B63] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed max-w-lg ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.actionText && m.actionView && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200">
                    <button
                      onClick={() => onNavigate(m.actionView!)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      <span>{m.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>CampusBridge AI is analyzing your request...</span>
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="flex items-center gap-2 pt-3 border-t border-slate-100"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your skills, learning paths, or career recommendations..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 sm:px-4 sm:py-2 bg-[#173B63] hover:bg-[#122e4e] text-white rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
