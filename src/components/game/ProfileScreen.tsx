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
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <img
              src={activePlayer.avatar}
              alt={activePlayer.username}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-lg"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                {activePlayer.username}
              </h1>
              <div className="text-xs text-slate-400 mt-0.5">{activePlayer.email}</div>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
                Level {activePlayer.level} Combatant
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400 uppercase">Competitive Rating</div>
            <div className="text-3xl font-extrabold text-cyan-400">⭐ {activePlayer.elo_rating}</div>
            <div className="text-[11px] text-amber-400 mt-0.5">{activePlayer.coins} Gold Coins</div>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Total Matches</div>
            <div className="text-xl font-bold text-slate-100">{activePlayer.stats.matches_played}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Match Wins</div>
            <div className="text-xl font-bold text-emerald-400">{activePlayer.stats.wins}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Losses</div>
            <div className="text-xl font-bold text-rose-400">{activePlayer.stats.losses}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Win Rate</div>
            <div className="text-xl font-bold text-cyan-300">{activePlayer.stats.win_rate}%</div>
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
