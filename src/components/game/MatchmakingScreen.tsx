import React, { useState, useEffect } from 'react';
import { useArena } from '../../context/ArenaContext';
import { Swords, RotateCcw, Play, Shield, Users, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export const MatchmakingScreen: React.FC = () => {
  const {
    activePlayer,
    searchingOpponent,
    foundOpponent,
    matchSearchEloMin,
    matchSearchEloMax,
    cancelMatchmaking,
    acceptMatchAndEnterArena,
  } = useArena();

  const [searchSeconds, setSearchSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (searchingOpponent) {
      interval = setInterval(() => {
        setSearchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchSeconds(0);
    }
    return () => clearInterval(interval);
  }, [searchingOpponent]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Searching Phase */}
        {searchingOpponent && (
          <div className="space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border-2 border-cyan-500/60 mx-auto flex items-center justify-center text-cyan-400 relative">
              <Swords className="w-10 h-10 animate-bounce" />
              <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 animate-ping opacity-25"></div>
            </div>

            <div className="space-y-2 font-mono">
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-wider">
                ⚔ FINDING OPPONENT
              </h2>
              <div className="text-cyan-400 font-bold text-sm">
                Your ELO: {activePlayer.elo_rating}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Searching for a player between <strong className="text-slate-200">{matchSearchEloMin} - {matchSearchEloMax} ELO</strong>...
              </p>
            </div>

            {/* Radar / pulse timer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-center gap-3 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>⏳ Searching queue... ({searchSeconds}s elapsed)</span>
            </div>

            <button
              onClick={cancelMatchmaking}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              [ CANCEL ]
            </button>
          </div>
        )}

        {/* Match Found Phase */}
        {!searchingOpponent && foundOpponent && (
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>MATCH FOUND!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              🎮 MATCH FOUND!
            </h2>

            {/* VS Card */}
            <div className="grid grid-cols-11 items-center gap-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono">
              {/* Player 1 */}
              <div className="col-span-5 text-center space-y-2">
                <img
                  src={activePlayer.avatar}
                  alt={activePlayer.username}
                  className="w-16 h-16 rounded-xl mx-auto object-cover border-2 border-cyan-500 shadow-md"
                />
                <div className="font-bold text-slate-100 text-sm truncate">{activePlayer.username}</div>
                <div className="text-xs font-bold text-cyan-400">{activePlayer.elo_rating} ELO</div>
                <div className="text-[10px] text-slate-500">Lv.{activePlayer.level}</div>
              </div>

              {/* VS separator */}
              <div className="col-span-1 text-center font-black text-amber-400 text-sm italic">
                VS
              </div>

              {/* Player 2 */}
              <div className="col-span-5 text-center space-y-2">
                <img
                  src={foundOpponent.avatar}
                  alt={foundOpponent.username}
                  className="w-16 h-16 rounded-xl mx-auto object-cover border-2 border-amber-500 shadow-md"
                />
                <div className="font-bold text-slate-100 text-sm truncate">{foundOpponent.username}</div>
                <div className="text-xs font-bold text-amber-400">{foundOpponent.elo_rating} ELO</div>
                <div className="text-[10px] text-slate-500">Lv.{foundOpponent.level}</div>
              </div>
            </div>

            {/* Enter Arena button */}
            <div className="pt-2">
              <button
                onClick={acceptMatchAndEnterArena}
                className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-base font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:scale-102 shadow-xl shadow-cyan-500/25 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>[ ENTER ARENA ]</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
