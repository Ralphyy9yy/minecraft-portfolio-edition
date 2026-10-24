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
