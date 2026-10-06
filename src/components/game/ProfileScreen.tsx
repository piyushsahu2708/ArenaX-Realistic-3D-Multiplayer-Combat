import React, { useState } from 'react';
import { useArena } from '../../context/ArenaContext';
import { HEROES } from '../../data/heroesData';
import { HeroRosterModal } from './HeroRosterModal';
import { User, Shield, Trophy, Swords, Calendar, Award, Package, Target, Sparkles } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { activePlayer, selectedHeroId, startMatchmaking } = useArena();
  const [showHeroModal, setShowHeroModal] = useState<boolean>(false);

  const activeHero = HEROES[selectedHeroId || 'BLAZE'] || HEROES.BLAZE;

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-mono">
      {/* Profile Header Box */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Animated Profile Avatar Ring */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-cyan-400 p-0.5 shadow-xl shadow-cyan-950/60 relative">
                <img
                  src={activePlayer.avatar}
                  alt={activePlayer.username}
                  className="w-full h-full rounded-xl object-cover transition-transform group-hover:scale-105"
                />
              </div>
              {/* Rotating tactical border shimmer */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-transparent to-blue-500 -z-10 blur-xs opacity-75 animate-pulse" />
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                LVL {activePlayer.level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                  {activePlayer.username}
                </h1>
                <span className="text-xs text-cyan-400 font-bold bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-md">
                  PIYUSH#ARENA
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span className="text-amber-400 font-semibold">CLASS: TACTICAL WARRIOR</span>
                <span className="text-slate-600">·</span>
                <span>{activePlayer.email}</span>
              </div>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Special: Tactical Vision [Q]</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Competitive Rating</div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-400">⭐ {activePlayer.elo_rating}</div>
            <div className="text-xs text-amber-400 font-bold mt-0.5">{activePlayer.coins} Gold Coins</div>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center relative z-10">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 shadow-md">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">MATCHES</div>
            <div className="text-2xl font-black text-slate-100 mt-0.5">{activePlayer.stats.matches_played}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 shadow-md">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">WINS</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{activePlayer.stats.wins}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 shadow-md">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">LOSSES</div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{activePlayer.stats.losses}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 shadow-md">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">WIN RATE</div>
            <div className="text-2xl font-black text-cyan-300 mt-0.5">{activePlayer.stats.win_rate}%</div>
          </div>
        </div>

        {/* Secondary Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /> Total Kills
            </span>
            <span className="font-bold text-slate-100">{activePlayer.stats.kills} Kills</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" /> Member Since
            </span>
            <span className="font-bold text-slate-100">{activePlayer.created_at.slice(0, 4)}</span>
          </div>
        </div>

        {/* Equipment & Inventory */}
        <div className="space-y-3 pt-2">
          <div className="text-xs uppercase text-slate-300 font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Equipped Gear & Cosmetics:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {activePlayer.inventory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">{item.item_name}</div>
                  <div className="text-[10px] text-slate-500">{item.category}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.rarity === 'LEGENDARY'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : item.rarity === 'EPIC'
                      ? 'bg-purple-950 text-purple-400 border border-purple-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {item.rarity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Hero Section */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={activeHero.avatar}
              alt={activeHero.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-500 shadow-md"
            />
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Selected Hero:
              </div>
              <div className="font-extrabold text-slate-100 text-sm">{activeHero.name} ({activeHero.tagline})</div>
              <div className="text-[11px] text-amber-300">Special: {activeHero.specialName}</div>
            </div>
          </div>

          <button
            onClick={() => setShowHeroModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            [ Change Hero ]
          </button>
        </div>
      </div>

      {/* Hero Selection Modal */}
      <HeroRosterModal isOpen={showHeroModal} onClose={() => setShowHeroModal(false)} />
    </div>
  );
};
