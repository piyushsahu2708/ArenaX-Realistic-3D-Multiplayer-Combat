import * as THREE from 'three';
import { INITIAL_MAP_PICKUPS, MapPickupConfig } from '../data/weapons3DData';

export interface ColliderBox {
  box: THREE.Box3;
  type: 'WALL' | 'COVER' | 'STAIRS' | 'ROOF';
  canVault?: boolean;
}

export class CityMap3D {
  public scene: THREE.Scene;
  public colliders: ColliderBox[] = [];
  public pickups: {
    config: MapPickupConfig;
    mesh: THREE.Group;
    active: boolean;
    respawnTimer: number;
  }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildMap();
    this.spawnPickups();
  }

  private buildMap() {
    // 1. Asphalt Ground (50m x 50m arena)
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e26,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Arena Perimeter Walls
    this.createWall(0, 3, -30, 60, 6, 1, 0x11141c);
    this.createWall(0, 3, 30, 60, 6, 1, 0x11141c);
    this.createWall(-30, 3, 0, 1, 6, 60, 0x11141c);
    this.createWall(30, 3, 0, 1, 6, 60, 0x11141c);

    // Street markings (dashed yellow & white lines)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    for (let z = -25; z <= 25; z += 5) {
      const lineGeo = new THREE.PlaneGeometry(0.3, 2.5);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(0, 0.01, z);
      this.scene.add(lineMesh);
    }

    // 2. Main Abandoned Building (North-East: Bank & Sniper Rooftop)
    // Ground floor
    this.createBuildingBlock(16, 2, 14, 14, 4, 12, 0x242834);
    // Rooftop floor
    this.createBuildingBlock(16, 5, 14, 13, 2, 11, 0x1e222e);
    // Rooftop guardrails
    this.createCoverBox(9.5, 4.4, 14, 0.4, 0.8, 11, 0x334155);
    this.createCoverBox(22.5, 4.4, 14, 0.4, 0.8, 11, 0x334155);
    this.createCoverBox(16, 4.4, 8.5, 13, 0.8, 0.4, 0x334155);
    // Rooftop HVAC unit (Sniper cover!)
    this.createCoverBox(15, 4.6, 15, 2, 1.2, 3, 0x475569);

    // Stairs to Rooftop
    for (let step = 0; step < 8; step++) {
      const stepY = 0.5 + step * 0.45;
      const stepZ = 7.5 - step * 0.8;
      this.createBuildingBlock(10, stepY, stepZ, 3, 0.45, 0.8, 0x3b4252);
    }

    // 3. Industrial Warehouse (South-West)
    this.createBuildingBlock(-15, 2.5, -15, 16, 5, 14, 0x2d323f);
    // Interior corridor doorway cutouts created by walls
    this.createCoverBox(-8, 1, -15, 2, 2, 0.5, 0x475569);

    // 4. Metro Station Entrance (North-West)
    // Railings & entrance stairs going down
    const metroMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    this.createCoverBox(-14, 0.5, 12, 6, 1, 0.3, 0x0284c7);
    this.createCoverBox(-14, 0.5, 18, 6, 1, 0.3, 0x0284c7);
    this.createCoverBox(-17, 0.5, 15, 0.3, 1, 6, 0x0284c7);
    // Metro sign pillar
    const signGeo = new THREE.BoxGeometry(0.3, 3.5, 0.3);
    const signMesh = new THREE.Mesh(signGeo, metroMat);
    signMesh.position.set(-11, 1.75, 12);
    this.scene.add(signMesh);

    // 5. Market Area & Shipping Containers (Center & Center-West)
    // Red container
    this.createContainer(-4, 1.3, -4, 3, 2.6, 6, 0xb91c1c);
    // Blue container
    this.createContainer(6, 1.3, -12, 6, 2.6, 2.8, 0x1d4ed8);
    // Yellow industrial container
    this.createContainer(-6, 1.3, 6, 2.8, 2.6, 6, 0xd97706);

    // 6. Abandoned Vehicles (Tactical Car Cover)
    this.createVehicle(4, 0, 4, 0.3, 0x334155);
    this.createVehicle(-10, 0, -2, -0.2, 0x475569);
    this.createVehicle(0, 0, -18, 1.57, 0x1e293b);
    this.createVehicle(12, 0, -2, -0.6, 0x64748b);

    // 7. Tactical Concrete Jersey Barriers & Sandbags
    this.createCoverBox(0, 0.5, 0, 4, 1, 0.5, 0x64748b);
    this.createCoverBox(-2, 0.5, -8, 3, 1, 0.5, 0x64748b);
    this.createCoverBox(6, 0.5, 10, 3.5, 1, 0.5, 0x64748b);
    this.createCoverBox(-12, 0.5, 5, 0.5, 1, 3.5, 0x64748b);

    // 8. Street Lamps with Lights
    this.createStreetLamp(8, 0, 8);
    this.createStreetLamp(-8, 0, 8);
    this.createStreetLamp(8, 0, -8);
    this.createStreetLamp(-8, 0, -8);
  }

  private createBuildingBlock(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push({ box, type: 'WALL' });
  }

  private createWall(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push({ box, type: 'WALL' });
  }

  private createCoverBox(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push({ box, type: 'COVER', canVault: true });
  }

  private createContainer(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push({ box, type: 'COVER' });
  }

  private createVehicle(
    x: number,
    y: number,
    z: number,
    rotY: number,
    color: number
  ) {
    const carGroup = new THREE.Group();
    carGroup.position.set(x, y, z);
    carGroup.rotation.y = rotY;

    // Body chassis
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.75, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.7,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    carGroup.add(body);

    // Cabin / Roof
    const roofGeo = new THREE.BoxGeometry(1.8, 0.6, 2.2);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });
    const roof = new THREE.Mesh(roofGeo, glassMat);
    roof.position.set(0, 1.15, -0.2);
    roof.castShadow = true;
    carGroup.add(roof);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const wheelOffsets = [
      [-1.05, 0.36, 1.4],
      [1.05, 0.36, 1.4],
      [-1.05, 0.36, -1.4],
      [1.05, 0.36, -1.4],
    ];
    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wMesh.position.set(wx, wy, wz);
      carGroup.add(wMesh);
    });

    this.scene.add(carGroup);

    const box = new THREE.Box3().setFromObject(carGroup);
    this.colliders.push({ box, type: 'COVER', canVault: true });
  }

  private createStreetLamp(x: number, y: number, z: number) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, y, z);

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 4.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.4;
    lampGroup.add(pole);

    // Lamp head
    const headGeo = new THREE.BoxGeometry(0.3, 0.15, 0.6);
    const head = new THREE.Mesh(headGeo, poleMat);
    head.position.set(0, 4.8, 0.2);
    lampGroup.add(head);

    // Point Light
    const light = new THREE.PointLight(0xfef08a, 0.8, 14);
    light.position.set(0, 4.6, 0.2);
    lampGroup.add(light);

    this.scene.add(lampGroup);
  }

  // Spawn rotating 3D pickups (Weapons, Medkits, Armor Plates)
  private spawnPickups() {
    INITIAL_MAP_PICKUPS.forEach((cfg) => {
      const group = new THREE.Group();
      group.position.set(cfg.position[0], cfg.position[1], cfg.position[2]);

      // Base glowing holographic ring
      const ringGeo = new THREE.RingGeometry(0.4, 0.5, 16);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.type === 'MEDKIT' ? 0x22c55e : cfg.type === 'ARMOR' ? 0x3b82f6 : 0xf59e0b,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -0.35;
      group.add(ring);

      // Model mesh based on type
      if (cfg.type === 'MEDKIT') {
        const medBoxGeo = new THREE.BoxGeometry(0.35, 0.25, 0.25);
        const medMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.3,
        });
        const medBox = new THREE.Mesh(medBoxGeo, medMat);
        group.add(medBox);

        // White Cross
        const crossGeo = new THREE.BoxGeometry(0.18, 0.06, 0.26);
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const cross1 = new THREE.Mesh(crossGeo, crossMat);
        group.add(cross1);
        const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.26), crossMat);
        group.add(cross2);
      } else if (cfg.type === 'ARMOR') {
        const armorGeo = new THREE.BoxGeometry(0.32, 0.38, 0.12);
        const armorMat = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          roughness: 0.2,
          metalness: 0.8,
        });
        const armorMesh = new THREE.Mesh(armorGeo, armorMat);
        group.add(armorMesh);
      } else if (cfg.type === 'AMMO') {
        const ammoGeo = new THREE.BoxGeometry(0.36, 0.22, 0.24);
        const ammoMat = new THREE.MeshStandardMaterial({
          color: 0x15803d,
          roughness: 0.5,
          metalness: 0.5,
        });
        const ammoMesh = new THREE.Mesh(ammoGeo, ammoMat);
        group.add(ammoMesh);
      } else {
        // Weapon pickup
        const gunGeo = new THREE.BoxGeometry(0.1, 0.16, 0.6);
        const gunMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.2,
        });
        const gunMesh = new THREE.Mesh(gunGeo, gunMat);
        group.add(gunMesh);
      }

      this.scene.add(group);

      this.pickups.push({
        config: cfg,
        mesh: group,
        active: true,
        respawnTimer: 0,
      });
    });
  }

  // Update pickup animations & respawns (call in requestAnimationFrame)
  public update(delta: number) {
    this.pickups.forEach((p) => {
      if (p.active) {
        // Rotate and gentle bob
        p.mesh.rotation.y += delta * 1.8;
        p.mesh.position.y = p.config.position[1] + Math.sin(Date.now() * 0.003) * 0.08;
      } else {
        p.respawnTimer -= delta;
        if (p.respawnTimer <= 0) {
          p.active = true;
          p.mesh.visible = true;
        }
      }
    });
  }

  // Check collision for player bounding box against map objects
  public checkCollision(newPos: THREE.Vector3, radius: number = 0.4): boolean {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(newPos.x - radius, newPos.y, newPos.z - radius),
      new THREE.Vector3(newPos.x + radius, newPos.y + 1.8, newPos.z + radius)
    );

    for (const c of this.colliders) {
      if (c.box.intersectsBox(playerBox)) {
        return true; // Collision detected
      }
    }
    return false;
  }
}
