import React, { useState } from 'react';
import { useArena } from '../../context/ArenaContext';
import { History, Trophy, Skull, Clock, Eye, X, ArrowRight } from 'lucide-react';
import { MatchHistoryRecord } from '../../types/arenax';

export const MatchHistoryScreen: React.FC = () => {
  const { matchHistory, activePlayer } = useArena();
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryRecord | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Combat Archive</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">MATCH HISTORY</h1>
          <p className="text-xs text-slate-400 mt-1">
            Recorded competitive match outcomes and rating adjustments.
          </p>
        </div>
      </div>

      {/* Matches List */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px]">
                <th className="py-3 px-4">Opponent</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4 text-right">Rating Delta</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {matchHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No matches played yet. Enter the battle arena to record your first game!
                  </td>
                </tr>
              ) : (
                matchHistory.map((m) => {
                  const isWin = m.result === 'WIN';
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">vs {m.opponent_username}</div>
                        <div className="text-[10px] text-slate-500">Match #{m.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 ${
                            isWin
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {isWin ? <Trophy className="w-3 h-3 text-emerald-400" /> : <Skull className="w-3 h-3 text-rose-400" />}
                          <span>{isWin ? 'WIN' : 'LOSS'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold text-sm ${
                            m.elo_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {m.elo_delta >= 0 ? `+${m.elo_delta}` : m.elo_delta} ELO
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                        {new Date(m.played_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button className="text-cyan-400 hover:text-cyan-300 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Details Popup Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">
                Match Details #{selectedMatch.id}
              </h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Opponent:</span>
                <span className="font-bold text-slate-100">{selectedMatch.opponent_username}</span>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Result:</span>
                <span className={`font-bold ${selectedMatch.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedMatch.result === 'WIN' ? '🏆 Victory' : '💀 Defeat'}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-slate-200">02:31</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-1.5">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Your ELO Rating:</div>
                <div className="flex justify-between text-slate-300">
                  <span>Before Battle:</span>
                  <span className="font-bold">{selectedMatch.elo_before}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>After Battle:</span>
                  <span className="font-bold text-cyan-400">{selectedMatch.elo_after}</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                  <span>Total Adjustment:</span>
                  <span className={`font-extrabold ${selectedMatch.elo_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedMatch.elo_delta >= 0 ? `+${selectedMatch.elo_delta}` : selectedMatch.elo_delta} ELO
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMatch(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
