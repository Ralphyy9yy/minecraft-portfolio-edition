import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mcAudio } from '../utils/audio';

interface MinecraftGameProps {
  onQuit: () => void;
}

// Block Types
export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  COBBLESTONE = 6,
  BRICK = 7,
  DIAMOND_ORE = 8,
  GLASS = 9,
}

interface BlockDef {
  type: BlockType;
  name: string;
  iconColor: string;
  soundType: 'grass' | 'dirt' | 'stone' | 'wood';
}

const HOTBAR_BLOCKS: BlockDef[] = [
  { type: BlockType.GRASS, name: 'Grass Block', iconColor: '#4f8924', soundType: 'grass' },
  { type: BlockType.DIRT, name: 'Dirt', iconColor: '#725138', soundType: 'dirt' },
  { type: BlockType.STONE, name: 'Stone', iconColor: '#7a7a7a', soundType: 'stone' },
  { type: BlockType.WOOD, name: 'Oak Wood', iconColor: '#675232', soundType: 'wood' },
  { type: BlockType.LEAVES, name: 'Oak Leaves', iconColor: '#346115', soundType: 'grass' },
  { type: BlockType.COBBLESTONE, name: 'Cobblestone', iconColor: '#636363', soundType: 'stone' },
  { type: BlockType.BRICK, name: 'Bricks', iconColor: '#944131', soundType: 'stone' },
  { type: BlockType.DIAMOND_ORE, name: 'Diamond Ore', iconColor: '#2cc5d4', soundType: 'stone' },
  { type: BlockType.GLASS, name: 'Glass', iconColor: '#e0f2fe', soundType: 'stone' },
];

// Helper to create 16x16 pixel-art CanvasTexture
function createVoxelTexture(drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// Procedural Minecraft SFX synthesizer using Web Audio API
class MCSoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Authentic block break sound (filtered noise burst + pitch envelope)
  playBreak(type: 'grass' | 'dirt' | 'stone' | 'wood' = 'stone') {
    if (mcAudio.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate crunch noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      if (type === 'grass' || type === 'dirt') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 300, now);
      } else if (type === 'wood') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450 + Math.random() * 100, now);
        filter.Q.setValueAtTime(3.0, now);
      } else {
        // Stone / Ore
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1400 + Math.random() * 400, now);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
    } catch {
      // Audio fallback
    }
  }

  // Authentic block placement sound (dense low thud)
  playPlace() {
    if (mcAudio.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Fallback
    }
  }

  // Footstep sound while walking
  playFootstep() {
    if (mcAudio.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch {
      // Fallback
    }
  }
}

const sfxEngine = new MCSoundEffects();

export const MinecraftGame: React.FC<MinecraftGameProps> = ({ onQuit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 820)
    );
  });
  const [dpadActive, setDpadActive] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });
  const [isSprinting, setIsSprinting] = useState(false);

  const performMineRef = useRef<() => void>(() => {});
  const performPlaceRef = useRef<() => void>(() => {});
  const mobileMoveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  });

  const selectedSlotRef = useRef(selectedSlot);
  selectedSlotRef.current = selectedSlot;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#78A7FF'); // Minecraft Sky Blue
    scene.fog = new THREE.FogExp2('#78A7FF', 0.022);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 500);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ea, 1.3);
    sunLight.position.set(45, 75, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 3. Pixel Textures & Materials
    const dirtTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, 16, 16);
      const dirtColors = ['#725138', '#5c412d', '#9a6e4d'];
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 16; y += 2) {
          if (Math.random() > 0.4) {
            ctx.fillStyle = dirtColors[Math.floor(Math.random() * dirtColors.length)];
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    });

    const grassTopTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#4f8924';
      ctx.fillRect(0, 0, 16, 16);
      const greens = ['#5b9b2a', '#45781f', '#3b661a', '#549027'];
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 16; y += 2) {
          ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
          ctx.fillRect(x, y, 2, 2);
        }
      }
    });

    const grassSideTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x += 2) {
        for (let y = 4; y < 16; y += 2) {
          ctx.fillStyle = Math.random() > 0.5 ? '#725138' : '#5c412d';
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.fillStyle = '#4f8924';
      ctx.fillRect(0, 0, 16, 4);
      for (let x = 0; x < 16; x += 2) {
        const drop = 4 + (x % 4 === 0 ? 3 : 1);
        ctx.fillStyle = '#5b9b2a';
        ctx.fillRect(x, 0, 2, drop);
      }
    });

    const stoneTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, 16, 16);
      const stoneCols = ['#8c8c8c', '#686868', '#5c5c5c', '#727272'];
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 16; y += 2) {
          ctx.fillStyle = stoneCols[Math.floor(Math.random() * stoneCols.length)];
          ctx.fillRect(x, y, 2, 2);
        }
      }
    });

    const woodSideTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#675232';
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (x % 4 === 0) {
            ctx.fillStyle = '#534228';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });

    const woodTopTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#bc985a';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#8d703e';
      ctx.strokeRect(2, 2, 12, 12);
      ctx.strokeRect(5, 5, 6, 6);
    });

    const leavesTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#346115';
      ctx.fillRect(0, 0, 16, 16);
      const leafCols = ['#41791a', '#2a4f10', '#4d8e1f'];
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 16; y += 2) {
          ctx.fillStyle = leafCols[Math.floor(Math.random() * leafCols.length)];
          ctx.fillRect(x, y, 2, 2);
        }
      }
    });

    const cobbleTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#636363';
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 6; i++) {
        const x = (i * 5) % 13;
        const y = (i * 3) % 13;
        ctx.fillStyle = '#454545';
        ctx.strokeRect(x, y, 5, 3);
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + 1, y + 1, 3, 1);
      }
    });

    const brickTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#cfd0d1';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#944131';
      ctx.fillRect(0, 0, 7, 3);
      ctx.fillRect(8, 0, 8, 3);
      ctx.fillRect(0, 4, 3, 3);
      ctx.fillRect(4, 4, 7, 3);
      ctx.fillRect(12, 4, 4, 3);
      ctx.fillRect(0, 8, 7, 3);
      ctx.fillRect(8, 8, 8, 3);
      ctx.fillRect(0, 12, 3, 3);
      ctx.fillRect(4, 12, 7, 3);
      ctx.fillRect(12, 12, 4, 3);
    });

    const diamondTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, 16, 16);
      const gems = [[3, 3], [4, 4], [11, 4], [12, 5], [6, 10], [7, 11], [11, 11]];
      gems.forEach(([gx, gy]) => {
        ctx.fillStyle = '#5decf5';
        ctx.fillRect(gx, gy, 2, 2);
        ctx.fillStyle = '#1b8e9b';
        ctx.fillRect(gx + 1, gy + 1, 1, 1);
      });
    });

    const glassTex = createVoxelTexture((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(225, 245, 255, 0.35)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 3, 1);
    });

    // Material Map
    const blockMaterials: Record<BlockType, THREE.Material | THREE.Material[]> = {
      [BlockType.AIR]: new THREE.MeshBasicMaterial({ visible: false }),
      [BlockType.GRASS]: [
        new THREE.MeshLambertMaterial({ map: grassSideTex }),
        new THREE.MeshLambertMaterial({ map: grassSideTex }),
        new THREE.MeshLambertMaterial({ map: grassTopTex }),
        new THREE.MeshLambertMaterial({ map: dirtTex }),
        new THREE.MeshLambertMaterial({ map: grassSideTex }),
        new THREE.MeshLambertMaterial({ map: grassSideTex }),
      ],
      [BlockType.DIRT]: new THREE.MeshLambertMaterial({ map: dirtTex }),
      [BlockType.STONE]: new THREE.MeshLambertMaterial({ map: stoneTex }),
      [BlockType.WOOD]: [
        new THREE.MeshLambertMaterial({ map: woodSideTex }),
        new THREE.MeshLambertMaterial({ map: woodSideTex }),
        new THREE.MeshLambertMaterial({ map: woodTopTex }),
        new THREE.MeshLambertMaterial({ map: woodTopTex }),
        new THREE.MeshLambertMaterial({ map: woodSideTex }),
        new THREE.MeshLambertMaterial({ map: woodSideTex }),
      ],
      [BlockType.LEAVES]: new THREE.MeshLambertMaterial({ map: leavesTex, transparent: true, alphaTest: 0.5 }),
      [BlockType.COBBLESTONE]: new THREE.MeshLambertMaterial({ map: cobbleTex }),
      [BlockType.BRICK]: new THREE.MeshLambertMaterial({ map: brickTex }),
      [BlockType.DIAMOND_ORE]: new THREE.MeshLambertMaterial({ map: diamondTex }),
      [BlockType.GLASS]: new THREE.MeshLambertMaterial({ map: glassTex, transparent: true, opacity: 0.55 }),
    };

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

    // 4. Procedural Voxel World
    const WORLD_SIZE = 28;
    const worldMap = new Map<string, { type: BlockType; mesh?: THREE.Mesh }>();
    const getCoordKey = (x: number, y: number, z: number) => `${x},${y},${z}`;

    for (let x = -WORLD_SIZE / 2; x <= WORLD_SIZE / 2; x++) {
      for (let z = -WORLD_SIZE / 2; z <= WORLD_SIZE / 2; z++) {
        const height = Math.floor(
          5 +
          Math.sin(x * 0.22) * 2.2 +
          Math.cos(z * 0.22) * 2.2 +
          Math.sin((x + z) * 0.15) * 1.5
        );

        for (let y = 0; y <= height; y++) {
          let type = BlockType.STONE;
          if (y === height) {
            type = BlockType.GRASS;
          } else if (y >= height - 2) {
            type = BlockType.DIRT;
          } else if (y <= 2 && Math.random() < 0.08) {
            type = BlockType.DIAMOND_ORE;
          }
          worldMap.set(getCoordKey(x, y, z), { type });
        }
      }
    }

    // Add Trees
    const trees = [
      [-6, -5], [6, 6], [-8, 7], [8, -8], [-4, 8], [5, -4]
    ];
    trees.forEach(([tx, tz]) => {
      let gy = 0;
      for (let y = 16; y >= 0; y--) {
        if (worldMap.has(getCoordKey(tx, y, tz))) {
          gy = y + 1;
          break;
        }
      }
      for (let y = 0; y < 4; y++) {
        worldMap.set(getCoordKey(tx, gy + y, tz), { type: BlockType.WOOD });
      }
      const topY = gy + 4;
      for (let lx = -2; lx <= 2; lx++) {
        for (let lz = -2; lz <= 2; lz++) {
          for (let ly = 0; ly <= 2; ly++) {
            if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly === 2) continue;
            const leafKey = getCoordKey(tx + lx, topY + ly - 1, tz + lz);
            if (!worldMap.has(leafKey)) {
              worldMap.set(leafKey, { type: BlockType.LEAVES });
            }
          }
        }
      }
    });

    // Mesh Group
    const blockGroup = new THREE.Group();
    scene.add(blockGroup);

    const isExposed = (x: number, y: number, z: number) => {
      const neighbors = [
        [x + 1, y, z], [x - 1, y, z],
        [x, y + 1, z], [x, y - 1, z],
        [x, y, z + 1], [x, y, z - 1],
      ];
      for (const [nx, ny, nz] of neighbors) {
        const n = worldMap.get(getCoordKey(nx, ny, nz));
        if (!n || n.type === BlockType.AIR || n.type === BlockType.GLASS || n.type === BlockType.LEAVES) {
          return true;
        }
      }
      return false;
    };

    const spawnMeshForVoxel = (x: number, y: number, z: number, type: BlockType) => {
      const mesh = new THREE.Mesh(boxGeometry, blockMaterials[type]);
      mesh.position.set(x, y, z);
      mesh.castShadow = type !== BlockType.GLASS;
      mesh.receiveShadow = true;
      mesh.userData = { voxelCoord: { x, y, z }, type };
      blockGroup.add(mesh);
      return mesh;
    };

    worldMap.forEach((val, key) => {
      if (val.type === BlockType.AIR) return;
      const [x, y, z] = key.split(',').map(Number);
      if (isExposed(x, y, z)) {
        val.mesh = spawnMeshForVoxel(x, y, z, val.type);
      }
    });

    // 5. Authentic Minecraft Voxel Clouds
    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });
    for (let cx = -3; cx <= 3; cx++) {
      for (let cz = -3; cz <= 3; cz++) {
        if (Math.random() > 0.4) {
          const cloud = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), cloudMat);
          cloud.position.set(cx * 22, 28, cz * 22);
          cloudGroup.add(cloud);
        }
      }
    }
    scene.add(cloudGroup);

    // 6. Block Debris Particle System
    const particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
    const particleGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);

    const spawnDebris = (pos: THREE.Vector3, type: BlockType) => {
      const mat = Array.isArray(blockMaterials[type]) ? (blockMaterials[type] as THREE.Material[])[0] : blockMaterials[type];
      for (let i = 0; i < 10; i++) {
        const p = new THREE.Mesh(particleGeo, mat);
        p.position.copy(pos).add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.5) * 0.7
        ));
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 4 + 1.5,
          (Math.random() - 0.5) * 4
        );
        scene.add(p);
        particles.push({ mesh: p, vel, life: 0.6 });
      }
    };

    // 7. First-Person Arm & Held Block (Viewmodel)
    const armGroup = new THREE.Group();
    camera.add(armGroup);
    scene.add(camera);

    // Steve Arm Mesh (attached to bottom right of screen)
    const armMat = new THREE.MeshLambertMaterial({ color: 0x00a8a8 }); // Cyan Steve Sleeve
    const handMat = new THREE.MeshLambertMaterial({ color: 0xb87b54 }); // Skin tone hand
    const armGeo = new THREE.BoxGeometry(0.24, 0.6, 0.24);
    const handGeo = new THREE.BoxGeometry(0.24, 0.28, 0.24);

    const armMesh = new THREE.Mesh(armGeo, armMat);
    const handMesh = new THREE.Mesh(handGeo, handMat);
    handMesh.position.set(0, -0.36, 0);

    const fullArm = new THREE.Group();
    fullArm.add(armMesh);
    fullArm.add(handMesh);

    // Held Item (mini block held in hand)
    const heldItemMesh = new THREE.Mesh(boxGeometry, blockMaterials[BlockType.GRASS]);
    heldItemMesh.scale.set(0.32, 0.32, 0.32);
    heldItemMesh.position.set(0, -0.4, 0.25);
    heldItemMesh.rotation.set(0.3, 0.6, 0);
    fullArm.add(heldItemMesh);

    fullArm.position.set(0.38, -0.32, -0.6);
    fullArm.rotation.set(0.2, -0.2, 0.1);
    armGroup.add(fullArm);

    // Arm punch animation state
    let punchTime = 0;
    const triggerPunch = () => {
      punchTime = 1.0;
    };

    // 8. Player Controls & AABB Collision Physics
    camera.position.set(0, 10, 0);
    let playerYaw = 0;
    let playerPitch = 0;
    const playerPos = camera.position;
    const playerVelocity = new THREE.Vector3(0, 0, 0);
    let isOnGround = false;
    let walkCycle = 0;
    let stepTimer = 0;

    const keys: Record<string, boolean> = {};

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.key >= '1' && e.key <= '9') {
        const slot = parseInt(e.key) - 1;
        if (slot < HOTBAR_BLOCKS.length) {
          setSelectedSlot(slot);
          mcAudio.playClick();
          // Update held block texture
          const def = HOTBAR_BLOCKS[slot];
          heldItemMesh.material = blockMaterials[def.type];
        }
      }
      if (e.code === 'Escape') {
        if (document.pointerLockElement === renderer.domElement) {
          document.exitPointerLock();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Look (PointerLock)
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      const sensitivity = 0.0022;
      playerYaw -= e.movementX * sensitivity;
      playerPitch -= e.movementY * sensitivity;
      playerPitch = Math.max(-Math.PI / 2 + 0.04, Math.min(Math.PI / 2 - 0.04, playerPitch));

      camera.rotation.set(0, 0, 0);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = playerYaw;
      camera.rotation.x = playerPitch;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Mobile Multi-Touch Drag Camera Look (Minecraft Pocket Edition touch tracking)
    let lookTouchId: number | null = null;
    let lastLookX = 0;
    let lastLookY = 0;

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Only bind look drag if touch is NOT on D-pad area (bottom-left)
        const isDpadZone = t.clientX < 190 && t.clientY > window.innerHeight - 220;
        if (lookTouchId === null && !isDpadZone) {
          lookTouchId = t.identifier;
          lastLookX = t.clientX;
          lastLookY = t.clientY;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === lookTouchId) {
          const movementX = t.clientX - lastLookX;
          const movementY = t.clientY - lastLookY;
          lastLookX = t.clientX;
          lastLookY = t.clientY;

          const sensitivity = 0.004;
          playerYaw -= movementX * sensitivity;
          playerPitch -= movementY * sensitivity;
          playerPitch = Math.max(-Math.PI / 2 + 0.04, Math.min(Math.PI / 2 - 0.04, playerPitch));

          camera.rotation.set(0, 0, 0);
          camera.rotation.order = 'YXZ';
          camera.rotation.y = playerYaw;
          camera.rotation.x = playerPitch;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === lookTouchId) {
          lookTouchId = null;
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      setIsLocked(locked);
      setIsPaused(!locked);
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Targeting raycaster
    const raycaster = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0);

    // Highlight wireframe
    const highlightMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.008, 1.008, 1.008),
      new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 2 })
    );
    highlightMesh.visible = false;
    scene.add(highlightMesh);

    // Actions: Mine Block & Place Block (supports desktop click & mobile PE buttons)
    const performMine = () => {
      triggerPunch();
      raycaster.setFromCamera(screenCenter, camera);
      const intersects = raycaster.intersectObjects(blockGroup.children);
      if (intersects.length > 0 && intersects[0].distance <= 6.0) {
        const hit = intersects[0];
        const { voxelCoord, type } = hit.object.userData;
        if (!voxelCoord) return;

        const def = HOTBAR_BLOCKS.find((b) => b.type === type);
        sfxEngine.playBreak(def?.soundType || 'stone');
        spawnDebris(hit.point, type);

        worldMap.delete(getCoordKey(voxelCoord.x, voxelCoord.y, voxelCoord.z));
        blockGroup.remove(hit.object);

        // Reveal adjacent blocks
        const neighbors = [
          [voxelCoord.x + 1, voxelCoord.y, voxelCoord.z],
          [voxelCoord.x - 1, voxelCoord.y, voxelCoord.z],
          [voxelCoord.x, voxelCoord.y + 1, voxelCoord.z],
          [voxelCoord.x, voxelCoord.y - 1, voxelCoord.z],
          [voxelCoord.x, voxelCoord.y, voxelCoord.z + 1],
          [voxelCoord.x, voxelCoord.y, voxelCoord.z - 1],
        ];
        neighbors.forEach(([nx, ny, nz]) => {
          const key = getCoordKey(nx, ny, nz);
          const block = worldMap.get(key);
          if (block && block.type !== BlockType.AIR && !block.mesh) {
            block.mesh = spawnMeshForVoxel(nx, ny, nz, block.type);
          }
        });
      }
    };

    const performPlace = () => {
      triggerPunch();
      raycaster.setFromCamera(screenCenter, camera);
      const intersects = raycaster.intersectObjects(blockGroup.children);
      if (intersects.length > 0 && intersects[0].distance <= 6.0) {
        const hit = intersects[0];
        const { voxelCoord } = hit.object.userData;
        if (!voxelCoord || !hit.face) return;

        const placeX = voxelCoord.x + Math.round(hit.face.normal.x);
        const placeY = voxelCoord.y + Math.round(hit.face.normal.y);
        const placeZ = voxelCoord.z + Math.round(hit.face.normal.z);

        // Player collision test (prevent placing inside player)
        const pMinX = playerPos.x - 0.35;
        const pMaxX = playerPos.x + 0.35;
        const pMinY = playerPos.y - 1.5;
        const pMaxY = playerPos.y + 0.3;
        const pMinZ = playerPos.z - 0.35;
        const pMaxZ = playerPos.z + 0.35;

        const bMinX = placeX - 0.5;
        const bMaxX = placeX + 0.5;
        const bMinY = placeY - 0.5;
        const bMaxY = placeY + 0.5;
        const bMinZ = placeZ - 0.5;
        const bMaxZ = placeZ + 0.5;

        const collidesWithPlayer =
          pMinX < bMaxX && pMaxX > bMinX &&
          pMinY < bMaxY && pMaxY > bMinY &&
          pMinZ < bMaxZ && pMaxZ > bMinZ;

        if (collidesWithPlayer) return;

        const placeKey = getCoordKey(placeX, placeY, placeZ);
        if (!worldMap.has(placeKey)) {
          const selectedDef = HOTBAR_BLOCKS[selectedSlotRef.current];
          sfxEngine.playPlace();
          const newMesh = spawnMeshForVoxel(placeX, placeY, placeZ, selectedDef.type);
          worldMap.set(placeKey, { type: selectedDef.type, mesh: newMesh });
        }
      }
    };

    performMineRef.current = performMine;
    performPlaceRef.current = performPlace;

    // Mouse Actions (Mining & Placing)
    const onMouseDown = (e: MouseEvent) => {
      if (!isTouchDevice && document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
        return;
      }
      if (e.button === 0) {
        performMine();
      } else if (e.button === 2) {
        performPlace();
      }
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', onMouseDown);
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    canvasDom.addEventListener('contextmenu', onContextMenu);
    canvasDom.requestPointerLock();

    // 9. True AABB Voxel Wall Collision Test
    const isSolidBlockAt = (x: number, y: number, z: number) => {
      const key = getCoordKey(Math.round(x), Math.round(y), Math.round(z));
      const b = worldMap.get(key);
      return !!b && b.type !== BlockType.AIR;
    };

    const collidesWithWorld = (px: number, py: number, pz: number) => {
      const radius = 0.3;
      const height = 1.7;
      const minX = px - radius;
      const maxX = px + radius;
      const minY = py - 1.5;
      const maxY = py - 1.5 + height;
      const minZ = pz - radius;
      const maxZ = pz + radius;

      for (let x = Math.floor(minX); x <= Math.floor(maxX); x++) {
        for (let y = Math.floor(minY); y <= Math.floor(maxY); y++) {
          for (let z = Math.floor(minZ); z <= Math.floor(maxZ); z++) {
            if (isSolidBlockAt(x, y, z)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    // 10. Main Game Loop
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      // Slowly drift clouds
      cloudGroup.position.x = (now * 0.001) % 44;

      // Update targeting wireframe
      raycaster.setFromCamera(screenCenter, camera);
      const intersects = raycaster.intersectObjects(blockGroup.children);
      if (intersects.length > 0 && intersects[0].distance <= 5.5) {
        const { voxelCoord } = intersects[0].object.userData;
        if (voxelCoord) {
          highlightMesh.position.set(voxelCoord.x, voxelCoord.y, voxelCoord.z);
          highlightMesh.visible = true;
        }
      } else {
        highlightMesh.visible = false;
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= delta;
        p.vel.y -= 12 * delta; // Gravity
        p.mesh.position.addScaledVector(p.vel, delta);
        if (p.life <= 0) {
          scene.remove(p.mesh);
          particles.splice(i, 1);
        }
      }

      // Movement Input (WASD or Mobile PE D-Pad)
      const isForward = keys['KeyW'] || mobileMoveRef.current.forward;
      const isBackward = keys['KeyS'] || mobileMoveRef.current.backward;
      const isLeft = keys['KeyA'] || mobileMoveRef.current.left;
      const isRight = keys['KeyD'] || mobileMoveRef.current.right;
      const isJumping = keys['Space'] || mobileMoveRef.current.jump;
      const isSprinting = keys['ControlLeft'] || keys['KeyR'] || mobileMoveRef.current.sprint;

      const speed = isSprinting ? 8.5 : 5.8; // Sprint support
      const moveDir = new THREE.Vector3();
      if (isForward) moveDir.z -= 1;
      if (isBackward) moveDir.z += 1;
      if (isLeft) moveDir.x -= 1;
      if (isRight) moveDir.x += 1;

      const isMoving = moveDir.lengthSq() > 0;
      if (isMoving) {
        moveDir.normalize();
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
        playerVelocity.x = moveDir.x * speed;
        playerVelocity.z = moveDir.z * speed;
      } else {
        playerVelocity.x = 0;
        playerVelocity.z = 0;
      }

      // Gravity
      playerVelocity.y -= 22 * delta;

      // Jump
      if (isJumping && isOnGround) {
        playerVelocity.y = 8.2;
        isOnGround = false;
      }

      // X Movement with wall collision
      const newX = playerPos.x + playerVelocity.x * delta;
      if (!collidesWithWorld(newX, playerPos.y, playerPos.z)) {
        playerPos.x = newX;
      } else {
        playerVelocity.x = 0;
      }

      // Z Movement with wall collision
      const newZ = playerPos.z + playerVelocity.z * delta;
      if (!collidesWithWorld(playerPos.x, playerPos.y, newZ)) {
        playerPos.z = newZ;
      } else {
        playerVelocity.z = 0;
      }

      // Y Movement (Vertical ground collision)
      const newY = playerPos.y + playerVelocity.y * delta;
      if (playerVelocity.y < 0) {
        // Falling down
        if (collidesWithWorld(playerPos.x, newY, playerPos.z)) {
          // Snap onto ground
          playerPos.y = Math.floor(playerPos.y - 1.5) + 1.5001;
          playerVelocity.y = 0;
          isOnGround = true;
        } else {
          playerPos.y = newY;
          isOnGround = false;
        }
      } else if (playerVelocity.y > 0) {
        // Jumping up (hit ceiling)
        if (collidesWithWorld(playerPos.x, newY, playerPos.z)) {
          playerVelocity.y = 0;
        } else {
          playerPos.y = newY;
        }
        isOnGround = false;
      }

      // Fall off safety
      if (playerPos.y < -15) {
        playerPos.set(0, 14, 0);
        playerVelocity.set(0, 0, 0);
      }

      // Authentic Walking Head Bobbing & Footsteps
      if (isMoving && isOnGround) {
        walkCycle += delta * (speed * 1.8);
        stepTimer += delta;
        if (stepTimer > 0.35) {
          sfxEngine.playFootstep();
          stepTimer = 0;
        }
      } else {
        walkCycle = 0;
        stepTimer = 0;
      }

      const headBobY = Math.sin(walkCycle) * 0.04;
      const headBobX = Math.cos(walkCycle * 0.5) * 0.02;

      // Arm Animation & Punch Swing
      if (punchTime > 0) {
        punchTime = Math.max(0, punchTime - delta * 5.0);
        const swing = Math.sin(punchTime * Math.PI);
        fullArm.rotation.x = 0.2 - swing * 0.8;
        fullArm.position.z = -0.6 + swing * 0.15;
      } else {
        // Arm walk bobbing
        const armBob = Math.sin(walkCycle) * 0.03;
        fullArm.position.y = -0.32 + armBob + headBobY * 0.5;
        fullArm.position.x = 0.38 + headBobX * 0.5;
        fullArm.rotation.x = 0.2 + armBob * 1.5;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const reqId = requestAnimationFrame(animate);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 820
      );
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('resize', onResize);
      canvasDom.removeEventListener('mousedown', onMouseDown);
      canvasDom.removeEventListener('contextmenu', onContextMenu);
      if (document.pointerLockElement === canvasDom) {
        document.exitPointerLock();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const resumeGame = () => {
    mcAudio.playClick();
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock();
    }
    setIsPaused(false);
  };

  const handleQuitGame = () => {
    mcAudio.playClick();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    onQuit();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-minecraft">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-none" />

      {/* Inverted Minecraft Crosshair */}
      {!isPaused && (isLocked || isTouchDevice) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className="w-4 h-4 flex items-center justify-center text-white text-2xl font-bold select-none"
            style={{ mixBlendMode: 'difference' }}
          >
            +
          </div>
        </div>
      )}

      {/* Click to Play / Resume Prompt (Desktop PC only) */}
      {!isTouchDevice && !isLocked && !isPaused && (
        <div
          onClick={resumeGame}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 cursor-pointer"
        >
          <div className="mc-window p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-black mb-2">Click to Play!</h3>
            <p className="text-xs text-gray-800 mb-4">
              Click anywhere inside the screen to capture your mouse and look around in full 3D.
            </p>
            <button className="minecraft-button w-full h-10 text-xs">
              Enter World
            </button>
          </div>
        </div>
      )}

      {/* Top Bar: Pause Button & Mode Switch */}
      {!isPaused && (
        <>
          {/* Minecraft PE Center Top Pause Button */}
          <button
            onClick={() => {
              mcAudio.playClick();
              setIsPaused(true);
            }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-30 pe-button px-3 py-1.5 rounded text-xs font-bold pointer-events-auto"
            title="Pause Game"
          >
            ❚❚ PAUSE
          </button>

          {/* Desktop/Touch Mode Toggle */}
          <button
            onClick={() => {
              mcAudio.playClick();
              setIsTouchDevice((v) => !v);
            }}
            className="fixed top-3 right-3 z-30 pe-button px-2.5 py-1 text-[10px] rounded pointer-events-auto"
            title="Toggle between Mobile Pocket Edition and Desktop PC controls"
          >
            {isTouchDevice ? '📱 Mobile PE' : '💻 PC Controls'}
          </button>
        </>
      )}

      {/* Minecraft Pocket Edition (PE) On-Screen Touch Controls */}
      {isTouchDevice && !isPaused && (
        <>
          {/* Bottom-Left: Authentic Minecraft PE D-Pad */}
          <div className="fixed bottom-3 left-2 sm:bottom-6 sm:left-6 z-30 select-none pe-dpad-container pointer-events-auto">
            {/* Row 1: [Empty] [▲ Forward] [Empty] */}
            <div />
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                mobileMoveRef.current.forward = true;
                setDpadActive((p) => ({ ...p, forward: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                mobileMoveRef.current.forward = false;
                setDpadActive((p) => ({ ...p, forward: false }));
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                mobileMoveRef.current.forward = false;
                setDpadActive((p) => ({ ...p, forward: false }));
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                mobileMoveRef.current.forward = false;
                setDpadActive((p) => ({ ...p, forward: false }));
              }}
              className={`pe-button rounded-t ${dpadActive.forward ? 'active' : ''}`}
              title="Move Forward"
            >
              ▲
            </button>
            <div />

            {/* Row 2: [◄ Left] [⬥ Center Sneak/Sprint] [► Right] */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                mobileMoveRef.current.left = true;
                setDpadActive((p) => ({ ...p, left: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                mobileMoveRef.current.left = false;
                setDpadActive((p) => ({ ...p, left: false }));
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                mobileMoveRef.current.left = false;
                setDpadActive((p) => ({ ...p, left: false }));
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                mobileMoveRef.current.left = false;
                setDpadActive((p) => ({ ...p, left: false }));
              }}
              className={`pe-button rounded-l ${dpadActive.left ? 'active' : ''}`}
              title="Strafe Left"
            >
              ◄
            </button>

            <button
              onClick={() => {
                mcAudio.playClick();
                const nextSprint = !mobileMoveRef.current.sprint;
                mobileMoveRef.current.sprint = nextSprint;
                setIsSprinting(nextSprint);
              }}
              className={`pe-button ${isSprinting ? 'bg-amber-400/60 text-amber-200' : ''}`}
              title={isSprinting ? 'Sprinting (Tap to Walk)' : 'Walking (Tap to Sprint)'}
            >
              {isSprinting ? '⚡' : '⬥'}
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                mobileMoveRef.current.right = true;
                setDpadActive((p) => ({ ...p, right: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                mobileMoveRef.current.right = false;
                setDpadActive((p) => ({ ...p, right: false }));
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                mobileMoveRef.current.right = false;
                setDpadActive((p) => ({ ...p, right: false }));
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                mobileMoveRef.current.right = false;
                setDpadActive((p) => ({ ...p, right: false }));
              }}
              className={`pe-button rounded-r ${dpadActive.right ? 'active' : ''}`}
              title="Strafe Right"
            >
              ►
            </button>

            {/* Row 3: [Empty] [▼ Backward] [Empty] */}
            <div />
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                mobileMoveRef.current.backward = true;
                setDpadActive((p) => ({ ...p, backward: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                mobileMoveRef.current.backward = false;
                setDpadActive((p) => ({ ...p, backward: false }));
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                mobileMoveRef.current.backward = false;
                setDpadActive((p) => ({ ...p, backward: false }));
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                mobileMoveRef.current.backward = false;
                setDpadActive((p) => ({ ...p, backward: false }));
              }}
              className={`pe-button rounded-b ${dpadActive.backward ? 'active' : ''}`}
              title="Move Backward"
            >
              ▼
            </button>
            <div />
          </div>

          {/* Bottom-Right: Action Buttons & Round Jump Button */}
          <div className="fixed bottom-3 right-2 sm:bottom-6 sm:right-6 z-30 select-none flex flex-col items-end gap-2 pointer-events-auto">
            {/* Quick Action Buttons: Mine & Place */}
            <div className="flex gap-2">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  performMineRef.current();
                }}
                className="pe-action-btn bg-red-950/70 border-2 border-red-500/80 active:bg-red-700/80 text-white"
                title="Mine / Break Block"
              >
                <span className="text-base sm:text-lg">⛏️</span>
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">MINE</span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  performPlaceRef.current();
                }}
                className="pe-action-btn bg-emerald-950/70 border-2 border-emerald-500/80 active:bg-emerald-700/80 text-white"
                title="Place Block"
              >
                <span className="text-base sm:text-lg">🧱</span>
                <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">PLACE</span>
              </button>
            </div>

            {/* Classic Minecraft PE Jump Button */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                mobileMoveRef.current.jump = true;
                setDpadActive((p) => ({ ...p, jump: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                mobileMoveRef.current.jump = false;
                setDpadActive((p) => ({ ...p, jump: false }));
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                mobileMoveRef.current.jump = false;
                setDpadActive((p) => ({ ...p, jump: false }));
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                mobileMoveRef.current.jump = false;
                setDpadActive((p) => ({ ...p, jump: false }));
              }}
              className={`pe-jump-btn ${dpadActive.jump ? 'active' : ''}`}
              title="Jump"
            >
              ▲
            </button>
          </div>
        </>
      )}

      {/* Authentic Minecraft In-Game HUD */}
      <div className="absolute bottom-2 sm:bottom-3 inset-x-0 flex flex-col items-center pointer-events-none z-20 px-2">
        {/* Selected block label */}
        <div className="text-white text-xs mc-text-shadow font-bold mb-1.5">
          {HOTBAR_BLOCKS[selectedSlot]?.name}
        </div>

        {/* Health & Hunger Bars */}
        <div className="w-[340px] max-w-[90vw] flex justify-between px-1 mb-1 text-xs sm:text-sm select-none">
          <div className="flex gap-0.5" title="10/10 Hearts">
            {'❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️'}
          </div>
          <div className="flex gap-0.5" title="10/10 Food">
            {'🍗🍗🍗🍗🍗🍗🍗🍗🍗🍗'}
          </div>
        </div>

        {/* 9-Slot Hotbar */}
        <div className="flex bg-[#8f8f8f] p-0.5 sm:p-1 border-2 sm:border-3 border-black shadow-[inset_-2px_-2px_0px_#555,inset_2px_2px_0px_#fff] max-w-full overflow-x-auto">
          {HOTBAR_BLOCKS.map((block, idx) => {
            const isSelected = idx === selectedSlot;
            return (
              <div
                key={block.type}
                onClick={() => {
                  setSelectedSlot(idx);
                  mcAudio.playClick();
                }}
                className={`w-7 h-7 sm:w-10 sm:h-10 border-2 flex items-center justify-center relative cursor-pointer pointer-events-auto transition-transform ${
                  isSelected
                    ? 'border-white bg-white/30 scale-105 sm:scale-110 shadow-lg z-10'
                    : 'border-[#373737] bg-[#8b8b8b]'
                }`}
                style={{
                  boxShadow: isSelected
                    ? 'inset -2px -2px 0px #fff, inset 2px 2px 0px #fff'
                    : 'inset -2px -2px 0px #373737, inset 2px 2px 0px #555'
                }}
                title={`Slot ${idx + 1}: ${block.name}`}
              >
                <div
                  className="w-4 h-4 sm:w-6 sm:h-6 border border-black/40 shadow-sm"
                  style={{ backgroundColor: block.iconColor }}
                />
                <span className="absolute bottom-0.5 right-0.5 sm:right-1 text-[8px] sm:text-[9px] text-white font-mono drop-shadow-[1px_1px_0px_#000]">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Control Hints */}
        <div className="text-[9px] sm:text-[10px] text-gray-300 mc-text-shadow mt-1 text-center">
          {isTouchDevice
            ? 'D-Pad: Move • Swipe right side: Look • ⛏️ Mine • 🧱 Place • ▲ Jump'
            : 'WASD: Move • Space: Jump • Left Click: Mine • Right Click: Place • 1-9: Hotbar • ESC: Pause'}
        </div>
      </div>

      {/* Pause Menu (ESC) */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
          <div className="flex flex-col items-center gap-3 w-full max-w-sm px-4">
            <h2 className="text-2xl font-bold text-white mc-text-shadow mb-4">
              Game Paused
            </h2>

            <button
              onClick={resumeGame}
              className="minecraft-button w-full h-11 text-sm"
            >
              Back to Game
            </button>

            <button
              onClick={handleQuitGame}
              className="minecraft-button w-full h-11 text-sm"
            >
              Quit to Title Screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

