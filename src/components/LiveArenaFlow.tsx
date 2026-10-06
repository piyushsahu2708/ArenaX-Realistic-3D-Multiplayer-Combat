import React, { useState, useEffect } from 'react';
import { useArena } from '../context/ArenaContext';
import { getFullEloDetails } from '../utils/eloCalculator';
import {
  Play,
  RotateCcw,
  Zap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trophy,
  Swords,
  Timer,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Flame
} from 'lucide-react';

export const LiveArenaFlow: React.FC = () => {
  const {
    players,
    activePlayer,
    gameSessions,
    completeMatchSession,
    createGameSessionManual,
  } = useArena();

  // Selected battle participants
  const [playerAId, setPlayerAId] = useState<number>(activePlayer.id);
  const [playerBId, setPlayerBId] = useState<number>(players[1]?.id || 2);

  // Active simulated session
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [battleState, setBattleState] = useState<'IDLE' | 'MATCHING' | 'BATTLING' | 'TRANSACTION' | 'RESULT'>('IDLE');

  // Combat telemetry
  const [hpA, setHpA] = useState<number>(100);
  const [hpB, setHpB] = useState<number>(100);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [killsA, setKillsA] = useState<number>(3);
  const [killsB, setKillsB] = useState<number>(1);
  const [selectedWinnerId, setSelectedWinnerId] = useState<number | null>(null);
  const [simulateCrash, setSimulateCrash] = useState<boolean>(false);
  const [transactionStep, setTransactionStep] = useState<number>(0);
  const [resultSummary, setResultSummary] = useState<{
    eloDeltaA: number;
    eloDeltaB: number;
    unlocked: string[];
    error?: string;
  } | null>(null);

  const playerA = players.find((p) => p.id === playerAId) || players[0];
  const playerB = players.find((p) => p.id === playerBId) || players[1];

  const eloMath = getFullEloDetails(playerA.elo_rating, playerB.elo_rating, 32);

  // Reset participant selection when active player changes
  useEffect(() => {
    setPlayerAId(activePlayer.id);
    if (activePlayer.id === playerBId) {
      const alt = players.find((p) => p.id !== activePlayer.id);
      if (alt) setPlayerBId(alt.id);
    }
  }, [activePlayer.id]);

  // Start matchmaking & session creation
  const handleStartMatchmaking = () => {
    setBattleState('MATCHING');
    setCombatLog([
      `[AUTH] JWT Token verified for user: ${playerA.username} (ID: ${playerA.id})`,
      `[QUEUE] Enqueued in 1v1 Ranked pool. ELO: ${playerA.elo_rating}`,
      `[MATCHER] Scanning active pool with dynamic window ±100 ELO...`,
    ]);

    setTimeout(() => {
      setCombatLog((prev) => [
        ...prev,
        `[MATCHER] Candidate found: ${playerB.username} (ELO: ${playerB.elo_rating}, Diff: ${Math.abs(playerA.elo_rating - playerB.elo_rating)} ELO).`,
        `[SQL] SELECT * FROM matchmaking_queue WHERE id IN (${playerA.id}, ${playerB.id}) FOR UPDATE;`,
        `[SESSION] Created GameSession. Map: Cyber_Colosseum_01. State: ACTIVE`,
      ]);

      const sess = createGameSessionManual(playerA.id, playerB.id);
      setCurrentSessionId(sess.id);
      setBattleState('BATTLING');
      setHpA(100);
      setHpB(100);
      runBattleRounds(sess.id);
    }, 1200);
  };

  // Simulate real-time combat rounds
  const runBattleRounds = (sessId: number) => {
    let currentHpA = 100;
    let currentHpB = 100;
    let round = 1;

    const roundInterval = setInterval(() => {
      if (round > 4) {
        clearInterval(roundInterval);
        // Determine natural winner based on HP or default to A
        const winId = currentHpA >= currentHpB ? playerA.id : playerB.id;
        setSelectedWinnerId(winId);
        setBattleState('TRANSACTION');
        executeAtomicTransaction(sessId, winId);
        return;
      }

      const dmgA = Math.floor(Math.random() * 22) + 12;
      const dmgB = Math.floor(Math.random() * 25) + 10;
      currentHpA = Math.max(10, currentHpA - dmgB);
      currentHpB = Math.max(5, currentHpB - dmgA);

      setHpA(currentHpA);
      setHpB(currentHpB);

      const combatEvents = [
        `Round ${round}: ${playerA.username} struck ${playerB.username} with Plasma Blade (-${dmgA} HP)`,
        `Round ${round}: ${playerB.username} retaliated with Railgun shot (-${dmgB} HP)`,
      ];
      setCombatLog((prev) => [...prev, ...combatEvents]);
      round++;
    }, 700);
  };

  // Execute ACID Transaction with step-by-step UI progression
  const executeAtomicTransaction = (sessId: number, winId: number) => {
    setTransactionStep(1);

    setTimeout(() => {
      setTransactionStep(2); // ELO calculation
      setTimeout(() => {
        setTransactionStep(3); // Update Player ELO
        setTimeout(() => {
          setTransactionStep(4); // Update PlayerStats
          setTimeout(() => {
            if (simulateCrash) {
              setTransactionStep(99); // Crash triggered!
              const res = completeMatchSession(sessId, winId, killsA, killsB, true);
              setResultSummary({
                eloDeltaA: 0,
                eloDeltaB: 0,
                unlocked: [],
                error: res.error,
              });
              setBattleState('RESULT');
            } else {
              setTransactionStep(5); // Commit
              const res = completeMatchSession(sessId, winId, killsA, killsB, false);
              setResultSummary({
                eloDeltaA: res.eloDeltaA || 0,
                eloDeltaB: res.eloDeltaB || 0,
                unlocked: res.unlockedAchievements || [],
              });
              setBattleState('RESULT');
            }
          }, 600);
        }, 500);
      }, 500);
    }, 500);
  };

  const handleReset = () => {
    setBattleState('IDLE');
    setHpA(100);
    setHpB(100);
    setCombatLog([]);
    setTransactionStep(0);
    setResultSummary(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0c1424] to-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>Full-Stack Lifecycle Simulation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              ArenaX Battle Engine & ACID Transaction Flow
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Experience the complete backend journey: JWT Auth &rarr; Queue Enqueue &rarr; Dynamic ELO Matching &rarr; Live Matchmaking &rarr; <strong className="text-slate-200">Atomic Database Transaction Commit</strong> &rarr; Real-Time Leaderboard and Rewards.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <span className="text-slate-400">Crash Test:</span>
            <button
              onClick={() => setSimulateCrash(!simulateCrash)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                simulateCrash
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-md shadow-rose-900/40'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {simulateCrash ? '💥 Crash Midway (Simulate Failure)' : '🛡️ Normal ACID Commit'}
            </button>
          </div>
        </div>

        {/* 10-Step Visual Flow Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 text-[11px] font-mono min-w-[760px]">
            {[
              { step: '1', title: 'Login & JWT', active: true },
              { step: '2', title: 'Player Profile', active: true },
              { step: '3', title: 'Match Queue', active: battleState !== 'IDLE' },
              { step: '4', title: 'ELO Matching', active: battleState !== 'IDLE' },
              { step: '5', title: 'Game Session', active: battleState === 'BATTLING' || battleState === 'TRANSACTION' || battleState === 'RESULT' },
              { step: '6', title: 'Match Result', active: battleState === 'TRANSACTION' || battleState === 'RESULT' },
              { step: '7', title: 'ACID Commit', active: battleState === 'TRANSACTION' || battleState === 'RESULT' },
              { step: '8', title: 'ELO Update', active: battleState === 'RESULT' },
              { step: '9', title: 'Leaderboard', active: battleState === 'RESULT' },
              { step: '10', title: 'Rewards/Achv', active: battleState === 'RESULT' },
            ].map((s, idx) => (
              <React.Fragment key={s.step}>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-all ${
                    s.active
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] opacity-70">#{s.step}</span>
                  <span>{s.title}</span>
                </div>
                {idx < 9 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Simulation Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Combatants & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fighter Selection Cards */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-400" />
                <span>Battle Arena Participants</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">1v1 Ranked Protocol</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Player A Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-800/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-cyan-950/80 text-cyan-400 border-b border-l border-cyan-800/40 px-2 py-0.5 text-[10px] font-mono">
                  GLADIATOR A
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={playerA.avatar}
                    alt={playerA.username}
                    className="w-12 h-12 rounded-lg object-cover border border-cyan-500/40"
                  />
                  <div>
                    <div className="font-bold text-slate-100">{playerA.username}</div>
                    <div className="text-xs text-cyan-400 font-mono font-semibold">
                      {playerA.elo_rating} ELO <span className="text-slate-500 font-normal">· Lv.{playerA.level}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Expected Win:</span>
                    <span className="text-slate-200 font-semibold">{(eloMath.expectedScoreA * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gain on Win:</span>
                    <span className="text-emerald-400 font-semibold">+{eloMath.deltaAIfWin} ELO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loss on Defeat:</span>
                    <span className="text-rose-400 font-semibold">{eloMath.deltaAIfLoss} ELO</span>
                  </div>
                </div>

                {/* HP bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Combat Health</span>
                    <span className="text-cyan-400 font-bold">{hpA}/100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${hpA}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Player B Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-900 text-slate-400 border-b border-l border-slate-800 px-2 py-0.5 text-[10px] font-mono">
                  GLADIATOR B
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-slate-400 font-mono">Select Opponent:</label>
                  <select
                    disabled={battleState !== 'IDLE'}
                    value={playerBId}
                    onChange={(e) => setPlayerBId(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:border-cyan-500"
                  >
                    {players
                      .filter((p) => p.id !== playerAId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.username} ({p.elo_rating} ELO)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={playerB.avatar}
                    alt={playerB.username}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-slate-100">{playerB.username}</div>
                    <div className="text-xs text-amber-400 font-mono font-semibold">
                      {playerB.elo_rating} ELO <span className="text-slate-500 font-normal">· Lv.{playerB.level}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Expected Win:</span>
                    <span className="text-slate-200 font-semibold">{(eloMath.expectedScoreB * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gain on Win:</span>
                    <span className="text-emerald-400 font-semibold">+{eloMath.deltaBIfWin} ELO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loss on Defeat:</span>
                    <span className="text-rose-400 font-semibold">{eloMath.deltaBIfLoss} ELO</span>
                  </div>
                </div>

                {/* HP bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Combat Health</span>
                    <span className="text-amber-400 font-bold">{hpB}/100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${hpB}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Delta Window: ±{Math.abs(playerA.elo_rating - playerB.elo_rating)} ELO difference</span>
              </div>

              <div className="flex items-center gap-2">
                {battleState === 'IDLE' ? (
                  <button
                    onClick={handleStartMatchmaking}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/30"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Initiate Matchmaking & Battle</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Simulation</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Combat & Telemetry Console */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Backend Telemetry & Live Game Events</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Status: <strong className="text-cyan-400">{battleState}</strong>
              </span>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 h-44 overflow-y-auto space-y-1 font-mono text-xs">
              {combatLog.length === 0 ? (
                <div className="text-slate-600 text-center py-12">
                  Ready. Click &quot;Initiate Matchmaking & Battle&quot; to trace the API & transaction flow.
                </div>
              ) : (
                combatLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span className={log.includes('[SQL]') ? 'text-amber-300' : log.includes('Round') ? 'text-cyan-300' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: ACID Transaction Pipeline Inspector & Results (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Atomic Transaction Pipeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>ACID Atomic Transaction Inspector</span>
              </h3>
              <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded">
                InnoDB
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              When a match finishes, DRF executes <code className="text-purple-300 font-mono">with transaction.atomic():</code>. All table updates must succeed together; otherwise, rollback prevents corrupted ELO states.
            </p>

            {/* Stepper */}
            <div className="space-y-3 font-mono text-xs">
              {[
                { step: 1, title: 'BEGIN TRANSACTION;', desc: 'Acquire write locks on session & participant rows' },
                { step: 2, title: 'Calculate Server ELO', desc: 'Compute Expected Score & Delta using K=32 formula' },
                { step: 3, title: 'UPDATE players (ELO)', desc: `Update ratings for ID:${playerA.id} & ID:${playerB.id}` },
                { step: 4, title: 'UPDATE player_stats', desc: 'Increment matches_played, wins, losses, kills, deaths' },
                { step: 5, title: 'COMMIT TRANSACTION;', desc: 'Persist changes permanently to disk' },
              ].map((s) => {
                const isPassed = transactionStep >= s.step;
                const isCurrent = transactionStep === s.step;
                const isCrashed = transactionStep === 99 && s.step >= 3;

                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-lg border transition-all ${
                      isCrashed
                        ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                        : isPassed
                        ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        {isCrashed ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        ) : isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px]">
                            {s.step}
                          </span>
                        )}
                        <span className={isPassed ? 'text-cyan-300' : ''}>{s.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Step {s.step}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 pl-5.5">{s.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Crash Warning or Success result */}
            {resultSummary?.error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-700/60 text-xs font-mono text-rose-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>TRANSACTION ROLLBACK TRIGGERED</span>
                </div>
                <p>{resultSummary.error}</p>
              </div>
            )}

            {resultSummary && !resultSummary.error && (
              <div className="mt-4 p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-700/60 text-xs font-mono text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>TRANSACTION COMMITTED (200 OK)</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 mt-2">
                  <div>• {playerA.username}: {resultSummary.eloDeltaA >= 0 ? '+' : ''}{resultSummary.eloDeltaA} ELO</div>
                  <div>• {playerB.username}: {resultSummary.eloDeltaB >= 0 ? '+' : ''}{resultSummary.eloDeltaB} ELO</div>
                  {resultSummary.unlocked.length > 0 && (
                    <div className="text-amber-300 font-semibold pt-1">
                      🏆 Unlocked: {resultSummary.unlocked.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Mini Leaderboard */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Live Leaderboard (Indexed: idx_elo_desc)</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">ORDER BY elo_rating DESC</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {[...players]
                .sort((a, b) => b.elo_rating - a.elo_rating)
                .slice(0, 5)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      p.id === activePlayer.id
                        ? 'bg-cyan-950/30 border-cyan-700/60 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-4 text-center font-bold text-xs ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {idx + 1}
                      </span>
                      <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-semibold">{p.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">{p.stats.wins}W / {p.stats.losses}L</span>
                      <span className="font-bold text-cyan-400">{p.elo_rating}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
