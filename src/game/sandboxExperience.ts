import { PORTFOLIO_DATA } from '../data/portfolioData';
import { BlockType, BUILD_HEIGHT, MAX_BLOCKS, inBuildBounds } from './sandbox';

export const INTERACTION_REACH = 6;
export const PROJECT_CHESTS = [
  { id: 'alertu', label: 'ALERTU', x: -2, z: -2 },
  { id: 'bugreplay', label: 'BugReplay', x: 0, z: -2 },
  { id: 'minecraft-portfolio', label: 'RalphCraft', x: 2, z: -2 },
].map((chest) => {
  const project = PORTFOLIO_DATA.projects.find((item) => item.id === chest.id);
  if (!project) throw new Error(`Missing chest project: ${chest.id}`);
  return { ...chest, project };
});

export interface Cell { x: number; y: number; z: number }

export function projectWithinReach(index: unknown, distance: number) {
  if (typeof index !== 'number' || !Number.isInteger(index) || !Number.isFinite(distance) || distance < 0 || distance > INTERACTION_REACH) return null;
  return PROJECT_CHESTS[index]?.project ?? null;
}

export function highestBlock(x: number, z: number, getBlock: (x: number, y: number, z: number) => BlockType | undefined) {
  for (let y = BUILD_HEIGHT; y >= 0; y--) {
    const block = getBlock(x, y, z);
    if (block !== undefined && block !== BlockType.AIR) return y;
  }
  return -1;
}

export function spawnHeight(getBlock: (x: number, y: number, z: number) => BlockType | undefined) {
  return Math.max(highestBlock(0, 0, getBlock) + 0.5 + 1.62 + 0.01, 5);
}

/** The preview and placement action must agree on every reason a block is rejected. */
export function placementFeedback(cell: Cell, player: Cell, distance: number, occupied: boolean, count: number) {
  if (distance > INTERACTION_REACH) return 'Out of reach — move closer';
  if (!inBuildBounds(cell.x, cell.y, cell.z)) return 'Outside the building area';
  if (count >= MAX_BLOCKS) return 'World block limit reached';
  if (occupied) return 'This space is occupied';
  if (player.x - 0.35 < cell.x + 0.5 && player.x + 0.35 > cell.x - 0.5 &&
      player.y - 1.62 < cell.y + 0.5 && player.y + 0.18 > cell.y - 0.5 &&
      player.z - 0.35 < cell.z + 0.5 && player.z + 0.35 > cell.z - 0.5) {
    return 'Too close — this block would trap you';
  }
  return '';
}

/** Celebrate once per visit, and never replay a celebration for an already-built saved shelter. */
export function createShelterReward() {
  let initialized = false;
  let earned = false;
  return (complete: boolean) => {
    const celebrate = initialized && complete && !earned;
    initialized = true;
    earned ||= complete;
    return celebrate;
  };
}
