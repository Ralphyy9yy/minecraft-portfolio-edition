import * as THREE from 'three';
import { BlockType } from './sandbox';
import { highestBlock, PROJECT_CHESTS } from './sandboxExperience';

/** Read-only exhibits: separate from the editable/saved voxel layout. */
export function createProjectChests(getBlock: (x: number, y: number, z: number) => BlockType | undefined) {
  const group = new THREE.Group();
  const wood = new THREE.MeshLambertMaterial({ color: '#9e662a' });
  const trim = new THREE.MeshLambertMaterial({ color: '#402b1b' });
  const latch = new THREE.MeshLambertMaterial({ color: '#ffdc71' });
  const cells = PROJECT_CHESTS.map((chest, index) => {
    const y = Math.max(highestBlock(chest.x, chest.z, getBlock) + 1, 0);
    const addPart = (size: number[], offset: number[], material: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
      mesh.position.set(chest.x + offset[0], y + offset[1], chest.z + offset[2]);
      mesh.userData = { projectIndex: index };
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    };
    addPart([0.9, 0.58, 0.8], [0, -0.16, 0], wood);
    addPart([0.94, 0.25, 0.84], [0, 0.28, 0], wood);
    addPart([0.96, 0.07, 0.86], [0, 0.1, 0], trim);
    for (const side of [-0.34, 0.34]) addPart([0.08, 0.82, 0.87], [side, -0.02, 0], trim);
    addPart([0.14, 0.23, 0.08], [0, 0.04, 0.47], latch);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#101a15e8';
    context.fillRect(0, 0, 512, 128);
    context.strokeStyle = '#a2e9b0';
    context.lineWidth = 6;
    context.strokeRect(3, 3, 506, 122);
    context.textAlign = 'center';
    context.fillStyle = '#ffea8a';
    context.font = 'bold 42px monospace';
    context.fillText(chest.label, 256, 53);
    context.fillStyle = '#ffffff';
    context.font = '26px monospace';
    context.fillText('PROJECT CHEST', 256, 98);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false }));
    label.position.set(chest.x, y + 1.1, chest.z);
    label.scale.set(1.8, 0.45, 1);
    label.raycast = () => {}; // Labels must not intercept aiming at the chest or blocks behind it.
    group.add(label);
    return { x: chest.x, y, z: chest.z };
  });
  return { group, cells };
}
