/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArenaProvider, useArena } from './context/ArenaContext';
import { GameNavbar } from './components/game/GameNavbar';
import { LandingScreen } from './components/game/LandingScreen';
import { AuthScreen } from './components/game/AuthScreen';
import { DashboardScreen } from './components/game/DashboardScreen';
import { MatchmakingScreen } from './components/game/MatchmakingScreen';
import { BattleArenaScreen } from './components/game/BattleArenaScreen';
import { LeaderboardScreen } from './components/game/LeaderboardScreen';
import { ProfileScreen } from './components/game/ProfileScreen';
import { MatchHistoryScreen } from './components/game/MatchHistoryScreen';
import { AchievementsScreen } from './components/game/AchievementsScreen';
import { Arena3DCanvas } from './components/game3d/Arena3DCanvas';

// Backend & Architecture Engine components
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { LiveArenaFlow } from './components/LiveArenaFlow';
import { EloMatchmakingLab } from './components/EloMatchmakingLab';
import { ApiPlayground } from './components/ApiPlayground';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { ArchitectureView } from './components/ArchitectureView';
import { InterviewMasterclass } from './components/InterviewMasterclass';
import { SqlLogDrawer } from './components/SqlLogDrawer';
import { Swords, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { currentScreen, isLoggedIn } = useArena();
  const [showingBackendConsole, setShowingBackendConsole] = useState<boolean>(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<TabKey>('pipeline');
  const [showSqlLogs, setShowSqlLogs] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Universal Top Navigation */}
      <GameNavbar
        onToggleBackendConsole={() => setShowingBackendConsole(!showingBackendConsole)}
        showingBackendConsole={showingBackendConsole}
        onOpenSqlLogs={() => setShowSqlLogs(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {showingBackendConsole ? (
          /* Backend & System Architecture Mode */
          <div className="space-y-6">
            <div className="bg-purple-950/30 border border-purple-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-ping"></span>
                <div>
                  <h2 className="font-bold text-slate-100 text-sm">
                    Backend Architecture & Engineering Console
                  </h2>
                  <p className="text-xs text-purple-300">
                    Inspecting DRF REST APIs, MySQL InnoDB Schemas, ELO Algorithm Math & System Design Interview Masterclass
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowingBackendConsole(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Playable Arena</span>
              </button>
            </div>

            <Navigation activeTab={activeConsoleTab} onTabChange={setActiveConsoleTab} />

            {activeConsoleTab === 'pipeline' && <LiveArenaFlow />}
            {activeConsoleTab === 'elo-lab' && <EloMatchmakingLab />}
            {activeConsoleTab === 'api-playground' && <ApiPlayground />}
            {activeConsoleTab === 'database' && <DatabaseExplorer />}
            {activeConsoleTab === 'architecture' && <ArchitectureView />}
            {activeConsoleTab === 'interview' && <InterviewMasterclass />}
          </div>
        ) : (
          /* Playable Game Screens */
          <div>
            {currentScreen === 'LANDING' && <LandingScreen />}
            {currentScreen === 'LOGIN' && <AuthScreen initialMode="LOGIN" />}
            {currentScreen === 'REGISTER' && <AuthScreen initialMode="REGISTER" />}
            {currentScreen === 'DASHBOARD' && <DashboardScreen />}
            {currentScreen === 'MATCHMAKING' && <MatchmakingScreen />}
            {currentScreen === 'BATTLE' && <BattleArenaScreen />}
            {currentScreen === 'BATTLE_3D' && <Arena3DCanvas />}
            {currentScreen === 'LEADERBOARD' && <LeaderboardScreen />}
            {currentScreen === 'PROFILE' && <ProfileScreen />}
            {currentScreen === 'MATCH_HISTORY' && <MatchHistoryScreen />}
            {currentScreen === 'ACHIEVEMENTS' && <AchievementsScreen />}
          </div>
        )}
      </main>

      {/* Slide-Over MySQL Query & Transaction Log Drawer */}
      <SqlLogDrawer isOpen={showSqlLogs} onClose={() => setShowSqlLogs(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-5 px-4 sm:px-6 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">ARENAX</span>
            <span aria-hidden="true">·</span>
            <span>1v1 Competitive Multiplayer Battle Arena</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">Server-Authoritative ELO Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowingBackendConsole(!showingBackendConsole)}
              className="hover:text-purple-400 transition-colors cursor-pointer"
            >
              {showingBackendConsole ? 'Play Game' : 'Backend & Interview Console'}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowSqlLogs(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              View MySQL Queries
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ArenaProvider>
      <AppContent />
    </ArenaProvider>
  );
}
