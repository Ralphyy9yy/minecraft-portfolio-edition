import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mcAudio } from '../utils/audio';
import { useDialog } from '../hooks/useDialog';
import { MoveControl, TouchInput } from '../game/touchInput';
import { Project } from '../data/portfolioData';
import { ProjectChestPanel, SandboxControls } from './SandboxPanels';
import { createProjectChests } from '../game/projectChests';
import { INTERACTION_REACH, PROJECT_CHESTS, createShelterReward, placementFeedback, projectWithinReach, spawnHeight } from '../game/sandboxExperience';
import { BlockType, SHELTER_PLAN, SavedBlock, WorldLoad, cycleSlot, loadWorld, saveWorld, shelterProgress, simulationStep } from '../game/sandbox';
export { BlockType } from '../game/sandbox';

interface MinecraftGameProps {
  onQuit: () => void;
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
  texture.colorSpace = THREE.SRGBColorSpace;
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

function blockIcon(top: CanvasImageSource, side: CanvasImageSource) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const face = (texture: CanvasImageSource, transform: [number, number, number, number, number, number], shade = 0) => {
    ctx.save();
    ctx.setTransform(...transform);
    ctx.drawImage(texture, 0, 0, 16, 16);
    ctx.fillStyle = `rgba(0,0,0,${shade})`;
    ctx.fillRect(0, 0, 16, 16);
    ctx.restore();
  };
  face(side, [1.25, 0.625, 0, 1.25, 4, 15], 0.15);
  face(side, [1.25, -0.625, 0, 1.25, 24, 25], 0.3);
  face(top, [1.25, 0.625, -1.25, 0.625, 24, 5]);
  return canvas.toDataURL();
}

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
  const [blockIcons, setBlockIcons] = useState<Record<number, string>>({});
  const [saveMessage, setSaveMessage] = useState('Loading world…');
  const [controlMessage, setControlMessage] = useState('');
  const [challenge, setChallenge] = useState(() => shelterProgress(() => undefined));
  const [showGuides, setShowGuides] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [worldRevision, setWorldRevision] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [targetHint, setTargetHint] = useState({ kind: 'idle', message: 'Aim at a block to build, or a project chest to explore' });
  const [builderUnlocked, setBuilderUnlocked] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const touchModeRef = useRef(isTouchDevice);
  touchModeRef.current = isTouchDevice;
  const resetRequestedRef = useRef(false);
  const clearInputsRef = useRef(() => {});
  const flushSaveRef = useRef(() => {});
  const selectSlotRef = useRef<(slot: number) => void>(() => {});
  const guidesRef = useRef(showGuides);
  guidesRef.current = showGuides;

  const pauseGame = () => {
    activeRef.current = false;
    pausedRef.current = true;
    clearInputsRef.current();
    flushSaveRef.current();
    setIsPaused(true);
    if (document.pointerLockElement === containerRef.current?.querySelector('canvas')) document.exitPointerLock();
  };
  const pauseDialogRef = useDialog(isPaused, () => {
    if (confirmReset) setConfirmReset(false);
    else if (selectedProject) setSelectedProject(null);
    else if (showHelp) setShowHelp(false);
    else resumeGame();
  });

  const performMineRef = useRef<() => void>(() => {});
  const performPlaceRef = useRef<() => void>(() => {});
  const interactRef = useRef<() => void>(() => {});
  const returnToSpawnRef = useRef<() => void>(() => {});
  const mobileMoveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  });
  const touchInputRef = useRef(new TouchInput());

  const syncTouchMovement = () => {
    const movement = touchInputRef.current.movement();
    Object.assign(mobileMoveRef.current, movement);
    setDpadActive(movement);
  };

  const movementControl = (control: MoveControl) => {
    const release = (event: React.PointerEvent<HTMLButtonElement>) => {
      if (touchInputRef.current.release(event.pointerId)) syncTouchMovement();
    };
    return {
      'data-move': control,
      onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!activeRef.current || pausedRef.current || event.button !== 0) return;
        // Keep the hold even when the thumb drifts outside the button.
        event.currentTarget.setPointerCapture(event.pointerId);
        if (touchInputRef.current.hold(event.pointerId, control)) syncTouchMovement();
      },
      onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!activeRef.current || pausedRef.current || control === 'jump') return;
        // Pointer capture targets the original button; hit-test to allow D-pad swipes.
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>('button[data-move]');
        if (!target || target.closest('.pe-dpad-container') !== event.currentTarget.closest('.pe-dpad-container')) return;
        const direction = target.dataset.move as MoveControl;
        if (touchInputRef.current.slide(event.pointerId, direction)) syncTouchMovement();
      },
      onPointerUp: release,
      onPointerCancel: release,
      onLostPointerCapture: release,
    };
  };

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
    activeRef.current = touchModeRef.current && !pausedRef.current;
    let disposed = false;
    let rewardTimer: ReturnType<typeof setTimeout> | undefined;
    setShowReward(false);
    setBuilderUnlocked(false);

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
    const icons: Record<number, string> = {};
    for (const block of HOTBAR_BLOCKS) {
      const material = blockMaterials[block.type];
      const top = (Array.isArray(material) ? material[2] : material) as THREE.MeshLambertMaterial;
      const side = (Array.isArray(material) ? material[0] : material) as THREE.MeshLambertMaterial;
      icons[block.type] = blockIcon(top.map!.image as CanvasImageSource, side.map!.image as CanvasImageSource);
    }
    setBlockIcons(icons);

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

    const resetting = resetRequestedRef.current;
    resetRequestedRef.current = false;
    let storedWorld: WorldLoad;
    try { storedWorld = resetting ? { status: 'new' } : loadWorld(window.localStorage); }
    catch { storedWorld = { status: 'unavailable' }; }
    if (storedWorld.status === 'restored') {
      worldMap.clear();
      for (const [x, y, z, type] of storedWorld.snapshot.blocks) worldMap.set(getCoordKey(x, y, z), { type });
    }
    const canSave = storedWorld.status !== 'invalid';
    let dirty = storedWorld.status === 'new';
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    setSaveMessage(storedWorld.status === 'invalid' ? 'Saved world is unreadable. Reset World to start fresh.' : storedWorld.status === 'unavailable' ? 'Storage unavailable. Changes may not be saved.' : storedWorld.status === 'restored' ? 'Saved world restored on this device' : 'New world — saves on this device');

    const flushSave = (updateUI = true) => {
      clearTimeout(saveTimer);
      if (!dirty || !canSave || resetRequestedRef.current) return;
      let saved = false;
      try {
        const blocks: SavedBlock[] = Array.from(worldMap, ([key, block]) => {
          const [x, y, z] = key.split(',').map(Number);
          return [x, y, z, block.type];
        });
        saved = saveWorld(window.localStorage, blocks);
      } catch { /* Storage can be blocked by the browser. Keep this session playable. */ }
      if (saved) dirty = false;
      if (updateUI && !disposed) setSaveMessage(saved ? 'World saved on this device' : 'Could not save. This session is still playable.');
    };
    flushSaveRef.current = () => flushSave();
    const queueSave = () => {
      dirty = true;
      if (!canSave) return;
      setSaveMessage('Saving…');
      clearTimeout(saveTimer);
      saveTimer = setTimeout(flushSave, 400);
    };
    if (dirty) queueSave();

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

    const getBlock = (x: number, y: number, z: number) => worldMap.get(getCoordKey(x, y, z))?.type;
    const chests = createProjectChests(getBlock);
    scene.add(chests.group);
    const chestCells = new Set(chests.cells.map((cell) => getCoordKey(cell.x, cell.y, cell.z)));

    const guideMaterial = new THREE.LineBasicMaterial({ color: 0x83ffe0, transparent: true, opacity: 0.32, depthWrite: false });
    const guideGeometry = new THREE.EdgesGeometry(boxGeometry);
    const guideGroup = new THREE.Group();
    const guideCells = SHELTER_PLAN.map((cell) => {
      const outline = new THREE.LineSegments(guideGeometry, guideMaterial);
      outline.position.set(cell.x, cell.y, cell.z);
      guideGroup.add(outline);
      return { cell, outline };
    });
    scene.add(guideGroup);
    const awardShelter = createShelterReward();
    const updateChallenge = () => {
      const progress = shelterProgress(getBlock);
      setChallenge(progress);
      if (progress.complete) setBuilderUnlocked(true);
      if (awardShelter(progress.complete)) {
        setShowReward(true);
        clearTimeout(rewardTimer);
        rewardTimer = setTimeout(() => { if (!disposed) setShowReward(false); }, 6500);
      }
      const nextPart = progress.floor < 25 ? 'floor' : progress.walls < 30 ? 'walls' : 'roof';
      for (const { cell, outline } of guideCells) outline.visible = cell.part === nextPart && !getBlock(cell.x, cell.y, cell.z);
    };
    updateChallenge();

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
    const sleeveTexture = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#202629';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#343e43';
      ctx.fillRect(2, 1, 3, 12);
      ctx.fillStyle = '#141a1d';
      ctx.fillRect(12, 0, 4, 16);
      ctx.fillStyle = '#23d48d';
      ctx.fillRect(0, 14, 16, 1);
    });
    const armMat = new THREE.MeshLambertMaterial({ map: sleeveTexture });
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

    const armBaseX = () => Math.min(camera.aspect, 1.4) * 0.34;
    fullArm.scale.setScalar(0.6);
    fullArm.position.set(armBaseX(), -0.16, -0.9);
    fullArm.rotation.set(0.2, -0.2, 0.1);
    armGroup.add(fullArm);

    // Arm punch animation state
    let punchTime = 0;
    const triggerPunch = () => {
      punchTime = 1.0;
    };

    // 8. Player Controls & AABB Collision Physics
    const respawn = () => {
      camera.position.set(0, spawnHeight(getBlock), 0);
    };
    respawn();
    let playerYaw = 0;
    let playerPitch = -0.22;
    camera.rotation.order = 'YXZ';
    camera.rotation.x = playerPitch;
    const playerPos = camera.position;
    const playerVelocity = new THREE.Vector3(0, 0, 0);
    let isOnGround = false;
    let walkCycle = 0;
    let stepTimer = 0;

    const keys: Record<string, boolean> = {};
    const selectSlot = (slot: number) => {
      const next = Math.max(0, Math.min(HOTBAR_BLOCKS.length - 1, slot));
      selectedSlotRef.current = next;
      setSelectedSlot(next);
      heldItemMesh.material = blockMaterials[HOTBAR_BLOCKS[next].type];
      mcAudio.playClick();
    };
    selectSlotRef.current = selectSlot;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') { if (activeRef.current) pauseGame(); return; }
      if (!activeRef.current || pausedRef.current) return;
      if (e.code === 'KeyE') { e.preventDefault(); if (!e.repeat) interactRef.current(); return; }
      if (e.code === 'KeyH') { e.preventDefault(); pauseGame(); setShowHelp(true); return; }
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ControlLeft', 'ControlRight'].includes(e.code)) e.preventDefault();
      keys[e.code] = true;
      if (e.key >= '1' && e.key <= '9') {
        const slot = parseInt(e.key) - 1;
        if (slot < HOTBAR_BLOCKS.length) {
          selectSlot(slot);
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
      if (!activeRef.current || pausedRef.current || document.pointerLockElement !== renderer.domElement) return;
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

    // Capture only gestures that begin on the world, not on HUD controls.
    // Do not filter isPrimary: camera look can be the second or third finger.
    const onLookStart = (event: PointerEvent) => {
      if (!activeRef.current || pausedRef.current || !touchModeRef.current || event.button !== 0) return;
      event.preventDefault();
      if (touchInputRef.current.startLook(event.pointerId, event.clientX, event.clientY)) {
        renderer.domElement.setPointerCapture(event.pointerId);
      }
    };
    const onLookMove = (event: PointerEvent) => {
      if (!activeRef.current || pausedRef.current || !touchModeRef.current) return;
      const delta = touchInputRef.current.moveLook(event.pointerId, event.clientX, event.clientY);
      if (!delta) return;
      playerYaw -= delta.x * 0.004;
      playerPitch -= delta.y * 0.004;
      playerPitch = Math.max(-Math.PI / 2 + 0.04, Math.min(Math.PI / 2 - 0.04, playerPitch));
      camera.rotation.set(playerPitch, playerYaw, 0, 'YXZ');
    };
    const onLookEnd = (event: PointerEvent) => touchInputRef.current.endLook(event.pointerId);
    renderer.domElement.addEventListener('pointerdown', onLookStart);
    renderer.domElement.addEventListener('pointermove', onLookMove);
    renderer.domElement.addEventListener('pointerup', onLookEnd);
    renderer.domElement.addEventListener('pointercancel', onLookEnd);
    renderer.domElement.addEventListener('lostpointercapture', onLookEnd);

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      setIsLocked(locked);
      if (locked) {
        activeRef.current = true;
        pausedRef.current = false;
        setControlMessage('');
        setIsPaused(false);
      } else if (!touchModeRef.current) {
        pauseGame();
      }
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);
    const onPointerLockError = () => {
      pauseGame();
      setControlMessage('Mouse capture was blocked. Try Back to Game, or switch to touch controls.');
    };
    document.addEventListener('pointerlockerror', onPointerLockError);

    clearInputsRef.current = () => {
      for (const key of Object.keys(keys)) delete keys[key];
      mobileMoveRef.current = { forward: false, backward: false, left: false, right: false, jump: false, sprint: false };
      setDpadActive({ forward: false, backward: false, left: false, right: false, jump: false });
      setIsSprinting(false);
      touchInputRef.current.reset();
      playerVelocity.x = playerVelocity.z = 0;
      stepTimer = 0;
    };
    returnToSpawnRef.current = () => {
      clearInputsRef.current();
      respawn();
      playerVelocity.set(0, 0, 0);
      isOnGround = false;
      walkCycle = 0;
      playerYaw = 0;
      playerPitch = -0.22;
      camera.rotation.set(playerPitch, playerYaw, 0, 'YXZ');
    };
    const onBlur = () => { if (activeRef.current) pauseGame(); };
    const onVisibilityChange = () => { if (document.hidden) { pauseGame(); flushSave(); } };
    const onPageHide = () => flushSave(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);

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

    const previewMaterials = HOTBAR_BLOCKS.map((block) => {
      const original = blockMaterials[block.type];
      const clone = (material: THREE.Material) => {
        const preview = material.clone();
        preview.transparent = true;
        preview.opacity = 0.38;
        preview.depthWrite = false;
        return preview;
      };
      return Array.isArray(original) ? original.map(clone) : clone(original);
    });
    const placementPreview = new THREE.Mesh(boxGeometry, previewMaterials[0]);
    placementPreview.scale.setScalar(1.005);
    placementPreview.visible = false;
    scene.add(placementPreview);
    const targetGroups = [blockGroup, chests.group];
    const getTarget = () => {
      raycaster.setFromCamera(screenCenter, camera);
      return raycaster.intersectObjects(targetGroups, true)[0];
    };
    const getPlacement = (hit: THREE.Intersection) => {
      const cell = hit.object.userData.voxelCoord;
      if (!cell || !hit.face) return null;
      const position = {
        x: cell.x + Math.round(hit.face.normal.x),
        y: cell.y + Math.round(hit.face.normal.y),
        z: cell.z + Math.round(hit.face.normal.z),
      };
      const key = getCoordKey(position.x, position.y, position.z);
      return {
        position, key,
        feedback: placementFeedback(position, playerPos, hit.distance, worldMap.has(key) || chestCells.has(key), worldMap.size),
      };
    };
    const openTargetProject = (hit: THREE.Intersection | undefined) => {
      if (!hit) return false;
      const project = projectWithinReach(hit.object.userData.projectIndex, hit.distance);
      if (!project) return false;
      pauseGame();
      setSelectedProject(project);
      return true;
    };
    interactRef.current = () => {
      if (activeRef.current && !pausedRef.current) openTargetProject(getTarget());
    };
    let lastHint = '';
    const updateHint = (kind: string, message: string) => {
      if (`${kind}:${message}` === lastHint) return;
      lastHint = `${kind}:${message}`;
      setTargetHint({ kind, message });
    };

    // Actions: Mine Block & Place Block (supports desktop click & mobile PE buttons)
    const performMine = () => {
      if (!activeRef.current || pausedRef.current) return;
      const target = getTarget();
      if (openTargetProject(target)) return;
      triggerPunch();
      if (target && target.distance <= INTERACTION_REACH) {
        const hit = target;
        const { voxelCoord, type } = hit.object.userData;
        if (!voxelCoord) return;

        const def = HOTBAR_BLOCKS.find((b) => b.type === type);
        sfxEngine.playBreak(def?.soundType || 'stone');
        spawnDebris(hit.point, type);

        worldMap.delete(getCoordKey(voxelCoord.x, voxelCoord.y, voxelCoord.z));
        blockGroup.remove(hit.object);
        updateChallenge();
        queueSave();

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
      if (!activeRef.current || pausedRef.current) return;
      const target = getTarget();
      const placement = target && getPlacement(target);
      if (!placement || placement.feedback) return;
      triggerPunch();
      const { x, y, z } = placement.position;
      const selectedDef = HOTBAR_BLOCKS[selectedSlotRef.current];
      sfxEngine.playPlace();
      const newMesh = spawnMeshForVoxel(x, y, z, selectedDef.type);
      worldMap.set(placement.key, { type: selectedDef.type, mesh: newMesh });
      updateChallenge();
      queueSave();
    };

    performMineRef.current = performMine;
    performPlaceRef.current = performPlace;

    // Mouse Actions (Mining & Placing)
    const onMouseDown = (e: MouseEvent) => {
      if (pausedRef.current || touchModeRef.current || !activeRef.current) return;
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
    const onWheel = (event: WheelEvent) => {
      if (!activeRef.current || pausedRef.current || !event.deltaY) return;
      event.preventDefault();
      selectSlot(cycleSlot(selectedSlotRef.current, event.deltaY, HOTBAR_BLOCKS.length));
    };
    canvasDom.addEventListener('wheel', onWheel, { passive: false });

    // 9. True AABB Voxel Wall Collision Test
    const isSolidBlockAt = (x: number, y: number, z: number) => {
      const key = getCoordKey(Math.round(x), Math.round(y), Math.round(z));
      const b = worldMap.get(key);
      return chestCells.has(key) || (!!b && b.type !== BlockType.AIR);
    };

    const collidesWithWorld = (px: number, py: number, pz: number) => {
      const radius = 0.3;
      const height = 1.7;
      const minX = px - radius;
      const maxX = px + radius;
      const minY = py - 1.62;
      const maxY = minY + height + 0.1;
      const minZ = pz - radius;
      const maxZ = pz + radius;

      for (let x = Math.floor(minX + 0.500001); x <= Math.floor(maxX + 0.499999); x++) {
        for (let y = Math.floor(minY + 0.500001); y <= Math.floor(maxY + 0.499999); y++) {
          for (let z = Math.floor(minZ + 0.500001); z <= Math.floor(maxZ + 0.499999); z++) {
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
    let simulationTime = 0;
    let animationFrame = 0;

    const animate = () => {
      const now = performance.now();
      const frame = simulationStep(lastTime, now, activeRef.current, pausedRef.current);
      const delta = frame.delta;
      lastTime = frame.time;
      guideGroup.visible = guidesRef.current;
      if (!delta) {
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      simulationTime += delta;

      // Slowly drift clouds
      cloudGroup.position.x = simulationTime % 44;

      // Aiming feedback and actions share the same nearest-hit and placement checks.
      const target = getTarget();
      highlightMesh.visible = false;
      placementPreview.visible = false;
      if (target) {
        const projectIndex = target.object.userData.projectIndex;
        const cell = typeof projectIndex === 'number' ? chests.cells[projectIndex] : target.object.userData.voxelCoord;
        if (cell) {
          highlightMesh.position.set(cell.x, cell.y, cell.z);
          highlightMesh.visible = true;
          highlightMesh.material.color.set(target.distance > INTERACTION_REACH ? '#ff7373' : '#fff0a3');
        }
        if (target.distance > INTERACTION_REACH) {
          updateHint('blocked', 'Out of reach — move closer');
        } else if (typeof projectIndex === 'number') {
          updateHint('project', `${PROJECT_CHESTS[projectIndex].label} — ${touchModeRef.current ? 'tap Open Chest' : 'E / left click to open'}`);
        } else {
          const placement = getPlacement(target);
          if (placement) {
            placementPreview.position.set(placement.position.x, placement.position.y, placement.position.z);
            placementPreview.material = previewMaterials[selectedSlotRef.current];
            const materials = Array.isArray(placementPreview.material) ? placementPreview.material : [placementPreview.material];
            for (const material of materials) {
              if (material instanceof THREE.MeshLambertMaterial) material.color.set(placement.feedback ? '#ff6161' : '#9affe0');
            }
            placementPreview.visible = true;
            updateHint(placement.feedback ? 'blocked' : 'block', placement.feedback || `Place ${HOTBAR_BLOCKS[selectedSlotRef.current].name}`);
          }
        }
      } else updateHint('idle', 'Aim at a block to build, or a project chest to explore');

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
      const isSprinting = keys['ControlLeft'] || keys['ControlRight'] || keys['KeyR'] || mobileMoveRef.current.sprint;

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
      const verticalMove = playerVelocity.y * delta;
      const steps = Math.max(1, Math.ceil(Math.abs(verticalMove) / 0.2));
      isOnGround = false;
      for (let step = 0; step < steps; step++) {
        const increment = verticalMove / steps;
        if (collidesWithWorld(playerPos.x, playerPos.y + increment, playerPos.z)) {
          let safe = 0;
          let blocked = 1;
          for (let attempt = 0; attempt < 12; attempt++) {
            const fraction = (safe + blocked) / 2;
            if (collidesWithWorld(playerPos.x, playerPos.y + increment * fraction, playerPos.z)) blocked = fraction;
            else safe = fraction;
          }
          playerPos.y += increment * safe;
          isOnGround = playerVelocity.y < 0;
          playerVelocity.y = 0;
          break;
        }
        playerPos.y += increment;
      }

      // Fall off safety
      if (playerPos.y < -15) {
        respawn();
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
        fullArm.position.z = -0.9 + swing * 0.12;
      } else {
        // Arm walk bobbing
        const armBob = Math.sin(walkCycle) * 0.03;
        fullArm.position.y = -0.16 + armBob + headBobY * 0.5;
        fullArm.position.x = armBaseX() + headBobX * 0.5;
        fullArm.position.z = -0.9;
        fullArm.rotation.x = 0.2 + armBob * 1.5;
      }

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      activeRef.current = false;
      flushSave(false);
      clearTimeout(saveTimer);
      clearTimeout(rewardTimer);
      cancelAnimationFrame(animationFrame);
      performMineRef.current = () => {};
      performPlaceRef.current = () => {};
      interactRef.current = () => {};
      returnToSpawnRef.current = () => {};
      clearInputsRef.current = () => {};
      flushSaveRef.current = () => {};
      selectSlotRef.current = () => {};
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      touchInputRef.current.reset();
      renderer.domElement.removeEventListener('pointerdown', onLookStart);
      renderer.domElement.removeEventListener('pointermove', onLookMove);
      renderer.domElement.removeEventListener('pointerup', onLookEnd);
      renderer.domElement.removeEventListener('pointercancel', onLookEnd);
      renderer.domElement.removeEventListener('lostpointercapture', onLookEnd);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('resize', onResize);
      canvasDom.removeEventListener('mousedown', onMouseDown);
      canvasDom.removeEventListener('contextmenu', onContextMenu);
      canvasDom.removeEventListener('wheel', onWheel);
      if (document.pointerLockElement === canvasDom) {
        document.exitPointerLock();
      }
      const geometries = new Set<THREE.BufferGeometry>([boxGeometry, particleGeo, guideGeometry]);
      const materials = new Set<THREE.Material>([...Object.values(blockMaterials).flat(), ...previewMaterials.flat()]);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          geometries.add(object.geometry);
        }
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Sprite) {
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        }
      });
      const textures = new Set<THREE.Texture>();
      for (const material of materials) {
        if ('map' in material && material.map instanceof THREE.Texture) textures.add(material.map);
        material.dispose();
      }
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [worldRevision]);

  const resumeGame = () => {
    mcAudio.playClick();
    setConfirmReset(false);
    setSelectedProject(null);
    setShowHelp(false);
    setControlMessage('');
    if (touchModeRef.current) {
      pausedRef.current = false;
      activeRef.current = true;
      setIsPaused(false);
      return;
    }
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      try {
        const request = canvas.requestPointerLock();
        request?.catch(() => {
          pauseGame();
          setControlMessage('Mouse capture was blocked. Try again or use touch controls.');
        });
      } catch {
        pauseGame();
        setControlMessage('Mouse capture is unavailable. Use touch controls to play.');
      }
    }
  };

  const handleQuitGame = () => {
    mcAudio.playClick();
    activeRef.current = false;
    flushSaveRef.current();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    onQuit();
  };

  const toggleControls = () => {
    pauseGame();
    const next = !touchModeRef.current;
    touchModeRef.current = next;
    setIsTouchDevice(next);
    setControlMessage('');
  };

  const resetWorld = () => {
    resetRequestedRef.current = true;
    activeRef.current = false;
    pausedRef.current = true;
    setConfirmReset(false);
    setShowGuides(true);
    setSelectedSlot(0);
    selectedSlotRef.current = 0;
    setWorldRevision((revision) => revision + 1);
  };

  return (
    <div className="relative w-screen h-full overflow-hidden select-none font-minecraft">
      {/* 3D Canvas */}
      <div ref={containerRef} className="sandbox-canvas w-full h-full cursor-none" />

      {/* Inverted Minecraft Crosshair */}
      {!isPaused && (isLocked || isTouchDevice) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className={`w-4 h-4 flex items-center justify-center text-2xl font-bold select-none ${targetHint.kind === 'blocked' ? 'text-red-300' : 'text-white'}`}
            style={{ mixBlendMode: 'difference' }}
          >
            +
          </div>
        </div>
      )}

      {!isPaused && (isLocked || isTouchDevice) && (
        <div className={`sandbox-target reading-text ${targetHint.kind === 'blocked' ? 'sandbox-target--blocked' : ''}`}>
          <p>{targetHint.message}</p>
          {targetHint.kind === 'project' && isTouchDevice && <button
            onClick={() => interactRef.current()}
            className="minecraft-button pointer-events-auto px-4 h-11 mt-2 text-xs font-minecraft"
          >Open Chest</button>}
        </div>
      )}

      {showReward && !isPaused && <div className="sandbox-reward" role="status">
        <div className="sandbox-reward-particles" aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => <i key={index} style={{ '--piece': index } as React.CSSProperties} />)}
        </div>
        <p className="sandbox-eyebrow">ACHIEVEMENT UNLOCKED</p>
        <p>Builder unlocked!</p>
        <p className="reading-text text-sm">Shelter complete. Make yourself at home.</p>
      </div>}

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
        <div className="sandbox-topbar">
          {/* Minecraft PE Center Top Pause Button */}
          <button
            onClick={() => {
              mcAudio.playClick();
              pauseGame();
            }}
            className="pe-button px-3 py-1.5 rounded font-bold"
            title="Pause Game"
          >
            ❚❚ PAUSE
          </button>

          <button onClick={() => { pauseGame(); setShowHelp(true); }} className="pe-button px-3 py-1 rounded" title="Open controls guide (H)">
            ? HELP
          </button>

          {/* Desktop/Touch Mode Toggle */}
          <button
            onClick={() => {
              mcAudio.playClick();
              toggleControls();
            }}
            className="pe-button px-2.5 py-1 rounded"
            title="Toggle between Mobile Pocket Edition and Desktop PC controls"
          >
            {isTouchDevice ? '📱 Mobile PE' : '💻 PC Controls'}
          </button>
        </div>
      )}

      {!isPaused && (
        <aside className="sandbox-status" aria-label="Creative sandbox status">
          <p className="text-green-200 text-[10px]">Creative Sandbox</p>
          <p className="reading-text text-xs text-gray-100" role="status">{saveMessage}</p>
          <p className="reading-text text-xs mt-2 text-yellow-100">Three project chests near spawn. Aim at one and {isTouchDevice ? 'tap Open Chest' : 'press E'}.</p>
          {builderUnlocked && <p className="text-[9px] mt-2 text-yellow-200">★ Builder unlocked</p>}
          <progress className="sandbox-progress" aria-label="Shelter completion" max={SHELTER_PLAN.length} value={challenge.total} />
          <details className="mt-2">
            <summary className="text-[10px] cursor-pointer py-2">{challenge.complete ? 'Shelter built!' : `Shelter challenge: ${challenge.total}/${SHELTER_PLAN.length}`}</summary>
            <div className="reading-text text-xs space-y-2 mt-2">
              <p>Follow the glowing outline ahead of spawn. Use any blocks, and leave the front doorway open.</p>
              <p>Floor: {challenge.floor}/25 · Walls: {challenge.walls}/30 · Roof: {challenge.roof}/25</p>
              <label className="flex items-center gap-2 py-2">
                <input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} /> Show building guide
              </label>
            </div>
          </details>
        </aside>
      )}

      {/* Minecraft Pocket Edition (PE) On-Screen Touch Controls */}
      {isTouchDevice && !isPaused && (
        <>
          {/* Bottom-Left: Authentic Minecraft PE D-Pad */}
          <div className="fixed bottom-3 left-2 sm:bottom-6 sm:left-6 z-30 select-none pe-dpad-container pointer-events-auto">
            {/* Row 1: [Empty] [▲ Forward] [Empty] */}
            <div />
            <button
              {...movementControl('forward')}
              aria-label="Move forward (W)"
              className={`pe-button rounded-t ${dpadActive.forward ? 'active' : ''}`}
              title="Move Forward"
            >
              ▲
            </button>
            <div />

            {/* Row 2: [◄ Left] [⬥ Center Sneak/Sprint] [► Right] */}
            <button
              {...movementControl('left')}
              aria-label="Move left (A)"
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
              {...movementControl('right')}
              aria-label="Move right (D)"
              className={`pe-button rounded-r ${dpadActive.right ? 'active' : ''}`}
              title="Strafe Right"
            >
              ►
            </button>

            {/* Row 3: [Empty] [▼ Backward] [Empty] */}
            <div />
            <button
              {...movementControl('backward')}
              aria-label="Move backward (S)"
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
              {...movementControl('jump')}
              aria-label="Jump"
              className={`pe-jump-btn ${dpadActive.jump ? 'active' : ''}`}
              title="Jump"
            >
              ▲
            </button>
          </div>
        </>
      )}

      {/* Authentic Minecraft In-Game HUD */}
      <div className={`sandbox-hud ${isTouchDevice ? 'sandbox-hud--touch' : ''} absolute bottom-2 sm:bottom-3 inset-x-0 flex flex-col items-center pointer-events-none z-20 px-2`}>
        {/* Selected block label */}
        <div className="text-white text-xs mc-text-shadow font-bold mb-1.5">
          {HOTBAR_BLOCKS[selectedSlot]?.name}
        </div>

        {/* 9-Slot Hotbar */}
        <div className="flex bg-[#8f8f8f] p-0.5 sm:p-1 border-2 sm:border-3 border-black shadow-[inset_-2px_-2px_0px_#555,inset_2px_2px_0px_#fff] max-w-full overflow-x-auto">
          {HOTBAR_BLOCKS.map((block, idx) => {
            const isSelected = idx === selectedSlot;
            return (
              <button
                type="button"
                key={block.type}
                disabled={isPaused}
                aria-label={`Select ${block.name}, slot ${idx + 1}`}
                aria-pressed={isSelected}
                onClick={() => selectSlotRef.current(idx)}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 border-2 flex items-center justify-center relative cursor-pointer pointer-events-auto transition-transform ${
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
                {blockIcons[block.type] ? <img src={blockIcons[block.type]} alt="" className="w-6 h-6 sm:w-8 sm:h-8" draggable={false} /> : <div
                  className="w-4 h-4 sm:w-6 sm:h-6 border border-black/40 shadow-sm"
                  style={{ backgroundColor: block.iconColor }}
                />}
                <span className="absolute bottom-0.5 right-0.5 sm:right-1 text-[8px] sm:text-[9px] text-white font-mono drop-shadow-[1px_1px_0px_#000]">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Control Hints */}
        <div className="text-[9px] sm:text-[10px] text-gray-300 mc-text-shadow mt-1 text-center">
          {isTouchDevice
            ? 'Hold / slide D-Pad: Move • Swipe world with another finger: Look • ⛏️ Mine • 🧱 Place • ▲ Jump'
            : 'WASD: Move • Ctrl: Sprint • Space: Jump • Left: Mine • Right: Place • E: Chest • H: Help • Esc: Pause'}
        </div>
      </div>

      {/* Pause Menu (ESC) */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
          <div ref={pauseDialogRef} role="dialog" aria-modal="true" aria-labelledby="sandbox-pause-title" tabIndex={-1} className={`sandbox-dialog modal-content flex flex-col items-center gap-3 p-4 ${selectedProject || showHelp ? 'sandbox-dialog--wide' : ''}`}>
            <h2 id="sandbox-pause-title" className="text-xl font-bold text-white mc-text-shadow mb-2">
              {selectedProject ? selectedProject.name : showHelp ? 'Controls & Help' : confirmReset ? 'Reset World?' : 'Game Paused'}
            </h2>

            {selectedProject ? <ProjectChestPanel project={selectedProject} onClose={resumeGame} /> : showHelp ? (
              <SandboxControls touch={isTouchDevice} onClose={() => setShowHelp(false)} />
            ) : <>
            <p className="reading-text text-sm text-gray-100 text-center" role="status">{saveMessage}</p>
            {controlMessage && <p className="reading-text text-sm text-yellow-200 text-center" role="alert">{controlMessage}</p>}

            {confirmReset ? (
              <>
                <p className="reading-text text-sm text-white text-center">This replaces your saved world and shelter progress on this browser with fresh terrain. Your current builds will be lost.</p>
                <button onClick={resetWorld} className="minecraft-button w-full h-12 text-xs">Reset World</button>
                <button autoFocus onClick={() => setConfirmReset(false)} className="minecraft-button w-full h-12 text-xs">Keep My World</button>
              </>
            ) : (
              <>

            <button
              onClick={resumeGame}
              className="minecraft-button w-full h-11 text-sm"
            >
              Back to Game
            </button>

            <button onClick={() => flushSaveRef.current()} className="minecraft-button w-full h-11 text-xs">Save World</button>
            <button onClick={() => { returnToSpawnRef.current(); resumeGame(); }} className="minecraft-button w-full h-11 text-xs">Return to Spawn</button>
            <button onClick={() => setShowHelp(true)} className="minecraft-button w-full h-11 text-xs">Controls & Help</button>
            <button onClick={toggleControls} className="minecraft-button w-full h-11 text-xs">{isTouchDevice ? 'Use PC Controls' : 'Use Touch Controls'}</button>
            <button onClick={() => setConfirmReset(true)} className="minecraft-button w-full h-11 text-xs">Reset World…</button>
            <label className="reading-text flex items-center gap-2 text-sm text-white py-2">
              <input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} /> Show shelter guide
            </label>

            <button
              onClick={handleQuitGame}
              className="minecraft-button w-full h-11 text-sm"
            >
              Quit to Title Screen
            </button>
              </>
            )}
            </>}
          </div>
        </div>
      )}
    </div>
  );
};

