import React from 'react';
import { useArena } from '../../context/ArenaContext';
import { Swords, Shield, Heart, Trophy, Zap, Play, UserPlus, LogIn, ArrowRight, Gamepad2 } from 'lucide-react';

export const LandingScreen: React.FC = () => {
  const { setCurrentScreen, isLoggedIn } = useArena();

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-16 px-4 text-center space-y-12">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-mono text-xs uppercase tracking-widest animate-pulse">
        <Zap className="w-3.5 h-3.5 text-cyan-400" />
        <span>Live 1v1 Multiplayer Battle Arena</span>
      </div>

      {/* Main Title & Tagline */}
      <div className="space-y-4">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight font-mono text-slate-100">
          ARENA<span className="text-cyan-400">X</span>
        </h1>
        <p className="text-lg sm:text-2xl font-bold text-slate-300 tracking-wide">
          Fight. Win. Rank. Conquer.
        </p>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Browser-based competitive turn-based battle arena powered by server-authoritative ELO matchmaking, tactical combat mechanics, and live ranked leaderboards.
        </p>
      </div>

      {/* Hero Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={() => setCurrentScreen(isLoggedIn ? 'DASHBOARD' : 'LOGIN')}
          className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-base uppercase tracking-wider font-mono flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-cyan-500/25 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>PLAY NOW</span>
        </button>

        {/* Instant 3D Combat Arena Access */}
        <button
          onClick={() => setCurrentScreen('BATTLE_3D')}
          className="px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider font-mono flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25 cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>🎮 3D ARENA MAP</span>
        </button>

        {!isLoggedIn && (
          <>
            <button
              onClick={() => setCurrentScreen('LOGIN')}
              className="px-7 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-bold text-sm uppercase tracking-wider font-mono flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>LOGIN</span>
            </button>

            <button
              onClick={() => setCurrentScreen('REGISTER')}
              className="px-7 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 font-bold text-sm uppercase tracking-wider font-mono flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>REGISTER</span>
            </button>
          </>
        )}
      </div>

      {/* 3 Core Combat Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-mono mb-1">⚔️ Strategic Attack</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Deal 18-24 precision damage. Timed strikes overcome enemy guard and deplete opponent HP to claim competitive dominance.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-mono mb-1">🛡️ Tactical Defend</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Raise kinetic energy shields to absorb 50% of incoming damage on the following turn. Perfect for turning the tide against aggressive rivals.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-mono mb-1">❤️ Limited Heal</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Restore +20 HP up to maximum 100 HP. Limited to 2 charges per battle to maintain intense competitive pacing.
          </p>
        </div>
      </div>

      {/* Ranked ELO Engine Feature */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 font-mono text-sm sm:text-base">
              Mathematically Fair ELO Matchmaking
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic window matchmaking pairs you against balanced opponents (±100 to ±300 ELO). Win to gain +10 to +30 ELO, rank up from Gladiator to Elite Champion.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentScreen(isLoggedIn ? 'DASHBOARD' : 'LOGIN')}
          className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold border border-slate-700 flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
        >
          <span>Enter Battle Arena</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
