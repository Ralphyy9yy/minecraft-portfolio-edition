import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { mcAudio } from '../utils/audio';

interface ResumeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeViewer: React.FC<ResumeViewerProps> = ({ isOpen, onClose }) => {
  const resume = PORTFOLIO_DATA.resume;

  if (!isOpen) return null;

  const handlePrint = () => {
    mcAudio.playClick();
    window.print();
  };

  const handleShare = () => {
    mcAudio.playClick();
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#141414] border-4 border-[#3a3a3a] shadow-2xl">
        {/* Sub-menu Header */}
        <div className="flex justify-between items-center p-4 bg-[#262626] border-b-2 border-black">
          <h2 className="text-xl sm:text-2xl font-bold text-white mc-text-shadow">
            Resume Viewer
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

        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center px-4 py-2 bg-black/70 border-b border-gray-700 text-xs gap-2">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="minecraft-button px-3 py-1"
              style={{ height: '32px', fontSize: '11px' }}
            >
              Download PDF / Print
            </button>
            <button
              onClick={handleShare}
              className="minecraft-button px-3 py-1"
              style={{ height: '32px', fontSize: '11px' }}
            >
              Share Link
            </button>
          </div>
          <div className="text-gray-400 font-mono text-[11px]">
            Last Updated: {resume.lastUpdated}
          </div>
        </div>

        {/* Paper Document Content */}
        <div className="flex-1 bg-white text-black p-6 sm:p-10 overflow-y-auto font-sans leading-relaxed text-xs sm:text-sm">
          {/* Header */}
          <div className="text-center pb-6 border-b border-gray-300 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1">
              {resume.name}
            </h1>
            <h2 className="text-base sm:text-lg text-gray-700 font-semibold mb-2">
              {resume.title}
            </h2>
            <p className="text-xs text-gray-600 font-mono">
              {resume.contact}
            </p>
          </div>

          {/* Professional Summary */}
          <section className="mb-6">
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase border-b-2 border-gray-800 pb-1 mb-2">
              Professional Summary
            </h3>
            <p className="text-gray-700 leading-normal">
              {resume.summary}
            </p>
          </section>

          {/* Technical Skills */}
          <section className="mb-6">
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase border-b-2 border-gray-800 pb-1 mb-2">
              Technical Skills
            </h3>
            <div className="space-y-1.5 text-gray-700 text-xs sm:text-sm">
              <p><strong className="text-gray-900">Frontend:</strong> {resume.skills.frontend}</p>
              <p><strong className="text-gray-900">Backend:</strong> {resume.skills.backend}</p>
              <p><strong className="text-gray-900">Database:</strong> {resume.skills.database}</p>
              <p><strong className="text-gray-900">Tools & DevOps:</strong> {resume.skills.tools}</p>
            </div>
          </section>

          {/* Experience */}
          <section className="mb-6">
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase border-b-2 border-gray-800 pb-1 mb-3">
              Professional Experience
            </h3>
            <div className="space-y-4">
              {resume.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                    <span className="font-bold text-gray-900">{exp.role}</span>
                    <span className="text-xs text-gray-600 font-mono">{exp.period}</span>
                  </div>
                  <div className="text-xs text-gray-700 italic mb-1.5">
                    {exp.company} | {exp.location}
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="mb-4">
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase border-b-2 border-gray-800 pb-1 mb-2">
              Education
            </h3>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div>
                <span className="font-bold text-gray-900 block">{resume.education.degree}</span>
                <span className="text-gray-700">{resume.education.institution}</span>
              </div>
              <span className="text-xs text-gray-600 font-mono mt-1 sm:mt-0">
                {resume.education.period}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

