import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ROSTER_CHARACTERS, CharacterRosterItem } from '../../data/characters3DData';
import { Character3DModel } from '../../game3d/characterModel';
import { useArena } from '../../context/ArenaContext';
import {
  Sparkles,
  Shield,
  Heart,
  Zap,
  Target,
  Swords,
  Crosshair,
  RotateCw,
  Check,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';

interface CharacterShowcase3DProps {
  onSelectHero?: (heroId: string) => void;
}

export const CharacterShowcase3D: React.FC<CharacterShowcase3DProps> = ({ onSelectHero }) => {
  const { selectedHeroId, setSelectedHeroId } = useArena();
  const [activeHeroKey, setActiveHeroKey] = useState<string>(selectedHeroId || 'PIYUSH');
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const characterModelRef = useRef<Character3DModel | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseXRef = useRef<number>(0);

  const currentHero: CharacterRosterItem =
    ROSTER_CHARACTERS[activeHeroKey] || ROSTER_CHARACTERS.PIYUSH;

  // Initialize 3D Turntable Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 3.4);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e6, 2.2);
    keyLight.position.set(2, 3, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(currentHero.accentColor), 2.5);
    rimLight.position.set(-2.5, 2, -2);
    scene.add(rimLight);

    // Circular pedestal platform
    const platformGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.15, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.3,
      metalness: 0.7,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.08;
    platform.receiveShadow = true;
    scene.add(platform);

    const ringGeo = new THREE.RingGeometry(1.15, 1.25, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(currentHero.accentColor),
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.005;
    scene.add(ring);

    // 5. Load 3D Character Model
    const model = new Character3DModel(activeHeroKey);
    model.root.position.set(0, 0, 0);
    scene.add(model.root);
    characterModelRef.current = model;

    // 6. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      if (model) {
        model.updateAnimation(delta, 'IDLE', 0.8, false);
        if (isRotating && !isDraggingRef.current) {
          model.root.rotation.y += delta * 0.45;
        }
      }
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 7. Mouse drag rotation handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && model) {
        const deltaX = e.clientX - prevMouseXRef.current;
        model.root.rotation.y += deltaX * 0.01;
        prevMouseXRef.current = e.clientX;
      }
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [activeHeroKey]);

  const handleSelectActive = () => {
    setSelectedHeroId(activeHeroKey as any);
    if (onSelectHero) onSelectHero(activeHeroKey);
  };

  const isCurrentEquipped = (selectedHeroId || 'PIYUSH') === activeHeroKey;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-mono">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>3D Gladiator Arsenal & Roster</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            HERO <span className="text-cyan-400 uppercase">{currentHero.name}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            &quot;{currentHero.quote}&quot; — {currentHero.description}
          </p>
        </div>

        <button
          onClick={handleSelectActive}
          className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all transform hover:scale-105 shadow-xl cursor-pointer ${
            isCurrentEquipped
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
          }`}
        >
          {isCurrentEquipped ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>CURRENTLY DEPLOYED</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              <span>DEPLOY IN 3D ARENA</span>
            </>
          )}
        </button>
      </div>

      {/* Roster Character Selection Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.values(ROSTER_CHARACTERS).map((hero) => {
          const isSelected = hero.id === activeHeroKey;
          return (
            <button
              key={hero.id}
              onClick={() => setActiveHeroKey(hero.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/60 ring-2 ring-cyan-500/40'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={hero.avatar}
                  alt={hero.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-100 text-xs sm:text-sm truncate">
                    {hero.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 truncate">{hero.elementIcon} {hero.subtitle}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main 3D Turntable & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: 3D Turntable Viewport (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>

          {/* Turntable Control Ribbon */}
          <div className="flex items-center justify-between z-10 text-xs text-slate-400 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-200">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Character Turntable</span>
            </span>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] uppercase transition-colors cursor-pointer"
            >
              {isRotating ? 'Pause Auto-Spin' : 'Auto-Spin On'}
            </button>
          </div>

          {/* WebGL Canvas Container */}
          <div
            ref={containerRef}
            className="w-full h-96 sm:h-[450px] cursor-grab active:cursor-grabbing relative flex items-center justify-center select-none"
            title="Click and drag to rotate character in 3D"
          ></div>

          {/* Hint Footer */}
          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 z-10">
            🖱️ Click and drag horizontally to inspect 360° tactical gear & armor
          </div>
        </div>

        {/* Right Column: Character Combat Telemetry & Weapons (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Combat Attribute Bars */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Combat Performance Metrics</span>
              <span className="text-cyan-400">Class: {currentHero.role}</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Health */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" /> Health
                  </span>
                  <span className="font-extrabold text-slate-100">{currentHero.baseHp} HP</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full"
                    style={{ width: `${(currentHero.baseHp / 140) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Armor */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" /> Ballistic Armor
                  </span>
                  <span className="font-extrabold text-blue-400">{currentHero.baseArmor} AP</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${(currentHero.baseArmor / 80) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Speed */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Sprint & Agility
                  </span>
                  <span className="font-extrabold text-amber-400">{currentHero.speed}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    style={{ width: `${currentHero.speed}%` }}
                  ></div>
                </div>
              </div>

              {/* Strength */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-orange-400" /> Melee Strength
                  </span>
                  <span className="font-extrabold text-orange-400">{currentHero.strength}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    style={{ width: `${currentHero.strength}%` }}
                  ></div>
                </div>
              </div>

              {/* Accuracy */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" /> Weapon Accuracy
                  </span>
                  <span className="font-extrabold text-emerald-400">{currentHero.accuracy}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${currentHero.accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Abilities Cards */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Special Tactical Abilities [Q]</span>
            </div>

            <div className="space-y-2.5">
              {currentHero.specialAbilities.map((ab) => (
                <div
                  key={ab.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3"
                >
                  <div className="text-2xl shrink-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    {ab.icon}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-100 text-xs">{ab.name}</h4>
                      <span className="text-[10px] text-amber-400 font-mono">
                        ⏳ {ab.cooldownSec}s CD
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{ab.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
