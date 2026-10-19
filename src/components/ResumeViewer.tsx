import React from 'react';
import { mcAudio } from '../utils/audio';

interface ResumeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESUME_URL = '/Ralph_Giann_Suquib_CV.pdf';

export const ResumeViewer: React.FC<ResumeViewerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpen = () => {
    mcAudio.playClick();
    window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-5xl h-[92vh] flex flex-col bg-[#141414] border-4 border-[#3a3a3a] shadow-2xl">
        <div className="flex justify-between items-center p-4 bg-[#262626] border-b-2 border-black">
          <h2 className="text-xl sm:text-2xl font-bold text-white mc-text-shadow">
            Ralph Giann Suquib — Resume
          </h2>
          <button
            onClick={() => {
              mcAudio.playClick();
              onClose();
            }}
            className="minecraft-button"
            style={{ width: '90px', height: '36px', fontSize: '12px' }}
          >
            Back
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-black/70 border-b border-gray-700 text-xs">
          <a
            href={RESUME_URL}
            download="Ralph_Giann_Suquib_CV.pdf"
            onClick={() => mcAudio.playClick()}
            className="minecraft-button px-3 py-1 inline-flex items-center justify-center"
            style={{ height: '32px', fontSize: '11px' }}
          >
            Download PDF
          </a>
          <button
            onClick={handleOpen}
            className="minecraft-button px-3 py-1"
            style={{ height: '32px', fontSize: '11px' }}
          >
            Open in New Tab
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-[#525659]">
          <object
            data={`${RESUME_URL}#view=FitH`}
            type="application/pdf"
            className="w-full h-full"
            aria-label="Ralph Giann Suquib CV"
          >
            <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
              <p>Your browser cannot display the PDF preview.</p>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className="minecraft-button px-4 py-2"
              >
                Open Resume PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};
