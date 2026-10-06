import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useArena } from '../../context/ArenaContext';
import { Character3DModel } from '../../game3d/characterModel';
import { CityMap3D } from '../../game3d/cityMap';
import { Play, Gamepad2, Shield, Zap, Target, ArrowRight, Volume2, VolumeX, Sparkles, User, Crosshair } from 'lucide-react';

interface CinematicLanding3DProps {
  onEnterGame: () => void;
  onExplore3D: () => void;
}

export const CinematicLanding3D: React.FC<CinematicLanding3DProps> = ({ onEnterGame, onExplore3D }) => {
  const { activePlayer, setCurrentScreen, isLoggedIn } = useArena();
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const heroModelRef = useRef<Character3DModel | null>(null);
  const distantEnemyRef = useRef<THREE.Group | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Cinematic sequence timings
  const [cinematicPhase, setCinematicPhase] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isHoveringHero, setIsHoveringHero] = useState<boolean>(false);

  // Timeline tracking
  const startTimeRef = useRef<number>(Date.now());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    // Detect reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup with atmospheric fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.024);
    sceneRef.current = scene;

    // 2. Camera setup - starts back in dark city street
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 150);
    // Initial distant cinematic vantage
    camera.position.set(0, 3.2, 18.0);
    camera.lookAt(0, 1.4, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Detailed Environment Background
    const cityMap = new CityMap3D(scene);

    // 5. Cinematic Lighting: Three-Point Lighting with Face Clarity
    // Cool blue ambient fill
    const ambientLight = new THREE.AmbientLight(0x334155, 1.4);
    scene.add(ambientLight);

    // Warm Key Spotlight directly on Piyush's face & chest
    const keySpotlight = new THREE.SpotLight(0xffedd5, 5.5, 25, Math.PI / 4, 0.4, 1.2);
    keySpotlight.position.set(1.8, 4.2, 4.5);
    keySpotlight.target.position.set(0, 1.35, 0);
    keySpotlight.castShadow = true;
    keySpotlight.shadow.mapSize.width = 1024;
    keySpotlight.shadow.mapSize.height = 1024;
    scene.add(keySpotlight);
    scene.add(keySpotlight.target);

    // Dedicated soft face fill light so eyes, glasses and expression never fade into dark
    const faceFillLight = new THREE.PointLight(0x67e8f9, 2.8, 8);
    faceFillLight.position.set(-0.8, 1.7, 2.2);
    scene.add(faceFillLight);

    // Fiery red/orange Rim Light from behind Piyush for dramatic silhouette definition
    const rimLight = new THREE.DirectionalLight(0xf97316, 3.2);
    rimLight.position.set(-3.5, 5.0, -4.0);
    scene.add(rimLight);

    // Secondary cyan shoulder edge light
    const edgeLight = new THREE.PointLight(0x06b6d4, 2.5, 12);
    edgeLight.position.set(3.0, 2.5, -2.0);
    scene.add(edgeLight);

    // 6. Piyush Main Hero 3D Model (Prominent heroic athletic stance)
    const hero = new Character3DModel('PIYUSH');
    // Positioned slightly to the right to leave composition balance for the title & CTAs on the left
    hero.root.position.set(0.65, 0, 0);
    hero.root.rotation.y = -0.28; // Dynamic 3/4 hero presentation angle facing towards camera
    hero.root.scale.set(1.15, 1.15, 1.15); // Heroic athletic presence (35-45% viewport presence)
    scene.add(hero.root);
    heroModelRef.current = hero;

    // 7. Distant Enemy Silhouette patrolling across rooftop
    const enemyGroup = new THREE.Group();
    const enemyMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
    const enemyBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.7, 0.3), enemyMat);
    enemyBody.position.set(0, 0.85, 0);
    enemyGroup.add(enemyBody);
    enemyGroup.position.set(16, 5.0, 14); // Bank sniper rooftop
    scene.add(enemyGroup);
    distantEnemyRef.current = enemyGroup;

    // Distant sniper red laser sight trace
    const laserMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.65 });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(16, 5.5, 14),
      new THREE.Vector3(4, 0.5, -4),
    ]);
    const laserLine = new THREE.Line(laserGeo, laserMat);
    scene.add(laserLine);

    // 8. Atmospheric Floating Particles & Smoke Effect
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.08,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const smokeParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(smokeParticles);
    smokeParticlesRef.current = smokeParticles;

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    startTimeRef.current = Date.now();
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      setCinematicPhase(elapsedSec);

      // Procedural Idle Animation for Piyush (breathing, subtle weapon shift, neck turn)
      if (heroModelRef.current) {
        heroModelRef.current.updateAnimation(delta, 'IDLE', 0.8, false);

        // Subtle lifelike weapon adjustment & head tracking
        const headSway = Math.sin(elapsedSec * 0.7) * 0.08;
        heroModelRef.current.headGroup.rotation.y = headSway;
      }

      // Distant enemy rooftop patrol shift
      if (distantEnemyRef.current) {
        distantEnemyRef.current.position.x = 16 + Math.sin(elapsedSec * 0.4) * 2.8;
      }

      // Smoke particle drift
      if (smokeParticlesRef.current) {
        const posAttr = smokeParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          array[i * 3 + 1] += delta * 0.15; // float upward
          array[i * 3] += Math.sin(elapsedSec + i) * 0.005; // slight wind drift
          if (array[i * 3 + 1] > 8) array[i * 3 + 1] = 0;
        }
        posAttr.needsUpdate = true;
      }

      // Cinematic Camera Push-In Timeline (0s to 7s)
      if (cameraRef.current) {
        const heroFocusPoint = new THREE.Vector3(0.65, 1.45, 0);

        if (prefersReducedMotion) {
          // Static optimal 3/4 hero showcase view framing Piyush prominently
          cameraRef.current.position.set(0.65, 1.75, 3.2);
          cameraRef.current.lookAt(heroFocusPoint);
        } else {
          // 0 - 2s: Distant street reveal (z: 14 -> 8)
          // 2 - 5s: Smooth push-in to 3/4 athletic hero framing (z: 8 -> 3.2, y: 2.8 -> 1.75, x: 0 -> 0.65)
          // 5s+: Gentle cinematic breathing orbit
          if (elapsedSec < 5.0) {
            const t = Math.min(1.0, elapsedSec / 5.0);
            const ease = 1 - Math.pow(1 - t, 3);
            const currentZ = THREE.MathUtils.lerp(12.0, 3.2, ease);
            const currentY = THREE.MathUtils.lerp(2.8, 1.75, ease);
            const currentX = THREE.MathUtils.lerp(0.0, 0.65, ease);
            cameraRef.current.position.set(currentX, currentY, currentZ);
            cameraRef.current.lookAt(heroFocusPoint);
          } else {
            // Subtle slow orbit around Piyush
            const orbitT = (elapsedSec - 5.0) * 0.25;
            const orbitX = 0.65 + Math.sin(orbitT) * 0.35;
            const orbitZ = 3.2 + Math.cos(orbitT) * 0.2;
            const orbitY = 1.75 + Math.sin(orbitT * 0.5) * 0.06;
            cameraRef.current.position.set(orbitX, orbitY, orbitZ);
            cameraRef.current.lookAt(heroFocusPoint);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [prefersReducedMotion]);

  // Timed reveal flags
  const showHeroDetails = cinematicPhase > 3.0 || prefersReducedMotion;
  const showBranding = cinematicPhase > 5.0 || prefersReducedMotion;
  const showActionButtons = cinematicPhase > 6.0 || prefersReducedMotion;

  return (
    <div className="relative w-full h-[88vh] min-h-[640px] max-h-[920px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#07090e] select-none font-mono">
      {/* 3D Canvas Viewport */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      />

      {/* Atmospheric Vignette & Gradients (leaves character center crystal clear) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#060910] via-transparent to-[#07090e]/70 z-10" />
      <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none bg-gradient-to-r from-[#060910]/95 via-[#060910]/50 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none bg-gradient-to-l from-[#060910]/80 to-transparent z-10" />

      {/* Top Floating Badge Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>UNREAL ENGINE INSPIRED · 1v1 REALISTIC 3D ARENA</span>
          </div>
        </div>

        {/* Audio Mute & Reduced Motion controls */}
        <div className="flex items-center gap-2">
          {prefersReducedMotion && (
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
              Reduced Motion Active
            </span>
          )}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors cursor-pointer backdrop-blur-md"
            title="Toggle Atmosphere Sound"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Hero Overlay Content: Left Side Pillar & CTAs */}
      <div className="absolute inset-y-0 left-6 sm:left-12 flex flex-col justify-center max-w-xl z-20 pointer-events-none">
        <div className="space-y-6 pointer-events-auto">
          {/* Hero Name / Tagline Reveal */}
          <div
            className={`space-y-2 transition-all duration-1000 ${
              showBranding ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>MAIN HERO · TACTICAL WARRIOR</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white font-mono leading-none drop-shadow-xl">
              ARENA<span className="text-cyan-400">X</span>
            </h1>

            <div className="text-2xl sm:text-3xl font-extrabold text-slate-200 tracking-wide flex items-center gap-3">
              <span>REAL PLAYERS.</span>
              <span className="text-cyan-400">REAL COMBAT.</span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 font-sans max-w-md leading-relaxed font-normal drop-shadow-md">
              Enter the abandoned city colosseum. Step into the boots of <strong className="text-white font-semibold">Piyush</strong>, master real-time 3D tactical marksmanship, and claim the championship ranking.
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div
            className={`flex flex-wrap items-center gap-4 pt-2 transition-all duration-1000 ${
              showActionButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Primary PLAY NOW Button */}
            <button
              onClick={onEnterGame}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base uppercase tracking-wider flex items-center gap-3 transition-all transform hover:scale-105 shadow-2xl shadow-cyan-500/40 cursor-pointer group"
            >
              <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
              <span>[ PLAY NOW ]</span>
            </button>

            {/* Direct 3D Arena Map Exploration */}
            <button
              onClick={onExplore3D}
              className="px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 hover:border-cyan-500/60 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all transform hover:scale-105 shadow-xl backdrop-blur-md cursor-pointer"
            >
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              <span>[ EXPLORE 3D ARENA ]</span>
            </button>
          </div>

          {/* Quick Hero Loadout HUD Card */}
          <div
            className={`p-4 rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md max-w-md transition-all duration-1000 ${
              showHeroDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/80 relative">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                    alt="Piyush Hero Portrait"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-cyan-400 ring-inset rounded-xl" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100 leading-tight">PIYUSH · PIYUSH#ARENA</div>
                  <div className="text-[10px] text-cyan-400 font-semibold">CLASS: TACTICAL WARRIOR</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">LEVEL 12</span>
                <span className="text-xs font-extrabold text-amber-400">⭐ 1425 ELO</span>
              </div>
            </div>

            {/* Hero Combat Stats Grid */}
            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500">HP</div>
                <div className="font-extrabold text-emerald-400">100</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500">ARMOR</div>
                <div className="font-extrabold text-blue-400">60</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500">SPEED</div>
                <div className="font-extrabold text-amber-300">85</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500">STR</div>
                <div className="font-extrabold text-purple-400">75</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500">ACCURACY</div>
                <div className="font-extrabold text-cyan-300">90%</div>
              </div>
            </div>

            {/* Special Ability Pill */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-200">
              <span className="flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ability: TACTICAL VISION [Q]</span>
              </span>
              <span className="text-[10px] text-slate-400">5s duration · 25s CD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Tactical 3D Inspection Tag */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none hidden md:block text-right">
        <div className="inline-flex flex-col items-end gap-1 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
          <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Interactive 3D Viewport</span>
          </div>
          <div className="text-xs text-slate-300">Drag mouse to orbit · WASD during match</div>
          <div className="text-[10px] text-slate-500 mt-1">GLTF Model Ready: /public/models/piyush.glb</div>
        </div>
      </div>
    </div>
  );
};
