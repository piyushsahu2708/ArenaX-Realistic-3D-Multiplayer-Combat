import React from 'react';
import { useArena } from '../../context/ArenaContext';
import { HEROES } from '../../data/heroesData';
import { HeroId } from '../../types/arenax';
import { X, Check, Zap, Shield, Swords, Flame, Heart, Sparkles } from 'lucide-react';

interface HeroRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeroRosterModal: React.FC<HeroRosterModalProps> = ({ isOpen, onClose }) => {
  const { selectedHeroId, setSelectedHeroId } = useArena();

  if (!isOpen) return null;

  const heroList = Object.values(HEROES);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Champion Selection</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-0.5">
              CHOOSE YOUR HERO
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heroList.map((hero) => {
            const isSelected = selectedHeroId === hero.id;

            return (
              <div
                key={hero.id}
                onClick={() => setSelectedHeroId(hero.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-500 shadow-xl shadow-cyan-950/60 ring-2 ring-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                {/* Element Pill */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg">{hero.elementIcon}</span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-cyan-400" /> ACTIVE
                    </span>
                  )}
                </div>

                {/* Hero Avatar & Name */}
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-slate-700 shadow-md mb-2">
                    <img src={hero.avatar} alt={hero.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-extrabold text-slate-100 text-lg">{hero.name}</h3>
                  <p className="text-[10px] text-cyan-400 font-semibold">{hero.tagline}</p>
                </div>

                {/* Combat Stats */}
                <div className="space-y-1.5 text-[11px] text-slate-300 py-3 border-y border-slate-800/80 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Attack:</span>
                    <span className="font-bold text-slate-200">~{hero.baseAtk} DMG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Defense Guard:</span>
                    <span className="font-bold text-blue-400">+{hero.baseDefPercent}% Res</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Critical Chance:</span>
                    <span className="font-bold text-rose-400">{Math.round(hero.critChance * 100)}%</span>
                  </div>
                </div>

                {/* Special Ability Box */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] mb-3">
                  <div className="text-amber-400 font-bold flex items-center justify-between mb-0.5">
                    <span>⚡ {hero.specialName}</span>
                    <span className="text-[9px] text-slate-400">3 Energy</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-tight">{hero.specialDesc}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHeroId(hero.id);
                    onClose();
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? 'SELECTED' : 'SELECT HERO'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-slate-500">
          All heroes can perform Attack (+1 Energy), Defend (50% reduction), and Heal (+20 HP). Specials require 3 Energy.
        </div>
      </div>
    </div>
  );
};
