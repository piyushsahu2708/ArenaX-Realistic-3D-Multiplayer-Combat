import React, { useState, useEffect } from 'react';
import { INTERVIEW_TOPICS } from '../data/arenaxData';
import { InterviewTopic } from '../types/arenax';
import {
  GraduationCap,
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Sparkles,
  HelpCircle,
  BookOpen,
  Volume2
} from 'lucide-react';

export const InterviewMasterclass: React.FC = () => {
  // Practice Pitch Timer state
  const [pitchTimerActive, setPitchTimerActive] = useState<boolean>(false);
  const [pitchElapsedSeconds, setPitchElapsedSeconds] = useState<number>(0);

  // Topics filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTopicId, setExpandedTopicId] = useState<number>(1);

  // Pitch timer tick
  useEffect(() => {
    let interval: any = null;
    if (pitchTimerActive) {
      interval = setInterval(() => {
        setPitchElapsedSeconds((prev) => {
          if (prev >= 60) {
            setPitchTimerActive(false);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pitchTimerActive]);

  const resetPitchTimer = () => {
    setPitchTimerActive(false);
    setPitchElapsedSeconds(0);
  };

  const categories = [
    'All',
    'Overview & Architecture',
    'Django & DRF',
    'ELO & Matchmaking',
    'Concurrency & Transactions',
    'MySQL & Performance',
    'Security & Scalability',
  ];

  const filteredTopics = INTERVIEW_TOPICS.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.englishSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hinglishExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Interview Preparation & Verbal Mastery</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              ArenaX System Architecture & Backend Interview Masterclass
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Practice the 60-second elevator pitch with a live pacing timer, and master all key technical interview topics with bilingual (English + Hinglish) explanations, code snippets, and counter-answers to interview traps.
            </p>
          </div>
        </div>
      </div>

      {/* 60-Second Pitch Teleprompter Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase font-mono">
                The 60-Second Interview Answer Teleprompter
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                When the interviewer says: &quot;Tell me about your ArenaX project.&quot;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Timer digits */}
            <div
              className={`px-3 py-1.5 rounded-lg border font-bold text-sm ${
                pitchElapsedSeconds >= 60
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : pitchElapsedSeconds >= 45
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
              }`}
            >
              {pitchElapsedSeconds}s / 60s
            </div>

            <button
              onClick={() => setPitchTimerActive(!pitchTimerActive)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all uppercase"
            >
              {pitchTimerActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{pitchTimerActive ? 'Pause' : 'Start Timer'}</span>
            </button>

            <button
              onClick={resetPitchTimer}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pacing timeline bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 transition-all duration-300"
              style={{ width: `${(pitchElapsedSeconds / 60) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0-15s: Intro & Stack</span>
            <span>15-30s: 20+ APIs & ELO</span>
            <span>30-45s: MySQL & Optimization</span>
            <span>45-60s: Security & Architecture</span>
          </div>
        </div>

        {/* Teleprompter Script Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs leading-relaxed text-slate-200">
          <p className={pitchElapsedSeconds < 15 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
            <span className="text-cyan-400 font-bold">[0-15s]</span> &quot;ArenaX is a multiplayer battle-arena game backend that I developed using <strong className="text-slate-100">Python, Django, Django REST Framework, and MySQL</strong>. The backend manages player profiles, matchmaking, game sessions, rankings, rewards, achievements, and match history.&quot;
          </p>

          <p className={pitchElapsedSeconds >= 15 && pitchElapsedSeconds < 30 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
            <span className="text-cyan-400 font-bold">[15-30s]</span> &quot;I developed <strong className="text-slate-100">more than 20 REST APIs</strong> for authentication, player management, matchmaking, game sessions, leaderboards, rewards, and match history. One of the core features was <strong className="text-slate-100">ELO-based matchmaking</strong>, where players were paired dynamically within expanding skill windows (±100 to ±300 ELO) to maintain competitive balance.&quot;
          </p>

          <p className={pitchElapsedSeconds >= 30 && pitchElapsedSeconds < 45 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
            <span className="text-cyan-400 font-bold">[30-45s]</span> &quot;I designed the MySQL database across 10 relational tables. I optimized database operations using <strong className="text-slate-100">B-Tree indexing on elo_rating</strong> and solved the <strong className="text-slate-100">N+1 query problem using select_related</strong> for One-to-One relationships, reducing roundtrips by over 90%.&quot;
          </p>

          <p className={pitchElapsedSeconds >= 45 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
            <span className="text-cyan-400 font-bold">[45-60s]</span> &quot;For security and consistency, I implemented <strong className="text-slate-100">JWT authentication</strong> and utilized Django&apos;s <strong className="text-slate-100">transaction.atomic()</strong> with <strong className="text-slate-100">select_for_update() row locks</strong> to prevent race conditions in the matchmaking queue. The project emphasized a clean service-layer architecture with separation of concerns.&quot;
          </p>
        </div>

        {/* Self-check badges */}
        <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 pt-1">
          <span className="text-slate-300 font-bold">Key Checkpoints:</span>
          <span>✓ Mentioned DRF + MySQL</span>
          <span>·</span>
          <span>✓ 20+ REST APIs</span>
          <span>·</span>
          <span>✓ ELO Formula & Dynamic Window</span>
          <span>·</span>
          <span>✓ select_related (N+1)</span>
          <span>·</span>
          <span>✓ select_for_update() Race Condition</span>
          <span>·</span>
          <span>✓ transaction.atomic()</span>
        </div>
      </div>

      {/* Category Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search interview questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 font-mono focus:border-cyan-500 outline-none w-full sm:w-64"
        />
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;
          return (
            <div
              key={topic.id}
              className={`bg-slate-900/90 border rounded-xl transition-all overflow-hidden ${
                isExpanded ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <button
                onClick={() => setExpandedTopicId(isExpanded ? 0 : topic.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-md bg-slate-800 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    #{topic.id}
                  </span>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                      {topic.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100">{topic.question}</h3>
                  </div>
                </div>

                <span className="text-xs font-mono text-cyan-400 shrink-0">
                  {isExpanded ? 'Collapse ▲' : 'Read Deep-Dive ▼'}
                </span>
              </button>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 font-mono text-xs">
                  {/* English Summary */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-cyan-400 font-bold uppercase text-[10px] block mb-1">
                      English Summary (Direct Technical Answer):
                    </span>
                    <p className="text-slate-200 leading-relaxed">{topic.englishSummary}</p>
                  </div>

                  {/* Hinglish Explanation */}
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-900/40">
                    <span className="text-amber-400 font-bold uppercase text-[10px] block mb-1">
                      Hinglish In-Depth Explanation (Conceptual Clarity):
                    </span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {topic.hinglishExplanation}
                    </p>
                  </div>

                  {/* Code Snippet if present */}
                  {topic.codeSnippet && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1.5 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Production Django / Python Implementation:</span>
                      </span>
                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 overflow-x-auto leading-relaxed">
                        {topic.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {/* Tips */}
                  {topic.interviewTips.length > 0 && (
                    <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/40 text-purple-200">
                      <span className="font-bold text-[10px] uppercase block mb-1 text-purple-300">
                        Pro Interview Tips & Gotchas:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {topic.interviewTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
