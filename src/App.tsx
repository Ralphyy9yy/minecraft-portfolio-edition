import React, { useState } from 'react';
import { PanoramaBackground } from './components/PanoramaBackground';
import { MainMenu } from './components/MainMenu';
import { AboutScreen } from './components/AboutScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { CertificationsScreen } from './components/CertificationsScreen';
import { ResumeViewer } from './components/ResumeViewer';
import { ContactModal } from './components/ContactModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WorldGenScreen } from './components/WorldGenScreen';
import { MinecraftGame } from './components/MinecraftGame';
import { mcAudio } from './utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

type ScreenType = 'main' | 'about' | 'projects' | 'certifications' | 'play';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(mcAudio.getIsMuted());
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(true);

  const handleToggleMute = () => {
    const muted = mcAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'play') {
      setIsGeneratingWorld(true);
    }
    setCurrentScreen(screen);
  };

  return (
    <div className="App w-screen h-screen overflow-hidden relative select-none font-minecraft">
      {/* Global Mute / Audio Button */}
      {currentScreen !== 'play' && (
        <button
          onClick={handleToggleMute}
          title={isMuted ? "Audio is Muted (Click to Unmute)" : "Audio is Playing (Click to Mute)"}
          className="minecraft-button audio-toggle-button text-white fixed top-8 left-10 z-[9999]"
          style={{ zIndex: 9999 }}
          aria-label="Toggle Mute"
        >
          {isMuted ? (
            <VolumeX size={20} className="text-red-400" />
          ) : (
            <Volume2 size={20} className="text-green-400" />
          )}
        </button>
      )}

      {currentScreen !== 'play' && <PanoramaBackground />}

      {!hasStarted && (
        <WelcomeScreen onStart={() => setHasStarted(true)} />
      )}

      {currentScreen === 'main' && (
        <MainMenu
          onNavigate={handleNavigate}
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
        />
      )}

      {currentScreen === 'play' && (
        isGeneratingWorld ? (
          <WorldGenScreen onComplete={() => setIsGeneratingWorld(false)} />
        ) : (
          <MinecraftGame
            onQuit={() => {
              setIsGeneratingWorld(true);
              setCurrentScreen('main');
            }}
          />
        )
      )}

      {currentScreen === 'about' && (
        <AboutScreen
          onBack={() => setCurrentScreen('main')}
          onOpenResume={() => setIsResumeOpen(true)}
        />
      )}

      {currentScreen === 'projects' && (
        <ProjectsScreen onBack={() => setCurrentScreen('main')} />
      )}

      {currentScreen === 'certifications' && (
        <CertificationsScreen onBack={() => setCurrentScreen('main')} />
      )}

      <ResumeViewer
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
};

export default App;

