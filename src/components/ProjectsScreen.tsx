import React, { useState } from 'react';
import { PORTFOLIO_DATA, ProjectServer } from '../data/portfolioData';
import { mcAudio } from '../utils/audio';

interface ProjectsScreenProps {
  onBack: () => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({ onBack }) => {
  const projects = PORTFOLIO_DATA.projects;
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id || '');
  const [isScanning, setIsScanning] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedId) || projects[0];

  const handleSelect = (project: ProjectServer) => {
    setSelectedId(project.id);
    mcAudio.playClick();
  };

  const handleJoin = (project?: ProjectServer) => {
    const target = project || selectedProject;
    if (!target) return;
    mcAudio.playClick();
    window.open(target.link, '_blank');
  };

  const handleDirectConnect = () => {
    if (!selectedProject) return;
    mcAudio.playClick();
    if (selectedProject.github) {
      window.open(selectedProject.github, '_blank');
    } else {
      window.open(selectedProject.link, '_blank');
    }
  };

  const handleRefresh = () => {
    mcAudio.playClick();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  const handleDelete = () => {
    mcAudio.playClick();
    setShowDeleteAlert(true);
  };

  return (
    <div className="relative z-10 flex flex-col h-screen max-h-screen p-2 sm:p-3 select-none overflow-hidden">
      {/* Top Header */}
      <div className="text-center pt-1 mb-1 flex-shrink-0">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mc-text-shadow tracking-wide">
          My Projects
        </h2>
        <div className="text-center text-[11px] text-gray-300 mc-text-shadow font-mono mt-0.5">
          <span>Scanned projects: </span>
          <span className="text-gray-400">
            {isScanning ? 'Scanning network...' : `${projects.length} / ${projects.length}`}
          </span>
        </div>
      </div>

      {/* Middle Server List Container - constrained height so buttons always visible */}
      <div className="max-w-4xl w-full mx-auto flex-shrink-0 my-1">
        <div className="server-list overflow-y-auto" style={{ maxHeight: '52vh' }}>
          {projects.map((proj) => {
            const isSelected = proj.id === selectedId;
            return (
              <div
                key={proj.id}
                onClick={() => handleSelect(proj)}
                onDoubleClick={() => handleJoin(proj)}
                className={`server-item ${isSelected ? 'selected' : ''}`}
              >
                {/* Thumbnail */}
                <div className="server-thumbnail text-2xl">
                  {proj.icon}
                </div>

                {/* Info */}
                <div className="server-info">
                  <div className="server-name text-white font-bold text-sm mc-text-shadow">
                    {proj.name}
                  </div>
                  <div className="server-description text-gray-300 text-xs mt-0.5">
                    {proj.description}
                  </div>
                  <div className="text-[10px] text-green-400 font-mono mt-1">
                    {proj.tech} • {proj.version}
                  </div>
                </div>

                {/* Status & Ping */}
                <div className="server-status flex flex-col items-end flex-shrink-0">
                  <span className="text-[10px] text-gray-300 font-mono mb-1">
                    {proj.players}
                  </span>
                  <div className="ping-bars" title="5 bars (Optimal)">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`ping-bar ${bar <= proj.ping ? 'active' : ''}`}
                        style={{ height: `${bar * 2.8}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Multiplayer Buttons - always visible */}
      <div className="flex flex-col gap-3 flex-shrink-0 max-w-4xl w-full mx-auto pt-2 pb-5">
        {/* Row 1: 3 Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-3xl mx-auto w-full px-2">
          <button
            onClick={() => handleJoin()}
            className="minecraft-button w-full h-11 sm:h-12 text-xs sm:text-sm"
          >
            Join Server
          </button>

          <button
            onClick={handleDirectConnect}
            className="minecraft-button w-full h-11 sm:h-12 text-xs sm:text-sm"
          >
            Direct Connection
          </button>

          <button
            onClick={() => {
              mcAudio.playClick();
              handleJoin();
            }}
            className="minecraft-button w-full h-11 sm:h-12 text-xs sm:text-sm"
          >
            Add Server
          </button>
        </div>

        {/* Row 2: 4 Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto w-full px-2">
          <button
            onClick={() => {
              mcAudio.playClick();
              handleDirectConnect();
            }}
            className="minecraft-button w-full h-11 sm:h-12 text-xs sm:text-sm"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="minecraft-button w-full h-11 sm:h-12 text-xs sm:text-sm"
          >
            Delete
          </button>

          <button
            onClick={handleRefresh}
            className="minecraft-button w-full h-11 sm:h-12 text-xs sm:text-sm"
          >
            Refresh
          </button>

          <button
            onClick={() => {
              mcAudio.playClick();
              onBack();
            }}
            className="minecraft-button w-full h-11 sm:h-12 text-xs sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Delete Alert Modal */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="mc-window p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-base font-bold mb-2 text-black">Cannot Delete!</h3>
            <p className="text-xs text-gray-800 mb-4 leading-relaxed">
              Are you crazy? You cannot delete a production server! Ralph is maintaining this.
            </p>
            <button
              onClick={() => {
                mcAudio.playClick();
                setShowDeleteAlert(false);
              }}
              className="minecraft-button"
              style={{ width: '120px', height: '38px', fontSize: '12px' }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

