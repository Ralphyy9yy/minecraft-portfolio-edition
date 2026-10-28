import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import React from 'react';
import * as THREE from 'three';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
let server;
let data;
let ProjectsScreen;
let MainMenu;
let sandbox;
let TouchInput;
let experience;
let ProjectChestPanel;
let SandboxControls;
let createProjectChests;

before(async () => {
  server = await createServer({
    root,
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true },
  });
  data = (await server.ssrLoadModule('/src/data/portfolioData.ts')).PORTFOLIO_DATA;
  ({ ProjectsScreen } = await server.ssrLoadModule('/src/components/ProjectsScreen.tsx'));
  ({ MainMenu } = await server.ssrLoadModule('/src/components/MainMenu.tsx'));
  sandbox = await server.ssrLoadModule('/src/game/sandbox.ts');
  ({ TouchInput } = await server.ssrLoadModule('/src/game/touchInput.ts'));
  experience = await server.ssrLoadModule('/src/game/sandboxExperience.ts');
  ({ ProjectChestPanel, SandboxControls } = await server.ssrLoadModule('/src/components/SandboxPanels.tsx'));
  ({ createProjectChests } = await server.ssrLoadModule('/src/game/projectChests.ts'));
});

test('project chests reference the three featured projects without changing world block types', () => {
  assert.deepEqual(experience.PROJECT_CHESTS.map((chest) => chest.id), ['alertu', 'bugreplay', 'minecraft-portfolio']);
  const positions = new Set();
  for (const chest of experience.PROJECT_CHESTS) {
    assert.equal(chest.project.id, chest.id);
    assert.ok(chest.project.caseStudy.image);
    assert.ok(chest.project.github.startsWith('https://github.com/'));
    assert.ok(chest.x !== 0 || chest.z !== 0, 'chests must not occupy spawn');
    positions.add(`${chest.x},${chest.z}`);
  }
  assert.equal(positions.size, 3);
  assert.equal(sandbox.BlockType.GLASS, 9, 'existing save format stays unchanged');
});

test('placement preview rejects exactly the invalid destinations used by placement', () => {
  const cell = { x: 0, y: 8, z: -4 };
  const player = { x: 0, y: 9.13, z: 0 };
  const check = (overrides = {}) => {
    const args = { cell, player, distance: 6, occupied: false, count: 1, ...overrides };
    return experience.placementFeedback(args.cell, args.player, args.distance, args.occupied, args.count);
  };
  assert.equal(check(), '');
  assert.match(check({ distance: 6.01 }), /Out of reach/);
  assert.match(check({ cell: { ...cell, x: 33 } }), /Outside/);
  assert.match(check({ cell: { ...cell, y: -1 } }), /Outside/);
  assert.match(check({ occupied: true }), /occupied/);
  assert.match(check({ count: sandbox.MAX_BLOCKS }), /limit/);
  assert.match(check({ cell: { x: 0, y: 8, z: 0 } }), /trap/);
  assert.equal(check({ cell: { x: 0, y: 7, z: 0 } }), '', 'block below feet remains placeable');
});

test('chests have solid targetable bodies, non-blocking labels, and respect nearer voxel occlusion', () => {
  const originalDocument = globalThis.document;
  let chests;
  const context = { fillRect() {}, strokeRect() {}, fillText() {} };
  try {
    // Canvas label drawing is stubbed; real Three.js geometry and raycasting are exercised below.
    globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => context }) };
    chests = createProjectChests((_x, y) => y === 5 ? sandbox.BlockType.GRASS : undefined);
    assert.deepEqual(chests.cells.map((cell) => cell.y), [6, 6, 6]);
    assert.equal(chests.group.children.filter((object) => object instanceof THREE.Sprite).length, 3);
    chests.group.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 6, 0), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(chests.group, true)[0];
    assert.equal(hit.object.userData.projectIndex, 1);
    assert.equal(experience.projectWithinReach(hit.object.userData.projectIndex, hit.distance).id, 'bugreplay');
    const wall = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    wall.position.set(0, 6, -0.8);
    wall.updateMatrixWorld(true);
    const nearest = ray.intersectObjects([wall, chests.group], true)[0];
    assert.equal(nearest.object, wall);
    assert.equal(experience.projectWithinReach(nearest.object.userData.projectIndex, nearest.distance), null);
    wall.geometry.dispose();
    wall.material.dispose();
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    chests?.group.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
      if (object.material) { object.material.map?.dispose(); object.material.dispose(); }
    });
  }
});

test('only valid project targets within six blocks can open a chest', () => {
  assert.equal(experience.projectWithinReach(0, 6).id, 'alertu');
  for (const [index, distance] of [[0, 6.01], [0, -1], [0, NaN], [-1, 1], [3, 1], [0.5, 1], ['0', 1], [undefined, 1]]) {
    assert.equal(experience.projectWithinReach(index, distance), null);
  }
});

test('return-to-spawn height clears the highest center block without editing the world', () => {
  const blocks = new Map([['0,7,0', sandbox.BlockType.GRASS], ['0,14,0', sandbox.BlockType.GLASS]]);
  const getBlock = (x, y, z) => blocks.get(`${x},${y},${z}`);
  const original = [...blocks];
  assert.equal(experience.highestBlock(0, 0, getBlock), 14);
  assert.ok(experience.spawnHeight(getBlock) - 1.62 > 14.5);
  assert.deepEqual([...blocks], original);
  assert.equal(experience.spawnHeight(() => undefined), 5);
  assert.equal(experience.spawnHeight(() => sandbox.BlockType.AIR), 5);
});

test('shelter celebration fires once for new completion, not for restored completed shelters', () => {
  const fresh = experience.createShelterReward();
  assert.equal(fresh(false), false);
  assert.equal(fresh(false), false);
  assert.equal(fresh(true), true);
  assert.equal(fresh(true), false);
  assert.equal(fresh(false), false);
  assert.equal(fresh(true), false);
  const restored = experience.createShelterReward();
  assert.equal(restored(true), false);
  assert.equal(restored(false), false);
  assert.equal(restored(true), false);
});

test('project chest viewers use real images, case studies and only existing demo links', () => {
  for (const { project } of experience.PROJECT_CHESTS) {
    const html = renderToStaticMarkup(React.createElement(ProjectChestPanel, { project, onClose() {} }));
    assert.ok(html.includes(project.caseStudy.image));
    assert.ok(html.includes(project.github));
    assert.ok(html.includes('Engineering challenge'));
    assert.ok(html.includes('Back to Game'));
    assert.equal(html.includes('Live Demo'), Boolean(project.demo));
    assert.equal((html.match(/target="_blank"/g) ?? []).length, project.demo ? 2 : 1);
    assert.equal((html.match(/rel="noopener noreferrer"/g) ?? []).length, project.demo ? 2 : 1);
  }
});

test('controls guide covers laptop input, touch interaction, recovery and help', () => {
  const desktop = renderToStaticMarkup(React.createElement(SandboxControls, { touch: false, onClose() {} }));
  assert.ok(desktop.includes('Most sensitive'));
  assert.ok(desktop.includes('WASD'));
  assert.ok(desktop.includes('press E'));
  assert.ok(desktop.includes('Return to Spawn'));
  const touch = renderToStaticMarkup(React.createElement(SandboxControls, { touch: true, onClose() {} }));
  assert.ok(touch.includes('another finger'));
  assert.ok(touch.includes('Open Chest'));
  assert.ok(touch.includes('Return to Spawn'));
});

test('touch movement, camera look, and jump track independent fingers in either order', () => {
  for (const lookFirst of [false, true]) {
    const input = new TouchInput();
    if (lookFirst) assert.equal(input.startLook(20, 100, 200), true);
    assert.equal(input.hold(10, 'forward'), true);
    if (!lookFirst) assert.equal(input.startLook(20, 100, 200), true);
    input.hold(30, 'jump');
    assert.equal(input.movement().forward, true);
    assert.equal(input.movement().jump, true);
    assert.deepEqual(input.moveLook(20, 130, 180), { x: 30, y: -20 });
    assert.equal(input.moveLook(10, 10, 10), null);
    input.endLook(30);
    input.release(30);
    assert.equal(input.movement().forward, true);
    assert.equal(input.movement().jump, false);
    assert.deepEqual(input.moveLook(20, 135, 190), { x: 5, y: 10 });
    input.release(10);
    assert.equal(input.movement().forward, false);
    assert.deepEqual(input.moveLook(20, 140, 190), { x: 5, y: 0 });
    input.endLook(20);
    assert.equal(input.moveLook(20, 150, 190), null);
  }
});

test('D-pad swipes change direction without releasing or stealing another finger', () => {
  const input = new TouchInput();
  input.hold(1, 'forward');
  input.hold(2, 'forward');
  assert.equal(input.slide(1, 'right'), true);
  assert.equal(input.movement().forward, true);
  assert.equal(input.movement().right, true);
  assert.equal(input.release(2), true);
  assert.equal(input.movement().forward, false);
  assert.equal(input.movement().right, true);
  assert.equal(input.startLook(1, 0, 0), false);
  assert.equal(input.startLook(3, 0, 0), true);
  assert.equal(input.hold(3, 'left'), false);
  assert.equal(input.startLook(4, 0, 0), false);
  assert.equal(input.slide(4, 'left'), false);
  input.hold(5, 'jump');
  assert.equal(input.slide(5, 'left'), false);
  assert.equal(input.slide(1, 'jump'), false);
});

test('cancellation and pause reset cannot leave movement or look stuck', () => {
  const input = new TouchInput();
  input.hold(1, 'forward');
  input.hold(2, 'jump');
  input.startLook(3, 40, 50);
  input.release(1); // pointercancel / lostpointercapture uses the same release path.
  input.endLook(3);
  assert.equal(input.movement().forward, false);
  assert.equal(input.movement().jump, true);
  assert.equal(input.startLook(4, 50, 60), true);
  input.reset();
  assert.deepEqual(input.movement(), { forward: false, backward: false, left: false, right: false, jump: false });
  assert.equal(input.slide(2, 'forward'), false);
  assert.equal(input.moveLook(4, 70, 80), null);
  assert.equal(input.release(2), false);
  assert.equal(input.startLook(5, 100, 100), true);
  assert.deepEqual(input.moveLook(5, 101, 102), { x: 1, y: 2 });
});

test('saved worlds round-trip additions and removals without regenerating mined blocks', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(sandbox.loadWorld(storage).status, 'new');
  const blocks = [[0, 4, 0, sandbox.BlockType.STONE], [1, 5, 0, sandbox.BlockType.GLASS]];
  assert.equal(sandbox.saveWorld(storage, blocks), true);
  assert.deepEqual(sandbox.loadWorld(storage).snapshot.blocks, blocks);
  assert.equal(sandbox.saveWorld(storage, [blocks[1]]), true);
  assert.deepEqual(sandbox.loadWorld(storage).snapshot.blocks, [blocks[1]]);
  assert.equal(sandbox.saveWorld(storage, []), true);
  assert.deepEqual(sandbox.loadWorld(storage).snapshot.blocks, []);
});

test('invalid saves and storage failures do not silently replace an existing world', () => {
  const original = '{broken';
  let writes = 0;
  const storage = { getItem: () => original, setItem() { writes++; } };
  assert.equal(sandbox.loadWorld(storage).status, 'invalid');
  assert.equal(writes, 0);
  assert.equal(sandbox.loadWorld({ getItem() { throw new Error('Storage blocked'); } }).status, 'unavailable');
  assert.equal(sandbox.saveWorld({ setItem() { throw new Error('Quota exceeded'); } }, []), false);
  for (const value of [
    { version: 2, blocks: [] },
    { version: 1, blocks: [[0, 0, 0, 99]] },
    { version: 1, blocks: [[100000, 0, 0, 1]] },
    { version: 1, blocks: [[0, -1, 0, 1]] },
    { version: 1, blocks: [[0.5, 0, 0, 1]] },
    { version: 1, blocks: [[0, 0, 0, 1], [0, 0, 0, 2]] },
  ]) assert.throws(() => sandbox.parseWorld(JSON.stringify(value)));
});

test('shelter progress requires the planned structure and responds to removed roof blocks', () => {
  assert.equal(sandbox.shelterProgress(() => undefined).total, 0);
  const blocks = new Map(sandbox.SHELTER_PLAN.map(({ x, y, z }) => [`${x},${y},${z}`, sandbox.BlockType.WOOD]));
  const getBlock = (x, y, z) => blocks.get(`${x},${y},${z}`);
  const complete = sandbox.shelterProgress(getBlock);
  assert.deepEqual(complete, { floor: 25, walls: 30, roof: 25, total: 80, complete: true });
  assert.equal(blocks.has('0,8,-4'), false);
  assert.equal(blocks.has('0,9,-4'), false);
  blocks.delete('0,10,-6');
  assert.equal(sandbox.shelterProgress(getBlock).complete, false);
  assert.equal(sandbox.shelterProgress(getBlock).roof, 24);
});

test('pause freezes time without a catch-up jump, and hotbar selection wraps', () => {
  const paused = sandbox.simulationStep(1000, 21000, true, true);
  assert.equal(paused.delta, 0);
  const resumed = sandbox.simulationStep(paused.time, 21016, true, false);
  assert.equal(resumed.delta, 0.016);
  assert.equal(sandbox.simulationStep(0, 1000, false, false).delta, 0);
  assert.equal(sandbox.cycleSlot(8, 1, 9), 0);
  assert.equal(sandbox.cycleSlot(0, -1, 9), 8);
});

after(async () => { await server?.close(); });

test('portfolio media references resolve to real local files', async () => {
  const images = data.projects.flatMap((project) => project.caseStudy ? [project.caseStudy.image] : []);
  await Promise.all([...images, data.developer.avatar, data.resume.url].map((path) => access(`${root}public${path}`)));
  const pdf = await readFile(`${root}public${data.resume.url}`);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
});

test('project navigation leads with work and includes the developer identity', () => {
  const html = renderToStaticMarkup(React.createElement(MainMenu, {
    onNavigate() {}, onOpenResume() {}, onOpenContact() {},
  }));
  const labels = Array.from(html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g), (match) => match[1]);
  assert.ok(labels.findIndex((label) => label.includes('My Projects')) < labels.findIndex((label) => label.includes('Play Minecraft')));
  assert.ok(html.includes(data.developer.name));
  assert.ok(html.includes(data.developer.title));
});

test('every project has a unique identity and a secure source URL', () => {
  assert.equal(new Set(data.projects.map((project) => project.id)).size, data.projects.length);
  for (const project of data.projects) {
    assert.equal(new URL(project.github).protocol, 'https:');
    if (project.demo) assert.equal(new URL(project.demo).protocol, 'https:');
  }
});

test('rendered demo links exist only for projects with demos', () => {
  const html = renderToStaticMarkup(React.createElement(ProjectsScreen, { onBack() {} }));
  const sourceLinks = Array.from(html.matchAll(/aria-label="Source code for /g));
  const demoLinks = Array.from(html.matchAll(/aria-label="Live demo of /g));
  assert.equal(sourceLinks.length, data.projects.length);
  assert.equal(demoLinks.length, data.projects.filter((project) => project.demo).length);
  assert.equal(Array.from(html.matchAll(/<details\b/g)).length, data.projects.filter((project) => project.caseStudy).length);
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.ok(match[0].includes('rel="noopener noreferrer"'));
  }
});
