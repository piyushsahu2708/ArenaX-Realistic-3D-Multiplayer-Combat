import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { MYSQL_TABLE_SCHEMAS } from '../data/arenaxData';
import {
  Database,
  Table,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  Code2,
  Key,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

export const DatabaseExplorer: React.FC = () => {
  const { addSqlLog } = useArena();
  const [selectedTable, setSelectedTable] = useState(MYSQL_TABLE_SCHEMAS[0]);
  const [activeTab, setActiveTab] = useState<'SCHEMAS' | 'N_PLUS_ONE' | 'INDEXING'>('SCHEMAS');

  // N+1 Query Debugger simulation state
  const [nPlusOneState, setNPlusOneState] = useState<{
    running: boolean;
    mode: 'NAIVE' | 'OPTIMIZED' | null;
    queryCount: number;
    durationMs: number;
    queries: string[];
  }>({
    running: false,
    mode: null,
    queryCount: 0,
    durationMs: 0,
    queries: [],
  });

  const runNPlusOneBenchmark = (mode: 'NAIVE' | 'OPTIMIZED') => {
    setNPlusOneState({
      running: true,
      mode,
      queryCount: 0,
      durationMs: 0,
      queries: [],
    });

    if (mode === 'NAIVE') {
      // 101 queries
      const generatedQueries = [
        'SELECT * FROM players; -- (Initial Query 1/101)',
      ];
      for (let i = 1; i <= 20; i++) {
        generatedQueries.push(
          `SELECT * FROM player_stats WHERE player_id = ${i}; -- (N+1 roundtrip query #${i + 1})`
        );
      }
      generatedQueries.push('... (+80 more identical queries for all 100 players!)');

      setTimeout(() => {
        setNPlusOneState({
          running: false,
          mode: 'NAIVE',
          queryCount: 101,
          durationMs: 142.5,
          queries: generatedQueries,
        });
        addSqlLog('SELECT', 'N+1 PROBLEM TRIGGERED: 101 individual queries executed across network roundtrips.', 142.5, 'OK');
      }, 700);
    } else {
      // 1 query with select_related
      const optimizedQuery =
        'SELECT players.*, player_stats.* FROM players INNER JOIN player_stats ON (players.id = player_stats.player_id); -- (select_related: 1 Query total)';

      setTimeout(() => {
        setNPlusOneState({
          running: false,
          mode: 'OPTIMIZED',
          queryCount: 1,
          durationMs: 2.8,
          queries: [optimizedQuery],
        });
        addSqlLog('SELECT', 'select_related() EXECUTED: 1 single SQL INNER JOIN. Reduced DB roundtrips by 99%!', 2.8, 'COMMITTED');
      }, 250);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>MySQL 8.0 & Django ORM Layer</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Database Architecture & Query Optimization Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect all 10 relational table schemas, test the <strong className="text-rose-400">N+1 Query Problem</strong> benchmark against <strong className="text-emerald-400">select_related()</strong>, and analyze B-tree index performance.
            </p>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs self-start md:self-auto">
            <button
              onClick={() => setActiveTab('SCHEMAS')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'SCHEMAS'
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table Schemas ({MYSQL_TABLE_SCHEMAS.length})
            </button>
            <button
              onClick={() => setActiveTab('N_PLUS_ONE')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'N_PLUS_ONE'
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              N+1 Query Optimizer
            </button>
            <button
              onClick={() => setActiveTab('INDEXING')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'INDEXING'
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              B-Tree Index Benchmarks
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Relational Schemas & Django Models */}
      {activeTab === 'SCHEMAS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table List (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col h-[640px]">
            <div className="px-2 py-1.5 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800 flex justify-between items-center">
              <span>MySQL Tables</span>
              <span className="text-[10px] text-slate-500">Django Models</span>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1 font-mono">
              {MYSQL_TABLE_SCHEMAS.map((t) => {
                const isSelected = selectedTable.table_name === t.table_name;
                return (
                  <button
                    key={t.table_name}
                    onClick={() => setSelectedTable(t)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/60 text-slate-100 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-cyan-300">{t.table_name}</span>
                      <span className="text-[10px] text-slate-500">{t.django_model}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{t.purpose}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Details & Django Model Preview (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span>Table: {selectedTable.table_name}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedTable.purpose}</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                  Model: {selectedTable.django_model}
                </span>
              </div>

              {/* Columns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-2">Column Name</th>
                      <th className="pb-2">Data Type</th>
                      <th className="pb-2">Key Constraint</th>
                      <th className="pb-2">Attributes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-800/30">
                        <td className="py-2 font-bold text-slate-200">{col.name}</td>
                        <td className="py-2 text-cyan-400">{col.type}</td>
                        <td className="py-2">
                          {col.key ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                col.key.includes('PK')
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : col.key.includes('FK')
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {col.key}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2 text-slate-400">{col.extra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Indexes Section */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2">
                  Active Table Indexes:
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {selectedTable.indexes.map((idx, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
                    >
                      {idx}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Django Model Python Code Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Django models.Model Definition (Python)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">django.db.models</span>
              </div>

              <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800/80 font-mono text-xs overflow-x-auto text-emerald-400">
                <pre className="whitespace-pre-wrap leading-relaxed">{selectedTable.django_code}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: N+1 Query Debugger */}
      {activeTab === 'N_PLUS_ONE' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-bold text-slate-100 font-mono mb-2">
              The N+1 Query Problem Benchmark & select_related Solution
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              In a multiplayer game with 100 players, naive ORM iteration executes 1 query to fetch players, then 100 additional roundtrip queries to fetch each player&apos;s stats. <strong className="text-emerald-400">select_related(&apos;stats&apos;)</strong> collapses all 101 queries into a single SQL INNER JOIN.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bad approach card */}
              <div className="p-4 rounded-xl border border-rose-800/60 bg-rose-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Naive Approach (N+1 Queries)</span>
                  </span>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    101 DB Roundtrips
                  </span>
                </div>

                <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 font-mono text-xs overflow-x-auto">
{`# ❌ BAD: Triggers N+1 database hits
players = Player.objects.all() # 1 query
for player in players:
    print(player.stats.wins)   # +100 queries!`}
                </pre>

                <button
                  disabled={nPlusOneState.running}
                  onClick={() => runNPlusOneBenchmark('NAIVE')}
                  className="w-full py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-mono text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Naive Loop (101 Queries)</span>
                </button>
              </div>

              {/* Optimized approach card */}
              <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Optimized: select_related(&apos;stats&apos;)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    1 Query Total
                  </span>
                </div>

                <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 font-mono text-xs overflow-x-auto">
{`# ✅ OPTIMIZED: 1 single SQL INNER JOIN
players = (
    Player.objects
    .select_related('stats')
    .all()                     # 1 query!
)`}
                </pre>

                <button
                  disabled={nPlusOneState.running}
                  onClick={() => runNPlusOneBenchmark('OPTIMIZED')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute select_related (1 Query)</span>
                </button>
              </div>
            </div>

            {/* Benchmark telemetry output */}
            {nPlusOneState.mode && (
              <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Benchmark Mode:</span>
                    <span
                      className={`font-bold ${
                        nPlusOneState.mode === 'NAIVE' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {nPlusOneState.mode === 'NAIVE' ? 'Naive Loop' : 'select_related()'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-500">Total Queries: </span>
                      <span className="font-bold text-cyan-400">{nPlusOneState.queryCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Execution Time: </span>
                      <span className="font-bold text-amber-400">{nPlusOneState.durationMs}ms</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {nPlusOneState.queries.map((q, idx) => (
                    <div key={idx} className="text-slate-300 text-[11px]">
                      &gt; {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: B-Tree Index Benchmarks */}
      {activeTab === 'INDEXING' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-bold text-slate-100 font-mono mb-2">
              B-Tree Indexing on elo_rating (idx_elo_desc)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl mb-4">
              Query: <code className="text-cyan-300 font-mono">SELECT * FROM players ORDER BY elo_rating DESC LIMIT 10;</code>. Without an index, MySQL executes an expensive disk filesort. With <code className="text-cyan-300 font-mono">models.Index(fields=[&apos;-elo_rating&apos;])</code>, the database reads directly from leaf nodes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Without Index */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Without Index (Full Table Scan)</span>
                  <span className="text-rose-400 font-bold">~420ms (1M rows)</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800/80 rounded space-y-1 text-slate-400 text-[11px]">
                  <div>• EXPLAIN type: ALL (Full table scan)</div>
                  <div>• Rows examined: 1,000,000</div>
                  <div>• Extra: Using filesort, Using temporary</div>
                  <div>• Disk I/O: High overhead during peak tournament hours</div>
                </div>
              </div>

              {/* With Index */}
              <div className="p-4 rounded-xl border border-cyan-800/60 bg-cyan-950/20 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">With idx_elo_desc (B-Tree Leaf Scan)</span>
                  <span className="text-emerald-400 font-bold">~1.4ms (1M rows)</span>
                </div>
                <div className="p-3 bg-slate-950 border border-cyan-900/60 rounded space-y-1 text-slate-300 text-[11px]">
                  <div>• EXPLAIN type: index (B-Tree index scan)</div>
                  <div>• Rows examined: 10 (Instant stop at LIMIT 10)</div>
                  <div>• Extra: Backward index scan (Zero filesort)</div>
                  <div>• Latency: sub-2ms even with millions of players!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
