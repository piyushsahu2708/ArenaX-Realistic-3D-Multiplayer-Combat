import * as THREE from 'three';
import { Weapon3DConfig } from '../data/weapons3DData';
import { soundEngine } from './audioEngine';

export interface HitResult {
  hit: boolean;
  isHeadshot: boolean;
  damage: number;
  armorDamage: number;
  hitPoint?: THREE.Vector3;
  targetIsPlayer?: boolean;
}

export interface FloatingDamageText {
  id: string;
  worldPos: THREE.Vector3;
  text: string;
  color: string;
  isCrit: boolean;
  createdAt: number;
}

export class CombatEngine3D {
  public scene: THREE.Scene;
  public tracers: { line: THREE.Line; life: number }[] = [];
  public particles: { mesh: THREE.Points; velocities: THREE.Vector3[]; life: number }[] = [];
  public floatingTexts: FloatingDamageText[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Create glowing bullet tracer beam
  public createBulletTracer(from: THREE.Vector3, to: THREE.Vector3, color: number = 0xffe066) {
    const points = [from.clone(), to.clone()];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({ line, life: 0.12 });
  }

  // Create spark/dust impact particle burst at hit point
  public createImpactParticles(point: THREE.Vector3, normal: THREE.Vector3, isCharacter: boolean = false) {
    const count = isCharacter ? 18 : 12;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;

      const spread = new THREE.Vector3(
        (Math.random() - 0.5) * 4 + normal.x * 3,
        (Math.random() - 0.2) * 4 + normal.y * 3,
        (Math.random() - 0.5) * 4 + normal.z * 3
      );
      velocities.push(spread);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: isCharacter ? 0xef4444 : 0xfef08a,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.particles.push({ mesh: points, velocities, life: 0.35 });
  }

  // Add floating 3D damage indicator
  public addDamageNumber(pos: THREE.Vector3, damage: number, isHeadshot: boolean) {
    this.floatingTexts.push({
      id: 'dmg-' + Math.random().toString(36).substring(2, 8),
      worldPos: pos.clone().add(new THREE.Vector3(0, 0.4, 0)),
      text: isHeadshot ? `💥 CRITICAL -${damage}` : `-${damage}`,
      color: isHeadshot ? 'text-amber-300 font-black' : 'text-rose-400 font-bold',
      isCrit: isHeadshot,
      createdAt: Date.now(),
    });
  }

  // Perform Raycast Gunshot calculation
  public processShot(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    weapon: Weapon3DConfig,
    targetModelRoot?: THREE.Object3D,
    targetHeadPos?: THREE.Vector3,
    targetCurrentArmor: number = 0
  ): HitResult {
    // 1. Play realistic sound
    soundEngine.playGunshot(weapon.category);

    // 2. Raycast against targets
    const raycaster = new THREE.Raycaster(origin, direction, 0.5, weapon.rangeMeters);
    let hitResult: HitResult = {
      hit: false,
      isHeadshot: false,
      damage: 0,
      armorDamage: 0,
    };

    if (targetModelRoot && targetHeadPos) {
      // Check headshot sphere first (radius 0.25m around head)
      const headSphere = new THREE.Sphere(targetHeadPos, 0.28);
      const headIntersection = raycaster.ray.intersectsSphere(headSphere);

      // Check full body bounding box
      const targetBox = new THREE.Box3().setFromObject(targetModelRoot);
      targetBox.expandByScalar(0.15); // Slight forgiving tolerance for responsive hitreg
      const bodyIntersectPoint = new THREE.Vector3();
      const bodyIntersects = raycaster.ray.intersectBox(targetBox, bodyIntersectPoint);

      if (headIntersection) {
        // Headshot hit!
        const baseDmg = weapon.damage * weapon.headshotMultiplier;
        const totalDmg = Math.round(baseDmg * (1 + (Math.random() * 0.15 - 0.07)));
        hitResult = {
          hit: true,
          isHeadshot: true,
          damage: totalDmg,
          armorDamage: 0,
          hitPoint: targetHeadPos.clone(),
          targetIsPlayer: true,
        };
      } else if (bodyIntersects) {
        // Body hit! Armor absorbs 60% of incoming damage
        let rawDmg = Math.round(weapon.damage * (1 + (Math.random() * 0.2 - 0.1)));
        let armorDmg = 0;
        let hpDmg = rawDmg;

        if (targetCurrentArmor > 0) {
          armorDmg = Math.min(targetCurrentArmor, Math.round(rawDmg * 0.6));
          hpDmg = rawDmg - armorDmg;
        }

        hitResult = {
          hit: true,
          isHeadshot: false,
          damage: hpDmg,
          armorDamage: armorDmg,
          hitPoint: bodyIntersectPoint.clone(),
          targetIsPlayer: true,
        };
      }
    }

    // Tracer endpoint
    const endPoint = hitResult.hitPoint
      ? hitResult.hitPoint
      : origin.clone().add(direction.clone().multiplyScalar(weapon.rangeMeters * 0.8));

    this.createBulletTracer(origin, endPoint, hitResult.isHeadshot ? 0xff4444 : 0xffdd66);

    if (hitResult.hit && hitResult.hitPoint) {
      this.createImpactParticles(hitResult.hitPoint, direction.clone().negate(), true);
      this.addDamageNumber(hitResult.hitPoint, hitResult.damage + hitResult.armorDamage, hitResult.isHeadshot);
      soundEngine.playHitmarker(hitResult.isHeadshot);
    }

    return hitResult;
  }

  // Perform physical Melee strike (Punch, Kick, Takedown)
  public processMelee(
    attackerPos: THREE.Vector3,
    attackerForward: THREE.Vector3,
    targetPos: THREE.Vector3,
    targetCurrentArmor: number
  ): HitResult {
    soundEngine.playMelee(false);

    const dist = attackerPos.distanceTo(targetPos);
    if (dist <= 2.6) {
      // Angle check (must be within ~75 degrees forward cone)
      const toTarget = targetPos.clone().sub(attackerPos).normalize();
      const dot = attackerForward.dot(toTarget);

      if (dot > 0.35) {
        soundEngine.playMelee(true);
        soundEngine.playHitmarker(false);

        const rawDmg = Math.floor(Math.random() * 10) + 40; // 40-50 melee dmg
        let armorDmg = 0;
        let hpDmg = rawDmg;
        if (targetCurrentArmor > 0) {
          armorDmg = Math.min(targetCurrentArmor, Math.round(rawDmg * 0.5));
          hpDmg = rawDmg - armorDmg;
        }

        this.addDamageNumber(targetPos.clone().add(new THREE.Vector3(0, 1.2, 0)), rawDmg, false);

        return {
          hit: true,
          isHeadshot: false,
          damage: hpDmg,
          armorDamage: armorDmg,
          hitPoint: targetPos.clone(),
          targetIsPlayer: true,
        };
      }
    }

    return { hit: false, isHeadshot: false, damage: 0, armorDamage: 0 };
  }

  // Update visual combat FX every frame
  public update(delta: number) {
    // 1. Tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tr = this.tracers[i];
      tr.life -= delta;
      if (tr.life <= 0) {
        this.scene.remove(tr.line);
        tr.line.geometry.dispose();
        this.tracers.splice(i, 1);
      }
    }

    // 2. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      const posAttr = p.mesh.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let j = 0; j < p.velocities.length; j++) {
        array[j * 3] += p.velocities[j].x * delta;
        array[j * 3 + 1] += p.velocities[j].y * delta;
        array[j * 3 + 2] += p.velocities[j].z * delta;
        p.velocities[j].y -= 9.8 * delta; // Gravity
      }
      posAttr.needsUpdate = true;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      }
    }

    // 3. Floating Damage Numbers (Rise and fade over 1.2s)
    const now = Date.now();
    this.floatingTexts = this.floatingTexts.filter((f) => {
      f.worldPos.y += delta * 0.6;
      return now - f.createdAt < 1200;
    });
  }
}
