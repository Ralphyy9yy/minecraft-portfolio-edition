import React, { useEffect, useRef } from 'react';
import { PORTFOLIO_DATA, Project } from '../data/portfolioData';
import { mcAudio } from '../utils/audio';

interface ProjectsScreenProps {
  onBack: () => void;
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="project-links">
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noopener noreferrer" onClick={() => mcAudio.playClick()} aria-label={`Live demo of ${project.name} (opens in a new tab)`}>
          Live Demo ↗
        </a>
      )}
      <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => mcAudio.playClick()} aria-label={`Source code for ${project.name} (opens in a new tab)`}>
        Source Code ↗
      </a>
    </div>
  );
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({ onBack }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const featured = PORTFOLIO_DATA.projects.filter((project) => project.caseStudy);
  const otherProjects = PORTFOLIO_DATA.projects.filter((project) => !project.caseStudy);

  return (
    <div className="portfolio-screen">
      <div className="projects-scroll-area">
      <header className="screen-header text-center text-white mc-text-shadow">
        <p className="reading-text text-xs uppercase tracking-widest text-green-300 mb-3">Selected builds</p>
        <h1 ref={headingRef} tabIndex={-1} className="text-xl sm:text-3xl">My Projects</h1>
        <p className="reading-text text-sm text-gray-200 mt-4">Software, experiments, and the engineering behind them.</p>
      </header>

      <div className="project-content">
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="section-heading">Featured Projects</h2>
          <div className="featured-projects">
            {featured.map((project) => {
              const study = project.caseStudy!;
              return (
                <article key={project.id} className="project-card">
                  <figure>
                    <div className={`project-preview ${project.id === 'alertu' ? 'project-preview-icon' : ''}`}>
                      <img src={study.image} alt={study.imageAlt} loading="lazy" decoding="async" width={800} height={450} />
                      {project.id === 'minecraft-portfolio' && <img className="project-preview-logo" src="/images/title/minecraft_title.png" alt="" />}
                    </div>
                    <figcaption className="reading-text">{study.imageCaption}</figcaption>
                  </figure>
                  <div className="project-card-body">
                    <h3>{project.name}</h3>
                    <p className="reading-text project-description">{project.description}</p>
                    <p className="reading-text project-tech">{project.tech}</p>
                    <details className="case-study">
                      <summary>View case study</summary>
                      <dl className="reading-text">
                        <dt>Problem</dt><dd>{study.problem}</dd>
                        <dt>Implementation</dt><dd>{study.implementation}</dd>
                        <dt>Engineering challenge</dt><dd>{study.challenge}</dd>
                      </dl>
                    </details>
                    <ProjectLinks project={project} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="other-heading" className="mt-10">
          <h2 id="other-heading" className="section-heading">More Projects</h2>
          <div className="other-projects">
            {otherProjects.map((project) => (
              <article key={project.id} className="project-card project-card-body">
                <h3><span aria-hidden="true">{project.icon} </span>{project.name}</h3>
                <p className="reading-text project-description">{project.description}</p>
                <p className="reading-text project-tech">{project.tech}</p>
                <ProjectLinks project={project} />
              </article>
            ))}
          </div>
        </section>
      </div>
      </div>

      <footer className="screen-footer">
        <button onClick={() => { mcAudio.playClick(); onBack(); }} className="minecraft-button h-12 px-5 text-xs">Back to Main Menu</button>
        <p className="reading-text hidden sm:block text-xs text-gray-300">Esc returns to the menu</p>
      </footer>
    </div>
  );
};
