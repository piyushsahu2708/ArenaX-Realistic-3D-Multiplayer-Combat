import { Hero, HeroId, DailyMission } from '../types/arenax';

export const HEROES: Record<HeroId, Hero> = {
  BLAZE: {
    id: 'BLAZE',
    name: 'Blaze',
    tagline: 'Pyromancer of the Colosseum',
    description: 'High burst damage dealer with explosive offensive capability but lighter armor.',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    elementIcon: '🔥',
    themeColor: 'from-orange-500 to-rose-600',
    baseHp: 100,
    baseAtk: 24,
    baseDefPercent: 0,
    critChance: 0.18,
    specialName: 'Inferno Strike',
    specialDesc: 'Unleashes an incinerating explosion dealing 38-48 heavy damage.',
    specialEnergyCost: 3,
  },
  VOLT: {
    id: 'VOLT',
    name: 'Volt',
    tagline: 'Lightning Kineticist',
    description: 'Balanced warrior with high attack frequency and energy manipulation.',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    elementIcon: '⚡',
    themeColor: 'from-yellow-400 to-amber-600',
    baseHp: 100,
    baseAtk: 22,
    baseDefPercent: 5,
    critChance: 0.22,
    specialName: 'Chain Shock',
    specialDesc: 'Discharges 32-38 voltage damage and instantly refunds +1 Energy.',
    specialEnergyCost: 3,
  },
  TITAN: {
    id: 'TITAN',
    name: 'Titan',
    tagline: 'The Impervious Vanguard',
    description: 'Heavily armored juggernaut capable of absorbing punishing damage with defensive barriers.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    elementIcon: '🛡️',
    themeColor: 'from-blue-500 to-indigo-700',
    baseHp: 100,
    baseAtk: 19,
    baseDefPercent: 15,
    critChance: 0.10,
    specialName: 'Iron Wall',
    specialDesc: 'Deploys a reinforced reactive citadel barrier. Next 2 attacks take 60% less damage.',
    specialEnergyCost: 3,
  },
  SHADOW: {
    id: 'SHADOW',
    name: 'Shadow',
    tagline: 'Apex Void Assassin',
    description: 'High-risk high-reward stalker focused on deadly critical strikes and lethal execution.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    elementIcon: '🌑',
    themeColor: 'from-purple-600 to-violet-950',
    baseHp: 100,
    baseAtk: 21,
    baseDefPercent: 0,
    critChance: 0.38,
    specialName: 'Assassin Strike',
    specialDesc: 'Strikes from the void with guaranteed critical hit dealing 44-54 devastating damage.',
    specialEnergyCost: 3,
  },
};

export interface RankInfo {
  tierName: string;
  division: string;
  fullName: string;
  minElo: number;
  maxElo: number;
  color: string;
  badge: string;
  nextTierName: string;
  eloToNextTier: number;
}

export function getRankInfo(elo: number): RankInfo {
  if (elo >= 2400) {
    return {
      tierName: 'Legend',
      division: '',
      fullName: 'LEGEND',
      minElo: 2400,
      maxElo: 9999,
      color: 'text-amber-300 border-amber-400 bg-amber-950/40',
      badge: '👑',
      nextTierName: 'Apex Champion',
      eloToNextTier: 0,
    };
  } else if (elo >= 2100) {
    return {
      tierName: 'Master',
      division: elo >= 2250 ? 'I' : 'II',
      fullName: `MASTER ${elo >= 2250 ? 'I' : 'II'}`,
      minElo: 2100,
      maxElo: 2399,
      color: 'text-purple-300 border-purple-400 bg-purple-950/40',
      badge: '🔮',
      nextTierName: 'Legend',
      eloToNextTier: 2400 - elo,
    };
  } else if (elo >= 1800) {
    return {
      tierName: 'Diamond',
      division: elo >= 2000 ? 'I' : elo >= 1900 ? 'II' : 'III',
      fullName: `DIAMOND ${elo >= 2000 ? 'I' : elo >= 1900 ? 'II' : 'III'}`,
      minElo: 1800,
      maxElo: 2099,
      color: 'text-cyan-300 border-cyan-400 bg-cyan-950/40',
      badge: '💎',
      nextTierName: 'Master',
      eloToNextTier: 2100 - elo,
    };
  } else if (elo >= 1500) {
    return {
      tierName: 'Platinum',
      division: elo >= 1700 ? 'I' : elo >= 1600 ? 'II' : 'III',
      fullName: `PLATINUM ${elo >= 1700 ? 'I' : elo >= 1600 ? 'II' : 'III'}`,
      minElo: 1500,
      maxElo: 1799,
      color: 'text-emerald-300 border-emerald-400 bg-emerald-950/40',
      badge: '💠',
      nextTierName: 'Diamond',
      eloToNextTier: 1800 - elo,
    };
  } else if (elo >= 1200) {
    const div = elo >= 1400 ? 'I' : elo >= 1300 ? 'II' : 'III';
    const nextElo = elo >= 1400 ? 1500 : elo >= 1300 ? 1400 : 1300;
    const nextName = elo >= 1400 ? 'PLATINUM III' : elo >= 1300 ? 'GOLD I' : 'GOLD II';
    return {
      tierName: 'Gold',
      division: div,
      fullName: `GOLD ${div}`,
      minElo: 1200,
      maxElo: 1499,
      color: 'text-amber-400 border-amber-500 bg-amber-950/40',
      badge: '🏆',
      nextTierName: nextName,
      eloToNextTier: nextElo - elo,
    };
  } else if (elo >= 1000) {
    return {
      tierName: 'Silver',
      division: elo >= 1100 ? 'I' : 'II',
      fullName: `SILVER ${elo >= 1100 ? 'I' : 'II'}`,
      minElo: 1000,
      maxElo: 1199,
      color: 'text-slate-300 border-slate-400 bg-slate-900/60',
      badge: '🥈',
      nextTierName: 'Gold III',
      eloToNextTier: 1200 - elo,
    };
  } else {
    return {
      tierName: 'Bronze',
      division: elo >= 800 ? 'I' : 'II',
      fullName: `BRONZE ${elo >= 800 ? 'I' : 'II'}`,
      minElo: 0,
      maxElo: 999,
      color: 'text-amber-700 border-amber-800 bg-amber-950/30',
      badge: '🥉',
      nextTierName: 'Silver II',
      eloToNextTier: 1000 - elo,
    };
  }
}

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  { id: 'm-1', title: 'Play 1 Match', current: 1, target: 1, done: true },
  { id: 'm-2', title: 'Win 2 Matches', current: 1, target: 2, done: false },
  { id: 'm-3', title: 'Perform 3 Critical Hits', current: 2, target: 3, done: false },
  { id: 'm-4', title: 'Use Special Ability 2 Times', current: 1, target: 2, done: false },
];

export const UNLOCKABLE_TITLES = [
  '👑 CHAMPION',
  '🔥 WINNER',
  '⚡ SPEED DEMON',
  '💀 UNSTOPPABLE',
  '🛡️ IRONCLAD',
];

export const UNLOCKABLE_FRAMES = [
  'Cyber Gold',
  'Neon Cyan',
  'Obsidian Dragon',
  'Prismatic Master',
];
