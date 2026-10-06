import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Shield, Key, Database, RefreshCw, Terminal, CheckCircle2, ChevronDown, User } from 'lucide-react';

interface HeaderProps {
  onShowSqlLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowSqlLogs }) => {
  const { players, activePlayer, setActivePlayerId, jwtAccessToken, resetDatabase, sqlLogs } = useArena();
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter shadow-md shadow-cyan-500/20">
            AX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-slate-100 font-mono">ARENA<span className="text-cyan-400">X</span></span>
              <span className="text-slate-500" aria-hidden="true">/</span>
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Django REST Framework</span>
              <span aria-hidden="true">·</span>
              <span>MySQL InnoDB</span>
              <span aria-hidden="true">·</span>
              <span>ELO Core</span>
            </div>
          </div>
        </div>

        {/* Live Metrics & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Active Player switcher */}
          <div className="relative">
            <button
              onClick={() => setShowPlayerDropdown(!showPlayerDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 text-xs text-slate-200 transition-colors"
            >
              <img
                src={activePlayer.avatar}
                alt={activePlayer.username}
                className="w-5 h-5 rounded-full object-cover border border-slate-600"
              />
              <div className="text-left font-mono">
                <span className="font-semibold">{activePlayer.username}</span>
                <span className="text-cyan-400 ml-1.5">[{activePlayer.elo_rating} ELO]</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPlayerDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                  Switch Active Auth User
                </div>
                {players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePlayerId(p.id);
                      setShowPlayerDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-800 transition-colors ${
                      p.id === activePlayer.id ? 'bg-slate-800/80 text-cyan-300 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span>{p.username}</span>
                      <span className="text-[10px] text-slate-500">Lv.{p.level}</span>
                    </div>
                    <span className="font-mono text-cyan-400">{p.elo_rating}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* JWT Token Status Button */}
          <button
            onClick={() => setShowTokenModal(!showTokenModal)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-xs font-mono text-amber-300 transition-colors"
            title="Inspect active JWT Bearer token"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>JWT: Bearer</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">15m TTL</span>
          </button>

          {/* SQL Activity Trigger */}
          <button
            onClick={onShowSqlLogs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQL Logs</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
              {sqlLogs.length}
            </span>
          </button>

          {/* Reset DB Demo State */}
          <button
            onClick={() => {
              if (window.confirm('Reset simulated database state to default seed data?')) {
                resetDatabase();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            title="Reset database state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* JWT Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-slate-100 font-mono text-sm">Active JWT Authentication Payload</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono px-2 py-0.5 rounded"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider">Access Token (Bearer Header)</label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-amber-300/90 break-all select-all">
                  {jwtAccessToken}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider">Decoded Token Claims</label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300">
                  <pre className="whitespace-pre-wrap">{JSON.stringify({
                    user_id: activePlayer.id,
                    username: activePlayer.username,
                    role: activePlayer.role,
                    token_type: 'access',
                    exp: 1738588000,
                    jti: 'f4b23d9023ae',
                    issuer: 'https://arenax-backend.internal'
                  }, null, 2)}</pre>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Protected DRF endpoints automatically receive this header: <code className="text-cyan-300">Authorization: Bearer &lt;TOKEN&gt;</code></span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
