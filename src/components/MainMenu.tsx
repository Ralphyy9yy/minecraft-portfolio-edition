import React, { lazy, Suspense, useState } from 'react';
import { MCButton } from './MCButton';
import { mcAudio } from '../utils/audio';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { ScreenErrorBoundary } from './ScreenErrorBoundary';

const InteractiveMinecraftCharacter = lazy(() => import('./InteractiveMinecraftCharacter').then((module) => ({ default: module.InteractiveMinecraftCharacter })));

interface MainMenuProps {
  onNavigate: (screen: 'play' | 'about' | 'projects') => void;
  onOpenResume: () => void;
  onOpenContact: () => void;
  showCharacter?: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNavigate,
  onOpenResume,
  onOpenContact,
  showCharacter = false,
}) => {
  const splashes = [
    "Ralph Craft Edition!",
    "Made with React & WebGL!",
    "Now with 100% more clean code!",
    "Don't dig straight down!",
    "Zero console errors found!",
    "Explore my latest projects!",
    "Built one block at a time!",
    "Coffee -> Code converter!",
    "TypeScript powered!",
    "Find the code on GitHub!"
  ];

  const [splashIndex, setSplashIndex] = useState(0);

  const cycleSplash = () => {
    mcAudio.playPop();
    setSplashIndex((prev) => (prev + 1) % splashes.length);
  };

  return (
    <div className="main-menu-screen relative z-10 flex flex-col items-center justify-between p-4 select-none">
      {/* Top Header */}
      <div className="w-full flex justify-end items-center max-w-5xl pr-14">
        <div className="text-xs text-gray-300 opacity-80 font-mono hidden sm:block">
          Welcome to Ralph's Portfolio
        </div>
      </div>

      {/* Main Title Logo & Splash Area */}
      <div className="main-menu-content flex flex-col items-center my-auto w-full">
        <div className="relative flex flex-col items-center mb-5 sm:mb-6">
          <img
            src="/images/title/minecraft_title.png"
            alt="Minecraft Portfolio Edition"
            className="minecraft-title-image max-h-[110px] sm:max-h-[160px] pointer-events-none"
          />

          {/* Keep the original angled splash slightly higher beside the logo. */}
          <button
            type="button"
            onClick={cycleSplash}
            className="absolute bottom-[calc(25%+32px)] right-0 sm:-right-8 border-0 bg-transparent p-0 cursor-pointer select-none z-20"
            title="Click for next quote!"
            aria-label="Show next splash message"
          >
            <span className="minecraft-splash whitespace-nowrap block drop-shadow-[2px_2px_0px_#3f3f00]">
              {splashes[splashIndex]}
            </span>
          </button>
        </div>

        <div className="text-center text-white mc-text-shadow mb-6 px-3">
          <h1 tabIndex={-1} className="text-base sm:text-xl leading-relaxed">{PORTFOLIO_DATA.developer.name}</h1>
          <p className="reading-text text-sm sm:text-base text-gray-200 mt-1">{PORTFOLIO_DATA.developer.title} · Philippines</p>
        </div>

        {/* Buttons List Container */}
        <div className="main-menu-layout">
        <div className="menu-buttons-container w-full max-w-[340px] sm:max-w-[400px] px-2 sm:px-3">
          {/* Lead with professional work; the game remains an optional demo. */}
          <MCButton
            size="main"
            onClick={() => onNavigate('projects')}
          >
            My Projects
          </MCButton>

          <MCButton
            size="main"
            onClick={() => onNavigate('about')}
          >
            About Me
          </MCButton>

          <MCButton
            size="main"
            onClick={() => onNavigate('play')}
          >
            Play Minecraft
          </MCButton>

          {/* Bottom Dual Row */}
          <div className="flex items-center gap-2 mt-1 sm:mt-2 max-w-[340px] sm:max-w-[400px] w-full justify-between">
            <MCButton
              size="small"
              onClick={onOpenResume}
              className="flex-1"
            >
              Resume...
            </MCButton>

            <MCButton
              size="small"
              onClick={onOpenContact}
              className="flex-1"
            >
              Contact Me
            </MCButton>

            <button
              onClick={() => {
                mcAudio.playClick();
                cycleSplash();
              }}
              title="Change splash message"
              aria-label="Show next splash message"
              className="minecraft-button language-button flex-shrink-0"
            >
              <img src="/images/lang.png" alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
            </button>
          </div>
        </div>

        {showCharacter && (
          <div className="main-menu-character">
            <ScreenErrorBoundary onBack={() => onNavigate('about')} fallback={<p className="reading-text text-sm text-white text-center">Character preview unavailable.</p>}>
              <Suspense fallback={<p role="status" className="reading-text text-xs text-white text-center">Loading character…</p>}>
                <InteractiveMinecraftCharacter fill />
              </Suspense>
            </ScreenErrorBoundary>
            <p className="reading-text text-xs text-white text-center mc-text-shadow mt-2">Click or tap to jump!</p>
          </div>
        )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl flex justify-between items-center text-[10px] sm:text-xs text-gray-300 font-mono mc-text-shadow px-3 pb-1">
        <div>Portfolio 1.20.4</div>
        <div className="text-right text-gray-300">Built by Ralph</div>
      </div>
    </div>
  );
};

