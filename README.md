# RalphCraft Portfolio

An interactive Minecraft-inspired developer portfolio built with React, TypeScript, Three.js, and Tailwind CSS. The site presents projects, contact details, and a PDF resume through a game-style interface with audio, animated backgrounds, and a playable experience.

## Features

- Minecraft-inspired welcome screen and main menu
- Projects-first navigation with featured case studies for ALERTU, BugReplay, and this portfolio
- About screen, project source links, and live demos where available
- Interactive resume viewer and contact modal
- Three.js-powered visual elements
- Playable Minecraft-style experience with a world-generation screen
- Background music, sound effects, and global mute controls
- Responsive scrolling, readable body text, keyboard focus indicators, and reduced-motion support
- Accessible dialogs with focus containment, Escape dismissal, and focus restoration
- Game and About screens load on demand to keep Three.js out of the initial JavaScript download

## Tech Stack

- [React](https://react.dev/) — user interface
- [TypeScript](https://www.typescriptlang.org/) — static typing
- [Vite](https://vite.dev/) — development server and build tooling
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Three.js](https://threejs.org/) — 3D graphics
- [Lucide React](https://lucide.dev/) — interface icons
- [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) — visual effects

## Getting Started

### Prerequisites

Install the following tools before running the project:

- [Node.js](https://nodejs.org/) 18 or newer
- npm (included with Node.js)
- [Git](https://git-scm.com/)

### Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Ralphyy9yy/minecraft-portfolio-edition.git
cd minecraft-portfolio-edition
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, normally `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot reload. |
| `npm test` | Checks project links, featured project rendering, identity, and local media references without opening a browser. |
| `npm run build` | Type-checks the project and creates an optimized production build in `dist/`. |
| `npm run preview` | Serves the production build locally for verification. |

## Project Structure

```text
minecraft-portfolio/
├── public/                 # Static images, audio, cursors, and favicon
├── src/
│   ├── components/         # Screens and reusable UI components
│   ├── data/               # Portfolio content and profile information
│   ├── utils/              # Audio and shared utilities
│   ├── App.tsx             # Application state and screen routing
│   ├── index.css           # Global styles
│   └── main.tsx            # React entry point
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Customization

Most personal content is stored in `src/data/portfolioData.ts`. Update that file to change:

- Name, title, contact information, and social links
- Projects, technology stacks, source links, and optional live demo links
- Featured case studies (projects with a `caseStudy` entry appear first)
- Resume PDF path and download filename

Replace `public/Ralph_Giann_Suquib_CV.pdf` to update the downloadable resume. No generated employment history or sample certifications are displayed. The contact form opens an email draft in the visitor's email app; it does not submit messages to a backend.

Project images in `public/images/projects/` come from the corresponding public project repositories: ALERTU's Android app icon and BugReplay's terminal preview. Image captions distinguish screenshots from artwork.

Static images and audio are located in `public/`. Keep referenced filenames unchanged, or update their paths in the corresponding components and data entries.

## Creative Sandbox

Open **Play Minecraft** for a small voxel building world. On desktop, click **Enter World** to capture the mouse. Use WASD to move, Ctrl to sprint, Space to jump, left click to mine, and right click to place. Select blocks with the mouse wheel or keys 1–9. Touch controls provide movement, camera look, mining, placement, and jumping; the control mode can be changed in the pause menu.

- **Pause:** Escape, the pause button, changing tabs, or losing window focus freezes the simulation and clears movement input.
- **Local saves:** The complete block layout saves after edits, when pausing, and when leaving the game. Reloading or reopening Play restores it. Saves use `localStorage` under `ralphcraft.sandbox.v1`; they belong to the current browser and site origin, not a cloud account. Browser storage restrictions or quota errors are reported in the HUD. Clearing site data removes the save.
- **Reset World:** Open the pause menu and confirm **Reset World** to replace the saved terrain and challenge progress. An unreadable or unsupported save is preserved until an explicit reset.
- **Shelter challenge:** Follow the glowing outline ahead of spawn. The guide reveals the floor, then the walls, then the roof. Build a 5×5 floor, two-block-high perimeter walls with the front doorway left open, and a roof. Progress checks the actual planned block positions (25 floor, 30 wall, and 25 roof blocks). The guide can be hidden; free building remains available.
- **Build limits:** Blocks can be placed within 32 blocks of spawn on either horizontal axis, from height 0 through 48, up to 40,000 blocks per world.

The sandbox uses a creative HUD with unlimited building blocks rather than decorative health and hunger meters. Run `npm test` to check save validation, save round trips, shelter progress, pause timing, and hotbar wraparound alongside the portfolio checks.

## Production Build

Create and test a production build before deployment:

```bash
npm run build
npm run preview
```

The generated `dist/` directory can be deployed to a static hosting service such as Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

## Contributing

This is a personal portfolio, but constructive suggestions are welcome. To propose a change:

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-change`.
3. Commit your changes: `git commit -m "Add your change"`.
4. Push the branch and open a pull request.

## Asset and Trademark Notice

This is an unofficial fan-made portfolio and is not affiliated with or endorsed by Mojang Studios or Microsoft. Minecraft is a trademark of Microsoft. Before redistributing or publicly deploying this project, ensure you have permission to use every image, font, audio file, and other third-party asset included in `public/`.

## Author

**Ralph Giann Suquib**

- [GitHub](https://github.com/Ralphyy9yy)
- [LinkedIn](https://www.linkedin.com/in/ralph-giann-suquib-887a79382/)
