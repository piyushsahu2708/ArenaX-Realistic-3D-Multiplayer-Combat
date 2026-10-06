import React, { useState } from 'react';
import { useArena } from '../../context/ArenaContext';
import { HEROES } from '../../data/heroesData';
import { HeroRosterModal } from './HeroRosterModal';
import {
  Swords,
  Trophy,
  Coins,
  Shield,
  Zap,
  Gift,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Activity,
  History,
  Sparkles,
  Flame,
  Gamepad2,
  Crosshair
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    activePlayer,
    selectedHeroId,
    matchHistory,
    claimDailyReward,
    dailyRewardClaimed,
    startMatchmaking,
    setCurrentScreen,
  } = useArena();

  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [showHeroModal, setShowHeroModal] = useState<boolean>(false);

  const activeHero = HEROES[selectedHeroId || 'BLAZE'] || HEROES.BLAZE;

  // Experience math for Level progress bar
  const currentXp = activePlayer.experience;
  const currentLevel = activePlayer.level;
  const xpForNextLevel = currentLevel * 600;
  const xpInCurrentLevel = currentXp % 600;
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));

  const handleClaim = () => {
    const res = claimDailyReward();
    if (res.success) {
      setClaimToast(res.message);
      setTimeout(() => setClaimToast(null), 4000);
    }
  };

  const recentMatches = matchHistory.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {claimToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-200 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{claimToast}</span>
          </div>
          <button onClick={() => setClaimToast(null)} className="text-emerald-400 font-bold px-2">✕</button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d1526] to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activePlayer.avatar}
              alt={activePlayer.username}
              className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-500/50 shadow-md"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                Welcome, {activePlayer.username} 👋
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Gladiator Rank · Member Since {activePlayer.created_at.slice(0, 4)}
              </p>
            </div>
          </div>

          {/* Daily Reward Banner */}
          <div className="flex items-center gap-3 bg-slate-950/90 border border-slate-800 rounded-xl p-3">
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 font-mono">Daily Login Bonus</div>
              <div className="text-[11px] text-amber-400 font-mono">+100 Coins</div>
            </div>
            <button
              disabled={dailyRewardClaimed}
              onClick={handleClaim}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all uppercase cursor-pointer ${
                dailyRewardClaimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              {dailyRewardClaimed ? 'CLAIMED' : 'CLAIM'}
            </button>
          </div>
        </div>

        {/* Primary ELO, LEVEL, COINS Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80 font-mono">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">ELO RATING</div>
            <div className="text-xl sm:text-3xl font-extrabold text-cyan-400">{activePlayer.elo_rating}</div>
            <div className="text-[10px] text-slate-500 mt-1">Tier: Gladiator</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">LEVEL</div>
            <div className="text-xl sm:text-3xl font-extrabold text-slate-100">{activePlayer.level}</div>
            <div className="text-[10px] text-slate-500 mt-1">Rank Progression</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">COINS</div>
            <div className="text-xl sm:text-3xl font-extrabold text-amber-400">{activePlayer.coins}</div>
            <div className="text-[10px] text-slate-500 mt-1">Battle Gold</div>
          </div>
        </div>

        {/* Combat Performance Stats: WINS, LOSSES, WIN RATE */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-3 font-mono">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center">
            <div className="text-[10px] uppercase text-slate-500">WINS</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400">{activePlayer.stats.wins}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center">
            <div className="text-[10px] uppercase text-slate-500">LOSSES</div>
            <div className="text-lg sm:text-xl font-bold text-rose-400">{activePlayer.stats.losses}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center">
            <div className="text-[10px] uppercase text-slate-500">WIN RATE</div>
            <div className="text-lg sm:text-xl font-bold text-cyan-300">{activePlayer.stats.win_rate}%</div>
          </div>
        </div>

        {/* XP Progression Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1.5">
            <span className="font-bold text-slate-200">LEVEL {activePlayer.level} PROGRESS</span>
            <span className="text-cyan-400 font-semibold">{currentXp} / {currentXp + (xpForNextLevel - xpInCurrentLevel)} XP</span>
          </div>
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Selected Champion Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={activeHero.avatar}
              alt={activeHero.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 text-base">{activeHero.elementIcon}</span>
          </div>
          <div>
            <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Combat Hero</span>
            </div>
            <h3 className="text-lg font-black text-slate-100 leading-tight">
              {activeHero.name} <span className="text-xs font-normal text-slate-400">({activeHero.tagline})</span>
            </h3>
            <p className="text-xs text-amber-300 font-semibold mt-0.5">
              Special: {activeHero.specialName} · {activeHero.specialDesc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHeroModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
        >
          [ Change Hero ]
        </button>
      </div>

      {/* Main FIND MATCH Action Area */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 font-mono uppercase tracking-wider">
          Ready for Battle?
        </h2>
        <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
          Enter the matchmaking pool. Server will pair you against an opponent with comparable rating (±100 ELO).
        </p>

        {/* Multi-Tab notice pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>BroadcastChannel Multi-Tab Live Sync Active · Open 2 windows to test 1v1</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Main 1v1 Ranked Matchmaking */}
          <button
            onClick={() => startMatchmaking()}
            className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-base font-mono uppercase tracking-wider flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-cyan-500/25 cursor-pointer"
          >
            <Swords className="w-5 h-5 fill-current" />
            <span>⚔ FIND MATCH (1v1)</span>
          </button>

          {/* 3D Combat Arena Mode Button */}
          <button
            onClick={() => setCurrentScreen('BATTLE_3D')}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm font-mono uppercase tracking-wider flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>🎮 ENTER 3D ARENA (EXPLORE MAP & COMBAT)</span>
          </button>

          {/* 2-Player Pass-and-Play */}
          <button
            onClick={() => startMatchmaking(undefined, true)}
            className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            title="Play 2 players locally on the same screen"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>2-Player Local Dual</span>
          </button>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-mono">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Recent Matches
            </h3>
          </div>

          <button
            onClick={() => setCurrentScreen('MATCH_HISTORY')}
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {recentMatches.map((m) => {
            const isWin = m.result === 'WIN';
            return (
              <div
                key={m.id}
                onClick={() => setCurrentScreen('MATCH_HISTORY')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      isWin
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {isWin ? 'WIN' : 'LOSS'}
                  </span>
                  <span className="text-slate-200 font-semibold">vs {m.opponent_username}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${
                      m.elo_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {m.elo_delta >= 0 ? `+${m.elo_delta}` : m.elo_delta} ELO
                  </span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">
                    {new Date(m.played_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Selection Modal */}
      <HeroRosterModal isOpen={showHeroModal} onClose={() => setShowHeroModal(false)} />
    </div>
  );
};
