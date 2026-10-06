import { HeroId } from '../types/arenax';

export interface AbilityInfo {
  id: string;
  name: string;
  desc: string;
  icon: string;
  cooldownSec: number;
}

export interface CharacterRosterItem {
  id: HeroId;
  name: string;
  subtitle: string;
  quote: string;
  role: string;
  description: string;
  avatar: string;
  elementIcon: string;
  themeColor: string;
  accentColor: string;
  baseHp: number;
  baseArmor: number;
  speed: number;
  strength: number;
  accuracy: number;
  primaryWeapon: string;
  specialAbilities: AbilityInfo[];
  visualPreset: {
    hairStyle: 'styled_curly' | 'tactical_short' | 'ponytail' | 'buzzcut' | 'bob_white';
    glasses: boolean;
    jacketColor: string;
    vestColor: string;
    accentColor: string;
    pantsColor: string;
    bootsColor: string;
    skinTone: string;
    bodyScale: { x: number; y: number; z: number };
  };
}

export const ROSTER_CHARACTERS: Record<string, CharacterRosterItem> = {
  PIYUSH: {
    id: 'PIYUSH' as any,
    name: 'Piyush',
    subtitle: 'THE STRATEGIC WARRIOR',
    quote: 'Fight for a bigger tomorrow.',
    role: 'Tactical Fighter · Versatile & High Skill',
    description: 'A sharp mind and fearless spirit. Piyush combines speed, precision and strategy to dominate the arena with tactical scanning and deadly marksmanship.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    elementIcon: '⚡',
    themeColor: 'from-cyan-500 to-blue-600',
    accentColor: '#06b6d4',
    baseHp: 100,
    baseArmor: 60,
    speed: 85,
    strength: 75,
    accuracy: 90,
    primaryWeapon: 'Assault Rifle (AR-16)',
    specialAbilities: [
      {
        id: 'tactical_scan',
        name: 'Tactical Scan',
        desc: 'Scans sector and reveals nearby enemy on radar through structures for 6 seconds.',
        icon: '🎯',
        cooldownSec: 15,
      },
      {
        id: 'adrenaline_dash',
        name: 'Adrenaline Dash',
        desc: 'High-speed forward propulsion burst to reposition or evade enemy crosshairs.',
        icon: '🏃',
        cooldownSec: 10,
      },
      {
        id: 'shield_boost',
        name: 'Shield Boost',
        desc: 'Instantly overcharges armor barrier by +40 points.',
        icon: '🛡️',
        cooldownSec: 20,
      },
      {
        id: 'precision_shot',
        name: 'Precision Shot',
        desc: 'Locks weapon optics, guaranteeing 2.2x lethal critical damage on the next shot.',
        icon: '💥',
        cooldownSec: 18,
      },
    ],
    visualPreset: {
      hairStyle: 'styled_curly',
      glasses: true,
      jacketColor: '#181b22',
      vestColor: '#1e2430',
      accentColor: '#ef4444',
      pantsColor: '#13161c',
      bootsColor: '#0f1115',
      skinTone: '#e0ac88',
      bodyScale: { x: 1.0, y: 1.0, z: 1.0 },
    },
  },

  BLAZE: {
    id: 'BLAZE',
    name: 'Blaze',
    subtitle: 'BALANCED FIGHTER',
    quote: 'Fire clears the path forward.',
    role: 'Frontline Assault · Balanced',
    description: 'Veteran colosseum gladiator. Excels in direct fire exchanges, sustained offensive pressure, and versatile mid-range combat with AR-16.',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
    elementIcon: '🔥',
    themeColor: 'from-orange-500 to-rose-600',
    accentColor: '#f97316',
    baseHp: 100,
    baseArmor: 50,
    speed: 70,
    strength: 70,
    accuracy: 70,
    primaryWeapon: 'Assault Rifle (AR-16)',
    specialAbilities: [
      {
        id: 'inferno_strike',
        name: 'Inferno Burst',
        desc: 'Overheats weapon barrel, firing high-velocity incendiary rounds with explosive area damage.',
        icon: '🔥',
        cooldownSec: 14,
      },
      {
        id: 'adrenaline_dash',
        name: 'Adrenaline Dash',
        desc: 'Quick forward combat slide under enemy fire.',
        icon: '🏃',
        cooldownSec: 10,
      },
    ],
    visualPreset: {
      hairStyle: 'tactical_short',
      glasses: false,
      jacketColor: '#201818',
      vestColor: '#2d1f1f',
      accentColor: '#dc2626',
      pantsColor: '#1a1818',
      bootsColor: '#111010',
      skinTone: '#d49b78',
      bodyScale: { x: 1.02, y: 1.02, z: 1.02 },
    },
  },

  GHOST: {
    id: 'GHOST' as any,
    name: 'Ghost',
    subtitle: 'FAST & AGILE',
    quote: 'Seen only in the crosshairs.',
    role: 'Flanker & Scout · Ultra-Fast',
    description: 'Stealth operative with lightning reflexes. High sprint mobility and surgical SMG fire allows Ghost to out-maneuver any heavier target.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    elementIcon: '⚡',
    themeColor: 'from-emerald-500 to-teal-700',
    accentColor: '#10b981',
    baseHp: 90,
    baseArmor: 40,
    speed: 90,
    strength: 60,
    accuracy: 85,
    primaryWeapon: 'SMG (Volt)',
    specialAbilities: [
      {
        id: 'smoke_screen',
        name: 'Smoke Evasion',
        desc: 'Deploys a dense tactical smoke screen breaking enemy visual lock and speeding up movement.',
        icon: '💨',
        cooldownSec: 12,
      },
      {
        id: 'precision_shot',
        name: 'Precision Shot',
        desc: 'Pinpoint laser targeting dealing devastating critical damage.',
        icon: '🎯',
        cooldownSec: 16,
      },
    ],
    visualPreset: {
      hairStyle: 'ponytail',
      glasses: false,
      jacketColor: '#111820',
      vestColor: '#1c242c',
      accentColor: '#059669',
      pantsColor: '#11151a',
      bootsColor: '#0c0e12',
      skinTone: '#eed4c2',
      bodyScale: { x: 0.94, y: 0.98, z: 0.94 },
    },
  },

  TITAN: {
    id: 'TITAN',
    name: 'Titan',
    subtitle: 'HEAVY & STRONG',
    quote: 'None shall breach the line.',
    role: 'Juggernaut Vanguard · Heavy Armor',
    description: 'Massively armored combat veteran with 130 HP and heavy ballistic plating. Punishes aggressive opponents with devastating close-range shotgun blasts and kinetic barrier walls.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    elementIcon: '🛡️',
    themeColor: 'from-blue-600 to-indigo-800',
    accentColor: '#3b82f6',
    baseHp: 130,
    baseArmor: 70,
    speed: 50,
    strength: 90,
    accuracy: 60,
    primaryWeapon: 'Shotgun (Bull)',
    specialAbilities: [
      {
        id: 'iron_wall',
        name: 'Iron Wall',
        desc: 'Projects a front-facing kinetic riot barrier absorbing 65% of all incoming ballistic damage.',
        icon: '🛡️',
        cooldownSec: 18,
      },
      {
        id: 'ground_slam',
        name: 'Kinetic Slam',
        desc: 'Heavy physical shockwave knocking back nearby rivals and dealing 40 blunt damage.',
        icon: '💥',
        cooldownSec: 14,
      },
    ],
    visualPreset: {
      hairStyle: 'buzzcut',
      glasses: false,
      jacketColor: '#1e2025',
      vestColor: '#2b303c',
      accentColor: '#2563eb',
      pantsColor: '#181b20',
      bootsColor: '#101216',
      skinTone: '#c9916e',
      bodyScale: { x: 1.18, y: 1.08, z: 1.18 },
    },
  },

  NOVA: {
    id: 'NOVA' as any,
    name: 'Nova',
    subtitle: 'TACTICAL SNIPER',
    quote: 'Precision is the ultimate power.',
    role: 'Marksman & Specialist · High Accuracy',
    description: 'High-tech sharpshooter equipped with long-range optics and tactical sniper systems. Masters elevated rooftop vantage points and long sightlines.',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    elementIcon: '🔮',
    themeColor: 'from-purple-500 to-violet-800',
    accentColor: '#8b5cf6',
    baseHp: 100,
    baseArmor: 45,
    speed: 80,
    strength: 65,
    accuracy: 85,
    primaryWeapon: 'Sniper (Phantom)',
    specialAbilities: [
      {
        id: 'tactical_scan',
        name: 'Tactical Recon',
        desc: 'Marks enemy thermal signature on HUD and minimap for long-range target acquisition.',
        icon: '📡',
        cooldownSec: 15,
      },
      {
        id: 'precision_shot',
        name: 'Overcharge Round',
        desc: 'Chambers a high-penetration armor-piercing round that ignores 50% enemy armor.',
        icon: '⚡',
        cooldownSec: 20,
      },
    ],
    visualPreset: {
      hairStyle: 'bob_white',
      glasses: false,
      jacketColor: '#1f1a26',
      vestColor: '#292233',
      accentColor: '#a855f7',
      pantsColor: '#16131c',
      bootsColor: '#0f0c14',
      skinTone: '#f2ddd0',
      bodyScale: { x: 0.96, y: 1.0, z: 0.96 },
    },
  },
};
