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
}

const HOTBAR_BLOCKS: BlockDef[] = [
  { type: BlockType.GRASS, name: 'Grass Block', iconColor: '#4f8924' },
  { type: BlockType.DIRT, name: 'Dirt', iconColor: '#725138' },
  { type: BlockType.STONE, name: 'Stone', iconColor: '#7a7a7a' },
  { type: BlockType.WOOD, name: 'Oak Wood', iconColor: '#675232' },
  { type: BlockType.LEAVES, name: 'Oak Leaves', iconColor: '#346115' },
  { type: BlockType.COBBLESTONE, name: 'Cobblestone', iconColor: '#636363' },
  { type: BlockType.BRICK, name: 'Bricks', iconColor: '#944131' },
  { type: BlockType.DIAMOND_ORE, name: 'Diamond Ore', iconColor: '#2cc5d4' },
  { type: BlockType.GLASS, name: 'Glass', iconColor: '#e0f2fe' },
];

// Helper to generate 16x16 pixel textures on HTML canvas
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

export const MinecraftGame: React.FC<MinecraftGameProps> = ({ onQuit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Selected slot ref for event handlers
  const selectedSlotRef = useRef(selectedSlot);
  selectedSlotRef.current = selectedSlot;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#78A7FF'); // Minecraft Day Sky
    scene.fog = new THREE.FogExp2('#78A7FF', 0.025);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(50, 80, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 3. Pixel Textures & Materials
    // Dirt Texture
    const dirtTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, 16, 16);
      const dirtColors = ['#725138', '#5c412d', '#9a6e4d', '#7d593d'];
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() > 0.4) {
            ctx.fillStyle = dirtColors[Math.floor(Math.random() * dirtColors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });

    // Grass Top Texture
    const grassTopTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#4f8924';
      ctx.fillRect(0, 0, 16, 16);
      const greenColors = ['#5b9b2a', '#45781f', '#3b661a', '#549027'];
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() > 0.3) {
            ctx.fillStyle = greenColors[Math.floor(Math.random() * greenColors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });

    // Grass Side Texture
    const grassSideTex = createVoxelTexture((ctx) => {
      // Base dirt
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, 16, 16);
      const dirtColors = ['#725138', '#5c412d', '#9a6e4d'];
      for (let x = 0; x < 16; x++) {
        for (let y = 4; y < 16; y++) {
          if (Math.random() > 0.4) {
            ctx.fillStyle = dirtColors[Math.floor(Math.random() * dirtColors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      // Top green overhang
      ctx.fillStyle = '#4f8924';
      ctx.fillRect(0, 0, 16, 3);
      for (let x = 0; x < 16; x++) {
        const drop = 3 + (x % 3 === 0 ? 2 : x % 2 === 0 ? 1 : 0);
        ctx.fillStyle = '#5b9b2a';
        ctx.fillRect(x, 0, 1, drop);
      }
    });

    // Stone Texture
    const stoneTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, 16, 16);
      const stoneColors = ['#8c8c8c', '#686868', '#5c5c5c', '#727272'];
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() > 0.3) {
            ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });

    // Oak Wood Side
    const woodSideTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#675232';
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (x % 4 === 0 || Math.random() > 0.7) {
            ctx.fillStyle = Math.random() > 0.5 ? '#534228' : '#7b623c';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });

    // Oak Wood Top (Rings)
    const woodTopTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#bc985a';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#8d703e';
      ctx.strokeRect(2, 2, 12, 12);
      ctx.strokeRect(5, 5, 6, 6);
    });

    // Oak Leaves Texture
    const leavesTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#346115';
      ctx.fillRect(0, 0, 16, 16);
      const leafColors = ['#41791a', '#2a4f10', '#4d8e1f', '#24430e'];
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() > 0.35) {
            ctx.fillStyle = leafColors[Math.floor(Math.random() * leafColors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });

    // Cobblestone
    const cobbleTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#636363';
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 8; i++) {
        const x = (i * 5) % 14;
        const y = (i * 3) % 14;
        ctx.fillStyle = '#454545';
        ctx.strokeRect(x, y, 4, 3);
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + 1, y + 1, 2, 1);
      }
    });

    // Bricks
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

    // Diamond Ore
    const diamondTex = createVoxelTexture((ctx) => {
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, 16, 16);
      const stoneColors = ['#8c8c8c', '#686868', '#5c5c5c'];
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() > 0.4) {
            ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      // Diamond flecks
      const gems = [[3, 3], [4, 4], [11, 4], [12, 5], [6, 10], [7, 11], [11, 11]];
      gems.forEach(([gx, gy]) => {
        ctx.fillStyle = '#5decf5';
        ctx.fillRect(gx, gy, 2, 2);
        ctx.fillStyle = '#1b8e9b';
        ctx.fillRect(gx + 1, gy + 1, 1, 1);
      });
    });

    // Glass
    const glassTex = createVoxelTexture((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(230, 245, 255, 0.4)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(0, 0, 16, 16);
      // Highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 3, 1);
      ctx.fillRect(3, 3, 1, 2);
    });

    // Material Map
    const blockMaterials: Record<BlockType, THREE.Material | THREE.Material[]> = {
      [BlockType.AIR]: new THREE.MeshBasicMaterial({ visible: false }),
      [BlockType.GRASS]: [
        new THREE.MeshLambertMaterial({ map: grassSideTex }), // right (+x)
        new THREE.MeshLambertMaterial({ map: grassSideTex }), // left (-x)
        new THREE.MeshLambertMaterial({ map: grassTopTex }),  // top (+y)
        new THREE.MeshLambertMaterial({ map: dirtTex }),      // bottom (-y)
        new THREE.MeshLambertMaterial({ map: grassSideTex }), // front (+z)
        new THREE.MeshLambertMaterial({ map: grassSideTex }), // back (-z)
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
      [BlockType.GLASS]: new THREE.MeshLambertMaterial({ map: glassTex, transparent: true, opacity: 0.6 }),
    };

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

    // 4. Voxel World Representation
    const WORLD_SIZE = 26;
    const worldMap = new Map<string, { type: BlockType; mesh?: THREE.Mesh }>();

    const getCoordKey = (x: number, y: number, z: number) => `${x},${y},${z}`;

    // Procedural terrain generation
    for (let x = -WORLD_SIZE / 2; x <= WORLD_SIZE / 2; x++) {
      for (let z = -WORLD_SIZE / 2; z <= WORLD_SIZE / 2; z++) {
        // Height formula with gentle hills
        const distFromCenter = Math.sqrt(x * x + z * z);
        const height = Math.floor(
          5 +
          Math.sin(x * 0.25) * 2 +
          Math.cos(z * 0.25) * 2 +
          Math.sin(distFromCenter * 0.15) * 1.5
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

    // Add Oak Trees
    const treeCoords = [
      [-5, -4], [6, 5], [-8, 6], [7, -7], [-3, 7], [4, -4]
    ];

    treeCoords.forEach(([tx, tz]) => {
      // Find ground height
      let gy = 0;
      for (let y = 15; y >= 0; y--) {
        if (worldMap.has(getCoordKey(tx, y, tz))) {
          gy = y + 1;
          break;
        }
      }

      const trunkHeight = 4;
      // Trunk
      for (let y = 0; y < trunkHeight; y++) {
        worldMap.set(getCoordKey(tx, gy + y, tz), { type: BlockType.WOOD });
      }

      // Leaves Canopy
      const topY = gy + trunkHeight;
      for (let lx = -2; lx <= 2; lx++) {
        for (let lz = -2; lz <= 2; lz++) {
          for (let ly = 0; ly <= 2; ly++) {
            if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly === 2) continue;
            const leafKey = getCoordKey(tx + lx, topY + ly - 1, tz + lz);
            if (!worldMap.has(leafKey) || worldMap.get(leafKey)!.type === BlockType.AIR) {
              worldMap.set(leafKey, { type: BlockType.LEAVES });
            }
          }
        }
      }
    });

    // Helper: Is voxel transparent or empty?
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

    // Mesh Group for voxel blocks
    const blockGroup = new THREE.Group();
    scene.add(blockGroup);

    const spawnMeshForVoxel = (x: number, y: number, z: number, type: BlockType) => {
      const mat = blockMaterials[type];
      const mesh = new THREE.Mesh(boxGeometry, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = type !== BlockType.GLASS;
      mesh.receiveShadow = true;
      mesh.userData = { voxelCoord: { x, y, z }, type };
      blockGroup.add(mesh);
      return mesh;
    };

    // Spawn visible blocks
    worldMap.forEach((val, key) => {
      if (val.type === BlockType.AIR) return;
      const [x, y, z] = key.split(',').map(Number);
      if (isExposed(x, y, z)) {
        val.mesh = spawnMeshForVoxel(x, y, z, val.type);
      }
    });

    // 5. Targeting Highlight Box
    const highlightGeo = new THREE.BoxGeometry(1.005, 1.005, 1.005);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      opacity: 0.6
    });
    const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    highlightMesh.visible = false;
    scene.add(highlightMesh);

    // 6. Player State & Camera Position
    camera.position.set(0, 10, 0);
    let playerYaw = 0;
    let playerPitch = 0;
    const playerPos = camera.position;
    const playerVelocity = new THREE.Vector3(0, 0, 0);
    let isOnGround = false;

    // Movement keys
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;

      // Slot 1-9
      if (e.key >= '1' && e.key <= '9') {
        const slot = parseInt(e.key) - 1;
        if (slot < HOTBAR_BLOCKS.length) {
          setSelectedSlot(slot);
          mcAudio.playClick();
        }
      }

      // Escape to toggle pause
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

    // Mouse Look (Pointer Lock)
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      const sensitivity = 0.0022;
      playerYaw -= e.movementX * sensitivity;
      playerPitch -= e.movementY * sensitivity;
      // Clamp pitch to avoid flips
      playerPitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, playerPitch));

      camera.rotation.set(0, 0, 0);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = playerYaw;
      camera.rotation.x = playerPitch;
    };

    window.addEventListener('mousemove', onMouseMove);

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      setIsLocked(locked);
      setIsPaused(!locked);
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Raycasting for block breaking/placing
    const raycaster = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0);

    // Mouse Clicks (Break / Place)
    const onMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
        return;
      }

      raycaster.setFromCamera(screenCenter, camera);
      const intersects = raycaster.intersectObjects(blockGroup.children);

      if (intersects.length > 0 && intersects[0].distance <= 5.5) {
        const hit = intersects[0];
        const { voxelCoord } = hit.object.userData;
        if (!voxelCoord) return;

        if (e.button === 0) {
          // Left Click: Break Block
          mcAudio.playPop();
          worldMap.delete(getCoordKey(voxelCoord.x, voxelCoord.y, voxelCoord.z));
          blockGroup.remove(hit.object);

          // Reveal any newly exposed neighboring blocks
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
        } else if (e.button === 2) {
          // Right Click: Place Block
          if (!hit.face) return;
          const placeX = voxelCoord.x + Math.round(hit.face.normal.x);
          const placeY = voxelCoord.y + Math.round(hit.face.normal.y);
          const placeZ = voxelCoord.z + Math.round(hit.face.normal.z);

          // Prevent placing block inside player's body
          const pBlockX = Math.round(playerPos.x);
          const pBlockY = Math.floor(playerPos.y);
          const pBlockZ = Math.round(playerPos.z);

          if (placeX === pBlockX && (placeY === pBlockY || placeY === pBlockY - 1) && placeZ === pBlockZ) {
            return;
          }

          const placeKey = getCoordKey(placeX, placeY, placeZ);
          if (!worldMap.has(placeKey)) {
            const selectedDef = HOTBAR_BLOCKS[selectedSlotRef.current];
            mcAudio.playClick();
            const newMesh = spawnMeshForVoxel(placeX, placeY, placeZ, selectedDef.type);
            worldMap.set(placeKey, { type: selectedDef.type, mesh: newMesh });
          }
        }
      }
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', onMouseDown);
    // Prevent browser context menu on right-click in game
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    canvasDom.addEventListener('contextmenu', onContextMenu);

    // Initial pointer lock request
    canvasDom.requestPointerLock();

    // 7. Physics & Game Loop
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Update targeting highlight
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

      // Movement logic
      const speed = 7.0;
      const moveDir = new THREE.Vector3();

      if (keys['KeyW']) moveDir.z -= 1;
      if (keys['KeyS']) moveDir.z += 1;
      if (keys['KeyA']) moveDir.x -= 1;
      if (keys['KeyD']) moveDir.x += 1;

      moveDir.normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);

      playerVelocity.x = moveDir.x * speed;
      playerVelocity.z = moveDir.z * speed;

      // Gravity & Jumping
      playerVelocity.y -= 19.0 * delta; // Gravity

      if (keys['Space'] && isOnGround) {
        playerVelocity.y = 7.5; // Jump
        isOnGround = false;
      }

      // Simple collision with blocks below
      const checkX = Math.round(playerPos.x);
      const checkZ = Math.round(playerPos.z);
      const feetY = playerPos.y - 1.5;

      let highestGroundY = -999;
      for (let y = Math.floor(feetY) + 2; y >= Math.floor(feetY) - 1; y--) {
        if (worldMap.has(getCoordKey(checkX, y, checkZ))) {
          highestGroundY = y + 1.5;
          break;
        }
      }

      playerPos.x += playerVelocity.x * delta;
      playerPos.z += playerVelocity.z * delta;
      playerPos.y += playerVelocity.y * delta;

      if (playerPos.y <= highestGroundY) {
        playerPos.y = highestGroundY;
        playerVelocity.y = 0;
        isOnGround = true;
      } else {
        isOnGround = false;
      }

      // Prevent falling below world
      if (playerPos.y < -10) {
        playerPos.set(0, 12, 0);
        playerVelocity.set(0, 0, 0);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const reqId = requestAnimationFrame(animate);

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
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
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Crosshair */}
      {isLocked && !isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-white text-2xl font-bold opacity-80 drop-shadow-[1px_1px_1px_#000]">
            +
          </div>
        </div>
      )}

      {/* Click to Play Prompt (when not locked and not paused) */}
      {!isLocked && !isPaused && (
        <div
          onClick={resumeGame}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
        >
          <div className="mc-window p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-black mb-2">Click to Play!</h3>
            <p className="text-xs text-gray-800 mb-4">
              Click anywhere inside the game to capture mouse control and look around.
            </p>
            <button className="minecraft-button w-full h-10 text-xs">
              Enter World
            </button>
          </div>
        </div>
      )}

      {/* In-Game HUD (Hotbar, Health, Hunger) */}
      <div className="absolute bottom-3 inset-x-0 flex flex-col items-center pointer-events-none z-20">
        {/* Selected block label */}
        <div className="text-white text-xs mc-text-shadow font-bold mb-2">
          {HOTBAR_BLOCKS[selectedSlot]?.name}
        </div>

        {/* Health (10 Hearts) & Hunger (10 Icons) */}
        <div className="w-[360px] max-w-[90vw] flex justify-between px-1 mb-1 text-sm select-none">
          <div className="flex gap-0.5" title="10/10 Hearts">
            {'❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️'}
          </div>
          <div className="flex gap-0.5" title="10/10 Food">
            {'🍗🍗🍗🍗🍗🍗🍗🍗🍗🍗'}
          </div>
        </div>

        {/* 9-Slot Minecraft Hotbar */}
        <div className="flex bg-[#8f8f8f] p-1 border-3 border-black shadow-[inset_-2px_-2px_0px_#555,inset_2px_2px_0px_#fff]">
          {HOTBAR_BLOCKS.map((block, idx) => {
            const isSelected = idx === selectedSlot;
            return (
              <div
                key={block.type}
                onClick={() => {
                  setSelectedSlot(idx);
                  mcAudio.playClick();
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 border-2 flex items-center justify-center relative cursor-pointer pointer-events-auto transition-transform ${
                  isSelected
                    ? 'border-white bg-white/30 scale-110 shadow-lg z-10'
                    : 'border-[#373737] bg-[#8b8b8b]'
                }`}
                style={{
                  boxShadow: isSelected
                    ? 'inset -2px -2px 0px #fff, inset 2px 2px 0px #fff'
                    : 'inset -2px -2px 0px #373737, inset 2px 2px 0px #555'
                }}
                title={`Slot ${idx + 1}: ${block.name}`}
              >
                {/* Block Color Preview / Pixel icon */}
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 border border-black/40 shadow-sm"
                  style={{ backgroundColor: block.iconColor }}
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] text-white font-mono drop-shadow-[1px_1px_0px_#000]">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Help Tooltip */}
        <div className="text-[10px] text-gray-300 mc-text-shadow mt-1">
          WASD: Move • Space: Jump • Left Click: Break • Right Click: Place • 1-9: Slot • ESC: Pause
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
