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

export const WORLD_SAVE_KEY = 'ralphcraft.sandbox.v1';
export const BUILD_RADIUS = 32;
export const BUILD_HEIGHT = 48;
export const MAX_BLOCKS = 40000;
export type SavedBlock = [number, number, number, BlockType];
export interface WorldSnapshot { version: 1; blocks: SavedBlock[] }
export interface WorldStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export type WorldLoad = { status: 'new' | 'unavailable' | 'invalid' } | { status: 'restored'; snapshot: WorldSnapshot };

export function inBuildBounds(x: number, y: number, z: number) {
  return [x, y, z].every(Number.isInteger) && Math.abs(x) <= BUILD_RADIUS && Math.abs(z) <= BUILD_RADIUS && y >= 0 && y <= BUILD_HEIGHT;
}

export function parseWorld(raw: string): WorldSnapshot {
  if (raw.length > 2_500_000) throw new Error('Save is too large');
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('blocks' in value) || !Array.isArray(value.blocks) || value.blocks.length > MAX_BLOCKS) {
    throw new Error('Unsupported world save');
  }
  const seen = new Set<string>();
  for (const block of value.blocks) {
    if (!Array.isArray(block) || block.length !== 4 || !block.every(Number.isInteger)) throw new Error('Invalid block');
    const [x, y, z, type] = block;
    if (!inBuildBounds(x, y, z) || type < BlockType.GRASS || type > BlockType.GLASS) throw new Error('Invalid block position or type');
    const key = `${x},${y},${z}`;
    if (seen.has(key)) throw new Error('Duplicate block');
    seen.add(key);
  }
  return value as WorldSnapshot;
}

export function loadWorld(storage: Pick<WorldStorage, 'getItem'>): WorldLoad {
  let raw: string | null;
  try { raw = storage.getItem(WORLD_SAVE_KEY); } catch { return { status: 'unavailable' }; }
  if (raw === null) return { status: 'new' };
  try { return { status: 'restored', snapshot: parseWorld(raw) }; } catch { return { status: 'invalid' }; }
}

export function saveWorld(storage: Pick<WorldStorage, 'setItem'>, blocks: SavedBlock[]): boolean {
  try {
    const serialized = JSON.stringify({ version: 1, blocks });
    parseWorld(serialized);
    storage.setItem(WORLD_SAVE_KEY, serialized);
    return true;
  } catch { return false; }
}

export function cycleSlot(current: number, direction: number, length: number) {
  return (current + Math.sign(direction) + length) % length;
}

export function simulationStep(previousTime: number, now: number, active: boolean, paused: boolean) {
  return { time: now, delta: active && !paused ? Math.max(0, Math.min((now - previousTime) / 1000, 0.08)) : 0 };
}

export interface ShelterCell { x: number; y: number; z: number; part: 'floor' | 'walls' | 'roof' }

/** Five-by-five starter shelter north of spawn, with a two-block doorway. */
export const SHELTER_PLAN: ShelterCell[] = [];
for (let x = -2; x <= 2; x++) {
  for (let z = -8; z <= -4; z++) {
    SHELTER_PLAN.push({ x, y: 7, z, part: 'floor' }, { x, y: 10, z, part: 'roof' });
    if (Math.abs(x) === 2 || z === -8 || z === -4) {
      if (x === 0 && z === -4) continue;
      SHELTER_PLAN.push({ x, y: 8, z, part: 'walls' }, { x, y: 9, z, part: 'walls' });
    }
  }
}

export function shelterProgress(getBlock: (x: number, y: number, z: number) => BlockType | undefined) {
  const progress = { floor: 0, walls: 0, roof: 0, total: 0, complete: false };
  for (const cell of SHELTER_PLAN) {
    const block = getBlock(cell.x, cell.y, cell.z);
    if (block !== undefined && block !== BlockType.AIR) {
      progress[cell.part]++;
      progress.total++;
    }
  }
  progress.complete = progress.total === SHELTER_PLAN.length;
  return progress;
}
