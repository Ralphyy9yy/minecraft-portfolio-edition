import React, { useEffect, useRef } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { mcAudio } from '../utils/audio';
import { InteractiveMinecraftCharacter } from './InteractiveMinecraftCharacter';

interface AboutScreenProps {
  onBack: () => void;
  onOpenResume: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack, onOpenResume }) => {
  const dev = PORTFOLIO_DATA.developer;
  const links = PORTFOLIO_DATA.socialLinks;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);

  const handleLinkClick = (url: string) => {
    mcAudio.playClick();
    if (url === '#resume') {
      onOpenResume();
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative z-10 flex flex-col h-full min-h-0 select-none overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-20 pb-10">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-white mc-text-shadow tracking-wide mb-1">
            About Me
          </h1>
          <p className="reading-text text-sm text-gray-300 mc-text-shadow">
            Explore my profile &amp; journey
          </p>
        </div>

        {/* About Description with Profile Picture */}
        <div className="about-description reading-text text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl w-full mx-auto">
          <div className="profile-picture-inline">
            <div className="profile-picture-small flex items-center justify-center bg-black/60 overflow-hidden relative">
              <InteractiveMinecraftCharacter />
            </div>
          </div>

          <p className="mb-3">
            I'm <span className="highlight">{dev.name}</span>, a {dev.title}.
            I thrive at the intersection of creative user experiences and robust software architecture. Building responsive, game-like web applications and intelligent systems.
          </p>

          <p>
            I'm always excited to collaborate, grow, and take on opportunities that expand my skills in full-stack development, 3D WebGL graphics, and cloud systems. I believe in learning by doing!
          </p>
        </div>

        {/* Linktree Container */}
        <div className="linktree-container">
          {links.map((link) => (
            <button
              type="button"
              key={link.id}
              onClick={() => handleLinkClick(link.url)}
              className="linktree-item group"
            >
              <span className="linktree-icon text-xl sm:text-2xl" aria-hidden="true">
                {link.icon}
              </span>

              <span className="linktree-info">
                <span className="linktree-name block">
                  {link.name}
                </span>
                <span className="linktree-description reading-text block">
                  {link.description}
                </span>
              </span>

              <span className="linktree-arrow group-hover:translate-x-1 transition-transform" aria-hidden="true">
                ➔
              </span>
            </button>
          ))}
        </div>

        {/* Back to Main Menu Button */}
        <div className="flex justify-center mt-4 mb-4">
          <button
            onClick={() => {
              mcAudio.playClick();
              onBack();
            }}
            className="minecraft-button w-full max-w-[320px] h-11 text-xs sm:text-sm"
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

