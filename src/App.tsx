import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PanoramaBackground } from './components/PanoramaBackground';
import { MainMenu } from './components/MainMenu';
import { ResumeViewer } from './components/ResumeViewer';
import { ContactModal } from './components/ContactModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WorldGenScreen } from './components/WorldGenScreen';
import { ScreenErrorBoundary } from './components/ScreenErrorBoundary';
import { mcAudio } from './utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

const AboutScreen = lazy(() => import('./components/AboutScreen').then((module) => ({ default: module.AboutScreen })));
const ProjectsScreen = lazy(() => import('./components/ProjectsScreen').then((module) => ({ default: module.ProjectsScreen })));
const MinecraftGame = lazy(() => import('./components/MinecraftGame').then((module) => ({ default: module.MinecraftGame })));

type ScreenType = 'main' | 'about' | 'projects' | 'play';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(mcAudio.getIsMuted());
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(true);
  const mainRef = useRef<HTMLElement>(null);
  const isDialogOpen = !hasStarted || isResumeOpen || isContactOpen;
  const goHome = useCallback(() => setCurrentScreen('main'), []);
  const finishWorldGeneration = useCallback(() => setIsGeneratingWorld(false), []);

  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.inert = isDialogOpen;
  }, [isDialogOpen]);

  useEffect(() => {
    if (hasStarted && currentScreen !== 'play') mainRef.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [currentScreen, hasStarted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !isDialogOpen && currentScreen !== 'play') goHome();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentScreen, isDialogOpen, goHome]);

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
      <main ref={mainRef} aria-hidden={isDialogOpen ? true : undefined} className="h-full">
        {currentScreen !== 'play' && (
          <>
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
              className="minecraft-button audio-toggle-button text-white fixed top-3 left-3 sm:top-5 sm:left-5 z-[9999]"
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              aria-pressed={isMuted}
            >
              {isMuted ? <VolumeX size={20} className="text-red-400" /> : <Volume2 size={20} className="text-green-400" />}
            </button>
            <PanoramaBackground />
          </>
        )}

        <ScreenErrorBoundary key={currentScreen} onBack={goHome}>
          <Suspense fallback={
            <div className="screen-fallback" role="status">
              <p>Loading {currentScreen === 'play' ? 'world' : currentScreen}…</p>
            </div>
          }>
            {currentScreen === 'main' && (
              <MainMenu
                showCharacter={hasStarted}
                onNavigate={handleNavigate}
                onOpenResume={() => setIsResumeOpen(true)}
                onOpenContact={() => setIsContactOpen(true)}
              />
            )}
            {currentScreen === 'play' && (
              isGeneratingWorld ? (
                <WorldGenScreen onComplete={finishWorldGeneration} />
              ) : (
                <MinecraftGame onQuit={() => { setIsGeneratingWorld(true); goHome(); }} />
              )
            )}
            {currentScreen === 'about' && (
              <AboutScreen onBack={goHome} onOpenResume={() => setIsResumeOpen(true)} />
            )}
            {currentScreen === 'projects' && <ProjectsScreen onBack={goHome} />}
          </Suspense>
        </ScreenErrorBoundary>
      </main>

      {!hasStarted && <WelcomeScreen onStart={() => setHasStarted(true)} />}

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

