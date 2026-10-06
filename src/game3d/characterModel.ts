import * as THREE from 'three';
import { ROSTER_CHARACTERS, CharacterRosterItem } from '../data/characters3DData';

export type AnimationState =
  | 'IDLE'
  | 'WALK'
  | 'RUN'
  | 'SPRINT'
  | 'JUMP'
  | 'FALL'
  | 'CROUCH'
  | 'MELEE_PUNCH'
  | 'MELEE_KICK'
  | 'RELOAD'
  | 'HIT'
  | 'DEATH';

export class Character3DModel {
  public root: THREE.Group;
  public characterId: string;
  public config: CharacterRosterItem;

  // Skeletal parts for procedural animation
  public headGroup!: THREE.Group;
  public torsoGroup!: THREE.Group;
  public leftArmGroup!: THREE.Group;
  public rightArmGroup!: THREE.Group;
  public leftForearm!: THREE.Group;
  public rightForearm!: THREE.Group;
  public leftLegGroup!: THREE.Group;
  public rightLegGroup!: THREE.Group;
  public leftShin!: THREE.Group;
  public rightShin!: THREE.Group;
  public weaponMeshGroup!: THREE.Group;
  public muzzlePoint!: THREE.Object3D;
  public muzzleLight!: THREE.PointLight;

  // Animation tracking
  public currentAnim: AnimationState = 'IDLE';
  public animTime: number = 0;
  public isAiming: boolean = false;
  public recoilAmount: number = 0;
  public meleeTimer: number = 0;
  public reloadTimer: number = 0;
  public hitFlinchTimer: number = 0;
  public isDead: boolean = false;
  public deathProgress: number = 0;

  constructor(characterId: string = 'PIYUSH') {
    this.characterId = characterId;
    this.config = ROSTER_CHARACTERS[characterId] || ROSTER_CHARACTERS.PIYUSH;
    this.root = new THREE.Group();
    this.buildHumanoidHierarchy();
  }

  private buildHumanoidHierarchy() {
    const { visualPreset, accentColor } = this.config;
    const bodyScale = visualPreset.bodyScale || { x: 1, y: 1, z: 1 };

    // Standard materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: visualPreset.skinTone,
      roughness: 0.7,
      metalness: 0.05,
    });
    const jacketMat = new THREE.MeshStandardMaterial({
      color: visualPreset.jacketColor,
      roughness: 0.6,
      metalness: 0.2,
    });
    const vestMat = new THREE.MeshStandardMaterial({
      color: visualPreset.vestColor,
      roughness: 0.4,
      metalness: 0.4,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.3,
      metalness: 0.5,
      emissive: new THREE.Color(accentColor).multiplyScalar(0.2),
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: visualPreset.pantsColor,
      roughness: 0.8,
      metalness: 0.1,
    });
    const bootsMat = new THREE.MeshStandardMaterial({
      color: visualPreset.bootsColor,
      roughness: 0.5,
      metalness: 0.3,
    });
    const weaponMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.3,
      metalness: 0.8,
    });

    // 1. Torso Root (Hips at y ~ 0.95)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.95;
    this.root.add(this.torsoGroup);

    // Hips
    const hipsGeo = new THREE.BoxGeometry(0.32 * bodyScale.x, 0.16, 0.22);
    const hipsMesh = new THREE.Mesh(hipsGeo, pantsMat);
    hipsMesh.castShadow = true;
    this.torsoGroup.add(hipsMesh);

    // Upper Torso / Chest
    const chestGeo = new THREE.BoxGeometry(0.38 * bodyScale.x, 0.42, 0.26);
    const chestMesh = new THREE.Mesh(chestGeo, jacketMat);
    chestMesh.position.y = 0.28;
    chestMesh.castShadow = true;
    this.torsoGroup.add(chestMesh);

    // Tactical Vest / Ballistic Armor Plate
    const vestGeo = new THREE.BoxGeometry(0.4 * bodyScale.x, 0.34, 0.29);
    const vestMesh = new THREE.Mesh(vestGeo, vestMat);
    vestMesh.position.y = 0.27;
    vestMesh.castShadow = true;
    this.torsoGroup.add(vestMesh);

    // Vest Accent Stripe (Tactical Stripe)
    const stripeGeo = new THREE.BoxGeometry(0.24 * bodyScale.x, 0.05, 0.3);
    const stripeMesh = new THREE.Mesh(stripeGeo, accentMat);
    stripeMesh.position.set(0, 0.32, 0);
    this.torsoGroup.add(stripeMesh);

    // Tactical Backpack on back
    const packGeo = new THREE.BoxGeometry(0.28 * bodyScale.x, 0.32, 0.14);
    const packMesh = new THREE.Mesh(packGeo, vestMat);
    packMesh.position.set(0, 0.27, -0.19);
    packMesh.castShadow = true;
    this.torsoGroup.add(packMesh);

    // 2. Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.52;
    this.torsoGroup.add(this.headGroup);

    // Realistic Anatomical Neck
    const neckGeo = new THREE.CylinderGeometry(0.068, 0.082, 0.11, 12);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = -0.01;
    neckMesh.castShadow = true;
    this.headGroup.add(neckMesh);

    // Anatomical Head Cranium
    const headGeo = new THREE.BoxGeometry(0.19, 0.22, 0.20);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Defined Athletic Jawline & Chin
    const jawMat = new THREE.MeshStandardMaterial({
      color: visualPreset.skinTone,
      roughness: 0.65,
    });
    const jawGeo = new THREE.BoxGeometry(0.17, 0.08, 0.12);
    const jawMesh = new THREE.Mesh(jawGeo, jawMat);
    jawMesh.position.set(0, 0.06, 0.05);
    jawMesh.castShadow = true;
    this.headGroup.add(jawMesh);

    // Realistic Ears
    const earGeo = new THREE.BoxGeometry(0.025, 0.06, 0.04);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.105, 0.14, 0.01);
    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.105, 0.14, 0.01);
    this.headGroup.add(leftEar);
    this.headGroup.add(rightEar);

    // Realistic Facial Hair (Well-groomed stubble beard for Piyush)
    if (this.characterId === 'PIYUSH') {
      const beardMat = new THREE.MeshStandardMaterial({
        color: 0x1f1d1b,
        roughness: 0.9,
      });
      const beardGeo = new THREE.BoxGeometry(0.174, 0.06, 0.07);
      const beardMesh = new THREE.Mesh(beardGeo, beardMat);
      beardMesh.position.set(0, 0.055, 0.085);
      this.headGroup.add(beardMesh);
    }

    // Hair / Headgear with Natural Volumetric Curly Silhouette for Piyush
    const hairMat = new THREE.MeshStandardMaterial({
      color: visualPreset.hairStyle === 'bob_white' ? 0xe2e8f0 : 0x141211,
      roughness: 0.85,
    });

    if (visualPreset.hairStyle === 'styled_curly') {
      // Main crown
      const crownGeo = new THREE.BoxGeometry(0.21, 0.11, 0.22);
      const crownMesh = new THREE.Mesh(crownGeo, hairMat);
      crownMesh.position.set(0, 0.24, -0.01);
      crownMesh.castShadow = true;
      this.headGroup.add(crownMesh);

      // Curly textured strands & bangs across forehead
      const curlFrontGeo = new THREE.BoxGeometry(0.18, 0.05, 0.06);
      const curlFront = new THREE.Mesh(curlFrontGeo, hairMat);
      curlFront.position.set(0, 0.24, 0.105);
      this.headGroup.add(curlFront);

      // Side curls
      const curlSideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.14), hairMat);
      curlSideL.position.set(-0.105, 0.21, 0.01);
      const curlSideR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.14), hairMat);
      curlSideR.position.set(0.105, 0.21, 0.01);
      this.headGroup.add(curlSideL);
      this.headGroup.add(curlSideR);
    } else {
      const hairGeo = new THREE.BoxGeometry(0.22, 0.12, 0.23);
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.position.set(0, 0.23, -0.01);
      this.headGroup.add(hairMesh);
    }

    // Piyush Signature Sleek Tactical Glasses
    if (visualPreset.glasses) {
      const glassesMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.95,
        roughness: 0.1,
      });
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.85,
        opacity: 0.85,
        transparent: true,
        roughness: 0.05,
        ior: 1.5,
      });

      // Glasses bridge & dark metallic frame
      const frameGeo = new THREE.BoxGeometry(0.175, 0.042, 0.035);
      const frameMesh = new THREE.Mesh(frameGeo, glassesMat);
      frameMesh.position.set(0, 0.155, 0.112);
      this.headGroup.add(frameMesh);

      // Tactical anti-glare lenses
      const lensGeo = new THREE.BoxGeometry(0.065, 0.035, 0.01);
      const lensL = new THREE.Mesh(lensGeo, lensMat);
      lensL.position.set(-0.045, 0.155, 0.122);
      const lensR = new THREE.Mesh(lensGeo, lensMat);
      lensR.position.set(0.045, 0.155, 0.122);
      this.headGroup.add(lensL);
      this.headGroup.add(lensR);

      // Temples going back over ears
      const templeMat = glassesMat;
      const templeGeo = new THREE.BoxGeometry(0.01, 0.015, 0.14);
      const templeL = new THREE.Mesh(templeGeo, templeMat);
      templeL.position.set(-0.09, 0.155, 0.04);
      const templeR = new THREE.Mesh(templeGeo, templeMat);
      templeR.position.set(0.09, 0.155, 0.04);
      this.headGroup.add(templeL);
      this.headGroup.add(templeR);
    }

    // 3. Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.25 * bodyScale.x, 0.42, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const lUpperArmGeo = new THREE.BoxGeometry(0.12, 0.24, 0.13);
    const lUpperArmMesh = new THREE.Mesh(lUpperArmGeo, jacketMat);
    lUpperArmMesh.position.y = -0.12;
    lUpperArmMesh.castShadow = true;
    this.leftArmGroup.add(lUpperArmMesh);

    this.leftForearm = new THREE.Group();
    this.leftForearm.position.y = -0.24;
    this.leftArmGroup.add(this.leftForearm);

    const lForearmGeo = new THREE.BoxGeometry(0.1, 0.22, 0.11);
    const lForearmMesh = new THREE.Mesh(lForearmGeo, jacketMat);
    lForearmMesh.position.y = -0.11;
    this.leftForearm.add(lForearmMesh);

    const lHandGeo = new THREE.BoxGeometry(0.09, 0.1, 0.09);
    const lHandMesh = new THREE.Mesh(lHandGeo, bootsMat); // Gloved
    lHandMesh.position.y = -0.24;
    this.leftForearm.add(lHandMesh);

    // 4. Right Arm (Gun Hand)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.25 * bodyScale.x, 0.42, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const rUpperArmGeo = new THREE.BoxGeometry(0.12, 0.24, 0.13);
    const rUpperArmMesh = new THREE.Mesh(rUpperArmGeo, jacketMat);
    rUpperArmMesh.position.y = -0.12;
    rUpperArmMesh.castShadow = true;
    this.rightArmGroup.add(rUpperArmMesh);

    this.rightForearm = new THREE.Group();
    this.rightForearm.position.y = -0.24;
    this.rightArmGroup.add(this.rightForearm);

    const rForearmGeo = new THREE.BoxGeometry(0.1, 0.22, 0.11);
    const rForearmMesh = new THREE.Mesh(rForearmGeo, jacketMat);
    rForearmMesh.position.y = -0.11;
    this.rightForearm.add(rForearmMesh);

    const rHandGeo = new THREE.BoxGeometry(0.09, 0.1, 0.09);
    const rHandMesh = new THREE.Mesh(rHandGeo, bootsMat);
    rHandMesh.position.y = -0.24;
    this.rightForearm.add(rHandMesh);

    // 5. Weapon Rigged to Right Hand
    this.weaponMeshGroup = new THREE.Group();
    this.weaponMeshGroup.position.set(0, -0.26, 0.08);
    this.rightForearm.add(this.weaponMeshGroup);
    this.build3DWeapon(weaponMat, accentMat);

    // 6. Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.11 * bodyScale.x, -0.08, 0);
    this.torsoGroup.add(this.leftLegGroup);

    const lThighGeo = new THREE.BoxGeometry(0.14, 0.38, 0.16);
    const lThighMesh = new THREE.Mesh(lThighGeo, pantsMat);
    lThighMesh.position.y = -0.19;
    lThighMesh.castShadow = true;
    this.leftLegGroup.add(lThighMesh);

    this.leftShin = new THREE.Group();
    this.leftShin.position.y = -0.38;
    this.leftLegGroup.add(this.leftShin);

    const lShinGeo = new THREE.BoxGeometry(0.12, 0.34, 0.14);
    const lShinMesh = new THREE.Mesh(lShinGeo, pantsMat);
    lShinMesh.position.y = -0.17;
    lShinMesh.castShadow = true;
    this.leftShin.add(lShinMesh);

    const lBootGeo = new THREE.BoxGeometry(0.13, 0.14, 0.22);
    const lBootMesh = new THREE.Mesh(lBootGeo, bootsMat);
    lBootMesh.position.set(0, -0.35, 0.03);
    lBootMesh.castShadow = true;
    this.leftShin.add(lBootMesh);

    // 7. Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.11 * bodyScale.x, -0.08, 0);
    this.torsoGroup.add(this.rightLegGroup);

    const rThighGeo = new THREE.BoxGeometry(0.14, 0.38, 0.16);
    const rThighMesh = new THREE.Mesh(rThighGeo, pantsMat);
    rThighMesh.position.y = -0.19;
    rThighMesh.castShadow = true;
    this.rightLegGroup.add(rThighMesh);

    this.rightShin = new THREE.Group();
    this.rightShin.position.y = -0.38;
    this.rightLegGroup.add(this.rightShin);

    const rShinGeo = new THREE.BoxGeometry(0.12, 0.34, 0.14);
    const rShinMesh = new THREE.Mesh(rShinGeo, pantsMat);
    rShinMesh.position.y = -0.17;
    rShinMesh.castShadow = true;
    this.rightShin.add(rShinMesh);

    const rBootGeo = new THREE.BoxGeometry(0.13, 0.14, 0.22);
    const rBootMesh = new THREE.Mesh(rBootGeo, bootsMat);
    rBootMesh.position.set(0, -0.35, 0.03);
    rBootMesh.castShadow = true;
    this.rightShin.add(rBootMesh);

    // Root scale
    this.root.scale.set(bodyScale.x, bodyScale.y, bodyScale.z);
  }

  // Realistic Detailed 3D Weapon Model
  private build3DWeapon(mainMat: THREE.Material, accentMat: THREE.Material) {
    // Receiver / Body
    const bodyGeo = new THREE.BoxGeometry(0.06, 0.11, 0.44);
    const bodyMesh = new THREE.Mesh(bodyGeo, mainMat);
    bodyMesh.position.z = 0.12;
    this.weaponMeshGroup.add(bodyMesh);

    // Long Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.018, 0.02, 0.36, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMesh = new THREE.Mesh(barrelGeo, mainMat);
    barrelMesh.position.set(0, 0.03, 0.44);
    this.weaponMeshGroup.add(barrelMesh);

    // Magazine (Curved / Angled clip)
    const magGeo = new THREE.BoxGeometry(0.045, 0.18, 0.09);
    const magMesh = new THREE.Mesh(magGeo, mainMat);
    magMesh.position.set(0, -0.12, 0.14);
    magMesh.rotation.x = -0.2;
    this.weaponMeshGroup.add(magMesh);

    // Optical Sight / Tactical Scope
    const scopeGeo = new THREE.BoxGeometry(0.04, 0.06, 0.16);
    const scopeMesh = new THREE.Mesh(scopeGeo, accentMat);
    scopeMesh.position.set(0, 0.08, 0.1);
    this.weaponMeshGroup.add(scopeMesh);

    // Shoulder Stock
    const stockGeo = new THREE.BoxGeometry(0.05, 0.12, 0.2);
    const stockMesh = new THREE.Mesh(stockGeo, mainMat);
    stockMesh.position.set(0, -0.02, -0.16);
    this.weaponMeshGroup.add(stockMesh);

    // Muzzle flash anchor point
    this.muzzlePoint = new THREE.Object3D();
    this.muzzlePoint.position.set(0, 0.03, 0.64);
    this.weaponMeshGroup.add(this.muzzlePoint);

    // Dynamic Muzzle Point Light (Flashes when firing)
    this.muzzleLight = new THREE.PointLight(0xffaa44, 0, 8);
    this.muzzlePoint.add(this.muzzleLight);
  }

  // Trigger weapon firing kickback recoil & light flash
  public triggerMuzzleFlash(color: number = 0xffaa44) {
    this.recoilAmount = 0.25;
    this.muzzleLight.color.setHex(color);
    this.muzzleLight.intensity = 4.0;
    setTimeout(() => {
      this.muzzleLight.intensity = 0;
    }, 60);
  }

  // Trigger physical melee strike (punch/kick)
  public triggerMelee(type: 'PUNCH' | 'KICK' = 'PUNCH') {
    this.currentAnim = type === 'PUNCH' ? 'MELEE_PUNCH' : 'MELEE_KICK';
    this.meleeTimer = 0.45;
  }

  // Trigger hit flinch
  public triggerHitFlinch() {
    this.hitFlinchTimer = 0.25;
  }

  // Update procedural skeletal animation loop every frame (delta: seconds)
  public updateAnimation(
    delta: number,
    state: AnimationState,
    speedFactor: number = 1.0,
    isAiming: boolean = false
  ) {
    this.isAiming = isAiming;
    this.animTime += delta * 6.0 * speedFactor;

    // Decay transient timers
    if (this.recoilAmount > 0) {
      this.recoilAmount = Math.max(0, this.recoilAmount - delta * 3.5);
    }
    if (this.meleeTimer > 0) {
      this.meleeTimer -= delta;
      if (this.meleeTimer <= 0) this.currentAnim = state;
    } else {
      this.currentAnim = state;
    }
    if (this.hitFlinchTimer > 0) {
      this.hitFlinchTimer -= delta;
    }

    // Handle Death
    if (this.isDead) {
      this.deathProgress = Math.min(1.0, this.deathProgress + delta * 2.5);
      const angle = (Math.PI / 2) * this.deathProgress;
      this.root.rotation.x = -angle;
      this.root.position.y = -0.6 * this.deathProgress;
      return;
    }

    // Default neutral poses
    let lLegRotX = 0;
    let rLegRotX = 0;
    let lArmRotX = 0;
    let rArmRotX = -0.5 - this.recoilAmount;
    let rArmRotY = 0.2;
    let rForearmRotX = -0.6 - this.recoilAmount;
    let lArmRotY = -0.4;
    let lForearmRotX = -0.8;
    let torsoBobY = 0.95;

    // Crouch height adjustment
    if (state === 'CROUCH') {
      torsoBobY = 0.62;
      lLegRotX = -0.7;
      rLegRotX = 0.5;
      this.leftShin.rotation.x = 1.1;
      this.rightShin.rotation.x = 0.9;
    } else {
      this.leftShin.rotation.x = 0;
      this.rightShin.rotation.x = 0;
    }

    // Locomotion walk/run stride
    if (state === 'WALK' || state === 'RUN' || state === 'SPRINT') {
      const freq = state === 'SPRINT' ? 1.8 : 1.2;
      const strideAmp = state === 'SPRINT' ? 0.75 : 0.48;

      lLegRotX = Math.sin(this.animTime * freq) * strideAmp;
      rLegRotX = -Math.sin(this.animTime * freq) * strideAmp;

      // Body vertical bobbing
      torsoBobY += Math.abs(Math.sin(this.animTime * freq * 2)) * 0.05;

      // Arm counter-swing when not aiming
      if (!isAiming) {
        lArmRotX = -Math.sin(this.animTime * freq) * 0.45;
        rArmRotX += Math.sin(this.animTime * freq) * 0.2;
      }
    } else if (state === 'IDLE') {
      // Natural breathing
      const breath = Math.sin(this.animTime * 0.4) * 0.02;
      torsoBobY += breath;
      this.headGroup.rotation.x = breath * 0.5;
    } else if (state === 'JUMP') {
      lLegRotX = -0.4;
      rLegRotX = -0.3;
      this.leftShin.rotation.x = 0.5;
      this.rightShin.rotation.x = 0.5;
      lArmRotX = 0.4;
    }

    // Aim stance: Aligns two-handed weapon grip pointing forward over right shoulder
    if (isAiming) {
      rArmRotX = -1.55 - this.recoilAmount;
      rArmRotY = -0.15;
      rForearmRotX = -0.1 - this.recoilAmount * 0.5;

      // Left hand supports front barrel
      lArmRotX = -1.45;
      lArmRotY = 0.65;
      lForearmRotX = -0.85;

      this.torsoGroup.rotation.y = -0.18; // Slight combat stance turn
    } else {
      this.torsoGroup.rotation.y = 0;
    }

    // Melee Punch / Kick override
    if (this.currentAnim === 'MELEE_PUNCH') {
      const punchProgress = (0.45 - this.meleeTimer) / 0.45;
      const punchExt = Math.sin(punchProgress * Math.PI);
      rArmRotX = -1.5 * punchExt;
      rForearmRotX = 0;
      this.weaponMeshGroup.visible = false;
    } else if (this.currentAnim === 'MELEE_KICK') {
      const kickProgress = (0.45 - this.meleeTimer) / 0.45;
      const kickExt = Math.sin(kickProgress * Math.PI);
      rLegRotX = -1.6 * kickExt;
      this.rightShin.rotation.x = 0.4 * kickExt;
    } else {
      this.weaponMeshGroup.visible = true;
    }

    // Hit flinch reaction
    if (this.hitFlinchTimer > 0) {
      this.torsoGroup.rotation.x = 0.2;
      this.headGroup.rotation.x = -0.25;
    } else if (!isAiming) {
      this.torsoGroup.rotation.x = 0;
      this.headGroup.rotation.x = 0;
    }

    // Apply rotation transforms
    this.torsoGroup.position.y = torsoBobY;
    this.leftLegGroup.rotation.x = lLegRotX;
    this.rightLegGroup.rotation.x = rLegRotX;
    this.leftArmGroup.rotation.x = lArmRotX;
    this.leftArmGroup.rotation.y = lArmRotY;
    this.leftForearm.rotation.x = lForearmRotX;
    this.rightArmGroup.rotation.x = rArmRotX;
    this.rightArmGroup.rotation.y = rArmRotY;
    this.rightForearm.rotation.x = rForearmRotX;
  }
}
