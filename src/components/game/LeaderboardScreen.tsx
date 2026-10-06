import React from 'react';
import { useArena } from '../../context/ArenaContext';
import { Trophy, Medal, Crown, TrendingUp, Users, Swords } from 'lucide-react';

export const LeaderboardScreen: React.FC = () => {
  const { players, activePlayer, startMatchmaking } = useArena();

  // Sort descending by ELO
  const sortedPlayers = [...players].sort((a, b) => b.elo_rating - a.elo_rating);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Ranked Competitive Ladder</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            🏆 GLOBAL LEADERBOARD
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rankings calculated dynamically from server-authoritative ELO database index.
          </p>
        </div>

        <button
          onClick={() => startMatchmaking()}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Swords className="w-4 h-4" />
          <span>Fight to Climb</span>
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden font-mono shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Gladiator</th>
                <th className="py-3 px-4 text-center">Level</th>
                <th className="py-3 px-4 text-right">ELO Rating</th>
                <th className="py-3 px-4 text-center">Win Rate</th>
                <th className="py-3 px-4 text-right">W / L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedPlayers.map((p, idx) => {
                const rank = idx + 1;
                const isMe = p.id === activePlayer.id;

                let rankBadge = <span className="text-slate-500 font-bold">{rank}</span>;
                if (rank === 1) rankBadge = <span className="text-amber-400 font-bold flex items-center gap-1">🥇 1</span>;
                if (rank === 2) rankBadge = <span className="text-slate-300 font-bold flex items-center gap-1">🥈 2</span>;
                if (rank === 3) rankBadge = <span className="text-amber-600 font-bold flex items-center gap-1">🥉 3</span>;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isMe ? 'bg-cyan-950/30 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <td className="py-3 px-4">{rankBadge}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.username}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <div className={`font-bold ${isMe ? 'text-cyan-300' : 'text-slate-100'}`}>
                            {p.username} {isMe && <span className="text-[10px] text-cyan-400 ml-1 font-normal">(YOU)</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 hidden sm:block">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300 font-semibold">
                      Lv.{p.level}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-cyan-400 text-sm">
                      {p.elo_rating}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-slate-200">{p.stats.win_rate}%</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      <span className="text-emerald-400">{p.stats.wins}W</span>
                      <span className="mx-1 text-slate-600">/</span>
                      <span className="text-rose-400">{p.stats.losses}L</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
