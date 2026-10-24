import React from 'react';
import { mcAudio } from '../utils/audio';
import { useDialog } from '../hooks/useDialog';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const dialogRef = useDialog(true, onStart);

  const handleStart = () => {
    mcAudio.playClick();
    mcAudio.startMusic();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-describedby="welcome-description" tabIndex={-1} className="mc-window modal-content w-full max-w-md p-6 text-center text-black shadow-2xl relative">
        <div className="flex justify-between items-center border-b-2 border-gray-400 pb-2 mb-4">
          <span className="text-base font-bold text-gray-900">Welcome!</span>
          <button
            onClick={handleStart}
            aria-label="Close welcome and explore portfolio"
            className="text-gray-700 hover:text-black font-bold text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <h2 id="welcome-title" className="text-base font-bold text-gray-800 mb-2">
          Ralph Craft — Interactive Portfolio
        </h2>

        <p id="welcome-description" className="reading-text text-sm text-gray-800 leading-relaxed mb-6">
          Explore my projects and resume in a Minecraft-inspired world. Start with My Projects, or try the playable demo. Audio can be muted at any time.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="minecraft-button w-full max-w-[300px] h-11 text-xs sm:text-sm"
          >
            Start Exploring!
          </button>
        </div>
      </div>
    </div>
  );
};

