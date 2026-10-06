import React, { useState } from 'react';
import { useArena } from '../../context/ArenaContext';
import { LogIn, UserPlus, Shield, AlertCircle, CheckCircle2, User } from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode = 'LOGIN' }) => {
  const { login, register, setCurrentScreen } = useArena();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  // Form states
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'REGISTER') {
      if (password !== confirmPassword) {
        setErrorMsg('❌ Passwords do not match. Please re-enter.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('❌ Password must be at least 4 characters.');
        return;
      }
      const res = register(username, email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      const res = login(username, password);
      if (!res.success) {
        setErrorMsg(res.error || '❌ Invalid username or password');
      }
    }
  };

  const handleQuickLogin = (demoUser: string) => {
    setErrorMsg(null);
    login(demoUser, 'password123');
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-2xl tracking-tighter mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            AX
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-mono">
            {mode === 'REGISTER' ? 'Create your ArenaX Account' : 'Welcome Back!'}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {mode === 'REGISTER'
              ? 'Join the ranked battle arena and claim your starting 1000 ELO.'
              : 'Enter your credentials to access your player dashboard.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {mode === 'REGISTER' ? 'Username' : 'Email / Username'}
            </label>
            <input
              type="text"
              required
              placeholder={mode === 'REGISTER' ? 'e.g. GladiatorX' : 'e.g. Piyush or piyush@arenax.gg'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-100 focus:border-cyan-500 outline-none transition-colors"
            />
          </div>

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="gladiator@arenax.gg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-100 focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-100 focus:border-cyan-500 outline-none transition-colors"
            />
          </div>

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-100 focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            {mode === 'REGISTER' ? 'CREATE ACCOUNT' : 'LOGIN'}
          </button>
        </form>

        {/* Toggle between Login / Register */}
        <div className="mt-6 text-center text-xs font-mono text-slate-400">
          {mode === 'REGISTER' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMsg(null);
                }}
                className="text-cyan-400 hover:underline font-bold"
              >
                Login
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMsg(null);
                }}
                className="text-cyan-400 hover:underline font-bold"
              >
                Register
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[11px] font-mono uppercase text-slate-500 text-center mb-2">
            Instant Demo Logins:
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('Piyush')}
              className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-center transition-colors cursor-pointer"
            >
              <div className="font-bold">Piyush</div>
              <div className="text-[10px] text-cyan-400">1200 ELO</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Rahul')}
              className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-center transition-colors cursor-pointer"
            >
              <div className="font-bold">Rahul</div>
              <div className="text-[10px] text-cyan-400">1185 ELO</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Aman')}
              className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-center transition-colors cursor-pointer"
            >
              <div className="font-bold">Aman</div>
              <div className="text-[10px] text-amber-400">1820 ELO</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
