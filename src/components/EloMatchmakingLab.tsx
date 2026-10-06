import React, { useState, useEffect } from 'react';
import { useArena } from '../context/ArenaContext';
import { getFullEloDetails } from '../utils/eloCalculator';
import {
  Cpu,
  Clock,
  Users,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

export const EloMatchmakingLab: React.FC = () => {
  const {
    queue,
    activePlayer,
    enqueuePlayer,
    dequeuePlayer,
    populateRandomQueue,
    runMatchmaker,
    players,
  } = useArena();

  // ELO Formula Calculator state
  const [calcEloA, setCalcEloA] = useState<number>(1500);
  const [calcEloB, setCalcEloB] = useState<number>(1400);
  const [calcKFactor, setCalcKFactor] = useState<number>(32);
  const [matchOutcome, setMatchOutcome] = useState<'A_WINS' | 'B_WINS' | 'DRAW'>('A_WINS');

  // Race condition simulator state
  const [raceMode, setRaceMode] = useState<'UNLOCKED' | 'ROW_LOCK'>('ROW_LOCK');
  const [raceStep, setRaceStep] = useState<number>(0);
  const [raceLog, setRaceLog] = useState<string[]>([]);
  const [isSimulatingRace, setIsSimulatingRace] = useState<boolean>(false);

  const isPlayerInQueue = queue.some((q) => q.player_id === activePlayer.id);

  // ELO math details
  const eloMath = getFullEloDetails(calcEloA, calcEloB, calcKFactor);

  // Matchmaker tick status message
  const [matchStatusMsg, setMatchStatusMsg] = useState<string | null>(null);

  const handleManualRunMatchmaker = () => {
    const res = runMatchmaker();
    if (res.matched && res.session) {
      setMatchStatusMsg(`✅ MATCH FOUND! Created Session #${res.session.id}: ${res.session.player_a_username} vs ${res.session.player_b_username}`);
    } else {
      setMatchStatusMsg(`⏳ No eligible pair found within current dynamic ELO windows. Wait for window expansion or enqueue more players.`);
    }
    setTimeout(() => setMatchStatusMsg(null), 5000);
  };

  // Run Race Condition Demo
  const startRaceSimulation = (mode: 'UNLOCKED' | 'ROW_LOCK') => {
    setIsSimulatingRace(true);
    setRaceStep(1);
    setRaceLog([
      `[T=0ms] Worker Thread-1 (Matchmaker Alpha) wakes up to pair candidate.`,
      `[T=2ms] Worker Thread-2 (Matchmaker Beta) concurrently wakes up on second CPU core.`,
    ]);

    setTimeout(() => {
      setRaceStep(2);
      if (mode === 'UNLOCKED') {
        setRaceLog((prev) => [
          ...prev,
          `[T=15ms] Thread-1 executes: SELECT * FROM matchmaking_queue WHERE status = 'WAITING' LIMIT 1; -> Reads Player X (ID: 2)`,
          `[T=18ms] Thread-2 executes: SELECT * FROM matchmaking_queue WHERE status = 'WAITING' LIMIT 1; -> ALSO Reads Player X (ID: 2)! (DIRTY RACE CONDITION)`,
        ]);
      } else {
        setRaceLog((prev) => [
          ...prev,
          `[T=15ms] Thread-1 executes: SELECT * FROM matchmaking_queue WHERE status = 'WAITING' FOR UPDATE;`,
          `[T=16ms] MySQL InnoDB grants EXCLUSIVE ROW WRITE LOCK to Thread-1 on Player X (ID: 2).`,
          `[T=18ms] Thread-2 executes: SELECT ... FOR UPDATE; -> InnoDB detects lock. Thread-2 waits or skips locked row!`,
        ]);
      }

      setTimeout(() => {
        setRaceStep(3);
        if (mode === 'UNLOCKED') {
          setRaceLog((prev) => [
            ...prev,
            `[T=40ms] Thread-1 creates GameSession #801 with Player X.`,
            `[T=42ms] Thread-2 creates GameSession #802 with Player X!`,
            `[CRITICAL ERROR] ❌ RACE CONDITION OCCURRED! Player X is concurrently assigned to TWO simultaneous active matches!`,
          ]);
        } else {
          setRaceLog((prev) => [
            ...prev,
            `[T=35ms] Thread-1 pairs Player X into GameSession #801, updates status='MATCHED', and calls COMMIT.`,
            `[T=36ms] Lock released. Thread-2 now reads next available candidate Player Y (ID: 4) cleanly!`,
            `[SUCCESS] 🛡️ ZERO RACE CONDITIONS. Serialized execution guaranteed by select_for_update() + transaction.atomic().`,
          ]);
        }
        setIsSimulatingRace(false);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Algorithmic Core Deep-Dive</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              ELO Matchmaking Engine & Concurrency Lab
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect the live matchmaking queue, test dynamic window expansion (±100 &rarr; ±200 &rarr; ±300 ELO), verify step-by-step ELO math, and test how <code className="text-cyan-300 font-mono">select_for_update()</code> prevents worker race conditions.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Queue Pool:</span>
            <span className="px-2.5 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-md font-bold">
              {queue.filter((q) => q.status === 'WAITING').length} Waiting
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Live Dynamic Queue (Left 6) + ELO Math Calculator (Right 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Queue Manager (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono">
                  Live Matchmaking Pool & Dynamic Window
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                1-sec Tick Loop
              </span>
            </div>

            {/* Dynamic Window Explanation Box */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono space-y-1.5 text-slate-300 mb-4">
              <div className="text-cyan-400 font-semibold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Dynamic Window Expansion Rules:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">0s - 9s:</span>
                  <span className="text-emerald-400 font-bold">±100 ELO</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">10s - 19s:</span>
                  <span className="text-amber-400 font-bold">±200 ELO</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">20s+:</span>
                  <span className="text-rose-400 font-bold">±300 ELO</span>
                </div>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Player</th>
                    <th className="pb-2 text-right">Rating</th>
                    <th className="pb-2 text-center">Wait Time</th>
                    <th className="pb-2 text-right">Window</th>
                    <th className="pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Queue is currently empty. Click &quot;Enqueue Me&quot; or &quot;Populate Pool&quot; below.
                      </td>
                    </tr>
                  ) : (
                    queue.map((entry) => {
                      const isMe = entry.player_id === activePlayer.id;
                      return (
                        <tr
                          key={entry.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isMe ? 'bg-cyan-950/20' : ''
                          }`}
                        >
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <img src={entry.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                              <span className={`font-semibold ${isMe ? 'text-cyan-300' : 'text-slate-200'}`}>
                                {entry.username} {isMe && '(You)'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-bold text-cyan-400">
                            {entry.elo_rating}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="text-slate-400">{entry.seconds_in_queue}s</span>
                          </td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                entry.current_range === 100
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                  : entry.current_range === 200
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                  : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              }`}
                            >
                              ±{entry.current_range}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => dequeuePlayer(entry.player_id)}
                              className="text-[10px] text-slate-500 hover:text-rose-400 font-mono transition-colors"
                            >
                              Leave
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Queue Controls */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                {!isPlayerInQueue ? (
                  <button
                    onClick={() => enqueuePlayer(activePlayer.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase font-mono transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Join Queue ({activePlayer.username})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => dequeuePlayer(activePlayer.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-mono transition-all"
                  >
                    <span>Leave Queue</span>
                  </button>
                )}

                <button
                  onClick={populateRandomQueue}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  + Add 3 Players
                </button>
              </div>

              <button
                onClick={handleManualRunMatchmaker}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase font-mono transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Matchmaker Step</span>
              </button>
            </div>

            {/* Matchmaker status message */}
            {matchStatusMsg && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-cyan-800 text-xs font-mono text-cyan-200 animate-in fade-in">
                {matchStatusMsg}
              </div>
            )}
          </div>
        </div>

        {/* ELO Formula Math Inspector (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono">
                  ELO Formula & Probability Inspector
                </h2>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                Formula: 1 / (1 + 10^((Rb - Ra)/400))
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Player A Rating (Ra):</span>
                  <span className="text-cyan-400 font-bold">{calcEloA} ELO</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="2400"
                  step="10"
                  value={calcEloA}
                  onChange={(e) => setCalcEloA(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Player B Rating (Rb):</span>
                  <span className="text-amber-400 font-bold">{calcEloB} ELO</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="2400"
                  step="10"
                  value={calcEloB}
                  onChange={(e) => setCalcEloB(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">K-Factor Sensitivity:</span>
                <div className="flex gap-1.5">
                  {[16, 32, 40].map((k) => (
                    <button
                      key={k}
                      onClick={() => setCalcKFactor(k)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        calcKFactor === k
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      K={k}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mathematical Step Breakdown */}
            <div className="mt-5 p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 font-mono text-xs">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                Detailed Calculation Breakdown:
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Exponent ((Rb - Ra)/400):</span>
                  <span className="text-cyan-300 font-semibold">{eloMath.exponentA}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">10^(Exponent):</span>
                  <span className="text-cyan-300 font-semibold">{eloMath.tenPowExpA}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 flex justify-between items-center">
                <span>Player A Expected Win Chance:</span>
                <span className="font-bold text-sm">{(eloMath.expectedScoreA * 100).toFixed(1)}%</span>
              </div>

              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200 flex justify-between items-center">
                <span>Player B Expected Win Chance:</span>
                <span className="font-bold text-sm">{(eloMath.expectedScoreB * 100).toFixed(1)}%</span>
              </div>

              {/* Scenarios Table */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-slate-400 font-bold">Post-Match Rating Updates (K={calcKFactor}):</div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-300">If Player A Wins (Score=1):</span>
                  <span className="text-emerald-400 font-bold">
                    A: {calcEloA} &rarr; {eloMath.newRatingAIfWin} (+{eloMath.deltaAIfWin}) | B: {calcEloB} &rarr; {eloMath.newRatingBIfLoss} ({eloMath.deltaBIfLoss})
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-300">If Player B Wins (Score=0):</span>
                  <span className="text-rose-400 font-bold">
                    A: {calcEloA} &rarr; {eloMath.newRatingAIfLoss} ({eloMath.deltaAIfLoss}) | B: {calcEloB} &rarr; {eloMath.newRatingBIfWin} (+{eloMath.deltaBIfWin})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Section: Race Condition & Concurrency Simulator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono">
                Concurrency Lab: Matchmaking Race Condition & select_for_update()
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Test what happens when two distributed worker threads try to dequeue the same player at the exact same millisecond.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              disabled={isSimulatingRace}
              onClick={() => {
                setRaceMode('UNLOCKED');
                startRaceSimulation('UNLOCKED');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/70 border border-rose-800 hover:border-rose-600 text-rose-300 font-semibold transition-colors disabled:opacity-50"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Simulate Race Condition (No Lock)</span>
            </button>

            <button
              disabled={isSimulatingRace}
              onClick={() => {
                setRaceMode('ROW_LOCK');
                startRaceSimulation('ROW_LOCK');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 hover:border-emerald-600 text-emerald-300 font-semibold transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Simulate with select_for_update()</span>
            </button>
          </div>
        </div>

        {/* Visual Architecture Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Unlocked mode card */}
          <div className={`p-4 rounded-xl border ${raceMode === 'UNLOCKED' ? 'border-rose-500/80 bg-rose-950/20' : 'border-slate-800 bg-slate-950'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Unlock className="w-4 h-4" />
                <span>Vulnerable: Naive Non-Locking</span>
              </span>
              <span className="text-[10px] font-mono text-rose-400/80 bg-rose-950 px-2 py-0.5 rounded border border-rose-800/60">
                BUG: Dirty Concurrent Read
              </span>
            </div>
            <pre className="p-3 bg-slate-950/90 border border-slate-800 rounded text-slate-300 font-mono text-[11px] overflow-x-auto">
{`# ❌ DANGEROUS: Race condition under high load
candidate = MatchQueue.objects.filter(status='WAITING').first()
# Thread-1 and Thread-2 both read Candidate X simultaneously!
create_match(thread1_player, candidate.player)
create_match(thread2_player, candidate.player) # DUPLICATE!`}
            </pre>
          </div>

          {/* Row-locked mode card */}
          <div className={`p-4 rounded-xl border ${raceMode === 'ROW_LOCK' ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Protected: select_for_update() + Transaction</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                ACID Pessimistic Lock
              </span>
            </div>
            <pre className="p-3 bg-slate-950/90 border border-slate-800 rounded text-slate-300 font-mono text-[11px] overflow-x-auto">
{`# ✅ SAFE: InnoDB row-level lock blocks competing threads
with transaction.atomic():
    candidate = (
        MatchQueue.objects.select_for_update()
        .filter(status='WAITING').first()
    )
    candidate.status = 'MATCHED'
    candidate.save()`}
            </pre>
          </div>
        </div>

        {/* Live Race Simulator Console */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs min-h-[110px] flex flex-col justify-center">
          {raceLog.length === 0 ? (
            <div className="text-slate-500 text-center">
              Click &quot;Simulate Race Condition (No Lock)&quot; or &quot;Simulate with select_for_update()&quot; to test the concurrency thread trace.
            </div>
          ) : (
            <div className="space-y-1.5">
              {raceLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    log.includes('CRITICAL ERROR')
                      ? 'text-rose-400 font-bold'
                      : log.includes('SUCCESS')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('EXCLUSIVE')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
