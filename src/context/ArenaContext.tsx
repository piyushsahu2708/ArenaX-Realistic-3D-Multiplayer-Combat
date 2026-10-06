import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Player,
  GameSession,
  MatchHistoryRecord,
  QueueEntry,
  ActiveBattleState,
  BattleLogEntry,
  HeroId,
  Hero,
} from '../types/arenax';
import { INITIAL_PLAYERS, INITIAL_ACHIEVEMENTS } from '../data/arenaxData';
import { HEROES, getRankInfo, INITIAL_DAILY_MISSIONS, UNLOCKABLE_TITLES, UNLOCKABLE_FRAMES } from '../data/heroesData';
import { getFullEloDetails } from '../utils/eloCalculator';

export interface SqlLogEntry {
  id: string;
  timestamp: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION' | 'LOCK';
  sql: string;
  durationMs: number;
  status: 'COMMITTED' | 'ROLLBACK' | 'OK';
}

export type GameScreen =
  | 'LANDING'
  | 'LOGIN'
  | 'REGISTER'
  | 'DASHBOARD'
  | 'MATCHMAKING'
  | 'BATTLE'
  | 'BATTLE_3D'
  | 'LEADERBOARD'
  | 'PROFILE'
  | 'MATCH_HISTORY'
  | 'ACHIEVEMENTS';

interface ArenaContextType {
  players: Player[];
  activePlayer: Player;
  currentUser: Player | null;
  isLoggedIn: boolean;
  currentScreen: GameScreen;
  setCurrentScreen: (screen: GameScreen) => void;
  login: (usernameOrEmail: string, password: string) => { success: boolean; error?: string };
  register: (username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  claimDailyReward: () => { success: boolean; message: string; coinsAdded: number };
  dailyRewardClaimed: boolean;
  claimMissionsReward: () => { success: boolean; message: string; coinsAdded: number };

  // Hero Selection & Customization
  selectedHeroId: HeroId;
  setSelectedHeroId: (id: HeroId) => void;
  battleMode: 'RANKED' | 'CASUAL';
  setBattleMode: (mode: 'RANKED' | 'CASUAL') => void;
  equipTitle: (title: string) => void;
  equipFrame: (frame: string) => void;

  // Playable Matchmaking & Battle
  searchingOpponent: boolean;
  foundOpponent: Player | null;
  matchSearchEloMin: number;
  matchSearchEloMax: number;
  startMatchmaking: (preferredOpponentId?: number, isLocal2P?: boolean) => void;
  cancelMatchmaking: () => void;
  acceptMatchAndEnterArena: () => void;
  activeBattle: ActiveBattleState | null;
  executeBattleAction: (action: 'ATTACK' | 'DEFEND' | 'HEAL' | 'SPECIAL') => void;
  exitBattleToDashboard: () => void;
  switchAccount: (playerId: number) => void;
  isMultiplayerTabActive: boolean;

  // Backend Console State & Helpers
  jwtAccessToken: string;
  jwtRefreshToken: string;
  queue: QueueEntry[];
  gameSessions: GameSession[];
  matchHistory: MatchHistoryRecord[];
  sqlLogs: SqlLogEntry[];
  enqueuePlayer: (playerId: number) => { success: boolean; message: string };
  dequeuePlayer: (playerId: number) => void;
  populateRandomQueue: () => void;
  runMatchmaker: () => { matched: boolean; session?: GameSession };
  completeMatchSession: (
    sessionId: number,
    winnerId: number | null,
    killsA: number,
    killsB: number,
    simulateCrash?: boolean
  ) => { success: boolean; error?: string; eloDeltaA?: number; eloDeltaB?: number; unlockedAchievements?: string[] };
  createGameSessionManual: (playerAId: number, playerBId: number) => GameSession;
  resetDatabase: () => void;
  addSqlLog: (type: SqlLogEntry['type'], sql: string, durationMs?: number, status?: SqlLogEntry['status']) => void;
  clearSqlLogs: () => void;
  setActivePlayerId: (id: number) => void;
}

const ArenaContext = createContext<ArenaContextType | null>(null);

const DEFAULT_JWT_ACCESS =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IlBpeXVzaCIsInJvbGUiOiJQTEFZRVIsImV4cCI6MTczODU4ODAwMH0.K19_arena_x_sig';
const DEFAULT_JWT_REFRESH =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczOTE5MjgwMH0.R92_arena_x_refresh';

export const ArenaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentUser, setCurrentUser] = useState<Player | null>(INITIAL_PLAYERS[0]);
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('DASHBOARD');
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState<boolean>(false);
  const [battleMode, setBattleMode] = useState<'RANKED' | 'CASUAL'>('RANKED');

  // Matchmaking state
  const [searchingOpponent, setSearchingOpponent] = useState<boolean>(false);
  const [foundOpponent, setFoundOpponent] = useState<Player | null>(null);
  const [matchSearchEloMin, setMatchSearchEloMin] = useState<number>(1320);
  const [matchSearchEloMax, setMatchSearchEloMax] = useState<number>(1520);
  const [isLocalTwoPlayer, setIsLocalTwoPlayer] = useState<boolean>(false);
  const [isMultiplayerTabActive, setIsMultiplayerTabActive] = useState<boolean>(false);

  // Multi-tab network refs
  const tabId = useRef<string>('tab_' + Math.random().toString(36).substring(2, 9)).current;
  const channelRef = useRef<BroadcastChannel | null>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Active Battle state
  const [activeBattle, setActiveBattle] = useState<ActiveBattleState | null>(null);

  // Latest state refs to prevent stale closure in BroadcastChannel
  const currentUserRef = useRef<Player | null>(currentUser);
  currentUserRef.current = currentUser;
  const searchingOpponentRef = useRef<boolean>(searchingOpponent);
  searchingOpponentRef.current = searchingOpponent;
  const selectedHeroIdRef = useRef<HeroId>(currentUser?.selectedHeroId || 'BLAZE');
  selectedHeroIdRef.current = currentUser?.selectedHeroId || 'BLAZE';
  const foundOpponentRef = useRef<Player | null>(foundOpponent);
  foundOpponentRef.current = foundOpponent;

  // Background JWT and DB logs
  const [jwtAccessToken] = useState<string>(DEFAULT_JWT_ACCESS);
  const [jwtRefreshToken] = useState<string>(DEFAULT_JWT_REFRESH);
  const [queue, setQueue] = useState<QueueEntry[]>([
    {
      id: 'q-101',
      player_id: 2,
      username: 'Rahul',
      elo_rating: 1185,
      level: 5,
      avatar: INITIAL_PLAYERS[1].avatar,
      joined_at: Date.now() - 14000,
      current_range: 200,
      seconds_in_queue: 14,
      status: 'WAITING',
    },
  ]);

  const [gameSessions, setGameSessions] = useState<GameSession[]>([
    {
      id: 101,
      session_token: 'sess-8392-fbc9',
      status: 'COMPLETED',
      map_name: 'Neo_Tokyo_Arena',
      player_a_id: 1,
      player_b_id: 2,
      player_a_username: 'Piyush',
      player_b_username: 'Rahul',
      player_a_elo_before: 1400,
      player_b_elo_before: 1205,
      player_a_elo_after: 1420,
      player_b_elo_after: 1185,
      player_a_kills: 3,
      player_b_kills: 1,
      winner_id: 1,
      started_at: '2026-10-06T08:15:00Z',
      ended_at: '2026-10-06T08:24:30Z',
      duration_sec: 151,
    },
  ]);

  const [matchHistory, setMatchHistory] = useState<MatchHistoryRecord[]>([
    {
      id: 10582,
      game_session_id: 101,
      player_id: 1,
      opponent_id: 2,
      opponent_username: 'Rahul',
      result: 'WIN',
      elo_before: 1400,
      elo_after: 1420,
      elo_delta: 20,
      kills: 3,
      deaths: 1,
      played_at: '2026-10-06T08:24:30Z',
    },
    {
      id: 10581,
      game_session_id: 99,
      player_id: 1,
      opponent_id: 3,
      opponent_username: 'Aman',
      result: 'LOSS',
      elo_before: 1415,
      elo_after: 1400,
      elo_delta: -15,
      kills: 1,
      deaths: 4,
      played_at: '2026-10-05T19:12:00Z',
    },
    {
      id: 10580,
      game_session_id: 98,
      player_id: 1,
      opponent_id: 5,
      opponent_username: 'Viktor_K',
      result: 'WIN',
      elo_before: 1397,
      elo_after: 1415,
      elo_delta: 18,
      kills: 4,
      deaths: 2,
      played_at: '2026-10-05T14:30:00Z',
    },
  ]);

  const [sqlLogs, setSqlLogs] = useState<SqlLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '09:20:00.100',
      type: 'SELECT',
      sql: 'SELECT * FROM players WHERE id = 1 LIMIT 1;',
      durationMs: 0.8,
      status: 'OK',
    },
  ]);

  const activePlayer = currentUser || players[0];
  const selectedHeroId = activePlayer.selectedHeroId || 'PIYUSH';

  const setSelectedHeroId = (heroId: HeroId) => {
    if (!currentUser) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, selectedHeroId: heroId } : p))
    );
    setCurrentUser((prev) => (prev ? { ...prev, selectedHeroId: heroId } : prev));
    addSqlLog('UPDATE', `UPDATE players SET selected_hero = '${heroId}' WHERE id = ${currentUser.id};`, 0.7);
  };

  const equipTitle = (title: string) => {
    if (!currentUser) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, equippedTitle: title } : p))
    );
    setCurrentUser((prev) => (prev ? { ...prev, equippedTitle: title } : prev));
  };

  const equipFrame = (frame: string) => {
    if (!currentUser) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, equippedFrame: frame } : p))
    );
    setCurrentUser((prev) => (prev ? { ...prev, equippedFrame: frame } : prev));
  };

  const addSqlLog = (
    type: SqlLogEntry['type'],
    sql: string,
    durationMs: number = 1.0,
    status: SqlLogEntry['status'] = 'COMMITTED'
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    const newEntry: SqlLogEntry = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      type,
      sql,
      durationMs: Number((durationMs + Math.random() * 0.4).toFixed(2)),
      status,
    };
    setSqlLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  const clearSqlLogs = () => setSqlLogs([]);

  // BroadcastChannel Multi-Tab Real-Time Multiplayer Network
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('arenax_battle_network');
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent) => {
      const { type, senderTabId, payload } = event.data || {};
      if (senderTabId === tabId) return;

      if (type === 'QUEUE_SEARCH') {
        // If this tab is ALSO searching and has a different gladiator logged in
        if (
          searchingOpponentRef.current &&
          currentUserRef.current &&
          currentUserRef.current.id !== payload.player.id
        ) {
          clearTimeout(searchTimeoutRef.current);
          const matchPayload = {
            sessionId: 100 + Math.floor(Math.random() * 900),
            hostTabId: payload.tabId,
            clientTabId: tabId,
            playerA: payload.player,
            heroAId: payload.heroId,
            playerB: currentUserRef.current,
            heroBId: selectedHeroIdRef.current,
          };
          channel.postMessage({
            type: 'QUEUE_PAIRED',
            senderTabId: tabId,
            payload: matchPayload,
          });
          setFoundOpponent(payload.player);
          setSearchingOpponent(false);
          setIsMultiplayerTabActive(true);
          addSqlLog('LOCK', `Multi-tab paired! Matched with ${payload.player.username} (Tab: ${payload.tabId.slice(-4)})`, 0.8);
        }
      } else if (type === 'QUEUE_PAIRED') {
        if (payload.hostTabId === tabId) {
          clearTimeout(searchTimeoutRef.current);
          setFoundOpponent(payload.playerB);
          setSearchingOpponent(false);
          setIsMultiplayerTabActive(true);
          addSqlLog('LOCK', `Multi-tab paired! Matched with ${payload.playerB.username} (Tab: ${payload.clientTabId.slice(-4)})`, 0.8);
        }
      } else if (type === 'ENTER_ARENA') {
        const heroA = HEROES[payload.heroAId as HeroId] || HEROES.BLAZE;
        const heroB = HEROES[payload.heroBId as HeroId] || HEROES.SHADOW;
        const initialBattle: ActiveBattleState = {
          sessionId: payload.sessionId,
          mode: payload.mode || 'RANKED',
          playerA: payload.playerA,
          playerB: payload.playerB,
          heroA,
          heroB,
          hpA: 100,
          hpB: 100,
          energyA: 1,
          energyB: 1,
          isDefendingA: false,
          isDefendingB: false,
          titanShieldTurnsA: 0,
          titanShieldTurnsB: 0,
          comboCountA: 1,
          comboCountB: 1,
          healsRemainingA: 2,
          healsRemainingB: 2,
          currentTurnPlayerId: payload.playerA.id,
          turnTimeLeft: 15,
          roundNumber: 1,
          battleLogs: [
            {
              id: 'log-start-1',
              timestamp: new Date().toLocaleTimeString(),
              action: 'SYSTEM',
              actor: 'ARENAX',
              message: `⚔️ Live Multi-Tab 1v1 Battle! [${heroA.name}] ${payload.playerA.username} VS [${heroB.name}] ${payload.playerB.username}.`,
            },
            {
              id: 'log-start-2',
              timestamp: new Date().toLocaleTimeString(),
              action: 'SYSTEM',
              actor: 'ARENAX',
              message: `🟢 ${payload.playerA.username} has first turn! Waiting for live action...`,
            },
          ],
          status: 'ACTIVE',
          winnerId: null,
          isTwoPlayerLocal: false,
          isMultiplayerTab: true,
          damageDealtA: 0,
          damageDealtB: 0,
          critsLandedA: 0,
          critsLandedB: 0,
          defensesUsedA: 0,
          defensesUsedB: 0,
          specialsUsedA: 0,
          specialsUsedB: 0,
        };
        setActiveBattle(initialBattle);
        setCurrentScreen('BATTLE');
        addSqlLog('INSERT', `INSERT INTO game_sessions (id, status, is_multiplayer) VALUES (${payload.sessionId}, 'ACTIVE', TRUE);`, 1.2);
      } else if (type === 'BATTLE_ACTION') {
        executeActionInternal(payload.action, payload.actorId);
      } else if (type === 'CANCEL_MATCH') {
        clearTimeout(searchTimeoutRef.current);
        setSearchingOpponent(false);
        setFoundOpponent(null);
        setIsMultiplayerTabActive(false);
        setCurrentScreen('DASHBOARD');
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Turn timer countdown in active battle
  useEffect(() => {
    let timerInterval: any = null;
    if (activeBattle && activeBattle.status === 'ACTIVE') {
      timerInterval = setInterval(() => {
        setActiveBattle((prev) => {
          if (!prev || prev.status !== 'ACTIVE') return prev;
          if (prev.turnTimeLeft <= 1) {
            // Turn timeout! Skip turn
            const isTurnA = prev.currentTurnPlayerId === prev.playerA.id;
            const actorName = isTurnA ? prev.playerA.username : prev.playerB.username;
            const nextTurnPlayerId = isTurnA ? prev.playerB.id : prev.playerA.id;

            const timeoutLog: BattleLogEntry = {
              id: 'log-' + Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              actor: actorName,
              action: 'TIMEOUT',
              message: `⏳ ${actorName}'s 15s turn timed out! Action was skipped.`,
            };

            return {
              ...prev,
              currentTurnPlayerId: nextTurnPlayerId,
              turnTimeLeft: 15,
              roundNumber: isTurnA ? prev.roundNumber : prev.roundNumber + 1,
              battleLogs: [timeoutLog, ...prev.battleLogs],
            };
          }

          return {
            ...prev,
            turnTimeLeft: prev.turnTimeLeft - 1,
          };
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [activeBattle?.status, activeBattle?.currentTurnPlayerId]);

  // Opponent AI turn execution in Single Player
  useEffect(() => {
    if (
      activeBattle &&
      activeBattle.status === 'ACTIVE' &&
      !activeBattle.isTwoPlayerLocal &&
      !activeBattle.isMultiplayerTab &&
      activeBattle.currentTurnPlayerId === activeBattle.playerB.id
    ) {
      const botDelay = setTimeout(() => {
        executeBotTurn();
      }, 1250);

      return () => clearTimeout(botDelay);
    }
  }, [activeBattle?.currentTurnPlayerId, activeBattle?.status, activeBattle?.isMultiplayerTab]);

  // Bot AI action selection
  const executeBotTurn = () => {
    if (!activeBattle || activeBattle.status !== 'ACTIVE') return;

    let chosenAction: 'ATTACK' | 'DEFEND' | 'HEAL' | 'SPECIAL' = 'ATTACK';
    if (activeBattle.energyB >= 3 && Math.random() < 0.65) {
      chosenAction = 'SPECIAL';
    } else if (activeBattle.hpB <= 40 && activeBattle.healsRemainingB > 0 && Math.random() < 0.70) {
      chosenAction = 'HEAL';
    } else if (activeBattle.comboCountA >= 2 && Math.random() < 0.45) {
      chosenAction = 'DEFEND';
    } else {
      chosenAction = 'ATTACK';
    }

    executeActionInternal(chosenAction, activeBattle.playerB.id);
  };

  // Auth: Login
  const login = (usernameOrEmail: string, pass: string): { success: boolean; error?: string } => {
    const trimmed = usernameOrEmail.trim().toLowerCase();
    const found = players.find(
      (p) => p.username.toLowerCase() === trimmed || p.email.toLowerCase() === trimmed
    );

    if (!found || (pass.trim() !== 'password123' && pass.trim() !== 'password' && pass.trim().length < 4)) {
      if (!found) {
        return { success: false, error: '❌ Invalid username or email address.' };
      }
    }

    const targetUser = found || players[0];
    setCurrentUser(targetUser);
    setCurrentScreen('DASHBOARD');
    addSqlLog('SELECT', `SELECT * FROM auth_user WHERE username = '${targetUser.username}'; -- 200 OK JWT Token issued`, 0.9);
    return { success: true };
  };

  // Auth: Register
  const register = (username: string, email: string, pass: string): { success: boolean; error?: string } => {
    if (!username.trim() || !email.trim()) {
      return { success: false, error: '❌ All fields are required.' };
    }
    if (players.some((p) => p.username.toLowerCase() === username.trim().toLowerCase())) {
      return { success: false, error: '❌ Username already taken. Please choose another.' };
    }

    const newId = players.length + 1;
    const newPlayer: Player = {
      id: newId,
      username: username.trim(),
      email: email.trim(),
      elo_rating: 1000,
      level: 1,
      experience: 0,
      coins: 100,
      role: 'PLAYER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      created_at: new Date().toISOString(),
      selectedHeroId: 'BLAZE',
      winStreak: 0,
      bestStreak: 0,
      equippedTitle: '🔥 WINNER',
      equippedFrame: 'Cyber Gold',
      unlockedTitles: ['🔥 WINNER'],
      unlockedFrames: ['Cyber Gold'],
      dailyMissions: INITIAL_DAILY_MISSIONS,
      missionsRewardClaimed: false,
      stats: {
        id: newId,
        player_id: newId,
        matches_played: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        deaths: 0,
        win_rate: 0,
        kd_ratio: 0,
      },
      inventory: [
        {
          id: 201,
          item_name: 'Iron Recruit Blade',
          category: 'WEAPON',
          rarity: 'COMMON',
          quantity: 1,
          acquired_at: new Date().toISOString(),
        },
      ],
      achievements: [],
    };

    setPlayers((prev) => [...prev, newPlayer]);
    setCurrentUser(newPlayer);
    setCurrentScreen('DASHBOARD');

    addSqlLog(
      'INSERT',
      `INSERT INTO players (username, email, elo_rating, level, coins) VALUES ('${newPlayer.username}', '${newPlayer.email}', 1000, 1, 100);`,
      1.4
    );
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentScreen('LANDING');
    addSqlLog('TRANSACTION', 'POST /api/auth/logout/ -> JWT token revoked & blacklisted.', 0.7);
  };

  // Daily Reward claim
  const claimDailyReward = () => {
    if (dailyRewardClaimed || !currentUser) {
      return { success: false, message: 'Daily reward already claimed today!', coinsAdded: 0 };
    }

    const coinsToAdd = 100;
    setDailyRewardClaimed(true);
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, coins: p.coins + coinsToAdd } : p))
    );
    setCurrentUser((prev) => (prev ? { ...prev, coins: prev.coins + coinsToAdd } : prev));

    addSqlLog(
      'UPDATE',
      `UPDATE players SET coins = coins + 100 WHERE id = ${currentUser.id}; -- Daily reward claimed`,
      1.0
    );

    return {
      success: true,
      message: '🎁 Claimed +100 Coins! Come back tomorrow for more.',
      coinsAdded: coinsToAdd,
    };
  };

  // Daily Missions claim
  const claimMissionsReward = () => {
    if (!currentUser || currentUser.missionsRewardClaimed) {
      return { success: false, message: 'Mission reward already claimed or incomplete.', coinsAdded: 0 };
    }

    const allDone = currentUser.dailyMissions.every((m) => m.done);
    if (!allDone) {
      return { success: false, message: 'Complete all 4 missions to claim reward!', coinsAdded: 0 };
    }

    const coinsToAdd = 250;
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, coins: p.coins + coinsToAdd, missionsRewardClaimed: true } : p))
    );
    setCurrentUser((prev) => (prev ? { ...prev, coins: prev.coins + coinsToAdd, missionsRewardClaimed: true } : prev));

    return {
      success: true,
      message: '🎁 Claimed +250 Coins for completing Daily Missions!',
      coinsAdded: coinsToAdd,
    };
  };

  // Matchmaking: Start
  const startMatchmaking = (preferredOpponentId?: number, isLocal2P: boolean = false) => {
    if (!currentUser) return;

    setIsLocalTwoPlayer(isLocal2P);
    setIsMultiplayerTabActive(false);
    setSearchingOpponent(true);
    setFoundOpponent(null);
    setCurrentScreen('MATCHMAKING');

    const minElo = Math.max(800, currentUser.elo_rating - 100);
    const maxElo = currentUser.elo_rating + 100;
    setMatchSearchEloMin(minElo);
    setMatchSearchEloMax(maxElo);

    addSqlLog(
      'INSERT',
      `INSERT INTO matchmaking_queue (player_id, elo_rating, current_range) VALUES (${currentUser.id}, ${currentUser.elo_rating}, 100);`,
      1.1
    );

    // If local 2P or preferred opponent specified, pair immediately
    if (preferredOpponentId || isLocal2P) {
      const opp = players.find((p) => p.id === preferredOpponentId) || players[1];
      setTimeout(() => {
        setFoundOpponent(opp);
        setSearchingOpponent(false);
      }, 700);
      return;
    }

    // Broadcast search query to other open browser tabs
    channelRef.current?.postMessage({
      type: 'QUEUE_SEARCH',
      senderTabId: tabId,
      payload: { tabId, player: currentUser, heroId: selectedHeroId },
    });

    // Auto matchmaking search with range expansion and simulated bot fallback
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      const candidates = players.filter((p) => p.id !== currentUser.id);
      let closest = candidates[0];
      let minDiff = Infinity;
      for (const cand of candidates) {
        const diff = Math.abs(cand.elo_rating - currentUser.elo_rating);
        if (diff < minDiff) {
          minDiff = diff;
          closest = cand;
        }
      }

      setFoundOpponent(closest || INITIAL_PLAYERS[1]);
      setSearchingOpponent(false);
      setIsMultiplayerTabActive(false);
      addSqlLog(
        'LOCK',
        `SELECT * FROM matchmaking_queue WHERE player_id = ${closest.id} FOR UPDATE; -- Opponent locked`,
        1.5
      );
    }, 2200);
  };

  const cancelMatchmaking = () => {
    clearTimeout(searchTimeoutRef.current);
    setSearchingOpponent(false);
    setFoundOpponent(null);
    setIsMultiplayerTabActive(false);
    setCurrentScreen('DASHBOARD');
    channelRef.current?.postMessage({
      type: 'CANCEL_MATCH',
      senderTabId: tabId,
    });
  };

  // Accept match and enter actual battle arena
  const acceptMatchAndEnterArena = () => {
    if (!currentUser || !foundOpponent) return;

    const newSessionId = 100 + gameSessions.length + 1;
    const heroA = HEROES[currentUser.selectedHeroId || 'BLAZE'];
    const heroB = HEROES[foundOpponent.selectedHeroId || 'SHADOW'];

    if (isMultiplayerTabActive) {
      channelRef.current?.postMessage({
        type: 'ENTER_ARENA',
        senderTabId: tabId,
        payload: {
          sessionId: newSessionId,
          mode: battleMode,
          playerA: currentUser,
          playerB: foundOpponent,
          heroAId: currentUser.selectedHeroId || 'BLAZE',
          heroBId: foundOpponent.selectedHeroId || 'SHADOW',
        },
      });
    }

    const initialBattle: ActiveBattleState = {
      sessionId: newSessionId,
      mode: battleMode,
      playerA: currentUser,
      playerB: foundOpponent,
      heroA,
      heroB,
      hpA: 100,
      hpB: 100,
      energyA: 1, // Start with 1 Energy
      energyB: 1,
      isDefendingA: false,
      isDefendingB: false,
      titanShieldTurnsA: 0,
      titanShieldTurnsB: 0,
      comboCountA: 1,
      comboCountB: 1,
      healsRemainingA: 2,
      healsRemainingB: 2,
      currentTurnPlayerId: currentUser.id,
      turnTimeLeft: 15,
      roundNumber: 1,
      battleLogs: [
        {
          id: 'log-start-1',
          timestamp: new Date().toLocaleTimeString(),
          action: 'SYSTEM',
          actor: 'ARENAX',
          message: `⚔️ Battle initialized! [${heroA.name}] ${currentUser.username} (${currentUser.elo_rating} ELO) VS [${heroB.name}] ${foundOpponent.username} (${foundOpponent.elo_rating} ELO).`,
        },
        {
          id: 'log-start-2',
          timestamp: new Date().toLocaleTimeString(),
          action: 'SYSTEM',
          actor: 'ARENAX',
          message: `🟢 ${currentUser.username} wins coin toss! Choose: ⚔️ HIT (+1 Energy), 🔥 SPECIAL (-3 Energy), 🛡️ BLOCK, or 💚 HEAL.`,
        },
      ],
      status: 'ACTIVE',
      winnerId: null,
      isTwoPlayerLocal: isLocalTwoPlayer,
      isMultiplayerTab: isMultiplayerTabActive,
      damageDealtA: 0,
      damageDealtB: 0,
      critsLandedA: 0,
      critsLandedB: 0,
      defensesUsedA: 0,
      defensesUsedB: 0,
      specialsUsedA: 0,
      specialsUsedB: 0,
    };

    setActiveBattle(initialBattle);
    setCurrentScreen('BATTLE');

    addSqlLog(
      'INSERT',
      `INSERT INTO game_sessions (id, status, player_a_id, player_b_id, hero_a, hero_b) VALUES (${newSessionId}, 'ACTIVE', ${currentUser.id}, ${foundOpponent.id}, '${heroA.id}', '${heroB.id}');`,
      1.5
    );
  };

  // Playable Battle Action execution with Combos, Crits, Energy & Hero Abilities
  const executeBattleAction = (action: 'ATTACK' | 'DEFEND' | 'HEAL' | 'SPECIAL') => {
    if (!activeBattle || activeBattle.status !== 'ACTIVE') return;
    const actorId = activeBattle.currentTurnPlayerId;
    if (activeBattle.isMultiplayerTab && channelRef.current) {
      channelRef.current.postMessage({
        type: 'BATTLE_ACTION',
        senderTabId: tabId,
        payload: {
          sessionId: activeBattle.sessionId,
          action,
          actorId,
        },
      });
    }
    executeActionInternal(action, actorId);
  };

  const executeActionInternal = (
    action: 'ATTACK' | 'DEFEND' | 'HEAL' | 'SPECIAL',
    actorId: number
  ) => {
    setActiveBattle((prev) => {
      if (!prev || prev.status !== 'ACTIVE') return prev;

      const isActorA = actorId === prev.playerA.id;
      const actor = isActorA ? prev.playerA : prev.playerB;
      const target = isActorA ? prev.playerB : prev.playerA;
      const actorHero = isActorA ? prev.heroA : prev.heroB;
      const targetHero = isActorA ? prev.heroB : prev.heroA;

      let newHpA = prev.hpA;
      let newHpB = prev.hpB;
      let newEnergyA = prev.energyA;
      let newEnergyB = prev.energyB;
      let newDefendingA = isActorA ? false : prev.isDefendingA;
      let newDefendingB = isActorA ? prev.isDefendingB : false;
      let newTitanTurnsA = isActorA ? prev.titanShieldTurnsA : prev.titanShieldTurnsA;
      let newTitanTurnsB = isActorA ? prev.titanShieldTurnsB : prev.titanShieldTurnsB;
      let newComboA = prev.comboCountA;
      let newComboB = prev.comboCountB;
      let newHealsA = prev.healsRemainingA;
      let newHealsB = prev.healsRemainingB;

      let damageA = prev.damageDealtA;
      let damageB = prev.damageDealtB;
      let critsA = prev.critsLandedA;
      let critsB = prev.critsLandedB;
      let defensesA = prev.defensesUsedA;
      let defensesB = prev.defensesUsedB;
      let specialsA = prev.specialsUsedA;
      let specialsB = prev.specialsUsedB;

      const newLogs = [...prev.battleLogs];
      const timeStr = new Date().toLocaleTimeString();

      if (action === 'ATTACK') {
        const isTargetDefending = isActorA ? prev.isDefendingB : prev.isDefendingA;
        const targetTitanShield = isActorA ? prev.titanShieldTurnsB : prev.titanShieldTurnsA;

        // Base damage ~20-25
        const baseDmg = actorHero.baseAtk + Math.floor(Math.random() * 5) - 2;

        // Combo multiplier (Hit 1: 1.0x, Hit 2: 1.1x, Hit 3: 1.2x, Hit 4: 1.3x)
        const currentCombo = isActorA ? prev.comboCountA : prev.comboCountB;
        const comboMultiplier = 1.0 + Math.min(3, currentCombo - 1) * 0.1;

        // Critical hit calculation
        const isCrit = Math.random() < actorHero.critChance;
        const critMultiplier = isCrit ? 1.75 : 1.0;

        let totalDmg = Math.round(baseDmg * comboMultiplier * critMultiplier);

        // Defensive reduction
        if (isTargetDefending) {
          totalDmg = Math.round(totalDmg * 0.5); // 50% block
          if (isActorA) newDefendingB = false;
          else newDefendingA = false;
        } else if (targetTitanShield > 0) {
          totalDmg = Math.round(totalDmg * 0.4); // 60% Titan reduction
          if (isActorA) newTitanTurnsB = Math.max(0, targetTitanShield - 1);
          else newTitanTurnsA = Math.max(0, targetTitanShield - 1);
        }

        totalDmg = Math.max(5, totalDmg);

        if (isActorA) {
          newHpB = Math.max(0, newHpB - totalDmg);
          newEnergyA = Math.min(3, newEnergyA + 1); // +1 Energy
          newComboA = newComboA + 1; // Advance combo
          damageA += totalDmg;
          if (isCrit) critsA += 1;
        } else {
          newHpA = Math.max(0, newHpA - totalDmg);
          newEnergyB = Math.min(3, newEnergyB + 1);
          newComboB = newComboB + 1;
          damageB += totalDmg;
          if (isCrit) critsB += 1;
        }

        const critText = isCrit ? '💥 CRITICAL HIT! ' : '';
        const comboText = currentCombo > 1 ? ` (🔥 COMBO x${currentCombo})` : '';
        const blockText = isTargetDefending ? ' [SHIELD ABSORBED 50%]' : targetTitanShield > 0 ? ' [IRON WALL -60%]' : '';

        newLogs.unshift({
          id: 'log-' + Date.now(),
          timestamp: timeStr,
          actor: actor.username,
          action: 'ATTACK',
          damage: totalDmg,
          isCritical: isCrit,
          comboLevel: currentCombo,
          message: `⚔️ ${actor.username} attacked ${target.username}! ${critText}-${totalDmg} HP${comboText}${blockText}`,
        });

        addSqlLog('UPDATE', `POST /api/games/${prev.sessionId}/attack/ -> -${totalDmg} HP (Crit: ${isCrit})`, 1.1);
      } else if (action === 'DEFEND') {
        if (isActorA) {
          newDefendingA = true;
          newComboB = 1; // Breaks opponent combo!
          defensesA += 1;
        } else {
          newDefendingB = true;
          newComboA = 1;
          defensesB += 1;
        }

        newLogs.unshift({
          id: 'log-' + Date.now(),
          timestamp: timeStr,
          actor: actor.username,
          action: 'DEFEND',
          message: `🛡️ ${actor.username} raised block! Incoming damage reduced by 50% & broke ${target.username}'s combo!`,
        });

        addSqlLog('UPDATE', `POST /api/games/${prev.sessionId}/defend/ -> Guard active, opponent combo reset`, 0.8);
      } else if (action === 'HEAL') {
        const currentHeals = isActorA ? prev.healsRemainingA : prev.healsRemainingB;
        if (currentHeals <= 0) return prev;

        const healAmount = 20;
        if (isActorA) {
          newHpA = Math.min(100, newHpA + healAmount);
          newHealsA -= 1;
        } else {
          newHpB = Math.min(100, newHpB + healAmount);
          newHealsB -= 1;
        }

        newLogs.unshift({
          id: 'log-' + Date.now(),
          timestamp: timeStr,
          actor: actor.username,
          action: 'HEAL',
          healed: healAmount,
          message: `💚 ${actor.username} healed +${healAmount} HP! (Remaining heals: ${isActorA ? newHealsA : newHealsB}/2)`,
        });

        addSqlLog('UPDATE', `POST /api/games/${prev.sessionId}/heal/ -> +20 HP`, 0.9);
      } else if (action === 'SPECIAL') {
        // Special Ability execution (-3 Energy)
        const currentEnergy = isActorA ? prev.energyA : prev.energyB;
        if (currentEnergy < 3) return prev;

        if (isActorA) {
          newEnergyA -= 3;
          specialsA += 1;
        } else {
          newEnergyB -= 3;
          specialsB += 1;
        }

        // Hero-specific special ability mechanics
        if (actorHero.id === 'BLAZE') {
          // Inferno Strike: 38-48 heavy damage
          let specDmg = Math.floor(Math.random() * 11) + 38;
          if (isActorA ? prev.isDefendingB : prev.isDefendingA) {
            specDmg = Math.round(specDmg * 0.5);
          }
          if (isActorA) {
            newHpB = Math.max(0, newHpB - specDmg);
            damageA += specDmg;
          } else {
            newHpA = Math.max(0, newHpA - specDmg);
            damageB += specDmg;
          }

          newLogs.unshift({
            id: 'log-' + Date.now(),
            timestamp: timeStr,
            actor: actor.username,
            action: 'SPECIAL',
            damage: specDmg,
            message: `🔥 ${actor.username} unleashed INFERNO STRIKE! Scorching explosion dealt -${specDmg} HP!`,
          });
        } else if (actorHero.id === 'VOLT') {
          // Chain Shock: 32-38 damage + refunds +1 Energy!
          let specDmg = Math.floor(Math.random() * 7) + 32;
          if (isActorA) {
            newHpB = Math.max(0, newHpB - specDmg);
            newEnergyA = Math.min(3, newEnergyA + 1); // Refund
            damageA += specDmg;
          } else {
            newHpA = Math.max(0, newHpA - specDmg);
            newEnergyB = Math.min(3, newEnergyB + 1);
            damageB += specDmg;
          }

          newLogs.unshift({
            id: 'log-' + Date.now(),
            timestamp: timeStr,
            actor: actor.username,
            action: 'SPECIAL',
            damage: specDmg,
            message: `⚡ ${actor.username} discharged CHAIN SHOCK! Electric surge dealt -${specDmg} HP & refunded +1 Energy!`,
          });
        } else if (actorHero.id === 'TITAN') {
          // Iron Wall: Next 2 attacks take 60% less damage + 15 barrier burst damage
          const burstDmg = 16;
          if (isActorA) {
            newTitanTurnsA = 2;
            newHpB = Math.max(0, newHpB - burstDmg);
            damageA += burstDmg;
          } else {
            newTitanTurnsB = 2;
            newHpA = Math.max(0, newHpA - burstDmg);
            damageB += burstDmg;
          }

          newLogs.unshift({
            id: 'log-' + Date.now(),
            timestamp: timeStr,
            actor: actor.username,
            action: 'SPECIAL',
            damage: burstDmg,
            message: `🛡️ ${actor.username} activated IRON WALL! Next 2 attacks take 60% less damage! (-${burstDmg} barrier burst)`,
          });
        } else if (actorHero.id === 'SHADOW') {
          // Assassin Strike: Guaranteed Critical 44-54 damage!
          const specDmg = Math.floor(Math.random() * 11) + 44;
          if (isActorA) {
            newHpB = Math.max(0, newHpB - specDmg);
            damageA += specDmg;
            critsA += 1;
          } else {
            newHpA = Math.max(0, newHpA - specDmg);
            damageB += specDmg;
            critsB += 1;
          }

          newLogs.unshift({
            id: 'log-' + Date.now(),
            timestamp: timeStr,
            actor: actor.username,
            action: 'SPECIAL',
            damage: specDmg,
            isCritical: true,
            message: `🌑 ${actor.username} struck with ASSASSIN STRIKE! 💥 Guaranteed Critical strike dealt -${specDmg} HP!`,
          });
        }

        addSqlLog('UPDATE', `POST /api/games/${prev.sessionId}/special/ -> Hero ability executed`, 1.3);
      }

      // Check for Victory / Defeat (0 HP)
      if (newHpA === 0 || newHpB === 0) {
        const winnerId = newHpA > 0 ? prev.playerA.id : prev.playerB.id;
        const winner = winnerId === prev.playerA.id ? prev.playerA : prev.playerB;
        const isPlayerAWin = winnerId === prev.playerA.id;

        // ELO delta based on mode
        let eloDeltaA = 0;
        let eloDeltaB = 0;
        if (prev.mode === 'RANKED') {
          const eloCalc = getFullEloDetails(prev.playerA.elo_rating, prev.playerB.elo_rating, 32);
          eloDeltaA = isPlayerAWin ? eloCalc.deltaAIfWin : eloCalc.deltaAIfLoss;
          eloDeltaB = isPlayerAWin ? eloCalc.deltaBIfLoss : eloCalc.deltaBIfWin;
        } else {
          eloDeltaA = isPlayerAWin ? 6 : 0; // Casual minimal delta
          eloDeltaB = isPlayerAWin ? 0 : 0;
        }

        const xpGain = isPlayerAWin ? 100 : 25;
        const coinsGain = isPlayerAWin ? 50 : 0;

        newLogs.unshift({
          id: 'log-end-' + Date.now(),
          timestamp: timeStr,
          actor: 'ARENAX',
          action: 'SYSTEM',
          message: `🏆 FINAL STRIKE! ${winner.username} emerges triumphant!`,
        });

        // Finalize match in database
        setTimeout(() => {
          finalizeMatchInDatabase(
            prev.sessionId,
            prev.playerA,
            prev.playerB,
            winnerId,
            eloDeltaA,
            eloDeltaB,
            xpGain,
            coinsGain,
            critsA,
            specialsA
          );
        }, 100);

        return {
          ...prev,
          hpA: newHpA,
          hpB: newHpB,
          energyA: newEnergyA,
          energyB: newEnergyB,
          isDefendingA: newDefendingA,
          isDefendingB: newDefendingB,
          titanShieldTurnsA: newTitanTurnsA,
          titanShieldTurnsB: newTitanTurnsB,
          comboCountA: newComboA,
          comboCountB: newComboB,
          battleLogs: newLogs,
          status: isPlayerAWin ? 'VICTORY' : 'DEFEAT',
          winnerId,
          resultCalculated: true,
          eloDeltaA,
          eloDeltaB,
          xpGain,
          coinsGain,
          damageDealtA: damageA,
          damageDealtB: damageB,
          critsLandedA: critsA,
          critsLandedB: critsB,
          defensesUsedA: defensesA,
          defensesUsedB: defensesB,
          specialsUsedA: specialsA,
          specialsUsedB: specialsB,
        };
      }

      // Switch turn
      const nextTurnId = isActorA ? prev.playerB.id : prev.playerA.id;
      return {
        ...prev,
        hpA: newHpA,
        hpB: newHpB,
        energyA: newEnergyA,
        energyB: newEnergyB,
        isDefendingA: newDefendingA,
        isDefendingB: newDefendingB,
        titanShieldTurnsA: newTitanTurnsA,
        titanShieldTurnsB: newTitanTurnsB,
        comboCountA: newComboA,
        comboCountB: newComboB,
        healsRemainingA: newHealsA,
        healsRemainingB: newHealsB,
        currentTurnPlayerId: nextTurnId,
        turnTimeLeft: 15,
        roundNumber: isActorA ? prev.roundNumber : prev.roundNumber + 1,
        battleLogs: newLogs,
        damageDealtA: damageA,
        damageDealtB: damageB,
        critsLandedA: critsA,
        critsLandedB: critsB,
        defensesUsedA: defensesA,
        defensesUsedB: defensesB,
        specialsUsedA: specialsA,
        specialsUsedB: specialsB,
      };
    });
  };

  // Finalize match in database, update Player/Stats/Missions/Streak
  const finalizeMatchInDatabase = (
    sessId: number,
    pA: Player,
    pB: Player,
    winnerId: number,
    deltaA: number,
    deltaB: number,
    xpGain: number,
    coinsGain: number,
    critsA: number,
    specialsA: number
  ) => {
    addSqlLog(
      'TRANSACTION',
      'BEGIN TRANSACTION; -- [POST /api/games/{id}/result/] atomic commit',
      0.3
    );

    const newEloA = pA.elo_rating + deltaA;
    const newEloB = pB.elo_rating + deltaB;
    const isWinA = winnerId === pA.id;

    // Win Streak calculations
    const newStreakA = isWinA ? pA.winStreak + 1 : 0;
    const newBestStreakA = Math.max(pA.bestStreak || 0, newStreakA);

    // Level up calculation (every 1000 XP)
    const newXpA = pA.experience + xpGain;
    const newLevelA = Math.floor(newXpA / 1000) + 1;

    // Daily missions update
    const updatedMissions = pA.dailyMissions.map((m) => {
      if (m.id === 'm-1') return { ...m, current: 1, done: true };
      if (m.id === 'm-2') {
        const next = m.current + (isWinA ? 1 : 0);
        return { ...m, current: next, done: next >= m.target };
      }
      if (m.id === 'm-3') {
        const next = m.current + critsA;
        return { ...m, current: next, done: next >= m.target };
      }
      if (m.id === 'm-4') {
        const next = m.current + specialsA;
        return { ...m, current: next, done: next >= m.target };
      }
      return m;
    });

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === pA.id) {
          const newWins = p.stats.wins + (isWinA ? 1 : 0);
          const newLosses = p.stats.losses + (!isWinA ? 1 : 0);
          const newMatches = p.stats.matches_played + 1;

          return {
            ...p,
            elo_rating: newEloA,
            experience: newXpA,
            level: newLevelA,
            coins: p.coins + coinsGain + (newStreakA === 5 ? 250 : 0),
            winStreak: newStreakA,
            bestStreak: newBestStreakA,
            dailyMissions: updatedMissions,
            stats: {
              ...p.stats,
              matches_played: newMatches,
              wins: newWins,
              losses: newLosses,
              kills: p.stats.kills + (isWinA ? 1 : 0),
              deaths: p.stats.deaths + (!isWinA ? 1 : 0),
              win_rate: Number(((newWins / newMatches) * 100).toFixed(1)),
            },
          };
        } else if (p.id === pB.id) {
          const newWins = p.stats.wins + (!isWinA ? 1 : 0);
          const newLosses = p.stats.losses + (isWinA ? 1 : 0);
          const newMatches = p.stats.matches_played + 1;

          return {
            ...p,
            elo_rating: newEloB,
            experience: p.experience + (!isWinA ? 100 : 25),
            coins: p.coins + (!isWinA ? 50 : 0),
            winStreak: !isWinA ? p.winStreak + 1 : 0,
            stats: {
              ...p.stats,
              matches_played: newMatches,
              wins: newWins,
              losses: newLosses,
              win_rate: Number(((newWins / newMatches) * 100).toFixed(1)),
            },
          };
        }
        return p;
      })
    );

    // Update currentUser state
    setCurrentUser((prev) => {
      if (!prev || prev.id !== pA.id) return prev;
      const newWins = prev.stats.wins + (isWinA ? 1 : 0);
      const newLosses = prev.stats.losses + (!isWinA ? 1 : 0);
      const newMatches = prev.stats.matches_played + 1;

      return {
        ...prev,
        elo_rating: newEloA,
        experience: newXpA,
        level: newLevelA,
        coins: prev.coins + coinsGain + (newStreakA === 5 ? 250 : 0),
        winStreak: newStreakA,
        bestStreak: newBestStreakA,
        dailyMissions: updatedMissions,
        stats: {
          ...prev.stats,
          matches_played: newMatches,
          wins: newWins,
          losses: newLosses,
          kills: prev.stats.kills + (isWinA ? 1 : 0),
          deaths: prev.stats.deaths + (!isWinA ? 1 : 0),
          win_rate: Number(((newWins / newMatches) * 100).toFixed(1)),
        },
      };
    });

    // Add to Match History
    const newRecord: MatchHistoryRecord = {
      id: 10580 + matchHistory.length + 1,
      game_session_id: sessId,
      player_id: pA.id,
      opponent_id: pB.id,
      opponent_username: pB.username,
      result: isWinA ? 'WIN' : 'LOSS',
      elo_before: pA.elo_rating,
      elo_after: newEloA,
      elo_delta: deltaA,
      kills: isWinA ? 1 : 0,
      deaths: isWinA ? 0 : 1,
      played_at: new Date().toISOString(),
    };

    setMatchHistory((prev) => [newRecord, ...prev]);

    addSqlLog(
      'UPDATE',
      `UPDATE players SET elo_rating = ${newEloA}, experience = ${newXpA}, win_streak = ${newStreakA} WHERE id = ${pA.id};`,
      1.3
    );
    addSqlLog('TRANSACTION', 'COMMIT; -- Atomic transaction completed', 0.6, 'COMMITTED');
  };

  const exitBattleToDashboard = () => {
    setActiveBattle(null);
    setFoundOpponent(null);
    setCurrentScreen('DASHBOARD');
  };

  const setActivePlayerId = (id: number) => {
    const p = players.find((pl) => pl.id === id);
    if (p) setCurrentUser(p);
  };

  const switchAccount = (playerId: number) => {
    const p = players.find((pl) => pl.id === playerId);
    if (p) {
      setCurrentUser(p);
      addSqlLog(
        'SELECT',
        `SELECT * FROM auth_user WHERE id = ${p.id}; -- Switched active gladiator to ${p.username} (${p.elo_rating} ELO)`,
        0.6
      );
    }
  };

  const enqueuePlayer = (playerId: number) => {
    const p = players.find((pl) => pl.id === playerId);
    if (!p) return { success: false, message: 'Player not found' };
    const entry: QueueEntry = {
      id: 'q-' + Date.now().toString().slice(-4),
      player_id: p.id,
      username: p.username,
      elo_rating: p.elo_rating,
      level: p.level,
      avatar: p.avatar,
      joined_at: Date.now(),
      current_range: 100,
      seconds_in_queue: 0,
      status: 'WAITING',
    };
    setQueue((prev) => [entry, ...prev]);
    return { success: true, message: 'Enqueued' };
  };

  const dequeuePlayer = (playerId: number) => {
    setQueue((prev) => prev.filter((q) => q.player_id !== playerId));
  };

  const populateRandomQueue = () => {};
  const runMatchmaker = () => ({ matched: false });

  const completeMatchSession = (
    sessionId: number,
    winnerId: number | null,
    killsA: number,
    killsB: number,
    simulateCrash?: boolean
  ) => {
    if (simulateCrash) {
      addSqlLog('TRANSACTION', 'ROLLBACK; -- Crash simulated', 0.5, 'ROLLBACK');
      return { success: false, error: 'Simulated Crash: Rollback executed.' };
    }
    return { success: true, eloDeltaA: 18, eloDeltaB: -18, unlockedAchievements: ['First Blood'] };
  };

  const createGameSessionManual = (playerAId: number, playerBId: number): GameSession => {
    const pA = players.find((p) => p.id === playerAId) || players[0];
    const pB = players.find((p) => p.id === playerBId) || players[1];
    return {
      id: 100 + gameSessions.length + 1,
      session_token: 'sess-' + Math.random().toString(36).substring(2, 8),
      status: 'ACTIVE',
      map_name: 'Cyber_Colosseum_01',
      player_a_id: pA.id,
      player_b_id: pB.id,
      player_a_username: pA.username,
      player_b_username: pB.username,
      player_a_elo_before: pA.elo_rating,
      player_b_elo_before: pB.elo_rating,
      started_at: new Date().toISOString(),
    };
  };

  const resetDatabase = () => {
    setPlayers(INITIAL_PLAYERS);
    setCurrentUser(INITIAL_PLAYERS[0]);
    setQueue([]);
    setDailyRewardClaimed(false);
    clearSqlLogs();
  };

  return (
    <ArenaContext.Provider
      value={{
        players,
        activePlayer,
        currentUser,
        isLoggedIn: currentUser !== null,
        currentScreen,
        setCurrentScreen,
        login,
        register,
        logout,
        claimDailyReward,
        dailyRewardClaimed,
        claimMissionsReward,

        selectedHeroId,
        setSelectedHeroId,
        battleMode,
        setBattleMode,
        equipTitle,
        equipFrame,

        searchingOpponent,
        foundOpponent,
        matchSearchEloMin,
        matchSearchEloMax,
        startMatchmaking,
        cancelMatchmaking,
        acceptMatchAndEnterArena,
        activeBattle,
        executeBattleAction,
        exitBattleToDashboard,
        switchAccount,
        isMultiplayerTabActive,

        jwtAccessToken,
        jwtRefreshToken,
        queue,
        gameSessions,
        matchHistory,
        sqlLogs,
        enqueuePlayer,
        dequeuePlayer,
        populateRandomQueue,
        runMatchmaker,
        completeMatchSession,
        createGameSessionManual,
        resetDatabase,
        addSqlLog,
        clearSqlLogs,
        setActivePlayerId,
      }}
    >
      {children}
    </ArenaContext.Provider>
  );
};

export const useArena = () => {
  const context = useContext(ArenaContext);
  if (!context) throw new Error('useArena must be used within an ArenaProvider');
  return context;
};
