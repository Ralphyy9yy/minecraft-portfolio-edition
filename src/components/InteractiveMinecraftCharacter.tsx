import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mcAudio } from '../utils/audio';

interface InteractiveMinecraftCharacterProps {
  className?: string;
}

// Helper to create 16x16 pixel-art CanvasTexture with NearestFilter
function createSteveTexture(drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
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

export const InteractiveMinecraftCharacter: React.FC<InteractiveMinecraftCharacterProps> = ({
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isClickJumping = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 155;
    const height = mount.clientHeight || 225;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Camera framed on full body Steve
    camera.position.set(0, -0.1, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // 2. Lighting (Warm Minecraft Sunlight + Ambient)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ea, 1.5);
    sunLight.position.set(3.5, 6, 4);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x70a0ff, 0.5);
    rimLight.position.set(-3, 1, 2);
    scene.add(rimLight);

    // 3. Official Minecraft Steve Skin Textures (16x16 pixel grid)
    const hairDark = '#2c1a0e';
    const hairMid = '#3b2413';
    const hairLight = '#4c2e17';
    const skinBase = '#b87b54';
    const skinHighlight = '#c68a62';
    const skinShadow = '#9c623f';
    const skinNose = '#885132';
    const steveBeard = '#4e2b16';
    const steveBeardDark = '#361e0e';

    // Head Front Face: Real Minecraft Steve
    const steveHeadFront = createSteveTexture((ctx) => {
      // Base Tan Skin
      ctx.fillStyle = skinBase;
      ctx.fillRect(0, 0, 16, 16);

      // Forehead
      ctx.fillStyle = skinHighlight;
      ctx.fillRect(2, 4, 12, 4);

      // Steve's Classic Hair (Rows 0-3 with iconic fringe)
      ctx.fillStyle = hairDark;
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillRect(0, 4, 2, 4);
      ctx.fillRect(14, 4, 2, 4);
      // Textured hair locks
      ctx.fillStyle = hairMid;
      ctx.fillRect(2, 0, 4, 3);
      ctx.fillRect(10, 0, 4, 3);
      ctx.fillStyle = hairLight;
      ctx.fillRect(4, 1, 2, 2);
      ctx.fillRect(12, 1, 2, 2);

      // Steve's Eyes:
      // Left Eye: Outer White, Inner Blue/Purple
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 8, 2, 2);
      ctx.fillStyle = '#2c358f';
      ctx.fillRect(4, 8, 2, 2);
      ctx.fillStyle = '#3c47a8';
      ctx.fillRect(4, 8, 1, 1);

      // Right Eye: Inner Blue/Purple, Outer White
      ctx.fillStyle = '#2c358f';
      ctx.fillRect(10, 8, 2, 2);
      ctx.fillStyle = '#3c47a8';
      ctx.fillRect(10, 8, 1, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(12, 8, 2, 2);

      // Steve's Nose
      ctx.fillStyle = skinNose;
      ctx.fillRect(6, 10, 4, 2);
      ctx.fillStyle = skinShadow;
      ctx.fillRect(6, 9, 4, 1);

      // Steve's Iconic Goatee / Mouth Smile
      ctx.fillStyle = steveBeard;
      ctx.fillRect(4, 12, 8, 2);
      ctx.fillStyle = steveBeardDark;
      ctx.fillRect(6, 12, 4, 1);

      // Chin Beard
      ctx.fillStyle = steveBeard;
      ctx.fillRect(2, 14, 12, 2);
      ctx.fillStyle = steveBeardDark;
      ctx.fillRect(4, 14, 8, 2);
    });

    // Head Top Face (Steve's dark brown hair)
    const steveHeadTop = createSteveTexture((ctx) => {
      ctx.fillStyle = hairDark;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = hairMid;
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = hairLight;
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = hairMid;
      ctx.fillRect(6, 6, 4, 4);
    });

    // Head Sides (Steve's ears and hair)
    const steveHeadSide = createSteveTexture((ctx) => {
      ctx.fillStyle = skinBase;
      ctx.fillRect(0, 0, 16, 16);
      // Top half hair
      ctx.fillStyle = hairDark;
      ctx.fillRect(0, 0, 16, 8);
      ctx.fillStyle = hairMid;
      ctx.fillRect(2, 2, 12, 5);
      // Sideburns
      ctx.fillStyle = hairDark;
      ctx.fillRect(0, 8, 4, 4);
      // Ear
      ctx.fillStyle = skinShadow;
      ctx.fillRect(6, 9, 3, 3);
      ctx.fillStyle = skinNose;
      ctx.fillRect(7, 10, 1, 1);
      // Jawline beard
      ctx.fillStyle = steveBeard;
      ctx.fillRect(0, 14, 10, 2);
    });

    // Head Back Face (Steve's full dark hair)
    const steveHeadBack = createSteveTexture((ctx) => {
      ctx.fillStyle = hairDark;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = hairMid;
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = hairLight;
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = skinShadow;
      ctx.fillRect(4, 14, 8, 2);
    });

    // Head Bottom Face (Steve's neck and chin)
    const steveHeadBottom = createSteveTexture((ctx) => {
      ctx.fillStyle = skinShadow;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = skinBase;
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = steveBeard;
      ctx.fillRect(0, 0, 16, 4);
    });

    // Torso Front Face: Official Steve Cyan Shirt
    const cyanBase = '#00a8a8';
    const cyanLight = '#14baba';
    const cyanDark = '#008b8b';
    const cyanShadow = '#007575';

    const steveBodyFront = createSteveTexture((ctx) => {
      ctx.fillStyle = cyanBase;
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 16; y += 2) {
          const rand = Math.random();
          if (rand > 0.6) {
            ctx.fillStyle = cyanLight;
            ctx.fillRect(x, y, 2, 2);
          } else if (rand < 0.25) {
            ctx.fillStyle = cyanDark;
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
      // Steve's V-Neck / Collar Cutout
      ctx.fillStyle = skinBase;
      ctx.fillRect(6, 0, 4, 4);
      ctx.fillRect(7, 4, 2, 2);
      ctx.fillStyle = skinShadow;
      ctx.fillRect(7, 0, 2, 2);
      // Bottom shirt hem
      ctx.fillStyle = cyanShadow;
      ctx.fillRect(0, 15, 16, 1);
    });

    // Torso Back & Sides
    const steveBodyBack = createSteveTexture((ctx) => {
      ctx.fillStyle = cyanBase;
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 16; y += 2) {
          ctx.fillStyle = Math.random() > 0.5 ? cyanLight : cyanDark;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    });

    // Arm Texture: Cyan short sleeve top, skin tone arms
    const steveArmTex = createSteveTexture((ctx) => {
      ctx.fillStyle = cyanBase;
      ctx.fillRect(0, 0, 16, 7);
      ctx.fillStyle = cyanLight;
      ctx.fillRect(2, 2, 12, 3);
      ctx.fillStyle = cyanShadow;
      ctx.fillRect(0, 6, 16, 1);

      ctx.fillStyle = skinBase;
      ctx.fillRect(0, 7, 16, 9);
      ctx.fillStyle = skinHighlight;
      ctx.fillRect(2, 8, 4, 6);
      ctx.fillStyle = skinShadow;
      ctx.fillRect(0, 15, 16, 1);
    });

    // Leg Texture: Classic Minecraft Blue Jeans & Grey Shoes
    const jeanBase = '#2b347e';
    const jeanDark = '#212863';
    const jeanLight = '#3b47a0';
    const shoeBase = '#505050';
    const shoeDark = '#383838';

    const steveLegTex = createSteveTexture((ctx) => {
      // Blue Jeans (Top 12 pixels)
      ctx.fillStyle = jeanBase;
      ctx.fillRect(0, 0, 16, 12);
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 12; y += 2) {
          const r = Math.random();
          if (r > 0.6) {
            ctx.fillStyle = jeanLight;
            ctx.fillRect(x, y, 2, 2);
          } else if (r < 0.3) {
            ctx.fillStyle = jeanDark;
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // Grey Shoes / Boots (Bottom 4 pixels)
      ctx.fillStyle = shoeBase;
      ctx.fillRect(0, 12, 16, 4);
      ctx.fillStyle = shoeDark;
      ctx.fillRect(0, 14, 16, 2);
      ctx.fillRect(2, 12, 4, 2);
    });

    // Mini Grass Block Pedestal Textures
    const grassTopTex = createSteveTexture((ctx) => {
      ctx.fillStyle = '#4f8924';
      ctx.fillRect(0, 0, 16, 16);
      const greens = ['#5b9b2a', '#45781f', '#3b661a'];
      for (let x = 0; x < 16; x += 2) {
        for (let y = 0; y < 16; y += 2) {
          ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
          ctx.fillRect(x, y, 2, 2);
        }
      }
    });

    const grassSideTex = createSteveTexture((ctx) => {
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#4f8924';
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillStyle = '#5b9b2a';
      ctx.fillRect(2, 4, 3, 2);
      ctx.fillRect(9, 4, 4, 2);
    });

    // 4. Build Full-Body 3D Minecraft Steve Hierarchy
    const steveGroup = new THREE.Group();
    scene.add(steveGroup);

    // --- A. HEAD GROUP (Pivot placed at the base of the neck!) ---
    // Neck base is at y = 0.65.
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.65, 0);

    const headMaterials: THREE.Material[] = [
      new THREE.MeshLambertMaterial({ map: steveHeadSide }),   // +x (right)
      new THREE.MeshLambertMaterial({ map: steveHeadSide }),   // -x (left)
      new THREE.MeshLambertMaterial({ map: steveHeadTop }),    // +y (top)
      new THREE.MeshLambertMaterial({ map: steveHeadBottom }), // -y (bottom)
      new THREE.MeshLambertMaterial({ map: steveHeadFront }),  // +z (front)
      new THREE.MeshLambertMaterial({ map: steveHeadBack }),   // -z (back)
    ];

    // Offset head mesh so its bottom rests on the neck pivot point (y = 0 in headGroup)
    // Head size: 0.8 x 0.8 x 0.8
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), headMaterials);
    headMesh.position.set(0, 0.4, 0); // Center is 0.4 up from neck
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 3D Outer Hair Layer (slightly larger cube)
    const steveHairLayerTex = createSteveTexture((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = hairDark;
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillRect(0, 4, 2, 3);
      ctx.fillRect(14, 4, 2, 3);
      ctx.fillStyle = hairMid;
      ctx.fillRect(2, 1, 4, 2);
      ctx.fillRect(10, 1, 4, 2);
    });
    const hairLayerMat = new THREE.MeshLambertMaterial({
      map: steveHairLayerTex,
      transparent: true,
      alphaTest: 0.1
    });
    const hairLayerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.86), hairLayerMat);
    hairLayerMesh.position.set(0, 0.4, 0);
    headGroup.add(hairLayerMesh);

    steveGroup.add(headGroup);

    // --- B. TORSO / BODY (8x12x4 proportions) ---
    const bodyMaterials: THREE.Material[] = [
      new THREE.MeshLambertMaterial({ color: 0x008b8b }),    // right
      new THREE.MeshLambertMaterial({ color: 0x008b8b }),    // left
      new THREE.MeshLambertMaterial({ color: 0x00a8a8 }),    // top
      new THREE.MeshLambertMaterial({ color: 0x007575 }),    // bottom
      new THREE.MeshLambertMaterial({ map: steveBodyFront }), // front
      new THREE.MeshLambertMaterial({ map: steveBodyBack }),  // back
    ];

    // Torso size: 0.8 x 1.1 x 0.4
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.4), bodyMaterials);
    bodyMesh.position.set(0, 0.1, 0);
    bodyMesh.castShadow = true;
    steveGroup.add(bodyMesh);

    // --- C. ARMS (4x12x4 each, with shoulder pivots) ---
    const armGeo = new THREE.BoxGeometry(0.38, 1.1, 0.38);
    const armMat = new THREE.MeshLambertMaterial({ map: steveArmTex });

    // Left Arm Group (pivot at shoulder y = 0.55)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.6, 0.55, 0);
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(0, -0.45, 0);
    leftArm.castShadow = true;
    leftArmGroup.add(leftArm);
    steveGroup.add(leftArmGroup);

    // Right Arm Group (pivot at shoulder y = 0.55)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.6, 0.55, 0);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0, -0.45, 0);
    rightArm.castShadow = true;
    rightArmGroup.add(rightArm);
    steveGroup.add(rightArmGroup);

    // --- D. LEGS (4x12x4 each, with hip pivots) ---
    const legGeo = new THREE.BoxGeometry(0.38, 1.1, 0.38);
    const legMat = new THREE.MeshLambertMaterial({ map: steveLegTex });

    // Left Leg Group (pivot at hip y = -0.45)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.2, -0.45, 0);
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(0, -0.48, 0);
    leftLeg.castShadow = true;
    leftLegGroup.add(leftLeg);
    steveGroup.add(leftLegGroup);

    // Right Leg Group (pivot at hip y = -0.45)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.2, -0.45, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0, -0.48, 0);
    rightLeg.castShadow = true;
    rightLegGroup.add(rightLeg);
    steveGroup.add(rightLegGroup);

    // --- E. MINI MINECRAFT PEDESTAL (Grass Block Base) ---
    const pedestalMat: THREE.Material[] = [
      new THREE.MeshLambertMaterial({ map: grassSideTex }), // right
      new THREE.MeshLambertMaterial({ map: grassSideTex }), // left
      new THREE.MeshLambertMaterial({ map: grassTopTex }),  // top
      new THREE.MeshLambertMaterial({ color: 0x866043 }),   // bottom
      new THREE.MeshLambertMaterial({ map: grassSideTex }), // front
      new THREE.MeshLambertMaterial({ map: grassSideTex }), // back
    ];
    const pedestalMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 2.2), pedestalMat);
    pedestalMesh.position.set(0, -1.65, 0);
    pedestalMesh.receiveShadow = true;
    steveGroup.add(pedestalMesh);

    // Steve initial stance (natural Minecraft angle)
    steveGroup.position.set(0, 0.1, 0);
    steveGroup.rotation.y = 0.2;

    // 5. Cursor Tracking with Neck Safe Clamping
    let targetHeadYaw = 0.2;
    let targetHeadPitch = 0;
    let targetSteveYaw = 0.08;

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from character to mouse cursor
      const dx = (e.clientX - centerX) / (window.innerWidth * 0.5);
      const dy = (e.clientY - centerY) / (window.innerHeight * 0.5);

      // Horizontal Look (Yaw): natural head turn range [-0.75, 0.75]
      targetHeadYaw = Math.max(-0.75, Math.min(0.75, dx * 1.1));

      // Vertical Look (Pitch):
      // CRITICAL FIX: Downward look is strictly clamped so the chin NEVER collides with the torso!
      // dy > 0 means cursor is down -> head pitches down (positive pitch in this coordinate system)
      // We clamp downward pitch to a max of 0.24 rad (~14 deg), avoiding any body collision!
      // Upward look can safely go up to -0.45 rad (~26 deg).
      if (dy > 0) {
        targetHeadPitch = Math.min(0.24, dy * 0.4);
      } else {
        targetHeadPitch = Math.max(-0.45, dy * 0.75);
      }

      // Torso subtly follows the head
      targetSteveYaw = targetHeadYaw * 0.25;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        onMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });

    // 6. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth interpolation for head and body rotation
      headGroup.rotation.y += (targetHeadYaw - headGroup.rotation.y) * 0.12;
      headGroup.rotation.x += (targetHeadPitch - headGroup.rotation.x) * 0.12;
      steveGroup.rotation.y += (targetSteveYaw - steveGroup.rotation.y) * 0.08;

      // Idle breathing and slight natural sway
      const idle = Math.sin(elapsed * 2.2);
      steveGroup.position.y = 0.1 + idle * 0.015;

      // Subtle arm idle motion
      leftArmGroup.rotation.x = idle * 0.04;
      rightArmGroup.rotation.x = -idle * 0.04;

      // Click Jump Reaction
      if (isClickJumping.current > 0) {
        const jumpFactor = Math.sin(isClickJumping.current * Math.PI);
        steveGroup.position.y = 0.1 + jumpFactor * 0.28;
        leftArmGroup.rotation.x = -jumpFactor * 0.8;
        rightArmGroup.rotation.x = jumpFactor * 0.8;
        headGroup.rotation.x += jumpFactor * -0.15;
        isClickJumping.current = Math.max(0, isClickJumping.current - delta * 3.5);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchMove);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleClick = () => {
    mcAudio.playPop();
    isClickJumping.current = 1.0;
  };

  return (
    <div
      ref={mountRef}
      onClick={handleClick}
      title="Minecraft Steve — Move your mouse to look around! (Click to jump)"
      className={`relative cursor-pointer select-none overflow-hidden ${className}`}
      style={{
        width: '155px',
        height: '225px',
        borderRadius: '6px',
        imageRendering: 'pixelated',
      }}
    />
  );
};

