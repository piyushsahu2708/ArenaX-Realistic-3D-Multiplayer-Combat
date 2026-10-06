import React from 'react';
import { useArena } from '../../context/ArenaContext';
import { CinematicLanding3D } from './CinematicLanding3D';
import { Swords, Shield, Heart, Trophy, Zap, ArrowRight } from 'lucide-react';

export const LandingScreen: React.FC = () => {
  const { setCurrentScreen, isLoggedIn } = useArena();

  return (
    <div className="space-y-12">
      {/* 1. Cinematic 3D Interactive Hero Experience */}
      <CinematicLanding3D
        onEnterGame={() => setCurrentScreen('BATTLE_3D')}
        onExplore3D={() => setCurrentScreen('BATTLE_3D')}
      />

      {/* 2. Tactical Arena Mechanics Overview */}
      <div className="max-w-5xl mx-auto space-y-12 px-2">
        {/* 3 Core Combat Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-cyan-500/40 transition-colors shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-mono mb-1">⚔️ Strategic Attack</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Deal 18-24 precision damage. Timed strikes overcome enemy guard and deplete opponent HP to claim competitive dominance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-blue-500/40 transition-colors shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-mono mb-1">🛡️ Tactical Defend</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Raise kinetic energy shields to absorb 50% of incoming damage on the following turn. Perfect for turning the tide against aggressive rivals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-rose-500/40 transition-colors shadow-xl">
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
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400 shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 font-mono text-sm sm:text-base">
                Mathematically Fair ELO Matchmaking
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Dynamic window matchmaking pairs you against balanced opponents (±100 to ±300 ELO). Win to gain +10 to +30 ELO, rank up from Gladiator to Elite Champion.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen(isLoggedIn ? 'DASHBOARD' : 'LOGIN')}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider border border-cyan-400 flex items-center gap-2 shrink-0 transition-transform hover:scale-105 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <span>Enter Battle Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

