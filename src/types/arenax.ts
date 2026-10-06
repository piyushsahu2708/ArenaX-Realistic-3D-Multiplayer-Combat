export type Role = 'PLAYER' | 'ADMIN' | 'MODERATOR';

export type HeroId = 'PIYUSH' | 'BLAZE' | 'VOLT' | 'TITAN' | 'SHADOW';

export interface Hero {
  id: HeroId;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  elementIcon: string;
  themeColor: string;
  baseHp: number;
  baseAtk: number;
  baseDefPercent: number;
  critChance: number;
  specialName: string;
  specialDesc: string;
  specialEnergyCost: number;
}

export interface DailyMission {
  id: string;
  title: string;
  current: number;
  target: number;
  done: boolean;
}

export interface Player {
  id: number;
  username: string;
  email: string;
  elo_rating: number;
  level: number;
  experience: number;
  coins: number;
  role: Role;
  avatar: string;
  created_at: string;
  stats: PlayerStats;
  inventory: InventoryItem[];
  achievements: UnlockedAchievement[];
  selectedHeroId: HeroId;
  winStreak: number;
  bestStreak: number;
  equippedTitle: string;
  equippedFrame: string;
  unlockedTitles: string[];
  unlockedFrames: string[];
  dailyMissions: DailyMission[];
  missionsRewardClaimed: boolean;
}

export interface BattleLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'ATTACK' | 'DEFEND' | 'HEAL' | 'SPECIAL' | 'TIMEOUT' | 'SYSTEM';
  message: string;
  damage?: number;
  healed?: number;
  isCritical?: boolean;
  comboLevel?: number;
}

export interface ActiveBattleState {
  sessionId: number;
  mode: 'RANKED' | 'CASUAL';
  playerA: Player;
  playerB: Player;
  heroA: Hero;
  heroB: Hero;
  hpA: number;
  hpB: number;
  energyA: number; // 0 to 3
  energyB: number; // 0 to 3
  isDefendingA: boolean;
  isDefendingB: boolean;
  titanShieldTurnsA: number;
  titanShieldTurnsB: number;
  comboCountA: number;
  comboCountB: number;
  healsRemainingA: number;
  healsRemainingB: number;
  currentTurnPlayerId: number;
  turnTimeLeft: number;
  roundNumber: number;
  battleLogs: BattleLogEntry[];
  status: 'ACTIVE' | 'VICTORY' | 'DEFEAT' | 'DRAW';
  winnerId: number | null;
  resultCalculated?: boolean;
  eloDeltaA?: number;
  eloDeltaB?: number;
  xpGain?: number;
  coinsGain?: number;
  unlockedAchievements?: string[];
  isTwoPlayerLocal?: boolean;
  isMultiplayerTab?: boolean;
  remoteTabId?: string;
  myRole?: 'PLAYER_A' | 'PLAYER_B';
  // Performance stats for Post-Match MVP screen
  damageDealtA: number;
  damageDealtB: number;
  critsLandedA: number;
  critsLandedB: number;
  defensesUsedA: number;
  defensesUsedB: number;
  specialsUsedA: number;
  specialsUsedB: number;
}

export interface PlayerStats {
  id: number;
  player_id: number;
  matches_played: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  win_rate: number;
  kd_ratio: number;
}

export type GameSessionStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED';

export interface GameSession {
  id: number;
  session_token: string;
  status: GameSessionStatus;
  map_name: string;
  player_a_id: number;
  player_b_id: number;
  player_a_username: string;
  player_b_username: string;
  player_a_elo_before: number;
  player_b_elo_before: number;
  player_a_elo_after?: number;
  player_b_elo_after?: number;
  player_a_kills?: number;
  player_b_kills?: number;
  winner_id?: number | null;
  started_at: string;
  ended_at?: string;
  duration_sec?: number;
}

export interface MatchHistoryRecord {
  id: number;
  game_session_id: number;
  player_id: number;
  opponent_id: number;
  opponent_username: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  elo_before: number;
  elo_after: number;
  elo_delta: number;
  kills: number;
  deaths: number;
  played_at: string;
}

export interface InventoryItem {
  id: number;
  item_name: string;
  category: 'WEAPON' | 'SHIELD' | 'SKIN' | 'BADGE' | 'POTION';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  quantity: number;
  acquired_at: string;
}

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  condition: string;
  reward_coins: number;
  reward_xp: number;
  icon: string;
}

export interface UnlockedAchievement {
  achievement_id: number;
  unlocked_at: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  reward_type: 'COINS' | 'XP' | 'SKIN' | 'WEAPON' | 'BADGE';
  value: string;
  claimed: boolean;
  required_level?: number;
}

export interface QueueEntry {
  id: string;
  player_id: number;
  username: string;
  elo_rating: number;
  level: number;
  avatar: string;
  joined_at: number;
  current_range: number; // e.g. 100, 200, 300
  seconds_in_queue: number;
  status: 'WAITING' | 'MATCHED' | 'LOCKED';
  locked_by_thread?: string;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  name: string;
  category: 'Authentication' | 'Player Profile' | 'Matchmaking' | 'Game Sessions' | 'Leaderboard' | 'Rewards' | 'Achievements' | 'Match History';
  description: string;
  requiresAuth: boolean;
  defaultPayload?: Record<string, any>;
  drfView: string;
  drfSerializer: string;
  drfCodeSnippet: string;
}

export interface TransactionStep {
  step_number: number;
  title: string;
  status: 'PENDING' | 'EXECUTING' | 'COMMITTED' | 'ROLLBACK';
  query: string;
  details: string;
}

export interface InterviewTopic {
  id: number;
  category: 'Overview & Architecture' | 'Django & DRF' | 'ELO & Matchmaking' | 'Concurrency & Transactions' | 'MySQL & Performance' | 'Security & Scalability';
  question: string;
  englishSummary: string;
  hinglishExplanation: string;
  codeSnippet?: string;
  interviewTips: string[];
}
