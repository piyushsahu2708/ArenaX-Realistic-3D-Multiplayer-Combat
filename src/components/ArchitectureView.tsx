import React, { useState } from 'react';
import {
  Network,
  Server,
  Layers,
  Database,
  Shield,
  Zap,
  ArrowRight,
  ArrowDown,
  Cpu,
  Clock,
  Sparkles,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('SERVICE_LAYER');

  const nodeDetails: Record<
    string,
    { title: string; subtitle: string; description: string; interviewKeyPoint: string }
  > = {
    CLIENT: {
      title: 'Game Client (Web / Mobile)',
      subtitle: 'Unity / Unreal / React Native / WebGL Client',
      description:
        'Frontend sends REST requests over HTTP with JWT Bearer tokens. Clients never report their own ELO or win states; they only submit raw game event telemetry.',
      interviewKeyPoint:
        'Always mention "Zero Client Trust". Cheating is prevented because the client is never allowed to dictate rating updates.',
    },
    DRF_API: {
      title: 'Django REST Framework (DRF)',
      subtitle: 'URL Routing, JWT Auth, ModelSerializers',
      description:
        'Handles incoming HTTP traffic, executes SimpleJWT authentication middleware, validates incoming payloads using ModelSerializers, and keeps API views clean and thin.',
      interviewKeyPoint:
        'Explain that views in ArenaX are under 25 lines because business logic is delegated to the Service Layer.',
    },
    SERVICE_LAYER: {
      title: 'Domain Service Layer (OOP)',
      subtitle: 'MatchmakingService, MatchService, RewardService',
      description:
        'Houses core algorithmic logic: ELO probability calculation, dynamic queue window expansion, achievement condition triggers, and transaction orchestration.',
      interviewKeyPoint:
        'Applied Object-Oriented Design principles (Single Responsibility, Separation of Concerns) rather than placing 500 lines inside a single view.',
    },
    ORM: {
      title: 'Django ORM & Transactions',
      subtitle: 'select_related, prefetch_related, transaction.atomic',
      description:
        'Abstracts SQL queries while ensuring atomic ACID guarantees with select_for_update() row locking to eliminate race conditions.',
      interviewKeyPoint:
        'State that ORM queries were profiled to eliminate N+1 overhead using select_related for OneToOne relations and indexed B-tree lookups.',
    },
    MYSQL: {
      title: 'MySQL 8.0 (InnoDB Engine)',
      subtitle: 'ACID Relational Storage & Row-Level Locks',
      description:
        'Stores persistent state: players, stats, game sessions, match history, and inventory. InnoDB provides row-level write locking for high concurrency.',
      interviewKeyPoint:
        'Mention indexed fields like idx_elo_desc and UK constraints on username and email for O(log N) lookup speeds.',
    },
    REDIS: {
      title: 'Redis In-Memory Data Store (Scale Tier)',
      subtitle: 'Sorted Sets (ZSET) & Queues',
      description:
        'At scale, replaces MySQL queue polling with in-memory Redis Lists and maintains real-time leaderboards using Redis Sorted Sets (ZADD, ZREVRANGEBYSCORE).',
      interviewKeyPoint:
        'When asked how to scale to 1M players: "I would move the matchmaking queue and real-time leaderboard into Redis Sorted Sets for sub-millisecond in-memory speed."',
    },
    CELERY: {
      title: 'Celery Distributed Task Queue (Scale Tier)',
      subtitle: 'Asynchronous Background Workers',
      description:
        'Processes asynchronous jobs like season-end leaderboard calculations, achievement batch unlocks, push notifications, and analytics logging.',
      interviewKeyPoint:
        'Separates critical synchronous response path (match outcome) from asynchronous non-blocking background jobs.',
    },
  };

  const activeNode = nodeDetails[selectedNode] || nodeDetails.SERVICE_LAYER;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Network className="w-4 h-4" />
              <span>System Design & Architecture</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              High-Level Architecture & 1M Player Scalability Blueprint
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Clean separation of concerns: Game Client &rarr; DRF Gateway &rarr; Service Layer &rarr; Django ORM &rarr; MySQL InnoDB, scaled with Redis & Celery. Click any node to inspect interview talking points.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Architecture Flow Diagram + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Visual Architecture Diagram (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Interactive Architecture Pipeline</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Click a block to inspect</span>
          </div>

          {/* Node 1: Client */}
          <div
            onClick={() => setSelectedNode('CLIENT')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === 'CLIENT'
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-900/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-xs sm:text-sm">Game Client (Web / Mobile)</div>
                  <div className="text-[11px] text-slate-400 font-mono">Sends HTTP/REST + JWT Bearer Header</div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-cyan-300 border border-slate-800">
                Layer 1
              </span>
            </div>
          </div>

          <div className="flex justify-center my-1 text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 2: DRF API */}
          <div
            onClick={() => setSelectedNode('DRF_API')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === 'DRF_API'
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-900/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-xs sm:text-sm">Django REST Framework API</div>
                  <div className="text-[11px] text-slate-400 font-mono">URL Routing · JWT Authentication · ModelSerializers</div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-emerald-300 border border-slate-800">
                Layer 2
              </span>
            </div>
          </div>

          <div className="flex justify-center my-1 text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 3: Service Layer (OOP) */}
          <div
            onClick={() => setSelectedNode('SERVICE_LAYER')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === 'SERVICE_LAYER'
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-900/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-xs sm:text-sm">Domain Service Layer (OOP)</div>
                  <div className="text-[11px] text-slate-400 font-mono">MatchmakingService · MatchService · RewardService</div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-purple-300 border border-slate-800">
                Layer 3 (Core)
              </span>
            </div>
          </div>

          <div className="flex justify-center my-1 text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 4: Django ORM */}
          <div
            onClick={() => setSelectedNode('ORM')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === 'ORM'
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-900/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-xs sm:text-sm">Django ORM & Atomic Transactions</div>
                  <div className="text-[11px] text-slate-400 font-mono">select_for_update() row lock · select_related JOINs</div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-slate-800">
                Layer 4
              </span>
            </div>
          </div>

          <div className="flex justify-center my-1 text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 5: MySQL Database */}
          <div
            onClick={() => setSelectedNode('MYSQL')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === 'MYSQL'
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-900/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-cyan-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-xs sm:text-sm">MySQL 8.0 (InnoDB Engine)</div>
                  <div className="text-[11px] text-slate-400 font-mono">10 Relational Tables · B-Tree Indexes · ACID Guaranteed</div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-cyan-300 border border-slate-800">
                Layer 5
              </span>
            </div>
          </div>
        </div>

        {/* Right: Selected Node Details & Interview Explanations (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                Component Deep-Dive
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1">{activeNode.title}</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{activeNode.subtitle}</div>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-400 uppercase font-semibold mb-1">
                Role in ArenaX:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{activeNode.description}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 space-y-1.5 font-mono text-xs">
              <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>How to explain this in an Interview:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                &quot;{activeNode.interviewKeyPoint}&quot;
              </p>
            </div>
          </div>

          {/* Scalability Nodes (Redis & Celery) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Scaling to 1M Players (Production Tier)</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400">Redis & Celery</span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                onClick={() => setSelectedNode('REDIS')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedNode === 'REDIS'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-slate-200">Redis Cache & Queue</div>
                <div className="text-[10px] text-slate-500 mt-0.5">ZSET for Leaderboard</div>
              </button>

              <button
                onClick={() => setSelectedNode('CELERY')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedNode === 'CELERY'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-slate-200">Celery Workers</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Async Match Results</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
