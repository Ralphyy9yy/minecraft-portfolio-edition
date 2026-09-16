import React, { useState } from 'react';
import { mcAudio } from '../utils/audio';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const handleStart = () => {
    mcAudio.playClick();
    mcAudio.toggleMusic();
    mcAudio.startMusic();
    setIsOpen(false);
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-fadeIn">
      <div className="mc-window w-full max-w-md p-6 text-center text-black shadow-2xl relative">
        <div className="flex justify-between items-center border-b-2 border-gray-400 pb-2 mb-4">
          <span className="text-base font-bold text-gray-900">Welcome!</span>
          <button
            onClick={handleStart}
            className="text-gray-700 hover:text-black font-bold text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <h3 className="text-base font-bold text-gray-800 mb-2">
          Ralph Craft — Interactive Portfolio
        </h3>

        <p className="text-xs text-gray-700 leading-relaxed mb-6">
          Explore my projects, career journey, and certifications built with a Minecraft Java-themed interface and audio.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="minecraft-button"
            style={{ width: '300px', height: '44px', fontSize: '14px' }}
          >
            Start Exploring!
          </button>
        </div>
      </div>
    </div>
  );
};

