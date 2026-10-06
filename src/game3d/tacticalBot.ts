import * as THREE from 'three';
import { Character3DModel } from './characterModel';
import { WEAPONS_DATABASE, Weapon3DConfig } from '../data/weapons3DData';
import { CityMap3D } from './cityMap';
import { CombatEngine3D } from './combatEngine';

export class TacticalBotAI {
  public model: Character3DModel;
  public position: THREE.Vector3;
  public rotationY: number = 0;
  public hp: number = 100;
  public maxHp: number = 100;
  public armor: number = 50;
  public maxArmor: number = 50;
  public weapon: Weapon3DConfig;
  public isDead: boolean = false;

  // AI State machine
  public state: 'PATROL' | 'SEEK_COVER' | 'ENGAGE' | 'RETREAT_HEAL' = 'PATROL';
  public currentAnim: string = 'IDLE';
  public targetPlayerPos: THREE.Vector3 | null = null;
  private patrolWaypoints: THREE.Vector3[] = [
    new THREE.Vector3(10, 0, 10),
    new THREE.Vector3(-10, 0, 8),
    new THREE.Vector3(-8, 0, -10),
    new THREE.Vector3(8, 0, -12),
  ];
  private currentWaypointIdx: number = 0;
  private fireCooldown: number = 0;
  private stateTimer: number = 0;
  private lastShotTime: number = 0;

  constructor(
    characterId: string = 'TITAN',
    spawnPos: THREE.Vector3 = new THREE.Vector3(12, 0, 12),
    weaponId: string = 'AR16'
  ) {
    this.model = new Character3DModel(characterId);
    this.position = spawnPos.clone();
    this.model.root.position.copy(this.position);
    this.weapon = WEAPONS_DATABASE[weaponId] || WEAPONS_DATABASE.AR16;
    this.hp = this.model.config.baseHp;
    this.maxHp = this.model.config.baseHp;
    this.armor = this.model.config.baseArmor;
    this.maxArmor = this.model.config.baseArmor;
  }

  public takeDamage(hpDmg: number, armorDmg: number): boolean {
    if (this.isDead) return false;

    this.armor = Math.max(0, this.armor - armorDmg);
    this.hp = Math.max(0, this.hp - hpDmg);
    this.model.triggerHitFlinch();

    if (this.hp <= 0) {
      this.isDead = true;
      this.model.isDead = true;
      return true; // Fatal blow
    }

    // React to being shot: Engage or seek cover
    if (this.hp < 40) {
      this.state = 'RETREAT_HEAL';
    } else {
      this.state = 'ENGAGE';
    }
    return false;
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    cityMap: CityMap3D,
    combatEngine: CombatEngine3D,
    onBotFire?: (hitPlayer: boolean, damage: number, armorDmg: number, isHeadshot: boolean) => void
  ) {
    if (this.isDead) {
      this.model.updateAnimation(delta, 'DEATH');
      return;
    }

    this.stateTimer += delta;
    this.fireCooldown = Math.max(0, this.fireCooldown - delta);
    const distToPlayer = this.position.distanceTo(playerPos);

    // Perception check: Can see player?
    const hasLineOfSight = distToPlayer < 35;

    // AI State logic
    if (this.state === 'PATROL') {
      const wp = this.patrolWaypoints[this.currentWaypointIdx];
      const distToWp = this.position.distanceTo(wp);

      if (distToWp < 1.5) {
        this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.patrolWaypoints.length;
      } else {
        this.moveTowards(wp, 2.6, delta, cityMap);
        this.model.updateAnimation(delta, 'RUN');
      }

      if (hasLineOfSight && distToPlayer < 24) {
        this.state = 'ENGAGE';
      }
    } else if (this.state === 'ENGAGE') {
      // Look at player
      const dirToPlayer = playerPos.clone().sub(this.position).normalize();
      this.rotationY = Math.atan2(dirToPlayer.x, dirToPlayer.z);
      this.model.root.rotation.y = this.rotationY;

      // Distance keeping: If too close or far, adjust position
      if (distToPlayer > 12) {
        this.moveTowards(playerPos, 3.2, delta, cityMap);
        this.model.updateAnimation(delta, 'RUN', 1.0, true);
      } else if (distToPlayer < 3) {
        // Close range: Melee combat!
        if (this.fireCooldown <= 0) {
          this.model.triggerMelee('PUNCH');
          this.fireCooldown = 0.9;
          const meleeRes = combatEngine.processMelee(
            this.position,
            dirToPlayer,
            playerPos,
            10 // Player armor estimation
          );
          if (meleeRes.hit && onBotFire) {
            onBotFire(true, meleeRes.damage, meleeRes.armorDamage, false);
          }
        }
        this.model.updateAnimation(delta, 'IDLE', 1.0, true);
      } else {
        // Combat strafe
        const strafeDir = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).multiplyScalar(
          Math.sin(this.stateTimer * 2) * 1.5
        );
        this.position.add(strafeDir.multiplyScalar(delta));
        this.model.root.position.copy(this.position);
        this.model.updateAnimation(delta, 'WALK', 0.8, true);

        // Shoot at player
        if (this.fireCooldown <= 0 && distToPlayer < 28) {
          this.fireCooldown = 1.0 / (this.weapon.fireRateRps * 0.75); // realistic variance
          this.model.triggerMuzzleFlash(this.weapon.muzzleLightColor);

          // Simulated aim variance based on distance
          const aimError = (Math.random() - 0.5) * 0.12;
          const shotDir = dirToPlayer.clone();
          shotDir.x += aimError;
          shotDir.y += (Math.random() - 0.45) * 0.08;
          shotDir.normalize();

          // Calculate headshot or body hit on player
          const isHit = Math.random() < 0.65; // 65% bot accuracy
          if (isHit && onBotFire) {
            const isHead = Math.random() < 0.18;
            const rawDmg = isHead
              ? this.weapon.damage * this.weapon.headshotMultiplier
              : this.weapon.damage;
            const armorDmg = Math.round(rawDmg * 0.55);
            const hpDmg = rawDmg - armorDmg;
            onBotFire(true, hpDmg, armorDmg, isHead);
          }

          // Bullet tracer from bot gun to player direction
          const gunMuzzlePos = this.position.clone().add(new THREE.Vector3(0, 1.1, 0));
          const targetPoint = playerPos.clone().add(new THREE.Vector3(0, 1.0, 0));
          combatEngine.createBulletTracer(gunMuzzlePos, targetPoint, 0xff5555);
        }
      }
    } else if (this.state === 'RETREAT_HEAL') {
      // Find nearest Medkit
      let nearestMedkit: THREE.Vector3 | null = null;
      let minDist = Infinity;
      cityMap.pickups.forEach((p) => {
        if (p.active && p.config.type === 'MEDKIT') {
          const d = this.position.distanceTo(new THREE.Vector3(...p.config.position));
          if (d < minDist) {
            minDist = d;
            nearestMedkit = new THREE.Vector3(...p.config.position);
          }
        }
      });

      if (nearestMedkit && minDist > 1.2) {
        this.moveTowards(nearestMedkit, 4.2, delta, cityMap);
        this.model.updateAnimation(delta, 'SPRINT');
      } else {
        // Healed!
        this.hp = Math.min(this.maxHp, this.hp + 50);
        this.state = 'ENGAGE';
      }
    }
  }

  private moveTowards(target: THREE.Vector3, speed: number, delta: number, map: CityMap3D) {
    const dir = target.clone().sub(this.position);
    dir.y = 0;
    dir.normalize();

    const newPos = this.position.clone().add(dir.clone().multiplyScalar(speed * delta));
    if (!map.checkCollision(newPos, 0.4)) {
      this.position.copy(newPos);
    }

    this.rotationY = Math.atan2(dir.x, dir.z);
    this.model.root.rotation.y = this.rotationY;
    this.model.root.position.copy(this.position);
  }
}
