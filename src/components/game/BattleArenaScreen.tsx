import React, { useState } from 'react';
import { useArena } from '../../context/ArenaContext';
import { getRankInfo } from '../../data/heroesData';
import {
  Swords,
  Shield,
  Heart,
  Timer,
  Trophy,
  Skull,
  Zap,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Activity,
  CheckCircle2,
  Lock,
  Gamepad2
} from 'lucide-react';

export const BattleArenaScreen: React.FC = () => {
  const {
    activeBattle,
    activePlayer,
    executeBattleAction,
    exitBattleToDashboard,
    startMatchmaking,
    setCurrentScreen,
  } = useArena();

  const [floatingCombatText, setFloatingCombatText] = useState<{
    id: string;
    text: string;
    color: string;
    target: 'A' | 'B';
    isCrit?: boolean;
  } | null>(null);

  if (!activeBattle) {
    return (
      <div className="text-center py-20 font-mono">
        <p className="text-slate-400">No active battle session found.</p>
        <button
          onClick={exitBattleToDashboard}
          className="mt-4 px-5 py-2.5 bg-slate-800 rounded-xl text-cyan-400 font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const {
    playerA,
    playerB,
    heroA,
    heroB,
    hpA,
    hpB,
    energyA,
    energyB,
    isDefendingA,
    isDefendingB,
    titanShieldTurnsA,
    titanShieldTurnsB,
    comboCountA,
    comboCountB,
    healsRemainingA,
    healsRemainingB,
    currentTurnPlayerId,
    turnTimeLeft,
    battleLogs,
    status,
    roundNumber,
    isTwoPlayerLocal,
    eloDeltaA,
    xpGain,
    coinsGain,
    damageDealtA,
    critsLandedA,
    defensesUsedA,
    specialsUsedA,
  } = activeBattle;

  const isPlayerATurn = currentTurnPlayerId === playerA.id;
  const isMyTurn = currentTurnPlayerId === activePlayer.id;
  const isPlayer2TurnInLocal = isTwoPlayerLocal && currentTurnPlayerId === playerB.id;
  const canPerformAction = isMyTurn || isPlayer2TurnInLocal;

  const currentActorHero = isPlayerATurn ? heroA : heroB;
  const currentActorEnergy = isPlayerATurn ? energyA : energyB;
  const currentActorHeals = isPlayerATurn ? healsRemainingA : healsRemainingB;

  const rankInfo = getRankInfo(activePlayer.elo_rating + (eloDeltaA || 0));

  const isGameOver = status === 'VICTORY' || status === 'DEFEAT';
  const isMyVictory = activeBattle.winnerId === activePlayer.id;
  const myEloDelta = activePlayer.id === playerA.id ? (eloDeltaA || 0) : -(eloDeltaA || 0);
  const myXpGain = isMyVictory ? (xpGain || 100) : 25;
  const myCoinsGain = isMyVictory ? (coinsGain || 50) : 0;

  const getHpColor = (hp: number) => {
    if (hp > 50) return 'from-emerald-500 to-green-600';
    if (hp > 25) return 'from-amber-500 to-yellow-600';
    return 'from-rose-500 to-red-600';
  };

  const handleAction = (action: 'ATTACK' | 'DEFEND' | 'HEAL' | 'SPECIAL') => {
    if (!canPerformAction || status !== 'ACTIVE') return;

    if (action === 'ATTACK') {
      const isTargetB = currentTurnPlayerId === playerA.id;
      const willCrit = Math.random() < currentActorHero.critChance;
      setFloatingCombatText({
        id: 'combat-' + Date.now(),
        text: willCrit ? '💥 CRITICAL HIT!' : isTargetB && isDefendingB ? '🛡️ -10 BLOCKED' : '-24 DMG',
        color: willCrit ? 'text-amber-300' : 'text-rose-400',
        target: isTargetB ? 'B' : 'A',
        isCrit: willCrit,
      });
    } else if (action === 'SPECIAL') {
      const isTargetB = currentTurnPlayerId === playerA.id;
      setFloatingCombatText({
        id: 'combat-' + Date.now(),
        text: `⚡ ${currentActorHero.specialName.toUpperCase()}!`,
        color: 'text-amber-400 font-extrabold',
        target: isTargetB ? 'B' : 'A',
      });
    } else if (action === 'DEFEND') {
      const isActorA = currentTurnPlayerId === playerA.id;
      setFloatingCombatText({
        id: 'combat-' + Date.now(),
        text: '🛡️ GUARD UP',
        color: 'text-blue-400',
        target: isActorA ? 'A' : 'B',
      });
    } else if (action === 'HEAL') {
      const isActorA = currentTurnPlayerId === playerA.id;
      setFloatingCombatText({
        id: 'combat-' + Date.now(),
        text: '💚 +20 HP',
        color: 'text-emerald-400',
        target: isActorA ? 'A' : 'B',
      });
    }

    setTimeout(() => setFloatingCombatText(null), 1400);
    executeBattleAction(action);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Arena Box */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Arena Header & Round Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-slate-100 tracking-wider">
              ⚔️ ARENA<span className="text-cyan-400">X</span>
            </span>
            <span className="text-slate-600" aria-hidden="true">/</span>
            <span className="text-xs text-slate-300 font-semibold">ROUND {roundNumber}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
              {activeBattle.mode}
            </span>
          </div>

          {/* Turn Timer Badge & 3D Switch */}
          <div className="flex items-center gap-2">
            {status === 'ACTIVE' && (
              <span
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                  turnTimeLeft <= 5
                    ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>TIME LEFT: {turnTimeLeft}s</span>
              </span>
            )}

            <button
              onClick={() => setCurrentScreen('BATTLE_3D')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Switch to 3D Realtime Combat Arena"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch to 3D View</span>
            </button>
          </div>
        </div>

        {/* Both Gladiators Combat Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 font-mono">
          {/* Gladiator A (You) */}
          <div
            className={`p-5 rounded-2xl bg-slate-950 border relative transition-all ${
              currentTurnPlayerId === playerA.id && status === 'ACTIVE'
                ? 'border-cyan-500 shadow-xl shadow-cyan-950/60 ring-1 ring-cyan-500/50'
                : 'border-slate-800'
            }`}
          >
            {/* Top Tag & Hero Emblems */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{heroA.elementIcon}</span>
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                  {heroA.name} ({playerA.username})
                </span>
              </div>

              {/* Combo & Defense Badges */}
              <div className="flex items-center gap-1.5">
                {comboCountA > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                    🔥 COMBO x{comboCountA} (+{Math.min(30, (comboCountA - 1) * 10)}%)
                  </span>
                )}
                {isDefendingA && (
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" /> -50% BLOCK
                  </span>
                )}
                {titanShieldTurnsA > 0 && (
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                    IRON WALL ({titanShieldTurnsA})
                  </span>
                )}
              </div>
            </div>

            {/* Avatar & Health Bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500 shrink-0 shadow-md">
                <img src={heroA.avatar} alt={heroA.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-100 text-base">{playerA.username}</span>
                  <span className="text-xs text-amber-400 font-bold">⭐ {playerA.elo_rating}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>HEALTH</span>
                  <span className={`font-bold ${hpA <= 25 ? 'text-rose-400' : 'text-slate-200'}`}>
                    ❤️ {hpA}/100
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                  <div
                    className={`h-full bg-gradient-to-r ${getHpColor(hpA)} transition-all duration-300`}
                    style={{ width: `${hpA}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Energy Pips & Heals Remaining */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy:
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((pip) => (
                    <span
                      key={pip}
                      className={`h-3 w-3 rounded-full border transition-all ${
                        energyA >= pip
                          ? 'bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/50'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    ></span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Heals Left: <strong className="text-emerald-400">{healsRemainingA}/2</strong>
              </div>
            </div>

            {/* Floating combat feedback */}
            {floatingCombatText?.target === 'A' && (
              <div
                className={`absolute top-2 right-4 text-sm font-black animate-bounce ${floatingCombatText.color}`}
              >
                {floatingCombatText.text}
              </div>
            )}
          </div>

          {/* Gladiator B (Opponent) */}
          <div
            className={`p-5 rounded-2xl bg-slate-950 border relative transition-all ${
              currentTurnPlayerId === playerB.id && status === 'ACTIVE'
                ? 'border-amber-500 shadow-xl shadow-amber-950/60 ring-1 ring-amber-500/50'
                : 'border-slate-800'
            }`}
          >
            {/* Top Tag & Hero Emblems */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{heroB.elementIcon}</span>
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  {heroB.name} ({playerB.username})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {comboCountB > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                    🔥 COMBO x{comboCountB}
                  </span>
                )}
                {isDefendingB && (
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" /> -50% BLOCK
                  </span>
                )}
                {titanShieldTurnsB > 0 && (
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                    IRON WALL ({titanShieldTurnsB})
                  </span>
                )}
              </div>
            </div>

            {/* Avatar & Health Bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500 shrink-0 shadow-md">
                <img src={heroB.avatar} alt={heroB.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-100 text-base">{playerB.username}</span>
                  <span className="text-xs text-amber-400 font-bold">⭐ {playerB.elo_rating}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>HEALTH</span>
                  <span className={`font-bold ${hpB <= 25 ? 'text-rose-400' : 'text-slate-200'}`}>
                    ❤️ {hpB}/100
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                  <div
                    className={`h-full bg-gradient-to-r ${getHpColor(hpB)} transition-all duration-300`}
                    style={{ width: `${hpB}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Energy Pips & Heals Remaining */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy:
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((pip) => (
                    <span
                      key={pip}
                      className={`h-3 w-3 rounded-full border transition-all ${
                        energyB >= pip
                          ? 'bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/50'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    ></span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Heals Left: <strong className="text-emerald-400">{healsRemainingB}/2</strong>
              </div>
            </div>

            {/* Floating combat feedback */}
            {floatingCombatText?.target === 'B' && (
              <div
                className={`absolute top-2 right-4 text-sm font-black animate-bounce ${floatingCombatText.color}`}
              >
                {floatingCombatText.text}
              </div>
            )}
          </div>
        </div>

        {/* 4 Action Buttons & Tactical Command Box */}
        {status === 'ACTIVE' && (
          <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 text-center space-y-4 font-mono">
            {/* Turn Banner */}
            <div className="text-sm font-bold flex items-center justify-center gap-2">
              {isMyTurn ? (
                <span className="text-emerald-400 flex items-center gap-2 animate-pulse">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  <span>🟢 YOUR TURN — Choose your tactical action:</span>
                </span>
              ) : isPlayer2TurnInLocal ? (
                <span className="text-purple-400 flex items-center gap-2 animate-pulse">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400"></span>
                  <span>🟣 PLAYER 2 ({playerB.username}) TURN — Choose tactical action:</span>
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span>🟡 OPPONENT&apos;S TURN — Waiting for {playerB.username}...</span>
                </span>
              )}
            </div>

            {/* 4 Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* 1. HIT / ATTACK (+1 Energy) */}
              <button
                disabled={!canPerformAction}
                onClick={() => handleAction('ATTACK')}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 disabled:opacity-40 text-left transition-all cursor-pointer disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-black text-slate-100 group-hover:text-cyan-300">
                    ⚔️ HIT
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                    +1 ⚡
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  ~20-25 DMG · Builds combo streak
                </div>
              </button>

              {/* 2. SPECIAL (-3 Energy) */}
              <button
                disabled={!canPerformAction || currentActorEnergy < 3}
                onClick={() => handleAction('SPECIAL')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer disabled:cursor-not-allowed group ${
                  currentActorEnergy >= 3
                    ? 'bg-amber-950/40 border-amber-500 hover:bg-amber-900/40 shadow-lg shadow-amber-950/50'
                    : 'bg-slate-900 border-slate-800 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-black text-amber-300 truncate">
                    🔥 {currentActorHero.specialName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                    -3 ⚡
                  </span>
                </div>
                <div className="text-[11px] text-amber-200/70 leading-tight truncate">
                  {currentActorHero.specialDesc}
                </div>
              </button>

              {/* 3. BLOCK / DEFEND (50% reduction) */}
              <button
                disabled={!canPerformAction}
                onClick={() => handleAction('DEFEND')}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 disabled:opacity-40 text-left transition-all cursor-pointer disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-black text-slate-100 group-hover:text-blue-300">
                    🛡️ BLOCK
                  </span>
                  <span className="text-[10px] text-blue-400 font-bold">50% RES</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Absorbs 50% DMG & breaks enemy combo
                </div>
              </button>

              {/* 4. HEAL (+20 HP) */}
              <button
                disabled={!canPerformAction || currentActorHeals <= 0}
                onClick={() => handleAction('HEAL')}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 disabled:opacity-40 text-left transition-all cursor-pointer disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-black text-slate-100 group-hover:text-rose-300">
                    💚 HEAL
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {currentActorHeals}/2
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Restores +20 HP (Max 2 heals/match)
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Post-Match Screen: VICTORY (Section 16 PRD) */}
        {isGameOver && isMyVictory && (
          <div className="p-8 rounded-3xl bg-slate-950 border-2 border-emerald-500 shadow-2xl text-center space-y-6 font-mono animate-in zoom-in-95 my-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/60">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-4xl font-black text-emerald-400 tracking-wider">
                🏆 VICTORY
              </h2>
              <p className="text-slate-300 font-bold text-sm">
                {activePlayer.username} emerged victorious in the arena!
              </p>
            </div>

            {/* Core Gains Ribbon */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-4 rounded-2xl bg-slate-900 border border-emerald-900/60">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">ELO GAIN</div>
                <div className="text-2xl font-black text-emerald-400">+{Math.abs(myEloDelta || 18)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">XP GAIN</div>
                <div className="text-2xl font-black text-cyan-400">+{myXpGain}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">BATTLE GOLD</div>
                <div className="text-2xl font-black text-amber-400">+{myCoinsGain}</div>
              </div>
            </div>

            {/* Streak & MVP Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-orange-950/80 border border-orange-700/80 text-orange-300 font-extrabold text-xs flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>🔥 {activePlayer.winStreak} WIN STREAK</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-700/80 text-amber-300 font-extrabold text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>⭐ MVP PERFORMANCE</span>
              </div>
            </div>

            {/* MVP Performance Telemetry */}
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex justify-around">
              <div>Damage: <strong className="text-slate-100">{damageDealtA}</strong></div>
              <div>Criticals: <strong className="text-amber-400">{critsLandedA}</strong></div>
              <div>Defense Blocks: <strong className="text-blue-400">{defensesUsedA}</strong></div>
            </div>

            {/* Next Rank Motivation Banner */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 max-w-md mx-auto">
              Your next rank: <strong className="text-slate-100">{rankInfo.nextTierName}</strong> — {rankInfo.eloToNextTier} ELO away
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startMatchmaking()}
                className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl shadow-cyan-500/25 cursor-pointer"
              >
                [ ⚔ PLAY AGAIN ]
              </button>

              <button
                onClick={exitBattleToDashboard}
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                [ DASHBOARD ]
              </button>
            </div>
          </div>
        )}

        {/* Post-Match Screen: DEFEAT */}
        {isGameOver && !isMyVictory && (
          <div className="p-8 rounded-3xl bg-slate-950 border-2 border-rose-500 shadow-2xl text-center space-y-6 font-mono animate-in zoom-in-95 my-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-500 mx-auto flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/60">
              <Skull className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-4xl font-black text-rose-400 tracking-wider">
                💀 DEFEAT
              </h2>
              <p className="text-slate-300 font-bold text-sm">
                Opponent claimed victory this round
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto p-4 rounded-2xl bg-slate-900 border border-rose-900/60">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">RATING ADJUSTMENT</div>
                <div className="text-2xl font-black text-rose-400">-{Math.abs(myEloDelta || 16)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">CONSOLATION XP</div>
                <div className="text-2xl font-black text-cyan-400">+{myXpGain}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 max-w-xs mx-auto">
              Win streak reset. Re-arm and climb back into the arena!
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startMatchmaking()}
                className="px-8 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl shadow-rose-500/25 cursor-pointer"
              >
                [ ⚔ PLAY AGAIN ]
              </button>

              <button
                onClick={exitBattleToDashboard}
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                [ DASHBOARD ]
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Battle Log */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-slate-200 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Battle Events Log:</span>
            </span>
            <span>Server-Authoritative Anti-Cheat Stream</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 h-44 overflow-y-auto space-y-1.5 font-mono text-xs">
            {battleLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-600 text-[10px] select-none">{log.timestamp}</span>
                <span
                  className={
                    log.action === 'SPECIAL'
                      ? 'text-amber-300 font-bold'
                      : log.isCritical
                      ? 'text-rose-400 font-bold'
                      : log.action === 'ATTACK'
                      ? 'text-cyan-300'
                      : log.action === 'DEFEND'
                      ? 'text-blue-300'
                      : log.action === 'HEAL'
                      ? 'text-emerald-300'
                      : 'text-slate-200 font-semibold'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
