/**
 * Real-time 3D Multiplayer Sync via BroadcastChannel
 * Enables 2 browser windows/tabs to battle in real-time 3D over-the-shoulder PvP.
 */

export interface TransformPacket {
  type: '3D_TRANSFORM';
  tabId: string;
  playerId: number;
  characterId: string;
  posX: number;
  posY: number;
  posZ: number;
  rotY: number;
  animState: string;
  isAiming: boolean;
  isCrouching: boolean;
  weaponId: string;
}

export interface FirePacket {
  type: '3D_FIRE';
  tabId: string;
  playerId: number;
  origin: [number, number, number];
  direction: [number, number, number];
  weaponId: string;
}

export interface MeleePacket {
  type: '3D_MELEE';
  tabId: string;
  playerId: number;
  meleeType: 'PUNCH' | 'KICK';
}

export interface DamagePacket {
  type: '3D_DAMAGE';
  tabId: string;
  targetPlayerId: number;
  hpDmg: number;
  armorDmg: number;
  isHeadshot: boolean;
  newHp: number;
  newArmor: number;
  isFatal: boolean;
}

export interface PickupPacket {
  type: '3D_PICKUP';
  tabId: string;
  pickupId: string;
}

export type NetPacket = TransformPacket | FirePacket | MeleePacket | DamagePacket | PickupPacket;

export class Multiplayer3DChannel {
  private channel: BroadcastChannel | null = null;
  public tabId: string;
  public onTransform?: (p: TransformPacket) => void;
  public onFire?: (p: FirePacket) => void;
  public onMelee?: (p: MeleePacket) => void;
  public onDamage?: (p: DamagePacket) => void;
  public onPickup?: (p: PickupPacket) => void;
  public isConnectedToPeer: boolean = false;
  private lastPingTime: number = 0;

  constructor(tabId: string) {
    this.tabId = tabId;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('arenax_3d_combat_network');
      this.channel.onmessage = (event: MessageEvent) => {
        const data = event.data as NetPacket;
        if (!data || data.tabId === this.tabId) return;

        this.isConnectedToPeer = true;
        this.lastPingTime = Date.now();

        if (data.type === '3D_TRANSFORM' && this.onTransform) {
          this.onTransform(data);
        } else if (data.type === '3D_FIRE' && this.onFire) {
          this.onFire(data);
        } else if (data.type === '3D_MELEE' && this.onMelee) {
          this.onMelee(data);
        } else if (data.type === '3D_DAMAGE' && this.onDamage) {
          this.onDamage(data);
        } else if (data.type === '3D_PICKUP' && this.onPickup) {
          this.onPickup(data);
        }
      };
    }
  }

  public sendTransform(
    playerId: number,
    characterId: string,
    pos: { x: number; y: number; z: number },
    rotY: number,
    animState: string,
    isAiming: boolean,
    isCrouching: boolean,
    weaponId: string
  ) {
    this.channel?.postMessage({
      type: '3D_TRANSFORM',
      tabId: this.tabId,
      playerId,
      characterId,
      posX: pos.x,
      posY: pos.y,
      posZ: pos.z,
      rotY,
      animState,
      isAiming,
      isCrouching,
      weaponId,
    } as TransformPacket);
  }

  public sendFire(
    playerId: number,
    origin: [number, number, number],
    direction: [number, number, number],
    weaponId: string
  ) {
    this.channel?.postMessage({
      type: '3D_FIRE',
      tabId: this.tabId,
      playerId,
      origin,
      direction,
      weaponId,
    } as FirePacket);
  }

  public sendMelee(playerId: number, meleeType: 'PUNCH' | 'KICK') {
    this.channel?.postMessage({
      type: '3D_MELEE',
      tabId: this.tabId,
      playerId,
      meleeType,
    } as MeleePacket);
  }

  public sendDamage(
    targetPlayerId: number,
    hpDmg: number,
    armorDmg: number,
    isHeadshot: boolean,
    newHp: number,
    newArmor: number,
    isFatal: boolean
  ) {
    this.channel?.postMessage({
      type: '3D_DAMAGE',
      tabId: this.tabId,
      targetPlayerId,
      hpDmg,
      armorDmg,
      isHeadshot,
      newHp,
      newArmor,
      isFatal,
    } as DamagePacket);
  }

  public sendPickup(pickupId: string) {
    this.channel?.postMessage({
      type: '3D_PICKUP',
      tabId: this.tabId,
      pickupId,
    } as PickupPacket);
  }

  public dispose() {
    this.channel?.close();
  }
}
