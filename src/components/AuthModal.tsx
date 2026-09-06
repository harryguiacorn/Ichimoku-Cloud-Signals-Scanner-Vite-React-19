import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MarketIndex } from '../types';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO'>('INTERMEDIATE');
  const [selectedIndices, setSelectedIndices] = useState<MarketIndex[]>(['SP500', 'NASDAQ100']);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleIndex = (idx: MarketIndex) => {
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (mode === 'REGISTER') {
      if (!name.trim()) {
        setErrorMsg('Please enter your trader handle or name.');
        return;
      }
      register(name.trim(), email, password, experience, selectedIndices);
      onClose();
    } else {
      login(email, password);
      onClose();
    }
  };

  const handleGuestDemo = () => {
    loginAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <User className="w-6 h-6 text-slate-950" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {mode === 'REGISTER' ? 'Create Trader Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Access personalized watchlists, custom Ichimoku parameters, and real-time alert dispatch.
          </p>
        </div>

        {/* Guest Demo 1-Click Button */}
        <div className="mb-6">
          <button
            onClick={handleGuestDemo}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 hover:border-amber-400 text-amber-300 font-semibold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>1-Click Instant Demo Access (No Password Needed)</span>
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-2 text-slate-500 font-mono">OR SIGN IN WITH EMAIL</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
          <button
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'REGISTER'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'LOGIN'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-slate-400 font-mono mb-1">Trader Name / Handle</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Alex Henderson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-mono mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="trader@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-slate-400 font-mono mb-1">Trading Experience</label>
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="BEGINNER">Beginner (Learning Ichimoku)</option>
                  <option value="INTERMEDIATE">Intermediate (Swing / Momentum)</option>
                  <option value="ADVANCED">Advanced (Multi-Timeframe / Kicker)</option>
                  <option value="PRO">Institutional / Full-Time</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Preferred Markets to Scan</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['SP500', 'NASDAQ100', 'DOW30', 'FTSE100', 'FUTURES'] as const).map(idx => {
                    const active = selectedIndices.includes(idx);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => toggleIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                          active
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {idx}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-colors"
          >
            {mode === 'REGISTER' ? 'Complete Registration' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500 text-center">
          Persistent session data stored locally. Ready for backend sync with your Python repo.
        </p>
      </div>
    </div>
  );
};
