import React from 'react';
import { useArena } from '../../context/ArenaContext';
import { Award, Trophy, Swords, Crown, Target, Lock, CheckCircle2 } from 'lucide-react';

export const AchievementsScreen: React.FC = () => {
  const { activePlayer } = useArena();

  const achievementsList = [
    {
      id: 1,
      name: 'FIRST BLOOD',
      description: 'Win your very first battle in the ArenaX battleground.',
      icon: Trophy,
      rewardCoins: 100,
      rewardXp: 250,
      unlocked: activePlayer.stats.wins >= 1,
      current: Math.min(1, activePlayer.stats.wins),
      target: 1,
      progressText: `${Math.min(1, activePlayer.stats.wins)} / 1 Win`,
    },
    {
      id: 2,
      name: 'WARRIOR',
      description: 'Achieve 10 registered competitive match wins.',
      icon: Swords,
      rewardCoins: 500,
      rewardXp: 1200,
      unlocked: activePlayer.stats.wins >= 10,
      current: Math.min(10, activePlayer.stats.wins),
      target: 10,
      progressText: `${Math.min(10, activePlayer.stats.wins)} / 10 Wins`,
    },
    {
      id: 3,
      name: 'CHAMPION',
      description: 'Cross the 1500 ELO rating threshold in ranked arena.',
      icon: Crown,
      rewardCoins: 1000,
      rewardXp: 3000,
      unlocked: activePlayer.elo_rating >= 1500,
      current: activePlayer.elo_rating,
      target: 1500,
      progressText: `${activePlayer.elo_rating} / 1500 ELO`,
    },
    {
      id: 4,
      name: 'VETERAN',
      description: 'Complete 50 competitive battle sessions.',
      icon: Target,
      rewardCoins: 1500,
      rewardXp: 5000,
      unlocked: activePlayer.stats.matches_played >= 50,
      current: Math.min(50, activePlayer.stats.matches_played),
      target: 50,
      progressText: `${Math.min(50, activePlayer.stats.matches_played)} / 50 Matches`,
    },
    {
      id: 5,
      name: 'UNSTOPPABLE',
      description: 'Maintain a 65%+ win rate across competitive play.',
      icon: Award,
      rewardCoins: 750,
      rewardXp: 2000,
      unlocked: activePlayer.stats.win_rate >= 65,
      current: activePlayer.stats.win_rate,
      target: 65,
      progressText: `${activePlayer.stats.win_rate}% / 65% Win Rate`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Combat Milestones</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">ACHIEVEMENTS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete tactical feats to unlock Gold Coins, bonus XP, and legendary badges.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Unlocked Milestones</div>
          <div className="text-2xl font-extrabold text-amber-400">
            {achievementsList.filter((a) => a.unlocked).length} / {achievementsList.length}
          </div>
        </div>
      </div>

      {/* Achievements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievementsList.map((ach) => {
          const Icon = ach.icon;
          const pct = Math.min(100, Math.round((ach.current / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-amber-500/50 shadow-md shadow-amber-950/20'
                  : 'bg-slate-950/70 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      ach.unlocked
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{ach.name}</h3>
                    <div className="text-[11px] text-amber-400 font-semibold">
                      +{ach.rewardCoins} Coins · +{ach.rewardXp} XP
                    </div>
                  </div>
                </div>

                {ach.unlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> UNLOCKED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{ach.description}</p>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold text-slate-300">{ach.progressText}</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${
                      ach.unlocked
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
