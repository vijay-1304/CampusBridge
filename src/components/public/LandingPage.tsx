import React from 'react';
import { ArrowRight, CheckCircle2, Cpu, GraduationCap, Building2, School, Layers, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSelectRole }) => {
  return (
    <div className="bg-[#F8FAFC] text-[#0F172A]">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Hackathon 2026 Context Tag (Unboxed, clean metadata) */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-700 mb-6">
              <span>WCE-HACKATHON 2026</span>
              <span aria-hidden="true">·</span>
              <span>Academic–Industry Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.1] text-balance">
              From Industry Needs <br className="hidden sm:inline" />
              <span className="text-[#173B63]">to Academic Collaboration.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              CampusBridge connects students, academic institutions and industry through AI-powered skill mapping,
              intelligent matching and structured collaboration.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center"
              >
                Explore How It Works
              </a>
            </div>
          </div>

          {/* HERO VISUAL DIAGRAM */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Node 1: Student */}
                <button
                  onClick={() => onSelectRole('student')}
                  className="p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-700">Student</div>
                  <div className="text-xs text-slate-500 mt-1">Skills · Gaps · Learning</div>
                </button>

                {/* Arrow / Connection */}
                <div className="hidden md:flex flex-col items-center justify-center text-slate-400">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Maps Gaps</div>
                  <div className="w-full h-0.5 bg-slate-200 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                </div>

                {/* Node 2: CampusBridge AI */}
                <div className="p-4 rounded-lg bg-[#173B63] text-white text-left md:col-span-1 shadow-sm">
                  <div className="w-8 h-8 rounded-md bg-blue-600/40 text-blue-200 flex items-center justify-center mb-2.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-sm text-white">CampusBridge AI</div>
                  <div className="text-xs text-blue-200 mt-1">Matching &amp; Workspaces</div>
                </div>

                {/* Node 3 & 4 (College & Industry) */}
                <div className="grid grid-cols-2 gap-2 md:col-span-1">
                  <button
                    onClick={() => onSelectRole('college')}
                    className="p-3 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-left group"
                  >
                    <School className="w-4 h-4 text-amber-600 mb-1.5" />
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-amber-700">College</div>
                    <div className="text-[10px] text-slate-500">Labs &amp; Teams</div>
                  </button>

                  <button
                    onClick={() => onSelectRole('industry')}
                    className="p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-left group"
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 mb-1.5" />
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700">Industry</div>
                    <div className="text-[10px] text-slate-500">Challenges</div>
                  </button>
                </div>
              </div>

              {/* Sub-bar showing closed-loop outcome */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">Closed-Loop Workflow:</span>
                <span className="hidden sm:inline">Assess Skills</span>
                <span className="hidden sm:inline" aria-hidden="true">→</span>
                <span className="hidden sm:inline">Identify Gap</span>
                <span className="hidden sm:inline" aria-hidden="true">→</span>
                <span className="hidden sm:inline">Match Institution</span>
                <span className="hidden sm:inline" aria-hidden="true">→</span>
                <span className="hidden sm:inline">Collaborate &amp; Build</span>
                <span className="hidden sm:inline" aria-hidden="true">→</span>
                <span className="text-blue-700 font-medium">Verify Real Outcomes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Architecture</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              How CampusBridge Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              A structured 4-step framework connecting talent, academic facilities, and enterprise challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-slate-300 font-mono mb-3">01</div>
              <h3 className="text-base font-semibold text-slate-900">Build Your Profile</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Students catalog skills and projects; colleges map departmental laboratories and faculty; industry defines technical requirements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-slate-300 font-mono mb-3">02</div>
              <h3 className="text-base font-semibold text-slate-900">Discover Skills &amp; Gaps</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                CampusBridge analyzes current capabilities against live industry role demands to expose exact skill gaps and recommended learning paths.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-slate-300 font-mono mb-3">03</div>
              <h3 className="text-base font-semibold text-slate-900">Find the Right Partner</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Industry problems trigger AI requirement extraction, calculating multidimensional academic capability scores with target colleges.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-slate-300 font-mono mb-3">04</div>
              <h3 className="text-base font-semibold text-slate-900">Collaborate &amp; Track</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Execute structured projects in unified workspaces with AI milestone tracking, culminating in verified outcomes that update student skill profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THREE AUDIENCE PILLARS */}
      <section className="py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* FOR STUDENTS */}
          <div id="for-students" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-2">
                <GraduationCap className="w-4 h-4" />
                <span>For Students</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Turn coursework into verified industry readiness.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Stop guessing what companies need. Understand your exact skill gaps and work on real industrial challenges under faculty mentorship.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Build your comprehensive, verified technical skill profile.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Identify skill gaps with AI-powered role benchmarking.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Discover high-match internships, industrial projects, and jobs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Earn accredited project experience directly on your profile.</span>
                </li>
              </ul>
              <div className="mt-6">
                <button
                  onClick={() => onSelectRole('student')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
                >
                  Explore Student Experience
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-400 mb-3">Preview: Student Skill Gap Analysis</div>
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-900">
                  <span>Target Role: AI / ML Engineer</span>
                  <span className="text-xs text-blue-700 font-mono">82% Profile Readiness</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <div className="font-semibold text-emerald-700 mb-1">You Already Have</div>
                    <div className="text-slate-600">Python · SQL · Machine Learning</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <div className="font-semibold text-amber-700 mb-1">Skills to Improve</div>
                    <div className="text-slate-600">Computer Vision · OpenCV · FastAPI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* FOR COLLEGES */}
          <div id="for-colleges" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-400 mb-3">Preview: Academic Capability Scorecard</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xl font-bold text-slate-900 font-mono">18</div>
                  <div className="text-[11px] text-slate-500 mt-1">AI/ML Faculty</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xl font-bold text-slate-900 font-mono">120+</div>
                  <div className="text-[11px] text-slate-500 mt-1">Relevant Students</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xl font-bold text-slate-900 font-mono">6</div>
                  <div className="text-[11px] text-slate-500 mt-1">Specialized Labs</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xl font-bold text-slate-900 font-mono">24</div>
                  <div className="text-[11px] text-slate-500 mt-1">Completed Collabs</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-2">
                <School className="w-4 h-4" />
                <span>For Colleges</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Showcase your institution's true research &amp; talent capacity.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Transform institutional silos into discoverable capability hubs. Attract sponsored R&amp;D projects, research grants, and high-quality campus placements.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Highlight specialized laboratories, research centers, and computing clusters.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Connect faculty mentors with student teams for industrial problem-solving.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Receive structured industry collaboration requests with predefined deliverables.</span>
                </li>
              </ul>
              <div className="mt-6">
                <button
                  onClick={() => onSelectRole('college')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
                >
                  Explore College Experience
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* FOR INDUSTRY */}
          <div id="for-industry" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-2">
                <Building2 className="w-4 h-4" />
                <span>For Industry</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Solve engineering challenges with verified academic partners.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Post industrial challenges, automatically extract technical requirements, and discover institutions with matching faculty, testbeds, and student engineers.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Post real-world engineering and product challenges with a 3-step wizard.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>AI requirement extraction matches multi-variable campus infrastructure.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Evaluate detailed college profiles, faculty publications, and lab capabilities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Oversee collaborative sprint milestones with student &amp; faculty teams.</span>
                </li>
              </ul>
              <div className="mt-6">
                <button
                  onClick={() => onSelectRole('industry')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors"
                >
                  Explore Industry Experience
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-400 mb-3">Preview: AI Academic Matching Result</div>
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">ABC Engineering College</div>
                    <div className="text-xs text-slate-500">Sangli, Maharashtra · 6 Specialized Labs</div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-700 font-mono">92%</span>
                    <div className="text-[10px] text-slate-500">Illustrative Match</div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                  Strongest alignment: Computer Vision Lab · 18 AI Faculty · Industrial IoT Testbed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            Build the bridge between academia and industry.
          </h2>
          <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto">
            Experience the complete closed-loop prototype designed for WCE-HACKATHON 2026.
          </p>
          <div className="mt-8">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 text-sm font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-10 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">CampusBridge</span>
            <span aria-hidden="true">·</span>
            <span>WCE-HACKATHON 2026 Prototype Showcase</span>
          </div>
          <div>
            Built with React, Tailwind CSS, TypeScript, and FastAPI+Supabase ready architecture.
          </div>
        </div>
      </footer>
    </div>
  );
};
