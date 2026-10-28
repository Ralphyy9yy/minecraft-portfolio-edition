import { Project } from '../data/portfolioData';

export function ProjectChestPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="sandbox-project reading-text">
      <p className="sandbox-eyebrow">PROJECT CHEST · GAME PAUSED</p>
      {project.caseStudy && <figure>
        <img src={project.caseStudy.image} alt={project.caseStudy.imageAlt} decoding="async" />
        <figcaption>{project.caseStudy.imageCaption}</figcaption>
      </figure>}
      <p>{project.description}</p>
      <p className="text-green-200">{project.tech}</p>
      {project.caseStudy && <dl>
        <dt>Problem</dt><dd>{project.caseStudy.problem}</dd>
        <dt>Implementation</dt><dd>{project.caseStudy.implementation}</dd>
        <dt>Engineering challenge</dt><dd>{project.caseStudy.challenge}</dd>
      </dl>}
      <div className="sandbox-project-links">
        <a href={project.github} target="_blank" rel="noopener noreferrer">Source Code ↗</a>
        {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer">Live Demo ↗</a>}
      </div>
      <button onClick={onClose} className="minecraft-button w-full h-12 text-xs font-minecraft">Back to Game</button>
    </div>
  );
}

export function SandboxControls({ touch, onClose }: { touch: boolean; onClose: () => void }) {
  return (
    <div className="sandbox-controls reading-text">
      <p className="sandbox-eyebrow">{touch ? 'TOUCH CONTROLS' : 'KEYBOARD + MOUSE / TOUCHPAD'}</p>
      <dl>
        {touch ? <>
          <dt>Move & look</dt><dd>Hold a D-pad arrow with one thumb. Swipe the world with another finger to look around. Slide between arrows to turn your movement.</dd>
          <dt>Build & jump</dt><dd>Use MINE, PLACE, and ▲. Tap a hotbar block to select it. The center D-pad button toggles sprint.</dd>
          <dt>Open a chest</dt><dd>Aim at a labeled chest, move within six blocks, then tap Open Chest.</dd>
        </> : <>
          <dt>Move & look</dt><dd>WASD moves, Ctrl sprints, and Space jumps. Click Enter World to capture the pointer, then move your mouse or slide one finger on your touchpad.</dd>
          <dt>Build</dt><dd>Left click mines; right click places. Use 1–9 or the mouse wheel to choose a block. Green previews can be placed; red previews show blocked spots.</dd>
          <dt>Open a chest</dt><dd>Aim at a labeled chest within six blocks and press E or left click. The game pauses while you read.</dd>
          <dt>Laptop touchpad stops while walking?</dt><dd>Windows can suppress touchpad input while keys are held. On Windows 11, try Settings → Bluetooth &amp; devices → Touchpad → Taps → Touchpad sensitivity → Most sensitive. Driver options may vary; this may increase accidental touches while typing.</dd>
        </>}
        <dt>Get unstuck</dt><dd>Pause and choose Return to Spawn. Your builds stay intact.</dd>
        <dt>Pause & help</dt><dd>{touch ? 'Tap PAUSE or ? HELP.' : 'Escape pauses. H or ? HELP opens this guide.'} You can also change control modes from the pause menu.</dd>
      </dl>
      <button onClick={onClose} className="minecraft-button w-full h-12 text-xs font-minecraft">Back to Pause Menu</button>
    </div>
  );
}
