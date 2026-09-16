# RalphCraft Portfolio

An interactive Minecraft-inspired developer portfolio built with React, TypeScript, Three.js, and Tailwind CSS. The site presents projects, certifications, contact details, and a resume through a game-style interface with audio, animated backgrounds, and a playable experience.

## Features

- Minecraft-inspired welcome screen and main menu
- About, projects, and certifications sections
- Interactive resume viewer and contact modal
- Three.js-powered visual elements
- Playable Minecraft-style experience with a world-generation screen
- Background music, sound effects, and global mute controls
- Responsive, component-based interface

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
git clone https://github.com/Ralphyy9yy/minecraft-portfolio.git
cd minecraft-portfolio
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
- Projects and their technology stacks
- Certifications
- Resume summary, skills, experience, and education

Static images and audio are located in `public/`. Keep referenced filenames unchanged, or update their paths in the corresponding components and data entries.

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
