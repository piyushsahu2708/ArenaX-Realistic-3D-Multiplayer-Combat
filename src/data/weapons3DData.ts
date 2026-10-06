export type WeaponCategory =
  | 'ASSAULT_RIFLE'
  | 'SMG'
  | 'SNIPER'
  | 'SHOTGUN'
  | 'PISTOL'
  | 'MELEE';

export interface Weapon3DConfig {
  id: string;
  name: string;
  codeName: string;
  category: WeaponCategory;
  categoryLabel: string;
  damage: number;
  headshotMultiplier: number;
  fireRateRps: number;
  isAutomatic: boolean;
  magSize: number;
  reserveAmmo: number;
  reloadTimeSec: number;
  rangeMeters: number;
  pellets?: number;
  spreadAngleRad: number;
  recoilAngle: number;
  zoomFov: number; // Normal camera is ~65, zoom drops down
  modelColor: string;
  accentColor: string;
  muzzleLightColor: number;
  audioPitch: number;
  description: string;
}

export const WEAPONS_DATABASE: Record<string, Weapon3DConfig> = {
  AR16: {
    id: 'AR16',
    name: 'Assault Rifle',
    codeName: 'AR-16',
    category: 'ASSAULT_RIFLE',
    categoryLabel: 'Assault Rifle',
    damage: 26,
    headshotMultiplier: 2.0,
    fireRateRps: 9.5, // 9.5 rounds per second (~105ms delay)
    isAutomatic: true,
    magSize: 30,
    reserveAmmo: 90,
    reloadTimeSec: 2.2,
    rangeMeters: 80,
    spreadAngleRad: 0.025,
    recoilAngle: 0.03,
    zoomFov: 45,
    modelColor: '#1a1f29',
    accentColor: '#ef4444',
    muzzleLightColor: 0xffaa44,
    audioPitch: 1.0,
    description: 'Balanced combat rifle offering reliable stopping power and controllable recoil at mid ranges.',
  },

  VOLT: {
    id: 'VOLT',
    name: 'SMG',
    codeName: 'VOLT',
    category: 'SMG',
    categoryLabel: 'Submachine Gun',
    damage: 18,
    headshotMultiplier: 1.8,
    fireRateRps: 13.5,
    isAutomatic: true,
    magSize: 35,
    reserveAmmo: 105,
    reloadTimeSec: 1.8,
    rangeMeters: 45,
    spreadAngleRad: 0.04,
    recoilAngle: 0.022,
    zoomFov: 50,
    modelColor: '#171a22',
    accentColor: '#38bdf8',
    muzzleLightColor: 0x44ddff,
    audioPitch: 1.3,
    description: 'Rapid-fire compact weapon designed for close-quarter run-and-gun combat and high mobility.',
  },

  PHANTOM: {
    id: 'PHANTOM',
    name: 'Sniper Rifle',
    codeName: 'PHANTOM',
    category: 'SNIPER',
    categoryLabel: 'High-Caliber Sniper',
    damage: 92,
    headshotMultiplier: 2.5, // 230 headshot damage - instant kill!
    fireRateRps: 0.9,
    isAutomatic: false,
    magSize: 5,
    reserveAmmo: 20,
    reloadTimeSec: 3.0,
    rangeMeters: 200,
    spreadAngleRad: 0.005,
    recoilAngle: 0.09,
    zoomFov: 24, // High optical zoom
    modelColor: '#181b22',
    accentColor: '#a855f7',
    muzzleLightColor: 0xaa66ff,
    audioPitch: 0.7,
    description: 'Bolt-action heavy rifle delivering devastating single-shot lethality across long sightlines.',
  },

  BULL: {
    id: 'BULL',
    name: 'Shotgun',
    codeName: 'BULL-12',
    category: 'SHOTGUN',
    categoryLabel: 'Tactical Shotgun',
    damage: 14, // 14 x 6 pellets = 84 max damage point-blank
    pellets: 6,
    headshotMultiplier: 1.6,
    fireRateRps: 1.3,
    isAutomatic: false,
    magSize: 8,
    reserveAmmo: 24,
    reloadTimeSec: 2.8,
    rangeMeters: 25,
    spreadAngleRad: 0.07,
    recoilAngle: 0.08,
    zoomFov: 52,
    modelColor: '#22252a',
    accentColor: '#eab308',
    muzzleLightColor: 0xff8833,
    audioPitch: 0.8,
    description: 'Pump-action buckshot shotgun capable of neutralizing enemies in close-quarters ambush.',
  },

  R9: {
    id: 'R9',
    name: 'Tactical Pistol',
    codeName: 'R9',
    category: 'PISTOL',
    categoryLabel: 'Sidearm Pistol',
    damage: 24,
    headshotMultiplier: 2.0,
    fireRateRps: 5.0,
    isAutomatic: false,
    magSize: 15,
    reserveAmmo: 45,
    reloadTimeSec: 1.5,
    rangeMeters: 35,
    spreadAngleRad: 0.03,
    recoilAngle: 0.025,
    zoomFov: 52,
    modelColor: '#1c2027',
    accentColor: '#94a3b8',
    muzzleLightColor: 0xffbb55,
    audioPitch: 1.2,
    description: 'High-velocity tactical sidearm with rapid trigger reset and quick holster draw.',
  },

  MELEE: {
    id: 'MELEE',
    name: 'Combat Knife & Fists',
    codeName: 'MELEE',
    category: 'MELEE',
    categoryLabel: 'Close Quarters',
    damage: 45,
    headshotMultiplier: 1.5,
    fireRateRps: 1.8,
    isAutomatic: false,
    magSize: 1,
    reserveAmmo: 999,
    reloadTimeSec: 0,
    rangeMeters: 2.8,
    spreadAngleRad: 0,
    recoilAngle: 0,
    zoomFov: 65,
    modelColor: '#2b2d35',
    accentColor: '#f43f5e',
    muzzleLightColor: 0xffffff,
    audioPitch: 1.0,
    description: 'Martial arts hand-to-hand combat (punch, kick, knife slash) with heavy physical impact and knockback.',
  },
};

export interface MapPickupConfig {
  id: string;
  type: 'WEAPON' | 'MEDKIT' | 'ARMOR' | 'AMMO';
  weaponId?: string;
  name: string;
  value: number; // e.g. +50 HP or +40 Armor
  position: [number, number, number];
  respawnTimeSec: number;
}

export const INITIAL_MAP_PICKUPS: MapPickupConfig[] = [
  // Weapons
  { id: 'w-1', type: 'WEAPON', weaponId: 'AR16', name: 'Assault Rifle (AR-16)', value: 30, position: [0, 0.6, 6], respawnTimeSec: 25 },
  { id: 'w-2', type: 'WEAPON', weaponId: 'BULL', name: 'Shotgun (BULL)', value: 8, position: [-12, 0.6, -8], respawnTimeSec: 25 },
  { id: 'w-3', type: 'WEAPON', weaponId: 'PHANTOM', name: 'Sniper (PHANTOM)', value: 5, position: [14, 4.6, 12], respawnTimeSec: 30 }, // On rooftop!
  { id: 'w-4', type: 'WEAPON', weaponId: 'VOLT', name: 'SMG (VOLT)', value: 35, position: [10, 0.6, -14], respawnTimeSec: 25 },

  // Medkits
  { id: 'm-1', type: 'MEDKIT', name: 'Combat Medkit (+50 HP)', value: 50, position: [-8, 0.5, 14], respawnTimeSec: 20 },
  { id: 'm-2', type: 'MEDKIT', name: 'Field Medkit (+50 HP)', value: 50, position: [12, 0.5, -6], respawnTimeSec: 20 },
  { id: 'm-3', type: 'MEDKIT', name: 'Emergency Medkit (+50 HP)', value: 50, position: [0, 4.6, -12], respawnTimeSec: 25 }, // Rooftop

  // Armor Plates
  { id: 'a-1', type: 'ARMOR', name: 'Ballistic Armor (+40 Armor)', value: 40, position: [6, 0.5, 0], respawnTimeSec: 20 },
  { id: 'a-2', type: 'ARMOR', name: 'Heavy Armor Plate (+40 Armor)', value: 40, position: [-14, 0.5, 2], respawnTimeSec: 20 },

  // Ammo Crates
  { id: 'am-1', type: 'AMMO', name: 'Military Ammo Crate', value: 90, position: [-4, 0.5, -12], respawnTimeSec: 15 },
  { id: 'am-2', type: 'AMMO', name: 'Reserve Ammo Cache', value: 90, position: [8, 0.5, 16], respawnTimeSec: 15 },
];
