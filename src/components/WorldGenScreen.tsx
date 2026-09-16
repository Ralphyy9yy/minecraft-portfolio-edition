import React, { useEffect, useState } from 'react';

interface WorldGenScreenProps {
  onComplete: () => void;
}

export const WorldGenScreen: React.FC<WorldGenScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animFrame: number;
    const start = Date.now();
    const duration = 2000; // 2 seconds

    const update = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        animFrame = requestAnimationFrame(update);
      } else {
        setTimeout(onComplete, 300);
      }
    };

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none bg-[#241811]">
      {/* Dirt pattern background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundColor: '#3b281d',
          backgroundImage: `
            linear-gradient(45deg, #2b1d15 25%, transparent 25%), 
            linear-gradient(-45deg, #2b1d15 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #2b1d15 75%), 
            linear-gradient(-45deg, transparent 75%, #2b1d15 75%)
          `,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 0 16px, 16px -16px, -16px 0px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* Percentage */}
        <div className="text-white text-3xl font-minecraft drop-shadow-[2px_2px_0px_#000]">
          {progress}%
        </div>

        {/* Progress Box */}
        <div
          className="w-56 h-8 bg-[#555] p-1 border-2 border-black"
          style={{
            boxShadow: 'inset -2px -2px 0px #333, inset 2px 2px 0px #888'
          }}
        >
          <div
            className="h-full bg-[#00aa00] transition-all duration-75 border-r border-[#006600]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <div className="mt-4">
          <div className="text-white text-xl font-bold mc-text-shadow">
            Generating World...
          </div>
          <div className="text-gray-400 text-sm mc-text-shadow mt-1">
            Building Terrain
          </div>
        </div>
      </div>
    </div>
  );
};

