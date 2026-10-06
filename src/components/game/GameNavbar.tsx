import React, { useState } from 'react';
import { useArena, GameScreen } from '../../context/ArenaContext';
import {
  Swords,
  Trophy,
  User,
  Award,
  LayoutDashboard,
  LogOut,
  Coins,
  Cpu,
  Terminal,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  Check,
  Gamepad2
} from 'lucide-react';

interface GameNavbarProps {
  onToggleBackendConsole: () => void;
  showingBackendConsole: boolean;
  onOpenSqlLogs: () => void;
}

export const GameNavbar: React.FC<GameNavbarProps> = ({
  onToggleBackendConsole,
  showingBackendConsole,
  onOpenSqlLogs,
}) => {
  const {
    players,
    activePlayer,
    currentUser,
    isLoggedIn,
    currentScreen,
    setCurrentScreen,
    startMatchmaking,
    logout,
    switchAccount,
    isMultiplayerTabActive,
    sqlLogs,
  } = useArena();

  const [showSwitchMenu, setShowSwitchMenu] = useState<boolean>(false);

  const navItems: { screen: GameScreen; label: string; icon: React.ElementType }[] = [
    { screen: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { screen: 'MATCHMAKING', label: '1v1 Matchmaking', icon: Swords },
    { screen: 'BATTLE_3D', label: '🎮 3D Open Arena', icon: Gamepad2 },
    { screen: 'LEADERBOARD', label: 'Leaderboard', icon: Trophy },
    { screen: 'PROFILE', label: 'Profile & Heroes', icon: User },
    { screen: 'ACHIEVEMENTS', label: 'Achievements', icon: Award },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-40 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen(isLoggedIn ? 'DASHBOARD' : 'LANDING')}
            className="flex items-center gap-2.5 cursor-pointer text-left"
          >
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-lg tracking-tighter shadow-md shadow-cyan-500/20">
              AX
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wider text-slate-100 flex items-center gap-1.5 leading-none">
                <span>ARENA<span className="text-cyan-400">X</span></span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-1">Multiplayer Battle Arena</div>
            </div>
          </button>
        </div>

        {/* Center Nav Links (if logged in) */}
        {isLoggedIn && !showingBackendConsole && (
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => {
                    if (item.screen === 'MATCHMAKING') {
                      startMatchmaking();
                    } else {
                      setCurrentScreen(item.screen);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Player Chip & Quick Actions */}
        <div className="flex items-center gap-2 text-xs">
          {/* Architecture / Backend Console Mode Toggle */}
          <button
            onClick={onToggleBackendConsole}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              showingBackendConsole
                ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md shadow-purple-900/30'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-purple-300 hover:border-purple-500/50'
            }`}
            title="Inspect DRF REST APIs, MySQL schema, and interview guide"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">
              {showingBackendConsole ? 'Return to Game' : 'Backend & System Arch Console'}
            </span>
            <span className="sm:hidden">Console</span>
          </button>

          {/* SQL Logs Trigger */}
          <button
            onClick={onOpenSqlLogs}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 transition-colors cursor-pointer"
            title="Live MySQL Logs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-[10px] bg-cyan-950 px-1 rounded text-cyan-400 border border-cyan-800/60">
              {sqlLogs.length}
            </span>
          </button>

          {/* User Profile Pill or Login button */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              {/* ELO & Coins pill */}
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px]">
                <span className="text-cyan-400 font-bold">⭐ {activePlayer.elo_rating}</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-bold">🪙 {activePlayer.coins}</span>
              </div>

              {/* User avatar & username with Switcher dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                  title="Switch Gladiator Profile"
                >
                  <img
                    src={activePlayer.avatar}
                    alt={activePlayer.username}
                    className="w-5 h-5 rounded-full object-cover border border-cyan-500/50"
                  />
                  <span className="font-bold text-slate-200 hidden sm:inline">{activePlayer.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showSwitchMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 font-mono space-y-1">
                    <div className="px-3 py-2 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                      <span>Switch Account / Gladiator</span>
                      <span className="text-cyan-400">2-Tab Ready</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {players.map((p) => {
                        const isCurrent = p.id === activePlayer.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              switchAccount(p.id);
                              setShowSwitchMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                              isCurrent
                                ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={p.avatar}
                                alt={p.username}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700"
                              />
                              <div>
                                <div className="font-bold text-slate-100 leading-tight">{p.username}</div>
                                <div className="text-[10px] text-cyan-400">{p.elo_rating} ELO · Lv.{p.level}</div>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setCurrentScreen('PROFILE');
                          setShowSwitchMenu(false);
                        }}
                        className="w-full text-center py-1.5 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        View Full Gladiator Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentScreen('LOGIN')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
