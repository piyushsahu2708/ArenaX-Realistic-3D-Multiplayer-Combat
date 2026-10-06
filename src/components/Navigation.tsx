import React from 'react';
import { PlayCircle, Cpu, Radio, Database, Network, GraduationCap } from 'lucide-react';

export type TabKey = 'pipeline' | 'elo-lab' | 'api-playground' | 'database' | 'architecture' | 'interview';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'pipeline' as TabKey,
      label: 'Live Arena Pipeline',
      icon: PlayCircle,
      description: 'End-to-end battle & ACID commit',
    },
    {
      id: 'elo-lab' as TabKey,
      label: 'ELO Matchmaking Lab',
      icon: Cpu,
      description: 'Queue, Math & Race Conditions',
    },
    {
      id: 'api-playground' as TabKey,
      label: 'DRF API Explorer (20+)',
      icon: Radio,
      description: 'Interactive REST API runner',
    },
    {
      id: 'database' as TabKey,
      label: 'MySQL & Query Optimizer',
      icon: Database,
      description: 'ERD, N+1 benchmark & Indexes',
    },
    {
      id: 'architecture' as TabKey,
      label: 'System Design & Scale',
      icon: Network,
      description: '1M scale, Redis & Celery',
    },
    {
      id: 'interview' as TabKey,
      label: 'Interview Masterclass',
      icon: GraduationCap,
      description: '60s Pitch & 47 Core Topics',
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-[#0a0f1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="font-semibold leading-none">{tab.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-none font-mono hidden md:block">
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
