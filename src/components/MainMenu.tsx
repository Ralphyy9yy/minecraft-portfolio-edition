import React, { useState } from 'react';
import { MCButton } from './MCButton';
import { mcAudio } from '../utils/audio';

interface MainMenuProps {
  onNavigate: (screen: 'play' | 'about' | 'projects' | 'certifications') => void;
  onOpenResume: () => void;
  onOpenContact: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNavigate,
  onOpenResume,
  onOpenContact
}) => {
  const splashes = [
    "Ralph Craft Edition!",
    "Made with React & WebGL!",
    "Now with 100% more clean code!",
    "Don't dig straight down!",
    "Zero console errors found!",
    "Explore projects in Multiplayer!",
    "Check out my certifications!",
    "Coffee -> Code converter!",
    "TypeScript powered!",
    "Press F3 for debug info!"
  ];

  const [splashIndex, setSplashIndex] = useState(0);

  const cycleSplash = () => {
    mcAudio.playPop();
    setSplashIndex((prev) => (prev + 1) % splashes.length);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-screen p-4 select-none">
      {/* Top Header */}
      <div className="w-full flex justify-end items-center max-w-5xl pr-14">
        <div className="text-xs text-gray-300 opacity-80 font-mono hidden sm:block">
          Welcome to Ralph's Portfolio
        </div>
      </div>

      {/* Main Title Logo & Splash Area */}
      <div className="flex flex-col items-center my-auto -mt-2">
        <div className="relative flex flex-col items-center mb-8">
          <img
            src="/images/title/minecraft_title.png"
            alt="Minecraft Title"
            className="minecraft-title-image max-h-[140px] sm:max-h-[175px] pointer-events-none"
          />

          {/* Splash Text - placed on the right of the Minecraft logo, safely above the buttons */}
          <div
            onClick={cycleSplash}
            className="absolute top-8 sm:top-12 right-0 sm:right-4 transform cursor-pointer select-none z-20 group"
            title="Click for next quote!"
          >
            <span className="minecraft-splash whitespace-nowrap block drop-shadow-[2px_2px_0px_#3f3f00] text-sm sm:text-base">
              {splashes[splashIndex]}
            </span>
          </div>
        </div>

        {/* Buttons List Container */}
        <div className="menu-buttons-container">
          {/* Play Minecraft (Singleplayer demo) */}
          <MCButton
            size="main"
            onClick={() => onNavigate('play')}
          >
            Play Minecraft
          </MCButton>

          <MCButton
            size="main"
            onClick={() => onNavigate('about')}
          >
            About Me
          </MCButton>

          <MCButton
            size="main"
            onClick={() => onNavigate('projects')}
          >
            My Projects
          </MCButton>

          <MCButton
            size="main"
            onClick={() => onNavigate('certifications')}
          >
            Certifications
          </MCButton>

          {/* Bottom Dual Row */}
          <div className="flex items-center gap-2 mt-2 max-w-[400px] w-full justify-center">
            <MCButton
              size="small"
              onClick={onOpenResume}
            >
              Resume...
            </MCButton>

            <MCButton
              size="small"
              onClick={onOpenContact}
            >
              Contact Me
            </MCButton>

            <button
              onClick={() => {
                mcAudio.playClick();
                cycleSplash();
              }}
              title="Change Splash / Language"
              className="minecraft-button language-button flex-shrink-0"
            >
              <img src="/images/lang.png" alt="Language" className="w-6 h-6 object-contain" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info matching johncraft.dev */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs text-gray-300 font-mono mc-text-shadow px-2">
        <div className="pl-2">Portfolio 1.20.4</div>
        <div className="text-right text-gray-400 pr-14">Copyright Mojang Studios. Do not distribute!</div>
      </div>
    </div>
  );
};

