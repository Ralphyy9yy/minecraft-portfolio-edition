import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
let server;
let data;
let ProjectsScreen;
let MainMenu;
let sandbox;

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
