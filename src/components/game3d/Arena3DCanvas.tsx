import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useArena } from '../../context/ArenaContext';
import { ROSTER_CHARACTERS } from '../../data/characters3DData';
import { WEAPONS_DATABASE, Weapon3DConfig, MapPickupConfig } from '../../data/weapons3DData';
import { Character3DModel } from '../../game3d/characterModel';
import { CityMap3D } from '../../game3d/cityMap';
import { CombatEngine3D, FloatingDamageText } from '../../game3d/combatEngine';
import { TacticalBotAI } from '../../game3d/tacticalBot';
import { soundEngine } from '../../game3d/audioEngine';
import { Multiplayer3DChannel } from '../../game3d/multiplayerSync';
import {
  Shield,
  Heart,
  Crosshair,
  Zap,
  Volume2,
  VolumeX,
  Trophy,
  Skull,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Radio,
  Clock,
  Swords,
  Play,
  Layers,
  Settings,
  X
} from 'lucide-react';

export const Arena3DCanvas: React.FC = () => {
  const {
    activePlayer,
    selectedHeroId,
    currentScreen,
    setCurrentScreen,
    startMatchmaking,
  } = useArena();

  // Container & Three.js refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Gameplay Engine refs
  const playerModelRef = useRef<Character3DModel | null>(null);
  const opponentModelRef = useRef<Character3DModel | null>(null);
  const botAiRef = useRef<TacticalBotAI | null>(null);
  const cityMapRef = useRef<CityMap3D | null>(null);
  const combatEngineRef = useRef<CombatEngine3D | null>(null);
  const multiSyncRef = useRef<Multiplayer3DChannel | null>(null);

  // Player Physics & Transform state
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, -8));
  const playerVelocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const playerYaw = useRef<number>(0);
  const playerPitch = useRef<number>(0);
  const isOnGround = useRef<boolean>(true);
  const isCrouching = useRef<boolean>(false);
  const isSprinting = useRef<boolean>(false);
  const isAiming = useRef<boolean>(false);

  // Combat Inventory State
  const activeHeroKey = (selectedHeroId as string) || 'PIYUSH';
  const heroConfig = ROSTER_CHARACTERS[activeHeroKey] || ROSTER_CHARACTERS.PIYUSH;

  const [currentHp, setCurrentHp] = useState<number>(heroConfig.baseHp);
  const [maxHp] = useState<number>(heroConfig.baseHp);
  const [currentArmor, setCurrentArmor] = useState<number>(heroConfig.baseArmor);
  const [maxArmor] = useState<number>(heroConfig.baseArmor);

  // Weapons State
  const [activeWeaponId, setActiveWeaponId] = useState<string>('AR16');
  const [magAmmo, setMagAmmo] = useState<number>(30);
  const [reserveAmmo, setReserveAmmo] = useState<number>(90);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [hitmarkerActive, setHitmarkerActive] = useState<{ active: boolean; isHeadshot: boolean }>({
    active: false,
    isHeadshot: false,
  });

  // Floating damage numbers in 2D overlay
  const [floatingTexts, setFloatingTexts] = useState<FloatingDamageText[]>([]);

  // Special Ability Cooldown
  const [abilityCooldown, setAbilityCooldown] = useState<number>(0);
  const [tacticalScanActive, setTacticalScanActive] = useState<boolean>(false);

  // Match telemetry
  const [matchTimeLeft, setMatchTimeLeft] = useState<number>(300); // 5 min
  const [kills, setKills] = useState<number>(0);
  const [damageDealt, setDamageDealt] = useState<number>(0);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [shotsHit, setShotsHit] = useState<number>(0);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [matchStatus, setMatchStatus] = useState<'PLAYING' | 'VICTORY' | 'DEFEAT'>('PLAYING');
  const [arenaLoading, setArenaLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Smooth loading screen transition into 3D city
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        setLoadingProgress(100);
        clearInterval(interval);
        setTimeout(() => setArenaLoading(false), 400);
      } else {
        setLoadingProgress(current);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Interactive Prompt (e.g. "Press E to pick up Medkit")
  const [nearbyPickupPrompt, setNearbyPickupPrompt] = useState<string | null>(null);
  const activePickupRef = useRef<MapPickupConfig | null>(null);

  // Keyboard state
  const keysPressed = useRef<{ [k: string]: boolean }>({});
  const lastShotTimeRef = useRef<number>(0);
  const tabId = useRef<string>('tab_' + Math.random().toString(36).substring(2, 9)).current;

  // Active weapon object
  const activeWeapon: Weapon3DConfig = WEAPONS_DATABASE[activeWeaponId] || WEAPONS_DATABASE.AR16;

  // Switch Active Weapon
  const selectWeapon = useCallback(
    (wId: string) => {
      if (!WEAPONS_DATABASE[wId]) return;
      const w = WEAPONS_DATABASE[wId];
      setActiveWeaponId(wId);
      setMagAmmo(w.magSize);
      setReserveAmmo(w.reserveAmmo);
      soundEngine.playGunshot(w.category);
    },
    []
  );

  // Reload Active Weapon
  const performReload = useCallback(() => {
    if (isReloading || magAmmo >= activeWeapon.magSize || reserveAmmo <= 0) return;
    setIsReloading(true);
    soundEngine.playReload();

    setTimeout(() => {
      const needed = activeWeapon.magSize - magAmmo;
      const amount = Math.min(needed, reserveAmmo);
      setMagAmmo((prev) => prev + amount);
      setReserveAmmo((prev) => prev - amount);
      setIsReloading(false);
    }, activeWeapon.reloadTimeSec * 1000);
  }, [isReloading, magAmmo, reserveAmmo, activeWeapon]);

  // Execute Special Ability [Q]
  const activateSpecialAbility = useCallback(() => {
    if (abilityCooldown > 0) return;
    setAbilityCooldown(heroConfig.specialAbilities[0]?.cooldownSec || 15);
    soundEngine.playSpecialAbility();

    if (activeHeroKey === 'PIYUSH' || activeHeroKey === 'NOVA') {
      // Tactical Scan: Reveal enemy radar for 6 seconds
      setTacticalScanActive(true);
      setTimeout(() => setTacticalScanActive(false), 6000);
    } else if (activeHeroKey === 'BLAZE' || activeHeroKey === 'GHOST') {
      // Adrenaline Dash: Forward burst speed
      const forwardDir = new THREE.Vector3(Math.sin(playerYaw.current), 0, Math.cos(playerYaw.current));
      playerPos.current.add(forwardDir.multiplyScalar(4.5));
    } else if (activeHeroKey === 'TITAN') {
      // Shield Boost: Overcharge armor +40
      setCurrentArmor((prev) => Math.min(maxArmor + 40, prev + 40));
    }
  }, [abilityCooldown, heroConfig, activeHeroKey, maxArmor]);

  // Main 3D Canvas Initialization & Game Loop
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.018);
    sceneRef.current = scene;

    // 2. Third-Person Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 150);
    camera.position.set(0, 2.2, 4.0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    sunLight.position.set(20, 35, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);

    // 5. City Map & Combat Engine
    const cityMap = new CityMap3D(scene);
    cityMapRef.current = cityMap;

    const combatEngine = new CombatEngine3D(scene);
    combatEngineRef.current = combatEngine;

    // 6. Player 3D Character
    const playerModel = new Character3DModel(activeHeroKey);
    playerModel.root.position.copy(playerPos.current);
    scene.add(playerModel.root);
    playerModelRef.current = playerModel;

    // 7. Tactical AI Opponent Bot (Default opponent)
    const botAi = new TacticalBotAI('TITAN', new THREE.Vector3(12, 0, 12), 'BULL');
    scene.add(botAi.model.root);
    botAiRef.current = botAi;

    // 8. Multiplayer Real-time Sync Channel
    const multiSync = new Multiplayer3DChannel(tabId);
    multiSyncRef.current = multiSync;

    // Remote peer handling when another browser tab joins
    multiSync.onTransform = (p) => {
      if (!opponentModelRef.current) {
        const oppModel = new Character3DModel(p.characterId || 'GHOST');
        scene.add(oppModel.root);
        opponentModelRef.current = oppModel;
      }
      const opp = opponentModelRef.current;
      opp.root.position.set(p.posX, p.posY, p.posZ);
      opp.root.rotation.y = p.rotY;
      opp.updateAnimation(0.016, p.animState as any, 1.0, p.isAiming);
    };

    multiSync.onFire = (p) => {
      combatEngine.createBulletTracer(
        new THREE.Vector3(...p.origin),
        new THREE.Vector3(...p.direction),
        0x38bdf8
      );
      soundEngine.playGunshot('ASSAULT_RIFLE');
    };

    multiSync.onDamage = (p) => {
      if (p.targetPlayerId === activePlayer.id) {
        setCurrentArmor((prev) => Math.max(0, prev - p.armorDmg));
        setCurrentHp((prev) => {
          const next = Math.max(0, prev - p.hpDmg);
          if (next <= 0) {
            setMatchStatus('DEFEAT');
            soundEngine.playMatchEnd(false);
          }
          return next;
        });
        playerModel.triggerHitFlinch();
      }
    };

    // 9. Input Listeners (Keyboard & Mouse Look)
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // Weapon quick numbers 1-5
      if (e.code === 'Digit1') selectWeapon('AR16');
      if (e.code === 'Digit2') selectWeapon('VOLT');
      if (e.code === 'Digit3') selectWeapon('R9');
      if (e.code === 'Digit4') selectWeapon('BULL');
      if (e.code === 'Digit5') selectWeapon('PHANTOM');

      if (e.code === 'KeyR') performReload();
      if (e.code === 'KeyQ') activateSpecialAbility();
      if (e.code === 'KeyF') triggerMeleeAttack();
      if (e.code === 'KeyE') triggerPickupInteract();
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      }
      if (e.code === 'Escape') {
        setShowSettingsModal((prev) => !prev);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if (e.code === 'Tab') setShowScoreboard(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      // Orbit camera rotation
      const sens = 0.0024;
      playerYaw.current -= e.movementX * sens;
      playerPitch.current = Math.max(-0.6, Math.min(0.6, playerPitch.current - e.movementY * sens));
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // LMB: Shoot
        triggerWeaponFire();
      } else if (e.button === 2) {
        // RMB: Aim Down Sights
        isAiming.current = true;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        isAiming.current = false;
      }
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('contextmenu', onContextMenu);

    // Pointer Lock click to lock cursor
    container.onclick = () => {
      container.requestPointerLock?.();
    };

    // 10. Main Animation Frame Loop
    let clock = new THREE.Clock();

    const loop = () => {
      const delta = Math.min(0.06, clock.getDelta());

      // Update Map & Pickups
      cityMap.update(delta);
      combatEngine.update(delta);
      setFloatingTexts([...combatEngine.floatingTexts]);

      // A. Player Physics & Locomotion
      if (matchStatus === 'PLAYING') {
        updatePlayerMovement(delta, cityMap);
      }

      // B. Camera Third-Person Orbit Follow
      updateThirdPersonCamera(camera);

      // C. Tactical Bot AI Update
      if (botAi && !botAi.isDead && matchStatus === 'PLAYING') {
        botAi.update(delta, playerPos.current, cityMap, combatEngine, (hit, hpDmg, armorDmg, isHead) => {
          if (hit) {
            setCurrentArmor((prev) => Math.max(0, prev - armorDmg));
            setCurrentHp((prev) => {
              const next = Math.max(0, prev - hpDmg);
              if (next <= 0) {
                setMatchStatus('DEFEAT');
                soundEngine.playMatchEnd(false);
              }
              return next;
            });
            playerModel.triggerHitFlinch();
          }
        });
      }

      // D. Broadcast Multi-Tab Transform Packet
      if (multiSync) {
        multiSync.sendTransform(
          activePlayer.id,
          activeHeroKey,
          playerPos.current,
          playerYaw.current,
          playerModel.currentAnim,
          isAiming.current,
          isCrouching.current,
          activeWeaponId
        );
      }

      // E. Check Nearby Map Pickups for [E] prompt
      checkNearbyPickups(cityMap);

      // Render
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    // Ability cooldown tick down
    const cdInterval = setInterval(() => {
      setAbilityCooldown((prev) => Math.max(0, prev - 1));
      setMatchTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearInterval(cdInterval);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('contextmenu', onContextMenu);
      multiSync.dispose();
      renderer.dispose();
    };
  }, [activeHeroKey, matchStatus]);

  // Update Player Locomotion, Jumping & Map Collisions
  const updatePlayerMovement = (delta: number, map: CityMap3D) => {
    const model = playerModelRef.current;
    if (!model) return;

    const moveSpeed = (isSprinting.current ? 7.2 : isCrouching.current ? 2.2 : 4.4) * (heroConfig.speed / 75);
    const forward = new THREE.Vector3(Math.sin(playerYaw.current), 0, Math.cos(playerYaw.current));
    const right = new THREE.Vector3(Math.cos(playerYaw.current), 0, -Math.sin(playerYaw.current));

    const moveDir = new THREE.Vector3();
    if (keysPressed.current['KeyW']) moveDir.add(forward);
    if (keysPressed.current['KeyS']) moveDir.sub(forward);
    if (keysPressed.current['KeyA']) moveDir.add(right);
    if (keysPressed.current['KeyD']) moveDir.sub(right);

    isSprinting.current = !!keysPressed.current['ShiftLeft'] || !!keysPressed.current['ShiftRight'];
    isCrouching.current = !!keysPressed.current['ControlLeft'] || !!keysPressed.current['KeyC'];

    // Jump
    if (keysPressed.current['Space'] && isOnGround.current) {
      playerVelocity.current.y = 5.2;
      isOnGround.current = false;
      model.updateAnimation(delta, 'JUMP');
    }

    // Apply gravity
    playerVelocity.current.y -= 9.8 * delta * 1.8;
    playerPos.current.y += playerVelocity.current.y * delta;

    // Floor collision
    if (playerPos.current.y <= 0) {
      playerPos.current.y = 0;
      playerVelocity.current.y = 0;
      isOnGround.current = true;
    }

    // Horizontal Movement & Map Collision
    if (moveDir.lengthSq() > 0.01) {
      moveDir.normalize();
      const nextPos = playerPos.current.clone().add(moveDir.clone().multiplyScalar(moveSpeed * delta));

      if (!map.checkCollision(nextPos, 0.4)) {
        playerPos.current.copy(nextPos);
      }

      // Animation State
      const animState = isCrouching.current
        ? 'CROUCH'
        : isSprinting.current
        ? 'SPRINT'
        : 'RUN';
      model.updateAnimation(delta, animState, isSprinting.current ? 1.4 : 1.0, isAiming.current);

      // Footstep sound
      if (Math.random() < (isSprinting.current ? 0.08 : 0.04)) {
        soundEngine.playFootstep(isSprinting.current);
      }
    } else {
      const idleState = isCrouching.current ? 'CROUCH' : 'IDLE';
      model.updateAnimation(delta, idleState, 0.8, isAiming.current);
    }

    // Model transforms
    model.root.position.copy(playerPos.current);
    model.root.rotation.y = playerYaw.current + Math.PI; // Look in direction of aim
  };

  // Third-Person Over-The-Shoulder Camera
  const updateThirdPersonCamera = (camera: THREE.PerspectiveCamera) => {
    const pPos = playerPos.current;
    const yaw = playerYaw.current;
    const pitch = playerPitch.current;

    // Camera offset behind right shoulder
    const cameraDist = isAiming.current ? 2.0 : 3.4;
    const shoulderOffset = isAiming.current ? 0.6 : 0.45;
    const heightOffset = isCrouching.current ? 1.2 : 1.7;

    const camX = pPos.x - Math.sin(yaw) * cameraDist + Math.cos(yaw) * shoulderOffset;
    const camY = pPos.y + heightOffset + Math.sin(pitch) * cameraDist;
    const camZ = pPos.z - Math.cos(yaw) * cameraDist - Math.sin(yaw) * shoulderOffset;

    camera.position.set(camX, camY, camZ);

    // Look target ahead of player
    const targetLook = pPos.clone().add(new THREE.Vector3(
      Math.sin(yaw) * 20,
      heightOffset - Math.sin(pitch) * 20,
      Math.cos(yaw) * 20
    ));
    camera.lookAt(targetLook);

    // Field of view zoom (ADS)
    const targetFov = isAiming.current ? activeWeapon.zoomFov : 65;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.18);
    camera.updateProjectionMatrix();
  };

  // Trigger Weapon Gunshot
  const triggerWeaponFire = () => {
    if (isReloading || magAmmo <= 0 || matchStatus !== 'PLAYING') {
      if (magAmmo <= 0) performReload();
      return;
    }

    const now = Date.now();
    const minDelayMs = 1000 / activeWeapon.fireRateRps;
    if (now - lastShotTimeRef.current < minDelayMs) return;
    lastShotTimeRef.current = now;

    // Deduct ammo
    setMagAmmo((prev) => prev - 1);
    setShotsFired((prev) => prev + 1);

    // Muzzle flash on model
    playerModelRef.current?.triggerMuzzleFlash(activeWeapon.muzzleLightColor);

    // Raycast calculate hit
    const combat = combatEngineRef.current;
    const bot = botAiRef.current;
    if (!combat || !cameraRef.current) return;

    const origin = playerPos.current.clone().add(new THREE.Vector3(0, 1.3, 0));
    const forward = new THREE.Vector3(
      Math.sin(playerYaw.current),
      -Math.sin(playerPitch.current),
      Math.cos(playerYaw.current)
    ).normalize();

    // Accuracy recoil spread
    const spread = isAiming.current ? activeWeapon.spreadAngleRad * 0.4 : activeWeapon.spreadAngleRad;
    forward.x += (Math.random() - 0.5) * spread;
    forward.y += (Math.random() - 0.5) * spread;
    forward.normalize();

    const targetModel = bot?.model.root;
    const targetHeadPos = bot ? bot.position.clone().add(new THREE.Vector3(0, 1.6, 0)) : undefined;

    const res = combat.processShot(
      origin,
      forward,
      activeWeapon,
      targetModel,
      targetHeadPos,
      bot?.armor || 0
    );

    if (res.hit && bot) {
      setShotsHit((prev) => prev + 1);
      setDamageDealt((prev) => prev + res.damage + res.armorDamage);
      setHitmarkerActive({ active: true, isHeadshot: res.isHeadshot });
      setTimeout(() => setHitmarkerActive({ active: false, isHeadshot: false }), 120);

      const fatal = bot.takeDamage(res.damage, res.armorDamage);
      if (fatal) {
        setKills((prev) => prev + 1);
        setMatchStatus('VICTORY');
        soundEngine.playMatchEnd(true);
      }
    }

    // Broadcast fire over multi-tab network
    multiSyncRef.current?.sendFire(
      activePlayer.id,
      [origin.x, origin.y, origin.z],
      [forward.x, forward.y, forward.z],
      activeWeaponId
    );
  };

  // Trigger Melee Strike (Fists / Knife)
  const triggerMeleeAttack = () => {
    if (matchStatus !== 'PLAYING') return;
    playerModelRef.current?.triggerMelee('PUNCH');

    const combat = combatEngineRef.current;
    const bot = botAiRef.current;
    if (!combat || !bot) return;

    const forward = new THREE.Vector3(Math.sin(playerYaw.current), 0, Math.cos(playerYaw.current));
    const res = combat.processMelee(playerPos.current, forward, bot.position, bot.armor);

    if (res.hit) {
      setDamageDealt((prev) => prev + res.damage);
      const fatal = bot.takeDamage(res.damage, res.armorDamage);
      if (fatal) {
        setKills((prev) => prev + 1);
        setMatchStatus('VICTORY');
        soundEngine.playMatchEnd(true);
      }
    }
    multiSyncRef.current?.sendMelee(activePlayer.id, 'PUNCH');
  };

  // Check Nearby Map Pickups for [E] prompt
  const checkNearbyPickups = (map: CityMap3D) => {
    let nearestPickup: MapPickupConfig | null = null;
    let minDist = 2.4;

    for (const p of map.pickups) {
      if (p.active) {
        const d = playerPos.current.distanceTo(new THREE.Vector3(...p.config.position));
        if (d < minDist) {
          minDist = d;
          nearestPickup = p.config;
        }
      }
    }

    activePickupRef.current = nearestPickup;
    if (nearestPickup) {
      setNearbyPickupPrompt(`Press [E] to pick up ${(nearestPickup as MapPickupConfig).name}`);
    } else {
      setNearbyPickupPrompt(null);
    }
  };

  // Trigger Pickup Interact [E]
  const triggerPickupInteract = () => {
    const pickup = activePickupRef.current;
    const map = cityMapRef.current;
    if (!pickup || !map) return;

    const found = map.pickups.find((p) => p.config.id === pickup.id);
    if (!found || !found.active) return;

    found.active = false;
    found.mesh.visible = false;
    found.respawnTimer = pickup.respawnTimeSec;
    soundEngine.playPickup(pickup.type);

    if (pickup.type === 'MEDKIT') {
      setCurrentHp((prev) => Math.min(maxHp, prev + pickup.value));
    } else if (pickup.type === 'ARMOR') {
      setCurrentArmor((prev) => Math.min(maxArmor, prev + pickup.value));
    } else if (pickup.type === 'AMMO') {
      setReserveAmmo((prev) => prev + pickup.value);
    } else if (pickup.type === 'WEAPON' && pickup.weaponId) {
      selectWeapon(pickup.weaponId);
    }
    multiSyncRef.current?.sendPickup(pickup.id);
  };

  // Accuracy math
  const accuracyPercent = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;

  return (
    <div className="relative w-full h-[82vh] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none font-mono">
      {/* Arena Loading Screen Transition */}
      {arenaLoading && (
        <div className="absolute inset-0 z-50 bg-[#07090e] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-black text-cyan-400 tracking-widest uppercase flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>ENTERING ABANDONED CITY...</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-wider font-mono">
              ARENA<span className="text-cyan-400">X</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono max-w-sm">
              Spawning Piyush (Tactical Warrior) · Initializing Unreal-style 3D Physics & Bot AI
            </p>
          </div>

          {/* Tactical Progress Bar */}
          <div className="w-64 max-w-full space-y-2">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>LOADING ARENA</span>
              <span className="text-cyan-300 font-bold">{loadingProgress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            WASD: Move · LMB: Fire · RMB: ADS Aim · Q: Tactical Vision · E: Pickup
          </div>
        </div>
      )}

      {/* Three.js 3D Viewport Canvas */}
      <div
        ref={canvasContainerRef}
        className="w-full h-full cursor-crosshair relative"
        title="Click into arena for over-the-shoulder mouse look combat"
      ></div>

      {/* Crosshair & Dynamic Hitmarker (Screen Center) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Reticle */}
        <div
          className={`relative transition-all ${
            isAiming.current ? 'scale-75 opacity-90' : 'scale-100 opacity-60'
          }`}
        >
          {/* Center Dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mx-auto"></div>

          {/* Crosshair Spikes */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-cyan-400"></div>
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-cyan-400"></div>
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-2.5 h-0.5 bg-cyan-400"></div>
          <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-2.5 h-0.5 bg-cyan-400"></div>
        </div>

        {/* Hitmarker X */}
        {hitmarkerActive.active && (
          <div
            className={`absolute text-2xl font-black animate-ping ${
              hitmarkerActive.isHeadshot ? 'text-amber-300' : 'text-rose-500'
            }`}
          >
            ✕
          </div>
        )}
      </div>

      {/* Floating 3D Damage Indicator Numbers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className={`absolute text-sm font-black transform -translate-x-1/2 -translate-y-1/2 transition-opacity ${f.color}`}
            style={{
              left: `${50 + (f.worldPos.x - playerPos.current.x) * 18}%`,
              top: `${50 - (f.worldPos.y - playerPos.current.y) * 22}%`,
            }}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* Top HUD: Health & Armor & Timer Ribbon */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Player Health & Ballistic Armor Bars */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 backdrop-blur-md shadow-xl w-64 space-y-2">
          {/* Health Bar */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> HP
              </span>
              <span className={currentHp <= 30 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}>
                {currentHp} / {maxHp}
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300"
                style={{ width: `${(currentHp / maxHp) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Armor Bar */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> ARMOR
              </span>
              <span className="text-blue-300">{currentArmor} / {maxArmor}</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${(currentArmor / maxArmor) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Match Timer & Kill Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 backdrop-blur-md flex items-center gap-4 text-xs font-bold text-slate-200">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Clock className="w-4 h-4" />
            <span>
              {Math.floor(matchTimeLeft / 60)
                .toString()
                .padStart(2, '0')}
              :{(matchTimeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-rose-400">
            <Skull className="w-4 h-4" />
            <span>KILLS: {kills}</span>
          </div>
        </div>

        {/* Top-Right Minimap Radar & Audio Toggle & Exit Button */}
        <div className="flex items-start gap-2 pointer-events-auto">
          {/* Exit / Return button */}
          <button
            onClick={() => setCurrentScreen('DASHBOARD')}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Return to Dashboard"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Exit Arena</span>
          </button>

          {/* Audio Mute button */}
          <button
            onClick={() => setIsMuted(soundEngine.toggleMute())}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Minimap Radar */}
          <div className="w-28 h-28 rounded-2xl bg-slate-950/90 border-2 border-slate-800 relative overflow-hidden backdrop-blur-md shadow-2xl flex items-center justify-center">
            {/* Radar Grid Circles */}
            <div className="absolute inset-2 rounded-full border border-slate-800/80"></div>
            <div className="absolute inset-6 rounded-full border border-slate-800/60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-slate-800/40"></div>
              <div className="absolute h-full w-0.5 bg-slate-800/40"></div>
            </div>

            {/* Radar Sweep Line */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin"></div>

            {/* Player Arrow Marker (Center) */}
            <div
              className="w-3 h-3 bg-cyan-400 rounded-xs transform -rotate-45 shadow-sm shadow-cyan-400"
              style={{ transform: `rotate(${-playerYaw.current}rad)` }}
            ></div>

            {/* Enemy Radar Blip */}
            <div
              className={`absolute w-2.5 h-2.5 rounded-full bg-rose-500 ${
                tacticalScanActive ? 'animate-ping ring-2 ring-rose-400' : 'animate-pulse'
              }`}
              style={{ top: '25%', right: '30%' }}
              title="Enemy Location"
            ></div>

            {/* Weapon Pickups on radar */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 top-3 left-4"></div>
            <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 bottom-3 right-5"></div>
          </div>
        </div>
      </div>

      {/* Pickup Interact Prompt [E] */}
      {nearbyPickupPrompt && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-cyan-500 text-cyan-200 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl animate-bounce pointer-events-none z-30">
          {nearbyPickupPrompt}
        </div>
      )}

      {/* Bottom HUD: Weapon Arsenal, Ammo & Special Ability [Q] */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-none z-20">
        {/* Left: Weapon Slots [1] [2] [3] [4] [5] & Melee [F] */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 backdrop-blur-md pointer-events-auto">
          {[
            { id: 'AR16', slot: '1', name: 'AR-16' },
            { id: 'VOLT', slot: '2', name: 'SMG' },
            { id: 'R9', slot: '3', name: 'PISTOL' },
            { id: 'BULL', slot: '4', name: 'SHOTGUN' },
            { id: 'PHANTOM', slot: '5', name: 'SNIPER' },
          ].map((w) => (
            <button
              key={w.id}
              onClick={() => selectWeapon(w.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                activeWeaponId === w.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-[9px] opacity-60 mr-1">[{w.slot}]</span>
              <span>{w.name}</span>
            </button>
          ))}

          {/* Quick Melee Punch [F] */}
          <button
            onClick={triggerMeleeAttack}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 cursor-pointer"
            title="Melee Attack"
          >
            [F] MELEE
          </button>
        </div>

        {/* Right: Active Ammo Magazine & Special Ability [Q] */}
        <div className="flex items-center gap-3">
          {/* Special Ability Button [Q] */}
          <button
            onClick={activateSpecialAbility}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer pointer-events-auto backdrop-blur-md ${
              abilityCooldown <= 0
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/60 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-500'
            }`}
            title="Activate Special Ability"
          >
            <div className="text-xs font-black flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>[Q] {heroConfig.specialAbilities[0]?.name || 'SPECIAL'}</span>
            </div>
            <div className="text-[10px] mt-0.5 font-mono">
              {abilityCooldown <= 0 ? 'READY' : `${abilityCooldown}s CD`}
            </div>
          </button>

          {/* Active Ammo Counter */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 backdrop-blur-md shadow-xl text-right">
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {activeWeapon.name}
            </div>
            <div className="text-2xl font-black text-slate-100 flex items-baseline gap-1.5">
              <span className={magAmmo <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}>
                {magAmmo}
              </span>
              <span className="text-slate-500 text-xs font-normal">/ {reserveAmmo}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {isReloading ? 'RELOADING...' : '[R] RELOAD'}
            </div>
          </div>
        </div>
      </div>

      {/* In-Game Scoreboard Overlay [TAB] */}
      {showScoreboard && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-40">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-slate-100 text-lg">MATCH SCOREBOARD</h3>
              <span className="text-xs text-cyan-400">1v1 Elimination</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-800">
                <span className="font-bold text-slate-100">{activePlayer.username} ({heroConfig.name})</span>
                <div className="flex gap-6 font-mono text-cyan-300">
                  <span>Kills: {kills}</span>
                  <span>Dmg: {damageDealt}</span>
                  <span>Acc: {accuracyPercent}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400">Opponent ({botAiRef.current?.model.config.name || 'Titan'})</span>
                <div className="flex gap-6 font-mono text-slate-400">
                  <span>Kills: 0</span>
                  <span>Dmg: 45</span>
                  <span>Status: {botAiRef.current?.isDead ? 'ELIMINATED' : 'ACTIVE'}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">Release [TAB] to close</p>
          </div>
        </div>
      )}

      {/* Post-Match Results Overlay (VICTORY / DEFEAT) */}
      {matchStatus !== 'PLAYING' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in zoom-in-95">
          <div
            className={`max-w-md w-full p-8 rounded-3xl border-2 text-center space-y-6 shadow-2xl ${
              matchStatus === 'VICTORY'
                ? 'bg-slate-900 border-emerald-500'
                : 'bg-slate-900 border-rose-500'
            }`}
          >
            {/* Trophy or Skull */}
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg ${
                matchStatus === 'VICTORY'
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  : 'bg-rose-950 border border-rose-500 text-rose-400'
              }`}
            >
              {matchStatus === 'VICTORY' ? '🏆' : '💀'}
            </div>

            <div>
              <h2
                className={`text-4xl font-black tracking-wider ${
                  matchStatus === 'VICTORY' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {matchStatus === 'VICTORY' ? 'VICTORY' : 'DEFEAT'}
              </h2>
              <p className="text-xs text-slate-300 font-bold mt-1">
                {matchStatus === 'VICTORY'
                  ? 'You eliminated the rival combatant!'
                  : 'You were eliminated in the combat zone.'}
              </p>
            </div>

            {/* Combat Statistics */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">KILLS</div>
                <div className="text-lg font-black text-slate-100">{kills}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">DAMAGE</div>
                <div className="text-lg font-black text-slate-100">{damageDealt}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">ACCURACY</div>
                <div className="text-lg font-black text-cyan-400">{accuracyPercent}%</div>
              </div>
            </div>

            {/* Rewards Ribbon */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-400">RATING</div>
                <div className="text-base font-black text-emerald-400">
                  {matchStatus === 'VICTORY' ? '+25 ELO' : '-18 ELO'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">XP GAIN</div>
                <div className="text-base font-black text-cyan-400">
                  {matchStatus === 'VICTORY' ? '+450 XP' : '+100 XP'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">BATTLE GOLD</div>
                <div className="text-base font-black text-amber-400">
                  {matchStatus === 'VICTORY' ? '+120 🪙' : '+25 🪙'}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setMatchStatus('PLAYING');
                  setCurrentHp(heroConfig.baseHp);
                  setCurrentArmor(heroConfig.baseArmor);
                  playerPos.current.set(0, 0, -8);
                  if (botAiRef.current) {
                    botAiRef.current.hp = botAiRef.current.maxHp;
                    botAiRef.current.isDead = false;
                    botAiRef.current.model.isDead = false;
                    botAiRef.current.position.set(12, 0, 12);
                  }
                }}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
              >
                [ PLAY AGAIN ]
              </button>

              <button
                onClick={() => setCurrentScreen('DASHBOARD')}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                [ DASHBOARD ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Game Instructions Bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/70 border border-slate-800/80 rounded-full px-4 py-1 text-[10px] text-slate-400 backdrop-blur-xs hidden md:flex items-center gap-3 pointer-events-none">
        <span>WASD: Move</span>
        <span>·</span>
        <span>Shift: Sprint</span>
        <span>·</span>
        <span>Ctrl: Crouch</span>
        <span>·</span>
        <span>Space: Jump</span>
        <span>·</span>
        <span>LMB: Shoot</span>
        <span>·</span>
        <span>RMB: Aim (ADS)</span>
        <span>·</span>
        <span>F: Melee</span>
        <span>·</span>
        <span>R: Reload</span>
      </div>
    </div>
  );
};
