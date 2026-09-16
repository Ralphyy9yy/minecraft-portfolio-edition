class MCAudioEngine {
  private clickSound: HTMLAudioElement | null = null;
  private bgMusic: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.clickSound = new Audio('/audio/minecraft_click.mp3');
        this.clickSound.preload = 'auto';

        this.bgMusic = new Audio('/audio/Minecraft.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.35;
        this.bgMusic.preload = 'auto';
      } catch (err) {
        console.warn('Audio initialization warning:', err);
      }
    }
  }

  public playClick(): void {
    if (this.isMuted) return;
    try {
      if (this.clickSound) {
        const sound = this.clickSound.cloneNode() as HTMLAudioElement;
        sound.volume = 0.6;
        sound.play().catch(() => {});
      }
    } catch {
      // Ignored
    }
  }

  public playPop(): void {
    this.playClick();
  }

  public startMusic(): void {
    if (this.isMuted || !this.bgMusic) return;
    try {
      this.bgMusic.muted = false;
      this.bgMusic.play().then(() => {
        this.isMusicPlaying = true;
      }).catch((err) => {
        console.warn('Music play delayed until user gesture:', err);
        this.isMusicPlaying = false;
      });
    } catch {
      this.isMusicPlaying = false;
    }
  }

  public toggleMusic(): boolean {
    if (!this.bgMusic) return false;
    if (this.isMusicPlaying) {
      this.bgMusic.pause();
      this.isMusicPlaying = false;
    } else {
      this.startMusic();
    }
    return this.isMusicPlaying;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    if (this.bgMusic) {
      this.bgMusic.muted = this.isMuted;
      if (this.isMuted) {
        this.bgMusic.pause();
        this.isMusicPlaying = false;
      } else {
        this.bgMusic.play().then(() => {
          this.isMusicPlaying = true;
        }).catch(() => {
          this.isMusicPlaying = false;
        });
      }
    }

    // Play a brief click if unmuting so user has immediate feedback
    if (!this.isMuted) {
      this.playClick();
    }

    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }
}

export const mcAudio = new MCAudioEngine();

