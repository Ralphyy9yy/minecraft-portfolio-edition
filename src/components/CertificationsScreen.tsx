import React from 'react';
import { PORTFOLIO_DATA, CertificationItem } from '../data/portfolioData';
import { mcAudio } from '../utils/audio';

interface CertificationsScreenProps {
  onBack: () => void;
}

export const CertificationsScreen: React.FC<CertificationsScreenProps> = ({ onBack }) => {
  const certs = PORTFOLIO_DATA.certifications;

  const handleCardClick = (cert: CertificationItem) => {
    mcAudio.playClick();
    if (cert.link) {
      window.open(cert.link, '_blank');
    }
  };

  return (
    <div className="relative z-10 flex flex-col h-screen max-h-screen p-3 sm:p-6 select-none overflow-hidden">
      {/* Header */}
      <div className="text-center mb-2 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mc-text-shadow tracking-wide">
          My Certifications
        </h1>
        <div className="realms-description text-xs text-gray-300 mc-text-shadow mt-1">
          <p>Here are my certifications and achievements</p>
          <p className="text-gray-400 mt-0.5">Select a certification to view or verify credentials!</p>
        </div>
      </div>

      {/* Realms Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto max-w-5xl w-full mx-auto my-2 px-1">
        <div className="realms-grid">
          {certs.map((cert) => (
            <div
              key={cert.id}
              onClick={() => handleCardClick(cert)}
              className="realm-card group"
            >
              {/* Image Banner */}
              <div
                className="realm-image"
                style={{ background: cert.bgGradient }}
              >
                <div className="realm-badge">
                  {cert.badge}
                </div>

                <div className="realm-thumbnail text-3xl">
                  🎓
                </div>
              </div>

              {/* Info Box */}
              <div className="realm-info">
                <div className="realm-name text-xs sm:text-sm">
                  {cert.name}
                </div>
                <div className="realm-gamemode text-[11px] text-gray-300 mt-1">
                  {cert.gameMode} • {cert.issuer} ({cert.year})
                </div>
                <div className="text-[10px] text-yellow-300 mt-1.5 flex items-center gap-1 group-hover:underline">
                  <span>Verify Credential</span>
                  <span>➔</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button - elevated above bottom edge */}
      <div className="flex justify-center flex-shrink-0 pt-2 pb-6 sm:pb-8">
        <button
          onClick={() => {
            mcAudio.playClick();
            onBack();
          }}
          className="minecraft-button realms-back-button"
          style={{ width: '180px', height: '42px', fontSize: '14px' }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

