import React, { useState } from 'react';
import { UserRole } from '../../types';
import { X, Lock, Mail, User, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('vijayybhosalee.13@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Vijay Bhosale');
  const [role, setRole] = useState<UserRole>('student');
  const [rememberMe, setRememberMe] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(role);
    onClose();
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    onSuccess(demoRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Sign in to CampusBridge' : 'Create an Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access your skill profile, applications, or institutional portal.'
              : 'Join the academic–industry collaboration network.'}
          </p>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            One-Click Demo Profiles:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-2 py-1.5 text-xs font-medium bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded transition-colors text-center"
            >
              Student (Vijay)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('industry')}
              className="px-2 py-1.5 text-xs font-medium bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded transition-colors text-center"
            >
              ABC Tech
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('college')}
              className="px-2 py-1.5 text-xs font-medium bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 rounded transition-colors text-center"
            >
              ABC College
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="Vijay Bhosale"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                >
                  <option value="student">Student (Talent &amp; Projects)</option>
                  <option value="college">College (Faculty &amp; Infrastructure)</option>
                  <option value="industry">Industry (Enterprise Challenges)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                placeholder="name@institution.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {resetSent && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              Password reset link sent to registered email. Check your inbox.
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-300"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-blue-700 hover:underline"
                onClick={() => setResetSent(true)}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173B63] hover:bg-[#122e4e] rounded-lg transition-colors shadow-sm"
          >
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-blue-700 font-medium hover:underline"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-700 font-medium hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
