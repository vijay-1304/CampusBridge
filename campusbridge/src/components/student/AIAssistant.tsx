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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello Vijay! I'm CampusBridge AI, your personalized academic and career advisor. Based on your profile (${profile.degree}), I can help you evaluate skill gaps, match internships, and structure research project milestones. What would you like to explore today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'What skills should I learn next?',
    'Which opportunities match my profile?',
    'How can I improve my AI/ML skills?',
    'Why am I missing this opportunity?',
  ];

  const handleAsk = (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply: Message;
      if (query.includes('skills should I learn next')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `For your target career as an **AI / ML Engineer**, you have solid core foundations in Python, JavaScript, and Machine Learning. Your primary gaps are **Computer Vision** (OpenCV) and **FastAPI** microservice deployment. Currently, 6 high-stipend opportunities on CampusBridge require Computer Vision.`,
          actionText: 'View My Skill Gap Diagnostic',
          actionView: 'skill-gap',
        };
      } else if (query.includes('Which opportunities match')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Your strongest active match is the **AI / ML Internship at ABC Technologies** with a **91% Illustrative Match Score**. They are building an automated manufacturing defect detection pipeline using computer vision. Your Python and ML background matches directly!`,
          actionText: 'Review ABC Technologies Opportunity',
          actionView: 'opportunity-detail',
        };
      } else if (query.includes('improve my AI/ML skills')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `I recommend following the 4-step learning path: 1. Computer Vision Fundamentals → 2. OpenCV Practical Project (defect detection) → 3. FastAPI Real-Time Inference Microservices → 4. Docker Deployment on Jetson hardware. This provides concrete capstone artifacts for industry recruiters.`,
          actionText: 'Open Guided Learning Path',
          actionView: 'skill-gap',
        };
      } else if (query.includes('missing this opportunity')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Opportunities with sub-85% matches typically require Docker containerization or MQTT edge IoT protocol knowledge. Adding a lightweight edge project to your profile will lift your match rate by ~12%.`,
          actionText: 'Update Skills & Projects',
          actionView: 'skills',
        };
      } else {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `I analyzed your technical profile against current industry requirements. To maximize your match score for top-tier roles, consider building an OpenCV-based defect detection prototype to demonstrate end-to-end edge inference.`,
          actionText: 'Explore Opportunities',
          actionView: 'opportunities',
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
          Your Academic and Career Assistant
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
                <div>{m.text}</div>

                {m.actionText && m.actionView && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200">
                    <button
                      onClick={() => onNavigate(m.actionView!)}
                      className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-900 text-xs"
                    >
                      <span>{m.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 font-semibold text-xs">
                  VB
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>CampusBridge AI is analyzing your profile...</span>
            </div>
          )}
        </div>

        {/* INPUT BOX */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="pt-3 border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your skills, role gaps, or matching opportunities..."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 bg-[#173B63] hover:bg-[#122e4e] text-white rounded-lg disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
